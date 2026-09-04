// ============================================================
// ЗАПУСК
// ============================================================

function normalizeTranslationData() {
    for (let key in LESSONS_DATA) {
        let lesson = LESSONS_DATA[key];
        if (!lesson.translation) continue;
        ['ru_to_el', 'el_to_ru'].forEach(dir => {
            if (!lesson.translation[dir]) return;
            lesson.translation[dir].forEach(q => {
                if (typeof q.correct === 'string') {
                    q.correct = q.correct
                        .replace(/[.,;:!?]+$/, '')
                        .split(/\s+/)
                        .filter(Boolean);
                }
            });
        });
    }
}
normalizeTranslationData();
initTheme();
loadStats();
renderMainMenu();
updateShell();

// Top app bar получает контейнерный тон при прокрутке (поведение M3 «on scroll»)
// Класс на app bar переключаем не чаще кадра — иначе запись в DOM на каждый тик скролла
let scrollFrame = null;
window.addEventListener('scroll', function () {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(function () {
        scrollFrame = null;
        let bar = document.getElementById('topAppBar');
        if (bar) bar.classList.toggle('scrolled', window.scrollY > 4);
    });
}, { passive: true });

// Индикатор вкладок пересчитывается после загрузки шрифтов и при ресайзе
window.addEventListener('resize', moveTabIndicator);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveTabIndicator);

// Офлайн-режим. Регистрируем после load, чтобы не соперничать за канал
// с разметкой и шрифтами; file:// и старые браузеры просто пропускают этот блок.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function () {
            // Офлайн — приятное дополнение, а не условие работы: молча живём без него.
        });
    });
}

// Клавиатурная активация слов молитвы (они не <button>, но интерактивны)
document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('prayer-word')) {
        e.preventDefault();
        e.target.click();
    }
});
    
