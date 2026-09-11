// ============================================================
// ПРОГРЕСС, РАЗБОР ОШИБОК, СБРОС
// ============================================================

const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./helpers/app.js');

const withStats = (correct, wrong, errors = {}) => loadApp({
    storage: { greek_stats: JSON.stringify({ totalCorrect: correct, totalWrong: wrong, errors }) }
});

test('пустой прогресс объясняет, что делать', () => {
    const app = loadApp();
    app.window.showStats();
    assert.match(app.text('#statsContent'), /Пока нет ответов/);
    app.close();
});

test('прогресс считает точность', () => {
    const app = withStats(7, 3);
    app.window.showStats();
    const text = app.text('#statsContent');
    assert.match(text, /70%/, 'точность посчитана неверно: ' + text);
    assert.match(text, /10/, 'нет общего числа ответов');
    assert.ok(!/undefined|NaN/.test(app.html('#statsContent')));
    app.close();
});

test('разбор ошибок показывает записанные ошибки', () => {
    const app = withStats(0, 2, { 3: [{ word: 'λόγος', correct: 'слово', your: 'дело' }] });
    app.window.showStats();
    app.window.showErrors();

    assert.strictEqual(app.screen(), 'errorsSection');
    const items = app.document.querySelectorAll('#errorsContent .error-item');
    assert.strictEqual(items.length, 1);
    assert.match(items[0].textContent, /λόγος/);
    assert.match(items[0].textContent, /слово/);
    assert.match(items[0].textContent, /дело/);
    app.close();
});

test('разбор ошибок метит изучаемый язык по самой строке, а не по графе', () => {
    // Графа «правильно» бывает то формой, то русским словом: список сводит все
    // виды упражнений. Без .script огласовка рисовалась шрифтом интерфейса и
    // отрывалась от буквы (хатеф-камец стоял рядом с ней, как «i»), а русский ответ под общим
    // правилом для <strong> получал еврейский шрифт, в котором нет кириллицы.
    // Строки берём из пула курса, а не набираем: см. AGENTS.md.
    const app = loadApp({ storage: { app_course: 'hebrew', app_default_course: 'hebrew' } });
    const w = app.window;
    w.eval(`stats.errors = { 2: [
        { word: HEBREW_ALPHABET.vowels[14].sign, correct: HEBREW_ALPHABET.vowels[14].name, your: HEBREW_ALPHABET.vowels[6].name },
        { word: HEBREW_ALPHABET.letters[1].name, correct: HEBREW_ALPHABET.letters[1].letter, your: HEBREW_ALPHABET.letters[2].letter }
    ] }`);
    w.showErrors();

    const items = app.document.querySelectorAll('#errorsContent .error-item');
    assert.strictEqual(items.length, 2);
    const marked = item => [...item.querySelectorAll('.script')].map(e => e.textContent);

    // Знак огласовки — изучаемый язык, его название — русское.
    assert.deepStrictEqual(marked(items[0]), [app.get('HEBREW_ALPHABET.vowels[14].sign')],
        'помечено не только разбираемое слово');
    assert.ok(!items[0].querySelector('strong .script'), 'русский верный ответ помечен как иврит');
    // Наоборот: название буквы русское, а ответы — сами буквы.
    assert.deepStrictEqual(marked(items[1]),
        [app.get('HEBREW_ALPHABET.letters[1].letter'), app.get('HEBREW_ALPHABET.letters[2].letter')],
        'буквы в ответах не помечены или помечено русское название');
    assert.ok(items[1].querySelector('strong .script'), 'верный ответ-буква не помечен');
    assert.deepStrictEqual(app.errors, []);
    app.close();
});

test('ответ пользователя не может внести разметку в разбор ошибок', () => {
    // Ошибки хранятся в localStorage и попадают в разметку. Экранирование —
    // единственное, что стоит между напечатанным ответом и innerHTML.
    const hostile = {
        word: '<img src=x onerror="window.__pwned=1">',
        correct: 'a & b',
        your: '"><script>window.__pwned=1</script>'
    };
    const app = withStats(0, 1, { 3: [hostile] });
    app.window.showStats();
    app.window.showErrors();

    const box = app.document.getElementById('errorsContent');
    assert.strictEqual(box.querySelectorAll('img').length, 0, 'в разметку попал <img> из ответа пользователя');
    assert.strictEqual(box.querySelectorAll('script').length, 0, 'в разметку попал <script>');
    assert.strictEqual(app.get('window.__pwned'), undefined, 'встроенный код выполнился');
    assert.match(box.innerHTML, /&lt;img/, 'ответ не экранирован');
    assert.match(box.textContent, /a & b/, 'амперсанд потерялся при экранировании');
    app.close();
});

