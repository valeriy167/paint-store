from django.db import models

class ContactInfo(models.Model):
    address = models.CharField("Адрес", max_length=255)
    latitude = models.DecimalField("Широта", max_digits=9, decimal_places=6)
    longitude = models.DecimalField("Долгота", max_digits=9, decimal_places=6)
    phone = models.CharField("Телефон", max_length=20)
    email = models.EmailField("Email")
    whatsapp = models.CharField("WhatsApp", max_length=20, blank=True)
    telegram = models.CharField("Telegram", max_length=50, blank=True)
    working_hours = models.TextField("Часы работы", blank=True)
    bg_image_url = models.URLField("Фон", blank=True)
    bg_blur = models.PositiveSmallIntegerField("Размытие", default=4)
    bg_opacity = models.FloatField("Прозрачность", default=0.2)
    
    class Meta:
        verbose_name = "Контактная информация"
        verbose_name_plural = "Контактная информация"

    def __str__(self):
        return f"Контакты: {self.address}"

    def save(self, *args, **kwargs):
        # Гарантируем, что в БД только одна запись
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj