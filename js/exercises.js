// ============================================================
// УПРАЖНЕНИЯ (основные функции)
// ============================================================
function startExercise(type) {
    let questions = getExercises(currentLesson, type);
    if (!questions || questions.length === 0) {
        document.getElementById('exerciseQuestion').innerHTML = '<p>Нет вопросов.</p>';
        return;
    }
    exerciseState = { type: type, questions: shuffle(questions), index: 0, correct: 0, total: questions.length };
    showExercise();
}

function getCaseName(caseKey) {
    let map = {
        // Падежи для существительных
        'gen_sg': 'Genitivus sg.',
        'dat_sg': 'Dativus sg.',
        'acc_sg': 'Accusativus sg.',
        'nom_pl': 'Nominativus pl.',
        'gen_pl': 'Genitivus pl.',
        'dat_pl': 'Dativus pl.',
        'acc_pl': 'Accusativus pl.',
        'voc_sg': 'Vocativus sg.',
        'nom_pl_m': 'Nominativus pl. m.',
        'gen_sg_m': 'Genitivus sg. m.',
        'dat_sg_f': 'Dativus sg. f.',
        'acc_sg_n': 'Accusativus sg. n.',
        // Для глаголов (личные формы)
        '1sg': '1 sg.',
        '2sg': '2 sg.',
        '3sg': '3 sg.',
        '1pl': '1 pl.',
        '2pl': '2 pl.',
        '3pl': '3 pl.'
    };
    return map[caseKey] || caseKey;
}

