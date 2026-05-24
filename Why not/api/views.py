from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from .models import Category, MenuItem, Order, OrderItem, Reservation, ChatMessage
from .serializers import (
    UserSerializer, MenuItemSerializer, OrderSerializer,
    ReservationSerializer, ChatMessageSerializer
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
    queryset = MenuItem.objects.select_related('category').all()
    serializer_class = MenuItemSerializer
    permission_classes = [permissions.AllowAny]


class OrderViewSet(viewsets.ModelViewSet):
    """Заказы — только для авторизованных. Администратор видит все."""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.prefetch_related('items__menu_item').select_related('user').all().order_by('-date')
        return Order.objects.prefetch_related('items__menu_item').filter(user=self.request.user).order_by('-date')

    def create(self, request):
        items_data = request.data.get('items', [])
        total = request.data.get('total', 0)
        order_type = request.data.get('order_type', 'here')

        if not items_data:
            return Response({'error': 'Корзина пуста'}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.create(user=request.user, total=total, order_type=order_type)
        for item in items_data:
            try:
                menu_item = MenuItem.objects.get(id=item['id'])
                OrderItem.objects.create(order=order, menu_item=menu_item, quantity=item['quantity'])
            except MenuItem.DoesNotExist:
                pass

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

    def get_queryset(self):
        if self.request.user.is_staff:
            # Администратор может фильтровать по email пользователя
            email = self.request.query_params.get('email')
            if email:
                return ChatMessage.objects.filter(user__email=email).select_related('user')
            return ChatMessage.objects.select_related('user').all().order_by('timestamp')
        return ChatMessage.objects.filter(user=self.request.user).order_by('timestamp')

    def perform_create(self, serializer):
        if self.request.user.is_staff:
            # Администратор отвечает от имени конкретного пользователя-чата
            target_email = self.request.data.get('target_email')
            try:
                target_user = User.objects.get(email=target_email)
                serializer.save(user=target_user, sender='admin')
            except User.DoesNotExist:
                serializer.save(user=self.request.user, sender='admin')
        else:
            serializer.save(user=self.request.user, sender='user')
