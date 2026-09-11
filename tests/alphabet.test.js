// ============================================================
// АЛФАВИТ И ЧТЕНИЕ: УПРАЖНЕНИЯ СВЕРЯЮТСЯ С ДАННЫМИ КУРСА
// ============================================================
// Первый урок каждого курса — алфавит, второй — чтение (в еврейском это
// огласовка). Упражнения там спрашивают не о словах, а о буквах и знаках, и
// держатся на одном пуле: GREEK_ALPHABET в data/lessons.js, HEBREW_ALPHABET
// в data/hebrew-lessons.js — его же выдаёт courseAlphabet().
//
// Пул — единственное место, где алфавит записан целиком. На него ссылаются и
// вопросы, и варианты ответа, и таблица в грамматике; разойдись они — и
// приложение станет учить одной букве, а спрашивать о другой. Глазами этого не
// видно: 24 строки таблицы и 24 буквы пула выглядят совершенно одинаково.
//
// Поэтому здесь пул сверяется с тем, что видит ученик: с таблицей букв, со
// списком дифтонгов, с буллетами конечных форм, с таблицей огласовки. А знаки
// придыхания, ударения и звук огласовки выводятся из самого Unicode: диакритика,
// поставленная не над той буквой, в тексте выглядит правильно — и только
// разложение показывает, что это ἄ, а не ἅ.
//
// Чего тест НЕ проверяет: верность произношения (это вопрос к пособию, а не
// к коду) и то, что буквы пула существуют в природе.

const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./helpers/app.js');

// Курс задан настройкой: приложение поднимается сразу в нужном, без кликов по
// стартовому экрану. app_course — тот, что открыт, app_default_course — «не
// спрашивать при запуске».
const GREEK = { storage: { app_course: 'greek', app_default_course: 'greek' } };
const HEBREW = { storage: { app_course: 'hebrew', app_default_course: 'hebrew' } };

const GREEK_KEYS = ['letter_name', 'letter_from_name', 'letter_sound', 'letter_order',
    'letter_case_lower', 'letter_case_upper', 'diphthong_sound', 'breathing_type'];
const HEBREW_KEYS = ['letter_name', 'letter_from_name', 'letter_sound', 'letter_order',
    'heb_letter_translit', 'heb_letter_final', 'heb_letter_guttural', 'heb_begadkefat',
    'heb_vowel_name', 'heb_vowel_sound'];
const ALPHABET_KEYS = GREEK_KEYS.concat('accent_type', HEBREW_KEYS);

// --- разбор разметки грамматики -------------------------------------------
// Грамматика — поток <br>, и таблицы в нём настоящие. jsdom для этого не нужен:
// сверяем текст, а не узлы, и разбор здесь ровно такой, каким его видит
// renderGrammarHtml() — таблица целиком, строка целиком, ячейка без тегов.

// Теги снимаются до неподвижной точки: один проход оставил бы тег, собранный
// из обломков другого («<scr<b>ipt>» → «<script>»).
function withoutTags(html) {
    let s = String(html), prev;
    do {
        prev = s;
        s = s.replace(/<[^>]*>/g, '');
    } while (s !== prev);
    return s;
}

function stripTags(html) {
    return withoutTags(html).replace(/&nbsp;/g, ' ').trim();
}

function tables(html) {
    return html.match(/<table[^>]*>[\s\S]*?<\/table>/g) || [];
}

function rows(table) {
    return table.match(/<tr>[\s\S]*?<\/tr>/g) || [];
}

// Ячейки строки: заголовок таблицы (<th>) отличает её шапку от строк с данными.
function cells(row) {
    return (row.match(/<t[hd][^>]*>[\s\S]*?<\/t[hd]>/g) || []).map(stripTags);
}

// Строки с данными — те, где есть <td>: шапка таблицы состоит из одних <th>,
// а вот строка вроде «<th>Краткие</th><td…» — это данные, и её терять нельзя.
function dataRows(table) {
    return rows(table).filter(r => /<td/.test(r)).map(cells);
}

// Ячейки с данными: <th> в этих таблицах — либо шапка, либо название строки
// («Краткие»), и знаком огласовки оно не является.
function tdCells(row) {
    return (row.match(/<td[^>]*>[\s\S]*?<\/td>/g) || []).map(stripTags);
}

// --- вывод знаков из Unicode ----------------------------------------------
// Придыхания и ударения в греческом — комбинирующие знаки после гласной.
// Снимаем придыхание, чтобы сравнить название буквы с тем, что напечатано
// в таблице: там придыхания может и не быть.

function stripBreathings(s) {
    return s.normalize('NFD').replace(/[\u0313\u0314]/g, '').normalize('NFC');
}

function marks(s) {
    return s.normalize('NFD').match(/[\u0300-\u036F]/g) || [];
}

// Ударная гласная названия буквы с убранным придыханием: у ἄλφα это ά, у ἒ
// ψιλόν — ὲ. Именно из этих девяти знаков и собран пул ударений.
function stressedVowel(name) {
    const d = [...name.normalize('NFD')];
    for (let i = 0; i < d.length; i++) {
        if (!/[\u0301\u0300\u0342]/.test(d[i])) continue;
        let base = d[i - 1];
        if (/[\u0313\u0314]/.test(base)) base = d[i - 2];
        return (base + d[i]).normalize('NFC');
    }
    return '';
}

