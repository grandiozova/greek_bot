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
// Примеры употребления: ищем подлинные предложения из упражнений
// и переводов того же урока, где встречается слово (в любой форме).
// ------------------------------------------------------------

// Базовая форма + все словоформы слова — по ним ищем совпадения в предложениях.
function getWordSearchForms(entry) {
    let forms = new Set();
    let lemma = (entry.greek || '').split(',')[0].split('(')[0].trim();
    if (lemma.length > 1) forms.add(lemma);
    if (entry.declension_forms) {
        (function walk(obj) {
            if (!obj) return;
            if (typeof obj === 'string') {
                if (obj.length > 1) forms.add(obj);
                return;
            }
            if (typeof obj === 'object') Object.values(obj).forEach(walk);
        })(entry.declension_forms);
    }
    return Array.from(forms);
}

// Выделяем найденную форму слова жирным прямо в тексте примера.
function highlightWord(sentence, entry) {
    if (!sentence) return sentence;
    let forms = getWordSearchForms(entry).sort((a, b) => b.length - a.length);
    for (let f of forms) {
        let idx = sentence.indexOf(f);
        if (idx !== -1) {
            return sentence.slice(0, idx) + '<strong>' + sentence.slice(idx, idx + f.length) + '</strong>' + sentence.slice(idx + f.length);
        }
    }
    return sentence;
}
// keywords — это список слов для проверки ответа, а не готовое предложение;
// склеиваем их в подобие фразы: пробелы вместо запятых, заглавная буква, точка.
function formatKeywordsAsSentence(keywords) {
    if (!keywords) return keywords;
    let text = Array.isArray(keywords) ? keywords.join(' ').trim() : String(keywords).trim();
    if (!text) return text;
    text = text.charAt(0).toUpperCase() + text.slice(1);
    if (!/[.!?]$/.test(text)) text += '.';
    return text;
}
// Ищем до maxCount подлинных примеров в упражнениях урока, к которому относится слово.
function findUsageExamples(entry, maxCount) {
    if (entry._examples) return entry._examples;
    maxCount = maxCount || 3;
    let examples = [];
    let data = getLessonData(entry.lesson);
    if (data) {
        let forms = getWordSearchForms(entry);
        let seen = new Set();
        function tryAdd(greek, russian) {
            if (!greek || !russian || examples.length >= maxCount) return;
            if (seen.has(greek)) return;
            if (!forms.some(f => greek.includes(f))) return;
            seen.add(greek);
            examples.push({ greek: greek, russian: russian });
        }
        if (data.translation) {
            (data.translation.el_to_ru || []).forEach(q => tryAdd(q.source, q.correct));
            (data.translation.ru_to_el || []).forEach(q => {
                if (Array.isArray(q.correct)) tryAdd(q.correct.join(' '), q.source);
            });
        }
if (examples.length < maxCount && data.exercises && data.exercises.translate_greek_to_russian) {
    data.exercises.translate_greek_to_russian.forEach(q => {
        tryAdd(q.greek, formatKeywordsAsSentence(q.keywords));
    });
}
    }
    entry._examples = examples;
    return examples;
}

function renderVocabExamplesHtml(entry) {
    let examples = findUsageExamples(entry, 3);
    if (examples.length === 0) {
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