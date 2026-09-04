// ============================================================
// ФУНКЦИИ ДЛЯ ПЕРЕВОДА
// ============================================================

function checkTranslationBuild() {
    let s = translationState;
    if (s.index >= s.total) return;
    let q = s.questions[s.index];
    if (!q) return;
    let chosen = s.chosen;
    let correct = q.correct;
    let ok = chosen.length === correct.length && chosen.every((w, i) => w === correct[i]);
    let container = document.getElementById('translationQuestion');
    if (ok) {
        s.correct++;
        stats.totalCorrect++;
        container.innerHTML = `
            <div class="feedback ok"><span>Верно! <strong>${correct.join(' ')}</strong></span></div>
            <button class="menu-btn primary" onclick="nextTranslation()">Далее<span class="msym">arrow_forward</span></button>
        `;
    } else {
        stats.totalWrong++;
        let lesson = currentLesson;
        if (!stats.errors[lesson]) stats.errors[lesson] = [];
        stats.errors[lesson].push({ word: q.source, correct: correct.join(' '), your: chosen.join(' ') });
        container.innerHTML = `
            <div class="feedback fail"><span>Неверно. Правильный порядок: <strong>${correct.join(' ')}</strong></span></div>
            <button class="menu-btn primary" onclick="nextTranslation()">Далее<span class="msym">arrow_forward</span></button>
        `;
    }
    saveStats();
    // Убираем setTimeout
}
function startTranslation(type) {
    let data = getLessonData(currentLesson);
    if (!data || !data.translation || !data.translation[type]) {
        document.getElementById('translationQuestion').innerHTML = '<p>Нет упражнений.</p>';
        return;
    }
    let qs = data.translation[type].slice();
    translationState = {
        type: type,
        questions: shuffle(qs),
        index: 0,
        correct: 0,
        total: qs.length,
        chosen: []
    };
    showTranslation();
}

function showTranslation() {
    let s = translationState;
    if (s.index >= s.total) {
        let p = Math.round((s.correct / s.total) * 100);
        document.getElementById('translationQuestion').innerHTML =
            resultBlock(s.correct, s.total, 'Упражнение завершено') +
            '<button class="menu-btn primary" onclick="startTranslation(\'' + s.type + '\')"><span class="msym">restart_alt</span>Ещё раз</button>';
        return;
    }
    let q = s.questions[s.index];
    let container = document.getElementById('translationQuestion');
    let html = progressHead('Перевод ' + (s.index + 1) + ' из ' + s.total, s.index, s.total);
    html += '<div class="question">' + q.source + '</div>';

    // Собираем все слова: правильные + лишние (из словаря урока)
    let lessonData = getLessonData(currentLesson);
    let vocabWords = lessonData.vocabulary ? lessonData.vocabulary.map(v => v.greek) : [];
    let allWords = [];
    if (s.type === 'ru_to_el') {
        let correctWords = q.correct;
        let extras = vocabWords.filter(w => !correctWords.includes(w));
        let chosenExtras = shuffle(extras).slice(0, 4);
        allWords = shuffle([...correctWords, ...chosenExtras]);
    } else {
        let correctWords = q.correct;
        let allTranslations = lessonData.vocabulary ? lessonData.vocabulary.map(v => v.translation) : [];
        let flat = [];
        allTranslations.forEach(t => {
            t.split(/[,;]/).forEach(w => {
                let trimmed = w.trim();
                if (trimmed) flat.push(trimmed);
            });
        });
        let extras = flat.filter(w => !correctWords.includes(w));
        let chosenExtras = shuffle(extras).slice(0, 4);
        allWords = shuffle([...correctWords, ...chosenExtras]);
    }

    html += '<div class="build-area" id="transBuildArea"></div>';
    html += '<div class="word-bank" id="transWordBank">';
    for (let w of allWords) {
        html += '<span class="chip" onclick="transPickWord(\'' + escArg(w) + '\')">' + w + '</span>';
    }
    html += '</div>';
    html += '<div class="md-button-row"><button class="menu-btn primary" onclick="checkTranslationBuild()"><span class="msym">check</span>Проверить</button>';
    html += '<button class="menu-btn text" onclick="transClear()"><span class="msym">undo</span>Очистить</button></div>';

    container.innerHTML = html;
    translationState.chosen = [];
}

function transPickWord(w) {
    translationState.chosen.push(w);
    let bank = document.getElementById('transWordBank');
    bank.querySelectorAll('.chip').forEach(c => {
        if (c.textContent === w && !c.classList.contains('picked')) c.classList.add('picked');
    });
    let area = document.getElementById('transBuildArea');
    let t = document.createElement('span');
    t.className = 'token';
    t.textContent = w;
    area.appendChild(t);
}

function transClear() {
    translationState.chosen = [];
    document.getElementById('transBuildArea').innerHTML = '';
    document.getElementById('transWordBank').querySelectorAll('.chip').forEach(c => c.classList.remove('picked'));
}

function checkExerciseTranslation(index) {
    let inp = document.getElementById('transInput');
    if (!inp) return;
    let ans = inp.value.trim().toLowerCase();
    let q = exerciseState.questions[index];
    if (!q) {
        document.getElementById('exerciseQuestion').innerHTML = '<div class="feedback fail"><span>Что-то пошло не так. Начните упражнение заново.</span></div>';
        return;
    }
    let ok = true;
    for (let kw of q.keywords) {
        if (ans.indexOf(kw.toLowerCase()) === -1) { ok = false; break; }
    }
    let container = document.getElementById('exerciseQuestion');
    if (ok) {
        stats.totalCorrect++;
        exerciseState.correct++;
        container.innerHTML = `
            <div class="feedback ok"><span>Верно! <strong>${q.keywords.join(', ')}</strong></span></div>
            <button class="menu-btn primary" onclick="nextExercise()">Далее<span class="msym">arrow_forward</span></button>
        `;
    } else {
        stats.totalWrong++;
        let lesson = currentLesson;
        recordError(lesson, { word: q.greek, correct: q.keywords.join(', '), your: ans });
        container.innerHTML = `
            <div class="feedback fail"><span>Неверно. Ключевые слова: <strong>${q.keywords.join(', ')}</strong></span></div>
            <button class="menu-btn primary" onclick="nextExercise()">Далее<span class="msym">arrow_forward</span></button>
        `;
    }
    saveStats();
    // setTimeout убираем
}