// ============================================================
// ВИДЫ УПРАЖНЕНИЙ
// ============================================================
// Почти любое упражнение — это вопрос и ряд вариантов, один из которых верный.
// Виды различаются тремя вещами: текстом вопроса, тем, откуда берутся варианты,
// и тем, на каком языке эти варианты набраны. Поэтому вид описан данными, а не
// веткой в showExercise: по одному и тому же списку рисуется и экран
// упражнения, и вопрос теста. Пока это были две ветки, один и тот же вид жил в
// двух местах и в двух формулировках; с еврейским курсом видов стало вдвое
// больше, и цена такого удвоения перестала быть терпимой.
//
// Поля:
//   prompt(q)   — текст вопроса; вставка на изучаемом языке — через sc()
//   subject(q)  — то, о чём спрашивают, отдельной строкой под вопросом
//   options     — массив (набор постоянный) или функция от вопроса;
//                 если поля нет — [правильный, ...q.distractors]
//   correct(q)  — правильный ответ; если поля нет — q.correct
//   script      — варианты набраны на изучаемом языке (шрифт и направление).
//                 Функция от вопроса — там, где это решает сам вопрос, а не
//                 вид: вопрос о названии буквы один и тот же в обоих курсах,
//                 а язык названия в них разный
//   custom      — вид рисует не choiceQuestionHtml, а сам вызывающий
//
// Ключ вида, общего для курсов, языка не называет (translate_*, agreement,
// article_fill). Виды, которых за пределами еврейского курса не бывает,
// начинаются с heb_. Это соглашение об именах: префикс код не разбирает.
const EXERCISE_TYPES = {
    // --- алфавит и чтение: уроки 1–2 в обоих курсах ---
    // Здесь спрашивают не о слове, а о букве. Вопросы берутся из пула букв
    // курса — courseAlphabet(): буква одна, а вопросов о ней несколько, и
    // переписывать алфавит в каждый вид значило бы держать четыре копии,
    // которые со временем разойдутся.
    //
    // Неверные варианты собирает otherValues() из того же пула: соседние буквы
    // алфавита похожи и начертанием, и звучанием, и отвлекать должны похожие.
    // Сам верный ответ она не возвращает — только похожие значения, — поэтому
    // каждый вид ставит его первым сам: варианты обязан содержать правильный
    // ответ, иначе вопрос без верной кнопки.
    // Повторов среди вариантов быть не может — ответ сравнивается с текстом
    // кнопки, и две одинаковые кнопки дадут два верных ответа (в греческом
    // [эв] — это и ευ, и ηυ; в еврейском «х» — и хе, и хет).
    letter_name: {
        prompt: () => 'Как называется эта буква?',
        subject: q => q.letter,
        correct: q => q.name,
        options: q => [q.name].concat(
            otherValues(courseAlphabet().letters.map(l => l.name), q.name, 3)),
        // Названия букв бывают на изучаемом языке (ἄλφα), а бывают русскими
        // (а́леф, «син / шин») — шрифт выбирается по самой строке.
        script: q => isScriptText(q.name)
    },
    letter_from_name: {
        prompt: () => 'Какая буква так называется?',
        subject: q => q.name,
        correct: q => q.letter,
        options: q => [q.letter].concat(
            otherValues(courseAlphabet().letters.map(l => l.letter), q.letter, 3)),
        script: true
    },
    letter_sound: {
        prompt: () => 'Как произносится эта буква?',
        subject: q => q.letter,
        correct: q => q.sound,
        options: q => [q.sound].concat(
            otherValues(courseAlphabet().letters.map(l => l.sound), q.sound, 3))
    },
    // Порядок букв. Варианты — сами буквы, а не их названия: вопрос о том, что
    // стоит следом за буквой. Последняя буква алфавита в вопросы не входит —
    // ответа у неё нет, и в данных стоит .slice(0, -1).
    letter_order: {
        prompt: () => 'Какая буква идёт следом?',
        subject: q => q.letter,
        correct: q => alphabetSuccessor(q.letter),
        options: q => {
            const next = alphabetSuccessor(q.letter);
            return [next].concat(otherValues(courseAlphabet().letters.map(l => l.letter),
                [q.letter, next], 3));
        },
        script: true
    },
    // Регистр есть только в греческом: в иврите прописных нет, и поля upper
    // в данных курса тоже нет — вида в главе просто не окажется.
    letter_case_lower: {
        prompt: () => 'Какая строчная буква соответствует прописной?',
        subject: q => q.upper,
        correct: q => q.letter,
        options: q => [q.letter].concat(
            otherValues(courseAlphabet().letters.map(l => l.letter), q.letter, 3)),
        script: true
    },
    letter_case_upper: {
        prompt: () => 'Какая прописная буква соответствует строчной?',
        subject: q => q.letter,
        correct: q => q.upper,
        options: q => [q.upper].concat(
            otherValues(courseAlphabet().letters.map(l => l.upper), q.upper, 3)),
        script: true
    },
    diphthong_sound: {
        prompt: () => 'Как произносится этот дифтонг?',
        subject: q => q.diphthong,
        correct: q => q.sound,
        options: q => [q.sound].concat(
            otherValues(courseAlphabet().diphthongs.map(d => d.sound), q.sound, 3))
    },
    // Придыхание и ударение — вопрос о знаке, а не о букве или слове. Набор
    // вариантов постоянный и лежит здесь, чтобы автор не повторял его в каждом
    // вопросе; правильный ответ приходит из данных (q.correct), и тест следит,
    // чтобы он совпадал с одним из этих трёх-двух.
    breathing_type: {
        prompt: () => 'Какое придыхание при этой гласной?',
        subject: q => q.sign,
        options: ['Густое (с [х])', 'Тонкое (не произносится)']
    },
    accent_type: {
        prompt: () => 'Какое ударение на этой гласной?',
        subject: q => q.sign,
        options: ['Острое', 'Тупое', 'Облеченное']
    },
    // --- буквы еврейского алфавита: глава 1 ---
    // Транслитерация — не текст изучаемого языка, а латиница: варианты не
    // разворачиваются, а подпись под вопросом — сама буква, и та на иврите.
    heb_letter_translit: {
        prompt: () => 'Как транслитерируется эта буква?',
        subject: q => q.letter,
        correct: q => q.translit,
        options: q => [q.translit].concat(
            otherValues(courseAlphabet().letters.map(l => l.translit), q.translit, 3))
    },
    // Пять конечных букв (ך ם ן ף ץ) похожи одна на другую сильнее, чем на
    // свои обычные формы, поэтому в вариантах все пять, а не выборка: подсказкой
    // служит только начертание.
    heb_letter_final: {
        prompt: () => 'Выберите конечную форму буквы',
        subject: q => q.letter,
        correct: q => q.final,
        options: q => [q.final].concat(
            otherValues(courseAlphabet().finals.map(f => f.final), q.final, 4)),
        script: true
    },
    // Гортанных в пособии четыре — א, ע, ה, ח. Буква ר «тоже часто ведёт себя
    // как гортанный», но гортанной не названа, и в вопросы она не попала:
    // верных ответов было бы два.
    heb_letter_guttural: {
        prompt: () => 'Эта буква гортанная?',
        subject: q => q.letter,
        options: ['Гортанная', 'Не гортанная']
    },

    // --- греческий именной строй ---
    declension_fill: {
        prompt: q => 'Вставьте форму для <b>' + getCaseName(q.case) + '</b> для слова ' +
            sc(q.word ? q.word + ' (' + q.translation + ')' : ''),
        script: true
    },
    case_number: {
        prompt: q => 'Определите падеж и число для формы: ' + sc(q.form)
    },
    agreement: {
        prompt: q => 'Вставьте прилагательное ' + sc(q.adjective) + ' в правильной форме:<br>' +
            sc(q.article + ' ____ ' + q.noun),
        script: true
    },
    attribute_vs_predicate: {
        prompt: q => 'Определите, атрибутив или предикатив:<br>' + sc(q.phrase)
    },
    substantivation: {
        prompt: q => 'Что означает:<br>' + sc(q.phrase)
    },
    // Артикль есть и там, и там: в греческом выбирают одну из форм ὁ/ἡ/τό, в
    // еврейском — огласовку ה перед первым согласным слова. Вопрос один и тот
    // же, поэтому вид общий и ключ без префикса. Пропуск стоит перед словом: в
    // тексте справа налево он окажется справа, где приставке и место.
    article_fill: {
        prompt: q => 'Вставьте правильную форму артикля:<br>' + sc('____ ' + q.noun),
        correct: q => q.correct_article,
        script: true
    },

    // --- огласовка и чтение: главы 2–3 еврейского курса ---
    // Знак огласовки сам по себе — комбинирующий символ, он не отображается без
    // согласного. Поэтому в данных он лежит вместе с носителем, как в пособии
    // (בַּ), а не голым.
    heb_vowel_name: {
        prompt: () => 'Как называется этот знак?',
        subject: q => q.sign
    },
    // Тот же знак, другой вопрос: не как знак называется, а какой звук он
    // обозначает. Вариантов ровно пять — по числу гласных, набор постоянный,
    // а ответ берётся у самого знака: в пуле курса он и лежит полем sound.
    heb_vowel_sound: {
        prompt: () => 'Какой звук обозначает этот знак?',
        subject: q => q.sign,
        correct: q => q.sound,
        options: ['[а]', '[э]', '[и]', '[о]', '[у]']
    },
    heb_vowel_fill: {
        prompt: q => 'Какого знака огласовки не хватает?' +
            (q.translation ? ' («' + q.translation + '»)' : ''),
        subject: q => q.word,
        script: true
    },
    heb_shva: {
        prompt: q => 'Как читается шва' + (q.letter ? ' под буквой ' + sc(q.letter) : '') + '?',
        subject: q => q.word,
        options: ['«Немое» шва', '«Произносимое» шва']
    },
    heb_dagesh: {
        prompt: q => 'Какой дагеш стоит в букве ' + sc(q.letter) + '?',
        subject: q => q.word,
        options: ['«Слабый» дагеш', '«Сильный» дагеш']
    },
    // Камец и камец хатуф выглядят одинаково, различает их только слог, —
    // поэтому в вопросе слово целиком, а не одна буква.
    heb_qamets: {
        prompt: q => 'Камец или камец хатуф' + (q.letter ? ' под буквой ' + sc(q.letter) : '') + '?',
        subject: q => q.word,
        options: ['Камец — долгий ā', 'Камец хатуф — краткий o']
    },
    // Род и число — тот же вопрос, что греческий case_number, но падежей в
    // иврите нет, а подпись того вида их называет. Отдельный вид, а не общий:
    // «Падеж и число» над еврейской главой было бы просто неверно.
    heb_gender_number: {
        prompt: () => 'Определите род и число',
        subject: q => q.word,
        options: ['Муж. р., ед. ч.', 'Муж. р., мн. ч.',
                  'Жен. р., ед. ч.', 'Жен. р., мн. ч.', 'Двойственное число']
    },
    heb_begadkefat: {
        prompt: q => 'Как произносится буква ' + sc(q.letter) + '?',
        subject: q => q.word
    },
    // Границу слога пособие метит вертикальной чертой (דְּ|בָ|רִים) — её же
    // ждём и в ответе, чтобы данные писались прямо из книги.
    heb_syllables: {
        prompt: () => 'Разделите слово на слоги',
        subject: q => q.word,
        script: true
    },

    // --- формы: главы 5, 9, 10 еврейского курса ---
    // Гортанные и ר не удваиваются, и вместо удвоения происходит одно из трёх.
    // Четвёртый вариант — обычное удвоение: без него выбирать было бы не из чего.
    heb_gutturals: {
        prompt: () => 'Что произошло с артиклем?',
        subject: q => q.phrase,
        options: ['Обычное удвоение', 'Заместительное удлинение',
                  'Скрытое удвоение гортанного', 'Неправильный сегол']
    },
    // Перевод в вопросе не показываем: «этот голос этого человека» — это и есть
    // ответ. То же и у суффиксов: «его кони» выдало бы множественное число.
    heb_construct: {
        prompt: () => 'Сочетание определённое или неопределённое?',
        subject: q => q.phrase,
        options: ['Определённое', 'Неопределённое']
    },
    heb_suffix_type: {
        prompt: () => 'Суффикс какого типа?',
        subject: q => q.word,
        options: ['Тип 1 — существительное ед. ч.', 'Тип 2 — существительное мн. ч.']
    },

    // Не «выбор варианта»: у этих двух свой виджет — поле ввода и банк слов.
    // Разметка у упражнения урока и у теста разная (свои id и свои обработчики),
    // общего кода не выходит, и рисуют их showExercise и showTest. Объявлены
    // здесь, чтобы список видов оставался полным.
    translate_greek_to_russian: { custom: true },
    translate_russian_to_greek: { custom: true }
};

