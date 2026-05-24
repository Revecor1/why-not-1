from django.db import models


class Category(models.Model):
    name = models.CharField('Название', max_length=100)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField('Название', max_length=200)
    description = models.TextField('Описание', blank=True)
    price = models.DecimalField('Цена', max_digits=8, decimal_places=2)
    image = models.ImageField('Фото', upload_to='products/', blank=True)
    is_available = models.BooleanField('Доступен', default=True, db_index=True)

    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'
        ordering = ['category', 'name']
        constraints = [
            models.CheckConstraint(check=models.Q(price__gte=0), name='product_price_positive')
        ]

    def __str__(self):
        return f'{self.name} — {self.price:.2f}₽'
