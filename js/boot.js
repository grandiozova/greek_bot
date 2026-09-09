// ============================================================
// ЗАПУСК
// ============================================================

// Проходим по всем курсам, а не только по LESSONS_DATA: разбор строки ответа
// на слова нужен каждому курсу, у которого есть упражнения на перевод.
function normalizeTranslationData() {
    for (let id in COURSES) {
        let lessons = COURSES[id].lessons || {};
        for (let key in lessons) {
            let lesson = lessons[key];
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
}

// Здесь НЕТ вызова normalizeCaseNames (пока)
normalizeTranslationData();
// initCourse — до loadStats и renderMainMenu: они уже читают ключи и уроки
// выбранного курса.
initCourse();
initTheme();
loadStats();
// Начальное значение currentLesson задано в core.js под греческий курс —
// в другом курсе такого урока может не быть.
if (!getLessonData(currentLesson)) currentLesson = firstLessonNumber();
renderMainMenu();
updateShell();
initLessonSwipe();
syncCourseControls();
// Перекрытие с выбором курса — последним, поверх готового приложения.
initStartScreen();

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

// Элементы с role="button" на <div>/<span> (слово в «Отче наш», строка словаря)
// сами по себе клавиатуру не слушают — Enter и пробел доводим до клика руками.
const KEY_ACTIVATED = 'prayer-word word-row';
document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    let el = e.target;
    if (!el || !el.classList) return;
    if (!KEY_ACTIVATED.split(' ').some(c => el.classList.contains(c))) return;
    e.preventDefault();
    el.click();
});