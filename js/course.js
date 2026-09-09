// ============================================================
// ВЫБОР КУРСА
// ============================================================
// Реестр курсов — data/courses.js. Здесь только состояние и переключение.
//
// Ключи localStorage разведены по курсам: courseKey('stats') даёт greek_stats
// или hebrew_stats. Отсюда и приятное следствие — прогресс греческого курса
// переносить не пришлось: старые ключи greek_stats и greek_last_lesson это
// ровно то, что схема выдаёт для курса 'greek'. Общее для всего приложения
// получает приставку app_ вместо имени курса.

let currentCourseId = 'greek';

// Хранилище может бросать (приватный режим Safari) — все обращения в try.
function readStore(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
}
function writeStore(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
}

function activeCourse() { return COURSES[currentCourseId] || COURSES.greek; }
function courseLessons() { return activeCourse().lessons || {}; }
function coursePrayer() { return activeCourse().prayer || null; }

// Ключ прогресса текущего курса: 'stats' -> 'greek_stats' / 'hebrew_stats'.
function courseKey(name) { return currentCourseId + '_' + name; }

// Урок без упражнений и теста — только материал (алфавит, правила чтения).
function isIntroLesson(lesson) {
    let list = activeCourse().introLessons || [];
    return list.indexOf(lesson) !== -1;
}

// Есть ли в курсе хоть один урок. Курс без содержания — это не ошибка:
// иврит подключён раньше, чем наполнен, и экраны показывают честную заглушку.
function courseHasLessons() { return lessonNumbers().length > 0; }

// ------------------------------------------------------------ настройки курса

const DEFAULT_COURSE_ASK = 'ask';

// Что делать при запуске: 'ask' — показать стартовый экран, id курса — сразу в него.
function defaultCourseSetting() {
    let saved = readStore('app_default_course');
    if (saved && COURSES[saved]) return saved;
    return DEFAULT_COURSE_ASK;
}

function setDefaultCourse(value) {
    if (value !== DEFAULT_COURSE_ASK && !COURSES[value]) return;
    writeStore('app_default_course', value);
    syncCourseControls();
    showToast(value === DEFAULT_COURSE_ASK
        ? 'При запуске приложение будет спрашивать'
        : 'При запуске откроется ' + COURSES[value].name.toLowerCase(), 'check');
}

// ------------------------------------------------------------ переключение

// Применяет курс: подменяет данные и сбрасывает всё, что кешируется между
// экранами. Забыть здесь новый кеш — значит показать слова одного курса
// в другом, поэтому список сбрасываемого держим полным.
function applyCourse(id) {
    if (!COURSES[id]) return;
    currentCourseId = id;
    writeStore('app_course', id);

    allVocabCache = null;
    vocabTypeFilter = 'all';
    allFlashcardState = { words: [], index: 0, revealed: false, correct: 0, total: 0, type: 'all' };
    flashcardState = { words: [], index: 0, revealed: false, correct: 0, total: 0 };
    testState = { questions: [], index: 0, correct: 0, total: 10, answered: false };
    exerciseState = { type: null, questions: [], index: 0, correct: 0, total: 0 };
    translationState = { type: null, questions: [], index: 0, correct: 0, total: 0, chosen: [] };
    prayerExerciseState = { type: null, questions: [], index: 0, correct: 0, total: 0, chosen: [] };
    currentDrill = null;
    currentLessonPart = 'menu';
    lessonsReturnSection = 'mainMenu';
    currentLesson = firstLessonNumber();

    loadStats();
    applyCourseChrome();
    renderMainMenu();
    syncCourseControls();
}

// Всё, что во внешней рамке зависит от курса: направление письма, заголовок
// вкладки браузера, карточка разбора молитвы на главном экране.
function applyCourseChrome() {
    let course = activeCourse();
    document.documentElement.setAttribute('data-course', course.id);
    document.title = course.name + ' — учебник в кармане';

    let input = document.getElementById('vocabSearchInput');
    if (input) input.setAttribute('placeholder', course.searchPlaceholder || 'Поиск');

    // Карточка «Отче наш» — греческая; у курса без разбора молитвы её нет.
    let card = document.getElementById('prayerFeatureCard');
    if (card) {
        let has = !!(course.prayer && course.prayerCard);
        card.classList.toggle('hidden', !has);
        if (has) {
            let t = document.getElementById('prayerFeatureTitle');
            let b = document.getElementById('prayerFeatureBody');
            if (t) t.textContent = course.prayerCard.title;
            if (b) b.textContent = course.prayerCard.body;
        }
    }
}

