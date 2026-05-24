/**
 * js/chat.js — виджет поддержки для клиентских страниц.
 */
document.addEventListener('DOMContentLoaded', () => {
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

        // Оптимистично добавляем сообщение
        appendMessage({ sender: 'user', text, timestamp: new Date().toISOString() });
        chatInput.value = '';

        try {
            await api.sendMessage(text);
        } catch (err) {
            if (err.message.includes('403') || err.message.includes('401')) {
                showAuthPrompt();
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
        // Приветственное сообщение
        appendSystemMsg('Привет! Чем можем помочь? Отвечаем с 08:00 до 22:00.');
        messages.forEach(msg => appendMessage(msg));
    }

    function appendMessage(msg) {
        const isUser = msg.sender === 'user';
        const div = document.createElement('div');
        div.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
        div.innerHTML = `
            <div class="max-w-[80%] ${isUser
                ? 'bg-terracotta text-white rounded-2xl rounded-br-sm'
                : 'bg-white border border-coffee-100 text-coffee-900 rounded-2xl rounded-bl-sm shadow-sm'
            } px-4 py-2.5 text-sm">
                <p>${msg.text}</p>
                <p class="text-[9px] opacity-50 mt-1 text-right">${new Date(msg.timestamp).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}</p>
            </div>
        `;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function appendSystemMsg(text) {
        const div = document.createElement('div');
        div.className = 'flex justify-start';
        div.innerHTML = `
            <div class="max-w-[85%] bg-white border border-coffee-100 rounded-2xl rounded-bl-sm shadow-sm px-4 py-2.5 text-sm text-coffee-700">
                <p>${text}</p>
            </div>
        `;
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
                if (messages.length > lastMessageCount) {
                    // Есть новые сообщения
                    const newMsgs = messages.slice(lastMessageCount);
                    newMsgs.forEach(m => appendMessage(m));
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
