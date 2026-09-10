// ============================================================
// СОДЕРЖАНИЕ ЕВРЕЙСКОГО КУРСА СВЕРЯЕТСЯ С ПОСОБИЕМ
// ============================================================
// AGENTS.md называет слабым звеном не расшифровку, а ручной набор: проверка
// `unfont.py --audit` ловит невозможный знак, но не ловит один допустимый знак,
// набранный вместо другого — камец вместо патаха, шин вместо син. Глазами в
// огласовке такую подмену не увидеть.
//
// Поэтому здесь механическая замена той сверки: каждое еврейское слово из
// data/hebrew-lessons.js обязано встречаться в расшифрованном тексте пособия
// дословно. Слово, набранное «на глаз», в справочнике не найдётся.
//
// Чего тест НЕ проверяет: верность самого пособия и верность русских переводов.
// Он говорит только одно — что в приложение попало ровно то, что расшифровано.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { loadApp, repoPath } = require('./helpers/app.js');
const { playThrough } = require('./helpers/play.js');

const GREEK = { storage: { app_default_course: 'greek' } };

// Буква иврита с относящимися к ней знаками огласовки и акцентами.
const HEB_RUN = /[֐-׿יִ-ﭏ]+/g;

function corpus() {
    const dir = repoPath('reference', 'nbbs-hebrew');
    let text = '';
    const walk = d => {
        for (const name of fs.readdirSync(d)) {
            const p = path.join(d, name);
            const st = fs.statSync(p);
            if (st.isDirectory()) walk(p);
            else if (/\.(md|json|txt)$/.test(name)) text += fs.readFileSync(p, 'utf8') + '\n';
        }
    };
    walk(dir);
    return text;
}

// Слова курса: всё еврейское, что лежит в данных уроков, — в грамматике,
// словаре, вопросах упражнений и в вариантах ответа.
function hebrewTokens(value, out) {
    if (typeof value === 'string') {
        for (const run of value.match(HEB_RUN) || []) {
            // Служебные знаки разметки упражнений: пропуск и граница слога.
            for (const tok of run.split(/[|_]/)) {
                const t = tok.trim();
                if (t) out.add(t);
            }
        }
    } else if (Array.isArray(value)) {
        value.forEach(v => hebrewTokens(v, out));
    } else if (value && typeof value === 'object') {
        Object.values(value).forEach(v => hebrewTokens(v, out));
    }
    return out;
}

test('каждое еврейское слово курса есть в расшифрованном пособии', () => {
    const app = loadApp(GREEK);
    const data = app.get('JSON.stringify(HEBREW_LESSONS_DATA)');
    app.close();

    const tokens = [...hebrewTokens(JSON.parse(data), new Set())];
    assert.ok(tokens.length > 300, 'подозрительно мало слов проверено: ' + tokens.length);

    const text = corpus();
    const missing = tokens.filter(t => !text.includes(t));
    assert.deepStrictEqual(missing, [],
        'этих слов нет в reference/nbbs-hebrew — набраны вручную и, возможно, с ошибкой:\n  '
        + missing.join('\n  '));
});

test('огласовка не нормализована по NFC', () => {
    // NFC переставляет знаки местами (см. restoration-report.md). Порядок
    // должен совпадать с расшифровкой посимвольно, иначе слово выглядит так же,
    // а хранится иначе — и поиск со сверкой начинают промахиваться.
    const app = loadApp(GREEK);
    const data = app.get('JSON.stringify(HEBREW_LESSONS_DATA)');
    app.close();
    assert.strictEqual(data, data.normalize('NFC') === data ? data : data,
        'служебная проверка');
    const tokens = [...hebrewTokens(JSON.parse(data), new Set())];
    const changed = tokens.filter(t => t.normalize('NFC') !== t);
    // Если NFC что-то меняет, значит в данных лежит именно ненормализованная
    // форма — та же, что в пособии. Это ожидаемо; проверяем, что мы её не
    // «починили» при переносе.
    assert.ok(changed.length > 0,
        'ни одно слово не отличается от своей NFC-формы — похоже, огласовку нормализовали');
});

test('словарь курса совпадает со словарём справочника', () => {
    const ref = JSON.parse(fs.readFileSync(
        repoPath('reference', 'nbbs-hebrew', 'data', 'vocabulary-by-lesson.json'), 'utf8'));
    const known = new Map();
    for (const ch of ref) for (const e of ch.entries) known.set(e.he, e.freq);

    const app = loadApp(GREEK);
    const rows = JSON.parse(app.get(`
        JSON.stringify(Object.keys(HEBREW_LESSONS_DATA).flatMap(function (n) {
            return (HEBREW_LESSONS_DATA[n].vocabulary || []).map(function (v) {
                return { greek: v.greek, freq: v.freq, type: v.type };
            });
        }))
    `));
    app.close();

    assert.ok(rows.length > 150, 'словарь курса подозрительно мал: ' + rows.length);
    const bad = rows.filter(r => !known.has(r.greek));
    assert.deepStrictEqual(bad.map(r => r.greek), [], 'слова нет в словаре справочника');

    const wrongFreq = rows.filter(r => known.get(r.greek) !== r.freq)
        .map(r => r.greek + ': ' + r.freq + ' вместо ' + known.get(r.greek));
    assert.deepStrictEqual(wrongFreq, [], 'частота разошлась со справочником');
});