test('ошибки группируются по урокам и общему словарю', () => {
    const app = withStats(0, 2, {
        3: [{ word: 'a', correct: 'b', your: 'c' }],
        all: [{ word: 'd', correct: 'e', your: 'f' }]
    });
    app.window.showStats();
    app.window.showErrors();
    const text = app.text('#errorsContent');
    assert.match(text, /Урок 3/);
    assert.match(text, /Все слова/);
    app.close();
});

test('пустой разбор ошибок объясняет себя', () => {
    const app = loadApp();
    app.window.showErrors();
    assert.match(app.text('#errorsContent'), /Ошибок нет/);
    app.close();
});

test('сброс прогресса стирает статистику и перерисовывает экран', () => {
    const app = withStats(5, 5, { 3: [{ word: 'a', correct: 'b', your: 'c' }] });
    const w = app.window;
    w.showStats();

    // диалог подтверждения: соглашаемся
    const done = w.clearAllProgress();
    w.mdDialogClose(true);

    return Promise.resolve(done).then(() => {
        assert.strictEqual(app.get('stats.totalCorrect'), 0);
        assert.strictEqual(app.get('stats.totalWrong'), 0);
        assert.strictEqual(app.get('Object.keys(stats.errors).length'), 0);
        assert.match(app.text('#statsContent'), /Пока нет ответов/, 'экран не перерисовался после сброса');
        assert.deepStrictEqual(app.errors, []);
        app.close();
    });
});

test('отказ в диалоге сброса ничего не меняет', () => {
    const app = withStats(5, 5);
    const w = app.window;
    w.showStats();

    const done = w.clearAllProgress();
    w.mdDialogClose(false);

    return Promise.resolve(done).then(() => {
        assert.strictEqual(app.get('stats.totalCorrect'), 5);
        app.close();
    });
});

test('очистка ошибок сохраняет общий счёт ответов', () => {
    const app = withStats(5, 5, { 3: [{ word: 'a', correct: 'b', your: 'c' }] });
    const w = app.window;
    w.showStats();
    w.showErrors();

    const done = w.clearErrors();
    w.mdDialogClose(true);

    return Promise.resolve(done).then(() => {
        assert.strictEqual(app.get('Object.keys(stats.errors).length'), 0, 'ошибки не очищены');
        assert.strictEqual(app.get('stats.totalCorrect'), 5, 'общий счёт не должен был пострадать');
        app.close();
    });
});

test('статистика переживает перезагрузку', () => {
    const app = withStats(4, 1);
    app.window.recordError(3, { word: 'x', correct: 'y', your: 'z' });
    app.window.saveStats();
    const saved = app.window.localStorage.getItem('greek_stats');
    app.close();

    const again = loadApp({ storage: { greek_stats: saved } });
    assert.strictEqual(again.get('stats.totalCorrect'), 4);
    assert.strictEqual(again.get('(stats.errors[3] || []).length'), 1);
    again.close();
});

test('настройки показывают список лицензий', () => {
    const app = loadApp();
    app.window.showSettings();
    const items = app.document.querySelectorAll('#licenseList .license-item');
    assert.strictEqual(items.length, app.get('LICENSES.length'));
    assert.ok(items.length > 0, 'список лицензий пуст');
    for (const i of items) {
        assert.ok(i.querySelector('.license-item__name').textContent.trim(), 'у лицензии нет имени');
    }
    app.close();
});

test('ссылки на лицензии открываются безопасно', () => {
    const app = loadApp();
    app.window.showSettings();
    for (const a of app.document.querySelectorAll('#licenseList a')) {
        assert.strictEqual(a.getAttribute('target'), '_blank');
        assert.match(a.getAttribute('rel') || '', /noopener/);
    }
    app.close();
});