// Звук огласовки по знаку. Знак лежит вместе с носителем (בַּ), а звук задаёт
// только сама огласовка — поэтому идём по комбинирующим знакам, а шурек узнаём
// отдельно: это не огласовка, а вав с точкой внутри.
const VOWEL_SOUND = {
    '\u05B7': '[а]', '\u05B8': '[а]', '\u05B2': '[а]',
    '\u05B6': '[э]', '\u05B5': '[э]', '\u05B1': '[э]',
    '\u05B4': '[и]', '\u05BB': '[у]',
    '\u05B9': '[о]', '\u05B3': '[о]'
};

function vowelSound(sign) {
    if (sign.includes('\u05D5\u05BC')) return '[у]';
    for (const ch of sign) if (VOWEL_SOUND[ch]) return VOWEL_SOUND[ch];
    return '';
}

// Согласные, которые дописаны к знаку как matres lectionis: «камец хе» — это
// камец плюс ה, и название знака называет эту букву последним словом. Шурек —
// тот же случай, только название букву не называет: шурек и есть точка в вав.
const MATRES = { 'хе': 'ה', 'йод': 'י', 'вав': 'ו', 'шурек': 'ו' };

// ==========================================================================

test('пул букв каждого курса — полный алфавит с названием, звуком и транслитом', () => {
    const app = loadApp(GREEK);
    const pools = JSON.parse(app.get(
        'JSON.stringify({ greek: COURSES.greek.alphabet, hebrew: COURSES.hebrew.alphabet })'));
    app.close();

    const greek = pools.greek;
    const hebrew = pools.hebrew;

    assert.strictEqual(greek.letters.length, 24, 'в греческом алфавите 24 буквы');
    assert.strictEqual(hebrew.letters.length, 22, 'в еврейском алфавите 22 буквы');
    assert.strictEqual(greek.letters[0].letter, 'α');
    assert.strictEqual(greek.letters[23].letter, 'ω');
    assert.strictEqual(hebrew.letters[0].letter, 'א');
    assert.strictEqual(hebrew.letters[21].letter, 'ת');

    // Наборы знаков у курсов разные, и пул — не свалка на всякий случай:
    // дифтонги бывают только в греческом, конечные формы и огласовка —
    // только в еврейском.
    assert.ok(greek.diphthongs && greek.diphthongs.length, 'в греческом пуле нет дифтонгов');
    assert.ok(greek.breathings && greek.breathings.length, 'в греческом пуле нет придыханий');
    assert.ok(greek.accents && greek.accents.length, 'в греческом пуле нет ударений');
    assert.strictEqual(greek.finals, undefined, 'конечные формы — не греческое');
    assert.strictEqual(greek.vowels, undefined, 'огласовка — не греческое');
    assert.strictEqual(hebrew.diphthongs, undefined, 'дифтонгов в иврите нет');
    assert.strictEqual(hebrew.breathings, undefined, 'придыханий в иврите нет');
    assert.strictEqual(hebrew.accents, undefined, 'ударений в еврейском пуле нет');
    assert.strictEqual(hebrew.finals.length, 5);
    assert.strictEqual(hebrew.vowels.length, 15);

    // Пул — источник вариантов ответа: пустое поле здесь значит пустую кнопку,
    // а повтор — две верные кнопки сразу.
    const rules = [
        ['греческий', greek, ['letter', 'upper', 'name', 'sound']],
        ['еврейский', hebrew, ['letter', 'name', 'translit', 'sound']]
    ];
    for (const [course, pool, fields] of rules) {
        pool.letters.forEach((l, i) => {
            for (const f of fields) {
                assert.ok(String(l[f] || '').length,
                    course + ': у буквы №' + i + ' (' + l.letter + ') пустое поле ' + f);
            }
        });
        // Звук в проверку повторов не входит намеренно: одинаково звучащих букв
        // в алфавите хоть отбавляй (ה и ח — обе [х]). Повторы разбирает
        // otherValues(), поэтому здесь важно обратное — что повторы есть.
        for (const f of ['letter', 'upper', 'name', 'translit']) {
            const vals = pool.letters.map(l => l[f]).filter(v => v !== undefined);
            assert.strictEqual(new Set(vals).size, vals.length,
                course + ': повтор в поле ' + f + ' — это два одинаковых варианта ответа');
        }
    }

    const hebrewSounds = hebrew.letters.map(l => l.sound);
    assert.ok(new Set(hebrewSounds).size < hebrewSounds.length,
        'в еврейском алфавите ожидались одинаково звучащие буквы');
});

test('пул алфавита — свойство курса, а не константа', () => {
    const app = loadApp(GREEK);
    const w = app.window;

    assert.strictEqual(app.get('courseAlphabet().letters.length'), 24);
    assert.strictEqual(app.get('courseAlphabet().letters[0].name'), 'ἄλφα');

    w.applyCourse('hebrew');
    assert.strictEqual(app.get('courseAlphabet().letters.length'), 22);
    assert.strictEqual(app.get('courseAlphabet().letters[0].translit'), 'ʾ');
    assert.strictEqual(app.get('courseAlphabet().finals.length'), 5);

    w.applyCourse('greek');
    assert.strictEqual(app.get('courseAlphabet().letters.length'), 24);
    assert.strictEqual(app.get('courseAlphabet().accents.length'), 9);
    app.close();
});