function exerciseCorrect(type, q) {
    return type.correct ? type.correct(q) : q.correct;
}

function exerciseOptions(type, q) {
    if (Array.isArray(type.options)) return type.options;
    if (typeof type.options === 'function') return type.options(q);
    return [exerciseCorrect(type, q)].concat(q.distractors || []);
}

// Неверные варианты из пула значений: буквы, звуки, транслитерация. Берём не
// «что попало», а с равным шагом по пулу — тогда в вариантах оказываются в том
// числе соседние по алфавиту буквы, а их-то и путают. Шаг считается от ответа:
// отступив от него, мы не подсовываем в один вопрос две почти одинаковые
// подсказки подряд.
//
// Значения пула повторяются (в греческом [эв] — это и ευ, и ηυ), а два
// одинаковых варианта — это два верных ответа: ответ сравнивается с текстом
// кнопки. Поэтому пул сначала схлопывается, а исключённое (правильный ответ и
// то, о чём уже спросили в самом вопросе) не возвращается. Если значений в пуле
// меньше, чем просили, вернётся сколько есть — вопроса без вариантов не будет,
// пока в пуле есть хоть что-то.
function otherValues(values, exclude, n) {
    exclude = [].concat(exclude);
    let uniq = [];
    for (let v of values) if (!uniq.includes(v)) uniq.push(v);
    if (!uniq.length) return [];
    let start = 0;
    for (let e of exclude) {
        let i = uniq.indexOf(e);
        if (i >= start) start = i + 1;
    }
    let out = [];
    let step = Math.max(1, Math.round(uniq.length / (n + 1)));
    for (let k = 0; k < uniq.length && out.length < n; k++) {
        let v = uniq[(start + k * step) % uniq.length];
        if (exclude.includes(v) || out.includes(v)) continue;
        out.push(v);
    }
    // Шаг мог перескочить через исключённые значения и не добрать вариантов.
    for (let v of uniq) {
        if (out.length >= n) break;
        if (!exclude.includes(v) && !out.includes(v)) out.push(v);
    }
    return out;
}

