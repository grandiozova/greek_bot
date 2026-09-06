// ============================================================
// ОТКРЫТИЕ УРОКА И ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
// ============================================================
// Экран урока — две вкладки плюс тест: «Материал» (грамматика, под ней словарь)
// и «Упражнения», куда сведены все виды тренировки, включая карточки и перевод.

// Каталог упражнений урока. kind говорит, чем запускать и в какой контейнер
// рисовать: exercise → exercises.js, translation → translation.js,
// flashcards → flashcards.js. Группы задают порядок и подписи в списке выбора.
const LESSON_DRILL_GROUPS = [
    {
        label: 'Формы и грамматика',
        drills: [
            { kind: 'exercise', key: 'declension_fill', label: 'Склонение', icon: 'account_tree' },
            { kind: 'exercise', key: 'case_number', label: 'Падеж и число', icon: 'target' },
            { kind: 'exercise', key: 'agreement', label: 'Согласование', icon: 'link' },
            { kind: 'exercise', key: 'attribute_vs_predicate', label: 'Атрибут / предикатив', icon: 'balance' },
            { kind: 'exercise', key: 'substantivation', label: 'Субстантивация', icon: 'push_pin' },
            { kind: 'exercise', key: 'article_fill', label: 'Артикль', icon: 'abc' }
        ]
    },
    {
        // Короткие словосочетания из упражнений урока и целые предложения из
        // учебника — разные задания, поэтому в подписях они разведены явно.
        label: 'Перевод',
        drills: [
            { kind: 'exercise', key: 'translate_greek_to_russian', label: 'Фразы: греческий → русский', icon: 'translate' },
            { kind: 'exercise', key: 'translate_russian_to_greek', label: 'Фразы: русский → греческий', icon: 'g_translate' },
            { kind: 'translation', key: 'el_to_ru', label: 'Предложения: греческий → русский', icon: 'translate' },
            { kind: 'translation', key: 'ru_to_el', label: 'Предложения: русский → греческий', icon: 'g_translate' }
        ]
    },
    {
        label: 'Слова',
        drills: [
            { kind: 'flashcards', key: 'flashcards', label: 'Карточки', icon: 'style' }
        ]
    }
];

// Контейнер на «сцене» под выбранное упражнение — по одному на вид.
const DRILL_BOXES = { exercise: 'exerciseQuestion', translation: 'translationQuestion', flashcards: 'flashcardContainer' };

let currentDrill = null;

function lessonDrillAvailable(data, drill) {
    if (drill.kind === 'exercise') return !!(data.exercises && data.exercises[drill.key] && data.exercises[drill.key].length);
    if (drill.kind === 'translation') return !!(data.translation && data.translation[drill.key] && data.translation[drill.key].length);
    if (drill.kind === 'flashcards') return !!(data.vocabulary && data.vocabulary.length);
    return false;
}

function findLessonDrill(kind, key) {
    for (let group of LESSON_DRILL_GROUPS) {
        for (let d of group.drills) if (d.kind === kind && d.key === key) return d;
    }
    return null;
}

// Список выбора: группа без единого доступного упражнения не показывается.
function renderLessonDrills(data) {
    let box = document.getElementById('drillGroups');
    if (!box) return;
    let parts = [];
    LESSON_DRILL_GROUPS.forEach(group => {
        let available = group.drills.filter(d => lessonDrillAvailable(data, d));
        if (available.length === 0) return;
        parts.push('<div class="drill-group"><h4 class="drill-group__label">', group.label, '</h4><div class="md-button-row">');
        available.forEach(d => {
            parts.push(
                '<button class="menu-btn" data-drill="', d.kind, ':', d.key, '"',
                ' onclick="startLessonDrill(\'', d.kind, '\',\'', d.key, '\')">',
                '<span class="msym">', d.icon, '</span>', d.label,
                '</button>'
            );
        });
        parts.push('</div></div>');
    });
    box.innerHTML = parts.length
        ? parts.join('')
        : emptyState('edit_off', 'Упражнений нет', 'Для этого урока упражнения ещё не подготовлены');
}

// Сцена пуста, пока упражнение не выбрано: заголовок карточки называет то,
// что запущено, и без выбора ему нечего показывать.
function resetLessonDrill() {
    currentDrill = null;
    let stage = document.getElementById('drillStage');
    if (stage) stage.classList.add('hidden');
    Object.keys(DRILL_BOXES).forEach(kind => {
        let el = document.getElementById(DRILL_BOXES[kind]);
        if (el) { el.innerHTML = ''; el.classList.add('hidden'); }
    });
    document.querySelectorAll('#drillGroups .menu-btn').forEach(b => b.classList.remove('primary'));
    flashcardState = { words: [], index: 0, revealed: false, correct: 0, total: 0 };
}

