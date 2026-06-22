/**
 * js/admin.js — Панель администратора (работает через API).
 */
document.addEventListener('DOMContentLoaded', async () => {
    let activeChatEmail = null;

    const toastContainer = document.getElementById('toast-container');

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `px-5 py-4 rounded-2xl shadow-xl text-white font-bold text-sm flex items-center gap-3 mb-3 ${type === 'success' ? 'bg-coffee-800' : 'bg-red-500'}`;
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    }

    if (typeof api === 'undefined') {
        showToast('Ошибка: не загружен js/api.js. Обновите страницу (Ctrl+F5).', 'error');
        return;
    }

    await api.ready;

    const loginOverlay = document.getElementById('admin-login-overlay');
    const dashboard = document.getElementById('admin-dashboard');
    const loginForm = document.getElementById('admin-login-form');
    const navBtns = document.querySelectorAll('.admin-nav-btn');
    const sections = document.querySelectorAll('.admin-section');
    const ordersList = document.getElementById('admin-orders-list');
    const resTable = document.getElementById('admin-reservations-table');
    const chatList = document.getElementById('admin-chat-list');
    const chatMessages = document.getElementById('admin-chat-messages');
    const chatForm = document.getElementById('admin-chat-form');
    const chatInput = document.getElementById('admin-chat-input');
    const chatHeader = document.getElementById('admin-chat-header');
    const newsList = document.getElementById('admin-news-list');
    const newsFormWrap = document.getElementById('admin-news-form-wrap');
    const newsForm = document.getElementById('admin-news-form');
    const newsFormTitle = document.getElementById('admin-news-form-title');

    function showDashboard() {
        loginOverlay.style.display = 'none';
        dashboard.classList.remove('hidden');
        dashboard.classList.add('flex');
        init();
    }

    async function restoreSession() {
        try {
            const user = await api.getCurrentUser();
            if (!user.is_staff) {
                await api.logout();
                localStorage.removeItem('coffee_user');
                return;
            }
            localStorage.setItem('coffee_user', JSON.stringify(user));
            showDashboard();
        } catch {
            localStorage.removeItem('coffee_user');
        }
    }

    restoreSession();

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pass = document.getElementById('admin-pass').value;
        try {
            const user = await api.login('admin', pass);
            if (!user.is_staff) {
                await api.logout();
                showToast('Доступ только для администраторов', 'error');
                return;
            }
            localStorage.setItem('coffee_user', JSON.stringify(user));
            showDashboard();
        } catch (err) {
            const msg = err.message || 'Неизвестная ошибка';
            if (msg.includes('Неверный логин') || msg.includes('401')) {
                showToast('Неверный пароль', 'error');
            } else if (msg.includes('Failed to fetch') || msg.includes('Сервер недоступен')) {
                showToast('Сервер не запущен. Запустите start.bat', 'error');
            } else {
                showToast('Ошибка входа: ' + msg, 'error');
            }
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
                if (btn.dataset.target === 'news') loadNews();
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
                    try {
                        await api.deleteReservation(btn.dataset.id);
                        showToast('Бронирование удалено');
                        loadReservations();
                    } catch (err) {
                        showToast('Ошибка: ' + err.message, 'error');
                    }
                });
            });
        } catch (err) {
            resTable.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-red-400 text-center">${err.message}</td></tr>`;
        }
    }

    // ---- News ----
    function parseTagsInput(raw) {
        return raw.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
            const [icon, ...rest] = line.split('|');
            const text = rest.join('|').trim();
            return { icon: (icon || 'fas fa-tag').trim(), text };
        }).filter(t => t.text);
    }

    function formatTagsForInput(tags) {
        return (tags || []).map(t => `${t.icon || 'fas fa-tag'} | ${t.text}`).join('\n');
    }

    function resetNewsForm() {
        document.getElementById('news-edit-id').value = '';
        newsForm.reset();
        document.getElementById('news-badge').value = 'Акция';
        document.getElementById('news-sort-order').value = '0';
        document.getElementById('news-is-published').checked = true;
        newsFormTitle.textContent = 'Новая новость';
    }

    function showNewsForm(item = null) {
        resetNewsForm();
        if (item) {
            document.getElementById('news-edit-id').value = item.id;
            document.getElementById('news-title').value = item.title;
            document.getElementById('news-period').value = item.period;
            document.getElementById('news-body').value = item.body;
            document.getElementById('news-image').value = item.image;
            document.getElementById('news-badge').value = item.badge;
            document.getElementById('news-badge-style').value = item.badge_style;
            document.getElementById('news-sort-order').value = item.sort_order;
            document.getElementById('news-tags').value = formatTagsForInput(item.tags);
            document.getElementById('news-footer-note').value = item.footer_note || '';
            document.getElementById('news-link-url').value = item.link_url || '';
            document.getElementById('news-link-text').value = item.link_text || '';
            document.getElementById('news-is-published').checked = item.is_published;
            newsFormTitle.textContent = 'Редактирование новости';
        }
        newsFormWrap.classList.remove('hidden');
        newsFormWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function hideNewsForm() {
        newsFormWrap.classList.add('hidden');
        resetNewsForm();
    }

    document.getElementById('admin-news-add-btn').addEventListener('click', () => showNewsForm());
    document.getElementById('admin-news-cancel-btn').addEventListener('click', hideNewsForm);

    newsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = document.getElementById('news-edit-id').value;
        const data = {
            title: document.getElementById('news-title').value.trim(),
            period: document.getElementById('news-period').value.trim(),
            body: document.getElementById('news-body').value.trim(),
            image: document.getElementById('news-image').value.trim(),
            badge: document.getElementById('news-badge').value.trim() || 'Акция',
            badge_style: document.getElementById('news-badge-style').value,
            sort_order: parseInt(document.getElementById('news-sort-order').value, 10) || 0,
            tags: parseTagsInput(document.getElementById('news-tags').value),
            footer_note: document.getElementById('news-footer-note').value.trim(),
            link_url: document.getElementById('news-link-url').value.trim(),
            link_text: document.getElementById('news-link-text').value.trim(),
            is_published: document.getElementById('news-is-published').checked,
        };

        try {
            if (editId) {
                await api.updateNews(editId, data);
                showToast('Новость обновлена');
            } else {
                await api.createNews(data);
                showToast('Новость создана');
            }
            hideNewsForm();
            loadNews();
        } catch (err) {
            showToast('Ошибка: ' + err.message, 'error');
        }
    });

    async function loadNews() {
        try {
            const news = await api.getNews();
            newsList.innerHTML = '';

            if (news.length === 0) {
                newsList.innerHTML = '<p class="text-gray-400 py-10 text-center bg-white rounded-3xl border border-gray-200">Новостей пока нет. Добавьте первую!</p>';
                return;
            }

            news.forEach(item => {
                const card = document.createElement('div');
                card.className = `bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col sm:flex-row ${item.is_published ? '' : 'opacity-60'}`;
                card.innerHTML = `
                    <div class="sm:w-48 h-32 sm:h-auto flex-shrink-0">
                        <img src="${item.image}" alt="" class="w-full h-full object-cover">
                    </div>
                    <div class="flex-grow p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div class="flex-grow min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${item.badge_style === 'green' ? 'bg-green-100 text-green-700' : item.badge_style === 'dark' ? 'bg-coffee-100 text-coffee-800' : 'bg-orange-100 text-orange-700'}">${item.badge}</span>
                                ${!item.is_published ? '<span class="text-[10px] font-bold uppercase text-red-400">Скрыта</span>' : ''}
                            </div>
                            <h4 class="font-bold text-lg truncate">${item.title}</h4>
                            <p class="text-xs text-gray-400">${item.period}</p>
                        </div>
                        <div class="flex gap-2 flex-shrink-0">
                            <button class="edit-news-btn px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold transition-all" data-id="${item.id}">
                                <i class="fas fa-pen text-xs"></i>
                            </button>
                            <button class="toggle-news-btn px-4 py-2 rounded-xl text-sm font-bold transition-all ${item.is_published ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' : 'bg-green-100 hover:bg-green-200 text-green-700'}" data-id="${item.id}" data-published="${item.is_published}">
                                <i class="fas ${item.is_published ? 'fa-eye-slash' : 'fa-eye'} text-xs"></i>
                            </button>
                            <button class="delete-news-btn px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-sm font-bold transition-all" data-id="${item.id}">
                                <i class="fas fa-trash text-xs"></i>
                            </button>
                        </div>
                    </div>
                `;
                newsList.appendChild(card);
            });

            news.forEach(item => {
                newsList.querySelector(`.edit-news-btn[data-id="${item.id}"]`)?.addEventListener('click', () => showNewsForm(item));
            });

            document.querySelectorAll('.toggle-news-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const published = btn.dataset.published === 'true';
                    try {
                        await api.updateNews(btn.dataset.id, { is_published: !published });
                        showToast(published ? 'Новость скрыта' : 'Новость опубликована');
                        loadNews();
                    } catch (err) {
                        showToast('Ошибка: ' + err.message, 'error');
                    }
                });
            });

            document.querySelectorAll('.delete-news-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('Удалить новость?')) return;
                    try {
                        await api.deleteNews(btn.dataset.id);
                        showToast('Новость удалена');
                        loadNews();
                    } catch (err) {
                        showToast('Ошибка: ' + err.message, 'error');
                    }
                });
            });
        } catch (err) {
            newsList.innerHTML = `<p class="text-red-400 py-10 text-center">${err.message}</p>`;
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

                const header = document.createElement('div');
                header.className = 'flex justify-between items-center mb-1';
                const emailSpan = document.createElement('span');
                emailSpan.className = `font-bold text-xs truncate max-w-[150px] ${hasUnread ? 'text-coffee-900' : 'text-gray-500'}`;
                emailSpan.textContent = email;
                header.appendChild(emailSpan);
                if (hasUnread) {
                    const dot = document.createElement('span');
                    dot.className = 'w-2 h-2 bg-terracotta rounded-full';
                    header.appendChild(dot);
                }

                const preview = document.createElement('p');
                preview.className = 'text-[10px] text-gray-400 truncate';
                preview.textContent = `${last.sender === 'admin' ? '← ' : '→ '}${last.text}`;

                div.appendChild(header);
                div.appendChild(preview);
                div.addEventListener('click', () => selectChat(email, msgs));
                chatList.appendChild(div);
            });
        } catch (err) {
            chatList.innerHTML = `<p class="p-4 text-red-400 text-sm">${err.message}</p>`;
        }
    }

    function selectChat(email, messages) {
        activeChatEmail = email;
        chatHeader.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.className = 'flex items-center gap-3';
        const avatar = document.createElement('div');
        avatar.className = 'w-9 h-9 bg-coffee-100 rounded-full flex items-center justify-center text-coffee-800 font-bold text-sm';
        avatar.textContent = email[0].toUpperCase();
        const info = document.createElement('div');
        const title = document.createElement('h4');
        title.className = 'font-bold text-gray-900 text-sm';
        title.textContent = email;
        const status = document.createElement('span');
        status.className = 'text-[10px] text-green-500 font-bold uppercase tracking-widest';
        status.textContent = 'Онлайн';
        info.appendChild(title);
        info.appendChild(status);
        wrap.appendChild(avatar);
        wrap.appendChild(info);
        chatHeader.appendChild(wrap);
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

            const bubble = document.createElement('div');
            bubble.className = `max-w-[70%] ${isAdmin ? 'bg-coffee-900 text-white' : 'bg-gray-100 text-gray-800'} px-4 py-3 rounded-2xl ${isAdmin ? 'rounded-br-sm' : 'rounded-bl-sm'} text-sm shadow-sm`;

            const textEl = document.createElement('p');
            textEl.textContent = msg.text;
            bubble.appendChild(textEl);

            const timeEl = document.createElement('p');
            timeEl.className = 'text-[9px] opacity-40 mt-1 text-right';
            timeEl.textContent = new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            bubble.appendChild(timeEl);

            div.appendChild(bubble);
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
});
