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
    if (!d) return [];
    return d.exercises[t] || [];
}

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
    localStorage.setItem('greek_stats', JSON.stringify(stats));
}

function recordError(lesson, error) {
    if (!stats.errors[lesson]) stats.errors[lesson] = [];
    stats.errors[lesson].push(error);
}

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    let t = document.getElementById(id);
    if (t) t.classList.add('active');
}

function goToMain() {
    showSection('mainMenu');
    renderMainMenu();
}

function pluralRu(n, one, few, many) {
    if (n % 10 === 1 && n % 100 !== 11) return one;
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return few;
    return many;
}

function escArg(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
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

// Прогресс-бар для упражнений и карточек
function progressHead(label, index, total) {
    let pct = total > 0 ? Math.round((index / total) * 100) : 0;
    return '<div style="margin-bottom:12px;">' +
        '<div style="display:flex;justify-content:space-between;font-size:14px;color:var(--text-soft);">' +
            '<span>' + label + '</span>' +
            '<span>' + pct + '%</span>' +
        '</div>' +
        '<div style="height:4px;background:var(--border);border-radius:999px;overflow:hidden;">' +
            '<div style="height:100%;width:' + pct + '%;background:var(--primary);border-radius:999px;transition:width 0.3s;"></div>' +
        '</div>' +
    '</div>';
}

// Результат (фидбек + кнопки)
function resultBlock(correct, total, title) {
    let pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    let ok = pct >= 70;
    return '<div class="feedback ' + (ok ? 'ok' : 'fail') + '">' +
        '<span>' + title + '</span><br>' +
        '<span>Правильно: ' + correct + ' из ' + total + ' (' + pct + '%)</span>' +
    '</div>';
}

function emptyState(icon, text) {
    return '<div class="search-empty"><span class="msym lg" style="font-size:48px;display:block;margin-bottom:8px;opacity:0.4;">' + icon + '</span>' + text + '</div>';
}