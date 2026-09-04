// ============================================================
// M3 SHELL: top app bar, navigation bar, FAB
// ============================================================
let currentSectionId = 'mainMenu';
let currentLessonPart = 'grammar';
let titleFadeTimer = null;

// Метаданные экранов: заголовок app bar, активная точка навигации,
// действие кнопки «назад» (null → кнопка скрыта).
const SCREEN_META = {
    mainMenu:             { title: 'Древнегреческий', dest: 'lessons',  back: null },
    allVocabSection:      { title: 'Словарь',         dest: 'vocab',    back: null },
    allFlashcardsSection: { title: 'Проверка слов',   dest: 'cards',    back: null },
    statsSection:         { title: 'Прогресс',        dest: 'progress', back: null },
    lessonSection:        { title: 'Урок',            dest: 'lessons',  back: 'lessons' },
    testSection:          { title: 'Тест',            dest: null,       back: 'test' },
    errorsSection:        { title: 'Ошибки',          dest: 'progress', back: 'progress' },
    prayerSection:        { title: 'Отче наш',        dest: 'lessons',  back: 'lessons' },
    settingsSection:      { title: 'Настройки',       dest: 'settings', back: null }
};

const DEST_SECTION = {
    lessons:  'mainMenu',
    vocab:    'allVocabSection',
    cards:    'allFlashcardsSection',
    progress: 'statsSection',
    settings: 'settingsSection'
};

// Контекстный FAB — главное действие текущего экрана
const FAB_CONFIG = {
    mainMenu:             { icon: 'play_arrow',  label: 'Продолжить' },
    allVocabSection:      { icon: 'search',      label: 'Поиск' },
    allFlashcardsSection: { icon: 'restart_alt', label: 'Заново' },
    lessonSection:        { icon: 'quiz',        label: 'Тест' },
    prayerSection:        { icon: 'translate',   label: 'Упражнение' }
};

function showSection(id) {
    // Уходя с экрана, гасим отложенный переход к следующему вопросу.
    cancelAdvance();
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    let t = document.getElementById(id);
    if (t) t.classList.add('active');
    currentSectionId = id;
    // Внутренние вкладки урока сбрасываются вместе со всеми .section — восстанавливаем
    if (id === 'lessonSection') restoreLessonPart();
    updateShell();
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
}

function updateShell() {
    let meta = SCREEN_META[currentSectionId] || { title: 'Древнегреческий', dest: null, back: null };

    // --- заголовок ---
    let titleEl = document.getElementById('appBarTitle');
    if (titleEl) {
        let title = meta.title;
        if (currentSectionId === 'lessonSection') {
            let d = getLessonData(currentLesson);
            title = d ? 'Урок ' + currentLesson : 'Урок';
        }
        if (titleEl.textContent !== title) {
            // мягкая замена заголовка; быстрые переходы подряд не должны гонять таймеры
            clearTimeout(titleFadeTimer);
            titleEl.style.opacity = '0';
            titleFadeTimer = setTimeout(() => { titleEl.style.opacity = '1'; }, 100);
            titleEl.textContent = title;
        }
    }

    // --- кнопка «назад» ---
    let leading = document.getElementById('appBarLeading');
    if (leading) {
        if (meta.back) {
            if (!leading.firstChild) {
                leading.innerHTML = '<button class="md-icon-button" onclick="goBack()" aria-label="Назад"><span class="msym">arrow_back</span></button>';
            }
        } else {
            leading.innerHTML = '';
        }
    }

    // --- активная точка навигации ---
    document.querySelectorAll('.md-nav-item').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-dest') === meta.dest);
    });

    // --- контекстный FAB ---
    let fab = document.getElementById('mainFab');
    let cfg = FAB_CONFIG[currentSectionId];
    if (fab) {
        if (cfg && !(currentSectionId === 'lessonSection' && (currentLesson === 1 || currentLesson === 2))) {
            fab.classList.remove('hidden-fab');
            document.getElementById('mainFabIcon').textContent = cfg.icon;
            document.getElementById('mainFabLabel').textContent = cfg.label;
            fab.setAttribute('aria-label', cfg.label);
        } else {
            fab.classList.add('hidden-fab');
        }
    }
}

