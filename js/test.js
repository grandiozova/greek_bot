// ============================================================
// ТЕСТ
// ============================================================
function startTest() {
    let data = getLessonData(currentLesson);
    if (!data) return;
    let all = [];
    let types = ['declension_fill','translate_greek_to_russian','translate_russian_to_greek','case_number','agreement','attribute_vs_predicate','substantivation','article_fill'];
    for (let t of types) {
        let qs = (data.exercises && data.exercises[t]) || [];
        for (let q of qs) { q._type = t; all.push(q); }
    }
    if (all.length === 0) { showToast('Для этого урока вопросов пока нет', 'info'); return; }
    let picked = shuffle(all).slice(0, 10);
    testState = { questions: picked, index: 0, correct: 0, total: picked.length, answered: false };
    showSection('testSection');
    showTest();
}

function cancelTest() {
    testState = { questions: [], index: 0, correct: 0, total: 0, answered: false };
    showSection('lessonSection');
    switchLessonPart(currentLessonPart === 'test' ? 'exercise' : currentLessonPart);
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
        let greekOpts = false;
        if (t === 'declension_fill') {
            let caseName = getCaseName(q.case);
            let wordDisplay = q.word ? q.word + ' (' + q.translation + ')' : '';
            text = 'Вставьте форму для <b>' + caseName + '</b> для слова <span class="greek">' + wordDisplay + '</span>';
            greekOpts = true;
        } else if (t === 'case_number') {
            text = 'Определите падеж и число: <span class="greek">' + q.form + '</span>';
        } else if (t === 'agreement') {
            text = 'Вставьте прилагательное <span class="greek">' + q.adjective + '</span>: <span class="greek">' + q.article + ' ____ ' + q.noun + '</span>';
            greekOpts = true;
        } else if (t === 'attribute_vs_predicate') {
            text = 'Атрибутив или предикатив? <span class="greek">' + q.phrase + '</span>';
        } else if (t === 'substantivation') {
            text = 'Что означает? <span class="greek">' + q.phrase + '</span>';
        } else if (t === 'article_fill') {
            text = 'Вставьте артикль: <span class="greek">____ ' + q.noun + '</span>';
            greekOpts = true;
        }
        let corr = q.correct || q.correct_article;
        let opts = shuffle([corr].concat(q.distractors));
        html += '<div class="question">' + text + '</div><div class="options' + (greekOpts ? ' options--greek' : '') + '">';
        for (let o of opts) html += '<button class="option-btn" onclick="testAnswer(\'' + escArg(o) + '\',\'' + escArg(corr) + '\')">' + o + '</button>';
        html += '</div>';
    } else if (t === 'translate_greek_to_russian') {
        html += '<div class="question">Переведите на русский</div><div class="md-prompt-strong">' + q.greek + '</div><div class="input-group"><input type="text" id="testTransInput" placeholder="Перевод" autocomplete="off" onkeydown="if(event.key===\'Enter\'){testTranslation();}"><button onclick="testTranslation()"><span class="msym">check</span>Проверить</button></div>';
        window._test_q = q;
    } else if (t === 'translate_russian_to_greek') {
        let words = shuffle(q.all_words);
        html += '<div class="question">Переведите на греческий</div><div class="md-prompt-ru">' + q.russian + '</div>';
        html += '<div class="build-area" id="testBuildArea"></div><div class="word-bank" id="testWordBank">';
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
    if (ok) container.innerHTML = '<div class="feedback ok"><span>Верно!</span></div>';
    else container.innerHTML = '<div class="feedback fail"><span>Неверно. Правильный ответ: <strong>' + corr + '</strong></span></div>';
    scheduleAdvance(() => { testState.index++; showTest(); }, 1500);
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
    if (ok) { testState.correct++; stats.totalCorrect++; container.innerHTML = '<div class="feedback ok"><span>Верно!</span></div>'; } else {
        stats.totalWrong++;
        let lesson = currentLesson;
        recordError(lesson, { word: q.greek, correct: q.keywords.join(', '), your: ans });
        container.innerHTML = '<div class="feedback fail"><span>Неверно. Ключевые слова: ' + q.keywords.join(', ') + '</span></div>';
    }
    saveStats();
    testState.answered = true;
}

function testPickWord(w) {
    if (testState.answered) return;
    window._test_chosen.push(w);
    let bank = document.getElementById('testWordBank');
    bank.querySelectorAll('.chip').forEach(c => {
        if (c.textContent === w && !c.classList.contains('picked')) c.classList.add('picked');
    });
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
    if (ok) { testState.correct++; stats.totalCorrect++; container.innerHTML = '<div class="feedback ok"><span>Верно!</span></div>'; } else {
        stats.totalWrong++;
        let lesson = currentLesson;
        recordError(lesson, { word: q.russian, correct: corr.join(' '), your: chosen.join(' ') });
        container.innerHTML = '<div class="feedback fail"><span>Неверно. Правильно: <strong>' + corr.join(' ') + '</strong></span></div>';
    }
    saveStats();
    testState.answered = true;
}

