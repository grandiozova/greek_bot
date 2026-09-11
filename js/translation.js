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
// ------------------------------------------------------------ лишние фишки
// Лишние слова берутся из словаря урока, а словарь написан словарными
// статьями: «ἀγαθός, ή, όν», «ἀκούω + Gen.», «ἔρχομαι (dep.)», «хороший
// (-ая, -ее)», «через, сквозь (с Gen.); из-за, ради (с Acc.)». Фишка — это одно
// слово предложения, поэтому из статьи берём только слова: заголовочную форму
// без окончаний родов и помет, а из перевода — каждое значение отдельно и без
// пояснений в скобках. Иначе в банке оказываются «-ее)» и «(с Acc.)», а
// словарная статья среди словоформ выдаёт себя с первого взгляда.

// «ἀγαθός, ή, όν» → ἀγαθός; «ἀκούω + Gen.» → ἀκούω; «γίνομαι (dep.) + Nom.» →
// γίνομαι. Скобки, приросшие к слову, — это подвижное ν (λύουσι(ν)), а не помета:
// их не трогаем, отрезаем только помету, отделённую пробелом.
function headwordChip(headword) {
    return String(headword || '')
        .split(',')[0]
        .replace(/\s+\([^)]*\)/g, '')
        .replace(/\s+\+.*$/, '')
        .trim();
}

// «справедливый, праведный (-ая, -ое)» → справедливый, праведный.
// Значение из нескольких слов («вместе с», «кто бы ни») фишкой не становится:
// в банке одиночных слов оно выдало бы себя как лишнее.
function glossChips(translation) {
    return String(translation || '')
        .replace(/\([^)]*\)/g, ' ')
        .split(/[,;]/)
        .map(w => w.trim())
        .filter(w => /^[\p{L}-]+$/u.test(w) && !/^-|-$/.test(w));
}

function translationExtraWords(lessonData, type, correctWords) {
    let vocab = (lessonData && lessonData.vocabulary) || [];
    let pool = type === 'ru_to_el'
        ? vocab.map(v => headwordChip(v.greek)).filter(w => w && !/\s/.test(w))
        : [].concat(...vocab.map(v => glossChips(v.translation)));
    // Лишнее слово не должно совпадать с правильным — ни дословно, ни с точностью
    // до регистра, знака препинания на конце («Бог» в начале фразы, «человек,»)
    // и ударения (заголовочное ἀγαθός рядом с ἀγαθὸς из предложения — одно и то
    // же слово дважды). Ключ только для сравнения: на фишке текст остаётся как есть.
    let key = w => foldAccents(String(w).toLowerCase().replace(/[.,;:!?·]+$/, ''));
    let taken = new Set(correctWords.map(key));
    let out = [];
    for (let w of pool) {
        if (taken.has(key(w))) continue;
        taken.add(key(w));
        out.push(w);
    }
    return out;
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
 
    // Банк слов: правильные слова + до четырёх лишних из словаря урока.
    let extras = translationExtraWords(getLessonData(currentLesson), s.type, q.correct);
    let allWords = shuffle([...q.correct, ...shuffle(extras).slice(0, 4)]);

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
    let ok = keywordsMatch(ans, q.keywords);
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
 
