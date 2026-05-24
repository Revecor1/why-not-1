from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from menu.models import Product
from .models import Order, OrderItem


def _get_cart(request):
    """Получить корзину из сессии."""
    return request.session.get('cart', {})


def _save_cart(request, cart):
    request.session['cart'] = cart
    request.session.modified = True


def add_to_cart(request, product_id):
    product = get_object_or_404(Product, pk=product_id)
    cart = _get_cart(request)
    key = str(product_id)
    if key in cart:
        cart[key]['qty'] += 1
    else:
        cart[key] = {'qty': 1, 'name': product.name, 'price': str(product.price)}
    _save_cart(request, cart)
    return redirect(request.META.get('HTTP_REFERER', 'menu'))


def remove_from_cart(request, product_id):
    cart = _get_cart(request)
    cart.pop(str(product_id), None)
    _save_cart(request, cart)
    return redirect('cart')


def cart_view(request):
    cart = _get_cart(request)
    items = []
    total = 0
    for pid, data in cart.items():
        subtotal = float(data['price']) * data['qty']
        items.append({'id': pid, 'name': data['name'], 'price': data['price'], 'qty': data['qty'], 'subtotal': subtotal})
        total += subtotal
    return render(request, 'orders/cart.html', {'items': items, 'total': total})


@login_required
def checkout_view(request):
    cart = _get_cart(request)
    if not cart:
        return redirect('cart')

    order = Order.objects.create(user=request.user)
    total = 0
    for pid, data in cart.items():
        product = Product.objects.get(pk=int(pid))
        item_price = product.price
        OrderItem.objects.create(order=order, product=product, quantity=data['qty'], price=item_price)
        total += item_price * data['qty']

    order.total_price = total
    order.save()

    request.session['cart'] = {}
    request.session.modified = True
    return render(request, 'orders/success.html', {'order': order})
