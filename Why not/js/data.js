// js/data.js
/**
 * Данные меню кофейни «Почему Нет?»
 * Категории: coffee, drinks, breakfasts, food, desserts
 */
const menuData = [
    // --- Кофе (Классика) ---
    { id: 1, category: 'coffee', name: 'Капучино', description: 'Классический эспрессо с нежной молочной пенкой. Идеальный баланс.', price: 250, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80' },
    { id: 2, category: 'coffee', name: 'Флэт Уайт', description: 'Двойной эспрессо с тонким слоем бархатистого молока.', price: 280, image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&q=80' },
    { id: 3, category: 'coffee', name: 'Американо', description: 'Классический черный кофе для тех, кто ценит чистоту вкуса.', price: 200, image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=500&q=80' },
    { id: 4, category: 'coffee', name: 'Латте Макиато', description: 'Трехслойный кофейный напиток с легким ароматом ванили.', price: 290, image: 'https://images.unsplash.com/photo-1599398054066-846f28917f38?w=500&q=80' },
    { id: 5, category: 'coffee', name: 'Эспрессо', description: 'Заряд бодрости в одной маленькой чашке.', price: 150, image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80' },

    // --- Авторские напитки ---
    { id: 6, category: 'drinks', name: 'Матча латте', description: 'Японский церемониальный чай матча с кокосовым молоком.', price: 300, image: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=500&q=80' },
    { id: 7, category: 'drinks', name: 'Лавандовый Раф', description: 'Нежнейший кофейно-сливочный десерт с цветами лаванды.', price: 320, image: 'https://images.unsplash.com/photo-1558562805-4bf1e2a724eb?w=500&q=80' },
    { id: 8, category: 'drinks', name: 'Бамбл-кофе', description: 'Освежающий микс эспрессо, апельсинового сока и карамели.', price: 310, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&q=80' },
    { id: 9, category: 'drinks', name: 'Айс-Латте Соленая Карамель', description: 'Холодный кофе с домашней карамелью и морской солью.', price: 330, image: 'https://images.unsplash.com/photo-1517701604599-bb24b5e50dd2?w=500&q=80' },
    { id: 10, category: 'drinks', name: 'Пряный Чай Латте', description: 'Черный чай со специями, медом и молоком. Глоток тепла.', price: 280, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80' },

    // --- Завтраки ---
    { id: 11, category: 'breakfasts', name: 'Завтрак с лососем', description: 'Слабосоленый лосось, яйцо пашот, авокадо, микс салата и тартин.', price: 650, image: 'https://images.unsplash.com/photo-1627844026364-70a2569de091?w=500&q=80' },
    { id: 12, category: 'breakfasts', name: 'Авокадо-тост с яйцом', description: 'Хрустящий цельнозерновой хлеб, гуакамоле, яйцо пашот.', price: 320, image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=500&q=80' },
    { id: 13, category: 'breakfasts', name: 'Сырники из фермерского творога', description: 'Подаются со сметаной и ягодным кули. Вкус как в детстве.', price: 340, image: 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=500&q=80' },
    { id: 14, category: 'breakfasts', name: 'Овсяная каша с карамелью', description: 'На молоке со свежими ягодами и кедровыми орешками.', price: 280, image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=500&q=80' },
    { id: 15, category: 'breakfasts', name: 'Бенедикт с беконом', description: 'Бриошь, бекон поджаренный до хруста, яйца пашот и голландез.', price: 420, image: 'https://images.unsplash.com/photo-1600335895229-6e75511892c8?w=500&q=80' },

    // --- Еда ---
    { id: 16, category: 'food', name: 'Паста Карбонара', description: 'Классика с беконом, сливками, желтком и пармезаном.', price: 380, image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&q=80' },
    { id: 17, category: 'food', name: 'Тёплый салат с пашот', description: 'Микс салата, бекон, черри, золотистый картофель и соус.', price: 410, image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&q=80' },
    { id: 18, category: 'food', name: 'Паста с креветками', description: 'Фетуччини с тигровыми креветками в томатном соусе.', price: 490, image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500&q=80' },
    { id: 19, category: 'food', name: 'Киш с курицей и грибами', description: 'Сытный открытый пирог из песочного теста с нежной начинкой.', price: 350, image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=500&q=80' },
    { id: 20, category: 'food', name: 'Салат Цезарь с индейкой', description: 'Классический соус, сухарики, пармезан и сочная грудка.', price: 390, image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&q=80' },

    // --- Десерты ---
    { id: 21, category: 'desserts', name: 'Черничный чизкейк', description: 'Нежный сливочный слой на песочной основе с ягодами.', price: 290, image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80' },
    { id: 22, category: 'desserts', name: 'Тирамису', description: 'Воздушный десерт на основе маскарпоне и печенья савоярди.', price: 350, image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500&q=80' },
    { id: 23, category: 'desserts', name: 'Круассан классический', description: 'Свежеиспеченный, хрустящий, со сливочным ароматом.', price: 180, image: 'https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?w=500&q=80' },
    { id: 24, category: 'desserts', name: 'Эклер ванильный', description: 'Заварной крем и тонкое тесто с белым шоколадом.', price: 190, image: 'https://images.unsplash.com/photo-1612203985729-70726954388c?w=500&q=80' },
    { id: 25, category: 'desserts', name: 'Брауни с орехами', description: 'Насыщенный шоколадный вкус и грецкие орехи.', price: 260, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80' },
    { id: 26, category: 'desserts', name: 'Торт Красный Бархат', description: 'Яркие бисквиты и легкий крем-чиз. Очень эффектно.', price: 310, image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=500&q=80' },
    { id: 27, category: 'desserts', name: 'Лимонный тарт', description: 'Освежающая цитрусовая начинка и обожженная меренга.', price: 270, image: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=500&q=80' },
];
