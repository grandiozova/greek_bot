// ============================================================
// ФУНКЦИИ ДЛЯ "ОТЧЕ НАШ"
// ============================================================

let prayerExerciseState = { type: null, questions: [], index: 0, correct: 0, total: 0, chosen: [] };

function showPrayer() {
    showSection('prayerSection');
    renderPrayerText();
    renderPrayerExercise();
}
    
function renderPrayerText() {
    const container = document.getElementById('prayerContent');
    let html = '<p class="md-body-medium mb-12">Нажмите на любое слово, чтобы увидеть разбор формы.</p>';
    PRAYER_DATA.verses.forEach((verse, verseIdx) => {
        html += `<div class="prayer-verse">`;
        html += `<div class="prayer-line">`;
        verse.words.forEach((word, wordIdx) => {
            html += `<span class="prayer-word" data-verse="${verseIdx}" data-word="${wordIdx}" role="button" tabindex="0" onclick="showWordAnalysis(${verseIdx}, ${wordIdx})">${word.greek}</span>`;
        });
        html += `</div>`;
        html += `<div class="prayer-russian">${verse.russian}</div>`;
        if (verse.transcription) {
            html += `<div class="prayer-transcription">${verse.transcription}</div>`;
        }
        html += `<div id="analysis-${verseIdx}" class="prayer-analysis"></div>`;
        html += `</div>`;
    });
    container.innerHTML = html;
}

function showWordAnalysis(verseIdx, wordIdx) {
    const verse = PRAYER_DATA.verses[verseIdx];
    const word = verse.words[wordIdx];
    const analysisDiv = document.getElementById(`analysis-${verseIdx}`);
    if (!analysisDiv) return;

    // Закрываем все другие окна анализа
    document.querySelectorAll('[id^="analysis-"]').forEach(el => {
        if (el.id !== `analysis-${verseIdx}`) {
            el.style.display = 'none';
        }
    });

    // Показываем и заполняем (без кнопки!)
    // подсветка активного слова
    document.querySelectorAll('.prayer-word.selected').forEach(el => el.classList.remove('selected'));
    let wordEl = document.querySelector(`.prayer-word[data-verse="${verseIdx}"][data-word="${wordIdx}"]`);
    if (wordEl) wordEl.classList.add('selected');

    analysisDiv.style.display = 'block';
    analysisDiv.innerHTML = `
        <strong>${word.greek}</strong> — ${word.translation}<br>
        <span>${word.analysis}</span>
    `;
}

function renderPrayerExercise() {
    const container = document.getElementById('prayerExercise');
    let html = `<div class="md-button-row" style="margin-top:0;">
        <button class="menu-btn" onclick="startPrayerFill()"><span class="msym">edit</span>Заполни пропуски</button>
        <button class="menu-btn primary" onclick="startPrayerTranslate()"><span class="msym">translate</span>Перевод на греческий</button>
    </div>`;
    html += `<div id="prayerExerciseQuestion"></div>`;
    container.innerHTML = html;
}
    
function closeAllAnalysis() {
    document.querySelectorAll('[id^="analysis-"]').forEach(el => {
        el.style.display = 'none';
    });
}
    
function startPrayerFill() {
    let questions = [];
    PRAYER_DATA.verses.forEach(verse => {
        const wordIndex = Math.floor(Math.random() * verse.words.length);
        const correctWord = verse.words[wordIndex].greek;
        const allWords = PRAYER_DATA.verses.flatMap(v => v.words.map(w => w.greek));
        const distractors = shuffle(allWords.filter(w => w !== correctWord)).slice(0, 3);
        questions.push({
            verse: verse.greek,
            correct: correctWord,
            distractors: distractors,
            blankIndex: wordIndex,
            russian: verse.russian
        });
    });
    prayerExerciseState = { type: 'fill', questions: shuffle(questions), index: 0, correct: 0, total: questions.length };
    showPrayerExerciseQuestion();
}

function startPrayerTranslate() {
    let questions = [];
    PRAYER_DATA.verses.forEach(verse => {
        const correctWords = verse.words.map(w => w.greek);
        const allWords = PRAYER_DATA.verses.flatMap(v => v.words.map(w => w.greek));
        const extras = shuffle(allWords.filter(w => !correctWords.includes(w))).slice(0, 3);
        const pool = shuffle([...correctWords, ...extras]);
        questions.push({
            russian: verse.russian,
            correct: correctWords,
            pool: pool
        });
    });
    prayerExerciseState = { type: 'translate', questions: shuffle(questions), index: 0, correct: 0, total: questions.length, chosen: [] };
    showPrayerExerciseQuestion();
}

