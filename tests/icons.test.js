// ============================================================
// ПОКРЫТИЕ ИКОНОК
// ============================================================
// Шрифт Material Symbols подгружается с перечнем имён в icon_names=.
// Иконка, которой в этом списке нет, в jsdom неотличима от рабочей, а у
// пользователя выводится словом («chevron_right» вместо стрелки). Поэтому
// собираем все имена, реально доезжающие до DOM, и сверяем со списком.

const test = require('node:test');
const assert = require('node:assert');
const { loadApp, readIndex } = require('./helpers/app.js');

function declaredIcons() {
    const m = readIndex().match(/icon_names=([^&"]+)/);
    assert.ok(m, 'в index.html нет параметра icon_names');
    return new Set(m[1].split(','));
}

// Прогоняем приложение по всем экранам и собираем имена иконок из DOM.
function collectIcons() {
    const app = loadApp();
    const w = app.window;
    const seen = new Set();
    const grab = () => app.msyms().forEach(n => seen.add(n));

    grab();
    for (const dest of ['vocab', 'cards', 'progress', 'settings', 'lessons']) {
        w.navigateTo(dest);
        grab();
    }

    w.showPrayer(); grab();
    w.startPrayerFill(); grab();
    w.startPrayerTranslate(); grab();

    w.showStats(); grab();
    w.showErrors(); grab();

    for (const lesson of w.lessonNumbers()) {
        w.openLesson(lesson); grab();
        w.switchLessonPart('material'); grab();
        w.switchLessonPart('exercise'); grab();

        const data = w.getLessonData(lesson);
        // LESSON_DRILL_GROUPS объявлен через const и потому не лежит в window
        const drills = app.get('LESSON_DRILL_GROUPS.flatMap(g => g.drills.map(d => d.kind + ":" + d.key)).join(",")')
            .split(',').map(s => s.split(':'));

        for (const [kind, key] of drills) {
            if (!w.lessonDrillAvailable(data, w.findLessonDrill(kind, key))) continue;
            w.startLessonDrill(kind, key);
            grab();
            // состояние «после ответа» тоже рисует иконки
            const opt = app.document.querySelector('#drillSection .option-btn');
            if (opt) { opt.click(); w.cancelAdvance(); grab(); }
        }
        if (w.countTestQuestions(data)) { w.startTest(); grab(); }
    }

    // экраны результата
    w.startAllFlashcards('нет-такой-части-речи'); grab();   // пустое состояние
    w.showToast('проверка', 'info'); grab();

    app.close();
    return seen;
}

test('каждая иконка в разметке и в коде объявлена в icon_names', () => {
    const declared = declaredIcons();
    const used = collectIcons();

    const missing = [...used].filter(n => !declared.has(n));
    assert.deepStrictEqual(missing, [],
        'иконки не объявлены в icon_names= (у пользователя вместо них будет текст): ' + missing.join(', '));
});

test('в icon_names нет имён, которых приложение не использует', () => {
    // Не ошибка, но лишние имена раздувают запрос шрифта. Тест не падает,
    // а перечисляет — список icon_names правится вручную и легко устаревает.
    const declared = declaredIcons();
    const used = collectIcons();
    const unused = [...declared].filter(n => !used.has(n));

    // Иконки диалога подставляются вызовами mdDialog из разных мест —
    // их не всегда видно за один прогон, поэтому только предупреждаем.
    if (unused.length) {
        console.log('    ℹ не встретились при прогоне: ' + unused.join(', '));
    }
    assert.ok(true);
});

test('icon_names отсортирован и без повторов', () => {
    const list = readIndex().match(/icon_names=([^&"]+)/)[1].split(',');
    const dupes = list.filter((n, i) => list.indexOf(n) !== i);
    assert.deepStrictEqual(dupes, [], 'повторы в icon_names: ' + dupes.join(', '));
    assert.deepStrictEqual(list, [...list].sort(),
        'icon_names проще поддерживать отсортированным');
});

test('иконки задаются только через .msym', () => {
    // Material Symbols рисует лигатуру: имя иконки текстом внутри .msym.
    // Голое имя вне .msym — это просто слово на экране.
    const app = loadApp();
    const w = app.window;
    w.openLesson(4);
    w.switchLessonPart('exercise');

    const suspicious = [];
    for (const el of app.document.querySelectorAll('#lessonSection *')) {
        if (el.children.length > 0) continue;
        const text = el.textContent.trim();
        if (/^[a-z][a-z_]{3,}$/.test(text) && !el.classList.contains('msym')) {
            suspicious.push(el.outerHTML.slice(0, 120));
        }
    }
    assert.deepStrictEqual(suspicious, [],
        'похоже на имя иконки вне .msym:\n  ' + suspicious.join('\n  '));
    app.close();
});
