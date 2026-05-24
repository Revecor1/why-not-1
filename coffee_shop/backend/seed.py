"""
Скрипт заполнения БД тестовыми данными.
Запуск: python manage.py shell < seed.py
"""
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'why_not_coffee.settings')
django.setup()

from menu.models import Category, Product

# Категории
categories_data = [
    ('Кофе', 'coffee'),
    ('Чай', 'tea'),
    ('Десерты', 'desserts'),
    ('Холодные напитки', 'cold'),
]

for name, slug in categories_data:
    Category.objects.get_or_create(name=name, slug=slug)

coffee = Category.objects.get(slug='coffee')
tea = Category.objects.get(slug='tea')
desserts = Category.objects.get(slug='desserts')
cold = Category.objects.get(slug='cold')

# Товары
products = [
    (coffee, 'Эспрессо', 'Классический крепкий кофе из отборных зёрен арабики', 180),
    (coffee, 'Капучино', 'Эспрессо с нежной молочной пенкой', 280),
    (coffee, 'Латте', 'Мягкий кофе с большим количеством молока', 300),
    (coffee, 'Американо', 'Эспрессо разбавленный горячей водой', 200),
    (coffee, 'Раф', 'Сливочный кофейный напиток с ванилью', 340),
    (coffee, 'Флэт Уайт', 'Двойной эспрессо с бархатистым молоком', 320),
    (tea, 'Зелёный чай', 'Классический китайский зелёный чай', 200),
    (tea, 'Чёрный чай', 'Крепкий цейлонский чай', 180),
    (tea, 'Облепиховый чай', 'Горячий чай с облепихой и мёдом', 280),
    (desserts, 'Чизкейк', 'Нежный творожный чизкейк с ягодами', 320),
    (desserts, 'Круассан', 'Свежий французский круассан с маслом', 180),
    (desserts, 'Тирамису', 'Классический итальянский десерт', 350),
    (cold, 'Айс Латте', 'Холодный латте со льдом', 320),
    (cold, 'Лимонад', 'Домашний лимонад с мятой', 250),
    (cold, 'Фраппе', 'Ледяной кофейный коктейль', 340),
]

for cat, name, desc, price in products:
    Product.objects.get_or_create(category=cat, name=name, defaults={'description': desc, 'price': price})

print(f'Создано {Category.objects.count()} категорий и {Product.objects.count()} товаров.')
