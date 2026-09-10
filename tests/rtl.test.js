// ============================================================
// ПИСЬМО ИЗУЧАЕМОГО ЯЗЫКА: ШРИФТ И НАПРАВЛЕНИЕ
// ============================================================
// Иврит пишется справа налево, интерфейс — русский и слева направо.
// Держится это на трёх вещах, и каждую здесь проверяем:
//   1) <html> несёт data-script и data-script-dir по данным курса;
//   2) токены в styles/tokens.css переключаются по этим атрибутам;
//   3) разметку, которую собирает JS, помечает класс .script — везде,
//      где в строке текст изучаемого языка, и только там.
// Как это выглядит, jsdom не считает: раскладку и шрифты видно только
// в браузере (см. «Чего эти тесты не проверяют» в tests/README.md).

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const { loadApp, repoPath, readIndex } = require('./helpers/app.js');

const read = rel => fs.readFileSync(repoPath(rel), 'utf8');
const GREEK = { storage: { app_default_course: 'greek' } };

// ------------------------------------------------------------ атрибуты на <html>

test('курс объявляет своё письмо атрибутами на <html>', () => {
    const app = loadApp(GREEK);
    const root = app.document.documentElement;
    assert.strictEqual(root.getAttribute('data-script'), 'greek');
    assert.strictEqual(root.getAttribute('data-script-dir'), 'ltr');
    assert.deepStrictEqual(app.errors, []);
    app.close();
});

test('переключение курса разворачивает письмо', () => {
    const app = loadApp(GREEK);
    app.window.applyCourse('hebrew');
    const root = app.document.documentElement;
    assert.strictEqual(root.getAttribute('data-script'), 'hebrew');
    assert.strictEqual(root.getAttribute('data-script-dir'), 'rtl');

    app.window.applyCourse('greek');
    assert.strictEqual(root.getAttribute('data-script'), 'greek');
    assert.strictEqual(root.getAttribute('data-script-dir'), 'ltr');
    assert.deepStrictEqual(app.errors, []);
    app.close();
});

test('сама страница остаётся русской и слева направо', () => {
    // Развернуть <html> целиком значило бы развернуть app bar, вкладки,
    // nav bar и все русские подписи. Справа налево идёт только текст урока.
    const app = loadApp(GREEK);
    app.window.applyCourse('hebrew');
    const root = app.document.documentElement;
    assert.ok(!root.hasAttribute('dir'), 'dir на <html> ставить нельзя: интерфейс русский');
    assert.strictEqual(root.getAttribute('lang'), 'ru');
    app.close();
});

test('courseDir отвечает за каждый курс реестра', () => {
    const app = loadApp(GREEK);
    const dirs = app.window.eval(
        'COURSE_ORDER.map(id => { let was = currentCourseId; currentCourseId = id; ' +
        'let d = courseDir(); currentCourseId = was; return id + ":" + d; }).join(", ")');
    assert.strictEqual(dirs, 'greek:ltr, hebrew:rtl');
    app.close();
});

// ------------------------------------------------------------ токены

test('токены письма переключаются атрибутами, а не именем курса', () => {
    const css = read('styles/tokens.css');
    assert.match(css, /--md-ref-typeface-hebrew:/, 'нет шрифтового токена для иврита');
    assert.match(css, /--md-ref-typeface-script:\s*var\(--md-ref-typeface-greek\)/,
        'по умолчанию письмо курса — греческое');
    assert.match(css, /--md-ref-script-direction:\s*ltr/);
    assert.match(css, /:root\[data-script="hebrew"\][\s\S]*--md-ref-typeface-script:\s*var\(--md-ref-typeface-hebrew\)/);
    assert.match(css, /:root\[data-script-dir="rtl"\][\s\S]*--md-ref-script-direction:\s*rtl/);
});

test('еврейский шрифт подключён и семейства идут по алфавиту', () => {
    // css2 отдаёт ошибку на несортированном списке — и приложение остаётся
    // вообще без Noto, а не без одного семейства.
    const html = readIndex();
    const link = /<link href="(https:\/\/fonts\.googleapis\.com\/css2\?family=Noto[^"]+)"/.exec(html);
    assert.ok(link, 'в <head> нет ссылки на семейства Noto');
    const families = Array.from(link[1].matchAll(/family=([^:&]+)/g))
        .map(m => decodeURIComponent(m[1].replace(/\+/g, ' ')));
    assert.ok(families.includes('Noto Serif Hebrew'),
        'не подключён шрифт с огласовкой: ' + families.join(', '));
    assert.deepStrictEqual(families, families.slice().sort(),
        'семейства css2 должны идти по алфавиту');
});

