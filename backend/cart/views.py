from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from products.models import Product
from .serializers import CartSerializer, CartItemSerializer
from django.core.mail import send_mail
from django.conf import settings
from contacts.models import ContactInfo
from django.utils import timezone
from telegram import Bot
from telegram.error import TelegramError
import asyncio

class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """GET /api/cart/ — получить корзину пользователя"""
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """POST /api/cart/add_item/ — добавить товар в корзину"""
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        if not product_id:
            return Response({'error': 'product_id обязателен'}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, id=product_id)

        # Получаем или создаём элемент
        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            item.quantity += quantity
            item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'])
    def update_item(self, request, pk=None):
        """PATCH /api/cart/items/{id}/ — изменить количество"""
        item = get_object_or_404(CartItem, id=pk, cart__user=request.user)
        quantity = request.data.get('quantity')
        if quantity is not None:
            item.quantity = max(1, int(quantity))  # минимум 1
            item.save()
        return Response(CartSerializer(item.cart).data)

    @action(detail=True, methods=['delete'])
    def remove_item(self, request, pk=None):
        """DELETE /api/cart/items/{id}/ — удалить элемент"""
        item = get_object_or_404(CartItem, id=pk, cart__user=request.user)
        cart = item.cart
        item.delete()
        return Response(CartSerializer(cart).data)

    # --- ИЗМЕНЕНО: Добавлен async ---
    @action(detail=False, methods=['post'])
    def checkout(self, request):
        """
        POST /api/cart/checkout/
        Требует: контактные данные + подтверждение
        Отправляет: уведомление админу в Telegram и/или Email
        """
        # --- ИЗМЕНЕНО: Создаём асинхронную внутреннюю функцию для отправки ---
        async def send_telegram_message(bot_token, chat_id, text):
            bot = Bot(token=bot_token)
            try:
                await bot.send_message(chat_id=chat_id, text=text)
                return True, None
            except TelegramError as e:
                return False, str(e)
            except Exception as e:
                return False, str(e)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        if not cart.items.exists():
            return Response({'error': 'Корзина пуста'}, status=400)

        # Получаем данные
        email = request.data.get('email') or request.user.email
        name = request.data.get('name') or f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username
        phone = request.data.get('phone') or getattr(request.user.profile, 'phone', '')

        # Формируем содержимое сообщения (для Telegram и Email)
        items = []
        total = 0
        for item in cart.items.all():
            price = item.product.price * item.quantity
            total += price
            items.append(f"- {item.product.name} ×{item.quantity} — {price} ₽")

        message_text = f"""
Заказ от {name}

Контакты:
- Email: {email}
- Телефон: {phone or 'не указан'}

Товары:
{'\n'.join(items)}

Итого: {total} ₽

Дата: {timezone.now().strftime('%d.%m.%Y %H:%M')}
        """.strip()

        # Попытаемся отправить в Telegram
        telegram_success = False
        telegram_error = None
        if hasattr(settings, 'TELEGRAM_BOT_TOKEN') and hasattr(settings, 'TELEGRAM_CHAT_ID'):
            chat_id = settings.TELEGRAM_CHAT_ID

            if chat_id:
                # Вызываем асинхронную функцию внутри asyncio.run()
                # Это создаст новый event loop для этого вызова
                # ВАЖНО: asyncio.run() завершает loop после выполнения.
                # Это может быть неэффективно, если checkout вызывается часто.
                # Для продакшена лучше использовать один общий event loop (например, через celery или daphne).
                # Но для MVP подходит.
                try:
                    telegram_success, telegram_error = asyncio.run(send_telegram_message(settings.TELEGRAM_BOT_TOKEN, chat_id, message_text))
                    if telegram_success:
                        print("Сообщение в Telegram отправлено успешно") # Лог для отладки
                    else:
                        print(f"Ошибка отправки в Telegram: {telegram_error}") # Лог для отладки
                except Exception as e:
                    telegram_error = f"Ошибка выполнения асинхронной функции: {str(e)}"
                    print(telegram_error) # Лог для отладки
            else:
                telegram_error = "Telegram Chat ID не указан в настройках"
                print(telegram_error) # Лог для отладки
        else:
            telegram_error = "Токен или Chat ID Telegram не настроен в settings"
            print(telegram_error) # Лог для отладки

        # Попытаемся отправить на Email
        email_success = False
        email_error = None
        try:
            # Получаем email из контактов
            contact = ContactInfo.load()
            admin_email = contact.email or settings.DEFAULT_FROM_EMAIL  # fallback

            send_mail(
                subject=f'Новый заказ от {name}',
                message=message_text, # Используем то же сообщение
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin_email],
                fail_silently=False, # Лучше обрабатывать исключение
            )
            email_success = True
            print("Email отправлен успешно") # Лог для отладки
        except Exception as e:
            email_error = str(e)
            print(f"Ошибка отправки Email: {email_error}") # Лог для отладки

        # Очищаем корзину (после попыток отправки)
        cart.items.all().delete()

        # Сформируем ответ пользователю
        response_message = "Заказ успешно оформлен!"
        if not telegram_success:
            response_message += f" (Уведомление в Telegram не отправлено: {telegram_error or 'не настроено'})."
        if not email_success:
            response_message += f" (Уведомление на Email не отправлено: {email_error or 'не настроено'})."

        # Возвращаем 200 OK, так как заказ принят и обработан (очищен)
        return Response({"message": response_message}, status=status.HTTP_200_OK)
