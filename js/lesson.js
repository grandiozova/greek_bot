// ============================================================
// ОТКРЫТИЕ УРОКА И ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
// ============================================================
// Экран урока — три уровня. Открытый урок показывает список своих разделов
// (#partMenu, часть 'menu'): «Материал» (грамматика, под ней словарь),
// «Упражнения» и «Тест». Панель вкладок появляется только внутри раздела —
// на первом уровне переключать нечего, а список объясняет, что там есть.
// Выбранное упражнение уходит на собственный экран (#drillSection).

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

function countLessonDrills(data) {
    let n = 0;
    LESSON_DRILL_GROUPS.forEach(g => g.drills.forEach(d => { if (lessonDrillAvailable(data, d)) n++; }));
    return n;
}

// Пункт списка-меню: тот же M3 list item, что и в списке уроков, только в
// «аватаре» иконка, а не номер.
function menuItemHtml(icon, label, hint, onclick) {
    return '<button class="lesson-item' + (hint ? '' : ' lesson-item--single') + '" onclick="' + onclick + '">' +
        '<span class="lesson-item__avatar"><span class="msym">' + icon + '</span></span>' +
        '<span class="lesson-item__text">' +
            '<span class="lesson-item__headline">' + label + '</span>' +
            (hint ? '<span class="lesson-item__supporting">' + hint + '</span>' : '') +
        '</span>' +
        '<span class="lesson-item__trailing msym">chevron_right</span>' +
    '</button>';
}

// Разделы урока списком. Уроки 1–2 — алфавит и правила чтения: тренировать
// в них нечего, остаётся один пункт.
function renderLessonMenu(data, isIntroLesson) {
    let box = document.getElementById('lessonPartMenu');
    if (!box) return;
    let items = [];

    let words = (data.vocabulary && data.vocabulary.length) || 0;
    items.push(menuItemHtml('school', 'Материал',
        words ? 'Грамматика и ' + words + ' ' + pluralRu(words, 'слово', 'слова', 'слов') : 'Грамматика урока',
        "switchLessonPart('material')"));

    if (!isIntroLesson) {
        let drills = countLessonDrills(data);
        if (drills) {
            items.push(menuItemHtml('edit_note', 'Упражнения',
                drills + ' ' + pluralRu(drills, 'вид', 'вида', 'видов') + ' тренировки',
                "switchLessonPart('exercise')"));
        }
        if (countTestQuestions(data)) {
            items.push(menuItemHtml('quiz', 'Тест', 'Случайные вопросы по уроку', 'startTest()'));
        }
    }

    box.innerHTML = items.join('<hr class="md-divider">');
}

// Список выбора: группа без единого доступного упражнения не показывается.
function renderLessonDrills(data) {
    let box = document.getElementById('drillGroups');
    if (!box) return;
    let parts = [];
    LESSON_DRILL_GROUPS.forEach(group => {
        let available = group.drills.filter(d => lessonDrillAvailable(data, d));
        if (available.length === 0) return;
        parts.push('<div class="drill-group"><h4 class="drill-group__label">', group.label, '</h4><div class="lesson-list">');
        available.forEach((d, i) => {
            if (i) parts.push('<hr class="md-divider">');
            parts.push(menuItemHtml(d.icon, d.label, null,
                'startLessonDrill(\'' + d.kind + '\',\'' + d.key + '\')'));
        });
        parts.push('</div></div>');
    });
    box.innerHTML = parts.length
        ? parts.join('')
        : emptyState('edit_off', 'Упражнений нет', 'Для этого урока упражнения ещё не подготовлены');
}

// Экран упражнения пуст, пока упражнение не выбрано.
function resetLessonDrill() {
    currentDrill = null;
    Object.keys(DRILL_BOXES).forEach(kind => {
        let el = document.getElementById(DRILL_BOXES[kind]);
        if (el) { el.innerHTML = ''; el.classList.add('hidden'); }
    });
    flashcardState = { words: [], index: 0, revealed: false, correct: 0, total: 0 };
}

// Упражнение — отдельный экран: список выбора остаётся нетронутым позади,
// «назад» из app bar возвращает к нему (SCREEN_META.drillSection).
function startLessonDrill(kind, key) {
    let data = getLessonData(currentLesson);
    let drill = findLessonDrill(kind, key);
    if (!data || !drill) return;
    currentDrill = drill;

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

    showSection('drillSection');

    if (kind === 'exercise') startExercise(key);
    else if (kind === 'translation') startTranslation(key);
    else if (kind === 'flashcards') startFlashcards();
}

