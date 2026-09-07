// ============================================================
// ПРОВЕРКА ВСЕХ СЛОВ (КАРТОЧКИ)
// ============================================================
// Колода — словарь целиком либо одна часть речи: type это ключ из
// VOCAB_TYPE_ORDER либо 'all'. Без аргумента повторяем текущий набор,
// поэтому «Заново» и «Повторить» не сбрасывают выбранный фильтр.
function startAllFlashcards(type) {
    if (type === undefined || type === null) type = allFlashcardState.type || 'all';
    showSection('allFlashcardsSection');
    var container = document.getElementById('allFlashcardContainer');
    var allWords = filterVocabByType(getAllVocab(), type);
    renderTypeChips('flashcardTypeChips', type, 'startAllFlashcards');
    var titleEl = document.getElementById('allFlashcardTitle');
    if (titleEl) titleEl.textContent = type === 'all' ? 'Проверка всех слов' : TYPE_LABELS[type];
    allFlashcardState = {
        words: [], index: 0, revealed: false, correct: 0, total: 0, type: type,
        flipped: false, flipAnim: false, declension: null
    };
    if (allWords.length === 0) {
        container.innerHTML = emptyState('inbox', 'Слов пока нет');
        return;
    }
    var shuffled = shuffle(allWords);
    allFlashcardState.words = shuffled;
    allFlashcardState.total = shuffled.length;
    showAllFlashcard();
}

function showAllFlashcard() {
    var s = allFlashcardState;
    var container = document.getElementById('allFlashcardContainer');
    if (s.index >= s.total) {
        container.innerHTML = resultBlock(s.correct, s.total, 'Проверка завершена') +
            '<div class="md-button-row" style="justify-content:center;">' +
            '<button class="menu-btn primary" onclick="startAllFlashcards()"><span class="msym">restart_alt</span>Повторить</button>' +
            '<button class="menu-btn outlined" onclick="goToMain()"><span class="msym">home</span>К урокам</button></div>';
        return;
    }
    var w = s.words[s.index];
    var html = progressHead('Слово ' + (s.index + 1) + ' из ' + s.total, s.index, s.total);
    html += flashcardBodyHtml(w, s, 'all');
    if (s.revealed) {
        if (!s.flipped) html += flashcardContextBlockHtml(w);
        html += '<div class="flashcard-buttons"><button class="know" onclick="allFlashcardAnswer(true)"><span class="msym">check</span>Знаю</button><button class="dontknow" onclick="allFlashcardAnswer(false)"><span class="msym">close</span>Не знаю</button></div>';
    } else {
        html += '<div class="flashcard-buttons"><button class="show" onclick="allFlashcardReveal()"><span class="msym">visibility</span>Показать перевод</button></div>';
    }
    container.innerHTML = html;
    if (s.flipped) renderCardDeclension('all');
}

function allFlashcardReveal() {
    allFlashcardState.revealed = true;
    showAllFlashcard();
}

function allFlashcardAnswer(know) {
    var s = allFlashcardState;
    if (know) {
        s.correct++;
        stats.totalCorrect++;
    } else {
        stats.totalWrong++;
        var w = s.words[s.index];
        recordError('all', { word: w.greek, correct: w.translation, your: 'не знал' });
    }
    saveStats();
    s.index++;
    resetCardFlip(s);
    showAllFlashcard();
}


// ============================================================
// КАРТОЧКИ (урока)
// ============================================================
function startFlashcards() {
    let data = getLessonData(currentLesson);
    if (!data || !data.vocabulary || data.vocabulary.length === 0) {
        document.getElementById('flashcardContainer').innerHTML = '<p>Нет слов.</p>';
        return;
    }
    let words = shuffle(data.vocabulary.map(item => {
        return {
            greek: item.greek,
            article: item.article || '',
            translation: item.translation,
            declension_forms: item.declension_forms || null,
            lesson: currentLesson
        };
    }));
    flashcardState = { words: words, index: 0, revealed: false, correct: 0, total: words.length,
        flipped: false, flipAnim: false, declension: null };
    showFlashcard();
}

