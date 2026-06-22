/**
 * js/news.js — Загрузка и отображение новостей с API.
 */
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('news-list');
    if (!container) return;

    await api.ready;

    const BADGE_CLASSES = {
        terracotta: 'bg-terracotta',
        dark: 'bg-coffee-900',
        green: 'bg-green-600',
    };

    function renderNewsItem(item) {
        const badgeClass = BADGE_CLASSES[item.badge_style] || BADGE_CLASSES.terracotta;
        const tagsHtml = (item.tags || []).map(tag => `
            <span class="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-coffee-100 text-coffee-700">
                <i class="${tag.icon || 'fas fa-tag'} text-terracotta"></i> ${tag.text}
            </span>
        `).join('');

        const hasLink = item.link_url && item.link_text;
        const footerClass = hasLink
            ? 'mt-10 pt-8 border-t border-coffee-200 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between'
            : 'mt-10 pt-8 border-t border-coffee-200';

        const linkHtml = hasLink ? `
            <a href="${item.link_url}" class="btn-hover inline-flex items-center justify-center gap-2 bg-coffee-900 text-white font-bold py-4 px-8 rounded-2xl hover:bg-coffee-800 transition-all">
                ${item.link_text} <i class="fas fa-arrow-right text-xs"></i>
            </a>
        ` : '';

        const footerNote = item.footer_note
            ? `<p class="text-xs font-bold text-terracotta uppercase tracking-wider">${item.footer_note}</p>`
            : '';

        const article = document.createElement('article');
        article.className = 'news-card group bg-coffee-50 rounded-[3rem] overflow-hidden shadow-sm border border-coffee-100 hover:shadow-2xl transition-all duration-500';
        article.innerHTML = `
            <div class="h-64 md:h-80 overflow-hidden relative">
                <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                <span class="absolute top-6 left-6 ${badgeClass} text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full">${item.badge}</span>
            </div>
            <div class="p-10 md:p-14">
                <time class="text-[10px] font-bold uppercase tracking-widest text-coffee-400 mb-4 block">${item.period}</time>
                <h2 class="text-3xl md:text-5xl font-serif font-bold text-coffee-900 mb-6">${item.title}</h2>
                <p class="text-coffee-600 text-lg leading-relaxed mb-6">${item.body}</p>
                ${tagsHtml ? `<div class="flex flex-wrap gap-4 text-sm">${tagsHtml}</div>` : ''}
                <div class="${footerClass}">
                    ${footerNote}
                    ${linkHtml}
                </div>
            </div>
        `;
        return article;
    }

    try {
        const news = await api.getNews();
        container.innerHTML = '';

        if (!news.length) {
            container.innerHTML = '<p class="text-center text-coffee-400 py-16">Новостей пока нет. Загляните позже!</p>';
            return;
        }

        news.forEach(item => container.appendChild(renderNewsItem(item)));
    } catch (err) {
        container.innerHTML = `<p class="text-center text-red-400 py-16">Не удалось загрузить новости: ${err.message}</p>`;
    }
});