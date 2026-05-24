/**
 * js/api.js
 * Единый модуль для работы с Django REST API.
 * Автоматически получает CSRF-токен и прикрепляет его к каждому запросу.
 */

const API_BASE = 'http://127.0.0.1:8000/api';

const api = {
    _csrfToken: null,

    /**
     * Инициализация: получаем CSRF-токен с сервера при загрузке страницы.
     */
    async init() {
        try {
            const data = await this._rawFetch('/csrf/', { method: 'GET' });
            this._csrfToken = data.csrfToken;
        } catch (e) {
            console.warn('Сервер недоступен. Работаем в офлайн-режиме.');
        }
    },

    /**
     * Базовый fetch с автоматическим CSRF и credentials.
     */
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
            throw new Error(err.error || err.detail || `Ошибка ${response.status}`);
        }

        // Для 204 No Content нет тела
        if (response.status === 204) return null;
        return response.json();
    },

    fetch(endpoint, options = {}) {
        return this._rawFetch(endpoint, options);
    },

    // ---- Auth ----
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

    // ---- Menu ----
    getMenu() {
        return this.fetch('/menu/');
    },

    // ---- Orders ----
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

    // ---- Reservations ----
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

    // ---- Chat ----
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
};

// Инициализируем API сразу при загрузке страницы
api.init();
