// ============================================================
// ПАРАДИГМА, ОПИСАННАЯ ОСЯМИ
// ============================================================
// Прежний построитель таблиц знал ровно одну решётку: пять греческих падежей,
// три рода, три лица. Здесь проверяется, что решётку теперь задают данные, —
// и проверяется настоящими парадигмами пособия, а не выдуманными: ни одна из
// четырёх в старую решётку не ложилась.
//
// Греческие парадигмы (101 слово) записаны прежней вложенной формой и здесь не
// участвуют: их посимвольную неизменность стережёт declension.test.js.

const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./helpers/app.js');

const GREEK = { storage: { app_default_course: 'greek' } };

// --- гл. 7: прилагательное טוֹב — род × число, падежей нет вовсе
const ADJECTIVE = {
    tables: [{
        rows: { label: '', values: [['sg', 'Ед. число'], ['pl', 'Множ. число']] },
        cols: { values: [['m', 'Муж. род'], ['f', 'Жен. род']] },
        cells: {
            sg: { m: 'טוֹב', f: 'טוֹבָה' },
            pl: { m: 'טוֹבִים', f: 'טוֹבוֹת' }
        }
    }]
};

// --- гл. 8: личное местоимение — лицо-с-родом × число, с переводом
const PRONOUN = {
    tables: [{
        rows: { label: 'Лицо', values: [
            ['1c', '1-е л., общий род'], ['2m', '2-е л., муж. род'], ['2f', '2-е л., жен. род'],
            ['3m', '3-е л., муж. род'], ['3f', '3-е л., жен. род']
        ] },
        cols: { values: [['sg', 'Ед. число'], ['pl', 'Множ. число']] },
        cells: {
            '1c': { sg: 'אָנֹכִי', pl: 'אֲנַ֫חְנוּ' },
            '2m': { sg: 'אַתָּה', pl: 'אַתֶּם' },
            '2f': { sg: 'אַתְּ', pl: 'אַתֵּ֫נָה' },
            '3m': { sg: 'הוּא', pl: 'הֵם' },
            '3f': { sg: 'הִיא', pl: 'הֵן' }
        },
        translations: { '1c': 'я / мы', '2m': 'ты / вы', '2f': 'ты / вы', '3m': 'он / они', '3f': 'она / они' }
    }]
};

// --- гл. 9: местоименные суффиксы — десять лиц × два типа
const SUFFIXES = {
    tables: [{
        caption: 'Местоименные суффиксы',
        rows: { label: 'Лицо', values: [
            ['1cs', '1 общ. ед.'], ['2ms', '2 муж. ед.'], ['2fs', '2 жен. ед.'],
            ['3ms', '3 муж. ед.'], ['3fs', '3 жен. ед.'], ['1cp', '1 общ. мн.'],
            ['2mp', '2 муж. мн.'], ['2fp', '2 жен. мн.'], ['3mp', '3 муж. мн.'], ['3fp', '3 жен. мн.']
        ] },
        cols: { values: [['t1', 'Тип 1 (с сущ. ед. ч.)'], ['t2', 'Тип 2 (с сущ. мн. ч.)']] },
        cells: {
            '1cs': { t1: 'יִ', t2: 'יַ' }, '2ms': { t1: 'ךָ', t2: 'יֶ֫ךָ' },
            '2fs': { t1: 'ךְ', t2: 'יִַ֫ךְ' }, '3ms': { t1: 'וֹ', t2: 'יָו' },
            '3fs': { t1: 'הָּ', t2: 'יֶ֫הָ' }, '1cp': { t1: 'נוּ', t2: 'יֵ֫נוּ' },
            '2mp': { t1: 'כֶם', t2: 'יֵכֶם' }, '2fp': { t1: 'כֶן', t2: 'יֵכֶן' },
            '3mp': { t1: 'הֶם', t2: 'יֵהֶם' }, '3fp': { t1: 'הֶן', t2: 'יֵהֶן' }
        },
        translations: {
            '1cs': 'мой / мои', '2ms': 'твой / твои', '2fs': 'твоя / твои', '3ms': 'его', '3fs': 'её',
            '1cp': 'наш / наши', '2mp': 'ваш / ваши', '2fp': 'ваш / ваши', '3mp': 'их', '3fp': 'их'
        }
    }]
};

