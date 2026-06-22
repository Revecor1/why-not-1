from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.db import transaction
from .models import Category, MenuItem, Order, OrderItem, Reservation, ChatMessage, News
from .serializers import (
    UserSerializer, MenuItemSerializer, OrderSerializer,
    ReservationSerializer, ChatMessageSerializer, NewsSerializer
)


class CSRFView(views.APIView):
    """Эндпоинт для получения CSRF-токена перед первым запросом."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        token = get_token(request)
        return Response({'csrfToken': token})


class AuthView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, action):
        if action == 'register':
            username = request.data.get('username', '').strip()
            email = request.data.get('email', '').strip()
            password = request.data.get('password', '')

            if not username or not email or not password:
                return Response({'error': 'Заполните все поля'}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(username=username).exists():
                return Response({'error': 'Пользователь с таким именем уже существует'}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(email=email).exists():
                return Response({'error': 'Email уже зарегистрирован'}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.create_user(username=username, email=email, password=password)
            login(request, user)
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

        elif action == 'login':
            username = request.data.get('username', '').strip()
            password = request.data.get('password', '')
            user = authenticate(request, username=username, password=password)
            if user:
                login(request, user)
                return Response(UserSerializer(user).data)
            return Response({'error': 'Неверный логин или пароль'}, status=status.HTTP_401_UNAUTHORIZED)

        elif action == 'logout':
            logout(request)
            return Response({'status': 'ok'})

    def get(self, request, action):
        """Проверка текущего пользователя."""
        if action == 'me':
            if request.user.is_authenticated:
                return Response(UserSerializer(request.user).data)
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class MenuViewSet(viewsets.ReadOnlyModelViewSet):
    """Только чтение — меню доступно всем."""
    queryset = MenuItem.objects.select_related('category').order_by('category__slug', 'name')
    serializer_class = MenuItemSerializer
    permission_classes = [permissions.AllowAny]


MAX_ITEM_QUANTITY = 10
VALID_ORDER_TYPES = {choice[0] for choice in Order.ORDER_TYPES}


class OrderViewSet(viewsets.ModelViewSet):
    """Заказы — только для авторизованных. Администратор видит все."""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.prefetch_related('items__menu_item').select_related('user').all().order_by('-date')
        return Order.objects.prefetch_related('items__menu_item').filter(user=self.request.user).order_by('-date')

    def create(self, request):
        items_data = request.data.get('items', [])
        order_type = request.data.get('order_type', 'here')

        if not items_data:
            return Response({'error': 'Корзина пуста'}, status=status.HTTP_400_BAD_REQUEST)

        if order_type not in VALID_ORDER_TYPES:
            return Response({'error': 'Некорректный способ получения'}, status=status.HTTP_400_BAD_REQUEST)

        order_items = []
        for item in items_data:
            quantity = item.get('quantity', 0)
            try:
                quantity = int(quantity)
            except (TypeError, ValueError):
                return Response({'error': 'Некорректное количество товара'}, status=status.HTTP_400_BAD_REQUEST)

            if quantity < 1:
                return Response({'error': 'Количество товара должно быть больше 0'}, status=status.HTTP_400_BAD_REQUEST)

            item_id = item.get('id')
            try:
                menu_item = MenuItem.objects.get(id=item_id)
            except (MenuItem.DoesNotExist, TypeError, ValueError):
                return Response({'error': f'Товар с id {item_id} не найден'}, status=status.HTTP_400_BAD_REQUEST)

            if quantity > MAX_ITEM_QUANTITY:
                return Response(
                    {'error': f'Нельзя заказать больше {MAX_ITEM_QUANTITY} шт. «{menu_item.name}»'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            order_items.append((menu_item, quantity))

        total = sum(menu_item.price * quantity for menu_item, quantity in order_items)

        with transaction.atomic():
            order = Order.objects.create(user=request.user, total=total, order_type=order_type)
            for menu_item, quantity in order_items:
                OrderItem.objects.create(order=order, menu_item=menu_item, quantity=quantity)

        order = Order.objects.prefetch_related('items__menu_item').get(pk=order.pk)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def complete(self, request, pk=None):
        """Пометить заказ как выполненный."""
        order = self.get_object()
        order.is_completed = True
        order.save()
        return Response({'status': 'completed'})


class ReservationViewSet(viewsets.ModelViewSet):
    """Бронирования — только для авторизованных."""
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        if self.request.user.is_staff:
            return Reservation.objects.select_related('user').all().order_by('-date')
        return Reservation.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ChatViewSet(viewsets.ModelViewSet):
    """Сообщения чата. Пользователь видит только свои, админ — все."""
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        if self.request.user.is_staff:
            email = self.request.query_params.get('email')
            if email:
                return ChatMessage.objects.filter(user__email=email).select_related('user')
            return ChatMessage.objects.select_related('user').all().order_by('timestamp')
        return ChatMessage.objects.filter(user=self.request.user).order_by('timestamp')

    def perform_create(self, serializer):
        if self.request.user.is_staff:
            target_email = self.request.data.get('target_email')
            if not target_email:
                raise ValidationError({'target_email': 'Укажите email пользователя'})
            try:
                target_user = User.objects.get(email=target_email)
            except User.DoesNotExist:
                raise ValidationError({'target_email': 'Пользователь не найден'})
            serializer.save(user=target_user, sender='admin')
        else:
            serializer.save(user=self.request.user, sender='user')


class NewsViewSet(viewsets.ModelViewSet):
    """Новости: публика читает, админ управляет."""
    serializer_class = NewsSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        qs = News.objects.all()
        if not (self.request.user.is_authenticated and self.request.user.is_staff):
            qs = qs.filter(is_published=True)
        return qs.order_by('-sort_order', '-created_at')