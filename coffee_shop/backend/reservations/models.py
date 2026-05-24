from django.db import models
from django.conf import settings

class Reservation(models.Model):
    """Модель для бронирования столиков."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="reservations",
        verbose_name="Пользователь"
    )
    date = models.DateField("Дата")
    time = models.TimeField("Время")
    number_of_people = models.PositiveIntegerField("Кол-во человек", default=2)
    comment = models.TextField("Комментарий", blank=True)
    status = models.CharField(
        "Статус", 
        max_length=20, 
        choices=[
            ("pending", "Ожидает"),
            ("confirmed", "Подтверждено"),
            ("cancelled", "Отменено"),
        ],
        default="pending"
    )
    created_at = models.DateTimeField("Создано", auto_now_add=True)

    class Meta:
        verbose_name = "Бронирование"
        verbose_name_plural = "Бронирования"
        ordering = ["-date", "-time"]

    def __str__(self):
        return f"Бронь #{self.id} на {self.date} {self.time}"
