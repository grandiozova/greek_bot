// ============================================================
// УПРАЖНЕНИЯ УРОКА И ТЕСТ
// ============================================================

const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./helpers/app.js');
const { playThrough } = require('./helpers/play.js');

const DRILLS = [
    ['exercise', 'case_number'],
    ['exercise', 'agreement'],
    ['exercise', 'attribute_vs_predicate'],
    ['exercise', 'substantivation'],
    ['exercise', 'article_fill'],
    ['exercise', 'translate_greek_to_russian'],
    ['exercise', 'translate_russian_to_greek'],
    ['translation', 'el_to_ru'],
    ['translation', 'ru_to_el'],
    ['flashcards', 'flashcards']
];

test('каждое доступное упражнение каждого урока проходится до конца', () => {
    const app = loadApp();
    const w = app.window;
    let played = 0;

    for (const lesson of w.lessonNumbers()) {
        w.openLesson(lesson);
        const data = w.getLessonData(lesson);

        for (const [kind, key] of DRILLS) {
            const drill = w.findLessonDrill(kind, key);
            if (!w.lessonDrillAvailable(data, drill)) continue;

            w.startLessonDrill(kind, key);
            const label = `урок ${lesson} / ${kind}:${key}`;

            const box = app.document.querySelector('#drillSection');
            assert.ok(box.textContent.trim().length > 0, label + ' — экран упражнения пуст');
            assert.ok(!/Тип упражнения не поддерживается|Нет вопросов|Нет упражнений|Нет слов/.test(box.textContent),
                label + ' — упражнение не отрисовалось: ' + box.textContent.slice(0, 120));

            const result = playThrough(app, '#drillSection');
            assert.ok(result.steps > 0, label + ' — не удалось сделать ни одного хода');
            assert.ok(result.finished, label + ' — упражнение не дошло до экрана результата');
            played++;
        }
    }

    assert.ok(played >= 40, 'ожидалось много упражнений, пройдено всего ' + played);
    assert.deepStrictEqual(app.errors, [], 'ошибки во время прохождения:\n' + app.errors.join('\n'));
    app.close();
});

test('тест урока проходится до конца во всех уроках, где он есть', () => {
    const app = loadApp();
    const w = app.window;
    let played = 0;

    for (const lesson of w.lessonNumbers()) {
        w.openLesson(lesson);
        if (!w.countTestQuestions(w.getLessonData(lesson))) continue;

        w.startTest();
        const box = app.document.querySelector('#testContainer');
        assert.ok(!/Неизвестный тип вопроса/.test(box.textContent), 'урок ' + lesson + ': неизвестный тип вопроса');

        const result = playThrough(app, '#testContainer');
        assert.ok(result.finished, 'урок ' + lesson + ': тест не дошёл до результата');
        played++;
    }

    assert.ok(played > 0, 'ни одного теста не запустилось');
    assert.deepStrictEqual(app.errors, []);
    app.close();
});

test('в вопросах упражнений не протекают undefined и NaN', () => {
    const app = loadApp();
    const w = app.window;

    for (const lesson of w.lessonNumbers()) {
        w.openLesson(lesson);
        const data = w.getLessonData(lesson);
        for (const [kind, key] of DRILLS) {
            if (!w.lessonDrillAvailable(data, w.findLessonDrill(kind, key))) continue;
            w.startLessonDrill(kind, key);
            const html = app.document.querySelector('#drillSection').innerHTML;
            assert.ok(!/undefined|NaN|\[object Object\]/.test(html),
                `урок ${lesson} / ${kind}:${key} — служебное значение в разметке`);
        }
    }
    app.close();
});

test('правильный ответ засчитывается, неправильный попадает в ошибки', () => {
    const app = loadApp();
    const w = app.window;

    w.openLesson(4);
    w.startLessonDrill('exercise', 'case_number');

    const state = app.get('exerciseState');
    const correct = state.questions[0].correct;
    const buttons = [...app.document.querySelectorAll('#exerciseQuestion .option-btn')];
    const right = buttons.find(b => b.textContent === correct);
    assert.ok(right, 'среди вариантов нет правильного ответа');

    right.click();
    assert.strictEqual(app.get('exerciseState.correct'), 1, 'правильный ответ не засчитан');
    assert.strictEqual(app.get('stats.totalCorrect'), 1);
    assert.strictEqual(app.get('stats.totalWrong'), 0);

    // неправильный
    w.cancelAdvance();
    w.showExercise();
    const state2 = app.get('exerciseState');
    const correct2 = state2.questions[state2.index].correct;
    const wrong = [...app.document.querySelectorAll('#exerciseQuestion .option-btn')]
        .find(b => b.textContent !== correct2);
    wrong.click();
    assert.strictEqual(app.get('stats.totalWrong'), 1, 'неправильный ответ не учтён');
    assert.ok(app.get('Object.keys(stats.errors).length') > 0, 'ошибка не записана в разбор');
    app.close();
});

