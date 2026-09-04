// ============================================================
// ПРОВЕРКА ВСЕХ СЛОВ (КАРТОЧКИ)
// ============================================================
function startAllFlashcards() {
    showSection('allFlashcardsSection');
    var container = document.getElementById('allFlashcardContainer');
    var allWords = [];
    for (var l = 3; l <= 10; l++) {
        var data = getLessonData(l);
        if (!data || !data.vocabulary) continue;
        for (var i = 0; i < data.vocabulary.length; i++) {
            var item = data.vocabulary[i];
            allWords.push({
                greek: item.greek,
                article: item.article || '',
                translation: item.translation,
                lesson: l
            });
        }
    }
    if (allWords.length === 0) {
        container.innerHTML = emptyState('inbox', 'Слов пока нет');
        return;
    }
    var shuffled = shuffle(allWords);
    allFlashcardState = {
        words: shuffled,
        index: 0,
        revealed: false,
        correct: 0,
        total: shuffled.length
    };
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
    html += '<div class="md-flashcard"><div class="flashcard-word">' + (w.article ? w.article + ' ' : '') + w.greek + '</div>';
    if (s.revealed) html += '<div class="flashcard-translation">' + w.translation + '</div>';
    html += '</div>';
    if (s.revealed) {
        html += '<div class="flashcard-buttons"><button class="know" onclick="allFlashcardAnswer(true)"><span class="msym">check</span>Знаю</button><button class="dontknow" onclick="allFlashcardAnswer(false)"><span class="msym">close</span>Не знаю</button></div>';
    } else {
        html += '<div class="flashcard-buttons"><button class="show" onclick="allFlashcardReveal()"><span class="msym">visibility</span>Показать перевод</button></div>';
    }
    container.innerHTML = html;
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
    s.revealed = false;
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
        return { greek: item.greek, article: item.article || '', translation: item.translation };
    }));
    flashcardState = { words: words, index: 0, revealed: false, correct: 0, total: words.length };
    showFlashcard();
}

function showFlashcard() {
    let s = flashcardState;
    let container = document.getElementById('flashcardContainer');
    if (s.index >= s.total) {
        let p = Math.round((s.correct / s.total) * 100);
        container.innerHTML = resultBlock(s.correct, s.total, 'Карточки завершены') +
            '<button class="menu-btn primary" onclick="startFlashcards()"><span class="msym">restart_alt</span>Повторить</button>';
        return;
    }
    let w = s.words[s.index];
    let html = progressHead('Карточка ' + (s.index + 1) + ' из ' + s.total, s.index, s.total);
    html += '<div class="md-flashcard"><div class="flashcard-word">' + (w.article ? w.article + ' ' : '') + w.greek + '</div>';
    if (s.revealed) html += '<div class="flashcard-translation">' + w.translation + '</div>';
    html += '</div>';
    if (s.revealed) {
        html += '<div class="flashcard-buttons"><button class="know" onclick="flashAnswer(true)"><span class="msym">check</span>Знаю</button><button class="dontknow" onclick="flashAnswer(false)"><span class="msym">close</span>Не знаю</button></div>';
    } else {
        html += '<div class="flashcard-buttons"><button class="show" onclick="flashReveal()"><span class="msym">visibility</span>Показать перевод</button></div>';
    }
    container.innerHTML = html;
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
    s.revealed = false;
    showFlashcard();
}