// Следующая буква алфавита — ответ вида letter_order. Буквы лежат в данных
// в алфавитном порядке. У последней буквы следующей нет, поэтому в вопросы она
// не попадает (в данных стоит .slice(0, -1)); пустая строка здесь — не ответ,
// а признак того, что вопроса быть не должно.
function alphabetSuccessor(letter) {
    let letters = (courseAlphabet().letters || []).map(l => l.letter);
    let i = letters.indexOf(letter);
    return i >= 0 && i + 1 < letters.length ? letters[i + 1] : '';
}

// Разметка вопроса с выбором варианта. Обработчик передаётся именем: у
// упражнения урока и у теста они разные (answerOpt и testAnswer), но принимают
// одно и то же — выбранный ответ и правильный.
function choiceQuestionHtml(key, q, handler) {
    let type = EXERCISE_TYPES[key];
    if (!type || !type.prompt) return '<p>Тип упражнения не поддерживается.</p>';
    let corr = exerciseCorrect(type, q);
    let html = '<div class="question">' + type.prompt(q) + '</div>';
    // Строки с разбираемым словом может не быть: у бегадкефат главы 1 слово не
    // приводится, спрашивают о букве, и поля word в этих вопросах нет.
    if (type.subject) {
        let sub = type.subject(q);
        // Шрифт строки — по самой строке: под вопросом о букве стоит то её
        // начертание (ἄλφα, בּ), то русское название (а́леф). Серифный шрифт со
        // скриптом курса русскому тексту противопоказан, и наоборот.
        if (sub) html += '<div class="' + (isScriptText(sub) ? 'md-prompt-strong' : 'md-prompt-ru') + '">' + sub + '</div>';
    }
    // Варианты на изучаемом языке — не свойство вида, а свойство вопроса:
    // «как называется буква» в греческом курсе имеет греческие варианты,
    // в еврейском — русские.
    let script = typeof type.script === 'function' ? type.script(q) : type.script;
    html += '<div class="options' + (script ? ' options--script' : '') + '">';
    for (let o of shuffle(exerciseOptions(type, q))) {
        html += '<button class="option-btn" onclick="' + handler + '(\'' + escArg(o) + '\',\'' +
            escArg(corr) + '\')">' + o + '</button>';
    }
    return html + '</div>';
}