test('таблица букв урока 1 совпадает с пулом греческого алфавита', () => {
    const app = loadApp(GREEK);
    const grammar = app.get('getLessonData(1).grammar');
    const pool = JSON.parse(app.get('JSON.stringify(GREEK_ALPHABET.letters)'));
    app.close();

    const table = tables(grammar)[0];
    assert.ok(table, 'в грамматике урока 1 нет таблицы букв');
    const list = dataRows(table);
    assert.strictEqual(list.length, pool.length, 'в таблице не 24 строки');

    // Названия сверяем дважды: дословно и со снятым придыханием. Дословно
    // расходится одна строка — у альфы в таблице стоит одно ударение (άλφα),
    // а в пуле ещё и придыхание (ἄλφα): придыхание и есть предмет урока.
    const rawDiff = [];

    list.forEach((row, i) => {
        const letter = pool[i];
        assert.strictEqual(row[0], letter.upper, 'строка ' + i + ': прописная буква');
        // В строке сигмы стоят обе формы, σ (ς): вопрос о строчной.
        assert.strictEqual(row[1].split(' ')[0], letter.letter, 'строка ' + i + ': строчная буква');
        if (row[2] !== letter.name) rawDiff.push(letter.letter);
        assert.strictEqual(stripBreathings(row[2]), stripBreathings(letter.name),
            'строка ' + i + ': название буквы расходится не только придыханием');
        // Произношение украшено пояснением в скобках: «[о] (долгий)», «[с] (в
        // конце слова ς)». Сам звук — то, что стоит до пояснения.
        assert.ok(row[3] === letter.sound || row[3].startsWith(letter.sound + ' '),
            'строка ' + i + ': произношение «' + row[3] + '» против «' + letter.sound + '»');
    });

    assert.strictEqual(rawDiff.join(','), 'α',
        'дословно от таблицы отличается не одна альфа: ' + rawDiff.join(', '));

    // И это расхождение — ровно придыхание: в таблице ἄλφα напечатано без него.
    assert.ok(hasBreathing(pool[0].name), 'в пуле у альфы нет придыхания');
    assert.ok(!hasBreathing(list[0][2]), 'в таблице у альфы придыхание всё-таки стоит');
});

// Придыхание, снятое в пособии при наборе таблицы: тонкое (0313) или густое (0314).
function hasBreathing(name) {
    return marks(name).some(m => m === '\u0313' || m === '\u0314');
}

test('таблица букв главы 1 совпадает с пулом еврейского алфавита', () => {
    const app = loadApp(GREEK);
    const grammar = app.get('HEBREW_LESSONS_DATA[1].grammar');
    const pool = JSON.parse(app.get('JSON.stringify(HEBREW_ALPHABET.letters)'));
    const finals = JSON.parse(app.get('JSON.stringify(HEBREW_ALPHABET.finals)'));
    app.close();

    const list = dataRows(tables(grammar)[0]);
    assert.strictEqual(list.length, pool.length, 'в таблице не 22 строки');

    // В ячейке буквы стоит то, что печатает пособие: «כּ / כ (ך)» — смычная и
    // щелевая формы, а в скобках конечная. Пул хранит по одной букве на строку,
    // поэтому вариант после косой черты и есть та буква, о которой спрашивают,
    // а огласовку и дагеш надо снять: в пуле буква голая.
    const parenthetical = [];
    list.forEach((row, i) => {
        const letter = pool[i];
        (row[0].match(/\(([^)]*)\)/g) || []).forEach(p => parenthetical.push(p.slice(1, -1)));
        assert.strictEqual(bareLetter(row[0]), letter.letter, 'строка ' + i + ': буква');
        assert.strictEqual(row[1], letter.name, 'строка ' + i + ': название');
        assert.strictEqual(row[2], letter.translit, 'строка ' + i + ': транслитерация');
        // У א и ע в графе произношения стоит прочерк: они не произносятся.
        const sound = row[3] === '—' ? 'не произносится' : row[3];
        assert.strictEqual(sound, letter.sound, 'строка ' + i + ': произношение');
    });

    assert.strictEqual(parenthetical.join(''), finals.map(f => f.final).join(''),
        'конечные формы из таблицы разошлись с пулом');
});

// «כּ / כ (ך)» -> «כ»: последняя альтернатива, без скобок и без знаков.
function bareLetter(cell) {
    return cell.replace(/\([^)]*\)/g, '')
        .split('/').pop().trim()
        .normalize('NFD').replace(/[\u0591-\u05C7]/g, '').normalize('NFC');
}

test('дифтонги в грамматике урока 1 — тот же список, что в пуле', () => {
    const app = loadApp(GREEK);
    const grammar = app.get('getLessonData(1).grammar');
    const pool = JSON.parse(app.get('JSON.stringify(GREEK_ALPHABET.diphthongs)'));
    const questions = JSON.parse(app.get('JSON.stringify(getLessonData(1).exercises.diphthong_sound)'));
    const letters = JSON.parse(app.get('JSON.stringify(GREEK_ALPHABET.letters.map(l => l.letter))'));
    app.close();

    const line = /<b>Дифтонги:<\/b>([^<]*)/.exec(grammar);
    assert.ok(line, 'в грамматике урока 1 нет строки дифтонгов');
    const printed = line[1].split(',').map(s => s.trim()).filter(Boolean).map(s => {
        const m = /^(\S+)\s*\[([^\]]+)\]/.exec(s);
        assert.ok(m, 'не разобрал дифтонг: «' + s + '»');
        return m[1] + '|[' + m[2] + ']';
    });

    assert.strictEqual(pool.length, 8, 'в пуле не восемь дифтонгов');
    assert.strictEqual(pool.map(d => d.diphthong + '|' + d.sound).join(', '), printed.join(', '),
        'список дифтонгов в пуле и в грамматике разошёлся');
    assert.strictEqual(questions.map(q => q.diphthong).join(','), pool.map(d => d.diphthong).join(','),
        'вопросы не совпадают с пулом дифтонгов');

    // Дифтонг — это две буквы алфавита, а не что-то своё.
    pool.forEach(d => {
        assert.strictEqual([...d.diphthong].length, 2, 'дифтонг ' + d.diphthong + ' не из двух букв');
        for (const ch of d.diphthong) {
            assert.ok(letters.includes(ch), 'в дифтонге ' + d.diphthong + ' буква ' + ch + ' не из алфавита');
        }
    });
});

