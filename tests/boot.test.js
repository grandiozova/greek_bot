// ============================================================
// СТАРТ ПРИЛОЖЕНИЯ
// ============================================================

const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./helpers/app.js');

test('приложение стартует без единой ошибки скрипта', () => {
    const app = loadApp();
    assert.deepStrictEqual(app.errors, [], 'ошибки при загрузке:\n' + app.errors.join('\n---\n'));
    app.close();
});

test('boot.js доходит до последней строки', () => {
    // boot.js — единственный файл, который выполняется при загрузке. Любое
    // исключение в нём обрывает остаток: так однажды пропали свайп, тень
    // app bar и регистрация сервис-воркера, а список уроков остался пустым.
    // Последний оператор файла — обработчик keydown; если он работает,
    // отработал и весь файл.
    const app = loadApp();
    app.window.showPrayer();

    const word = app.document.querySelector('.prayer-word');
    assert.ok(word, 'в «Отче наш» нет слов для разбора');
    word.dispatchEvent(new app.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));

    assert.ok(app.document.querySelector('.prayer-word.selected'),
        'обработчик keydown из конца boot.js не сработал — значит boot.js оборвался раньше');
    app.close();
});

test('главный экран показывает все уроки из данных', () => {
    const app = loadApp();
    const items = app.document.querySelectorAll('#lessonGrid .lesson-item');
    const expected = app.get('lessonNumbers()').length;

    assert.ok(expected > 0, 'в LESSONS_DATA нет уроков');
    assert.strictEqual(items.length, expected, 'в списке не все уроки');
    assert.strictEqual(app.screen(), 'mainMenu');
    app.close();
});

test('заголовок списка называет реальный диапазон уроков', () => {
    const app = loadApp();
    const numbers = app.get('lessonNumbers()');
    assert.strictEqual(
        app.document.getElementById('lessonGridTitle').textContent,
        'Уроки ' + numbers[0] + '–' + numbers[numbers.length - 1]);
    app.close();
});

test('ни один пункт списка уроков не содержит undefined или NaN', () => {
    const app = loadApp();
    const html = app.document.getElementById('lessonGrid').innerHTML;
    assert.ok(!/undefined|NaN|\[object/.test(html), 'в разметку протекло служебное значение:\n' + html.slice(0, 400));
    app.close();
});

test('последний открытый урок помечен в списке', () => {
    const app = loadApp({ storage: { greek_last_lesson: '5' } });
    const items = [...app.document.querySelectorAll('#lessonGrid .lesson-item')];
    const resumed = items.filter(i => i.querySelector('.lesson-item__trailing').textContent === 'resume');
    assert.strictEqual(resumed.length, 1, 'ровно один урок должен быть помечен как «продолжить»');
    assert.match(resumed[0].textContent, /^5/);
    app.close();
});

test('сохранённая статистика поднимается из localStorage', () => {
    const app = loadApp({
        storage: { greek_stats: JSON.stringify({ totalCorrect: 7, totalWrong: 3, errors: {} }) }
    });
    assert.strictEqual(app.get('stats.totalCorrect'), 7);
    assert.strictEqual(app.get('stats.totalWrong'), 3);
    app.close();
});

test('битая статистика в localStorage не роняет старт', () => {
    const app = loadApp({ storage: { greek_stats: '{не json' } });
    assert.deepStrictEqual(app.errors, []);
    assert.strictEqual(app.get('stats.totalCorrect'), 0);
    app.close();
});