function startLessonDrill(kind, key) {
    let data = getLessonData(currentLesson);
    let drill = findLessonDrill(kind, key);
    if (!data || !drill) return;
    currentDrill = kind + ':' + key;

    document.querySelectorAll('#drillGroups .menu-btn').forEach(b => {
        b.classList.toggle('primary', b.getAttribute('data-drill') === currentDrill);
    });

    let stage = document.getElementById('drillStage');
    if (stage) stage.classList.remove('hidden');
    let icon = document.getElementById('drillStageIcon');
    if (icon) icon.textContent = drill.icon;
    let title = document.getElementById('drillStageTitle');
    if (title) title.textContent = drill.label;

    Object.keys(DRILL_BOXES).forEach(k => {
        let el = document.getElementById(DRILL_BOXES[k]);
        if (!el) return;
        el.innerHTML = '';
        el.classList.toggle('hidden', k !== kind);
    });

    if (kind === 'exercise') startExercise(key);
    else if (kind === 'translation') startTranslation(key);
    else if (kind === 'flashcards') startFlashcards();

    if (stage && stage.scrollIntoView) {
        try { stage.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
    }
}

function openLesson(lesson) {
    currentLesson = lesson;
    let data = getLessonData(lesson);
    if (!data) return;
    try { localStorage.setItem('greek_last_lesson', String(lesson)); } catch (e) {}
    document.getElementById('lessonTitle').textContent = data.title;
    currentLessonPart = 'material';
    showSection('lessonSection');
    updateNavButtons(lesson);

    // Уроки 1–2 — это алфавит и правила чтения: тренировать в них нечего,
    // остаётся одна вкладка с материалом.
    let isIntroLesson = (lesson === 1 || lesson === 2);
    document.querySelectorAll('#lessonTabs button').forEach(btn => {
        let part = btn.getAttribute('data-part');
        btn.style.display = (isIntroLesson && part !== 'material') ? 'none' : '';
    });

    document.getElementById('grammarContent').innerHTML = data.grammar || '';

    // Словарь урока — под грамматикой, на той же вкладке
    let container = document.getElementById('vocabList');
    container.innerHTML = '';
    let vocabCard = document.getElementById('lessonVocabCard');
    if (vocabCard) vocabCard.classList.toggle('hidden', !(data.vocabulary && data.vocabulary.length));
    if (data.vocabulary) {
        data.vocabulary.forEach(item => {
            let article = item.article ? item.article + ' ' : '';
            let div = document.createElement('div');
            div.className = 'word-item';
            if (item.declension_forms) {
                div.classList.add('clickable');
                div.onclick = function(el) { return function() { toggleDeclension(el); }; }(div);
            }
            let detailsHtml = '';
            if (item.declension_forms) {
                detailsHtml = '<div class="word-details"><div class="md-table-scroll">' + generateDeclensionTable(item.declension_forms, item.caseTranslations || null) + '</div></div>';
            }
            div.innerHTML = '<div class="word-row"><strong>' + article + item.greek + '</strong><span>' + item.translation + '</span></div>' + detailsHtml;
            container.appendChild(div);
        });
    }

    // Упражнения: список выбора и пустая сцена
    renderLessonDrills(data);
    resetLessonDrill();

    switchLessonPart('material');
}

// Индикатор вкладок скользит под активной вкладкой (M3 primary tabs)
function moveTabIndicator() {
    let bar = document.getElementById('lessonTabs');
    let ind = document.getElementById('lessonTabsIndicator');
    if (!bar || !ind) return;
    let active = bar.querySelector('button.active');
    if (!active) { ind.style.width = '0'; return; }
    ind.style.width = active.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + active.offsetLeft + 'px)';
    // держим активную вкладку в поле зрения (Element.scrollTo есть не везде)
    let left = Math.max(0, active.offsetLeft - (bar.clientWidth - active.offsetWidth) / 2);
    if (typeof bar.scrollTo === 'function') bar.scrollTo({ left: left, behavior: 'smooth' });
    else bar.scrollLeft = left;
}

// Возврат на экран урока восстанавливает выбранную вкладку
function restoreLessonPart() {
    let target = document.getElementById('part' + currentLessonPart.charAt(0).toUpperCase() + currentLessonPart.slice(1));
    if (target) target.classList.add('active');
    requestAnimationFrame(moveTabIndicator);
}

function switchLessonPart(part) {
    currentLessonPart = part;
    document.querySelectorAll('#lessonTabs button').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    let activeTab = document.querySelector('#lessonTabs button[data-part="' + part + '"]');
    if (activeTab) { activeTab.classList.add('active'); activeTab.setAttribute('aria-selected', 'true'); }
    moveTabIndicator();

    document.querySelectorAll('#lessonSection .section').forEach(s => s.classList.remove('active'));
    let target = document.getElementById('part' + part.charAt(0).toUpperCase() + part.slice(1));
    if (target) target.classList.add('active');
}

// ============================================================
// НАВИГАЦИЯ МЕЖДУ УРОКАМИ
// ============================================================
  
function nextExercise() {
    exerciseState.index++;
    showExercise();
}

function nextTranslation() {
    translationState.index++;
    showTranslation();
}
    
function goToPrevLesson() {
    let prev = currentLesson - 1;
    if (prev < 1) {  // было prev < 3
        showToast('Это первый урок.');
        return;
    }
    let data = getLessonData(prev);
    if (!data) {
        showToast('Урок ' + prev + ' ещё не добавлен.');
        return;
    }
    openLesson(prev);
    updateNavButtons(prev);
}

function goToNextLesson() {
    let next = currentLesson + 1;
    if (next > 10) {
        showToast('Это последний урок (урок 10).');
        return;
    }
    let data = getLessonData(next);
    if (!data) {
        showToast('Урок ' + next + ' ещё не добавлен.');
        return;
    }
    openLesson(next);
    updateNavButtons(next);
}

function updateNavButtons(lesson) {
    let prevBtn = document.getElementById('prevLessonBtn');
    let nextBtn = document.getElementById('nextLessonBtn');
    
    if (prevBtn) prevBtn.disabled = (lesson <= 1);
    if (nextBtn) nextBtn.disabled = (lesson >= 10);
}

