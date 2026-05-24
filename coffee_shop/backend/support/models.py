from django.db import models
from django.conf import settings

class SupportMessage(models.Model):
    """Модель для обратной связи и техподдержки."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="support_messages",
        verbose_name="Пользователь"
    )
    subject = models.CharField("Тема", max_length=255)
    message = models.TextField("Сообщение")
    file = models.FileField("Вложение", upload_to="support_files/", blank=True, null=True)
    is_resolved = models.BooleanField("Решено", default=False)
    created_at = models.DateTimeField("Создано", auto_now_add=True)

    class Meta:
        verbose_name = "Сообщение в поддержку"
        verbose_name_plural = "Сообщения в поддержку"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.subject} от {self.user.email}"
