/**
 * js/app.js
 * Клиентская логика кофейни «Почему Нет?»
 * Всё взаимодействие — через Django REST API (js/api.js).
 */

document.addEventListener('DOMContentLoaded', async () => {
    const MAX_ITEM_QUANTITY = 10;

    // ---- State ----
    let cart = JSON.parse(localStorage.getItem('coffee_cart')) || [];
    let currentUser = JSON.parse(localStorage.getItem('coffee_user')) || null;

    await api.ready;
    try {
        const freshUser = await api.getCurrentUser();
        localStorage.setItem('coffee_user', JSON.stringify(freshUser));
        currentUser = freshUser;
    } catch {
        localStorage.removeItem('coffee_user');
        currentUser = null;
    }

    const path = window.location.pathname;

    function isMenuPage() {
        return /\/menu(\.html)?$/i.test(path) || path.includes('menu.html');
    }

    function isProfilePage() {
        return /\/profile(\.html)?$/i.test(path) || path.includes('profile.html');
    }

    // Сбрасываем старые корзины, где было больше лимита
    let cartClamped = false;
    cart.forEach(item => {
        if (item.quantity > MAX_ITEM_QUANTITY) {
            item.quantity = MAX_ITEM_QUANTITY;
            cartClamped = true;
        }
    });
    if (cartClamped) localStorage.setItem('coffee_cart', JSON.stringify(cart));

    // ---- Глобальная инициализация ----
    updateCartCount();
    setupCartEvents();

    // auth.html имеет собственный встроенный скрипт

    // ---- КОРЗИНА ----

    function setupCartEvents() {
        const cartBtns   = [document.getElementById('cart-btn'), document.getElementById('mobile-cart-btn')];
        const overlay    = document.getElementById('cart-overlay');
        const closeBtn   = document.getElementById('close-cart');
        const checkoutBtn = document.getElementById('checkout-btn');

        cartBtns.forEach(btn => btn?.addEventListener('click', () => toggleCart(true)));
        closeBtn?.addEventListener('click', () => toggleCart(false));
        overlay?.addEventListener('click', e => { if (e.target === overlay) toggleCart(false); });
        checkoutBtn?.addEventListener('click', handleCheckout);
    }

    function toggleCart(open) {
        const overlay = document.getElementById('cart-overlay');
        const modal   = document.getElementById('cart-modal');
        if (!overlay || !modal) return;
        overlay.classList.toggle('active', open);
        modal.classList.toggle('active', open);
        if (open) renderCartItems();
    }

    function updateCartCount() {
        const count = cart.reduce((s, i) => s + i.quantity, 0);
        ['cart-count', 'mobile-cart-count'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.textContent = count;
            el.classList.toggle('hidden', count === 0);
        });
    }

    function saveCart() {
        localStorage.setItem('coffee_cart', JSON.stringify(cart));
        updateCartCount();
    }

    function addToCart(item) {
        const existing = cart.find(i => i.id === item.id);
        if (existing) {
            if (existing.quantity >= MAX_ITEM_QUANTITY) {
                showToast(`Максимум ${MAX_ITEM_QUANTITY} шт. «${item.name}» в одном заказе`, 'error');
                return false;
            }
            existing.quantity++;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        saveCart();
        return true;
    }

    function renderCartItems() {
        const container  = document.getElementById('cart-items');
        const totalSpan  = document.getElementById('cart-total');
        if (!container) return;

        container.innerHTML = '';

        if (cart.length === 0) {
            container.innerHTML = `
                <div class="h-full flex flex-col items-center justify-center text-coffee-300 py-20">
                    <div class="w-20 h-20 bg-coffee-50 rounded-full flex items-center justify-center mb-6">
                        <i class="fas fa-shopping-basket text-3xl"></i>
                    </div>
                    <p class="font-medium text-coffee-500 mb-2">Корзина пуста</p>
                    <button onclick="document.getElementById('cart-overlay').classList.remove('active');document.getElementById('cart-modal').classList.remove('active')"
                            class="text-terracotta text-sm font-bold hover:underline">
                        Перейти к меню →
                    </button>
                </div>`;
            if (totalSpan) totalSpan.textContent = '0 ₽';
            return;
        }

        let total = 0;
        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            const div = document.createElement('div');
            div.className = 'flex gap-4 p-4 bg-coffee-50 rounded-2xl border border-coffee-100 items-center';
            div.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-xl flex-shrink-0">
                <div class="flex-grow min-w-0">
                    <p class="font-bold text-sm text-coffee-900 truncate">${item.name}</p>
                    <p class="text-terracotta font-bold text-sm">${item.price} ₽</p>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <button class="qty-btn w-8 h-8 bg-white rounded-xl shadow-sm border border-coffee-100 flex items-center justify-center text-coffee-700 hover:border-terracotta hover:text-terracotta font-bold transition-all"
                            data-idx="${index}" data-delta="-1">−</button>
                    <span class="w-6 text-center font-bold text-sm">${item.quantity}</span>
                    <button class="qty-btn w-8 h-8 bg-white rounded-xl shadow-sm border border-coffee-100 flex items-center justify-center text-coffee-700 hover:border-terracotta hover:text-terracotta font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-coffee-100 disabled:hover:text-coffee-700"
                            data-idx="${index}" data-delta="1" ${item.quantity >= MAX_ITEM_QUANTITY ? 'disabled' : ''}>+</button>
                </div>
            `;
            container.appendChild(div);
        });

        if (totalSpan) totalSpan.textContent = `${total} ₽`;

        container.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx   = parseInt(btn.dataset.idx);
                const delta = parseInt(btn.dataset.delta);
                if (delta > 0 && cart[idx].quantity >= MAX_ITEM_QUANTITY) {
                    showToast(`Максимум ${MAX_ITEM_QUANTITY} шт. «${cart[idx].name}» в одном заказе`, 'error');
                    return;
                }
                cart[idx].quantity += delta;
                if (cart[idx].quantity <= 0) cart.splice(idx, 1);
                saveCart();
                renderCartItems();
            });
        });
    }

    async function handleCheckout() {
        if (cart.length === 0) { showToast('Добавьте что-нибудь в корзину', 'error'); return; }
        if (!currentUser)      { toggleCart(false); window.location.href = 'auth.html'; return; }

        const overLimit = cart.find(item => item.quantity > MAX_ITEM_QUANTITY);
        if (overLimit) {
            showToast(`Максимум ${MAX_ITEM_QUANTITY} шт. «${overLimit.name}» в одном заказе`, 'error');
            return;
        }

        const btn = document.getElementById('checkout-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i>Оформляем...';

        try {
            await api.createOrder({
                items: cart.map(i => ({ id: i.id, quantity: i.quantity })),
                total: cart.reduce((s, i) => s + i.price * i.quantity, 0),
                order_type: document.getElementById('order-type')?.value || 'here',
            });
            cart = [];
            saveCart();
            toggleCart(false);
            showToast('🎉 Заказ принят! Начинаем готовить.');
        } catch (err) {
            showToast('Ошибка оформления: ' + err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Оформить заказ <i class="fas fa-arrow-right text-xs"></i>';
        }
    }

    // ---- СТРАНИЦА МЕНЮ ----

    async function initMenuPage() {
        showMenuSkeleton();

        let menuData = [];
        try {
            menuData = await api.getMenu();
        } catch (err) {
            document.getElementById('menu-container').innerHTML = `
                <div class="col-span-full text-center py-20 text-coffee-400">
                    <i class="fas fa-wifi-slash text-4xl mb-4"></i>
                    <p>Сервер недоступен. Убедитесь, что Django запущен (<code>python manage.py runserver</code>).</p>
                </div>`;
            return;
        }

        renderMenu(menuData, 'all');

        // Фильтрация по категориям
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderMenu(menuData, btn.dataset.category);
            });
        });

    }

    function showMenuSkeleton() {
        const container = document.getElementById('menu-container');
        if (!container) return;
        container.innerHTML = Array(8).fill('').map(() => `
            <div class="bg-white rounded-[2rem] overflow-hidden border border-coffee-100 animate-pulse">
                <div class="h-60 bg-coffee-100"></div>
                <div class="p-8 space-y-3">
                    <div class="h-5 bg-coffee-100 rounded-full w-3/4"></div>
                    <div class="h-3 bg-coffee-50 rounded-full w-full"></div>
                    <div class="h-3 bg-coffee-50 rounded-full w-2/3"></div>
                    <div class="h-10 bg-coffee-100 rounded-2xl mt-4"></div>
                </div>
            </div>
        `).join('');
    }

    function renderMenu(menuData, category) {
        const container = document.getElementById('menu-container');
        if (!container) return;

        const filtered = category === 'all' ? menuData : menuData.filter(i => i.category_slug === category);

        if (filtered.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center py-16 text-coffee-400"><i class="fas fa-search text-4xl mb-4"></i><p>Ничего не найдено</p></div>';
            return;
        }

        container.innerHTML = '';
        filtered.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'menu-card bg-white rounded-[2rem] overflow-hidden shadow-sm border border-coffee-100 flex flex-col h-full';
            card.style.opacity = '0';
            card.style.transform = 'translateY(16px)';
            card.style.transition = `all 0.4s ease ${index * 40}ms`;

            card.innerHTML = `
                <div class="h-60 overflow-hidden relative flex-shrink-0">
                    <img src="${item.image}" alt="${item.name}"
                         class="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                         loading="lazy">
                    <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-md font-bold px-4 py-1.5 rounded-full shadow-lg text-sm text-coffee-900">
                        ${item.price} ₽
                    </div>
                    <div class="absolute top-4 left-4 bg-coffee-900/60 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        ${item.category_name}
                    </div>
                </div>
                <div class="p-7 flex flex-col flex-grow">
                    <h3 class="text-xl font-bold font-serif mb-2 text-coffee-900">${item.name}</h3>
                    <p class="text-coffee-500 text-sm mb-6 flex-grow leading-relaxed">${item.description}</p>
                    <button class="add-to-cart-btn w-full bg-coffee-50 hover:bg-coffee-900 hover:text-white border border-coffee-200 hover:border-coffee-900 text-coffee-800 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 group"
                            data-id="${item.id}">
                        <i class="fas fa-plus text-xs group-hover:rotate-90 transition-transform duration-300"></i>
                        В корзину
                    </button>
                </div>
            `;
            container.appendChild(card);

            // Анимация появления
            requestAnimationFrame(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            });
        });

        // Обработчики кнопок «В корзину»
        container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id   = parseInt(btn.dataset.id);
                const item = menuData.find(i => i.id === id);
                if (!item) return;
                if (!addToCart(item)) return;

                btn.innerHTML = '<i class="fas fa-check"></i> Добавлено';
                btn.classList.add('bg-green-500', 'text-white', 'border-green-500');
                btn.classList.remove('bg-coffee-50', 'text-coffee-800');
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-plus text-xs group-hover:rotate-90 transition-transform duration-300"></i> В корзину';
                    btn.classList.remove('bg-green-500', 'text-white', 'border-green-500');
                    btn.classList.add('bg-coffee-50', 'text-coffee-800');
                }, 1800);

                showToast(`«${item.name}» добавлено в корзину`);
            });
        });
    }

    // ---- БРОНИРОВАНИЕ ----

    const RES_OPEN = '07:00';
    const RES_CLOSE = '22:00';
    const MAX_RES_GUESTS = 6;
    const PHONE_RE = /^(?:\+7|8)\d{10}$/;

    function getTodayStr() {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    function getCurrentTimeStr() {
        const now = new Date();
        let h = now.getHours();
        let m = now.getMinutes();
        const remainder = m % 15;
        if (remainder !== 0) m += 15 - remainder;
        if (m >= 60) {
            m -= 60;
            h += 1;
        }
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    function normalizePhone(phone) {
        return phone.replace(/[\s\-()]/g, '');
    }

    function isValidPhone(phone) {
        return PHONE_RE.test(normalizePhone(phone));
    }

    function isReservationInFuture(dateStr, timeStr) {
        return new Date(`${dateStr}T${timeStr}`) > new Date();
    }

    function setupReservationForm() {
        const form = document.getElementById('reservation-form');
        const dateInput = document.getElementById('res-date');
        const timeInput = document.getElementById('res-time');
        const guestsInput = document.getElementById('res-guests');
        const phoneInput = document.getElementById('res-phone');
        if (!dateInput || !timeInput) return;

        dateInput.min = getTodayStr();
        if (!dateInput.value || dateInput.value < dateInput.min) {
            dateInput.value = dateInput.min;
        }
        timeInput.min = RES_OPEN;
        timeInput.max = RES_CLOSE;

        function updateTimeConstraints() {
            const today = getTodayStr();
            if (dateInput.value === today) {
                const nowTime = getCurrentTimeStr();
                timeInput.min = nowTime > RES_OPEN ? nowTime : RES_OPEN;
                if (timeInput.min > RES_CLOSE) {
                    timeInput.min = RES_CLOSE;
                }
            } else {
                timeInput.min = RES_OPEN;
            }
            if (timeInput.value && timeInput.value < timeInput.min) {
                timeInput.value = '';
            }
        }

        if (!form.dataset.reservationBound) {
            form.dataset.reservationBound = '1';
            dateInput.addEventListener('change', updateTimeConstraints);
            guestsInput?.addEventListener('input', () => {
                const n = parseInt(guestsInput.value, 10);
                if (n > MAX_RES_GUESTS) guestsInput.value = MAX_RES_GUESTS;
                if (n < 1 && guestsInput.value !== '') guestsInput.value = 1;
            });
            phoneInput?.addEventListener('blur', () => {
                const cleaned = normalizePhone(phoneInput.value);
                if (cleaned && isValidPhone(cleaned)) {
                    phoneInput.value = cleaned.startsWith('8')
                        ? '+7' + cleaned.slice(1)
                        : cleaned;
                }
            });
        }

        updateTimeConstraints();
    }

    async function handleReservation(e) {
        e.preventDefault();
        if (!currentUser) {
            showToast('Для бронирования нужно войти', 'error');
            setTimeout(() => window.location.href = 'auth.html', 1200);
            return;
        }

        const dateStr = document.getElementById('res-date').value;
        const timeStr = document.getElementById('res-time').value;
        const guests  = parseInt(document.getElementById('res-guests').value, 10);
        const name    = document.getElementById('res-name').value.trim();
        const phone   = document.getElementById('res-phone').value.trim();

        if (!timeStr) {
            showToast('Выберите время бронирования', 'error');
            return;
        }
        if (guests < 1 || guests > MAX_RES_GUESTS) {
            showToast(`Гостей должно быть от 1 до ${MAX_RES_GUESTS}`, 'error');
            return;
        }
        if (!isValidPhone(phone)) {
            showToast('Телефон: +7 или 8, затем 10 цифр', 'error');
            return;
        }
        if (!isReservationInFuture(dateStr, timeStr)) {
            showToast('Нельзя забронировать столик на прошедшее время', 'error');
            return;
        }
        if (timeStr < RES_OPEN || timeStr > RES_CLOSE) {
            showToast('Бронь доступна с 07:00 до 22:00', 'error');
            return;
        }

        const form = e.currentTarget;
        const btn = form.querySelector('button[type="submit"]');
        if (!btn) return;
        btn.disabled = true;
        btn.textContent = 'Бронируем...';

        try {
            await api.createReservation({
                date: dateStr,
                time: timeStr,
                guests,
                name,
                phone: normalizePhone(phone),
                comment: document.getElementById('res-comment')?.value.trim() || '',
            });
            showToast('✅ Столик забронирован! До встречи.');
            form.reset();
            setupReservationForm();
        } catch (err) {
            showToast('Ошибка: ' + err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Забронировать стол';
        }
    }

    // ---- СТРАНИЦА ПРОФИЛЯ ----

    async function initProfilePage() {
        if (!currentUser) { window.location.href = 'auth.html'; return; }

        // Проверяем сессию на сервере
        try {
            const freshUser = await api.getCurrentUser();
            localStorage.setItem('coffee_user', JSON.stringify(freshUser));
            currentUser = freshUser;
        } catch (_) {
            localStorage.removeItem('coffee_user');
            window.location.href = 'auth.html';
            return;
        }

        document.getElementById('profile-name').textContent  = currentUser.username;
        document.getElementById('profile-email').textContent = currentUser.email || '—';

        document.getElementById('logout-btn')?.addEventListener('click', async () => {
            await api.logout();
            localStorage.removeItem('coffee_user');
            window.location.href = 'index.html';
        });

        await loadProfileData();
    }

    async function loadProfileData() {
        const [orders, reservations] = await Promise.all([
            api.getOrders().catch(() => []),
            api.getReservations().catch(() => []),
        ]);

        renderProfileOrders(orders);
        renderProfileReservations(reservations);
    }

    function renderProfileOrders(orders) {
        const el = document.getElementById('profile-orders');
        if (!el) return;
        if (orders.length === 0) {
            el.innerHTML = '<p class="text-coffee-300 text-sm py-4 text-center">Заказов пока нет. <a href="menu.html" class="text-terracotta font-bold hover:underline">Перейти в меню</a></p>';
            return;
        }
        el.innerHTML = orders.map(o => `
            <div class="p-5 bg-coffee-50 rounded-2xl border border-coffee-100">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <p class="font-bold text-coffee-900">${new Date(o.date).toLocaleDateString('ru-RU', {day:'2-digit',month:'long',year:'numeric'})}</p>
                        <p class="text-[10px] text-coffee-400 font-bold uppercase tracking-wider mt-0.5">${o.order_type === 'here' ? '🪑 В заведении' : '🛍 С собой'}</p>
                    </div>
                    <span class="text-xl font-serif font-bold text-terracotta">${o.total} ₽</span>
                </div>
                <p class="text-xs text-coffee-500 line-clamp-1">${o.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}</p>
                <div class="mt-3">
                    ${o.is_completed
                        ? '<span class="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold uppercase">Выполнен</span>'
                        : '<span class="text-[10px] bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold uppercase">В обработке</span>'}
                </div>
            </div>
        `).join('');
    }

    function renderProfileReservations(reservations) {
        const el = document.getElementById('profile-reservations');
        if (!el) return;
        if (reservations.length === 0) {
            el.innerHTML = '<p class="text-coffee-300 text-sm py-4 text-center">Бронирований пока нет. <a href="menu.html#reservation" class="text-terracotta font-bold hover:underline">Забронировать</a></p>';
            return;
        }
        el.innerHTML = reservations.map(r => `
            <div class="p-5 bg-coffee-50 rounded-2xl border border-coffee-100 flex items-center justify-between">
                <div>
                    <p class="font-bold text-coffee-900">${r.date} в ${r.time}</p>
                    <p class="text-xs text-coffee-400">Гостей: ${r.guests} • ${r.name}</p>
                </div>
                <span class="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase">Подтверждено</span>
            </div>
        `).join('');
    }

    // ---- Toast ----
    function showToast(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const div = document.createElement('div');
        div.className = `px-6 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm flex items-center gap-3 transition-all duration-300 ${
            type === 'success' ? 'bg-coffee-900' : 'bg-red-500'
        }`;
        div.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${msg}`;
        container.appendChild(div);
        setTimeout(() => {
            div.style.opacity = '0';
            div.style.transform = 'translateX(20px)';
            setTimeout(() => div.remove(), 300);
        }, 3000);
    }

    // Инициализация страниц (после объявления всех функций)
    if (isMenuPage()) {
        setupReservationForm();
        const resForm = document.getElementById('reservation-form');
        if (resForm && !resForm.dataset.submitBound) {
            resForm.dataset.submitBound = '1';
            resForm.addEventListener('submit', handleReservation);
        }
        await initMenuPage();
    }
    if (isProfilePage()) {
        await initProfilePage();
    }
});
