// ============================================================
// ЗАПУСК
// ============================================================

// ---- Нормализация переводов (разбор строк на слова) ----
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

// ---- Нормализация названий падежей в упражнениях ----
function normalizeCaseNames() {
    const replacements = [
        { from: /Genitivus\s*\(Род\.\s*п\.\)\s*—\s*кого\?\s*чего\?/gi, to: 'Gen. Sg.' },
        { from: /Dativus\s*\(Дат\.\s*п\.\)\s*—\s*кому\?\s*чему\?/gi, to: 'Dat. Sg.' },
        { from: /Accusativus\s*\(Вин\.\s*п\.\)\s*—\s*кого\?\s*что\?/gi, to: 'Acc. Sg.' },
        { from: /Nominativus\s*\(Им\.\s*п\.\)\s*мн\.ч\.\s*—\s*кто\?\s*что\?/gi, to: 'Nom. Pl.' },
        { from: /Genitivus\s*\(Род\.\s*п\.\)\s*мн\.ч\.\s*—\s*кого\?\s*чего\?/gi, to: 'Gen. Pl.' },
        { from: /Dativus\s*\(Дат\.\s*п\.\)\s*мн\.ч\.\s*—\s*кому\?\s*чему\?/gi, to: 'Dat. Pl.' },
        { from: /Accusativus\s*\(Вин\.\s*п\.\)\s*мн\.ч\.\s*—\s*кого\?\s*что\?/gi, to: 'Acc. Pl.' },
        { from: /Vocativus\s*\(Зват\.\s*п\.\)\s*—\s*обращение/gi, to: 'Voc. Sg.' },
        { from: /Nominativus\s*\(Им\.\s*п\.\)\s*мн\.ч\.\s*муж\.р\.\s*—\s*кто\?\s*что\?/gi, to: 'Nom. Pl. M.' },
        { from: /Genitivus\s*\(Род\.\s*п\.\)\s*муж\.р\.\s*—\s*кого\?\s*чего\?/gi, to: 'Gen. Sg. M.' },
        { from: /Dativus\s*\(Дат\.\s*п\.\)\s*жен\.р\.\s*—\s*кому\?\s*чему\?/gi, to: 'Dat. Sg. F.' },
        { from: /Accusativus\s*\(Вин\.\s*п\.\)\s*ср\.р\.\s*—\s*кого\?\s*что\?/gi, to: 'Acc. Sg. N.' },
        // Личные формы глаголов (если встречаются)
        { from: /1-е\s*лицо\s*ед\.ч\.\s*—\s*я/gi, to: '1 Sg.' },
        { from: /2-е\s*лицо\s*ед\.ч\.\s*—\s*ты/gi, to: '2 Sg.' },
        { from: /3-е\s*лицо\s*ед\.ч\.\s*—\s*он\/она\/оно/gi, to: '3 Sg.' },
        { from: /1-е\s*лицо\s*мн\.ч\.\s*—\s*мы/gi, to: '1 Pl.' },
        { from: /2-е\s*лицо\s*мн\.ч\.\s*—\s*вы/gi, to: '2 Pl.' },
        { from: /3-е\s*лицо\s*мн\.ч\.\s*—\s*они/gi, to: '3 Pl.' }
    ];

    function processArray(arr) {
        if (!arr) return;
        arr.forEach(item => {
            if (item.correct && typeof item.correct === 'string') {
                replacements.forEach(r => {
                    item.correct = item.correct.replace(r.from, r.to);
                });
            }
            if (item.distractors && Array.isArray(item.distractors)) {
                item.distractors = item.distractors.map(d => {
                    if (typeof d === 'string') {
                        replacements.forEach(r => {
                            d = d.replace(r.from, r.to);
                        });
                    }
                    return d;
                });
            }
        });
    }

    for (let key in LESSONS_DATA) {
        let lesson = LESSONS_DATA[key];
        if (!lesson.exercises) continue;
        const types = ['case_number', 'declension_fill', 'agreement', 'attribute_vs_predicate', 'substantivation', 'article_fill'];
        types.forEach(type => {
            if (lesson.exercises[type]) {
                processArray(lesson.exercises[type]);
            }
        });
    }
}

// ---- ЗАПУСК ВСЕХ СИСТЕМ ----
normalizeTranslationData();
normalizeCaseNames();
initTheme();
loadStats();
renderMainMenu();
updateShell();
initLessonSwipe();

// ---- Top app bar: тень при прокрутке ----
let scrollFrame = null;
window.addEventListener('scroll', function () {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(function () {
        scrollFrame = null;
        let bar = document.getElementById('topAppBar');
        if (bar) bar.classList.toggle('scrolled', window.scrollY > 4);
    });
}, { passive: true });

// ---- Индикатор вкладок ----
window.addEventListener('resize', moveTabIndicator);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveTabIndicator);

// ---- Service Worker для офлайн-режима ----
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function () {
            // офлайн — не критично
        });
    });
}

// ---- Клавиатурная доступность для слов молитвы ----
document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('prayer-word')) {
        e.preventDefault();
        e.target.click();
    }
});