test('шрифт изучаемого языка нигде не прибит к греческому', () => {
    // Правило с --md-ref-typeface-greek вне явных меток языка означает, что
    // в этом месте иврит покажут греческой антиквой, в которой его нет.
    const offenders = [];
    for (const rel of ['styles/components.css', 'styles/screens.css', 'styles/dialogs.css',
                       'styles/layout.css', 'styles/settings.css']) {
        if (read(rel).includes('--md-ref-typeface-greek')) offenders.push(rel);
    }
    assert.deepStrictEqual(offenders, [],
        'греческий шрифт задан напрямую вместо --md-ref-typeface-script');
});

test('явная метка языка сильнее токена курса', () => {
    const css = read('styles/base.css');
    assert.match(css, /\.script \{[\s\S]*?--md-ref-typeface-script[\s\S]*?--md-ref-script-direction/);
    assert.match(css, /\.hebrew[^{]*\{[\s\S]*?--md-ref-typeface-hebrew[\s\S]*?direction: rtl/);
    assert.match(css, /\.greek[^{]*\{[\s\S]*?--md-ref-typeface-greek[\s\S]*?direction: ltr/);
    // Греческое слово внутри еврейского материала должно остаться греческим:
    // это работает только если явные метки объявлены ПОСЛЕ .script.
    assert.ok(css.indexOf('\n.script {') < css.indexOf('\n.greek,'),
        '.greek должен идти после .script, иначе токен курса перебьёт явную метку');
});

// ------------------------------------------------------------ разметка упражнений

const DRILLS = [
    ['exercise', 'declension_fill'],
    ['exercise', 'case_number'],
    ['exercise', 'agreement'],
    ['exercise', 'attribute_vs_predicate'],
    ['exercise', 'substantivation'],
    ['exercise', 'article_fill'],
    ['exercise', 'translate_greek_to_russian'],
    ['exercise', 'translate_russian_to_greek'],
    ['translation', 'el_to_ru'],
    ['translation', 'ru_to_el']
];

// Все виды вопросов разом: что где помечено, видно только на живой разметке.
function everyDrillHtml(app) {
    const w = app.window;
    const out = [];
    for (const lesson of w.lessonNumbers()) {
        w.openLesson(lesson);
        const data = w.getLessonData(lesson);
        for (const [kind, key] of DRILLS) {
            const drill = w.findLessonDrill(kind, key);
            if (!drill || !w.lessonDrillAvailable(data, drill)) continue;
            w.startLessonDrill(kind, key);
            out.push({ lesson, kind, key, html: app.document.querySelector('#drillSection').innerHTML });
        }
    }
    return out;
}

test('текст изучаемого языка в упражнениях помечен классом .script', () => {
    const app = loadApp(GREEK);
    const screens = everyDrillHtml(app);
    assert.ok(screens.length >= 20, 'ожидалось много упражнений, собрано ' + screens.length);
    for (const s of screens) {
        assert.ok(!/class="[^"]*\bgreek\b/.test(s.html),
            'урок ' + s.lesson + ' / ' + s.key + ' — в разметке остался класс greek');
    }
    const marked = screens.filter(s => /class="script"|word-bank--script|options--script/.test(s.html));
    assert.ok(marked.length >= 10, 'помеченных экранов подозрительно мало: ' + marked.length);
    assert.deepStrictEqual(app.errors, []);
    app.close();
});

test('банк слов помечен по языку фишек, а не по курсу', () => {
    const app = loadApp(GREEK);
    const screens = everyDrillHtml(app);

    const toScript = screens.filter(s => s.key === 'ru_to_el' || s.key === 'translate_russian_to_greek');
    const toRu = screens.filter(s => s.key === 'el_to_ru');
    assert.ok(toScript.length && toRu.length, 'нужны упражнения обоих направлений');

    for (const s of toScript) {
        assert.match(s.html, /word-bank word-bank--script/,
            'урок ' + s.lesson + ' / ' + s.key + ' — фишки на изучаемом языке, метки нет');
    }
    for (const s of toRu) {
        assert.ok(!/word-bank--script/.test(s.html),
            'урок ' + s.lesson + ' / ' + s.key + ' — фишки русские, разворачивать их нельзя');
        assert.match(s.html, /<div class="question"><span class="script">/,
            'урок ' + s.lesson + ' / ' + s.key + ' — условие на изучаемом языке, метки нет');
    }
    app.close();
});

test('обратная связь помечает ответ, только когда он на изучаемом языке', () => {
    const app = loadApp(GREEK);
    const w = app.window;
    const html = () => app.document.querySelector('#drillSection').innerHTML;
    const withTranslation = key => w.lessonNumbers().find(n => {
        const t = (w.getLessonData(n).translation || {})[key];
        return t && t.length;
    });

    // Сборка фразы на греческом: правильный ответ — греческий.
    w.openLesson(withTranslation('ru_to_el'));
    w.startLessonDrill('translation', 'ru_to_el');
    w.checkTranslationBuild();
    assert.match(html(), /<strong class="script">/, 'греческий ответ не помечен');

    // Перевод на русский: ответ русский, разворачивать нечего.
    w.openLesson(withTranslation('el_to_ru'));
    w.startLessonDrill('translation', 'el_to_ru');
    w.checkTranslationBuild();
    assert.ok(!/<strong class="script">/.test(html()), 'русский ответ помечать нельзя');
    assert.deepStrictEqual(app.errors, []);
    app.close();
});

// ------------------------------------------------------------ таблицы

test('таблица с dir="rtl" открывается с первой колонки', () => {
    // dir обязан оказаться и на полосе прокрутки: у полосы с ltr «начало» —
    // левый край, и слишком широкую таблицу она открыла бы с последней колонки.
    const app = loadApp(GREEK);
    const rtl = app.window.grammarLiftedHtml('<table dir="rtl"><tr><td>a</td></tr></table>');
    assert.match(rtl, /^<div class="md-table-scroll" dir="rtl">/, rtl);

    const plain = app.window.grammarLiftedHtml('<table><tr><td>a</td></tr></table>');
    assert.match(plain, /^<div class="md-table-scroll">/, plain);
    app.close();
});

test('таблица парадигмы разворачивается вместе с письмом курса', () => {
    const css = read('styles/screens.css');
    assert.match(css, /\.word-details > \.md-table-scroll \{ direction: var\(--md-ref-script-direction\); \}/);
    // Ячейка выравнивается по началу строки, а не по левому краю экрана.
    assert.match(css, /\.grammar-text td, \.grammar-text th \{[\s\S]*?text-align: start;/);
});

test('огласовке задан нижний предел кегля, и он свой у каждого письма', () => {
    // Точки под буквой на мелком кегле сливаются с ней: камец от сегола не
    // отличить, а половина упражнений главы 3 именно об этом.
    const css = read('styles/tokens.css');
    assert.match(css, /--md-ref-script-min-size: 0;/, 'у греческого предела быть не должно');
    assert.match(css, /:root\[data-script="hebrew"\] \{[\s\S]*?--md-ref-script-min-size: 1\.25rem;/,
        'еврейскому письму не задан нижний предел кегля');

    // Мелкий текст изучаемого языка обязан проходить через max(): без него
    // предел ничего не удерживает.
    for (const file of ['styles/screens.css', 'styles/components.css']) {
        const rules = read(file).match(/font-size: (max\()?[\d.]+rem/g) || [];
        assert.ok(rules.some(r => r.includes('max(')), file + ' — предел кегля нигде не применён');
    }
    const bank = read('styles/components.css');
    assert.match(bank, /\.word-bank--script \.chip, \.build-area--script \.token \{[\s\S]*?max\(0\.9375rem, var\(--md-ref-script-min-size\)\)/,
        'фишки банка слов — самый мелкий текст изучаемого языка, предел нужен именно там');
});

// ------------------------------------------------------------ иврит целиком

// Глав в data/hebrew-lessons.js ещё нет (фаза 5), а разворот проверять надо
// уже сейчас — иначе первая же настоящая глава окажется первой проверкой.
// Подкладываем одну главу в живой объект уроков: формат тот же, что у
// греческого, и весь путь отрисовки проходится по-настоящему.
const HEBREW_CHAPTER = {
    title: 'Проверочная глава',
    grammar: '<b>Огласовка</b><br><br>' +
        'Слово <span class="script">בָּרָא</span> читается справа налево.<br><br>' +
        '<table dir="rtl"><tr><th>Форма</th><th>Перевод</th></tr>' +
        '<tr><td lang="he">אֱלֹהִים</td><td>Бог</td></tr></table>',
    vocabulary: [
        { greek: 'אֱלֹהִים', translation: 'Бог', type: 'noun' },
        { greek: 'אֶרֶץ', translation: 'земля', type: 'noun' }
    ],
    exercises: {
        case_number: [{ form: 'אֱלֹהִים', correct: 'мн. ч.', distractors: ['ед. ч.', 'дв. ч.'] }]
    },
    translation: {
        ru_to_el: [{ source: 'Бог сотворил', correct: ['אֱלֹהִים', 'בָּרָא'] }],
        el_to_ru: [{ source: 'בָּרָא אֱלֹהִים', correct: ['сотворил', 'Бог'] }]
    }
};

function withHebrewChapter(app) {
    app.window.eval('HEBREW_LESSONS_DATA[3] = ' + JSON.stringify(HEBREW_CHAPTER) + ';');
    app.window.applyCourse('hebrew');
    app.window.openLesson(3);
}

test('еврейская глава доходит до экрана в целости', () => {
    const app = loadApp(GREEK);
    withHebrewChapter(app);

    const grammar = app.document.getElementById('grammarContent').innerHTML;
    assert.match(grammar, /<div class="md-table-scroll" dir="rtl">/,
        'таблица с dir="rtl" не передала направление полосе прокрутки');
    assert.match(grammar, /<span class="script">בָּרָא<\/span>/, 'вставка потеряла метку языка');
    assert.match(grammar, /lang="he"/, 'ячейка потеряла метку языка');

    const word = app.document.querySelector('#vocabList .word-row strong');
    assert.strictEqual(word.textContent, 'אֱלֹהִים', 'словарь главы не отрисовался');
    assert.deepStrictEqual(app.errors, []);
    app.close();
});

test('упражнения еврейской главы разворачиваются, а русские подписи — нет', () => {
    const app = loadApp(GREEK);
    const w = app.window;
    withHebrewChapter(app);
    const html = () => app.document.querySelector('#drillSection').innerHTML;

    // Вопрос на иврите, варианты ответа русские — разворачивать их нельзя.
    w.startLessonDrill('exercise', 'case_number');
    assert.match(html(), /<span class="script">אֱלֹהִים<\/span>/);
    assert.ok(!/options--script/.test(html()),
        'варианты «ед. ч. / мн. ч.» русские, метку языка им ставить нельзя');

    // Собрать фразу на иврите: банк слов и поле сборки идут справа налево.
    w.startLessonDrill('translation', 'ru_to_el');
    assert.match(html(), /build-area build-area--script/);
    assert.match(html(), /word-bank word-bank--script/);

    // Обратный перевод: условие на иврите, фишки русские.
    w.startLessonDrill('translation', 'el_to_ru');
    assert.match(html(), /<div class="question"><span class="script">בָּרָא אֱלֹהִים<\/span><\/div>/);
    assert.ok(!/word-bank--script/.test(html()), 'русские фишки разворачивать нельзя');

    assert.deepStrictEqual(app.errors, []);
    app.close();
});

test('огласовка доезжает до экрана нетронутой', () => {
    // NFC переставляет знаки огласовки — см. reference/nbbs-hebrew/restoration-report.md.
    // Ни один шаг отрисовки нормализацией заниматься не должен.
    const app = loadApp(GREEK);
    withHebrewChapter(app);
    const shown = app.document.querySelector('#vocabList .word-row strong').textContent;
    assert.strictEqual(shown, 'אֱלֹהִים');
    assert.strictEqual(Array.from(shown).length, Array.from('אֱלֹהִים').length,
        'число кодовых точек изменилось — где-то по пути прошла нормализация');
    app.close();
});

// ------------------------------------------------------------ иврит без содержания

test('пустой еврейский курс не роняет оболочку', () => {
    // Уроков ещё нет (фаза 5), но переключение уже должно быть безопасным.
    const app = loadApp(GREEK);
    app.window.applyCourse('hebrew');
    app.window.showAllVocab();
    app.window.showStats();
    assert.deepStrictEqual(app.errors, []);
    app.close();
});
