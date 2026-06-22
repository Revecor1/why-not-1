from datetime import date, time

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from .models import MenuItem, Order, OrderItem, News


class OrderAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser', email='test@test.ru', password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        self.item = MenuItem.objects.first()
        if not self.item:
            from .models import Category
            cat = Category.objects.create(name='Test', slug='test')
            self.item = MenuItem.objects.create(
                category=cat, name='Эспрессо', description='test',
                price=150, image='https://example.com/img.jpg'
            )

    def test_total_calculated_server_side(self):
        resp = self.client.post('/api/orders/', {
            'items': [{'id': self.item.id, 'quantity': 2}],
            'total': 1,
            'order_type': 'here',
        }, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['total'], self.item.price * 2)

    def test_invalid_item_rejected(self):
        resp = self.client.post('/api/orders/', {
            'items': [{'id': 999999, 'quantity': 1}],
            'total': 500,
            'order_type': 'here',
        }, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_patch_order_forbidden(self):
        order = Order.objects.create(user=self.user, total=300, order_type='here')
        OrderItem.objects.create(order=order, menu_item=self.item, quantity=2)
        resp = self.client.patch(f'/api/orders/{order.id}/', {'is_completed': True}, format='json')
        self.assertEqual(resp.status_code, 405)
        order.refresh_from_db()
        self.assertFalse(order.is_completed)

    def test_invalid_order_type_rejected(self):
        resp = self.client.post('/api/orders/', {
            'items': [{'id': self.item.id, 'quantity': 1}],
            'total': 150,
            'order_type': 'invalid',
        }, format='json')
        self.assertEqual(resp.status_code, 400)


class ReservationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='resuser', email='res@test.ru', password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_too_many_guests_rejected(self):
        resp = self.client.post('/api/reservations/', {
            'date': '2030-01-15',
            'time': '18:00',
            'guests': 7,
            'name': 'Иван',
            'phone': '+79001234567',
            'comment': '',
        }, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_invalid_phone_rejected(self):
        resp = self.client.post('/api/reservations/', {
            'date': '2030-01-15',
            'time': '18:00',
            'guests': 2,
            'name': 'Иван',
            'phone': '123',
            'comment': '',
        }, format='json')
        self.assertEqual(resp.status_code, 400)


class ChatAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username='admin2', email='admin2@test.ru', password='adminpass123'
        )
        self.client.force_authenticate(user=self.admin)

    def test_admin_reply_unknown_email_rejected(self):
        resp = self.client.post('/api/chats/', {
            'text': 'Привет',
            'target_email': 'nobody@test.ru',
        }, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_empty_message_rejected(self):
        resp = self.client.post('/api/chats/', {'text': '   '}, format='json')
        self.assertEqual(resp.status_code, 400)


class NewsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username='newsadmin', email='newsadmin@test.ru', password='adminpass123'
        )
        self.news = News.objects.create(
            title='Тестовая акция',
            period='Каждый день',
            body='Описание тестовой акции для проверки API.',
            image='https://example.com/news.jpg',
            badge='Акция',
            badge_style='terracotta',
            tags=[{'icon': 'fas fa-clock', 'text': '10:00 – 20:00'}],
            is_published=True,
            sort_order=1,
        )
        self.draft = News.objects.create(
            title='Черновик',
            period='Скоро',
            body='Эта новость ещё не опубликована для публики.',
            image='https://example.com/draft.jpg',
            is_published=False,
        )

    def test_public_sees_only_published(self):
        resp = self.client.get('/api/news/')
        self.assertEqual(resp.status_code, 200)
        titles = [n['title'] for n in resp.json()]
        self.assertIn('Тестовая акция', titles)
        self.assertNotIn('Черновик', titles)

    def test_admin_can_create_news(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post('/api/news/', {
            'title': 'Новая новость',
            'period': 'По выходным',
            'body': 'Текст новой акции для посетителей кофейни.',
            'image': 'https://example.com/new.jpg',
            'badge': 'Событие',
            'badge_style': 'green',
            'tags': [{'icon': 'fas fa-star', 'text': 'Бесплатно'}],
            'is_published': True,
        }, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['title'], 'Новая новость')

    def test_anonymous_cannot_create_news(self):
        resp = self.client.post('/api/news/', {
            'title': 'Взлом',
            'period': 'Никогда',
            'body': 'Попытка создать новость без прав администратора.',
            'image': 'https://example.com/hack.jpg',
        }, format='json')
        self.assertEqual(resp.status_code, 403)

    def test_short_title_rejected(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post('/api/news/', {
            'title': 'OK',
            'period': 'Сегодня',
            'body': 'Слишком короткий заголовок не должен проходить валидацию.',
            'image': 'https://example.com/x.jpg',
        }, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_admin_can_delete_news(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.delete(f'/api/news/{self.news.id}/')
        self.assertEqual(resp.status_code, 204)
        self.assertFalse(News.objects.filter(id=self.news.id).exists())


class UserSerializerTests(TestCase):
    def test_me_returns_is_staff(self):
        user = User.objects.create_superuser(
            username='staffuser', email='staff@test.ru', password='pass12345'
        )
        client = APIClient()
        client.force_authenticate(user=user)
        resp = client.get('/api/auth/me/')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json()['is_staff'])