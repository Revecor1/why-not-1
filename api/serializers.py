import re
from datetime import datetime, time as dt_time

from django.utils import timezone
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, MenuItem, Order, OrderItem, Reservation, ChatMessage, News

MAX_RESERVATION_GUESTS = 6
RESERVATION_OPEN = dt_time(7, 0)
RESERVATION_CLOSE = dt_time(22, 0)
PHONE_PATTERN = re.compile(r'^(?:\+7|8)(\d{10})$')
MAX_CHAT_TEXT_LENGTH = 2000


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_staff')


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)

    class Meta:
        model = MenuItem
        fields = ('id', 'name', 'description', 'price', 'image', 'category_name', 'category_slug')


class OrderItemSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='menu_item.name', read_only=True)
    price = serializers.IntegerField(source='menu_item.price', read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'name', 'price', 'quantity')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'user_email', 'date', 'total', 'order_type', 'is_completed', 'items')
        read_only_fields = ('id', 'user_email', 'date', 'total', 'is_completed', 'items')


class ReservationSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Reservation
        fields = ('id', 'user', 'user_email', 'date', 'time', 'guests', 'name', 'phone', 'comment')
        read_only_fields = ('id', 'user', 'user_email')

    def validate_guests(self, value):
        if value < 1:
            raise serializers.ValidationError('Укажите хотя бы одного гостя')
        if value > MAX_RESERVATION_GUESTS:
            raise serializers.ValidationError(f'Максимум {MAX_RESERVATION_GUESTS} гостей за один столик')
        return value

    def validate_name(self, value):
        name = value.strip()
        if len(name) < 2:
            raise serializers.ValidationError('Имя должно содержать минимум 2 символа')
        return name

    def validate_phone(self, value):
        cleaned = re.sub(r'[\s\-()]', '', value.strip())
        match = PHONE_PATTERN.match(cleaned)
        if not match:
            raise serializers.ValidationError(
                'Телефон: +7 или 8, затем 10 цифр (например, +79001234567)'
            )
        return f'+7{match.group(1)}'

    def validate(self, data):
        instance = getattr(self, 'instance', None)
        res_time = data.get('time') or (instance.time if instance else None)
        res_date = data.get('date') or (instance.date if instance else None)

        if res_time is None or res_date is None:
            return data

        if res_time < RESERVATION_OPEN or res_time > RESERVATION_CLOSE:
            raise serializers.ValidationError({
                'time': 'Бронь доступна с 07:00 до 22:00'
            })

        reservation_dt = datetime.combine(res_date, res_time)
        if timezone.is_naive(reservation_dt):
            reservation_dt = timezone.make_aware(reservation_dt)

        if reservation_dt <= timezone.now():
            raise serializers.ValidationError({
                'time': 'Нельзя забронировать столик на прошедшее время'
            })

        return data


class ChatMessageSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = ChatMessage
        fields = ('id', 'user', 'user_email', 'sender', 'text', 'timestamp')
        read_only_fields = ('id', 'user', 'user_email', 'sender', 'timestamp')

    def validate_text(self, value):
        text = value.strip()
        if not text:
            raise serializers.ValidationError('Сообщение не может быть пустым')
        if len(text) > MAX_CHAT_TEXT_LENGTH:
            raise serializers.ValidationError(f'Сообщение слишком длинное (макс. {MAX_CHAT_TEXT_LENGTH} символов)')
        return text


class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = (
            'id', 'title', 'period', 'body', 'image', 'badge', 'badge_style',
            'tags', 'footer_note', 'link_url', 'link_text',
            'is_published', 'sort_order', 'created_at',
        )
        read_only_fields = ('id', 'created_at')

    def validate_title(self, value):
        title = value.strip()
        if len(title) < 3:
            raise serializers.ValidationError('Заголовок слишком короткий')
        return title

    def validate_body(self, value):
        body = value.strip()
        if len(body) < 10:
            raise serializers.ValidationError('Текст новости слишком короткий')
        return body

    def validate_tags(self, value):
        if value is None:
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError('Теги должны быть списком')
        cleaned = []
        for tag in value[:4]:
            if not isinstance(tag, dict):
                continue
            text = str(tag.get('text', '')).strip()
            icon = str(tag.get('icon', 'fas fa-tag')).strip()
            if text:
                cleaned.append({'icon': icon or 'fas fa-tag', 'text': text})
        return cleaned