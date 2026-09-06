// ============================================================
// ПОИСК В СЛОВАРЕ ВСЕХ СЛОВ
// ============================================================
let allVocabCache = null;
let vocabById = new Map();

// Урок 1 — это названия букв (ἄλφα, βῆτα…), а не лексика: в словарь он не идёт.
// Со второго урока начинаются настоящие слова — артикли и предлоги.
const VOCAB_FIRST_LESSON = 2;

function buildAllVocabCache() {
    let entries = [];
    let seen = new Set();
    vocabById = new Map();
    let idCounter = 0;
    let lessons = Object.keys(LESSONS_DATA)
        .map(Number)
        .filter(n => n >= VOCAB_FIRST_LESSON)
        .sort((a, b) => a - b);
    for (let l of lessons) {
        let data = getLessonData(l);
        if (!data || !data.vocabulary) continue;
        data.vocabulary.forEach(item => {
            let key = item.greek + '|' + (item.article || '');
            if (seen.has(key)) return;
            seen.add(key);
            let entry = {
                id: idCounter++,
                greek: item.greek,
                article: item.article || '',
                translation: item.translation,
                type: item.type || 'other',
                lesson: l,
                declension_forms: item.declension_forms || null
            };
            entries.push(entry);
            vocabById.set(entry.id, entry);
        });
    }
    entries.sort((a, b) => a.greek.localeCompare(b.greek));
    return entries;
}

const TYPE_LABELS = {
    noun: 'Существительные',
    verb: 'Глаголы',
    adjective: 'Прилагательные',
    preposition: 'Предлоги',
    pronoun: 'Местоимения',
    adverb: 'Наречия',
    conjunction: 'Союзы',
    other: 'Прочее'
};

// ------------------------------------------------------------
// Примеры употребления: ищем подлинные предложения из переводов и упражнений
// курса, где слово встречается в любой из своих форм.
// ------------------------------------------------------------

// Ударение в живом тексте «плавает»: острое на последнем слоге переходит в тупое
// перед следующим словом (ἀγαθός → ἀγαθοὺς λόγους), а энклитика навешивает на
// предыдущее слово второе ударение (λόγος ἐστίν). Поэтому при поиске словоформы
// ударения снимаем; придыхания и йоту подписную оставляем — они различают слова.
const GREEK_ACCENTS = /[\u0300\u0301\u0342]/g;
function foldAccents(s) {
    return String(s).normalize('NFD').replace(GREEK_ACCENTS, '').normalize('NFC');
}

// Слово — буквы с диакритикой плюс апостроф элизии (ἀλλ', ὑπ'). Сравниваем
// именно слова целиком: подстрокой ἐκ находится внутри ἐκκλησίαι, а οὐ — внутри
// οὐρανόν, и словарь показывал такие «примеры» как употребление предлога.
const GREEK_WORD_SOURCE = "[\\p{L}\\p{M}'\u2019]+";
function tokenizeGreek(text) {
    return (String(text).match(new RegExp(GREEK_WORD_SOURCE, 'gu')) || []).map(foldAccents);
}

// Артикли не считаются «содержательным» словом при проверке на тривиальность.
const ARTICLE_FORMS = new Set(['ὁ','ἡ','τό','οἱ','αἱ','τά','τόν','τήν','τοῦ','τῆς','τῷ','τῇ','τῶν','τοῖς','ταῖς','τούς','τάς'].map(foldAccents));

// Подвижное ν записано в данных как λύουσι(ν), ἐστί(ν); в предложениях оно
// встречается и с ν, и без него — в поиск идут оба варианта.
function addSearchForm(form, out) {
    if (!form) return;
    out.add(foldAccents(form));
    if (form.indexOf('(') !== -1) {
        out.add(foldAccents(form.replace(/[()]/g, '')));
        out.add(foldAccents(form.replace(/\([^)]*\)/g, '')));
    }
}

// Базовая форма + все словоформы слова — по ним ищем совпадения в предложениях.
function getWordSearchForms(entry) {
    let forms = new Set();
    addSearchForm((entry.greek || '').split(',')[0].split('(')[0].trim(), forms);
    if (entry.declension_forms) {
        (function walk(obj) {
            if (!obj) return;
            if (typeof obj === 'string') {
                addSearchForm(obj, forms);
                return;
            }
            if (typeof obj === 'object') Object.values(obj).forEach(walk);
        })(entry.declension_forms);
    }
    forms.delete('');
    return forms;
}

// Выделяем найденную форму слова жирным прямо в тексте примера.
function highlightWord(sentence, entry) {
    if (!sentence) return sentence;
    let forms = getWordSearchForms(entry);
    let re = new RegExp(GREEK_WORD_SOURCE, 'gu');
    let m;
    while ((m = re.exec(sentence)) !== null) {
        if (!forms.has(foldAccents(m[0]))) continue;
        return sentence.slice(0, m.index) + '<strong>' + m[0] + '</strong>' + sentence.slice(m.index + m[0].length);
    }
    return sentence;
}

