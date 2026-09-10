// ============================================================
// ТЕСТ
// ============================================================
const TEST_TYPES = ['declension_fill','translate_greek_to_russian','translate_russian_to_greek','case_number','agreement','attribute_vs_predicate','substantivation','article_fill'];

// Пул вопросов теста. Список разделов урока спрашивает только его размер,
// поэтому сбор вынесен из startTest — чтобы обе стороны считали одинаково.
function collectTestQuestions(data) {
    let all = [];
    if (!data) return all;
    for (let t of TEST_TYPES) {
        let qs = (data.exercises && data.exercises[t]) || [];
        // Копия, а не сам объект урока: помечать _type прямо в LESSONS_DATA
        // значит писать в общие данные при каждом открытии урока.
        for (let q of qs) all.push(Object.assign({}, q, { _type: t }));
    }
    return all;
}

function countTestQuestions(data) { return collectTestQuestions(data).length; }

function startTest() {
    let data = getLessonData(currentLesson);
    if (!data) return;
    let all = collectTestQuestions(data);
    if (all.length === 0) { showToast('Для этого урока вопросов пока нет', 'info'); return; }
    let picked = shuffle(all).slice(0, 10);
    testState = { questions: picked, index: 0, correct: 0, total: picked.length, answered: false };
    showSection('testSection');
    showTest();
}

function cancelTest() {
    testState = { questions: [], index: 0, correct: 0, total: 0, answered: false };
    showSection('lessonSection');
    switchLessonPart(currentLessonPart || 'menu');
}

function showTest() {
    let s = testState;
    if (s.index >= s.total) {
        document.getElementById('testContainer').innerHTML =
            resultBlock(s.correct, s.total, 'Тест завершён') +
            '<div class="md-button-row">' +
            '<button class="menu-btn primary" onclick="startTest()"><span class="msym">restart_alt</span>Повторить</button>' +
            '<button class="menu-btn outlined" onclick="cancelTest()"><span class="msym">arrow_back</span>К уроку</button></div>';
        return;
    }
    let q = s.questions[s.index];
    let container = document.getElementById('testContainer');
    let html = progressHead('Вопрос ' + (s.index + 1) + ' из ' + s.total, s.index, s.total);
    let t = q._type;

    if (t === 'declension_fill' || t === 'case_number' || t === 'agreement' ||
        t === 'attribute_vs_predicate' || t === 'substantivation' || t === 'article_fill') {
        let text = '';
        let scriptOpts = false;
        if (t === 'declension_fill') {
            let caseName = getCaseName(q.case);
            let wordDisplay = q.word ? q.word + ' (' + q.translation + ')' : '';
            text = 'Вставьте форму для <b>' + caseName + '</b> для слова <span class="script">' + wordDisplay + '</span>';
            scriptOpts = true;
        } else if (t === 'case_number') {
            text = 'Определите падеж и число: <span class="script">' + q.form + '</span>';
        } else if (t === 'agreement') {
            text = 'Вставьте прилагательное <span class="script">' + q.adjective + '</span>: <span class="script">' + q.article + ' ____ ' + q.noun + '</span>';
            scriptOpts = true;
        } else if (t === 'attribute_vs_predicate') {
            text = 'Атрибутив или предикатив? <span class="script">' + q.phrase + '</span>';
        } else if (t === 'substantivation') {
            text = 'Что означает? <span class="script">' + q.phrase + '</span>';
        } else if (t === 'article_fill') {
            text = 'Вставьте артикль: <span class="script">____ ' + q.noun + '</span>';
            scriptOpts = true;
        }
        let corr = q.correct || q.correct_article;
        let opts = shuffle([corr].concat(q.distractors));
        html += '<div class="question">' + text + '</div><div class="options' + (scriptOpts ? ' options--script' : '') + '">';
        for (let o of opts) html += '<button class="option-btn" onclick="testAnswer(\'' + escArg(o) + '\',\'' + escArg(corr) + '\')">' + o + '</button>';
        html += '</div>';
    } else if (t === 'translate_greek_to_russian') {
        html += '<div class="question">Переведите на русский</div><div class="md-prompt-strong">' + q.greek + '</div><div class="input-group"><input type="text" id="testTransInput" placeholder="Перевод" autocomplete="off" onkeydown="if(event.key===\'Enter\'){testTranslation();}"><button onclick="testTranslation()"><span class="msym">check</span>Проверить</button></div>';
        window._test_q = q;
    } else if (t === 'translate_russian_to_greek') {
        let words = shuffle(q.all_words);
        html += '<div class="question">Переведите на ' + courseLang() + '</div><div class="md-prompt-ru">' + q.russian + '</div>';
        html += '<div class="build-area build-area--script" id="testBuildArea"></div>' +
            '<div class="word-bank word-bank--script" id="testWordBank">';
        for (let w of words) html += '<span class="chip" onclick="testPickWord(\'' + escArg(w) + '\')">' + w + '</span>';
        html += '</div><div class="md-button-row"><button class="menu-btn primary" onclick="testTranslationRu()"><span class="msym">check</span>Готово</button><button class="menu-btn text" onclick="testClearChosen()"><span class="msym">undo</span>Очистить</button></div>';
        window._test_ru = q;
        window._test_chosen = [];
    } else {
        html += '<p>Неизвестный тип вопроса.</p>';
    }
    container.innerHTML = html;
    s.answered = false;
}

