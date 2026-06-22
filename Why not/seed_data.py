"""
seed_data.py — Наполнение базы данных «Почему Нет?» полным меню.
Запуск: python seed_data.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'coffee_backend.settings')
django.setup()

from api.models import Category, MenuItem, News
from django.contrib.auth.models import User

print("🌱 Заполнение базы данных...")

# ---- Удаление дублей меню (без учёта регистра) ----
seen_keys = set()
removed = 0
for item in MenuItem.objects.select_related('category').order_by('-id'):
    key = (item.category_id, item.name.strip().lower())
    if key in seen_keys:
        item.delete()
        removed += 1
        print(f"  🗑 Удалён дубль: {item.name}")
    else:
        seen_keys.add(key)
if removed:
    print(f"  ✅ Удалено дублей: {removed}")

# ---- Категории ----
categories = [
    {'name': 'Кофе',             'slug': 'coffee'},
    {'name': 'Авторские напитки', 'slug': 'drinks'},
    {'name': 'Завтраки',         'slug': 'breakfasts'},
    {'name': 'Еда',              'slug': 'food'},
    {'name': 'Десерты',          'slug': 'desserts'},
]
for cat in categories:
    obj, created = Category.objects.get_or_create(slug=cat['slug'], defaults={'name': cat['name']})
    if created:
        print(f"  ✅ Категория: {cat['name']}")

# ---- Меню (27 позиций) ----
menu_items = [
    # --- Кофе ---
    {'category': 'coffee', 'name': 'Капучино',        'description': 'Классический эспрессо с нежной молочной пенкой. Идеальный баланс.',             'price': 250, 'image': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80'},
    {'category': 'coffee', 'name': 'Флэт Уайт',       'description': 'Двойной эспрессо с тонким слоем бархатистого молока.',                          'price': 280, 'image': 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&q=80'},
    {'category': 'coffee', 'name': 'Американо',        'description': 'Классический черный кофе для тех, кто ценит чистоту вкуса.',                    'price': 200, 'image': 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=500&q=80'},
    {'category': 'coffee', 'name': 'Латте Макиато',    'description': 'Трехслойный кофейный напиток с лёгким ароматом ванили.',                        'price': 290, 'image': 'https://images.unsplash.com/photo-1599398054066-846f28917f38?w=500&q=80'},
    {'category': 'coffee', 'name': 'Эспрессо',         'description': 'Заряд бодрости в одной маленькой чашке.',                                      'price': 150, 'image': 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80'},
    {'category': 'coffee', 'name': 'Раф кофе',         'description': 'Взбитый кофе со сливками. Нежный и воздушный.',                                'price': 310, 'image': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80'},

    # --- Авторские напитки ---
    {'category': 'drinks', 'name': 'Матча Латте',      'description': 'Японский церемониальный чай матча с кокосовым молоком.',                        'price': 300, 'image': 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=500&q=80'},
    {'category': 'drinks', 'name': 'Лавандовый Раф',   'description': 'Нежнейший кофейно-сливочный десерт с цветами лаванды.',                        'price': 320, 'image': 'https://images.unsplash.com/photo-1559124058-2123bac0369a?w=500&q=80'},
    {'category': 'drinks', 'name': 'Бамбл-Кофе',       'description': 'Освежающий микс эспрессо, апельсинового сока и карамели.',                     'price': 310, 'image': 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&q=80'},
    {'category': 'drinks', 'name': 'Айс-Латте Карамель','description': 'Холодный кофе с домашней карамелью и морской солью.',                         'price': 330, 'image': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&q=80'},
    {'category': 'drinks', 'name': 'Пряный Чай Латте',  'description': 'Чёрный чай со специями, мёдом и молоком. Глоток тепла.',                      'price': 280, 'image': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80'},

    # --- Завтраки ---
    {'category': 'breakfasts', 'name': 'Завтрак с лососем',    'description': 'Слабосоленый лосось, яйцо пашот, авокадо, микс салата и тартин.',       'price': 650, 'image': 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=500&q=80'},
    {'category': 'breakfasts', 'name': 'Авокадо-тост с яйцом', 'description': 'Цельнозерновой хлеб, гуакамоле, яйцо пашот и микрозелень.',             'price': 320, 'image': 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=500&q=80'},
    {'category': 'breakfasts', 'name': 'Сырники из творога',   'description': 'Подаются со сметаной и ягодным кули. Вкус как в детстве.',               'price': 340, 'image': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=80'},
    {'category': 'breakfasts', 'name': 'Овсянка с ягодами',    'description': 'На молоке со свежими ягодами и кедровыми орешками.',                    'price': 280, 'image': 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=500&q=80'},
    {'category': 'breakfasts', 'name': 'Яйца Бенедикт',        'description': 'Бриошь, хрустящий бекон, яйца пашот и соус голландез.',                 'price': 420, 'image': 'https://images.unsplash.com/photo-1600335895229-6e75511892c8?w=500&q=80'},

    # --- Еда ---
    {'category': 'food', 'name': 'Паста Карбонара',    'description': 'Классика с беконом, сливками, желтком и пармезаном.',                           'price': 380, 'image': 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&q=80'},
    {'category': 'food', 'name': 'Тёплый салат',        'description': 'Микс салата, бекон, черри, золотистый картофель и яйцо пашот.',                'price': 410, 'image': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'},
    {'category': 'food', 'name': 'Паста с креветками',  'description': 'Фетуччини с тигровыми креветками в томатном соусе и базиликом.',               'price': 490, 'image': 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500&q=80'},
    {'category': 'food', 'name': 'Киш с курицей',       'description': 'Сытный открытый пирог из песочного теста с нежной начинкой.',                  'price': 350, 'image': 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=500&q=80'},
    {'category': 'food', 'name': 'Цезарь с индейкой',   'description': 'Классический соус, хрустящие сухарики, пармезан и сочная грудка.',             'price': 390, 'image': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&q=80'},

    # --- Десерты ---
    {'category': 'desserts', 'name': 'Черничный чизкейк',    'description': 'Нежный сливочный слой на песочной основе с черникой.',                    'price': 290, 'image': 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80'},
    {'category': 'desserts', 'name': 'Тирамису',              'description': 'Воздушный десерт на основе маскарпоне и печенья савоярди.',               'price': 350, 'image': 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500&q=80'},
    {'category': 'desserts', 'name': 'Круассан классический', 'description': 'Свежеиспечённый, хрустящий, со сливочным ароматом.',                     'price': 180, 'image': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80'},
    {'category': 'desserts', 'name': 'Ванильный эклер',       'description': 'Заварной крем и тонкое тесто с белым шоколадом.',                        'price': 190, 'image': 'https://images.unsplash.com/photo-1612203985729-70726954388c?w=500&q=80'},
    {'category': 'desserts', 'name': 'Брауни с орехами',      'description': 'Насыщенный шоколадный вкус и грецкие орехи.',                            'price': 260, 'image': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80'},
    {'category': 'desserts', 'name': 'Торт Красный Бархат',   'description': 'Яркие алые коржи и лёгкий крем-чиз. Очень эффектно.',                   'price': 310, 'image': 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=500&q=80'},
    {'category': 'desserts', 'name': 'Лимонный тарт',         'description': 'Освежающая цитрусовая начинка и поджаренная меренга.',                   'price': 270, 'image': 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=500&q=80'},
]

created_count = 0
updated_count = 0
for item in menu_items:
    cat = Category.objects.get(slug=item['category'])
    existing = MenuItem.objects.filter(category=cat, name__iexact=item['name']).first()
    if existing:
        existing.description = item['description']
        existing.price = item['price']
        existing.image = item['image']
        existing.name = item['name']
        existing.save()
        updated_count += 1
    else:
        MenuItem.objects.create(
            category=cat,
            name=item['name'],
            description=item['description'],
            price=item['price'],
            image=item['image'],
        )
        created_count += 1

print(f"  ✅ Добавлено {created_count} новых, обновлено {updated_count} позиций (всего: {MenuItem.objects.count()})")

# ---- Новости ----
news_items = [
    {
        'title': '−20% на весь ассортимент',
        'period': 'Каждую пятницу',
        'body': (
            'По пятницам у нас скидка 20% на всё меню: кофе, авторские напитки, завтраки, '
            'горячие блюда и десерты. Отличный повод собраться с друзьями или заглянуть '
            'после работы за любимым капучино.'
        ),
        'image': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80',
        'badge': 'Акция',
        'badge_style': 'terracotta',
        'tags': [
            {'icon': 'fas fa-clock', 'text': '07:00 – 22:00'},
            {'icon': 'fas fa-percent', 'text': 'На всё меню'},
        ],
        'footer_note': 'Действует каждую пятницу',
        'link_url': 'menu.html',
        'link_text': 'Перейти в меню',
        'sort_order': 3,
    },
    {
        'title': 'Второй кофе в подарок',
        'period': 'Ежедневно до 11:00',
        'body': (
            'Закажите любой кофе до 11:00 — и получите второй такой же напиток бесплатно. '
            'Идеальное начало дня для тех, кто любит бодрость и хорошую компанию.'
        ),
        'image': 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200&q=80',
        'badge': 'Утро',
        'badge_style': 'dark',
        'tags': [
            {'icon': 'fas fa-sun', 'text': 'До 11:00'},
            {'icon': 'fas fa-mug-hot', 'text': 'Любой кофе'},
        ],
        'footer_note': 'В зале и на вынос',
        'sort_order': 2,
    },
    {
        'title': 'Дегустация десертов',
        'period': 'Каждую субботу',
        'body': (
            'По субботам с 14:00 до 17:00 — бесплатная дегустация новинок из раздела десертов. '
            'Приходите с друзьями, пробуйте и выбирайте свой любимый вкус.'
        ),
        'image': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1200&q=80',
        'badge': 'Событие',
        'badge_style': 'green',
        'tags': [
            {'icon': 'fas fa-clock', 'text': '14:00 – 17:00'},
            {'icon': 'fas fa-cookie-bite', 'text': 'Бесплатно'},
        ],
        'footer_note': 'Бронь столика не обязательна',
        'sort_order': 1,
    },
]

news_created = 0
for item in news_items:
    _, created = News.objects.get_or_create(title=item['title'], defaults=item)
    if created:
        news_created += 1
        print(f"  ✅ Новость: {item['title']}")
print(f"  ✅ Новостей в базе: {News.objects.count()} (добавлено: {news_created})")

# ---- Суперпользователь ----
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@whynot.ru', 'admin123')
    print("  ✅ Суперпользователь создан: admin / admin123")
else:
    print("  ℹ️  Суперпользователь уже существует: admin / admin123")

print("\n✨ База данных готова!")
print("📍 Запуск: start.bat  (или python manage.py runserver)")
print("🌐 Сайт:   http://127.0.0.1:8000/")
print("🔧 Админ:  http://127.0.0.1:8000/admin.html  (admin / admin123)")
