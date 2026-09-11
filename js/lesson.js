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
        // Алфавит спрашивают только уроки 1–2 — в остальных этих ключей нет,
        // а группа без доступных упражнений не показывается вовсе
        // (renderLessonDrills). Поэтому греческий урок 1 и еврейская глава 1
        // начинают список с него, а урок 5 его просто не увидит.
        label: 'Алфавит и чтение',
        drills: [
            { kind: 'exercise', key: 'letter_name', label: 'Название буквы', icon: 'label' },
            { kind: 'exercise', key: 'letter_from_name', label: 'Буква по названию', icon: 'swap_horiz' },
            { kind: 'exercise', key: 'letter_sound', label: 'Произношение буквы', icon: 'record_voice_over' },
            { kind: 'exercise', key: 'letter_order', label: 'Порядок букв', icon: 'arrow_forward' },
            // Стрелка — как в «Фразы: {lang} → русский»: слева то, что показано,
            // справа то, что выбирают. letter_case_lower показывает прописную.
            { kind: 'exercise', key: 'letter_case_lower', label: 'Прописная → строчная', icon: 'text_fields' },
            { kind: 'exercise', key: 'letter_case_upper', label: 'Строчная → прописная', icon: 'abc' },
            { kind: 'exercise', key: 'diphthong_sound', label: 'Дифтонги', icon: 'hearing' },
            { kind: 'exercise', key: 'breathing_type', label: 'Придыхание', icon: 'compare' },
            { kind: 'exercise', key: 'accent_type', label: 'Знаки ударения', icon: 'target' },
            { kind: 'exercise', key: 'heb_letter_translit', label: 'Транслитерация', icon: 'translate' },
            { kind: 'exercise', key: 'heb_letter_final', label: 'Конечные формы', icon: 'segment' },
            // rule, как у heb_gutturals: warning в пункте списка читается как
            // сообщение об ошибке, а не как тема упражнения.
            { kind: 'exercise', key: 'heb_letter_guttural', label: 'Гортанные', icon: 'rule' }
        ]
    },
    {
        // Огласовка — это весь еврейский курс до четвёртой главы, и у греческого
        // ничего подобного нет. Группа, в которой нет ни одного доступного
        // упражнения, не показывается вовсе (renderLessonDrills), поэтому
        // греческий урок этого раздела не увидит.
        label: 'Огласовка и чтение',
        drills: [
            { kind: 'exercise', key: 'heb_vowel_name', label: 'Названия огласовок', icon: 'label' },
            { kind: 'exercise', key: 'heb_vowel_sound', label: 'Звук огласовки', icon: 'contrast' },
            { kind: 'exercise', key: 'heb_vowel_fill', label: 'Пропущенная огласовка', icon: 'text_fields' },
            { kind: 'exercise', key: 'heb_shva', label: 'Шва: немое или произносимое', icon: 'hearing' },
            { kind: 'exercise', key: 'heb_dagesh', label: 'Дагеш: слабый или сильный', icon: 'scatter_plot' },
            { kind: 'exercise', key: 'heb_qamets', label: 'Камец и камец хатуф', icon: 'compare' },
            { kind: 'exercise', key: 'heb_begadkefat', label: 'Бегадкефат', icon: 'record_voice_over' },
            { kind: 'exercise', key: 'heb_syllables', label: 'Слогораздел', icon: 'segment' }
        ]
    },
    {
        label: 'Формы и грамматика',
        drills: [
            { kind: 'exercise', key: 'case_number', label: 'Падеж и число', icon: 'target' },
            { kind: 'exercise', key: 'agreement', label: 'Согласование', icon: 'link' },
            { kind: 'exercise', key: 'attribute_vs_predicate', label: 'Атрибут / предикатив', icon: 'balance' },
            { kind: 'exercise', key: 'substantivation', label: 'Субстантивация', icon: 'push_pin' },
            { kind: 'exercise', key: 'article_fill', label: 'Артикль', icon: 'abc' },
            { kind: 'exercise', key: 'heb_gender_number', label: 'Род и число', icon: 'category' },
            { kind: 'exercise', key: 'heb_gutturals', label: 'Артикль и гортанные', icon: 'rule' },
            { kind: 'exercise', key: 'heb_construct', label: 'Сопряжённое сочетание', icon: 'add_link' },
            { kind: 'exercise', key: 'heb_suffix_type', label: 'Местоименные суффиксы', icon: 'person_pin' }
        ]
    },
    {
        // Короткие словосочетания из упражнений урока и целые предложения из
        // учебника — разные задания, поэтому в подписях они разведены явно.
        label: 'Перевод',
        drills: [
            { kind: 'exercise', key: 'translate_greek_to_russian', label: 'Фразы: {lang} → русский', icon: 'translate' },
            { kind: 'exercise', key: 'translate_russian_to_greek', label: 'Фразы: русский → {lang}', icon: 'g_translate' },
            { kind: 'translation', key: 'el_to_ru', label: 'Предложения: {lang} → русский', icon: 'translate' },
            { kind: 'translation', key: 'ru_to_el', label: 'Предложения: русский → {lang}', icon: 'g_translate' }
        ]
    },
    {
        label: 'Слова',
        drills: [
            { kind: 'flashcards', key: 'flashcards', label: 'Карточки', icon: 'style' }
        ]
    }
];