function showFlashcard() {
    let s = flashcardState;
    let container = document.getElementById('flashcardContainer');
    if (s.index >= s.total) {
        let p = Math.round((s.correct / s.total) * 100);
        container.innerHTML = resultBlock(s.correct, s.total, 'Карточки завершены') +
            '<div class="md-button-row">' +
            '<button class="menu-btn primary" onclick="startFlashcards()"><span class="msym">restart_alt</span>Повторить</button>' +
            '<button class="menu-btn outlined" onclick="closeLessonDrill()"><span class="msym">arrow_back</span>К упражнениям</button></div>';
        return;
    }
    let w = s.words[s.index];
    let html = progressHead('Карточка ' + (s.index + 1) + ' из ' + s.total, s.index, s.total);
    html += flashcardBodyHtml(w, s, 'lesson');
    if (s.revealed) {
        if (!s.flipped) html += flashcardContextBlockHtml(w);
        html += '<div class="flashcard-buttons"><button class="know" onclick="flashAnswer(true)"><span class="msym">check</span>Знаю</button><button class="dontknow" onclick="flashAnswer(false)"><span class="msym">close</span>Не знаю</button></div>';
    } else {
        html += '<div class="flashcard-buttons"><button class="show" onclick="flashReveal()"><span class="msym">visibility</span>Показать перевод</button></div>';
    }
    container.innerHTML = html;
    if (s.flipped) renderCardDeclension('lesson');
}

function flashReveal() { flashcardState.revealed = true; showFlashcard(); }

function flashAnswer(know) {
    let s = flashcardState;
    if (know) { s.correct++; stats.totalCorrect++; } else {
        stats.totalWrong++;
        let lesson = currentLesson;
        let w = s.words[s.index];
        recordError(lesson, { word: w.greek, correct: w.translation, your: 'не знал' });
    }
    saveStats();
    s.index++;
    resetCardFlip(s);
    showFlashcard();
}

// ------------------------------------------------------------
// «Показать в словосочетании» — берём то же слово в подлинном
// примере из упражнений урока (findUsageExamples определена в
// vocab.js; к моменту клика все скрипты уже загружены).
// ------------------------------------------------------------
function flashcardContextBlockHtml(word) {
    if (typeof findUsageExamples !== 'function') return '';
    let examples = findUsageExamples(word, 1);
    if (!examples.length) return '';
    let exampleHtml = '<div class="vocab-example">' +
        '<div class="vocab-example__greek">' + highlightWord(examples[0].greek, word) + '</div>' +
        '<div class="vocab-example__ru">' + examples[0].russian + '</div>' +
    '</div>';
    return (
        '<button type="button" class="menu-btn outlined flashcard-context-btn" onclick="toggleFlashcardContext(this)">' +
            '<span class="msym">account_tree</span>Показать в словосочетании' +
        '</button>' +
        '<div class="flashcard-context" style="display:none;">' + exampleHtml + '</div>'
    );
}

function toggleFlashcardContext(btn) {
    let block = btn.nextElementSibling;
    if (!block) return;
    let show = block.style.display === 'none';
    block.style.display = show ? 'block' : 'none';
    btn.classList.toggle('active', show);
}

// ============================================================
// ОБОРОТ КАРТОЧКИ — ТРЕНИРОВКА ФОРМ СЛОВА
// ============================================================
// Это то же упражнение, что раньше было отдельным пунктом «Склонение»
// (declension_fill): вопрос про форму, четыре варианта, те же состояния
// correct/wrong у кнопок. Отдельным пунктом оно больше не значится —
// формы тренируются у конкретного слова, с его карточки, поэтому
// упражнение всегда знает, о каком слове речь.
//
// Вопросы берём из двух источников:
//   1) авторские declension_fill урока про это же слово — вместе с их
//      продуманными дистракторами (их же использует «Тест»);
//   2) остальную парадигму достраиваем из declension_forms слова,
//      чтобы оборот был у каждого слова, а не только у части.

// Колоды устроены одинаково, но состояние и перерисовка у них свои.
// Функции читают живые привязки, поэтому start*Flashcards() может
// переприсваивать состояние сколько угодно.
const CARD_DECKS = {
    lesson: { state: function () { return flashcardState; }, render: function () { showFlashcard(); } },
    all:    { state: function () { return allFlashcardState; }, render: function () { showAllFlashcard(); } }
};