// ------------------------------------------------------------ стартовый экран

// Стартовый экран — не .section, а перекрытие поверх приложения: nav bar уже
// держит пять точек, максимум для M3, а пусковой экран и не точка навигации.
// Приложение под ним полностью загружено на текущем курсе, поэтому «выбрать» —
// это просто убрать перекрытие.
function renderStartScreen() {
    let box = document.getElementById('startCourseList');
    if (!box) return;
    let parts = [];
    for (let id of COURSE_ORDER) {
        let c = COURSES[id];
        if (!c) continue;
        let count = Object.keys(c.lessons || {}).length;
        let note = count
            ? count + ' ' + pluralRu(count, 'урок', 'урока', 'уроков')
            : 'Материал готовится';
        parts.push(
            '<button class="course-card" onclick="startCourse(\'' + escArg(id) + '\')">',
                '<span class="course-card__icon"><span class="msym">', escHtml(c.icon), '</span></span>',
                '<span class="course-card__text">',
                    '<span class="course-card__title">', escHtml(c.name), '</span>',
                    '<span class="course-card__tagline">', escHtml(c.tagline), '</span>',
                    '<span class="course-card__blurb">', escHtml(c.blurb), '</span>',
                    '<span class="course-card__note"><span class="msym sm">',
                        (count ? 'menu_book' : 'hourglass_top'), '</span>', escHtml(note), '</span>',
                '</span>',
                '<span class="course-card__chevron msym">chevron_right</span>',
            '</button>');
    }
    box.innerHTML = parts.join('');
}

function showStartScreen() {
    renderStartScreen();
    document.body.classList.add('start-open');
    let el = document.getElementById('startScreen');
    if (el) el.removeAttribute('hidden');
}

function hideStartScreen() {
    document.body.classList.remove('start-open');
    let el = document.getElementById('startScreen');
    if (el) el.setAttribute('hidden', '');
}

function startScreenOpen() {
    return document.body.classList.contains('start-open');
}

// Выбор со стартового экрана: сменить курс, если он другой, и уйти к урокам.
function startCourse(id) {
    if (!COURSES[id]) return;
    if (id !== currentCourseId) applyCourse(id);
    hideStartScreen();
    goToMain();
}

// Кнопка «Сменить курс» в настройках.
function openCoursePicker() {
    showStartScreen();
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
}

// ------------------------------------------------------------ настройки: вид

// Карточка курса в настройках: какой курс открыт и что делать при запуске.
function syncCourseControls() {
    let nameEl = document.getElementById('currentCourseName');
    if (nameEl) nameEl.textContent = activeCourse().name;
    let taglineEl = document.getElementById('currentCourseTagline');
    if (taglineEl) taglineEl.textContent = activeCourse().tagline;

    let group = document.getElementById('defaultCourseSegmented');
    if (group) {
        let value = defaultCourseSetting();
        group.querySelectorAll('[data-default-course]').forEach(b => {
            b.setAttribute('aria-checked',
                b.getAttribute('data-default-course') === value ? 'true' : 'false');
        });
    }
    let hint = document.getElementById('defaultCourseHint');
    if (hint) {
        let value = defaultCourseSetting();
        hint.textContent = value === DEFAULT_COURSE_ASK
            ? 'При запуске приложение предложит выбрать курс.'
            : 'При запуске сразу открывается ' + COURSES[value].name.toLowerCase() + '.';
    }
}

// ------------------------------------------------------------ запуск

// Вызывается из boot.js до loadStats() — тот уже читает ключ текущего курса.
function initCourse() {
    let setting = defaultCourseSetting();
    if (setting !== DEFAULT_COURSE_ASK) {
        currentCourseId = setting;
    } else {
        // Спрашиваем — но под перекрытием держим тот курс, что был открыт
        // в прошлый раз, чтобы «выбрать тот же» ничего не перестраивало.
        let last = readStore('app_course');
        currentCourseId = (last && COURSES[last]) ? last : COURSE_ORDER[0];
    }
    writeStore('app_course', currentCourseId);
    applyCourseChrome();
}

// Показать стартовый экран, если настройка велит спрашивать. Отдельно от
// initCourse: разметку трогаем после того, как всё остальное отрисовано.
function initStartScreen() {
    if (defaultCourseSetting() === DEFAULT_COURSE_ASK) showStartScreen();
    else hideStartScreen();
}
