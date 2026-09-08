// ============================================================
// КАРТОЧКИ: колода урока, колода всех слов, оборот карточки
// ============================================================

const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./helpers/app.js');
const { playThrough, withInstantAdvance } = require('./helpers/play.js');

test('колода всех слов проходится до конца', () => {
    const app = loadApp();
    app.window.startAllFlashcards();
    const result = playThrough(app, '#allFlashcardContainer');
    assert.ok(result.finished, 'колода не дошла до результата');
    assert.deepStrictEqual(app.errors, []);
    app.close();
});

test('колода урока проходится до конца', () => {
    const app = loadApp();
    app.window.openLesson(4);
    app.window.startLessonDrill('flashcards', 'flashcards');
    const result = playThrough(app, '#flashcardContainer');
    assert.ok(result.finished);
    app.close();
});

test('перевод показывается только после «Показать перевод»', () => {
    const app = loadApp();
    app.window.startAllFlashcards();

    assert.ok(!app.document.querySelector('#allFlashcardContainer .flashcard-translation'),
        'перевод виден до нажатия');
    app.document.querySelector('#allFlashcardContainer .flashcard-buttons .show').click();
    assert.ok(app.document.querySelector('#allFlashcardContainer .flashcard-translation'),
        'перевод не показался');
    app.close();
});

test('фильтр по части речи задаёт колоду и держится между заходами', () => {
    const app = loadApp();
    app.window.startAllFlashcards('verb');
    assert.strictEqual(app.get('allFlashcardState.type'), 'verb');
    const size = app.get('allFlashcardState.total');
    assert.ok(size > 0, 'колода глаголов пуста');

    // «Повторить» без аргумента не должно сбрасывать выбранный фильтр
    app.window.startAllFlashcards();
    assert.strictEqual(app.get('allFlashcardState.type'), 'verb');
    assert.strictEqual(app.get('allFlashcardState.total'), size);
    app.close();
});

test('заголовок колоды называет выбранную часть речи', () => {
    const app = loadApp();
    app.window.startAllFlashcards('noun');
    assert.strictEqual(app.document.getElementById('allFlashcardTitle').textContent, 'Существительные');
    app.window.startAllFlashcards('all');
    assert.strictEqual(app.document.getElementById('allFlashcardTitle').textContent, 'Проверка всех слов');
    app.close();
});

test('«Знаю» и «Не знаю» ведут счёт и пишут ошибки', () => {
    const app = loadApp();
    const w = app.window;
    w.startAllFlashcards();

    app.document.querySelector('#allFlashcardContainer .flashcard-buttons .show').click();
    app.document.querySelector('#allFlashcardContainer .flashcard-buttons .know').click();
    assert.strictEqual(app.get('allFlashcardState.correct'), 1);
    assert.strictEqual(app.get('stats.totalCorrect'), 1);

    app.document.querySelector('#allFlashcardContainer .flashcard-buttons .show').click();
    app.document.querySelector('#allFlashcardContainer .flashcard-buttons .dontknow').click();
    assert.strictEqual(app.get('stats.totalWrong'), 1);
    assert.ok(app.get('(stats.errors.all || []).length') > 0, 'ошибка не записана');
    app.close();
});

test('оборот карточки даёт вопросы про формы слова', () => {
    const app = loadApp();
    const w = app.window;
    w.startAllFlashcards();

    // ищем первое слово, у которого есть чем тренировать формы
    let flip = null;
    for (let i = 0; i < 60 && !flip; i++) {
        const show = app.document.querySelector('#allFlashcardContainer .flashcard-buttons .show');
        if (show) show.click();
        flip = app.document.querySelector('#allFlashcardContainer .flashcard-flip-btn');
        if (flip) break;
        const know = app.document.querySelector('#allFlashcardContainer .flashcard-buttons .know');
        if (!know) break;
        know.click();
    }
    assert.ok(flip, 'ни у одного слова не нашлось оборота с формами');

    flip.click();
    const box = app.document.getElementById('cardDeclension');
    assert.ok(box, 'оборот не отрисовался');
    assert.match(box.textContent, /Форма \d+ из \d+/, 'на обороте нет счётчика форм');
    assert.ok(app.document.querySelectorAll('#cardDeclension .option-btn').length >= 3,
        'у вопроса о форме слишком мало вариантов');

    withInstantAdvance(app, () => {
        for (let i = 0; i < 60; i++) {
            const opt = app.document.querySelector('#cardDeclension .option-btn:not([disabled])');
            if (!opt) break;
            opt.click();
        }
    });
    assert.match(app.document.getElementById('cardDeclension').textContent, /Верно \d+ из \d+/,
        'оборот не дошёл до итога');
    assert.deepStrictEqual(app.errors, []);
    app.close();
});

test('кнопка оборота не появляется до показа перевода', () => {
    const app = loadApp();
    app.window.startAllFlashcards();
    assert.ok(!app.document.querySelector('#allFlashcardContainer .flashcard-flip-btn'),
        'кнопка оборота видна до «Показать перевод»');
    app.close();
});

test('пустая колода объясняет себя, а не показывает пустой экран', () => {
    const app = loadApp();
    // несуществующая часть речи — колода заведомо пуста
    app.window.startAllFlashcards('нет-такой-части-речи');
    const box = app.document.getElementById('allFlashcardContainer');
    assert.match(box.textContent, /Слов пока нет/);
    app.close();
});
