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
                    q.correctText = q.correct;
                    q.correct = q.correct
                        .replace(/[.,;:!?]+$/, '')
                        .split(/\s+/)
                        .filter(Boolean);
                }
            });
        });
    }
}

// Здесь НЕТ вызова normalizeCaseNames (пока)
normalizeTranslationData();
initTheme();
loadStats();
renderMainMenu();
updateShell();
initLessonSwipe();

// Тень на app bar при скролле – используем scrollFrame из shell.js
window.addEventListener('scroll', function () {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(function () {
        scrollFrame = null;
        let bar = document.getElementById('topAppBar');
        if (bar) bar.classList.toggle('scrolled', window.scrollY > 4);
    });
}, { passive: true });

window.addEventListener('resize', moveTabIndicator);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveTabIndicator);

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function () {});
    });
}

document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('prayer-word')) {
        e.preventDefault();
        e.target.click();
    }
});