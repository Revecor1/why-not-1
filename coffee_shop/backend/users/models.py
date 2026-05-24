from django.contrib.auth.models import AbstractUser, Group
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
class User(AbstractUser):
    """Пользователь с авторизацией по email."""

    email = models.EmailField('Email', unique=True, db_index=True)
    phone = models.CharField('Телефон', max_length=20, blank=True, default='')
    avatar = models.ImageField('Аватар', upload_to='avatars/', blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return self.email


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Глава 2.3: Автоматическое добавление нового пользователя в группу Customers."""
    if created:
        group, _ = Group.objects.get_or_create(name='Customers')
        instance.groups.add(group)