function nextTestQuestion() {
    testState.index++;
    showTest();
}

function testAnswer(sel, corr) {
    if (testState.answered) return;
    testState.answered = true;
    let ok = sel === corr;
    if (ok) testState.correct++;
    else {
        stats.totalWrong++;
        let lesson = currentLesson;
        let q = testState.questions[testState.index];
        recordError(lesson, { word: q.word || q.greek || 'вопрос', correct: corr, your: sel });
    }
    stats.totalCorrect += ok ? 1 : 0;
    saveStats();
    let container = document.getElementById('testContainer');
    // Правильный ответ бывает и формой изучаемого языка (вставить форму,
    // артикль, согласовать), и русской подписью (определить падеж). Что
    // сейчас на экране, уже решено при отрисовке вопроса — спрашиваем сам
    // ряд вариантов, а не повторяем список типов второй раз.
    let scriptAnswer = !!container.querySelector('.options--script');
    let strongCls = scriptAnswer ? ' class="script"' : '';
    let feedbackClass = ok ? 'ok' : 'fail';
    let feedbackText = ok ? 'Верно!' : 'Неверно. Правильный ответ: <strong' + strongCls + '>' + corr + '</strong>';
    container.innerHTML = `
        <div class="feedback ${feedbackClass}"><span>${feedbackText}</span></div>
        <div class="md-button-row">
            <button class="menu-btn primary" onclick="nextTestQuestion()"><span class="msym">arrow_forward</span>Далее</button>
        </div>
    `;
}

function testTranslation() {
    if (testState.answered) return;
    let inp = document.getElementById('testTransInput');
    if (!inp) return;
    let ans = inp.value.trim().toLowerCase();
    let q = window._test_q;
    if (!q) return;
    let ok = true;
    for (let kw of q.keywords) {
        if (ans.indexOf(kw.toLowerCase()) === -1) { ok = false; break; }
    }
    let container = document.getElementById('testContainer');
    let feedbackClass = ok ? 'ok' : 'fail';
    let feedbackText = ok ? 'Верно!' : 'Неверно. Ключевые слова: ' + q.keywords.join(', ');
    if (ok) { testState.correct++; stats.totalCorrect++; } else {
        stats.totalWrong++;
        let lesson = currentLesson;
        recordError(lesson, { word: q.greek, correct: q.keywords.join(', '), your: ans });
    }
    saveStats();
    testState.answered = true;
    container.innerHTML = `
        <div class="feedback ${feedbackClass}"><span>${feedbackText}</span></div>
        <div class="md-button-row">
            <button class="menu-btn primary" onclick="nextTestQuestion()"><span class="msym">arrow_forward</span>Далее</button>
        </div>
    `;
}

function testPickWord(w) {
    if (testState.answered) return;
    let chip = pickFreeChip('testWordBank', w);
    if (!chip) return;
    chip.classList.add('picked');
    window._test_chosen.push(w);
    let area = document.getElementById('testBuildArea');
    let t = document.createElement('span');
    t.className = 'token';
    t.textContent = w;
    area.appendChild(t);
}

function testClearChosen() {
    window._test_chosen = [];
    document.getElementById('testBuildArea').innerHTML = '';
    document.getElementById('testWordBank').querySelectorAll('.chip').forEach(c => c.classList.remove('picked'));
}

function testTranslationRu() {
    if (testState.answered) return;
    let chosen = window._test_chosen || [];
    let q = window._test_ru;
    if (!q) return;
    let corr = q.correct_sequence;
    let ok = chosen.length === corr.length && chosen.every((w,i) => w === corr[i]);
    let container = document.getElementById('testContainer');
    let feedbackClass = ok ? 'ok' : 'fail';
    let feedbackText = ok ? 'Верно!' : 'Неверно. Правильно: <strong class="script">' + corr.join(' ') + '</strong>';
    if (ok) { testState.correct++; stats.totalCorrect++; } else {
        stats.totalWrong++;
        let lesson = currentLesson;
        recordError(lesson, { word: q.russian, correct: corr.join(' '), your: chosen.join(' ') });
    }
    saveStats();
    testState.answered = true;
    container.innerHTML = `
        <div class="feedback ${feedbackClass}"><span>${feedbackText}</span></div>
        <div class="md-button-row">
            <button class="menu-btn primary" onclick="nextTestQuestion()"><span class="msym">arrow_forward</span>Далее</button>
        </div>
    `;
}