// --- гл. 11: числительное — четыре колонки «род × состояние»
const NUMERAL = {
    tables: [{
        rows: { label: '', values: [['1', 'Один'], ['2', 'Два'], ['3', 'Три']] },
        cols: { values: [
            ['ma', 'Муж. абс.'], ['mc', 'Муж. сопр.'], ['fa', 'Жен. абс.'], ['fc', 'Жен. сопр.']
        ] },
        cells: {
            '1': { ma: 'אֶחָד', mc: 'אַחַד', fa: 'אַחַת', fc: 'אַחַת' },
            '2': { ma: 'שְׁנַ֫יִם', mc: 'שְׁנֵי', fa: 'שְׁתַּ֫יִם', fc: 'שְׁתֵּי' },
            '3': { ma: 'שָׁלֹשׁ', mc: 'שְׁלֹשׁ', fa: 'שְׁלֹשָׁה', fc: 'שְׁלֹ֫שֶׁת' }
        }
    }]
};

const HEBREW_PARADIGMS = [
    ['прилагательное (гл. 7)', ADJECTIVE, 2, 2],
    ['личное местоимение (гл. 8)', PRONOUN, 5, 2],
    ['местоименные суффиксы (гл. 9)', SUFFIXES, 10, 2],
    ['числительное (гл. 11)', NUMERAL, 3, 4]
];

function render(app, forms) {
    const host = app.document.createElement('div');
    host.innerHTML = app.window.generateDeclensionTable(forms, null);
    return host;
}

// ------------------------------------------------------------ решётка из данных

test('парадигмы иврита строятся — ни одна не ложилась в прежнюю решётку', () => {
    const app = loadApp(GREEK);
    for (const [name, forms, rowCount, colCount] of HEBREW_PARADIGMS) {
        const host = render(app, forms);
        const table = host.querySelector('table');
        assert.ok(table, name + ' — таблица не построилась');

        const bodyRows = table.querySelectorAll('tbody tr');
        assert.strictEqual(bodyRows.length, rowCount, name + ' — не то число строк');

        // Первая колонка — подписи строк, дальше оси, потом необязательный перевод.
        const heads = table.querySelectorAll('thead th').length;
        assert.strictEqual(heads, 1 + colCount + (forms.tables[0].translations ? 1 : 0),
            name + ' — не то число колонок');
    }
    app.close();
});

test('в парадигме из данных строки не съезжают', () => {
    const app = loadApp(GREEK);
    for (const [name, forms] of HEBREW_PARADIGMS) {
        for (const table of render(app, forms).querySelectorAll('table')) {
            const cols = table.querySelectorAll('thead th').length;
            for (const row of table.querySelectorAll('tbody tr')) {
                assert.strictEqual(row.children.length, cols,
                    name + ' — ' + row.children.length + ' ячеек при ' + cols + ' колонках');
            }
        }
    }
    app.close();
});

test('в парадигму из данных не протекают undefined и пустые ячейки без места', () => {
    const app = loadApp(GREEK);
    for (const [name, forms] of HEBREW_PARADIGMS) {
        const html = app.window.generateDeclensionTable(forms, null);
        assert.ok(!/undefined|NaN|\[object Object\]/.test(html), name + ': ' + html.slice(0, 200));
    }
    app.close();
});

test('огласовка в парадигме доезжает до разметки в целости', () => {
    const app = loadApp(GREEK);
    const host = render(app, SUFFIXES);
    const cells = [...host.querySelectorAll('tbody td')].map(td => td.textContent);
    assert.ok(cells.includes('יֶ֫ךָ'), 'форма 2 муж. ед. второго типа потеряна или изменена');
    assert.strictEqual([...'יֶ֫ךָ'].length, 5, 'проверочная строка сама потеряла знаки');
    app.close();
});

test('заголовок таблицы попадает в <caption>, а не в отдельную строку над ней', () => {
    // Полоса прокрутки уезжает вбок вместе с содержимым: заголовок над
    // таблицей уехал бы от неё, <caption> едет вместе.
    const app = loadApp(GREEK);
    const host = render(app, SUFFIXES);
    assert.strictEqual(host.querySelector('table caption').textContent, 'Местоименные суффиксы');
    assert.ok(!/^<div/.test(host.innerHTML), 'заголовок вынесен из таблицы');
    app.close();
});