// keywords — это список слов для проверки ответа, а не готовое предложение;
// склеиваем их в подобие фразы: пробелы вместо запятых, заглавная буква, точка.
function formatKeywordsAsSentence(keywords) {
    if (!keywords) return keywords;
    let parts = Array.isArray(keywords) ? keywords : String(keywords).split(',');
    parts = parts.map(p => String(p).trim()).filter(Boolean);
    let text = parts.join(' ');
    if (!text) return text;
    text = text.charAt(0).toUpperCase() + text.slice(1);
    if (!/[.!?]$/.test(text)) text += '.';
    return text;
}

// "Тривиальный" пример — фраза из одного знаменательного слова (артикль не в
// счёт) или дословный повтор словарной статьи: ἡ ὥρα, τῷ Χριστῷ, λύουσι(ν).
// Это не употребление слова, а сама словарная форма — показывать её незачем.
function isTrivialExample(greek, entry) {
    let lemma = foldAccents((entry.greek || '').split(',')[0].split('(')[0].trim());
    let content = tokenizeGreek(String(greek).replace(/\([^)]*\)/g, ''))
        .filter(t => !ARTICLE_FORMS.has(t));
    if (content.length <= 1) return true;
    return content.join(' ') === lemma;
}

// Слова из ru_to_el лежат россыпью — это фишки для сборки предложения, и точки
// в конце у них нет. Ставим её сами, повторяя знак из русского оригинала.
function endPunctFrom(russian) {
    let m = /([.!?])\s*$/.exec(String(russian || ''));
    return m ? m[1] : '.';
}

// Ищем до maxCount подлинных примеров по всему курсу: сначала в уроке самого
// слова, потом в остальных — иначе половина словаря остаётся без примеров,
// потому что слово вводится в одном уроке, а в предложениях живёт в следующих.
// Связные предложения из переводов идут раньше фраз из упражнений: там
// попадаются огрызки вроде «τῷ Χριστῷ», годные для зубрёжки, но не для примера.
function findUsageExamples(entry, maxCount) {
    if (entry._examples) return entry._examples;
    maxCount = maxCount || 3;
    let examples = [];
    let forms = getWordSearchForms(entry);
    let seen = new Set();
    function tryAdd(greek, russian) {
        if (!greek || !russian || examples.length >= maxCount) return;
        let tokens = tokenizeGreek(greek);
        if (!tokens.some(t => forms.has(t))) return;
        if (isTrivialExample(greek, entry)) return;
        let key = tokens.join(' ');
        if (seen.has(key)) return;
        seen.add(key);
        examples.push({ greek: greek, russian: russian });
    }
    let rest = Object.keys(LESSONS_DATA).map(Number).sort((a, b) => a - b).filter(n => n !== entry.lesson);
    let lessons = [entry.lesson].concat(rest);
    lessons.forEach(l => {
        let data = getLessonData(l);
        if (!data || !data.translation) return;
        (data.translation.el_to_ru || []).forEach(q => tryAdd(q.source, q.correct));
        (data.translation.ru_to_el || []).forEach(q => {
            if (Array.isArray(q.correct)) tryAdd(q.correct.join(' ') + endPunctFrom(q.source), q.source);
        });
    });
    lessons.forEach(l => {
        let data = getLessonData(l);
        if (!data || !data.exercises || !data.exercises.translate_greek_to_russian) return;
        data.exercises.translate_greek_to_russian.forEach(q => {
            tryAdd(q.greek, formatKeywordsAsSentence(q.keywords));
        });
    });
    entry._examples = examples;
    return examples;
}

// ------------------------------------------------------------
// Автогенерация примера, когда подлинных не нашлось. Строим
// ТОЛЬКО то, в чём уверены грамматически (форма реально есть
// в данных урока) — иначе рискуем показать неверный греческий.
// ------------------------------------------------------------
function tryGetForm(declension_forms, path) {
    let node = declension_forms;
    for (let key of path) {
        if (!node || typeof node !== 'object') return null;
        node = node[key];
    }
    return typeof node === 'string' ? node : null;
}

function generateFallbackExample(entry) {
    let firstGloss = (entry.translation || '').split(',')[0].trim();

    if (entry.type === 'adjective' && entry.declension_forms) {
        let form = tryGetForm(entry.declension_forms, ['masculine', 'singular', 'nom']);
        if (form) return { greek: 'ὁ ἄνθρωπος ' + form + '.', russian: 'Человек ' + firstGloss + '.', generated: true };
    }

    if (entry.type === 'verb' && entry.declension_forms) {
        let form = tryGetForm(entry.declension_forms, ['singular', '1']);
        if (form) return { greek: 'ἐγώ ' + form + '.', russian: 'Я ' + firstGloss + '.', generated: true };
    }

    // Существительные и местоимения тут не обслуживаем: «артикль + слово» —
    // это одно слово, а не пример. Предлоги, союзы и наречия — без надёжной
    // падежной формы в данных фразу не строим, чтобы не научить ошибке.
    return null;
}

