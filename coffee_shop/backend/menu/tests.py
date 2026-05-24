import pytest
from menu.models import Category, Product

@pytest.mark.django_db
def test_category_creation():
    """Тестируем создание категории."""
    category = Category.objects.create(name='Тестовая категория', slug='test-category')
    assert str(category) == 'Тестовая категория'
    assert Category.objects.count() == 1

@pytest.mark.django_db
def test_product_creation():
    """Тестируем создание товара и связь с категорией."""
    cat = Category.objects.create(name='Кофе', slug='coffee')
    product = Product.objects.create(category=cat, name='Эспрессо', price=100.50)
    assert str(product) == 'Эспрессо — 100.50₽'
    assert product.category == cat