// Возврат с экрана упражнения — на вкладку «Упражнения» того же урока.
function closeLessonDrill() {
    resetLessonDrill();
    currentLessonPart = 'exercise';
    showSection('lessonSection');
    switchLessonPart('exercise');
}

function openLesson(lesson) {
    currentLesson = lesson;
    let data = getLessonData(lesson);
    if (!data) return;
    try { localStorage.setItem('greek_last_lesson', String(lesson)); } catch (e) {}
    document.getElementById('lessonTitle').textContent = data.title;
    currentLessonPart = 'menu';
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

    // Разделы урока и список упражнений внутри вкладки «Упражнения»
    renderLessonMenu(data, isIntroLesson);
    renderLessonDrills(data);
    resetLessonDrill();

    switchLessonPart('menu');
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

function lessonPartPanel(part) {
    return document.getElementById('part' + part.charAt(0).toUpperCase() + part.slice(1));
}

// Панель вкладок нужна только внутри раздела: на списке разделов ей нечего
// показывать, а лишний ряд вкладок над меню только сбивает с толку.
function updateLessonTabsVisibility() {
    let bar = document.getElementById('lessonTabs');
    if (bar) bar.classList.toggle('hidden', currentLessonPart === 'menu');
}

// Возврат на экран урока восстанавливает выбранную вкладку
function restoreLessonPart() {
    updateLessonTabsVisibility();
    let target = lessonPartPanel(currentLessonPart);
    if (target) target.classList.add('active');
    requestAnimationFrame(moveTabIndicator);
}

function switchLessonPart(part) {
    currentLessonPart = part;
    updateLessonTabsVisibility();
    document.querySelectorAll('#lessonTabs button').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    let activeTab = document.querySelector('#lessonTabs button[data-part="' + part + '"]');
    if (activeTab) { activeTab.classList.add('active'); activeTab.setAttribute('aria-selected', 'true'); }
    moveTabIndicator();

    document.querySelectorAll('#lessonSection .section').forEach(s => s.classList.remove('active'));
    let target = lessonPartPanel(part);
    if (target) target.classList.add('active');
}

// ============================================================
// СВАЙП МЕЖДУ РАЗДЕЛАМИ УРОКА
// ============================================================
// На сенсорном экране горизонтальный жест переключает вкладки урока.
// «Тест» в этот ряд не входит: он уводит на другой экран, и промахнуться
// пальцем в него — не то же самое, что промахнуться вкладкой.
const SWIPE_PARTS = ['material', 'exercise'];
const SWIPE_MIN_DISTANCE = 64;   // px по горизонтали
const SWIPE_MAX_SLOPE = 0.5;     // |dy| / |dx|: наклонный жест — это прокрутка
// Внутри прокручиваемого вбок (таблицы склонений, сама панель вкладок) и в полях
// ввода жест принадлежит элементу, а не навигации.
const SWIPE_BLOCKERS = '.md-table-scroll, .tab-bar, .chip-set, input, textarea';

let lessonSwipe = null;

function initLessonSwipe() {
    let host = document.getElementById('lessonSection');
    if (!host) return;
    host.addEventListener('touchstart', function (e) {
        if (!e.touches || e.touches.length !== 1) { lessonSwipe = null; return; }
        let t = e.touches[0];
        let blocked = !!(e.target && e.target.closest && e.target.closest(SWIPE_BLOCKERS));
        lessonSwipe = { x: t.clientX, y: t.clientY, blocked: blocked };
    }, { passive: true });

    host.addEventListener('touchmove', function (e) {
        // Второй палец — это масштабирование, а не листание.
        if (e.touches && e.touches.length > 1) lessonSwipe = null;
    }, { passive: true });

    host.addEventListener('touchend', function (e) {
        let s = lessonSwipe;
        lessonSwipe = null;
        if (!s || s.blocked || !e.changedTouches || e.changedTouches.length !== 1) return;
        let t = e.changedTouches[0];
        let dx = t.clientX - s.x, dy = t.clientY - s.y;
        if (Math.abs(dx) < SWIPE_MIN_DISTANCE || Math.abs(dy) > Math.abs(dx) * SWIPE_MAX_SLOPE) return;
        swipeLessonPart(dx < 0 ? 1 : -1);
    }, { passive: true });
}

function swipeLessonPart(step) {
    let parts = SWIPE_PARTS.filter(p => {
        let tab = document.querySelector('#lessonTabs button[data-part="' + p + '"]');
        return tab && tab.style.display !== 'none';
    });
    let i = parts.indexOf(currentLessonPart);
    if (i < 0) return;              // список разделов: листать нечего
    let next = parts[i + step];
    if (!next) return;              // с краю ряда жест ничего не делает
    switchLessonPart(next);
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