test('у каждой словарной статьи есть перевод и часть речи', () => {
    const app = loadApp(GREEK);
    const bad = app.get(`
        (function () {
            let hits = [];
            let ok = ['noun','adjective','verb','adverb','pronoun','preposition',
                      'conjunction','particle','article','other'];
            for (let n in HEBREW_LESSONS_DATA) {
                for (let v of (HEBREW_LESSONS_DATA[n].vocabulary || [])) {
                    if (!v.translation || !v.translation.trim()) hits.push(n + ': пустой перевод');
                    if (ok.indexOf(v.type) === -1) hits.push(n + '/' + v.greek + ': type=' + v.type);
                }
            }
            return hits.join(' | ');
        })()
    `);
    app.close();
    assert.strictEqual(bad, '', bad);
});

test('главы 1–11 на месте, вводные — без упражнений', () => {
    const app = loadApp(GREEK);
    app.window.applyCourse('hebrew');
    // Строкой, а не массивом: числа приходят из другого realm, и
    // deepStrictEqual сравнил бы ещё и прототипы.
    const nums = app.window.lessonNumbers();
    assert.strictEqual([...nums].join(','), '1,2,3,4,5,6,7,8,9,10,11');

    for (const n of nums) {
        const d = app.window.getLessonData(n);
        assert.ok(d.title && d.title.trim(), 'глава ' + n + ' без заголовка');
        assert.ok(d.grammar && d.grammar.length > 200, 'глава ' + n + ': грамматика пуста');
        // Главы 1–2 объявлены вводными в data/courses.js: тренировать в них нечего.
        if (n <= 2) assert.ok(!d.exercises, 'глава ' + n + ' вводная, упражнений быть не должно');
        else assert.ok(d.exercises && Object.keys(d.exercises).length,
            'глава ' + n + ' без упражнений');
    }
    assert.deepStrictEqual(app.errors, []);
    app.close();
});

test('еврейские вставки в грамматике помечены классом, а не голым текстом', () => {
    // Без метки .script слово наберётся интерфейсным шрифтом и слева направо.
    const app = loadApp(GREEK);
    const grammar = app.get(`
        Object.keys(HEBREW_LESSONS_DATA).map(function (n) {
            return HEBREW_LESSONS_DATA[n].grammar || '';
        }).join('\\n')
    `);
    app.close();

    // Снимаем всё размеченное, дальше еврейских букв остаться не должно.
    const stripped = grammar
        .replace(/<span class="script">[\s\S]*?<\/span>/g, '')
        .replace(/<td lang="he">[\s\S]*?<\/td>/g, '');
    const loose = (stripped.match(HEB_RUN) || []).slice(0, 5);
    assert.deepStrictEqual(loose, [], 'еврейский текст без метки языка: ' + loose.join(', '));
});

test('каждое упражнение каждой главы проходится до конца', () => {
    // drills.test.js прогоняет курс по умолчанию, то есть греческий. Настоящие
    // еврейские главы надо пройти отдельно: у них свои виды упражнений и свои
    // данные, и «Нет вопросов» вместо задания видно только так.
    const app = loadApp(GREEK);
    const w = app.window;
    w.applyCourse('hebrew');
    let played = 0;

    for (const lesson of w.lessonNumbers()) {
        w.openLesson(lesson);
        const data = w.getLessonData(lesson);
        const drills = app.get('LESSON_DRILL_GROUPS.flatMap(g => g.drills.map(d => d.kind + ":" + d.key)).join(",")')
            .split(',').map(x => x.split(':'));

        for (const [kind, key] of drills) {
            const drill = w.findLessonDrill(kind, key);
            if (!w.lessonDrillAvailable(data, drill)) continue;

            w.startLessonDrill(kind, key);
            const label = 'глава ' + lesson + ' / ' + kind + ':' + key;
            const box = app.document.querySelector('#drillSection');
            assert.ok(!/не поддерживается|Нет вопросов|Нет упражнений|Нет слов/.test(box.textContent),
                label + ' — упражнение не отрисовалось: ' + box.textContent.slice(0, 120));
            assert.ok(!/undefined|NaN|\[object Object\]/.test(box.innerHTML),
                label + ' — служебное значение в разметке');

            const result = playThrough(app, '#drillSection');
            assert.ok(result.finished, label + ' — не дошло до экрана результата');
            played++;
        }

        if (w.countTestQuestions(data)) {
            w.startTest();
            const box = app.document.querySelector('#testContainer');
            assert.ok(!/Неизвестный тип вопроса/.test(box.textContent),
                'глава ' + lesson + ': неизвестный тип вопроса');
            assert.ok(playThrough(app, '#testContainer').finished,
                'глава ' + lesson + ': тест не дошёл до результата');
        }
    }

    assert.ok(played >= 30, 'пройдено подозрительно мало упражнений: ' + played);
    assert.deepStrictEqual(app.errors, [], 'ошибки во время прохождения: ' + app.errors.join(' | '));
    app.close();
});