test('придыхания стоят попарно на трёх гласных и выведены из Unicode', () => {
    const app = loadApp(GREEK);
    const pool = JSON.parse(app.get('JSON.stringify(GREEK_ALPHABET.breathings)'));
    const questions = JSON.parse(app.get('JSON.stringify(getLessonData(1).exercises.breathing_type)'));
    app.close();

    const KIND = { '\u0314': 'Густое (с [х])', '\u0313': 'Тонкое (не произносится)' };

    assert.strictEqual(pool.length, 6, 'придыханий шесть: густое и тонкое на трёх гласных');
    assert.strictEqual(questions.map(q => q.sign).join(','), pool.map(b => b.sign).join(','),
        'вопросы не совпадают с пулом придыханий');

    const byBase = {};
    for (const b of pool) {
        // Знак придыхания — комбинирующий: над гласной он один, и разложение
        // говорит, какое именно это придыхание. Название знака — это и есть
        // его Unicode-имя, записанное по-русски.
        const m = marks(b.sign);
        assert.strictEqual(m.length, 1, b.sign + ': знаков на гласной ' + m.length + ', а не один');
        assert.strictEqual(KIND[m[0]], b.correct, b.sign + ': придыхание не то, что нарисовано');

        const base = b.sign.normalize('NFD')[0];
        (byBase[base] = byBase[base] || []).push(b.sign);
    }

    // Пул собран из трёх гласных: α, η и ω. Пары предсобранных знаков в
    // Unicode идут подряд (ἀ 1F00 / ἁ 1F01), и это видно по кодовым точкам:
    // младшая из пары — тонкое придыхание, старшая — густое.
    assert.strictEqual(Object.keys(byBase).sort().join(','), ['α', 'η', 'ω'].sort().join(','),
        'придыхания стоят не на трёх ожидаемых гласных');
    for (const base of Object.keys(byBase)) {
        const pair = byBase[base];
        assert.strictEqual(pair.length, 2, 'у ' + base + ' не пара придыханий');
        const [lo, hi] = pair.map(s => s.codePointAt(0)).sort((a, b) => a - b);
        assert.strictEqual(hi - lo, 1, 'пара придыханий на ' + base + ' не соседние кодовые точки');
    }
});

test('ударения — те же девять знаков, что сняты с названий букв', () => {
    const app = loadApp(GREEK);
    const pool = JSON.parse(app.get('JSON.stringify(GREEK_ALPHABET.accents)'));
    const letters = JSON.parse(app.get('JSON.stringify(GREEK_ALPHABET.letters)'));
    const questions = JSON.parse(app.get('JSON.stringify(getLessonData(2).exercises.accent_type)'));
    app.close();

    const KIND = { '\u0301': 'Острое', '\u0300': 'Тупое', '\u0342': 'Облеченное' };

    assert.strictEqual(pool.length, 9, 'знаков ударения девять');
    assert.strictEqual(questions.length, 9, 'в уроке 2 не девять вопросов об ударении');

    const signs = [];
    for (const a of pool) {
        const m = marks(a.sign);
        // Придыхание в знак ударения не входит: ἄλφα спрашивается как ά, иначе
        // вопрос был бы сразу о двух знаках.
        assert.strictEqual(m.length, 1, a.sign + ': знаков ' + m.length + ', а не один');
        assert.strictEqual(KIND[m[0]], a.correct, a.sign + ': ударение не то, что нарисовано');
        assert.ok(['Острое', 'Тупое', 'Облеченное'].includes(a.correct), a.sign + ': неизвестное ударение');
        signs.push(a.sign);
    }
    assert.strictEqual(new Set(signs).size, signs.length, 'в пуле ударений есть повтор знака');
    assert.deepStrictEqual([...new Set(pool.map(a => a.correct))].sort(),
        ['Облеченное', 'Острое', 'Тупое'], 'не все три ударения попали в пул');

    // Придыхания нет ни у одного знака: иначе разложение содержало бы 0313/0314.
    pool.forEach(a => assert.ok(!/[\u0313\u0314]/.test(a.sign.normalize('NFD')),
        a.sign + ': в знаке ударения осталось придыхание'));

    // Знаки не выдуманы: каждый — ударная гласная одного из названий букв.
    const derived = new Set();
    for (const l of letters) {
        const v = stressedVowel(l.name);
        assert.ok(v, 'в названии «' + l.name + '» не нашлось ударной гласной');
        derived.add(v);
    }
    assert.strictEqual([...derived].sort().join(','), [...new Set(signs)].sort().join(','),
        'пул ударений разошёлся с тем, что снято с названий букв');
});