// Чем вопрос назван в разборе ошибок. Поле, в котором лежит разбираемое
// значение, у каждого вида своё, поэтому спрашиваем сам вид: у letter_case_upper
// разбирают строчную букву, а первый подходящий по имени ключ показал бы в
// разборе ошибок не то, о чём спрашивали. Виды без subject (перевод) по-прежнему
// отдают слово, фразу или форму; q.letter добавлен для вопросов об алфавите.
function questionSubject(q, key) {
    let type = EXERCISE_TYPES[key];
    if (type && type.subject) {
        let sub = type.subject(q);
        if (sub) return sub;
    }
    return q.word || q.phrase || q.form || q.sign || q.greek || q.letter || 'вопрос';
}

function showExercise() {
    let s = exerciseState;
    if (s.index >= s.total) {
        document.getElementById('exerciseQuestion').innerHTML =
            resultBlock(s.correct, s.total, 'Упражнение завершено') +
            '<div class="md-button-row">' +
            '<button class="menu-btn primary" onclick="startExercise(\'' + s.type + '\')"><span class="msym">restart_alt</span>Ещё раз</button>' +
            '<button class="menu-btn outlined" onclick="closeLessonDrill()"><span class="msym">arrow_back</span>К упражнениям</button></div>';
        return;
    }
    let q = s.questions[s.index];
    let container = document.getElementById('exerciseQuestion');
    let html = progressHead('Упражнение ' + (s.index + 1) + ' из ' + s.total, s.index, s.total);

    if (s.type === 'translate_greek_to_russian') {
        let idx = s.index;
        html += '<div class="question">Переведите на русский</div><div class="md-prompt-strong">' + q.greek + '</div><div class="input-group"><input type="text" id="transInput" placeholder="Перевод" autocomplete="off" onkeydown="if(event.key===\'Enter\'){checkExerciseTranslation(' + idx + ');}"><button type="button" onclick="checkExerciseTranslation(' + idx + ')"><span class="msym">check</span>Проверить</button></div>';
    } else if (s.type === 'translate_russian_to_greek') {
        let words = shuffle(q.all_words);
        html += '<div class="question">Переведите на ' + courseLang() + '</div><div class="md-prompt-ru">' + q.russian + '</div><div class="build-area build-area--script" id="buildArea"></div><div class="word-bank word-bank--script" id="wordBank">';
        for (let w of words) html += '<span class="chip" onclick="pickWord(\'' + escArg(w) + '\')">' + w + '</span>';
        html += '</div><div class="md-button-row"><button class="menu-btn primary" onclick="checkTranslationRu()"><span class="msym">check</span>Готово</button><button class="menu-btn text" onclick="clearChosen()"><span class="msym">undo</span>Очистить</button></div>';
        window._trans_ru = q;
        window._chosen = [];
    } else {
        html += choiceQuestionHtml(s.type, q, 'answerOpt');
    }
    container.innerHTML = html;
}

