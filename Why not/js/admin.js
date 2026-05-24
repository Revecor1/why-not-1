/**
 * js/admin.js — Панель администратора (работает через API).
 */
document.addEventListener('DOMContentLoaded', () => {
    let activeChatEmail = null;

    const loginOverlay = document.getElementById('admin-login-overlay');
    const dashboard = document.getElementById('admin-dashboard');
    const loginForm = document.getElementById('admin-login-form');
    const navBtns = document.querySelectorAll('.admin-nav-btn');
    const sections = document.querySelectorAll('.admin-section');
    const toastContainer = document.getElementById('toast-container');
    const ordersList = document.getElementById('admin-orders-list');
    const resTable = document.getElementById('admin-reservations-table');
    const chatList = document.getElementById('admin-chat-list');
    const chatMessages = document.getElementById('admin-chat-messages');
    const chatForm = document.getElementById('admin-chat-form');
    const chatInput = document.getElementById('admin-chat-input');
    const chatHeader = document.getElementById('admin-chat-header');

    // ---- Admin Login ----
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pass = document.getElementById('admin-pass').value;
        try {
            // Используем аккаунт администратора Django
            const user = await api.login('admin', pass);
            localStorage.setItem('coffee_user', JSON.stringify(user));
            loginOverlay.style.display = 'none';
            dashboard.classList.remove('hidden');
            dashboard.classList.add('flex');
            init();
        } catch (err) {
            showToast('Неверный пароль: ' + err.message, 'error');
        }
    });

    document.getElementById('admin-logout').addEventListener('click', async () => {
        await api.logout();
        localStorage.removeItem('coffee_user');
        location.reload();
    });

    // ---- Init ----
    function init() {
        setupNav();
        loadOrders();
        // Polling каждые 10 секунд
        setInterval(() => {
            const activeSection = document.querySelector('.admin-section:not(.hidden)');
            if (activeSection?.id === 'admin-content-orders') loadOrders();
            if (activeSection?.id === 'admin-content-reservations') loadReservations();
            if (activeSection?.id === 'admin-content-chats') loadChatList();
        }, 10000);
    }

    function setupNav() {
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                navBtns.forEach(b => {
                    b.classList.remove('bg-white/10', 'text-white');
                    b.classList.add('text-white/60');
                });
                btn.classList.add('bg-white/10', 'text-white');
                btn.classList.remove('text-white/60');

                sections.forEach(s => s.classList.add('hidden'));
                document.getElementById(`admin-content-${btn.dataset.target}`).classList.remove('hidden');

                if (btn.dataset.target === 'orders') loadOrders();
                if (btn.dataset.target === 'reservations') loadReservations();
                if (btn.dataset.target === 'chats') loadChatList();
            });
        });
    }

    // ---- Orders ----
    async function loadOrders() {
        try {
            const orders = await api.getOrders();
            ordersList.innerHTML = '';

            if (orders.length === 0) {
                ordersList.innerHTML = '<p class="text-gray-400 col-span-2 py-10 text-center">Заказов пока нет</p>';
                return;
            }

            const badge = (completed) => completed
                ? '<span class="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold uppercase">Выполнен</span>'
                : '<span class="text-[10px] bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold uppercase animate-pulse">В работе</span>';

            orders.forEach(order => {
                const card = document.createElement('div');
                card.className = 'bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col gap-4';
                card.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Заказ #${order.id}</p>
                            <h4 class="font-bold text-lg">${order.user_email}</h4>
                            <p class="text-xs text-gray-400">${new Date(order.date).toLocaleString('ru-RU')}</p>
                        </div>
                        <div id="badge-${order.id}">${badge(order.is_completed)}</div>
                    </div>
                    <div class="space-y-1 bg-gray-50 rounded-2xl p-4">
                        ${order.items.map(i => `
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-700">${i.name} <span class="text-gray-400">×${i.quantity}</span></span>
                                <span class="font-bold">${i.price * i.quantity} ₽</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span class="text-xs text-gray-500">${order.order_type === 'here' ? '🪑 В заведении' : '🛍 С собой'}</span>
                        <span class="text-2xl font-serif font-bold text-terracotta">${order.total} ₽</span>
                    </div>
                    ${!order.is_completed ? `
                    <button class="complete-btn w-full py-3 bg-coffee-900 hover:bg-green-600 text-white rounded-xl font-bold transition-all text-sm" data-id="${order.id}">
                        ✓ Отметить как выполненный
                    </button>` : ''}
                `;
                ordersList.appendChild(card);
            });

            document.querySelectorAll('.complete-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    btn.disabled = true;
                    btn.textContent = 'Сохранение...';
                    try {
                        await api.completeOrder(btn.dataset.id);
                        showToast('Заказ выполнен!');
                        loadOrders();
                    } catch (err) {
                        showToast('Ошибка: ' + err.message, 'error');
                    }
                });
            });
        } catch (err) {
            ordersList.innerHTML = `<p class="text-red-400 col-span-2 py-10 text-center">Ошибка загрузки: ${err.message}</p>`;
        }
    }

    // ---- Reservations ----
    async function loadReservations() {
        try {
            const reservations = await api.getReservations();
            resTable.innerHTML = '';

            if (reservations.length === 0) {
                resTable.innerHTML = '<tr><td colspan="5" class="px-6 py-10 text-center text-gray-400">Бронирований нет</td></tr>';
                return;
            }

            reservations.forEach(res => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50 transition-colors';
                row.innerHTML = `
                    <td class="px-6 py-4 font-bold text-sm">${res.date}<br><span class="text-xs text-gray-400 font-normal">${res.time}</span></td>
                    <td class="px-6 py-4 text-sm">${res.name}<br><span class="text-[10px] text-gray-400">${res.user_email || ''}</span></td>
                    <td class="px-6 py-4 text-sm text-center font-bold">${res.guests}</td>
                    <td class="px-6 py-4 text-sm">${res.phone}</td>
                    <td class="px-6 py-4 text-right">
                        <button class="delete-res-btn text-red-400 hover:text-red-600 transition-colors px-3 py-1 rounded-lg hover:bg-red-50" data-id="${res.id}">
                            <i class="fas fa-trash text-xs"></i>
                        </button>
                    </td>
                `;
                resTable.appendChild(row);
            });

            document.querySelectorAll('.delete-res-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('Удалить бронирование?')) return;
                    await api.deleteReservation(btn.dataset.id);
                    showToast('Бронирование удалено');
                    loadReservations();
                });
            });
        } catch (err) {
            resTable.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-red-400 text-center">${err.message}</td></tr>`;
        }
    }

    // ---- Chat ----
    async function loadChatList() {
        try {
            const allMessages = await api.getAllChats();
            chatList.innerHTML = '';

            // Группируем по user_email
            const groups = {};
            allMessages.forEach(m => {
                if (!groups[m.user_email]) groups[m.user_email] = [];
                groups[m.user_email].push(m);
            });

            if (Object.keys(groups).length === 0) {
                chatList.innerHTML = '<p class="p-6 text-center text-gray-400 text-sm">Сообщений пока нет</p>';
                return;
            }

            Object.entries(groups).forEach(([email, msgs]) => {
                const last = msgs[msgs.length - 1];
                const hasUnread = last.sender === 'user';
                const div = document.createElement('div');
                div.className = `p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-all ${activeChatEmail === email ? 'bg-coffee-50 border-l-4 border-terracotta pl-3' : ''}`;
                div.innerHTML = `
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-bold text-xs truncate max-w-[150px] ${hasUnread ? 'text-coffee-900' : 'text-gray-500'}">${email}</span>
                        ${hasUnread ? '<span class="w-2 h-2 bg-terracotta rounded-full"></span>' : ''}
                    </div>
                    <p class="text-[10px] text-gray-400 truncate">${last.sender === 'admin' ? '← ' : '→ '}${last.text}</p>
                `;
                div.addEventListener('click', () => selectChat(email, msgs));
                chatList.appendChild(div);
            });
        } catch (err) {
            chatList.innerHTML = `<p class="p-4 text-red-400 text-sm">${err.message}</p>`;
        }
    }

    function selectChat(email, messages) {
        activeChatEmail = email;
        chatHeader.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-coffee-100 rounded-full flex items-center justify-center text-coffee-800 font-bold text-sm">${email[0].toUpperCase()}</div>
                <div>
                    <h4 class="font-bold text-gray-900 text-sm">${email}</h4>
                    <span class="text-[10px] text-green-500 font-bold uppercase tracking-widest">Онлайн</span>
                </div>
            </div>
        `;
        chatForm.classList.remove('hidden');
        renderChatMessages(messages);
        loadChatList(); // обновляем список для сброса индикатора
    }

    function renderChatMessages(messages) {
        chatMessages.innerHTML = '';
        messages.forEach(msg => {
            const isAdmin = msg.sender === 'admin';
            const div = document.createElement('div');
            div.className = `flex ${isAdmin ? 'justify-end' : 'justify-start'}`;
            div.innerHTML = `
                <div class="max-w-[70%] ${isAdmin ? 'bg-coffee-900 text-white' : 'bg-gray-100 text-gray-800'} px-4 py-3 rounded-2xl ${isAdmin ? 'rounded-br-sm' : 'rounded-bl-sm'} text-sm shadow-sm">
                    <p>${msg.text}</p>
                    <p class="text-[9px] opacity-40 mt-1 text-right">${new Date(msg.timestamp).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}</p>
                </div>
            `;
            chatMessages.appendChild(div);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text || !activeChatEmail) return;
        try {
            await api.adminReply(text, activeChatEmail);
            chatInput.value = '';
            const msgs = await api.getAllChats(activeChatEmail);
            renderChatMessages(msgs);
            loadChatList();
        } catch (err) {
            showToast('Ошибка: ' + err.message, 'error');
        }
    });

    // ---- Toast ----
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `px-5 py-4 rounded-2xl shadow-xl text-white font-bold text-sm flex items-center gap-3 mb-3 ${type === 'success' ? 'bg-coffee-800' : 'bg-red-500'}`;
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    }
});