test('конечные формы букв — пять буллетов главы 1 и пять вопросов', () => {
    const app = loadApp(GREEK);
    const grammar = app.get('HEBREW_LESSONS_DATA[1].grammar');
    const pool = JSON.parse(app.get('JSON.stringify(HEBREW_ALPHABET.finals)'));
    const letters = JSON.parse(app.get('JSON.stringify(HEBREW_ALPHABET.letters.map(l => l.letter))'));
    const questions = JSON.parse(app.get('JSON.stringify(HEBREW_LESSONS_DATA[1].exercises.heb_letter_final)'));
    app.close();

    const bullet = /• <span class="script">([^<]+)<\/span> → <span class="script">([^<]+)<\/span>/g;
    const printed = [];
    let m;
    while ((m = bullet.exec(grammar))) printed.push(m[1] + '|' + m[2]);

    assert.strictEqual(pool.length, 5, 'конечных форм пять');
    assert.strictEqual(printed.length, 5, 'в грамматике не пять буллетов о конечных формах');
    assert.strictEqual(pool.map(f => f.letter + '|' + f.final).join(', '), printed.join(', '),
        'список конечных форм в пуле и в грамматике разошёлся');
    assert.strictEqual(questions.map(q => q.letter).join(','), pool.map(f => f.letter).join(','),
        'вопросы не совпадают с пулом конечных форм');

    pool.forEach(f => {
        assert.ok(letters.includes(f.letter), f.letter + ' — не буква алфавита');
        assert.ok(!letters.includes(f.final), f.final + ' попала и в обычные буквы, и в конечные');
        assert.ok([...f.final].length === 1, 'конечная форма — одна буква');
        // Конечное начертание стоит в блоке Unicode ровно перед обычным:
        // ך 05DA перед כ 05DB, ץ 05E5 перед צ 05E6. Так их и собрали.
        assert.strictEqual(f.final.codePointAt(0), f.letter.codePointAt(0) - 1,
            f.final + ' не стоит в таблице Unicode вплотную перед ' + f.letter);
    });
});

test('таблица огласовки главы 2 совпадает с пулом знаков', () => {
    const app = loadApp(GREEK);
    const grammar = app.get('HEBREW_LESSONS_DATA[2].grammar');
    const pool = JSON.parse(app.get('JSON.stringify(HEBREW_ALPHABET.vowels)'));
    const byName = JSON.parse(app.get('JSON.stringify(HEBREW_LESSONS_DATA[2].exercises.heb_vowel_name)'));
    const bySound = JSON.parse(app.get('JSON.stringify(HEBREW_LESSONS_DATA[2].exercises.heb_vowel_sound)'));
    app.close();

    // Ячейка таблицы — «знак с носителем» и название через пробел, как в пособии:
    // «בַּ патах». Пустые ячейки (долгие и, у и сверхкраткие) пропускаем: это не
    // знаки, а место, где пособие их не даёт.
    const printed = [];
    let empty = 0;
    for (const row of rows(tables(grammar)[0])) {
        for (const cell of tdCells(row)) {
            if (cell === '') { empty++; continue; }
            const sp = cell.indexOf(' ');
            assert.ok(sp > 0, 'не разобрал ячейку огласовки: «' + cell + '»');
            printed.push({ sign: cell.slice(0, sp), name: cell.slice(sp + 1) });
        }
    }
    assert.strictEqual(printed.length, 16, 'в таблице огласовки не 16 непустых ячеек');
    assert.strictEqual(empty, 4, 'в таблице огласовки не 4 пустые клетки');

    // Камец и камец хатуф выглядят одинаково (בָּ), различает их только слог:
    // в таблице это две ячейки с одним начертанием и разными названиями.
    // Спрашивать про такое начертание дважды нельзя — было бы два верных ответа
    // на один вопрос, поэтому в пуле у каждого знака ровно одно название.
    const poolSigns = pool.map(v => v.sign);
    assert.strictEqual(new Set(poolSigns).size, pool.length,
        'в пуле огласовки два знака с одним начертанием — у вопроса два верных ответа');
    assert.strictEqual([...new Set(printed.map(p => p.sign))].length, pool.length,
        'в таблице не столько же начертаний, сколько знаков в пуле');

    const asked = new Set(byName.map(q => q.sign));
    assert.strictEqual(asked.size, pool.length, 'спросили не про каждый знак пула');
    assert.strictEqual(bySound.length, pool.length, 'про звук спросили не каждый знак');

    for (const v of pool) {
        const cell = printed.find(p => p.sign === v.sign && p.name === v.name);
        assert.ok(cell, 'знака «' + v.sign + ' ' + v.name + '» нет в таблице огласовки');
        assert.strictEqual(vowelSound(v.sign), v.sound,
            v.name + ': звук не тот, что даёт огласовка ' + v.sign);
        assert.ok(byName.some(q => q.sign === v.sign && q.correct === v.name),
            'heb_vowel_name: ответ для ' + v.sign + ' не совпал с пулом');

        // Matres lectionis: «камец хе» — это камец и буква ה, и последнее слово
        // названия называет именно её. Шурек — единственный, чьё название букву
        // не называет: он сам и есть точка внутри вав.
        const extra = [...v.sign.replace('בּ', '')].filter(ch => /[\u05D0-\u05EA]/.test(ch));
        const matres = MATRES[v.name.split(' ').pop()];
        assert.strictEqual(extra.length, matres ? 1 : 0,
            v.name + ': буква при знаке есть, а название о ней не говорит (или наоборот)');
        if (matres) assert.strictEqual(extra[0], matres, v.name + ': при знаке не та буква');
    }

    // Прочерк в таблице — это про א и ע, а не про огласовку.
    assert.ok(bySound.every(q => /^\[[аэиоу]\]$/.test(q.sound)),
        'звук огласовки должен быть одной из пяти гласных');
});

