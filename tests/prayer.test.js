// ============================================================
// «ОТЧЕ НАШ»: разбор слов и упражнения
// ============================================================

const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./helpers/app.js');
const { playThrough } = require('./helpers/play.js');

test('разбор молитвы открывается и показывает все слова', () => {
    const app = loadApp();
    app.window.showPrayer();

    assert.strictEqual(app.screen(), 'prayerSection');
    const words = app.document.querySelectorAll('.prayer-word');
    const expected = app.get('PRAYER_DATA.verses.reduce((n, v) => n + v.words.length, 0)');
    assert.strictEqual(words.length, expected, 'на экране не все слова молитвы');
    assert.deepStrictEqual(app.errors, []);
    app.close();
});

test('каждый стих сопровождается русским переводом', () => {
    const app = loadApp();
    app.window.showPrayer();
    const verses = app.document.querySelectorAll('.prayer-verse');
    assert.strictEqual(verses.length, app.get('PRAYER_DATA.verses.length'));
    for (const v of verses) {
        assert.ok(v.querySelector('.prayer-russian'), 'у стиха нет перевода');
    }
    app.close();
});

test('клик по слову показывает разбор формы', () => {
    const app = loadApp();
    app.window.showPrayer();

    app.document.querySelector('.prayer-word').click();
    const analysis = app.document.querySelector('#analysis-0');
    assert.strictEqual(analysis.style.display, 'block', 'разбор не открылся');
    assert.ok(analysis.textContent.trim().length > 0, 'разбор пуст');
    assert.ok(!/undefined/.test(analysis.innerHTML), 'в разборе undefined');
    assert.ok(app.document.querySelector('.prayer-word.selected'), 'разобранное слово не подсвечено');
    app.close();
});

test('разбор открыт только у одного стиха разом', () => {
    const app = loadApp();
    const w = app.window;
    w.showPrayer();

    w.showWordAnalysis(0, 0);
    w.showWordAnalysis(1, 0);

    const open = [...app.document.querySelectorAll('[id^="analysis-"]')]
        .filter(el => el.style.display === 'block');
    assert.strictEqual(open.length, 1, 'открыто несколько разборов сразу');
    assert.strictEqual(open[0].id, 'analysis-1');
    app.close();
});

test('разбор во всех стихах отрисовывается без дыр', () => {
    const app = loadApp();
    const w = app.window;
    w.showPrayer();

    const verses = app.get('PRAYER_DATA.verses.length');
    for (let v = 0; v < verses; v++) {
        const words = app.get(`PRAYER_DATA.verses[${v}].words.length`);
        for (let i = 0; i < words; i++) {
            w.showWordAnalysis(v, i);
            const html = app.document.querySelector('#analysis-' + v).innerHTML;
            assert.ok(!/undefined|NaN/.test(html), `стих ${v}, слово ${i}: ` + html);
        }
    }
    assert.deepStrictEqual(app.errors, []);
    app.close();
});

test('упражнение «заполни пропуски» проходится до конца', () => {
    const app = loadApp();
    app.window.showPrayer();
    app.window.startPrayerFill();

    const result = playThrough(app, '#prayerExerciseQuestion');
    assert.ok(result.finished, 'упражнение не дошло до результата');
    assert.deepStrictEqual(app.errors, []);
    app.close();
});

test('упражнение «перевод на греческий» проходится до конца', () => {
    const app = loadApp();
    app.window.showPrayer();
    app.window.startPrayerTranslate();

    const result = playThrough(app, '#prayerExerciseQuestion');
    assert.ok(result.finished);
    app.close();
});

test('пропуск в стихе попадает ровно на одно слово', () => {
    const app = loadApp();
    app.window.showPrayer();
    app.window.startPrayerFill();

    const question = app.document.querySelector('#prayerExerciseQuestion .question').textContent;
    assert.strictEqual((question.match(/___/g) || []).length, 1, 'пропусков не ровно один: ' + question);
    app.close();
});

test('слова стиха и его разбор не разъезжаются в данных', () => {
    // Пропуск ищется по индексу в verse.words, а показывается разбивкой
    // verse.greek по пробелам: разное число слов сдвинуло бы пропуск.
    const app = loadApp();
    const bad = app.get(`
        PRAYER_DATA.verses
            .map((v, i) => v.greek.split(' ').length === v.words.length ? null : i)
            .filter(i => i !== null).join(', ')
    `);
    assert.strictEqual(bad, '', 'стихи, где greek и words дают разное число слов: ' + bad);
    app.close();
});

test('в вариантах и в банке слов молитвы лишнее слово не повторяется', () => {
    // В молитве слова повторяются (ἡμῶν, καί, σου), и пул без повторов
    // собирался из текста как есть: одно и то же лишнее слово выпадало дважды.
    // Случайность прогоняем много раз — единичный прогон ловил бы через раз.
    const app = loadApp();
    const w = app.window;
    w.showPrayer();
    const bad = [];

    for (let run = 0; run < 60; run++) {
        w.startPrayerFill();
        const total = app.get('prayerExerciseState.total');
        for (let i = 0; i < total; i++) {
            w.eval('prayerExerciseState.index = ' + i);
            w.showPrayerExerciseQuestion();
            const opts = [...app.document.querySelectorAll('#prayerExerciseQuestion .option-btn')].map(b => b.textContent);
            if (new Set(opts).size !== opts.length) bad.push('пропуск: ' + opts.join(' | '));
        }

        w.startPrayerTranslate();
        const qs = app.get('prayerExerciseState.questions.length');
        for (let i = 0; i < qs; i++) {
            const pool = app.get(`prayerExerciseState.questions[${i}].pool.join('|')`).split('|');
            const correct = app.get(`prayerExerciseState.questions[${i}].correct.join('|')`).split('|');
            for (const word of correct) pool.splice(pool.indexOf(word), 1);
            if (new Set(pool).size !== pool.length) bad.push('банк: ' + pool.join(' | '));
        }
    }
    assert.deepStrictEqual(bad.slice(0, 5), [], 'повтор лишнего слова:\n' + bad.slice(0, 5).join('\n'));
    assert.deepStrictEqual(app.errors, []);
    app.close();
});

test('слово, дважды стоящее в стихе, получает в банке две фишки', () => {
    // Обратная сторона той же правки: без повторов — только лишние слова.
    const app = loadApp();
    const w = app.window;
    w.showPrayer();
    w.startPrayerTranslate();
    const bad = app.get(`
        prayerExerciseState.questions.filter(q =>
            q.correct.some(word => q.pool.filter(x => x === word).length < q.correct.filter(x => x === word).length)
        ).map(q => q.russian).join(' | ')
    `);
    assert.strictEqual(bad, '', 'правильных фишек меньше, чем слов в стихе: ' + bad);
    app.close();
});

test('повторный клик по фишке не дублирует слово', () => {
    const app = loadApp();
    app.window.showPrayer();
    app.window.startPrayerTranslate();

    const chip = app.document.querySelector('#prayerWordBank .chip');
    chip.click();
    chip.click();
    chip.click();

    assert.strictEqual(app.get('prayerExerciseState.chosen.length'), 1);
    assert.strictEqual(app.document.querySelectorAll('#prayerBuildArea .token').length, 1);
    app.close();
});

test('FAB на экране молитвы запускает упражнение', () => {
    const app = loadApp();
    app.window.showPrayer();
    assert.strictEqual(app.fab().label, 'Упражнение');

    app.window.onFabClick();
    assert.ok(app.document.querySelector('#prayerExerciseQuestion .word-bank'),
        'FAB не запустил упражнение с переводом');
    app.close();
});
