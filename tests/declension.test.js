// ============================================================
// ТАБЛИЦЫ СКЛОНЕНИЙ И СПРЯЖЕНИЙ
// ============================================================
// Таблица собирается конкатенацией строк, а число ячеек в строке зависит от
// того, нашёлся ли перевод для этого падежа. Стоит колонке появиться в
// <thead>, но не появиться в строке — и вся таблица едет вбок. Глазами это
// заметно только на конкретном слове; тестом — на всех сразу.

const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./helpers/app.js');

// Все слова курса, у которых есть формы
function wordsWithForms(app) {
    const out = [];
    for (const lesson of app.window.lessonNumbers()) {
        const data = app.window.getLessonData(lesson);
        for (const item of (data.vocabulary || [])) {
            if (item.declension_forms) out.push({ lesson, item });
        }
    }
    return out;
}

function renderTable(app, item) {
    const host = app.document.createElement('div');
    host.innerHTML = app.window.generateDeclensionTable(item.declension_forms, item.caseTranslations || null);
    return host;
}

test('в каждой таблице число ячеек совпадает с числом заголовков', () => {
    const app = loadApp();
    const ragged = [];
    let rows = 0;

    for (const { lesson, item } of wordsWithForms(app)) {
        const host = renderTable(app, item);
        for (const table of host.querySelectorAll('table')) {
            const cols = table.querySelectorAll('thead th').length;
            for (const row of table.querySelectorAll('tbody tr')) {
                rows++;
                if (row.children.length !== cols) {
                    ragged.push(`урок ${lesson}, ${item.greek}: ${row.children.length} ячеек при ${cols} колонках`);
                }
            }
        }
    }

    assert.ok(rows > 100, 'проверено подозрительно мало строк: ' + rows);
    assert.strictEqual(ragged.length, 0, 'съехавшие таблицы:\n  ' + ragged.slice(0, 10).join('\n  '));
    app.close();
});

test('у каждого слова с формами таблица не пустая', () => {
    const app = loadApp();
    const empty = [];
    for (const { lesson, item } of wordsWithForms(app)) {
        const html = app.window.generateDeclensionTable(item.declension_forms, item.caseTranslations || null);
        if (!html || !html.trim()) empty.push(`урок ${lesson}: ${item.greek}`);
    }
    assert.deepStrictEqual(empty, [], 'формы есть, а таблица не построилась:\n  ' + empty.join('\n  '));
    app.close();
});

test('в таблицы не протекают undefined и NaN', () => {
    const app = loadApp();
    for (const { lesson, item } of wordsWithForms(app)) {
        const html = app.window.generateDeclensionTable(item.declension_forms, item.caseTranslations || null);
        assert.ok(!/undefined|NaN|\[object Object\]/.test(html),
            `урок ${lesson}, ${item.greek}: ` + html.slice(0, 200));
    }
    app.close();
});

test('таблица в словаре урока живёт в полосе прокрутки', () => {
    // Широкая таблица иначе растягивает страницу вбок.
    const app = loadApp();
    const w = app.window;

    for (const lesson of w.lessonNumbers()) {
        w.openLesson(lesson);
        for (const details of app.document.querySelectorAll('#vocabList .word-details')) {
            if (!details.querySelector('table')) continue;
            assert.ok(details.querySelector('.md-table-scroll table'),
                'урок ' + lesson + ': таблица склонений вне .md-table-scroll');
        }
    }
    app.close();
});

test('аккордеон в словаре урока раскрывается и складывается', () => {
    const app = loadApp();
    const w = app.window;
    w.openLesson(4);

    const row = app.document.querySelector('#vocabList .word-item.clickable');
    assert.ok(row, 'в уроке 4 нет ни одного слова с формами');

    row.click();
    assert.ok(row.querySelector('.word-details').classList.contains('open'), 'аккордеон не раскрылся');
    assert.strictEqual(row.getAttribute('aria-expanded'), 'true');

    row.click();
    assert.ok(!row.querySelector('.word-details').classList.contains('open'), 'аккордеон не закрылся');
    assert.strictEqual(row.getAttribute('aria-expanded'), 'false');
    app.close();
});

test('подписи форм на обороте карточки читаемы, а не сырые ключи', () => {
    const app = loadApp();
    const w = app.window;
    const bad = [];

    for (const { item, lesson } of wordsWithForms(app)) {
        const word = { greek: item.greek, article: item.article || '', translation: item.translation,
                       declension_forms: item.declension_forms, lesson };
        for (const q of w.cardDeclensionQuestions(word)) {
            // Ключ вида gen_sg или 2pl не должен доезжать до экрана как есть
            if (/^[a-z]+_[a-z]{2}(_[mfn])?$/.test(q.label) || /^[123](sg|pl)$/.test(q.label)) {
                bad.push(item.greek + ': ' + q.label);
            }
        }
    }
    assert.deepStrictEqual(bad.slice(0, 10), [], 'сырые ключи форм в подписях: ' + bad.slice(0, 10).join(', '));
    app.close();
});

test('у каждого вопроса о форме есть варианты и правильный ответ среди них', () => {
    const app = loadApp();
    const w = app.window;
    const bad = [];

    for (const { item, lesson } of wordsWithForms(app)) {
        const word = { greek: item.greek, article: item.article || '', translation: item.translation,
                       declension_forms: item.declension_forms, lesson };
        for (const q of w.cardDeclensionQuestions(word)) {
            if (!q.correct) bad.push(item.greek + ': нет правильного ответа');
            if (!q.distractors || q.distractors.length < 2) bad.push(item.greek + '/' + q.label + ': мало вариантов');
            if (q.distractors && q.distractors.includes(q.correct)) {
                bad.push(item.greek + '/' + q.label + ': правильный ответ продублирован в вариантах');
            }
        }
    }
    assert.deepStrictEqual(bad.slice(0, 10), [], bad.slice(0, 10).join('\n'));
    app.close();
});
