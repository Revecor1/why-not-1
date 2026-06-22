from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

class MenuItem(models.Model):
    category = models.ForeignKey(Category, related_name='items', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.IntegerField()
    image = models.URLField()

    def __str__(self):
        return self.name

class Order(models.Model):
    ORDER_TYPES = (
        ('here', 'В заведении'),
        ('togo', 'С собой'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    date = models.DateTimeField(auto_now_add=True)
    total = models.IntegerField()
    order_type = models.CharField(max_length=10, choices=ORDER_TYPES)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

class Reservation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reservations')
    date = models.DateField()
    time = models.TimeField()
    guests = models.PositiveIntegerField()
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    comment = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Reservation by {self.name} on {self.date}"

class ChatMessage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chats')
    sender = models.CharField(max_length=10) # 'user' or 'admin'
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']


class News(models.Model):
    BADGE_STYLES = (
        ('terracotta', 'Оранжевый'),
        ('dark', 'Тёмный'),
        ('green', 'Зелёный'),
    )

    title = models.CharField(max_length=200)
    period = models.CharField(max_length=100, help_text='Например: Каждую пятницу')
    body = models.TextField()
    image = models.URLField()
    badge = models.CharField(max_length=50, default='Акция')
    badge_style = models.CharField(max_length=20, choices=BADGE_STYLES, default='terracotta')
    tags = models.JSONField(default=list, blank=True)
    footer_note = models.CharField(max_length=200, blank=True)
    link_url = models.CharField(max_length=200, blank=True)
    link_text = models.CharField(max_length=100, blank=True)
    is_published = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-sort_order', '-created_at']
        verbose_name = 'Новость'
        verbose_name_plural = 'Новости'

    def __str__(self):
        return self.title