test('после ответа варианты блокируются и правильный подсвечен', () => {
    const app = loadApp();
    const w = app.window;
    w.openLesson(4);
    w.startLessonDrill('exercise', 'case_number');

    const correct = app.get('exerciseState').questions[0].correct;
    app.document.querySelector('#exerciseQuestion .option-btn').click();

    const buttons = [...app.document.querySelectorAll('#exerciseQuestion .option-btn')];
    assert.ok(buttons.every(b => b.disabled), 'после ответа кнопки должны блокироваться');
    const marked = buttons.find(b => b.classList.contains('correct'));
    assert.ok(marked, 'правильный вариант не подсвечен');
    assert.strictEqual(marked.textContent, correct);
    app.close();
});

test('повторный клик по выбранной фишке не дублирует слово', () => {
    // Фишка гасится только визуально (.picked), кликабельной она остаётся:
    // без защиты второй клик клал слово в ответ ещё раз.
    const app = loadApp();
    const w = app.window;

    w.openLesson(5);
    w.startLessonDrill('translation', 'ru_to_el');

    const chip = app.document.querySelector('#transWordBank .chip');
    chip.click();
    chip.click();
    chip.click();

    assert.strictEqual(app.get('translationState.chosen.length'), 1, 'слово попало в ответ несколько раз');
    assert.strictEqual(app.document.querySelectorAll('#transBuildArea .token').length, 1, 'лишние токены в поле сборки');
    app.close();
});

test('клик по собранному слову убирает ровно его', () => {
    const app = loadApp();
    const w = app.window;

    w.openLesson(5);
    w.startLessonDrill('translation', 'ru_to_el');

    const chips = [...app.document.querySelectorAll('#transWordBank .chip')].slice(0, 3);
    chips.forEach(c => c.click());
    assert.strictEqual(app.get('translationState.chosen.length'), 3);

    // убираем средний
    app.document.querySelectorAll('#transBuildArea .token')[1].click();
    assert.strictEqual(app.get('translationState.chosen.length'), 2);
    assert.strictEqual(app.document.querySelectorAll('#transBuildArea .token').length, 2);
    assert.strictEqual(app.document.querySelectorAll('#transWordBank .chip.picked').length, 2,
        'фишка убранного слова должна снова стать доступной');
    app.close();
});

test('«Очистить» возвращает все фишки в банк', () => {
    const app = loadApp();
    const w = app.window;
    w.openLesson(5);
    w.startLessonDrill('translation', 'ru_to_el');

    [...app.document.querySelectorAll('#transWordBank .chip')].slice(0, 3).forEach(c => c.click());
    w.transClear();

    assert.strictEqual(app.get('translationState.chosen.length'), 0);
    assert.strictEqual(app.document.querySelectorAll('#transBuildArea .token').length, 0);
    assert.strictEqual(app.document.querySelectorAll('#transWordBank .chip.picked').length, 0);
    app.close();
});

test('верно собранное предложение засчитывается', () => {
    const app = loadApp();
    const w = app.window;
    w.openLesson(5);
    w.startLessonDrill('translation', 'ru_to_el');

    const correct = app.get('translationState').questions[0].correct;
    for (const word of correct) {
        const chip = [...app.document.querySelectorAll('#transWordBank .chip:not(.picked)')]
            .find(c => c.textContent === word);
        assert.ok(chip, 'в банке нет слова «' + word + '»');
        chip.click();
    }
    w.checkTranslationBuild();

    assert.ok(app.document.querySelector('#translationQuestion .feedback.ok'), 'правильный сбор не засчитан');
    assert.strictEqual(app.get('translationState.correct'), 1);
    app.close();
});

test('тест не даёт ответить на один вопрос дважды', () => {
    const app = loadApp();
    const w = app.window;
    w.openLesson(4);
    w.startTest();

    const before = app.get('testState.correct') + app.get('testState.index');
    const btn = app.document.querySelector('#testContainer .option-btn');
    if (btn) {
        btn.click();
        w.testAnswer('что угодно', 'ещё что-то'); // повторный ответ на тот же вопрос
        assert.ok(app.get('testState.answered'), 'вопрос должен быть помечен как отвеченный');
        assert.ok(app.get('testState.correct') <= before + 1, 'повторный ответ засчитался второй раз');
    }
    app.close();
});

test('упражнения не помечают общие данные урока служебными полями', () => {
    // collectTestQuestions когда-то писал _type прямо в LESSONS_DATA.
    const app = loadApp();
    const w = app.window;

    for (const lesson of w.lessonNumbers()) {
        w.openLesson(lesson);
        w.countTestQuestions(w.getLessonData(lesson));
    }
    // Строкой, а не массивом: значение приходит из другого realm, и
    // deepStrictEqual сравнил бы ещё и прототипы.
    const polluted = app.get(`
        (function () {
            let hits = [];
            for (let l of lessonNumbers()) {
                let ex = (LESSONS_DATA[l] || {}).exercises || {};
                for (let k in ex) for (let q of (ex[k] || [])) if ('_type' in q) hits.push(l + '/' + k);
            }
            return hits.join(', ');
        })()
    `);
    assert.strictEqual(polluted, '', 'в LESSONS_DATA попало служебное поле _type: ' + polluted);
    app.close();
});
