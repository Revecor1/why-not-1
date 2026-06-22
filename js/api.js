/**
 * js/api.js
 * Единый модуль для работы с Django REST API.
 * Автоматически получает CSRF-токен и прикрепляет его к каждому запросу.
 */

function resolveApiBase() {
    const { protocol, hostname, port, origin } = window.location;
    // Фронт и API на одном сервере Django (:8000)
    if (port === '8000' || port === '') {
        return `${origin}/api`;
    }
    // Отдельный статический сервер (3000, 5500 и т.д.)
    const host = hostname || '127.0.0.1';
    return `${protocol}//${host}:8000/api`;
}

const API_BASE = resolveApiBase();

const api = {
    _csrfToken: null,

    async init() {
        try {
            const data = await this._rawFetch('/csrf/', { method: 'GET' });
            this._csrfToken = data.csrfToken;
        } catch (e) {
            console.warn('Сервер недоступен. Работаем в офлайн-режиме.');
        }
    },

    async _rawFetch(endpoint, options = {}) {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this._csrfToken || '',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            let message;
            if (err.error) message = err.error;
            else if (typeof err.detail === 'string') message = err.detail;
            else {
                const fieldMsg = Object.entries(err)
                    .filter(([key]) => key !== 'detail')
                    .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
                    .join('; ');
                message = fieldMsg || `Ошибка ${response.status}`;
            }
            const error = new Error(message);
            error.status = response.status;
            throw error;
        }

        if (response.status === 204) return null;
        return response.json();
    },

    async fetch(endpoint, options = {}) {
        await this.ready;
        try {
            return await this._rawFetch(endpoint, options);
        } catch (e) {
            const isMutation = options.method && options.method !== 'GET';
            if (e.status === 403 && isMutation) {
                await this.init();
                return this._rawFetch(endpoint, options);
            }
            throw e;
        }
    },

    isAuthError(err) {
        return err?.status === 401 || err?.status === 403 ||
            (err?.message && (
                err.message.includes('Not authenticated') ||
                err.message.includes('Ошибка 401') ||
                err.message.includes('Ошибка 403')
            ));
    },

    login(username, password) {
        return this.fetch('/auth/login/', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    },
    register(username, email, password) {
        return this.fetch('/auth/register/', {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
        });
    },
    logout() {
        return this.fetch('/auth/logout/', { method: 'POST' });
    },
    getCurrentUser() {
        return this.fetch('/auth/me/');
    },

    getMenu() {
        return this.fetch('/menu/');
    },

    getOrders() {
        return this.fetch('/orders/');
    },
    createOrder(data) {
        return this.fetch('/orders/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    completeOrder(id) {
        return this.fetch(`/orders/${id}/complete/`, { method: 'POST' });
    },

    getReservations() {
        return this.fetch('/reservations/');
    },
    createReservation(data) {
        return this.fetch('/reservations/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    deleteReservation(id) {
        return this.fetch(`/reservations/${id}/`, { method: 'DELETE' });
    },

    getMyChat() {
        return this.fetch('/chats/');
    },
    getAllChats(email = '') {
        const q = email ? `?email=${encodeURIComponent(email)}` : '';
        return this.fetch(`/chats/${q}`);
    },
    sendMessage(text) {
        return this.fetch('/chats/', {
            method: 'POST',
            body: JSON.stringify({ text }),
        });
    },
    adminReply(text, targetEmail) {
        return this.fetch('/chats/', {
            method: 'POST',
            body: JSON.stringify({ text, target_email: targetEmail }),
        });
    },

    getNews() {
        return this.fetch('/news/');
    },
    createNews(data) {
        return this.fetch('/news/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    updateNews(id, data) {
        return this.fetch(`/news/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },
    deleteNews(id) {
        return this.fetch(`/news/${id}/`, { method: 'DELETE' });
    },
};

api.ready = api.init();