// Каталог общий для курсов, поэтому язык в подписи стоит местом, а не словом:
// {lang} раскрывается при отрисовке. Читать drill.label напрямую нельзя —
// в списке или в заголовке окажется «{lang}».
function drillLabel(drill) {
    return String(drill.label).replace('{lang}', courseLang());
}

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

// Разделы урока списком. У вводного урока (алфавит, правила чтения) тренировать
// нечего, остаётся один пункт. Параметр называется intro, а не isIntroLesson:
// последнее — глобальная функция курса, и одноимённый параметр её бы закрыл.
function renderLessonMenu(data, intro) {
    let box = document.getElementById('lessonPartMenu');
    if (!box) return;
    let items = [];

    let words = (data.vocabulary && data.vocabulary.length) || 0;
    items.push(menuItemHtml('school', 'Материал',
        words ? 'Грамматика и ' + words + ' ' + pluralRu(words, 'слово', 'слова', 'слов') : 'Грамматика урока',
        "switchLessonPart('material')"));

    if (!intro) {
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
            parts.push(menuItemHtml(d.icon, drillLabel(d), null,
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
    if (title) title.textContent = drillLabel(drill);

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

// ============================================================
// РАЗМЕТКА ГРАММАТИКИ
// ============================================================
// Грамматика лежит в data/lessons.js одним потоком, где абзацы разделены
// парами <br>, заголовки — это <b> в начале строки, а списки — то строки с «•»,
// то честный <ul>. Отступы такой разметки задаёт количество <br> подряд, поэтому
// ритм гуляет, перенос строки списка уезжает под маркер, а <ul> без <br> вокруг
// склеивает абзац до себя, себя и абзац после в одно месиво без отступов.
// Разбираем поток на настоящие блоки при отрисовке: содержимое остаётся
// нетронутым, а вертикальные отступы начинает задавать CSS.
// Содержимое data/lessons.js при этом не трогаем.
// Готовые блочные элементы разметки: таблицы и списки, набранные тегами, а не
// строками с «•». Их нельзя резать по <br> и нельзя оставлять внутри абзаца —
// вынимаем целиком и ставим на место как самостоятельные элементы. Вложенных
// списков и таблиц в учебнике нет; появятся — этот разбор их не поймёт.
const GRAMMAR_LIFT_RE = /<(table|ul|ol)\b[\s\S]*?<\/\1>/gi;
const GRAMMAR_BLOCK_RE = /(?:<br\s*\/?>\s*){2,}/i;
// Заголовок — строка, которая целиком состоит из одного <b>…</b>: и «3. Личные
// местоимения», и подзаголовок «Единственное число:» перед таблицей. Внутри
// содержимого не должно быть </b>, иначе «<b>раз</b> и <b>два</b>» тоже сошло
// бы за заголовок. Жирное начало с продолжением в той же строке
// («<b>Примечание:</b> в косвенных падежах…») остаётся обычным абзацем.
const GRAMMAR_HEAD_RE = /^<b>((?:(?!<\/b>)[\s\S])*)<\/b>$/i;
// U+0001 в учебном тексте не встречается — им и метим место вынутого элемента
const LIFT_MARK = '\u0001';

// Вынутый элемент возвращается на место самостоятельным блоком: таблица — в
// полосе горизонтальной прокрутки, список — с тем же классом, что и список,
// собранный из строк с «•». Без класса он достался бы глобальному сбросу
// `* { margin: 0; padding: 0 }` и остался бы вовсе без отступов и маркеров.
function grammarLiftedHtml(html) {
    if (/^<table/i.test(html)) {
        // dir с таблицы дублируем на полосу прокрутки. Полоса — отдельный
        // элемент, и «начало» она считает по своему направлению: у таблицы
        // справа налево первая колонка правая, а полоса с ltr открывала бы
        // такую таблицу с последней. Направление здесь задают данные урока,
        // а не курс: таблица в материале бывает и русской.
        let dir = /^<table[^>]*\bdir=["']?(rtl|ltr)/i.exec(html);
        return '<div class="md-table-scroll"' +
            (dir ? ' dir="' + dir[1].toLowerCase() + '"' : '') + '>' + html + '</div>';
    }
    if (/^<(ul|ol)\b[^>]*\bclass=/i.test(html)) return html;
    return html.replace(/^<(ul|ol)\b/i, '<$1 class="grammar-list"');
}

function renderGrammarHtml(html) {
    if (!html) return '';
    // Таблицы и списки прячем первыми: внутри них <br> и «•» ничего не разделяют.
    let lifted = [];
    let text = String(html).replace(GRAMMAR_LIFT_RE, m => LIFT_MARK + (lifted.push(m) - 1) + LIFT_MARK);

    let out = [];
    text.split(GRAMMAR_BLOCK_RE).forEach(block => {
        block = block.trim();
        if (!block) return;
        // Вынутый элемент внутри блока — сам себе блок, а не строка абзаца:
        // текст до него и текст после становятся отдельными абзацами.
        block.split(new RegExp(LIFT_MARK + '(\\d+)' + LIFT_MARK)).forEach((piece, i) => {
            if (i % 2) { out.push(grammarLiftedHtml(lifted[+piece])); return; }
            // <br> по краям куска только и делали, что рисовали отступ — он теперь на CSS
            let chunk = piece.replace(/^(?:\s*<br\s*\/?>)+/i, '').replace(/(?:<br\s*\/?>\s*)+$/i, '').trim();
            if (chunk) out.push(grammarBlockHtml(chunk));
        });
    });
    return out.join('');
}

function grammarBlockHtml(chunk) {
    let out = '';
    let para = [], list = [];
    let flushPara = () => { if (para.length) { out += '<div class="grammar-p">' + para.join('<br>') + '</div>'; para = []; } };
    let flushList = () => {
        if (!list.length) return;
        out += '<ul class="grammar-list">' + list.map(i => '<li>' + i + '</li>').join('') + '</ul>';
        list = [];
    };

    chunk.split(/<br\s*\/?>/i).forEach(line => {
        line = line.trim();
        if (!line) return;
        let head = line.match(GRAMMAR_HEAD_RE);
        if (head) {
            // Заголовку нужен воздух сверху, которого у строки абзаца быть не может
            flushList(); flushPara();
            out += '<h4 class="grammar-h">' + head[1] + '</h4>';
        } else if (/^•/.test(line)) {
            flushPara();
            list.push(line.replace(/^•\s*/, ''));
        } else {
            flushList();
            para.push(line);
        }
    });
    flushList();
    flushPara();
    return out;
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
    try { localStorage.setItem(courseKey('last_lesson'), String(lesson)); } catch (e) {}
    document.getElementById('lessonTitle').textContent = data.title;
    currentLessonPart = 'menu';
    showSection('lessonSection');
    updateNavButtons(lesson);

    // Вводные уроки (алфавит, правила чтения) тренировать нечем — остаётся
    // одна вкладка с материалом. Какие именно, знает курс: у греческого это
    // уроки 1–2, у еврейского — главы 1–2.
    let intro = isIntroLesson(lesson);
    document.querySelectorAll('#lessonTabs button').forEach(btn => {
        let part = btn.getAttribute('data-part');
        btn.style.display = (intro && part !== 'material') ? 'none' : '';
    });

    document.getElementById('grammarContent').innerHTML = renderGrammarHtml(data.grammar);

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
            // Строка, которая раскрывает парадигму, — кнопка и для клавиатуры:
            // role и tabindex, как у строки общего словаря (js/vocab.js). Enter и
            // пробел доводит до клика слушатель в boot.js (KEY_ACTIVATED).
            let rowAttrs = '';
            if (item.declension_forms) {
                detailsHtml = '<div class="word-details"><div class="md-table-scroll">' + generateDeclensionTable(item.declension_forms, item.caseTranslations || null) + '</div></div>';
                rowAttrs = ' role="button" tabindex="0" aria-expanded="false"';
            }
            div.innerHTML = '<div class="word-row"' + rowAttrs + '><strong>' + article + item.greek + '</strong><span>' + item.translation + '</span></div>' + detailsHtml;
            container.appendChild(div);
        });
    }

    // Разделы урока и список упражнений внутри вкладки «Упражнения»
    renderLessonMenu(data, intro);
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
    if (typeof bar.scrollTo === 'function') bar.scrollTo({ left: left, behavior: scrollBehavior() });
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
// На сенсорном экране горизонтальный жест переключает вкладки урока. Ряд —
// это сами вкладки в порядке разметки, «Тест» в том числе: свайп нажимает ту
// вкладку, к которой пришёл, и делает ровно то же, что палец по ней.
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

// Вкладки, доступные жесту: у вводных уроков «Упражнения» и «Тест» скрыты
// (openLesson прячет их через style.display), листать по ним нечего.
function lessonSwipeTabs() {
    let tabs = [];
    document.querySelectorAll('#lessonTabs button[data-part]').forEach(tab => {
        if (tab.style.display !== 'none') tabs.push(tab);
    });
    return tabs;
}

function swipeLessonPart(step) {
    let tabs = lessonSwipeTabs();
    let i = -1;
    tabs.forEach((tab, n) => { if (tab.getAttribute('data-part') === currentLessonPart) i = n; });
    if (i < 0) return;              // список разделов: листать нечего
    let next = tabs[i + step];
    if (!next) return;              // с краю ряда жест ничего не делает
    // Нажимаем саму вкладку, а не зовём switchLessonPart: у «Теста» на вкладке
    // висит startTest(), и свайп обязан делать то же, что нажатие.
    next.click();
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
    if (prev < firstLessonNumber()) {
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
    let last = lastLessonNumber();
    if (next > last) {
        showToast('Это последний урок (урок ' + last + ').');
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
    
    if (prevBtn) prevBtn.disabled = (lesson <= firstLessonNumber());
    if (nextBtn) nextBtn.disabled = (lesson >= lastLessonNumber());
}