function showPrayerExerciseQuestion() {
    const state = prayerExerciseState;
    const container = document.getElementById('prayerExerciseQuestion');
    if (state.index >= state.total) {
        let p = Math.round((state.correct / state.total) * 100);
        container.innerHTML = resultBlock(state.correct, state.total, 'Упражнение завершено') +
            `<button class="menu-btn primary" onclick="startPrayer${state.type==='fill'?'Fill':'Translate'}()"><span class="msym">restart_alt</span>Ещё раз</button>`;
        return;
    }
    const q = state.questions[state.index];
    if (state.type === 'fill') {
        const words = q.verse.split(' ');
        const displayWords = words.map((w, i) => {
            if (i === q.blankIndex) return '___';
            return w;
        });
        const text = displayWords.join(' ');
        let html = progressHead(`Вопрос ${state.index+1} из ${state.total}`, state.index, state.total);
        html += `<div class="question">${text}</div>`;
        html += `<div class="prayer-russian mb-12">${q.russian}</div>`;
        html += `<div class="options options--greek">`;
        const opts = shuffle([q.correct, ...q.distractors]);
        opts.forEach(opt => {
            html += `<button class="option-btn" onclick="prayerFillAnswer('${opt}', '${q.correct}')">${opt}</button>`;
        });
        html += `</div>`;
        container.innerHTML = html;
    } else if (state.type === 'translate') {
        let html = progressHead(`Вопрос ${state.index+1} из ${state.total}`, state.index, state.total);
        html += `<div class="question">${q.russian}</div>`;
        html += `<div class="prayer-russian mb-12">Соберите греческий перевод из слов</div>`;
        html += `<div class="build-area" id="prayerBuildArea"></div>`;
        html += `<div class="word-bank" id="prayerWordBank">`;
        q.pool.forEach(w => {
            html += `<span class="chip" onclick="prayerPickWord('${w}')">${w}</span>`;
        });
        html += `</div>`;
        html += `<div class="md-button-row"><button class="menu-btn primary" onclick="prayerCheckTranslate()"><span class="msym">check</span>Проверить</button>`;
        html += `<button class="menu-btn text" onclick="prayerClearTranslate()"><span class="msym">undo</span>Очистить</button></div>`;
        container.innerHTML = html;
        prayerExerciseState.chosen = [];
    }
}

function prayerFillAnswer(selected, correct) {
    const state = prayerExerciseState;
    const container = document.getElementById('prayerExerciseQuestion');
    const btns = container.querySelectorAll('.option-btn');
    btns.forEach(b => {
        b.disabled = true;
        if (b.textContent === correct) b.classList.add('correct');
        if (b.textContent === selected && selected !== correct) b.classList.add('wrong');
    });
    if (selected === correct) {
        state.correct++;
        stats.totalCorrect++;
    } else {
        stats.totalWrong++;
    }
    saveStats();
    state.index++;
    scheduleAdvance(showPrayerExerciseQuestion, 1200);
}

function prayerPickWord(w) {
    prayerExerciseState.chosen.push(w);
    let bank = document.getElementById('prayerWordBank');
    bank.querySelectorAll('.chip').forEach(c => {
        if (c.textContent === w && !c.classList.contains('picked')) c.classList.add('picked');
    });
    let area = document.getElementById('prayerBuildArea');
    let t = document.createElement('span');
    t.className = 'token';
    t.textContent = w;
    area.appendChild(t);
}

function prayerClearTranslate() {
    prayerExerciseState.chosen = [];
    document.getElementById('prayerBuildArea').innerHTML = '';
    document.getElementById('prayerWordBank').querySelectorAll('.chip').forEach(c => c.classList.remove('picked'));
}

function prayerCheckTranslate() {
    const state = prayerExerciseState;
    const q = state.questions[state.index];
    const chosen = state.chosen;
    const correct = q.correct;
    const ok = chosen.length === correct.length && chosen.every((w, i) => w === correct[i]);
    const container = document.getElementById('prayerExerciseQuestion');
    if (ok) {
        state.correct++;
        stats.totalCorrect++;
        container.innerHTML = '<div class="feedback ok"><span>Верно!</span></div>';
    } else {
        stats.totalWrong++;
        container.innerHTML = `<div class="feedback fail"><span>Неверно. Правильный порядок: <strong>${correct.join(' ')}</strong></span></div>`;
    }
    saveStats();
    state.index++;
    scheduleAdvance(showPrayerExerciseQuestion, 1500);
}    
    

// Закрываем окно анализа при клике на пустое место
document.addEventListener('click', function(e) {
    const target = e.target;
    // Если клик был по слову (prayer-word) – ничего не делаем (откроется в showWordAnalysis)
    if (target.classList.contains('prayer-word')) return;
    // Если клик был внутри любого окна анализа – ничего не делаем (оставляем открытым)
    if (target.closest('[id^="analysis-"]')) return;
    // Иначе – закрываем все окна
    closeAllAnalysis();
});
