// ============================================================
// ОБЩИЕ УТИЛИТЫ И СОСТОЯНИЕ
// ============================================================

// Глобальное состояние
let currentLesson = 3;
let currentLessonPart = 'menu';
let lessonsReturnSection = 'mainMenu'; // какой экран показывать при возврате на вкладку «Уроки»
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

// Уроки берём у текущего курса, а не из LESSONS_DATA напрямую: LESSONS_DATA —
// это уроки ГРЕЧЕСКОГО курса, а не «уроки вообще». См. js/course.js.
function getLessonData(l) { return courseLessons()[l]; }

function getExercises(l, t) {
    let d = getLessonData(l);
    if (!d || !d.exercises) return [];
    return d.exercises[t] || [];
}

// Номера уроков берём из самих данных: добавленный урок подхватывается
// списком, стрелками «предыдущий/следующий» и заголовком без правок кода.
function lessonNumbers() {
    return Object.keys(courseLessons()).map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
}
function firstLessonNumber() { let n = lessonNumbers(); return n.length ? n[0] : 1; }
function lastLessonNumber() { let n = lessonNumbers(); return n.length ? n[n.length - 1] : 1; }

// Прогресс у каждого курса свой: courseKey('stats') — это greek_stats или
// hebrew_stats. Для греческого получается прежний ключ, поэтому уже накопленная
// статистика читается без переноса.
function loadStats() {
    stats = { totalCorrect: 0, totalWrong: 0, errors: {} };
    try {
        let d = localStorage.getItem(courseKey('stats'));
        if (d) {
            let p = JSON.parse(d);
            stats.totalCorrect = p.totalCorrect || 0;
            stats.totalWrong = p.totalWrong || 0;
            stats.errors = p.errors || {};
        }
    } catch(e) {}
}

function saveStats() {
    try { localStorage.setItem(courseKey('stats'), JSON.stringify(stats)); } catch (e) {}
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

// ------------------------------------------------------------ проверка перевода
// Русский перевод проверяется по ключевым словам: ответ засчитан, если в нём
// есть каждое. Ключ в данных написан как словарная статья — «почему?»,
// «(домашнее) животное», «локоть (мера длины)», — и дословно такого никто не
// наберёт. Поэтому обе стороны сводим к голым словам: без пояснений в скобках,
// без знаков препинания, без регистра и с ё = е (на телефоне «ё» набирают
// редко). Данные при этом не меняются — только сравнение. Это правило для
// русского ответа; греческий и еврейский текст здесь не проходит и так не
// сворачивается никогда.
function normalizeRuAnswer(s) {
    return String(s || '')
        .toLowerCase()
        .replace(/ё/g, 'е')
        .replace(/[^\p{L}\p{N}\s-]+/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function keywordForm(k) {
    // Пояснение в скобках отбрасываем; если скобки и есть всё слово — берём их содержимое.
    return normalizeRuAnswer(String(k).replace(/\([^)]*\)/g, ' ')) || normalizeRuAnswer(k);
}

function keywordsMatch(answer, keywords) {
    let ans = normalizeRuAnswer(answer);
    if (!ans) return false;
    return (keywords || []).every(k => {
        let kw = keywordForm(k);
        return !kw || ans.indexOf(kw) !== -1;
    });
}

// Вставка на изучаемом языке внутри русской фразы. Шрифт и направление даёт
// класс, а не место вызова: см. раздел «Writing direction» в AGENTS.md. Имя
// короткое намеренно — из него собираются тексты вопросов в js/exercises.js.
function sc(text) { return '<span class="script">' + text + '</span>'; }

// Набрано ли это на изучаемом языке. Нужно там, где одна и та же строка бывает
// и русской, и греческой: подпись под вопросом об алфавите (q.name — «ἄλφα»
// в греческом курсе, «а́леф» в еврейском), строки в разборе ошибок. Шрифт
// выбирается по самой строке, а не по курсу: в еврейском курсе названия букв и
// пояснения к ним русские, и серифный шрифт с направлением справа налево им
// противопоказан (см. «Writing direction» в AGENTS.md).
//
// Диапазоны: греческий и греческое расширение (политоника), иврит и алфавит
// представления (буквы с огласовкой). Русский текст сюда не попадает, хотя
// знак ударения U+0301 в нём есть: он вне диапазонов.
function isScriptText(text) {
    return /[\u0370-\u03FF\u1F00-\u1FFF\u0590-\u05FF\uFB1D-\uFB4F]/.test(String(text == null ? '' : text));
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
