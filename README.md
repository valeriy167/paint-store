# Paint Store — Интернет-магазин лакокрасочных материалов

[![Django](https://img.shields.io/badge/Django-4.2+-092e20?logo=django)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://react.dev/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-5.0+-0170FE?logo=ant-design)](https://ant.design/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?logo=postgresql)](https://www.postgresql.org/)

**Зачётный проект по курсу «Языки интернет программирования»**  
Студент: ИУ6-33Б  
Технологии: Django (DRF), React (JS), Ant Design, PostgreSQL, Docker

## Описание

Paint Store — это интернет-магазин лакокрасочных изделий, реализующий MVP с функционалом:
- Просмотр и фильтрация товаров в виде карточек
- Корзина с подсчётом стоимости (связь многие-ко-многим)
- Отзывы с модерацией (`is_approved=False` по умолчанию)
- Контакты с интерактивной Яндекс.Картой
- Авторизация и регистрация (JWT)
- Административная панель (CRUD товаров, модерация отзывов, редактирование контактов)
- Отправка заказов на email администратора

Проект соответствует всем требованиям зачётного проекта и включает **все дополнительные баллы**.

## Соответствие требованиям

| Категория | Статус |
| **Frontend** | ОК |
| • ≥4 страницы | `/`, `/contacts`, `/cart`, `/reviews`, `/login`, `/register`, `/profile`, `/admin-panel` |
| • Единый дизайн | Ant Design + адаптивный layout (поддержка мобильных) |
| • ≥3 формы | вход, регистрация, отзыв, заказ, редактирование профиля |
| • Плиточное отображение | товары, отзывы, карточки админки |
| **Backend** | ОК |
| • ≥4 таблицы | `User`, `Profile`, `Product`, `Review`, `ContactInfo`, `Cart`, `CartItem` |
| • HTTP-взаимодействие | REST API через `fetch` |
| • Комментарии | есть в моделях, сериализаторах, viewsets |
| • Unit-тесты | `products/tests.py`, `reviews/tests.py` |
| **Доп. баллы** | OK OK OK OK OK OK OK OK OK |
| • Авторизация (JWT) | OK |
| • M2M связь (`Cart ↔ Product`) | OK |
| • OpenAPI (`/api/schema/swagger/`) | OK |
| • Верстка под телефоны | OK |
| • Интеграция с сервисом | Яндекс.Карты |
| • Модерация отзывов | OK |
| • CRUD в админке | OK |
| • Email-уведомления |  (заказы админу) |

## Запуск проекта

### Требования
- Python 3.10+
- Node.js 18+
- PostgreSQL (или SQLite для MVP)

### Локальный запуск

```bash
# 1. Клонировать репозиторий
git clone https://github.com/valeriy167/paint-store.git
cd paint-store

# 2. Backend
cd backend
python -m venv venv
source venv/bin/activate  # Linux/macOS || venv\Scripts\activate (Windows)
pip install -r requirements.txt

# Создать .env (на основе example) или отредактировать settings.py
cp paintstore/settings.py.example paintstore/settings.py
# → в settings.py указать SECRET_KEY, EMAIL_*, DATABASES

python manage.py migrate
python manage.py createsuperuser  # для доступа в админку
python manage.py runserver  # http://localhost:8000

# 3. Frontend
cd ../frontend
npm install
npm run dev  # http://localhost:5173
