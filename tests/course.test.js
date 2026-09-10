// Два курса: стартовый экран, переключение, разведённые ключи прогресса.
const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./helpers/app');

// ------------------------------------------------------------ стартовый экран

test('без настройки курса приложение спрашивает на старте', () => {
    const app = loadApp();
    assert.ok(app.window.startScreenOpen(), 'стартовый экран должен быть открыт');
    assert.ok(!app.document.getElementById('startScreen').hasAttribute('hidden'),
        'атрибут hidden должен быть снят, иначе экран невидим для программ чтения');
    assert.deepStrictEqual(app.errors, []);
    app.close();
});

test('стартовый экран предлагает оба курса в порядке реестра', () => {
    const app = loadApp();
    const cards = app.document.querySelectorAll('#startCourseList .course-card');
    assert.strictEqual(cards.length, 2, 'курсов на экране должно быть два');
    const titles = Array.from(cards).map(c => c.querySelector('.course-card__title').textContent);
    assert.deepStrictEqual(titles, ['Древнегреческий', 'Древнееврейский']);
    app.close();
});

test('карточка курса честно говорит, что материала ещё нет', () => {
    const app = loadApp();
    const notes = Array.from(app.document.querySelectorAll('#startCourseList .course-card__note'))
        .map(n => n.textContent.replace(/\s+/g, ' ').trim());
    assert.ok(/уроков|урока|урок/.test(notes[0]), 'у греческого курса считаются уроки: ' + notes[0]);
    assert.ok(/готовится/.test(notes[1]), 'у пустого курса должна быть честная подпись: ' + notes[1]);
    app.close();
});

test('выбор курса убирает стартовый экран и открывает список уроков', () => {
    const app = loadApp();
    app.window.startCourse('greek');
    assert.ok(!app.window.startScreenOpen(), 'перекрытие должно закрыться');
    assert.ok(app.document.getElementById('startScreen').hasAttribute('hidden'));
    assert.strictEqual(app.screen(), 'mainMenu');
    assert.deepStrictEqual(app.errors, []);
    app.close();
});

test('курс по умолчанию пропускает стартовый экран', () => {
    const app = loadApp({ storage: { app_default_course: 'greek' } });
    assert.ok(!app.window.startScreenOpen(), 'спрашивать не нужно — курс задан');
    assert.strictEqual(app.get('currentCourseId'), 'greek');
    assert.strictEqual(app.screen(), 'mainMenu');
    app.close();
});

test('«Сменить курс» в настройках возвращает стартовый экран', () => {
    const app = loadApp({ storage: { app_default_course: 'greek' } });
    app.window.showSettings();
    assert.ok(!app.window.startScreenOpen());
    app.window.openCoursePicker();
    assert.ok(app.window.startScreenOpen());
    app.close();
});

// ------------------------------------------------------------ переключение

test('переключение на еврейский курс не роняет ни один экран', () => {
    const app = loadApp({ storage: { app_default_course: 'hebrew' } });
    assert.strictEqual(app.get('currentCourseId'), 'hebrew');

    // Все пять точек навигации на курсе без содержания
    for (const dest of ['lessons', 'vocab', 'cards', 'progress', 'settings']) {
        app.window.navigateTo(dest);
    }
    assert.deepStrictEqual(app.errors, [], 'пустой курс не должен вызывать ошибок');
    app.close();
});

test('курс без уроков показывает заглушку, а не пустую карточку', () => {
    const app = loadApp({ storage: { app_default_course: 'hebrew' } });
    const grid = app.html('#lessonGrid');
    assert.ok(/готовятся/.test(grid), 'должно быть сказано, что уроки готовятся: ' + grid);
    assert.strictEqual(app.document.querySelectorAll('#lessonGrid .lesson-item').length, 0);
    app.close();
});

test('на курсе без уроков FAB «Продолжить» скрыт', () => {
    const hebrew = loadApp({ storage: { app_default_course: 'hebrew' } });
    assert.ok(hebrew.fab().hidden, 'продолжать нечего, кнопки быть не должно');
    hebrew.close();

    const greek = loadApp({ storage: { app_default_course: 'greek' } });
    assert.ok(!greek.fab().hidden, 'у греческого курса FAB на месте');
    greek.close();
});

