// ============================================================
// ЗАПУСК
// ============================================================

// Инициализация всех систем
normalizeTranslationData();
normalizeCaseNames();
initTheme();
loadStats();
renderMainMenu();
updateShell();
initLessonSwipe();

// Top app bar – тень при прокрутке
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

// Service Worker для офлайн-режима (если доступен)
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function () {
            // Офлайн — не критично, просто игнорируем ошибку
        });
    });
}

// Клавиатурная активация слов молитвы (для доступности)
document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('prayer-word')) {
        e.preventDefault();
        e.target.click();
    }
});