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
    // ru_to_el собирают на изучаемом языке, el_to_ru — по-русски. Помечаем
    // только первый: .script развернул бы русский ответ справа налево.
    let answerCls = s.type === 'ru_to_el' ? ' class="script"' : '';
    if (ok) {
        s.correct++;
        stats.totalCorrect++;
        container.innerHTML = `
            <div class="feedback ok"><span>Верно! <strong${answerCls}>${correct.join(' ')}</strong></span></div>
            <button class="menu-btn primary" onclick="nextTranslation()">Далее<span class="msym">arrow_forward</span></button>
        `;
    } else {
        stats.totalWrong++;
        let lesson = currentLesson;
        if (!stats.errors[lesson]) stats.errors[lesson] = [];
        stats.errors[lesson].push({ word: q.source, correct: correct.join(' '), your: chosen.join(' ') });
        container.innerHTML = `
            <div class="feedback fail"><span>Неверно. Правильный порядок: <strong${answerCls}>${correct.join(' ')}</strong></span></div>
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
        chosen: [],
        chosenIdx: []
    };
    showTranslation();
}
 
function showTranslation() {
    let s = translationState;
    if (s.index >= s.total) {
        document.getElementById('translationQuestion').innerHTML =
            resultBlock(s.correct, s.total, 'Упражнение завершено') +
            '<div class="md-button-row">' +
            '<button class="menu-btn primary" onclick="startTranslation(\'' + s.type + '\')"><span class="msym">restart_alt</span>Ещё раз</button>' +
            '<button class="menu-btn outlined" onclick="closeLessonDrill()"><span class="msym">arrow_back</span>К упражнениям</button></div>';
        return;
    }
    let q = s.questions[s.index];
    let container = document.getElementById('translationQuestion');
    let html = progressHead('Перевод ' + (s.index + 1) + ' из ' + s.total, s.index, s.total);
    // Направление перевода решает, на каком языке условие, а на каком фишки:
    // ru_to_el — русское условие и банк слов изучаемого языка, el_to_ru —
    // наоборот. Помечаем ту половину, которая на изучаемом языке.
    let toScript = s.type === 'ru_to_el';
    html += '<div class="question">' +
        (toScript ? q.source : '<span class="script">' + q.source + '</span>') + '</div>';
 
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
 
    // Каждому чипу — свой индекс. Это важно, если одно и то же слово (например, «καί»)
    // встречается в банке слов несколько раз: индекс однозначно связывает конкретный
    // чип с конкретным токеном в поле сборки, чтобы удаление работало точно.
    translationState.allWords = allWords;
 
    html += '<div class="build-area' + (toScript ? ' build-area--script' : '') + '" id="transBuildArea"></div>';
    html += '<div class="word-bank' + (toScript ? ' word-bank--script' : '') + '" id="transWordBank">';
    allWords.forEach((w, idx) => {
        html += '<span class="chip" data-chip-idx="' + idx + '" onclick="transPickWord(\'' + escArg(w) + '\', ' + idx + ')">' + w + '</span>';
    });
    html += '</div>';
    html += '<div class="md-button-row"><button class="menu-btn primary" onclick="checkTranslationBuild()"><span class="msym">check</span>Проверить</button>';
    html += '<button class="menu-btn text" onclick="transClear()"><span class="msym">undo</span>Очистить</button></div>';
 
    container.innerHTML = html;
    translationState.chosen = [];
    translationState.chosenIdx = [];
}
 
function transPickWord(w, idx) {
    let s = translationState;
    // Повторный клик по уже выбранной фишке не добавляет слово второй раз:
    // иначе в поле сборки появились бы два токена с одним data-chip-idx,
    // и transRemoveToken убрал бы только один из них.
    let chip = document.querySelector('#transWordBank .chip[data-chip-idx="' + idx + '"]');
    if (!chip || chip.classList.contains('picked')) return;
    chip.classList.add('picked');

    if (!s.chosenIdx) s.chosenIdx = [];
    s.chosen.push(w);
    s.chosenIdx.push(idx);
 
    let area = document.getElementById('transBuildArea');
    let t = document.createElement('span');
    t.className = 'token';
    t.textContent = w;
    t.setAttribute('data-chip-idx', idx);
    t.title = 'Нажмите, чтобы убрать слово';
    t.setAttribute('role', 'button');
    t.setAttribute('tabindex', '0');
    t.onclick = function () { transRemoveToken(idx); };
    t.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); transRemoveToken(idx); } };
    area.appendChild(t);
}
 
// Убирает ровно то слово, по чипу которого кликнули — остальные токены не трогает.
function transRemoveToken(idx) {
    let s = translationState;
    if (!s.chosenIdx) return;
    let pos = s.chosenIdx.indexOf(idx);
    if (pos === -1) return;
    s.chosenIdx.splice(pos, 1);
    s.chosen.splice(pos, 1);
 
    let area = document.getElementById('transBuildArea');
    let tokenEl = area && area.querySelector('.token[data-chip-idx="' + idx + '"]');
    if (tokenEl) tokenEl.remove();
 
    let chip = document.querySelector('#transWordBank .chip[data-chip-idx="' + idx + '"]');
    if (chip) chip.classList.remove('picked');
}
 
function transClear() {
    translationState.chosen = [];
    translationState.chosenIdx = [];
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
 