test('бегадкефат: буква и её вид названы так же, как в таблицах пособия', () => {
    const app = loadApp(GREEK);
    const grammar = app.get('HEBREW_LESSONS_DATA[1].grammar');
    const chapter1 = JSON.parse(app.get('JSON.stringify(HEBREW_LESSONS_DATA[1].exercises.heb_begadkefat)'));
    const chapter3 = JSON.parse(app.get('JSON.stringify(HEBREW_LESSONS_DATA[3].exercises.heb_begadkefat)'));
    const letters = JSON.parse(app.get('JSON.stringify(HEBREW_ALPHABET.letters)'));
    const finals = JSON.parse(app.get('JSON.stringify(HEBREW_ALPHABET.finals)'));
    app.close();

    // Таблица транслитерации из начала главы: «בּ / ב» и «b / ḇ».
    const alphabet = {};
    for (const row of dataRows(tables(grammar)[0])) {
        alphabet[bareLetter(row[0])] = { translit: row[2].split('/').map(s => s.trim()) };
    }
    assert.strictEqual(Object.keys(alphabet).length, 22);

    const stopping = rows(tables(grammar)[1]).filter(r => /Смычные/.test(r))[0];
    const fricative = rows(tables(grammar)[1]).filter(r => /Щелевые/.test(r))[0];
    assert.ok(stopping && fricative, 'в главе 1 нет таблицы бегадкефат');
    // Ячейка строки — одна буква, поэтому берём их списком, а не склейкой:
    // дагеш — комбинирующий знак, и в склейке он отсортировался бы вперёд букв.
    const stopLetters = cells(stopping).slice(1);
    const fricativeLetters = cells(fricative).slice(1);
    const tableLetters = stopLetters.concat(fricativeLetters);

    assert.ok(stopLetters.length === 6 && fricativeLetters.length === 6,
        'в таблице бегадкефат не по шесть букв в каждой строке');
    assert.strictEqual(chapter1.length, 12, 'в главе 1 не 12 вопросов о бегадкефат');
    // В таблице шесть смычных и шесть щелевых идут двумя строками, а вопросы —
    // парами «смычная, щелевая» на каждую букву. Состав должен совпасть.
    assert.strictEqual([...new Set(chapter1.map(q => q.letter))].sort().join(''),
        [...tableLetters].sort().join(''),
        'вопросы главы 1 разошлись с таблицей бегадкефат');

    for (const q of chapter1.concat(chapter3)) {
        const letter = bareLetter(q.letter);
        // В главе 3 спрашивают и о конечной форме (ךְ) — обычная у неё כ.
        const base = finals.find(f => f.final === letter);
        const regular = base ? base.letter : letter;
        const pair = alphabet[regular];
        assert.ok(pair, 'буква ' + q.letter + ' не из алфавита');
        assert.ok(tableLetters.includes(regular), q.letter + ' — не буква бегадкефат');
        // Дагеш — точка внутри буквы; это и есть различие смычной и щелевой.
        const kind = q.letter.includes('\u05BC') ? 0 : 1;
        assert.strictEqual(q.correct, pair.translit[kind] + ', ' +
            (kind === 0 ? 'смычное' : 'щелевое'), q.letter + ': подпись собрана не по таблице');
        assert.strictEqual(q.distractors.length, 1, q.letter + ': у вопроса больше одного неверного варианта');
        assert.ok(/смычное|щелевое/.test(q.distractors[0]), q.letter + ': неверный вариант без вида буквы');
        assert.notStrictEqual(q.distractors[0], q.correct, q.letter + ': неверный вариант совпал с ответом');
    }

    // Глава 1 и глава 3 спрашивают об одном и том же одними словами: подписи —
    // не текст вопроса, а название вида буквы, и двух наборов быть не должно.
    const labels = list => new Set(list.flatMap(q => [q.correct].concat(q.distractors)));
    const used = labels(chapter1);
    for (const label of labels(chapter3)) {
        assert.ok(used.has(label), 'подпись «' + label + '» из главы 3 не встречается в главе 1');
    }
});

test('гортанные — те четыре буквы, что названы в пособии', () => {
    const app = loadApp(GREEK);
    const grammar = app.get('HEBREW_LESSONS_DATA[1].grammar');
    const questions = JSON.parse(app.get('JSON.stringify(HEBREW_LESSONS_DATA[1].exercises.heb_letter_guttural)'));
    app.close();

    // «Гортанных согласных четыре: א, ע, ה и ח. Согласный ר тоже часто ведёт
    // себя как гортанный» — названа гортанной четвёрка, ר только ведёт себя так.
    const plain = withoutTags(grammar);
    const m = /Гортанных согласных четыре:([\s\S]*?)\./.exec(plain);
    assert.ok(m, 'в главе 1 нет фразы о гортанных');
    const four = m[1].match(/[\u05D0-\u05EA]/g) || [];
    assert.strictEqual(four.join(''), 'אעהח', 'в пособии названы не א, ע, ה и ח: ' + four.join(''));
    assert.ok(/Согласный\s*ר\s*тоже/.test(plain), 'в пособии не сказано отдельно про ר');

    const yes = questions.filter(q => q.correct === 'Гортанная').map(q => q.letter);
    assert.strictEqual(yes.join(''), four.join(''), 'в вопросах гортанные не те, что названы в пособии');
    assert.ok(!yes.includes('ר'), 'реш назван гортанной, а пособие говорит «ведёт себя как»');

    // «Не гортанная» — тоже ответ, поэтому в вопросах должны быть и другие буквы.
    const no = questions.filter(q => q.correct === 'Не гортанная');
    assert.ok(no.length > 0, 'нет вопросов с ответом «не гортанная»');
    no.forEach(q => assert.ok(!four.includes(q.letter), q.letter + ' названа не гортанной'));
    questions.forEach(q => assert.ok(
        q.correct === 'Гортанная' || q.correct === 'Не гортанная', 'неожиданный ответ: ' + q.correct));
});

