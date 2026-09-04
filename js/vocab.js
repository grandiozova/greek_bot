// ============================================================
// ПОИСК В СЛОВАРЕ ВСЕХ СЛОВ
// ============================================================
let allVocabCache = null;

// Урок 1 — это названия букв (ἄλφα, βῆτα…), а не лексика: в словарь он не идёт.
// Со второго урока начинаются настоящие слова — артикли и предлоги.
const VOCAB_FIRST_LESSON = 2;

function buildAllVocabCache() {
    let entries = [];
    let seen = new Set();
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
            entries.push({
                greek: item.greek,
                article: item.article || '',
                translation: item.translation,
                type: item.type || 'other',
                lesson: l
            });
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
            parts.push('<div class="word-item"><div class="word-row"><strong>', art, e.greek,
                '</strong><span>', e.translation, '</span></div></div>');
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
