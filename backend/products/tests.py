from django.test import TestCase
from django.contrib.auth.models import User
from .models import Product
from reviews.models import Review

class ProductModelTest(TestCase):
    def setUp(self):
        self.product = Product.objects.create(
            name="Эмаль ПФ-115",
            description="Белая эмаль для наружных работ",
            price=450.00,
            stock=100,
            category="Эмаль"
        )

    def test_product_str(self):
        self.assertEqual(str(self.product), "Эмаль ПФ-115 — 450.00 ₽")

    def test_product_fields(self):
        self.assertEqual(self.product.name, "Эмаль ПФ-115")
        self.assertEqual(self.product.price, 450.00)
        self.assertEqual(self.product.stock, 100)

class ReviewModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="123")
        self.product = Product.objects.create(
            name="Грунт ГФ-021", price=300.00, stock=50
        )
        self.review = Review.objects.create(
            user=self.user,
            product=self.product,
            text="Отличный грунт, быстро сохнет",
            rating=5
        )

    def test_review_default_not_approved(self):
        self.assertFalse(self.review.is_approved)

    def test_review_str_pending(self):
        self.assertIn("WAIT", str(self.review))

    def test_review_str_approved(self):
        self.review.is_approved = True
        self.review.save()
        self.assertIn("OK", str(self.review))