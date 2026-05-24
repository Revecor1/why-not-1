def cart_count(request):
    """Контекстный процессор — кол-во товаров в корзине для навбара."""
    cart = request.session.get('cart', {})
    count = sum(item['qty'] for item in cart.values())
    return {'cart_count': count}
