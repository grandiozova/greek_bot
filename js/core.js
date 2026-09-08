// ============================================================
// ОБЩИЕ УТИЛИТЫ И СОСТОЯНИЕ
// ============================================================

// Глобальное состояние
let currentLesson = 3;
let currentLessonPart = 'menu';
let stats = { totalCorrect: 0, totalWrong: 0, errors: {} };
let testState = { questions: [], index: 0, correct: 0, total: 10, answered: false };
let flashcardState = { words: [], index: 0, revealed: false, correct: 0, total: 0 };
let exerciseState = { type: null, questions: [], index: 0, correct: 0, total: 0 };
let allFlashcardState = { words: [], index: 0, revealed: false, correct: 0, total: 0, type: 'all' };
let translationState = { type: null, questions: [], index: 0, correct: 0, total: 0, chosen: [] };
let prayerExerciseState = { type: null, questions: [], index: 0, correct: 0, total: 0, chosen: [] };
let allVocabCache = null;

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================

function shuffle(a) {
    let c = a.slice();
    for (let i = c.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
}

function getLessonData(l) { return LESSONS_DATA[l]; }

function getExercises(l, t) {
    let d = getLessonData(l);
    if (!d || !d.exercises) return [];
    return d.exercises[t] || [];
}

// Номера уроков берём из самих данных: добавленный урок подхватывается
// списком, стрелками «предыдущий/следующий» и заголовком без правок кода.
function lessonNumbers() {
    return Object.keys(LESSONS_DATA).map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
}
function firstLessonNumber() { let n = lessonNumbers(); return n.length ? n[0] : 1; }
function lastLessonNumber() { let n = lessonNumbers(); return n.length ? n[n.length - 1] : 1; }

function loadStats() {
    try {
        let d = localStorage.getItem('greek_stats');
        if (d) {
            let p = JSON.parse(d);
            stats.totalCorrect = p.totalCorrect || 0;
            stats.totalWrong = p.totalWrong || 0;
            stats.errors = p.errors || {};
        }
    } catch(e) {}
}

function saveStats() {
    try { localStorage.setItem('greek_stats', JSON.stringify(stats)); } catch (e) {}
}

function recordError(lesson, error) {
    if (!stats.errors[lesson]) stats.errors[lesson] = [];
    stats.errors[lesson].push(error);
}

function pluralRu(n, one, few, many) {
    let m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
}

// Текст в разметку. Всё, что пришло от пользователя (его ответы в разборе
// ошибок) или из внешних данных, проходит здесь.
function escHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Строковый аргумент внутрь onclick="…('ЗДЕСЬ')". Сначала экранируем как строку
// JS, потом как значение HTML-атрибута: браузер декодирует сущности до разбора
// JS, поэтому обработчик получает исходный текст обратно и сравнение
// с textContent кнопки по-прежнему сходится.
function escArg(s) {
    return String(s)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Отменяет запланированный переход (используется в упражнениях и тестах)
function cancelAdvance() {
    if (window._advanceTimer) {
        clearTimeout(window._advanceTimer);
        window._advanceTimer = null;
    }
}

function scheduleAdvance(callback, delay) {
    cancelAdvance();
    window._advanceTimer = setTimeout(function() {
        window._advanceTimer = null;
        callback();
    }, delay);
}