test('«какая буква следом» спрашивает про каждую букву, кроме последней', () => {
    const courses = [
        ['greek', GREEK, 23, 'ω', 'αβγδεζηθικλμνξοπρστυφχψω'],
        ['hebrew', HEBREW, 21, 'ת', 'אבגדהוזחטיכלמנסעפצקרשת']
    ];

    for (const [id, opts, count, last, order] of courses) {
        const app = loadApp(opts);
        const w = app.window;
        const questioned = w.getLessonData(1).exercises.letter_order.map(q => q.letter);

        assert.strictEqual(questioned.length, count, id + ': не ' + count + ' вопросов о порядке');
        assert.strictEqual(questioned.join(''), order.slice(0, -1),
            id + ': буквы спрашивают не по порядку алфавита');
        assert.ok(!questioned.includes(last), id + ': у последней буквы спрашивают, что за ней');

        // Ответ — следующая буква того же пула, а не что-то отдельно записанное.
        const wrong = app.get(`(function () {
            let letters = courseAlphabet().letters.map(l => l.letter);
            let out = [];
            for (let q of getExercises(1, 'letter_order')) {
                let i = letters.indexOf(q.letter);
                if (exerciseCorrect(EXERCISE_TYPES.letter_order, q) !== letters[i + 1]) out.push(q.letter);
            }
            return out.join(',');
        })()`);
        assert.strictEqual(wrong, '', id + ': ответ не совпал с соседней буквой у ' + wrong);
        // У последней буквы следующей нет: alphabetSuccessor отдаёт пустую
        // строку — и по ней же видно, что в пул не попала лишняя буква.
        assert.strictEqual(app.get(
            `alphabetSuccessor(courseAlphabet().letters[${count}].letter)`), '',
            id + ': у последней буквы нашёлся последователь');
        assert.strictEqual(app.get('courseAlphabet().letters.length'), count + 1,
            id + ': в пуле не ' + (count + 1) + ' букв');
        app.close();
    }
});

test('у каждого вопроса алфавита есть верный ответ среди вариантов', () => {
    // Это не формальность: варианты собирает otherValues(), а она возвращает
    // только неверные значения. Вид, забывший добавить к ним верное, спрашивает
    // то, на что нельзя ответить, — и внешне это совершенно нормальный вопрос.
    const greek = loadApp(GREEK);
    const greekProblems = optionsProblems(greek, GREEK_KEYS.concat('accent_type'));
    greek.close();
    assert.strictEqual(greekProblems, '', 'греческий курс: ' + greekProblems);

    const hebrew = loadApp(HEBREW);
    const hebrewProblems = optionsProblems(hebrew, HEBREW_KEYS);
    hebrew.close();
    assert.strictEqual(hebrewProblems, '', 'еврейский курс: ' + hebrewProblems);
});

// Разбор вариантов ответа всех вопросов списка видов: пустой вариант — пустая
// кнопка, повтор — вторая верная кнопка, «undefined» — поле, которого нет
// в данных курса.
function optionsProblems(app, keys) {
    return app.get(`(function () {
        let keys = ${JSON.stringify(keys)};
        let out = [];
        for (let key of keys) {
            let type = EXERCISE_TYPES[key];
            if (!type || !type.prompt) { out.push(key + ': нет описания вида'); continue; }
            for (let lesson of lessonNumbers()) {
                for (let q of getExercises(lesson, key)) {
                    let corr = String(exerciseCorrect(type, q));
                    let opts = exerciseOptions(type, q).map(String);
                    let where = key + ' (урок ' + lesson + ')';
                    if (!corr || corr === 'undefined' || corr === 'NaN') {
                        out.push(where + ': верный ответ пуст');
                    }
                    if (!opts.includes(corr)) out.push(where + ': «' + corr + '» нет среди вариантов');
                    if (opts.length < 2) out.push(where + ': вариантов меньше двух');
                    if (opts.some(o => !o.trim() || o === 'undefined' || o === 'NaN')) {
                        out.push(where + ': пустой или служебный вариант');
                    }
                    if (new Set(opts).size !== opts.length) out.push(where + ': повтор среди вариантов');
                }
            }
        }
        return [...new Set(out)].join(' | ');
    })()`);
}

