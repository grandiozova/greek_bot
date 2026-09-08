// ============================================================
// ОБОЛОЧКА: app bar, навигация, кнопка «назад», FAB
// ============================================================
// Разметка index.html держит только пустые контейнеры (#appBarLeading,
// #appBarTitle, #mainFab) — наполняет их updateShell(). Когда shell.js
// однажды потерял половину содержимого, разметка осталась валидной, а
// кнопка «назад» исчезла со всех экранов разом. Эти тесты про такой отказ.

const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./helpers/app.js');

const DESTINATIONS = [
    { dest: 'lessons',  section: 'mainMenu',             title: 'Древнегреческий', fab: 'Продолжить' },
    { dest: 'vocab',    section: 'allVocabSection',      title: 'Словарь',         fab: 'Повторить' },
    { dest: 'cards',    section: 'allFlashcardsSection', title: 'Проверка слов',   fab: 'Заново' },
    { dest: 'progress', section: 'statsSection',         title: 'Прогресс',        fab: null },
    { dest: 'settings', section: 'settingsSection',      title: 'Настройки',       fab: null }
];

test('нижняя навигация ведёт на свои экраны и ничего не роняет', () => {
    const app = loadApp();
    for (const d of DESTINATIONS) {
        app.window.navigateTo(d.dest);
        assert.strictEqual(app.screen(), d.section, 'navigateTo(' + d.dest + ')');
        assert.strictEqual(app.appBarTitle(), d.title, 'заголовок для ' + d.dest);
        assert.strictEqual(app.navActive(), d.dest, 'подсветка навигации для ' + d.dest);

        const fab = app.fab();
        if (d.fab === null) assert.ok(fab.hidden, 'на ' + d.dest + ' FAB должен быть скрыт');
        else {
            assert.ok(!fab.hidden, 'на ' + d.dest + ' FAB должен быть виден');
            assert.strictEqual(fab.label, d.fab);
        }
    }
    assert.deepStrictEqual(app.errors, []);
    app.close();
});

test('ни один экран не остаётся пустым', () => {
    const app = loadApp();
    for (const d of DESTINATIONS) {
        app.window.navigateTo(d.dest);
        const text = app.document.getElementById(d.section).textContent.replace(/\s+/g, ' ').trim();
        assert.ok(text.length > 20, 'экран ' + d.section + ' отрисовался пустым: ' + JSON.stringify(text));
    }
    app.close();
});

test('в разметку экранов не протекают undefined и NaN', () => {
    const app = loadApp();
    for (const d of DESTINATIONS) {
        app.window.navigateTo(d.dest);
        const html = app.document.getElementById(d.section).innerHTML;
        assert.ok(!/undefined|NaN|\[object Object\]/.test(html),
            'служебное значение в разметке ' + d.section);
    }
    app.close();
});

test('кнопка «назад» появляется ровно там, где есть куда возвращаться', () => {
    const app = loadApp();
    const w = app.window;

    // экраны верхнего уровня — возвращаться некуда
    for (const d of DESTINATIONS) {
        w.navigateTo(d.dest);
        assert.strictEqual(!!app.backButton(), false, 'на ' + d.dest + ' кнопки «назад» быть не должно');
    }

    // вложенные экраны — кнопка обязана быть
    const nested = [
        ['урок',       () => w.openLesson(4)],
        ['упражнение', () => { w.openLesson(4); w.startLessonDrill('exercise', 'case_number'); }],
        ['тест',       () => { w.openLesson(4); w.startTest(); }],
        ['ошибки',     () => { w.showStats(); w.showErrors(); }],
        ['Отче наш',   () => w.showPrayer()]
    ];
    for (const [name, open] of nested) {
        open();
        assert.ok(app.backButton(), 'на экране «' + name + '» нет кнопки «назад»');
    }
    assert.deepStrictEqual(app.errors, []);
    app.close();
});

test('«назад» из раздела урока ведёт к списку разделов, потом к урокам', () => {
    const app = loadApp();
    const w = app.window;

    w.openLesson(4);
    w.switchLessonPart('material');
    assert.strictEqual(app.get('currentLessonPart'), 'material');

    w.goBack();
    assert.strictEqual(app.get('currentLessonPart'), 'menu', 'первый «назад» — к списку разделов урока');
    assert.strictEqual(app.get('currentSectionId'), 'lessonSection');

    w.goBack();
    assert.strictEqual(app.get('currentSectionId'), 'mainMenu', 'второй «назад» — к списку уроков');
    app.close();
});

test('«назад» с упражнения, теста и ошибок возвращает на нужный экран', () => {
    const app = loadApp();
    const w = app.window;

    w.openLesson(4);
    w.startLessonDrill('exercise', 'case_number');
    w.goBack();
    assert.strictEqual(app.get('currentSectionId'), 'lessonSection', 'с упражнения — к уроку');

    w.openLesson(4);
    w.startTest();
    w.goBack();
    assert.strictEqual(app.get('currentSectionId'), 'lessonSection', 'с теста — к уроку');

    w.showStats();
    w.showErrors();
    w.goBack();
    assert.strictEqual(app.get('currentSectionId'), 'statsSection', 'с ошибок — к прогрессу');
    app.close();
});

test('заголовок app bar называет текущий урок и упражнение', () => {
    const app = loadApp();
    const w = app.window;

    w.openLesson(7);
    assert.strictEqual(app.appBarTitle(), 'Урок 7');

    w.startLessonDrill('exercise', 'case_number');
    assert.strictEqual(app.appBarTitle(), 'Падеж и число', 'на экране упражнения заголовок называет упражнение');
    app.close();
});

test('на вводных уроках FAB «Тест» скрыт', () => {
    const app = loadApp();
    const w = app.window;

    w.openLesson(1);
    assert.ok(app.fab().hidden, 'урок 1 — алфавит, тестировать нечего');
    w.openLesson(2);
    assert.ok(app.fab().hidden, 'урок 2 — правила чтения');
    w.openLesson(3);
    assert.ok(!app.fab().hidden, 'с урока 3 тест есть');
    assert.strictEqual(app.fab().label, 'Тест');
    app.close();
});

test('подсветка навигации следует за экраном, а не только за кликом по панели', () => {
    const app = loadApp();
    const w = app.window;

    w.showPrayer();
    assert.strictEqual(app.navActive(), 'lessons', '«Отче наш» относится к разделу уроков');
    w.showStats();
    assert.strictEqual(app.navActive(), 'progress');
    w.showErrors();
    assert.strictEqual(app.navActive(), 'progress', 'разбор ошибок остаётся в разделе прогресса');
    app.close();
});

test('отложенный переход гасится при уходе с экрана', () => {
    // Иначе таймер срабатывает уже на другом экране и перерисовывает
    // спрятанный контейнер.
    const app = loadApp();
    const w = app.window;

    w.openLesson(4);
    w.startLessonDrill('exercise', 'case_number');
    app.document.querySelector('#drillSection .option-btn').click();
    assert.ok(app.get('window._advanceTimer'), 'после ответа переход должен быть запланирован');

    w.goToMain();
    assert.ok(!app.get('window._advanceTimer'), 'при уходе с экрана таймер обязан гаситься');
    app.close();
});

test('FAB на главном экране открывает последний урок', () => {
    const app = loadApp({ storage: { greek_last_lesson: '6' } });
    app.window.goToMain();
    app.window.onFabClick();
    assert.strictEqual(app.get('currentLesson'), 6);
    assert.strictEqual(app.get('currentSectionId'), 'lessonSection');
    app.close();
});
