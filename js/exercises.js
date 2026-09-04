// ============================================================
// УПРАЖНЕНИЯ (основные функции)
// ============================================================
function startExercise(type) {
    let questions = getExercises(currentLesson, type);
    if (!questions || questions.length === 0) {
        document.getElementById('exerciseQuestion').innerHTML = '<p>Нет вопросов.</p>';
        return;
    }
    exerciseState = { type: type, questions: shuffle(questions), index: 0, correct: 0, total: questions.length };
    showExercise();
}

function getCaseName(caseKey) {
    let map = {
        // Падежи для существительных
        'gen_sg': 'Genitivus (Род. п.) — кого? чего?',
        'dat_sg': 'Dativus (Дат. п.) — кому? чему?',
        'acc_sg': 'Accusativus (Вин. п.) — кого? что?',
        'nom_pl': 'Nominativus (Им. п.) мн.ч. — кто? что?',
        'gen_pl': 'Genitivus (Род. п.) мн.ч. — кого? чего?',
        'dat_pl': 'Dativus (Дат. п.) мн.ч. — кому? чему?',
        'acc_pl': 'Accusativus (Вин. п.) мн.ч. — кого? что?',
        // Родительный падеж мужского рода
        'gen_sg_m': 'Genitivus (Род. п.) муж.р. — кого? чего?',
        'dat_sg_f': 'Dativus (Дат. п.) жен.р. — кому? чему?',
        'acc_sg_n': 'Accusativus (Вин. п.) ср.р. — кого? что?',
        // Для глаголов (личные формы)
        '1sg': '1-е лицо ед.ч. — я',
        '2sg': '2-е лицо ед.ч. — ты',
        '3sg': '3-е лицо ед.ч. — он/она/оно',
        '1pl': '1-е лицо мн.ч. — мы',
        '2pl': '2-е лицо мн.ч. — вы',
        '3pl': '3-е лицо мн.ч. — они'
    };
    return map[caseKey] || caseKey;
}

function showExercise() {
    let s = exerciseState;
    if (s.index >= s.total) {
        document.getElementById('exerciseQuestion').innerHTML =
            resultBlock(s.correct, s.total, 'Упражнение завершено') +
            '<button class="menu-btn primary" onclick="startExercise(\'' + s.type + '\')"><span class="msym">restart_alt</span>Ещё раз</button>';
        return;
    }
    let q = s.questions[s.index];
    let container = document.getElementById('exerciseQuestion');
    let html = progressHead('Упражнение ' + (s.index + 1) + ' из ' + s.total, s.index, s.total);

    if (s.type === 'declension_fill') {
        let caseName = getCaseName(q.case);
        let wordDisplay = q.word ? q.word + ' (' + q.translation + ')' : '';
        html += '<div class="question">Вставьте форму для <b>' + caseName + '</b> для слова <span class="greek">' + wordDisplay + '</span></div><div class="options options--greek">';
        let opts = shuffle([q.correct].concat(q.distractors));
        for (let o of opts) html += '<button class="option-btn" onclick="answerOpt(\'' + escArg(o) + '\',\'' + escArg(q.correct) + '\')">' + o + '</button>';
        html += '</div>';
} else if (s.type === 'translate_greek_to_russian') {
    let idx = s.index;
    html += '<div class="question">Переведите на русский</div><div class="md-prompt-strong">' + q.greek + '</div><div class="input-group"><input type="text" id="transInput" placeholder="Перевод" autocomplete="off" onkeydown="if(event.key===\'Enter\'){checkExerciseTranslation(' + idx + ');}"><button type="button" onclick="checkExerciseTranslation(' + idx + ')"><span class="msym">check</span>Проверить</button></div>';
} else if (s.type === 'translate_russian_to_greek') {
        let words = shuffle(q.all_words);
        html += '<div class="question">Переведите на греческий</div><div class="md-prompt-ru">' + q.russian + '</div><div class="build-area" id="buildArea"></div><div class="word-bank" id="wordBank">';
        for (let w of words) html += '<span class="chip" onclick="pickWord(\'' + escArg(w) + '\')">' + w + '</span>';
        html += '</div><div class="md-button-row"><button class="menu-btn primary" onclick="checkTranslationRu()"><span class="msym">check</span>Готово</button><button class="menu-btn text" onclick="clearChosen()"><span class="msym">undo</span>Очистить</button></div>';
        window._trans_ru = q;
        window._chosen = [];
    } else if (s.type === 'case_number') {
        html += '<div class="question">Определите падеж и число для формы: <span class="greek">' + q.form + '</span></div><div class="options">';
        let opts = shuffle([q.correct].concat(q.distractors));
        for (let o of opts) html += '<button class="option-btn" onclick="answerOpt(\'' + escArg(o) + '\',\'' + escArg(q.correct) + '\')">' + o + '</button>';
        html += '</div>';
    } else if (s.type === 'agreement') {
        html += '<div class="question">Вставьте прилагательное <span class="greek">' + q.adjective + '</span> в правильной форме:<br><span class="greek">' + q.article + ' ____ ' + q.noun + '</span></div><div class="options options--greek">';
        let opts = shuffle([q.correct].concat(q.distractors));
        for (let o of opts) html += '<button class="option-btn" onclick="answerOpt(\'' + escArg(o) + '\',\'' + escArg(q.correct) + '\')">' + o + '</button>';
        html += '</div>';
    } else if (s.type === 'attribute_vs_predicate') {
        html += '<div class="question">Определите, атрибутив или предикатив:<br><span class="greek">' + q.phrase + '</span></div><div class="options">';
        let opts = shuffle([q.correct].concat(q.distractors));
        for (let o of opts) html += '<button class="option-btn" onclick="answerOpt(\'' + escArg(o) + '\',\'' + escArg(q.correct) + '\')">' + o + '</button>';
        html += '</div>';
    } else if (s.type === 'substantivation') {
        html += '<div class="question">Что означает:<br><span class="greek">' + q.phrase + '</span></div><div class="options">';
        let opts = shuffle([q.correct].concat(q.distractors));
        for (let o of opts) html += '<button class="option-btn" onclick="answerOpt(\'' + escArg(o) + '\',\'' + escArg(q.correct) + '\')">' + o + '</button>';
        html += '</div>';
    } else if (s.type === 'article_fill') {
        html += '<div class="question">Вставьте правильную форму артикля:<br><span class="greek">____ ' + q.noun + '</span></div><div class="options options--greek">';
        let opts = shuffle([q.correct_article].concat(q.distractors));
        for (let o of opts) html += '<button class="option-btn" onclick="answerOpt(\'' + escArg(o) + '\',\'' + escArg(q.correct_article) + '\')">' + o + '</button>';
        html += '</div>';
    } else {
        html += '<p>Тип упражнения не поддерживается.</p>';
    }
    container.innerHTML = html;
}

