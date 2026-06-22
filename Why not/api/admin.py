from django.contrib import admin
from .models import Category, MenuItem, Order, OrderItem, Reservation, ChatMessage, News


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price']
    list_filter = ['category']
    search_fields = ['name', 'description']


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['menu_item', 'quantity']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'total', 'order_type', 'is_completed', 'date']
    list_filter = ['order_type', 'is_completed']
    list_editable = ['is_completed']
    inlines = [OrderItemInline]
    readonly_fields = ['date', 'user', 'total']


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ['name', 'date', 'time', 'guests', 'phone', 'user']
    list_filter = ['date']
    search_fields = ['name', 'phone']


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ['title', 'badge', 'period', 'is_published', 'sort_order', 'created_at']
    list_filter = ['is_published', 'badge_style']
    list_editable = ['is_published', 'sort_order']
    search_fields = ['title', 'body']


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['user', 'sender', 'text', 'timestamp']
    list_filter = ['sender']
    search_fields = ['user__email', 'text']
    readonly_fields = ['timestamp']
