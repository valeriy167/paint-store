from django.db import models

class Product(models.Model):
    name = models.CharField("Название", max_length=200)
    description = models.TextField("Описание")
    price = models.DecimalField("Цена", max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField("Остаток на складе", default=0)
    image_url = models.URLField("Ссылка на изображение", blank=True)
    category = models.CharField("Категория", max_length=100, blank=True)  # например: "Эмаль", "Грунт", "Лак"
    created_at = models.DateTimeField("Дата добавления", auto_now_add=True, null=True)

    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} — {self.price:.2f} ₽"