// ------------------------------------------------------------ оборот карточки

test('оборот карточки перебирает ячейки парадигмы из данных', () => {
    const app = loadApp(GREEK);
    const cells = app.get('paradigmCells(' + JSON.stringify(SUFFIXES) + ')');
    assert.strictEqual(cells.length, 20, 'десять лиц на два типа — двадцать форм');

    const one = cells.find(c => c.key === '2ms_t2');
    assert.ok(one, 'ячейка 2 муж. ед. / тип 2 не найдена');
    assert.strictEqual(one.form, 'יֶ֫ךָ');
    assert.strictEqual(one.label, '2 муж. ед., Тип 2 (с сущ. мн. ч.)');
    app.close();
});

test('подпись ячейки собирается из осей, а не разбирается из ключа', () => {
    // У прежней формы подпись добывали регулярным выражением по ключу
    // (gen_sg_m → «Gen. sg. m.»). У осей подписи уже есть — гадать не о чем.
    const app = loadApp(GREEK);
    const labels = app.get('paradigmCells(' + JSON.stringify(ADJECTIVE) + ').map(c => c.label).join("|")');
    assert.strictEqual(labels, 'Ед. число, Муж. род|Ед. число, Жен. род|Множ. число, Муж. род|Множ. число, Жен. род');
    app.close();
});

test('пустая ячейка в оборот карточки не попадает', () => {
    const app = loadApp(GREEK);
    const sparse = {
        tables: [{
            rows: { values: [['a', 'А'], ['b', 'Б']] },
            cols: { values: [['x', 'Икс'], ['y', 'Игрек']] },
            cells: { a: { x: 'אָב' }, b: { y: 'בֵּן' } }
        }]
    };
    const cells = app.get('paradigmCells(' + JSON.stringify(sparse) + ')');
    assert.strictEqual(cells.length, 2, 'пустые пересечения не должны становиться вопросами');

    // Но в таблице место под них остаётся, иначе строка съедет.
    const table = render(app, sparse).querySelector('table');
    for (const row of table.querySelectorAll('tbody tr')) {
        assert.strictEqual(row.children.length, 3);
    }
    app.close();
});

test('подписи осей не попадают в словоформы для поиска', () => {
    // Подписи строк и колонок лежат в тех же данных, что и формы. Приняв их за
    // словоформы, поиск подсвечивал бы в примерах русские слова.
    const app = loadApp(GREEK);
    const forms = app.get('[...getWordSearchForms(' + JSON.stringify({
        greek: 'סוּס', translation: 'конь', declension_forms: SUFFIXES
    }) + ')].join("|")');
    assert.ok(!/общ|муж|жен|Тип|суффикс/i.test(forms), 'в словоформы попала подпись оси: ' + forms);
    assert.ok(forms.length > 0, 'словоформы не собрались вовсе');
    app.close();
});

// ------------------------------------------------------------ в живом уроке

test('слово с парадигмой из данных раскрывается в еврейской главе', () => {
    const app = loadApp(GREEK);
    const w = app.window;
    w.eval('HEBREW_LESSONS_DATA[9] = ' + JSON.stringify({
        title: 'Глава 9. Местоименные суффиксы',
        grammar: '<b>Суффиксы</b><br><br>Два набора.',
        vocabulary: [{ greek: 'סוּס', translation: 'конь', type: 'noun', declension_forms: SUFFIXES }]
    }) + ';');
    w.applyCourse('hebrew');
    w.openLesson(9);

    const row = app.document.querySelector('#vocabList .word-item.clickable');
    assert.ok(row, 'слово с парадигмой не стало раскрывающимся');
    assert.ok(row.querySelector('.md-table-scroll table'), 'таблица вне полосы прокрутки');

    row.click();
    assert.ok(row.querySelector('.word-details').classList.contains('open'), 'аккордеон не раскрылся');
    assert.deepStrictEqual(app.errors, []);
    app.close();
});
