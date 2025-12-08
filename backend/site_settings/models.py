from django.db import models

class BackgroundImage(models.Model):
    image = models.ImageField(upload_to='backgrounds/')
    #поле, чтобы отмечать, активно ли это изображение
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    blur_amount = models.FloatField(default=0.0, help_text="Степень размытия в пикселях (например, 0.0 - 20.0)")
    scale_factor = models.FloatField(default=1.0, help_text="Множитель масштаба (например, 0.5 - 2.0)")

    def __str__(self):
        return f"Background Image ({'Active' if self.is_active else 'Inactive'})"

    class Meta:
        verbose_name = "Фоновое изображение"
        verbose_name_plural = "Фоновые изображения"

    @classmethod
    def get_active_image(cls):
        """Возвращает активное фоновое изображение."""
        return cls.objects.filter(is_active=True).first()