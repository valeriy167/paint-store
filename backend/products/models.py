from django.db import models
from django.contrib.auth.models import User

class Manufacturer(models.Model):
    name = models.CharField("Название", max_length=200, unique=True)
    description = models.TextField("Описание", blank=True, null=True)
    logo = models.ImageField("Логотип", upload_to='manufacturer_logos/', blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Производитель"
        verbose_name_plural = "Производители"
        ordering = ['name']

class Product(models.Model):
    name = models.CharField("Название", max_length=200)
    description = models.TextField("Описание")
    price = models.DecimalField("Цена", max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField("Остаток на складе", default=0)
    # image_url = models.URLField("Ссылка на изображение", blank=True)
    category = models.CharField("Категория", max_length=100, blank=True)  # например: "Эмаль", "Грунт", "Лак"
    created_at = models.DateTimeField("Дата добавления", auto_now_add=True, null=True)

    manufacturer = models.ForeignKey(
        Manufacturer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Производитель",
        related_name='products'
    )

    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} — {self.price:.2f} ₽"
    
class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE) # Связь с Product
    image = models.ImageField(upload_to='product_images/') # Поле для изображения
    created_at = models.DateTimeField(auto_now_add=True) # Дата создания

    def __str__(self):
        return f"Изображение для {self.product.name} - {self.image.name}"

    class Meta:
        verbose_name = "Изображение товара"
        verbose_name_plural = "Изображения товаров"
        ordering = ['created_at'] # Сортировка по дате добавления