function navigateTo(dest) {
    let id = DEST_SECTION[dest];
    if (!id) return;
    if (dest === 'lessons') { goToMain(); return; }
    if (dest === 'progress') { showStats(); return; }
    if (dest === 'settings') { showSettings(); return; }
    if (dest === 'vocab') {
        // возвращаясь в словарь, сохраняем набранный запрос
        if (allVocabCache) { showSection(id); filterAllVocab(); }
        else showAllVocab();
        return;
    }
    if (dest === 'cards') {
        // не сбрасываем начатую колоду при переключении разделов
        if (allFlashcardState.total && allFlashcardState.index < allFlashcardState.total) {
            showSection(id);
            showAllFlashcard();
        } else {
            startAllFlashcards();
        }
        return;
    }
    showSection(id);
}

function goBack() {
    let meta = SCREEN_META[currentSectionId];
    if (!meta || !meta.back) return;
    if (meta.back === 'test') { cancelTest(); return; }
    navigateTo(meta.back);
}

function onFabClick() {
    switch (currentSectionId) {
        case 'mainMenu':             continueLesson(); break;
        case 'allVocabSection':      focusVocabSearch(); break;
        case 'allFlashcardsSection': startAllFlashcards(); break;
        case 'lessonSection':        startTest(); break;
        case 'prayerSection':        startPrayerTranslate(); break;
    }
}

function continueLesson() {
    let last = 1;
    try { last = parseInt(localStorage.getItem('greek_last_lesson'), 10) || 1; } catch (e) {}
    if (!getLessonData(last)) last = 1;
    openLesson(last);
}

function focusVocabSearch() {
    let input = document.getElementById('vocabSearchInput');
    if (input) { input.focus(); input.select(); }
}

function goToMain() { showSection('mainMenu'); renderMainMenu(); }

function renderMainMenu() {
    let grid = document.getElementById('lessonGrid');
    if (!grid) return;
    grid.innerHTML = '';
    let last = 1;
    try { last = parseInt(localStorage.getItem('greek_last_lesson'), 10) || 0; } catch (e) {}
    for (let l = 1; l <= 10; l++) {
        let data = getLessonData(l);
        if (!data) continue;
        if (grid.children.length) grid.appendChild(Object.assign(document.createElement('hr'), { className: 'md-divider' }));
        let btn = document.createElement('button');
        btn.className = 'lesson-item';
        btn.innerHTML =
            '<span class="lesson-item__avatar">' + l + '</span>' +
            '<span class="lesson-item__text">' +
                '<span class="lesson-item__headline">' + data.title + '</span>' +
                '<span class="lesson-item__supporting">' + describeLesson(l, data) + '</span>' +
            '</span>' +
            '<span class="lesson-item__trailing msym">' + (l === last ? 'resume' : 'chevron_right') + '</span>';
        btn.onclick = (function(lesson) { return function() { openLesson(lesson); }; })(l);
        grid.appendChild(btn);
    }
}

// Подпись урока: сколько слов и какие материалы доступны
function describeLesson(l, data) {
    let bits = [];
    if (data.vocabulary && data.vocabulary.length) bits.push(data.vocabulary.length + ' ' + pluralRu(data.vocabulary.length, 'слово', 'слова', 'слов'));
    let exCount = 0;
    if (data.exercises) for (let k in data.exercises) if (data.exercises[k] && data.exercises[k].length) exCount += data.exercises[k].length;
    if (exCount) bits.push(exCount + ' ' + pluralRu(exCount, 'упражнение', 'упражнения', 'упражнений'));
    return bits.length ? bits.join(' · ') : 'Теория';
}

function pluralRu(n, one, few, many) {
    let m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
}

