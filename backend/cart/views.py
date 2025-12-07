from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from products.models import Product
from .serializers import CartSerializer, CartItemSerializer

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