test('алфавитные упражнения не считаются вводным материалом и есть в меню урока', () => {
    const app = loadApp(GREEK);
    const w = app.window;

    const plan = [
        ['greek', GREEK_KEYS, 1],
        ['greek', ['accent_type'], 2],
        ['hebrew', HEBREW_KEYS.slice(0, 8), 1],
        ['hebrew', HEBREW_KEYS.slice(8), 2]
    ];

    for (const [course, keys, lesson] of plan) {
        w.applyCourse(course);
        w.openLesson(lesson);
        const data = w.getLessonData(lesson);

        assert.strictEqual(w.isIntroLesson(lesson), false,
            course + ' ' + lesson + ': урок всё ещё вводный — упражнений в нём не будет');
        assert.ok(w.countLessonDrills(data) >= keys.length,
            course + ' ' + lesson + ': упражнений в меню меньше, чем видов');

        for (const key of keys) {
            // Вид обязан быть в меню: ключ данных без записи в LESSON_DRILL_GROUPS
            // ученику не виден, и вопроса как будто нет.
            const drill = w.findLessonDrill('exercise', key);
            assert.ok(drill, course + ': вид ' + key + ' не значится в меню упражнений');
            assert.ok(w.lessonDrillAvailable(data, drill),
                course + ' ' + lesson + ': вид ' + key + ' недоступен');
            assert.ok(w.getExercises(lesson, key).length > 0,
                course + ' ' + lesson + ': у вида ' + key + ' нет ни одного вопроса');
        }
    }

    // И ни один вид не осиротел: у каждого есть урок, где он спрашивается.
    for (const [course, keys] of [['greek', GREEK_KEYS.concat('accent_type')], ['hebrew', HEBREW_KEYS]]) {
        w.applyCourse(course);
        for (const key of keys) {
            const lessons = w.lessonNumbers().filter(n => w.getExercises(n, key).length > 0);
            assert.ok(lessons.length > 0, course + ': вид ' + key + ' не спрашивается ни в одном уроке');
        }
    }
    app.close();
});

test('подпись упражнения на регистр начинается с того, что показано', () => {
    // Стрелка в подписи читается «показано → выбирают», как в «Фразы: греческий →
    // русский». Первая версия подписала оба регистра наоборот: «Прописная к
    // строчной» показывала строчную σ и просила прописную.
    const app = loadApp(GREEK);
    const w = app.window;
    w.openLesson(1);
    for (const [key, shown, label] of [
        ['letter_case_lower', 'upper', 'Прописная → строчная'],
        ['letter_case_upper', 'letter', 'Строчная → прописная']
    ]) {
        assert.strictEqual(w.findLessonDrill('exercise', key).label, label, key + ': подпись');
        w.startLessonDrill('exercise', key);
        assert.strictEqual(app.appBarTitle(), label, key + ': заголовок экрана упражнения');
        assert.strictEqual(app.text('#exerciseQuestion .md-prompt-strong'),
            app.get('exerciseState.questions[exerciseState.index].' + shown),
            key + ': под вопросом не то, что названо первым');
    }
    assert.deepStrictEqual(app.errors, []);
    app.close();
});

test('под вопросом о букве стоит сама буква, а не русское название', () => {
    // Шрифт строки выбирается по самой строке (isScriptText), а не по курсу:
    // под вопросом о букве стоит то её начертание (ἄλφα, בּ), то русское
    // название (а́леф) — и это одни и те же виды в одном и том же курсе.
    const greek = loadApp(GREEK);
    const gw = greek.window;
    gw.openLesson(1);
    gw.startLessonDrill('exercise', 'letter_name');
    let box = greek.document.querySelector('#exerciseQuestion');
    assert.ok(box.querySelector('.md-prompt-strong'),
        'греческая буква под вопросом набрана не серифным шрифтом курса');
    assert.strictEqual(box.querySelector('.md-prompt-strong').textContent,
        greek.get('exerciseState.questions[exerciseState.index].letter'));
    assert.ok(box.querySelector('.options--script'), 'греческие названия букв — без .options--script');

    // Придыхание спрашивают о знаке, а знак — тоже изучаемый язык.
    gw.startLessonDrill('exercise', 'breathing_type');
    box = greek.document.querySelector('#exerciseQuestion');
    assert.strictEqual(box.querySelector('.md-prompt-strong').textContent,
        greek.get('exerciseState.questions[exerciseState.index].sign'));
    assert.ok(!box.querySelector('.options--script'), 'варианты придыхания — по-русски, не серифом');
    greek.close();

    const hebrew = loadApp(HEBREW);
    const hw = hebrew.window;
    hw.openLesson(1);
    // Буква — латинская транслитерация, буква иврита — серифом.
    hw.startLessonDrill('exercise', 'letter_name');
    box = hebrew.document.querySelector('#exerciseQuestion');
    assert.ok(box.querySelector('.md-prompt-strong'), 'буква иврита под вопросом набрана не тем шрифтом');
    assert.ok(!box.querySelector('.options--script'), 'названия букв иврита — по-русски, не серифом');

    // А вот вопрос по русскому названию — наоборот: подпись русская, варианты
    // на иврите.
    hw.startLessonDrill('exercise', 'letter_from_name');
    box = hebrew.document.querySelector('#exerciseQuestion');
    assert.ok(box.querySelector('.md-prompt-ru'), 'русское название подписано не интерфейсным шрифтом');
    assert.strictEqual(box.querySelector('.md-prompt-ru').textContent,
        hebrew.get('exerciseState.questions[exerciseState.index].name'));
    assert.ok(box.querySelector('.options--script'), 'варианты-буквы иврита — без .options--script');

    hw.openLesson(2);
    hw.startLessonDrill('exercise', 'heb_vowel_name');
    box = hebrew.document.querySelector('#exerciseQuestion');
    assert.ok(box.querySelector('.md-prompt-strong'), 'знак огласовки подписан не тем шрифтом');
    assert.ok(!box.querySelector('.options--script'), 'названия огласовок — по-русски, не серифом');

    assert.ok(!/undefined|NaN|\[object Object\]/.test(hebrew.html('#drillSection')),
        'в разметке алфавитного упражнения есть undefined/NaN');
    assert.deepStrictEqual(hebrew.errors, [], 'ошибки при отрисовке: ' + hebrew.errors.join(' | '));
    hebrew.close();
});