function answerOpt(sel, corr) {
    let container = document.getElementById('exerciseQuestion');
    let btns = container.querySelectorAll('.option-btn');
    let ok = sel === corr;
    btns.forEach(b => { b.disabled = true; if (b.textContent === corr) b.classList.add('correct'); if (b.textContent === sel && !ok) b.classList.add('wrong'); });
    if (ok) { stats.totalCorrect++; exerciseState.correct++; } else {
        stats.totalWrong++;
        let lesson = currentLesson;
        let q = exerciseState.questions[exerciseState.index];
        recordError(lesson, { word: q.word || q.greek || 'вопрос', correct: corr, your: sel });
    }
    saveStats();
    exerciseState.index++;
    scheduleAdvance(showExercise, 1200);
}

function checkTranslation() {
    let inp = document.getElementById('transInput');
    if (!inp) return;
    let ans = inp.value.trim().toLowerCase();
    let q = window._trans_q;
    if (!q) return;
    let ok = true;
    for (let kw of q.keywords) {
        if (ans.indexOf(kw.toLowerCase()) === -1) { ok = false; break; }
    }
    let container = document.getElementById('exerciseQuestion');
    if (ok) { stats.totalCorrect++; exerciseState.correct++; container.innerHTML = '<div class="feedback ok"><span>Верно!</span></div>'; } else {
        stats.totalWrong++;
        let lesson = currentLesson;
        recordError(lesson, { word: q.greek, correct: q.keywords.join(', '), your: ans });
        container.innerHTML = '<div class="feedback fail"><span>Неверно. Ключевые слова: ' + q.keywords.join(', ') + '</span></div>';
    }
    saveStats();
    exerciseState.index++;
    scheduleAdvance(showExercise, 1500);
}

function pickWord(w) {
    window._chosen.push(w);
    let bank = document.getElementById('wordBank');
    bank.querySelectorAll('.chip').forEach(c => {
        if (c.textContent === w && !c.classList.contains('picked')) c.classList.add('picked');
    });
    let area = document.getElementById('buildArea');
    let t = document.createElement('span');
    t.className = 'token';
    t.textContent = w;
    area.appendChild(t);
}

function clearChosen() {
    window._chosen = [];
    document.getElementById('buildArea').innerHTML = '';
    document.getElementById('wordBank').querySelectorAll('.chip').forEach(c => c.classList.remove('picked'));
}

function checkTranslationRu() {
    let chosen = window._chosen || [];
    let q = window._trans_ru;
    if (!q) return;
    let corr = q.correct_sequence;
    let ok = chosen.length === corr.length && chosen.every((w,i) => w === corr[i]);
    let container = document.getElementById('exerciseQuestion');
    if (ok) {
        stats.totalCorrect++;
        exerciseState.correct++;
        container.innerHTML = `
            <div class="feedback ok"><span>Верно! <strong>${corr.join(' ')}</strong></span></div>
            <button class="menu-btn primary" onclick="nextExercise()">Далее<span class="msym">arrow_forward</span></button>
        `;
    } else {
        stats.totalWrong++;
        let lesson = currentLesson;
        recordError(lesson, { word: q.russian, correct: corr.join(' '), your: chosen.join(' ') });
        container.innerHTML = `
            <div class="feedback fail"><span>Неверно. Правильный порядок: <strong>${corr.join(' ')}</strong></span></div>
            <button class="menu-btn primary" onclick="nextExercise()">Далее<span class="msym">arrow_forward</span></button>
        `;
    }
    saveStats();
    // Убираем setTimeout
}