const CARD_CASE = {
    nom: 'Nominativus', gen: 'Genitivus', dat: 'Dativus',
    acc: 'Accusativus', voc: 'Vocativus'
};
const CARD_GENDER_RU = { m: 'муж. р.', f: 'жен. р.', n: 'ср. р.' };

// Ключи форм совпадают с ключами авторских declension_fill (gen_sg, 2pl,
// nom_pl_m, dat_sg_f…), поэтому подпись собирается для обоих источников
// одинаково и в списке вопросов нет разнобоя формулировок.
function cardCaseLabel(key) {
    let m = /^([123])(sg|pl)$/.exec(key);
    if (m) return m[1] + ' ' + (m[2] === 'sg' ? 'sg.' : 'pl.');
    m = /^(nom|gen|dat|acc|voc)_(sg|pl)(?:_([mfn]))?$/.exec(key);
    if (m) {
        let label = CARD_CASE[m[1]] || m[1];
        let num = m[2] === 'sg' ? 'sg.' : 'pl.';
        let gender = m[3] ? (m[3] === 'm' ? ' m.' : m[3] === 'f' ? ' f.' : ' n.') : '';
        return label + ' ' + num + gender;
    }
    return getCaseName(key);
}

// Все формы слова плоским списком. Род различаем суффиксом ключа — ровно
// так же, как он записан в авторских вопросах (gen_sg_m, dat_sg_f, acc_sg_n).
function collectCardForms(forms) {
    let out = [];
    if (!forms) return out;
    let cases = ['nom', 'gen', 'dat', 'acc', 'voc'];
    let nums = { singular: 'sg', plural: 'pl' };
    let genders = { masculine: 'm', feminine: 'f', neuter: 'n' };
    function walk(node, suffix) {
        for (let num in nums) {
            let block = node[num];
            if (!block) continue;
            for (let p of ['1', '2', '3']) if (block[p]) out.push({ key: p + nums[num], form: block[p] });
            for (let c of cases) if (block[c]) out.push({ key: c + '_' + nums[num] + suffix, form: block[c] });
        }
    }
    let gendered = false;
    for (let g in genders) if (forms[g]) { gendered = true; walk(forms[g], '_' + genders[g]); }
    if (!gendered) walk(forms, '');
    return out;
}

// Заголовочные формы слова: «ἀκούω + Gen.» → ἀκούω, «οὗτος, αὕτη, τοῦτο» →
// три имени сразу (авторские вопросы записаны на каждое из них).
function cardWordNames(word) {
    return word.greek.split(',')
        .map(function (part) { return part.trim().split(/\s+/)[0]; })
        .filter(Boolean);
}

function cardDeclensionQuestions(word) {
    if (word._declQuestions) return word._declQuestions;
    let out = [];
    let seen = new Set();
    let names = cardWordNames(word);
    let head = names[0] || '';

    let data = getLessonData(word.lesson || currentLesson);
    let authored = (data && data.exercises && data.exercises.declension_fill) || [];
    for (let q of authored) {
        if (!q.word || names.indexOf(q.word) === -1) continue;
        if (seen.has(q.case)) continue;
        seen.add(q.case);
        out.push({ label: cardCaseLabel(q.case), correct: q.correct, distractors: q.distractors.slice() });
    }

    let forms = collectCardForms(word.declension_forms);
    let pool = [];
    for (let f of forms) if (pool.indexOf(f.form) === -1) pool.push(f.form);
    for (let f of forms) {
        if (seen.has(f.key)) continue;
        // Вопрос про заголовочную форму — подсказка самому себе: она стоит
        // на лицевой стороне и повторена над вопросом.
        if (f.form === head) continue;
        let others = shuffle(pool.filter(function (x) { return x !== f.form; })).slice(0, 3);
        if (others.length < 2) continue;
        seen.add(f.key);
        out.push({ label: cardCaseLabel(f.key), correct: f.form, distractors: others });
    }
    word._declQuestions = out;
    return out;
}

function resetCardFlip(s) {
    s.revealed = false;
    s.flipped = false;
    s.flipAnim = false;
    s.declension = null;
}

