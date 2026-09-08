// ============================================================
// «ИГРОК»: проходит любое упражнение до конца
// ============================================================
// Все виды заданий сводятся к четырём способам ответить: выбрать вариант,
// напечатать перевод, собрать фразу из фишек или оценить карточку. Драйвер
// не знает, какое упражнение перед ним — он жмёт то, что видит, пока экран
// не перестанет меняться. Поэтому один и тот же код прогоняет и упражнения
// урока, и тест, и карточки.

// Колода всех слов — больше сотни карточек по два хода на каждую, так что
// потолок должен быть щедрым: он тут страховка от зацикливания, а не лимит.
const MAX_STEPS = 3000;

function q(app, root, sel) {
    return app.document.querySelector(root + ' ' + sel);
}
function qa(app, root, sel) {
    return [...app.document.querySelectorAll(root + ' ' + sel)];
}

// Один ход. Возвращает true, если удалось что-то нажать.
function step(app, root, { answer = 'ответ', correctly = false } = {}) {
    // 1. Кнопка «Далее» после обратной связи
    const next = qa(app, root, '.menu-btn').find(b => /Далее/.test(b.textContent));
    if (next) { next.click(); return true; }

    // 2. Варианты ответа
    const options = qa(app, root, '.option-btn:not([disabled])');
    if (options.length) {
        options[0].click();
        return true;
    }

    // 3. Поле ввода перевода
    const input = q(app, root, 'input[type=text]');
    if (input) {
        input.value = answer;
        const btn = q(app, root, '.input-group button');
        if (btn) { btn.click(); return true; }
    }

    // 4. Банк слов: собрать фразу и проверить
    const chips = qa(app, root, '.word-bank .chip:not(.picked)');
    if (chips.length) {
        const state = correctly ? currentCorrect(app, root) : null;
        if (state) {
            // Собираем в правильном порядке — нужно, чтобы проверить засчитывание
            for (const word of state) {
                const chip = qa(app, root, '.word-bank .chip:not(.picked)').find(c => c.textContent === word);
                if (chip) chip.click();
            }
        } else {
            chips.forEach(c => c.click());
        }
        const check = qa(app, root, '.menu-btn.primary').find(b => /Проверить|Готово/.test(b.textContent));
        if (check) { check.click(); return true; }
    }

    // 5. Карточка: показать перевод, затем оценить
    const show = q(app, root, '.flashcard-buttons .show');
    if (show) { show.click(); return true; }
    const know = q(app, root, '.flashcard-buttons .know');
    if (know) { know.click(); return true; }

    return false;
}

// Правильный ответ текущего вопроса-конструктора, если тест попросил отвечать верно.
function currentCorrect(app, root) {
    try {
        if (root === '#translationQuestion' || root === '#drillSection') {
            const s = app.get('translationState');
            if (s && s.questions && s.questions[s.index] && Array.isArray(s.questions[s.index].correct)) {
                return s.questions[s.index].correct;
            }
        }
    } catch (e) { /* состояние не про этот экран */ }
    return null;
}

// После ответа приложение показывает обратную связь и переходит к следующему
// вопросу по таймеру (scheduleAdvance). Тест не должен ждать реального
// времени, поэтому на время прохождения переход делается мгновенным.
// Точечно, а не глобально: тесты про подсветку правильного варианта как раз
// смотрят на экран обратной связи, который мгновенный переход бы стёр.
function withInstantAdvance(app, fn) {
    const original = app.window.scheduleAdvance;
    app.window.scheduleAdvance = function (callback) {
        app.window.cancelAdvance();
        callback();
    };
    try { return fn(); } finally { app.window.scheduleAdvance = original; }
}

/**
 * Проходит упражнение до конца.
 * @returns {{steps:number, finished:boolean}}
 */
function playThrough(app, root, opts = {}) {
    return withInstantAdvance(app, () => {
        let steps = 0;
        while (steps < MAX_STEPS) {
            if (isFinished(app, root) && !q(app, root, '.option-btn:not([disabled])')) break;
            if (!step(app, root, opts)) break;
            steps++;
        }
        return { steps, finished: isFinished(app, root) };
    });
}

function isFinished(app, root) {
    const el = app.document.querySelector(root);
    return !!el && /завершен|завершён/i.test(el.textContent);
}

module.exports = { playThrough, step, withInstantAdvance, isFinished, MAX_STEPS };
