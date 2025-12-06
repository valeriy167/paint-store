from django.db import models
from django.contrib.auth.models import User
from products.models import Product

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Автор")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="Товар", related_name="reviews")
    text = models.TextField("Текст отзыва")
    rating = models.PositiveSmallIntegerField("Оценка", choices=[(i, str(i)) for i in range(1, 6)], default=5)
    created_at = models.DateTimeField("Дата создания", auto_now_add=True)
    is_approved = models.BooleanField("Одобрен", default=False)
    moderated_at = models.DateTimeField("Дата модерации", null=True, blank=True)
    moderator = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="moderated_reviews",
        verbose_name="Модератор"
    )

    class Meta:
        verbose_name = "Отзыв"
        verbose_name_plural = "Отзывы"
        ordering = ['-created_at']

    def __str__(self):
        status = "OK" if self.is_approved else "WAIT"
        return f"{status} {self.user.username} — {self.product.name} ({self.rating}★)"