test('карточка разбора молитвы есть только у курса, где он есть', () => {
    const greek = loadApp({ storage: { app_default_course: 'greek' } });
    assert.ok(!greek.document.getElementById('prayerFeatureCard').classList.contains('hidden'));
    greek.close();

    const hebrew = loadApp({ storage: { app_default_course: 'hebrew' } });
    assert.ok(hebrew.document.getElementById('prayerFeatureCard').classList.contains('hidden'),
        'у еврейского курса разбора молитвы пока нет — карточку надо скрыть');
    // Прямой вызов тоже не должен ничего сломать
    hebrew.window.showPrayer();
    assert.notStrictEqual(hebrew.screen(), 'prayerSection');
    assert.deepStrictEqual(hebrew.errors, []);
    hebrew.close();
});

test('заголовок app bar и вкладки называют выбранный курс', () => {
    const app = loadApp({ storage: { app_default_course: 'hebrew' } });
    assert.strictEqual(app.appBarTitle(), 'Древнееврейский');
    assert.ok(/Древнееврейский/.test(app.document.title), 'заголовок вкладки: ' + app.document.title);
    app.close();
});

test('смена курса на ходу перестраивает словарь и статистику', () => {
    const app = loadApp({
        storage: {
            app_default_course: 'greek',
            greek_stats: JSON.stringify({ totalCorrect: 5, totalWrong: 1, errors: {} }),
            hebrew_stats: JSON.stringify({ totalCorrect: 0, totalWrong: 0, errors: {} })
        }
    });
    app.window.showAllVocab();
    assert.ok(app.get('allVocabCache.length') > 0, 'у греческого курса словарь непустой');
    assert.strictEqual(app.get('stats.totalCorrect'), 5);

    app.window.startCourse('hebrew');
    assert.strictEqual(app.get('currentCourseId'), 'hebrew');
    assert.strictEqual(app.get('allVocabCache'), null, 'кеш словаря обязан сброситься');
    assert.strictEqual(app.get('stats.totalCorrect'), 0, 'статистика должна быть своя');

    app.window.showAllVocab();
    assert.strictEqual(app.get('allVocabCache.length'), 0, 'в пустом курсе слов нет');
    assert.deepStrictEqual(app.errors, []);
    app.close();
});

test('возврат на греческий курс возвращает его прогресс', () => {
    const app = loadApp({
        storage: {
            app_default_course: 'greek',
            greek_stats: JSON.stringify({ totalCorrect: 5, totalWrong: 1, errors: {} })
        }
    });
    app.window.startCourse('hebrew');
    assert.strictEqual(app.get('stats.totalCorrect'), 0);
    app.window.startCourse('greek');
    assert.strictEqual(app.get('stats.totalCorrect'), 5, 'прогресс курса не должен теряться');
    app.close();
});

// ------------------------------------------------------------ ключи хранилища

test('ключи прогресса разведены по курсам', () => {
    const app = loadApp({ storage: { app_default_course: 'hebrew' } });
    assert.strictEqual(app.window.courseKey('stats'), 'hebrew_stats');
    assert.strictEqual(app.window.courseKey('last_lesson'), 'hebrew_last_lesson');
    app.window.startCourse('greek');
    assert.strictEqual(app.window.courseKey('stats'), 'greek_stats');
    app.close();
});

// Схема имён выбрана так, чтобы старые ключи греческого курса совпали
// с новыми: переносить накопленный прогресс не потребовалось.
test('накопленный прогресс греческого курса читается без переноса', () => {
    const app = loadApp({
        storage: {
            app_default_course: 'greek',
            greek_stats: JSON.stringify({ totalCorrect: 42, totalWrong: 8, errors: { 4: [] } }),
            greek_last_lesson: '7'
        }
    });
    assert.strictEqual(app.get('stats.totalCorrect'), 42);
    app.window.continueLesson();
    assert.strictEqual(app.get('currentLesson'), 7, 'продолжаем с того урока, что был');
    app.close();
});

test('прогресс одного курса не пишется в ключи другого', () => {
    const app = loadApp({ storage: { app_default_course: 'hebrew' } });
    app.get('stats').totalCorrect = 3;
    app.window.saveStats();
    assert.ok(app.window.localStorage.getItem('hebrew_stats'), 'должен появиться hebrew_stats');
    assert.strictEqual(app.window.localStorage.getItem('greek_stats'), null,
        'греческий ключ трогать нельзя');
    app.close();
});

test('открытый урок пишется в ключ своего курса', () => {
    const app = loadApp({ storage: { app_default_course: 'greek' } });
    app.window.openLesson(6);
    assert.strictEqual(app.window.localStorage.getItem('greek_last_lesson'), '6');
    assert.strictEqual(app.window.localStorage.getItem('hebrew_last_lesson'), null);
    app.close();
});