function renderVocabExamplesHtml(entry) {
    let examples = findUsageExamples(entry, 3);
    if (examples.length === 0) {
        let fallback = generateFallbackExample(entry);
        if (fallback) {
            return '<div class="vocab-examples">' +
                '<div class="vocab-example vocab-example--generated">' +
                    '<div class="vocab-example__greek">' + highlightWord(fallback.greek, entry) + '</div>' +
                    '<div class="vocab-example__ru">' + fallback.russian + '</div>' +
                    '<div class="vocab-example__note">пример составлен автоматически</div>' +
                '</div>' +
            '</div>';
        }
        return '<div class="vocab-examples-empty">Готовых примеров для этого слова пока не нашлось —' +
            ' оно из ' + entry.lesson + '-го урока, загляните в его упражнения на перевод.</div>';
    }
    let parts = ['<div class="vocab-examples">'];
    examples.forEach(ex => {
        parts.push(
            '<div class="vocab-example">',
                '<div class="vocab-example__greek">', highlightWord(ex.greek, entry), '</div>',
                '<div class="vocab-example__ru">', ex.russian, '</div>',
            '</div>'
        );
    });
    parts.push('</div>');
    return parts.join('');
}

// Разворачивает/сворачивает блок примеров под словом; примеры считаются один раз и кешируются в entry._examples.
function toggleVocabExamples(id) {
    let entry = vocabById.get(id);
    if (!entry) return;
    let row = document.querySelector('.word-item[data-vocab-id="' + id + '"]');
    if (!row) return;
    let header = row.querySelector('.word-row');
    let details = row.querySelector('.word-details');
    if (!details) return;
    let opening = !details.classList.contains('open');
    if (opening && !details.dataset.loaded) {
        details.innerHTML = renderVocabExamplesHtml(entry);
        details.dataset.loaded = '1';
    }
    details.classList.toggle('open', opening);
    row.classList.toggle('open', opening);
    if (header) header.setAttribute('aria-expanded', opening ? 'true' : 'false');
}

function renderVocabEntries(entries) {
    let container = document.getElementById('allVocabContent');
    if (!container) return;
    if (entries.length === 0) {
        container.innerHTML = emptyState('search_off', 'Ничего не найдено', 'Попробуйте другое слово или его часть');
        return;
    }
    let byType = {};
    entries.forEach(e => {
        if (!byType[e.type]) byType[e.type] = [];
        byType[e.type].push(e);
    });
    let order = ['noun','verb','adjective','preposition','pronoun','adverb','conjunction','other'];
    let parts = [];
    order.forEach(type => {
        if (!byType[type] || byType[type].length === 0) return;
        parts.push('<div class="vocab-section"><h4>', TYPE_LABELS[type] || type, '</h4>');
        byType[type].forEach(e => {
            let art = e.article ? e.article + ' ' : '';
            parts.push(
                '<div class="word-item" data-vocab-id="', e.id, '">',
                    '<div class="word-row" onclick="toggleVocabExamples(', e.id, ')" role="button" tabindex="0" aria-expanded="false">',
                        '<strong>', art, e.greek, '</strong><span>', e.translation, '</span>',
                        '<span class="msym vocab-chevron">expand_more</span>',
                    '</div>',
                    '<div class="word-details"></div>',
                '</div>'
            );
        });
        parts.push('</div>');
    });
    let html = parts.join('');
    container.innerHTML = html || emptyState('search_off', 'Ничего не найдено', 'Попробуйте другое слово или его часть');
}
function showAllVocab() {
    showSection('allVocabSection');
    if (!allVocabCache) allVocabCache = buildAllVocabCache();
    let input = document.getElementById('vocabSearchInput');
    if (input) input.value = '';
    let clearBtn = document.getElementById('vocabSearchClear');
    if (clearBtn) clearBtn.classList.remove('show');
    renderVocabEntries(allVocabCache);
}
// oninput летит на каждый символ; перерисовку словаря сводим к одной на кадр
let vocabFilterFrame = null;
function filterAllVocab() {
    if (vocabFilterFrame) return;
    vocabFilterFrame = requestAnimationFrame(() => { vocabFilterFrame = null; applyVocabFilter(); });
}

function applyVocabFilter() {
    let input = document.getElementById('vocabSearchInput');
    let clearBtn = document.getElementById('vocabSearchClear');
    if (!input) return;
    let query = input.value.trim().toLowerCase();
    if (clearBtn) clearBtn.classList.toggle('show', query.length > 0);
    if (!allVocabCache) allVocabCache = buildAllVocabCache();
    if (!query) {
        renderVocabEntries(allVocabCache);
        return;
    }
    let filtered = allVocabCache.filter(e => {
        let greekMatch = e.greek.toLowerCase().includes(query);
        let ruMatch = e.translation.toLowerCase().includes(query);
        return greekMatch || ruMatch;
    });
    renderVocabEntries(filtered);
}

function clearVocabSearch() {
    let input = document.getElementById('vocabSearchInput');
    if (input) input.value = '';
    let clearBtn = document.getElementById('vocabSearchClear');
    if (clearBtn) clearBtn.classList.remove('show');
    if (!allVocabCache) allVocabCache = buildAllVocabCache();
    renderVocabEntries(allVocabCache);
}