// Лицо карточки — слово и перевод, оборот — вопрос о форме. Кнопка в углу
// появляется только после «Показать перевод» и только у слов, у которых
// вообще есть что склонять или спрягать.
function flashcardBodyHtml(word, s, deck) {
    let flipped = !!s.flipped;
    let hasDrill = s.revealed && cardDeclensionQuestions(word).length > 0;
    let cls = 'md-flashcard';
    if (flipped) cls += ' md-flashcard--back';
    if (hasDrill) cls += ' md-flashcard--has-flip';
    if (s.flipAnim) cls += ' md-flashcard--flip';
    s.flipAnim = false;

    let html = '<div class="flashcard-flip"><div class="' + cls + '">';
    if (flipped) {
        html += '<div class="card-declension" id="cardDeclension"></div>';
    } else {
        html += '<div class="flashcard-word">' + (word.article ? word.article + ' ' : '') + word.greek + '</div>';
        if (s.revealed) html += '<div class="flashcard-translation">' + word.translation + '</div>';
    }
    if (hasDrill) {
        let hint = flipped ? 'Вернуться к слову' : 'Тренировать формы слова';
        html += '<button type="button" class="flashcard-flip-btn" aria-label="' + hint + '" title="' + hint + '" ' +
            'onclick="flipFlashcard(\'' + deck + '\')"><span class="msym">flip</span></button>';
    }
    return html + '</div></div>';
}

function flipFlashcard(deck) {
    let s = CARD_DECKS[deck].state();
    let word = s.words[s.index];
    if (!word) return;
    if (!s.flipped) {
        let questions = cardDeclensionQuestions(word);
        if (!questions.length) return;
        s.declension = { questions: shuffle(questions), index: 0, correct: 0 };
    }
    cancelAdvance();
    s.flipped = !s.flipped;
    s.flipAnim = true;
    CARD_DECKS[deck].render();
}

// Перерисовываем только начинку оборота: перерисовка всей карточки заново
// проигрывала бы анимацию переворота на каждый ответ.
function renderCardDeclension(deck) {
    let s = CARD_DECKS[deck].state();
    let box = document.getElementById('cardDeclension');
    let d = s.declension;
    if (!box || !d) return;
    let word = s.words[s.index];
    let html = '<div class="card-declension__word">' + (word.article ? word.article + ' ' : '') + word.greek + '</div>';

    if (d.index >= d.questions.length) {
        box.innerHTML = html +
            '<div class="card-declension__done">Верно ' + d.correct + ' из ' + d.questions.length + '</div>' +
            '<div class="md-button-row"><button class="menu-btn text" onclick="restartCardDeclension(\'' + deck + '\')">' +
            '<span class="msym">restart_alt</span>Ещё раз</button></div>';
        return;
    }

    let q = d.questions[d.index];
    html += '<div class="card-declension__progress">Форма ' + (d.index + 1) + ' из ' + d.questions.length + '</div>';
    html += '<div class="card-declension__prompt">' + q.label + '</div>';
    html += '<div class="options options--greek">';
    for (let o of shuffle([q.correct].concat(q.distractors))) {
        html += '<button class="option-btn" onclick="answerCardDeclension(\'' + escArg(o) + '\',\'' +
            escArg(q.correct) + '\',\'' + deck + '\')">' + o + '</button>';
    }
    box.innerHTML = html + '</div>';
}

function restartCardDeclension(deck) {
    let s = CARD_DECKS[deck].state();
    let word = s.words[s.index];
    if (!word) return;
    s.declension = { questions: shuffle(cardDeclensionQuestions(word)), index: 0, correct: 0 };
    renderCardDeclension(deck);
}

function answerCardDeclension(sel, corr, deck) {
    let s = CARD_DECKS[deck].state();
    let d = s.declension;
    let box = document.getElementById('cardDeclension');
    if (!d || !box) return;
    let ok = sel === corr;
    box.querySelectorAll('.option-btn').forEach(function (b) {
        b.disabled = true;
        if (b.textContent === corr) b.classList.add('correct');
        if (b.textContent === sel && !ok) b.classList.add('wrong');
    });
    if (ok) { d.correct++; stats.totalCorrect++; } else {
        stats.totalWrong++;
        recordError(deck === 'all' ? 'all' : currentLesson,
            { word: s.words[s.index].greek, correct: corr, your: sel });
    }
    saveStats();
    d.index++;
    scheduleAdvance(function () { renderCardDeclension(deck); }, 1200);
}