// ============================================================
// СОСТОЯНИЕ, УТИЛИТЫ И ХРАНИЛИЩЕ ПРОГРЕССА
// ============================================================

let currentLesson = 3;
let stats = { totalCorrect: 0, totalWrong: 0, errors: {} };
let testState = { questions: [], index: 0, correct: 0, total: 10, answered: false };
let flashcardState = { words: [], index: 0, revealed: false, correct: 0, total: 0 };
let exerciseState = { type: null, questions: [], index: 0, correct: 0, total: 0 };
let allFlashcardState = { words: [], index: 0, revealed: false, correct: 0, total: 0 };
let translationState = { type: null, questions: [], index: 0, correct: 0, total: 0, chosen: [] };

function shuffle(a) {
    let c = a.slice();
    for (let i = c.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
}

// Экранирование текста, попадающего в innerHTML.
// Нужно всюду, где в разметку идёт ответ пользователя — это произвольная строка.
function escHtml(v) {
    return String(v == null ? '' : v)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Экранирование аргумента для инлайнового onclick="f('…')".
// Греческие формы с элизией (παρ', δι', ὑπ') иначе рвут литерал и кнопка молчит.
function escArg(v) {
    return escHtml(String(v == null ? '' : v).replace(/\\/g, '\\\\').replace(/'/g, "\\'"));
}

// Переход к следующему вопросу отложен на 1.2–1.5 с. Таймер всегда один:
// иначе уход с экрана оставляет его висеть и состояние уезжает вслепую.
let pendingAdvance = null;
function scheduleAdvance(fn, ms) {
    clearTimeout(pendingAdvance);
    pendingAdvance = setTimeout(fn, ms);
}
function cancelAdvance() { clearTimeout(pendingAdvance); pendingAdvance = null; }

function getLessonData(l) { return LESSONS_DATA[l]; }

function getExercises(l, t) {
    let d = getLessonData(l);
    if (!d) return [];
    return d.exercises[t] || [];
}

// Сколько ошибок храним на урок. Без предела журнал растёт до квоты localStorage,
// и тогда падает уже любое сохранение прогресса.
const MAX_ERRORS_PER_LESSON = 200;

function toCount(v) {
    let n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function loadStats() {
    let p = null;
    try {
        let d = localStorage.getItem('greek_stats');
        if (d) p = JSON.parse(d);
    } catch (e) { p = null; }
    if (!p || typeof p !== 'object') return;
    stats.totalCorrect = toCount(p.totalCorrect);
    stats.totalWrong = toCount(p.totalWrong);
    // Хранилище правит кто угодно (и прошлые версии приложения) — форму проверяем.
    stats.errors = {};
    if (p.errors && typeof p.errors === 'object') {
        for (let k in p.errors) {
            let list = p.errors[k];
            if (!Array.isArray(list)) continue;
            stats.errors[k] = list
                .filter(e => e && typeof e === 'object')
                .slice(-MAX_ERRORS_PER_LESSON)
                .map(e => ({
                    word: String(e.word == null ? '' : e.word),
                    correct: String(e.correct == null ? '' : e.correct),
                    your: String(e.your == null ? '' : e.your)
                }));
        }
    }
}

function recordError(key, entry) {
    let list = stats.errors[key];
    if (!Array.isArray(list)) list = stats.errors[key] = [];
    list.push(entry);
    if (list.length > MAX_ERRORS_PER_LESSON) list.splice(0, list.length - MAX_ERRORS_PER_LESSON);
}

// Приватный режим и переполнение квоты бросают из setItem. Прогресс — не то,
// ради чего стоит ронять текущий ответ, поэтому пишем «по возможности».
let storageWarned = false;
function saveStats() {
    try {
        localStorage.setItem('greek_stats', JSON.stringify(stats));
    } catch (e) {
        if (!storageWarned) {
            storageWarned = true;
            showToast('Прогресс не сохраняется: браузер блокирует хранилище', 'warning');
        }
    }
}

