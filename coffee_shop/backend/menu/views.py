from django.shortcuts import render
from .models import Category, Product


def home_view(request):
    products = Product.objects.filter(is_available=True)[:6]
    return render(request, 'menu/home.html', {'featured': products})


def menu_view(request):
    categories = Category.objects.prefetch_related('products').all()
    active_category = request.GET.get('category')
    if active_category:
        products = Product.objects.filter(category__slug=active_category, is_available=True)
    else:
        products = Product.objects.filter(is_available=True)
    return render(request, 'menu/menu.html', {
        'categories': categories,
        'products': products,
        'active_category': active_category,
    })
