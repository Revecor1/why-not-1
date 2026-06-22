/**
 * js/components.js
 * Общие компоненты сайта: Шапка, Подвал и Виджет чата.
 */

const CAFE_LOCATION = {
    address: 'г. Ульяновск, ул. Карла Маркса, 18, 1 этаж',
    shortAddress: 'Ульяновск, ул. Карла Маркса, 18, 1 этаж',
    lon: 48.392433,
    lat: 54.320340,
    zoom: 18,
    yandexUrl: 'https://yandex.ru/maps/195/ulyanovsk/house/ulitsa_karla_marksa_18/YEEYdQ5iSkcCQFtufX9zcX9hZQ==/',
    yandexRouteUrl: 'https://yandex.ru/maps/?rtext=~54.320340,48.392433&rtt=auto',
};

function getYandexMapEmbedUrl({ lon, lat, zoom } = CAFE_LOCATION) {
    const ll = `${lon}%2C${lat}`;
    return `https://yandex.ru/map-widget/v1/?ll=${ll}&z=${zoom}&pt=${ll}%2Cpm2rdm&lang=ru_RU`;
}

const components = {
    header: (currentPath) => `
        <nav class="fixed w-full z-[100] glass-nav py-4 transition-all duration-500">
            <div class="max-w-7xl mx-auto px-6 lg:px-12">
                <div class="flex justify-between items-center h-16">
                    <a href="index.html" class="flex items-center gap-3 group">
                        <div class="w-10 h-10 bg-coffee-800 rounded-xl flex items-center justify-center text-white transition-transform group-hover:rotate-12">
                            <i class="fas fa-coffee text-xl"></i>
                        </div>
                        <span class="font-serif font-bold text-2xl tracking-tight text-coffee-900">Почему <span class="text-terracotta">Нет?</span></span>
                    </a>
                    
                    <div class="hidden md:flex items-center space-x-10">
                        <a href="index.html" class="nav-link text-sm font-bold uppercase tracking-widest ${currentPath.includes('index.html') ? 'text-terracotta active' : 'text-coffee-800'}">Главная</a>
                        <a href="menu.html" class="nav-link text-sm font-bold uppercase tracking-widest ${currentPath.includes('menu.html') ? 'text-terracotta active' : 'text-coffee-800'}">Меню и Бронь</a>
                        <a href="news.html" class="nav-link text-sm font-bold uppercase tracking-widest ${currentPath.includes('news.html') ? 'text-terracotta active' : 'text-coffee-800'}">Новости</a>
                        <a href="index.html#contacts" class="nav-link text-sm font-bold uppercase tracking-widest text-coffee-800">Контакты</a>
                    </div>

                    <div class="hidden md:flex items-center space-x-6">
                        <button id="user-btn" class="p-2 text-coffee-800 hover:text-terracotta transition-all relative">
                            <i class="far fa-user text-xl"></i>
                        </button>
                        <button id="cart-btn" class="p-2 text-coffee-800 hover:text-terracotta transition-all relative">
                            <i class="fas fa-shopping-bag text-xl"></i>
                            <span id="cart-count" class="absolute top-0 right-0 bg-terracotta text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white hidden">0</span>
                        </button>
                    </div>

                    <div class="md:hidden flex items-center gap-5">
                        <button id="mobile-cart-btn" class="text-coffee-800 relative">
                            <i class="fas fa-shopping-bag text-2xl"></i>
                            <span id="mobile-cart-count" class="absolute -top-2 -right-2 bg-terracotta text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white hidden">0</span>
                        </button>
                        <button id="mobile-user-btn" class="text-coffee-800">
                            <i class="far fa-user text-2xl"></i>
                        </button>
                        <button id="mobile-menu-btn" class="text-coffee-800">
                            <i class="fas fa-bars-staggered text-2xl"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <div id="mobile-menu" class="md:hidden hidden bg-white/95 backdrop-blur-xl absolute w-full left-0 top-full border-t border-coffee-100 shadow-2xl">
                <div class="px-6 py-8 space-y-4">
                    <a href="index.html" class="block text-xl font-bold text-coffee-900">Главная</a>
                    <a href="menu.html" class="block text-xl font-bold text-coffee-900">Меню и Бронь</a>
                    <a href="news.html" class="block text-xl font-bold text-coffee-900">Новости</a>
                    <a href="index.html#contacts" class="block text-xl font-bold text-coffee-900">Контакты</a>
                    <hr class="border-coffee-100">
                    <a href="auth.html" class="block text-xl font-bold text-terracotta">Войти</a>
                </div>
            </div>
        </nav>
    `,
    footer: `
        <footer class="bg-coffee-950 text-white py-12 border-t border-white/5 mt-auto">
            <div class="max-w-7xl mx-auto px-6 text-center">
                <p class="text-white/40 text-xs font-bold uppercase tracking-[0.4em] mb-4">© 2026 Why Not Coffee</p>
                <p class="text-white/60 text-sm">Дипломный проект</p>
                <div class="mt-4">
                    <a href="admin.html" class="text-white/20 hover:text-white/50 text-[10px]">Панель администратора</a>
                </div>
            </div>
        </footer>
    `,
    chatWidget: `
        <div id="chat-container" class="fixed bottom-6 left-6 z-[9999]">
            <!-- Chat Trigger -->
            <button id="chat-toggle" class="w-14 h-14 bg-terracotta text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                <i class="fas fa-comments text-2xl"></i>
                <span id="chat-badge" class="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full border-2 border-white hidden"></span>
            </button>

            <!-- Chat Window -->
            <div id="chat-window" class="absolute bottom-20 left-0 w-[350px] h-[500px] bg-white rounded-[2rem] shadow-3xl overflow-hidden hidden flex flex-col border border-coffee-100 animate-slide-up">
                <div class="p-6 bg-coffee-900 text-white flex justify-between items-center">
                    <div>
                        <h4 class="font-bold">Поддержка</h4>
                        <p class="text-[10px] text-coffee-300 opacity-80">Мы на связи с 08:00 до 22:00</p>
                    </div>
                    <button id="close-chat" class="opacity-50 hover:opacity-100 transition-opacity"><i class="fas fa-times"></i></button>
                </div>
                
                <div id="chat-messages" class="flex-grow p-6 overflow-y-auto bg-coffee-50/50 space-y-4"></div>

                <div class="p-4 border-t border-coffee-100 bg-white">
                    <form id="chat-form" class="flex gap-2">
                        <input type="text" id="chat-input" placeholder="Введите сообщение..." class="flex-grow bg-coffee-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-terracotta outline-none">
                        <button type="submit" class="w-10 h-10 bg-terracotta text-white rounded-xl flex items-center justify-center hover:bg-terracotta-600 transition-all"><i class="fas fa-paper-plane text-sm"></i></button>
                    </form>
                </div>
            </div>
        </div>
    `,
    yandexMap: (heightClass = 'h-[450px]') => `
        <div class="space-y-4">
            <div class="${heightClass} rounded-[3rem] overflow-hidden border-[12px] border-coffee-50 shadow-sm">
                <iframe
                    src="${getYandexMapEmbedUrl()}"
                    width="100%"
                    height="100%"
                    frameborder="0"
                    allowfullscreen
                    loading="lazy"
                    title="Кофейня «Почему Нет?» на карте — ${CAFE_LOCATION.shortAddress}"
                ></iframe>
            </div>
            <div class="flex flex-wrap gap-3 justify-center lg:justify-start">
                <a href="${CAFE_LOCATION.yandexUrl}" target="_blank" rel="noopener noreferrer"
                   class="inline-flex items-center gap-2 text-sm font-bold text-coffee-700 hover:text-terracotta transition-colors">
                    <i class="fas fa-map-marker-alt"></i> Открыть в Яндекс Картах
                </a>
                <a href="${CAFE_LOCATION.yandexRouteUrl}" target="_blank" rel="noopener noreferrer"
                   class="inline-flex items-center gap-2 text-sm font-bold text-coffee-700 hover:text-terracotta transition-colors">
                    <i class="fas fa-route"></i> Построить маршрут
                </a>
            </div>
        </div>
    `,
    cartOverlay: `
        <div id="cart-overlay" class="fixed inset-0 bg-coffee-900/60 backdrop-blur-sm z-[1000] modal-overlay">
            <div id="cart-modal" class="absolute right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl slide-over flex flex-col">
                <div class="p-8 border-b border-coffee-100 flex justify-between items-center bg-coffee-50/50">
                    <h3 class="text-3xl font-serif font-bold text-coffee-900">Твой заказ</h3>
                    <button id="close-cart" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-coffee-100 transition-all"><i class="fas fa-times text-xl"></i></button>
                </div>
                <div id="cart-items" class="p-8 flex-grow overflow-y-auto"></div>
                <div class="p-8 border-t border-coffee-100 bg-coffee-50/80 backdrop-blur-md">
                    <div class="flex justify-between items-end mb-8">
                        <span class="text-coffee-400 font-bold uppercase tracking-widest text-xs">Всего к оплате:</span>
                        <span id="cart-total" class="text-4xl font-serif font-bold text-terracotta">0 ₽</span>
                    </div>
                    <div class="mb-6 space-y-2">
                        <label class="text-[10px] font-bold uppercase tracking-widest text-coffee-400 ml-1">Способ получения</label>
                        <select id="order-type" class="w-full bg-white border border-coffee-100 rounded-xl p-4 outline-none">
                            <option value="here">В заведении</option>
                            <option value="togo">С собой</option>
                        </select>
                    </div>
                    <button id="checkout-btn" class="w-full bg-coffee-900 text-white font-bold py-5 rounded-2xl hover:bg-coffee-800 transition-all shadow-xl flex items-center justify-center gap-3">Оформить заказ <i class="fas fa-arrow-right text-xs"></i></button>
                </div>
            </div>
        </div>
    `
};

