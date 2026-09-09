// ============================================================
// ЧИСТЫЕ ФУНКЦИИ: экранирование, склонение числительных, тема
// ============================================================

const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./helpers/app.js');

test('escHtml обезвреживает разметку', () => {
    const app = loadApp();
    const e = app.window.escHtml;
    assert.strictEqual(e('<b>'), '&lt;b&gt;');
    assert.strictEqual(e('a & b'), 'a &amp; b');
    assert.strictEqual(e('"кавычки"'), '&quot;кавычки&quot;');
    assert.strictEqual(e("it's"), 'it&#39;s');
    assert.strictEqual(e('λόγος'), 'λόγος', 'греческий не должен страдать');
    // амперсанд экранируется первым, иначе получилось бы &amp;lt;
    assert.strictEqual(e('<'), '&lt;');
    assert.strictEqual(e('&lt;'), '&amp;lt;');
    app.close();
});

test('escArg переживает путь «строка → HTML-атрибут → аргумент JS»', () => {
    // Значение уходит в onclick="…('ЗДЕСЬ')" и обязано вернуться в обработчик
    // ровно таким, каким было: по нему потом сравнивают textContent кнопки.
    const app = loadApp();
    const B = String.fromCharCode(92); // обратный слэш

    const cases = [
        'λόγος',
        'a & b',
        'say "hi"',
        "it's",
        '<b>x</b>',
        'back' + B + 'slash',
        B + B + 'two',
        'a<b&c"d' + B
    ];

    app.window.eval('window.__probe = function (v) { window.__got = v; };');

    for (const value of cases) {
        const host = app.document.createElement('div');
        host.innerHTML = '<button onclick="__probe(' + "'" + app.window.escArg(value) + "'" + ')">x</button>';
        app.document.body.appendChild(host);
        host.querySelector('button').click();
        assert.strictEqual(app.get('window.__got'), value, 'escArg исказил ' + JSON.stringify(value));
    }
    app.close();
});

test('pluralRu склоняет по русским правилам', () => {
    const app = loadApp();
    const p = (n) => app.window.pluralRu(n, 'слово', 'слова', 'слов');

    assert.strictEqual(p(1), 'слово');
    assert.strictEqual(p(21), 'слово');
    assert.strictEqual(p(101), 'слово');
    assert.strictEqual(p(11), 'слов', '11 — исключение');
    assert.strictEqual(p(111), 'слов');
    assert.strictEqual(p(2), 'слова');
    assert.strictEqual(p(23), 'слова');
    assert.strictEqual(p(12), 'слов', '12 — исключение');
    assert.strictEqual(p(5), 'слов');
    assert.strictEqual(p(0), 'слов');
    assert.strictEqual(p(100), 'слов');
    app.close();
});

test('shuffle не теряет и не добавляет элементов', () => {
    const app = loadApp();
    const source = [1, 2, 3, 4, 5, 6, 7, 8];
    const mixed = app.window.shuffle(source);

    assert.strictEqual(mixed.length, source.length);
    assert.deepStrictEqual([...mixed].sort((a, b) => a - b), source, 'состав изменился');
    assert.deepStrictEqual(source, [1, 2, 3, 4, 5, 6, 7, 8], 'исходный массив нельзя менять');
    app.close();
});

test('lessonNumbers отражает данные и отсортирован', () => {
    const app = loadApp();
    const numbers = app.get('lessonNumbers().join(",")').split(',').map(Number);

    assert.ok(numbers.length > 0);
    assert.deepStrictEqual(numbers, [...numbers].sort((a, b) => a - b), 'номера не по порядку');
    assert.strictEqual(app.window.firstLessonNumber(), numbers[0]);
    assert.strictEqual(app.window.lastLessonNumber(), numbers[numbers.length - 1]);
    app.close();
});

test('границы диапазона уроков берутся из данных, а не из константы', () => {
    const app = loadApp();
    const w = app.window;
    const first = w.firstLessonNumber();
    const last = w.lastLessonNumber();

    w.openLesson(first);
    assert.ok(app.document.getElementById('prevLessonBtn').disabled, 'на первом уроке «назад» должен быть выключен');
    w.openLesson(last);
    assert.ok(app.document.getElementById('nextLessonBtn').disabled, 'на последнем уроке «вперёд» должен быть выключен');

    w.openLesson(first + 1);
    assert.ok(!app.document.getElementById('prevLessonBtn').disabled);
    app.close();
});