// ------------------------------------------------------------ настройка

test('настройка «при запуске» сохраняется и отражается в переключателе', () => {
    const app = loadApp();
    app.window.startCourse('greek');
    app.window.showSettings();

    app.window.setDefaultCourse('greek');
    assert.strictEqual(app.window.localStorage.getItem('app_default_course'), 'greek');
    const checked = app.document.querySelector('#defaultCourseSegmented [aria-checked="true"]');
    assert.strictEqual(checked.getAttribute('data-default-course'), 'greek');

    app.window.setDefaultCourse('ask');
    assert.strictEqual(app.window.localStorage.getItem('app_default_course'), 'ask');
    assert.strictEqual(app.window.defaultCourseSetting(), 'ask');
    app.close();
});

test('неизвестное значение настройки не сохраняется', () => {
    const app = loadApp();
    app.window.setDefaultCourse('латынь');
    assert.strictEqual(app.window.localStorage.getItem('app_default_course'), null);
    assert.strictEqual(app.window.defaultCourseSetting(), 'ask');
    app.close();
});

test('несуществующий курс игнорируется, а не ломает приложение', () => {
    const app = loadApp({ storage: { app_default_course: 'латынь', app_course: 'латынь' } });
    assert.strictEqual(app.get('currentCourseId'), 'greek', 'откат к первому курсу реестра');
    app.window.startCourse('латынь');
    assert.strictEqual(app.get('currentCourseId'), 'greek');
    assert.deepStrictEqual(app.errors, []);
    app.close();
});

test('настройки показывают название открытого курса', () => {
    const app = loadApp({ storage: { app_default_course: 'hebrew' } });
    app.window.showSettings();
    assert.strictEqual(app.text('#currentCourseName'), 'Древнееврейский');
    assert.ok(app.text('#currentCourseTagline').length > 0, 'подпись источника не должна быть пустой');
    app.close();
});

// ------------------------------------------------------------ реестр

test('каждый курс реестра описан полностью', () => {
    const app = loadApp();
    const order = app.get('COURSE_ORDER');
    assert.ok(order.length >= 2);
    for (const id of order) {
        const c = app.get('COURSES')[id];
        assert.ok(c, 'нет курса ' + id + ' из COURSE_ORDER');
        for (const field of ['id', 'name', 'tagline', 'blurb', 'icon', 'dir', 'script', 'lang', 'searchPlaceholder']) {
            assert.ok(c[field], id + ': не заполнено поле ' + field);
        }
        assert.strictEqual(c.id, id, 'id внутри записи должен совпадать с ключом');
        assert.ok(c.lessons, id + ': нет объекта уроков');
        assert.ok(['ltr', 'rtl'].includes(c.dir), id + ': направление письма должно быть ltr или rtl');
        // prayerCard имеет смысл только вместе с prayer
        if (c.prayer) assert.ok(c.prayerCard, id + ': есть prayer, но нет подписей карточки');
    }
    app.close();
});

// ------------------------------------------------------------ подписи по курсу

test('подписи упражнений называют язык курса, а не греческий', () => {
    // Каталог упражнений один на оба курса, поэтому язык в подписи стоит
    // местом ({lang}) и раскрывается при отрисовке. Забыть drillLabel()
    // где-нибудь — значит показать «{lang}» пользователю.
    const app = loadApp({ storage: { app_default_course: 'greek' } });
    const w = app.window;

    const labels = () => w.eval(
        'LESSON_DRILL_GROUPS.flatMap(g => g.drills).map(drillLabel).join(" | ")');
    assert.match(labels(), /Фразы: греческий → русский/);
    assert.ok(!labels().includes('{lang}'), 'плейсхолдер не раскрыт: ' + labels());

    w.applyCourse('hebrew');
    assert.match(labels(), /Фразы: еврейский → русский/);
    assert.ok(!labels().includes('греческ'), 'в еврейском курсе греческий язык: ' + labels());
    app.close();
});

test('заголовок экрана упражнения тоже называет язык курса', () => {
    const app = loadApp({ storage: { app_default_course: 'greek' } });
    const w = app.window;
    const lesson = w.lessonNumbers().find(n => {
        const t = (w.getLessonData(n).translation || {}).ru_to_el;
        return t && t.length;
    });
    w.openLesson(lesson);
    w.startLessonDrill('translation', 'ru_to_el');
    assert.strictEqual(app.appBarTitle(), 'Предложения: русский → греческий');
    assert.deepStrictEqual(app.errors, []);
    app.close();
});