document.addEventListener('DOMContentLoaded', () => {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');
    const chatPlaceholder = document.getElementById('chat-placeholder');
    const cartPlaceholder = document.getElementById('cart-placeholder');
    const mapPlaceholder = document.getElementById('map-placeholder');

    if (headerPlaceholder) headerPlaceholder.innerHTML = components.header(window.location.pathname);
    if (footerPlaceholder) footerPlaceholder.innerHTML = components.footer;
    if (chatPlaceholder) chatPlaceholder.innerHTML = components.chatWidget;
    if (cartPlaceholder) cartPlaceholder.innerHTML = components.cartOverlay;
    if (mapPlaceholder) mapPlaceholder.innerHTML = components.yandexMap(mapPlaceholder.dataset.height || 'h-[450px]');

    // Common nav behavior (user btn)
    const userBtn = document.getElementById('user-btn');
    if (userBtn) {
        userBtn.addEventListener('click', () => {
            const user = JSON.parse(localStorage.getItem('coffee_user'));
            window.location.href = user ? 'profile.html' : 'auth.html';
        });
    }

    const mobileUserBtn = document.getElementById('mobile-user-btn');
    if (mobileUserBtn) {
        mobileUserBtn.addEventListener('click', () => {
            const user = JSON.parse(localStorage.getItem('coffee_user'));
            window.location.href = user ? 'profile.html' : 'auth.html';
        });
    }

    // Sticky nav effect
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('nav');
        if (nav) {
            nav.classList.toggle('py-2', window.scrollY > 50);
            nav.classList.toggle('shadow-xl', window.scrollY > 50);
        }
    });

    // Mobile Menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
});