function answerOpt(sel, corr) {
    let container = document.getElementById('exerciseQuestion');
    let btns = container.querySelectorAll('.option-btn');
    let ok = sel === corr;
    btns.forEach(b => { b.disabled = true; if (b.textContent === corr) b.classList.add('correct'); if (b.textContent === sel && !ok) b.classList.add('wrong'); });
    if (ok) { stats.totalCorrect++; exerciseState.correct++; } else {
        stats.totalWrong++;
        let lesson = currentLesson;
        let q = exerciseState.questions[exerciseState.index];
        recordError(lesson, { word: questionSubject(q, exerciseState.type), correct: corr, your: sel });
    }
    saveStats();
    exerciseState.index++;
    scheduleAdvance(showExercise, 1200);
}

// Одно и то же слово может стоять в банке дважды, поэтому берём первую ещё
// не выбранную фишку. Если такой нет — по фишке уже кликали, и повторный клик
// не должен класть слово в ответ второй раз: .picked гасит её только визуально.
function pickFreeChip(bankId, w) {
    let bank = document.getElementById(bankId);
    if (!bank) return null;
    let chips = bank.querySelectorAll('.chip');
    for (let i = 0; i < chips.length; i++) {
        if (chips[i].textContent === w && !chips[i].classList.contains('picked')) return chips[i];
    }
    return null;
}

function pickWord(w) {
    let chip = pickFreeChip('wordBank', w);
    if (!chip) return;
    chip.classList.add('picked');
    window._chosen.push(w);
    let area = document.getElementById('buildArea');
    let t = document.createElement('span');
    t.className = 'token';
    t.textContent = w;
    area.appendChild(t);
}

function clearChosen() {
    window._chosen = [];
    document.getElementById('buildArea').innerHTML = '';
    document.getElementById('wordBank').querySelectorAll('.chip').forEach(c => c.classList.remove('picked'));
}

function checkTranslationRu() {
    let chosen = window._chosen || [];
    let q = window._trans_ru;
    if (!q) return;
    let corr = q.correct_sequence;
    let ok = chosen.length === corr.length && chosen.every((w,i) => w === corr[i]);
    let container = document.getElementById('exerciseQuestion');
    if (ok) {
        stats.totalCorrect++;
        exerciseState.correct++;
        container.innerHTML = `
            <div class="feedback ok"><span>Верно! <strong class="script">${corr.join(' ')}</strong></span></div>
            <button class="menu-btn primary" onclick="nextExercise()">Далее<span class="msym">arrow_forward</span></button>
        `;
    } else {
        stats.totalWrong++;
        let lesson = currentLesson;
        recordError(lesson, { word: q.russian, correct: corr.join(' '), your: chosen.join(' ') });
        container.innerHTML = `
            <div class="feedback fail"><span>Неверно. Правильный порядок: <strong class="script">${corr.join(' ')}</strong></span></div>
            <button class="menu-btn primary" onclick="nextExercise()">Далее<span class="msym">arrow_forward</span></button>
        `;
    }
    saveStats();
    // Убираем setTimeout
}

