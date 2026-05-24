// Финальная логика для минималистичного макета Revecor Store

document.addEventListener('DOMContentLoaded', () => {
    // Интерактив для переключателя регионов
    const regionToggle = document.getElementById('region-toggle');
    const regions = [
        { name: 'Турция', flag: '🇹🇷' },
        { name: 'Индия', flag: '🇮🇳' }
    ];
    let currentRegionIndex = 0;

    if (regionToggle) {
        regionToggle.addEventListener('click', () => {
            currentRegionIndex = (currentRegionIndex + 1) % regions.length;
            const region = regions[currentRegionIndex];
            
            regionToggle.querySelector('.flag').textContent = region.flag;
            regionToggle.querySelector('.region-label').textContent = region.name;
            
            // Анимация нажатия
            regionToggle.style.transform = 'scale(0.95)';
            setTimeout(() => {
                regionToggle.style.transform = 'scale(1)';
            }, 100);
        });
    }

    // Симуляция добавления в корзину
    const buyButtons = document.querySelectorAll('.add-btn');
    const cartCount = document.querySelector('.cart-count');
    let count = 0;

    buyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            count++;
            if (cartCount) cartCount.textContent = count;
            
            // Визуальная обратная связь
            btn.classList.add('active');
            btn.textContent = '✓';
            
            // Эффект встряхивания корзины
            const cartPill = document.querySelector('.cart-pill');
            if (cartPill) {
                cartPill.style.transform = 'scale(1.15)';
                setTimeout(() => cartPill.style.transform = '', 200);
            }
            
            setTimeout(() => {
                btn.classList.remove('active');
                btn.textContent = '+';
            }, 1000);
        });
    });

    // Плавное появление блоков при скролле (опционально, так как уже есть CSS анимации)
    // Но можно добавить микро-взаимодействия при наведении мышью
    const blocks = document.querySelectorAll('.block');
    blocks.forEach(block => {
        block.addEventListener('mouseenter', () => {
            // Можно добавить дополнительные JS эффекты здесь
        });
    });
});