test('переход между уроками работает в обе стороны', () => {
    const app = loadApp();
    const w = app.window;
    w.openLesson(4);
    w.goToNextLesson();
    assert.strictEqual(app.get('currentLesson'), 5);
    w.goToPrevLesson();
    assert.strictEqual(app.get('currentLesson'), 4);
    assert.deepStrictEqual(app.errors, []);
    app.close();
});

test('getExercises не падает на уроке без упражнений', () => {
    const app = loadApp();
    // Длиной, а не deepStrictEqual: массив приходит из другого realm,
    // и строгое сравнение придралось бы к прототипу (см. helpers/app.js).
    assert.strictEqual(app.window.getExercises(999, 'case_number').length, 0);
    assert.strictEqual(app.window.getExercises(1, 'нет-такого-типа').length, 0);
    app.close();
});

test('тема запоминается и применяется', () => {
    const app = loadApp();
    const root = app.document.documentElement;

    app.window.setThemeMode('dark');
    assert.strictEqual(root.getAttribute('data-theme'), 'dark');
    // Тема общая для курсов, поэтому ключ app_theme, а не <курс>_theme.
    assert.strictEqual(app.window.localStorage.getItem('app_theme'), 'dark');

    app.window.setThemeMode('sepia');
    assert.strictEqual(root.getAttribute('data-theme'), 'sepia');

    app.window.setThemeMode('не-такая-тема');
    assert.strictEqual(app.get('themeMode'), 'system', 'неизвестный режим должен откатываться к системному');
    app.close();
});

test('режим «как в системе» следует за системной темой', () => {
    const light = loadApp({ prefersDark: false, storage: { app_theme: 'system' } });
    assert.strictEqual(light.document.documentElement.getAttribute('data-theme'), 'light');
    light.close();

    const dark = loadApp({ prefersDark: true, storage: { app_theme: 'system' } });
    assert.strictEqual(dark.document.documentElement.getAttribute('data-theme'), 'dark');
    dark.close();
});

test('сохранённая вручную тема не сбрасывается системной', () => {
    const app = loadApp({ prefersDark: true, storage: { app_theme: 'light' } });
    assert.strictEqual(app.document.documentElement.getAttribute('data-theme'), 'light');
    app.close();
});

// Тема раньше лежала в greek_theme — выбор пользователя не должен потеряться
// от того, что ключ стал общим для курсов.
test('старый ключ темы greek_theme читается и переносится в app_theme', () => {
    const app = loadApp({ prefersDark: true, storage: { greek_theme: 'light' } });
    assert.strictEqual(app.document.documentElement.getAttribute('data-theme'), 'light',
        'выбор из старого ключа должен примениться');
    assert.strictEqual(app.window.localStorage.getItem('app_theme'), 'light',
        'и переехать в новый ключ, чтобы читаться напрямую');
    app.close();
});

test('app_theme имеет приоритет над оставшимся greek_theme', () => {
    const app = loadApp({ storage: { app_theme: 'dark', greek_theme: 'light' } });
    assert.strictEqual(app.document.documentElement.getAttribute('data-theme'), 'dark');
    app.close();
});

test('переключатель темы в настройках отражает выбранный режим', () => {
    const app = loadApp();
    app.window.showSettings();
    app.window.setThemeMode('dark');

    const checked = [...app.document.querySelectorAll('#themeSegmented [data-theme-mode]')]
        .filter(b => b.getAttribute('aria-checked') === 'true');
    assert.strictEqual(checked.length, 1, 'должен быть отмечен ровно один режим');
    assert.strictEqual(checked[0].getAttribute('data-theme-mode'), 'dark');
    assert.ok(app.text('#themeHint').length > 0, 'подпись под переключателем пуста');
    app.close();
});

test('грамматика урока разбирается в блоки, а не в сплошную простыню', () => {
    const app = loadApp();
    const w = app.window;

    for (const lesson of w.lessonNumbers()) {
        w.openLesson(lesson);
        const box = app.document.getElementById('grammarContent');
        assert.ok(box.innerHTML.trim().length > 0, 'урок ' + lesson + ': грамматика пуста');
        assert.ok(box.querySelector('.grammar-p, .grammar-h, .grammar-list, .md-table-scroll'),
            'урок ' + lesson + ': грамматика не разобрана на блоки');
        // U+0001 — метка, которой renderGrammarHtml временно подменяет
        // таблицы и списки; дожить до экрана она не должна.
        assert.ok(!/undefined|\u0001/.test(box.innerHTML),
            'урок ' + lesson + ': в грамматике осталась служебная метка или undefined');
    }
    app.close();
});
