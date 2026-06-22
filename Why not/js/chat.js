/**
 * js/chat.js — виджет поддержки для клиентских страниц.
 */
document.addEventListener('DOMContentLoaded', async () => {
    await api.ready;

    const chatToggle = document.getElementById('chat-toggle');
    if (!chatToggle) return;

    const chatWindow = document.getElementById('chat-window');
    const closeChat = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const chatBadge = document.getElementById('chat-badge');

    let pollInterval = null;
    let lastMessageCount = 0;

    // ---- Toggle ----
    chatToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
        if (!chatWindow.classList.contains('hidden')) {
            chatBadge.classList.add('hidden');
            loadMessages();
            startPolling();
        } else {
            stopPolling();
        }
    });

    closeChat.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
        stopPolling();
    });

    // ---- Send ----
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        const user = JSON.parse(localStorage.getItem('coffee_user'));
        if (!user) {
            showAuthPrompt();
            return;
        }

        chatInput.value = '';

        try {
            await api.sendMessage(text);
            await loadMessages();
        } catch (err) {
            if (api.isAuthError(err)) {
                localStorage.removeItem('coffee_user');
                showAuthPrompt();
            } else {
                appendSystemMsg('Не удалось отправить сообщение. Попробуйте ещё раз.');
            }
        }
    });

    // ---- Messages ----
    async function loadMessages() {
        const user = JSON.parse(localStorage.getItem('coffee_user'));
        if (!user) {
            renderWelcome();
            return;
        }
        try {
            const messages = await api.getMyChat();
            renderMessages(messages);
            lastMessageCount = messages.length;
        } catch (err) {
            console.warn('Chat load error:', err.message);
        }
    }

    function renderMessages(messages) {
        chatMessages.innerHTML = '';
        if (messages.length === 0) {
            appendSystemMsg('Привет! Чем можем помочь? Отвечаем с 08:00 до 22:00.');
        }
        messages.forEach(msg => appendMessage(msg));
    }

    function appendMessage(msg) {
        const isUser = msg.sender === 'user';
        const div = document.createElement('div');
        div.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;

        const bubble = document.createElement('div');
        bubble.className = `max-w-[80%] ${isUser
            ? 'bg-terracotta text-white rounded-2xl rounded-br-sm'
            : 'bg-white border border-coffee-100 text-coffee-900 rounded-2xl rounded-bl-sm shadow-sm'
        } px-4 py-2.5 text-sm`;

        const textEl = document.createElement('p');
        textEl.textContent = msg.text;
        bubble.appendChild(textEl);

        const timeEl = document.createElement('p');
        timeEl.className = 'text-[9px] opacity-50 mt-1 text-right';
        timeEl.textContent = new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        bubble.appendChild(timeEl);

        div.appendChild(bubble);
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function appendSystemMsg(text) {
        const div = document.createElement('div');
        div.className = 'flex justify-start';
        const bubble = document.createElement('div');
        bubble.className = 'max-w-[85%] bg-white border border-coffee-100 rounded-2xl rounded-bl-sm shadow-sm px-4 py-2.5 text-sm text-coffee-700';
        const p = document.createElement('p');
        if (text.includes('<a ')) {
            p.innerHTML = text;
        } else {
            p.textContent = text;
        }
        bubble.appendChild(p);
        div.appendChild(bubble);
        chatMessages.appendChild(div);
    }

    function renderWelcome() {
        chatMessages.innerHTML = '';
        appendSystemMsg('Привет! Войдите в аккаунт, чтобы написать нам.');
    }

    function showAuthPrompt() {
        appendSystemMsg('Для отправки сообщений необходимо <a href="auth.html" class="text-terracotta font-bold underline">войти</a>.');
    }

    // ---- Polling (проверяем новые сообщения каждые 5 сек.) ----
    function startPolling() {
        if (pollInterval) return;
        pollInterval = setInterval(async () => {
            const user = JSON.parse(localStorage.getItem('coffee_user'));
            if (!user) return;
            try {
                const messages = await api.getMyChat();
                if (messages.length !== lastMessageCount) {
                    renderMessages(messages);
                    lastMessageCount = messages.length;

                    // Если окно закрыто — показываем бейдж
                    if (chatWindow.classList.contains('hidden')) {
                        chatBadge.classList.remove('hidden');
                    }
                }
            } catch (_) { /* ignore */ }
        }, 5000);
    }

    function stopPolling() {
        clearInterval(pollInterval);
        pollInterval = null;
    }

    // Инициализация
    loadMessages();
});
