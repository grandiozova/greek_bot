// ============================================================
// СТАТИСТИКА И ОШИБКИ
// ============================================================
function showStats() {
    showSection('statsSection');
    let total = stats.totalCorrect + stats.totalWrong;
    let accuracy = total ? Math.round((stats.totalCorrect / total) * 100) : 0;
    let errLessons = Object.keys(stats.errors).length;
    let errCount = 0;
    for (let k in stats.errors) errCount += (stats.errors[k] || []).length;

    let html = '';
    if (total === 0) {
        html = emptyState('rocket_launch', 'Пока нет ответов',
            'Пройдите упражнение или тест — статистика появится здесь');
    } else {
        html =
            '<div class="md-stat-grid">' +
                '<div class="md-stat-tile"><span class="md-stat-tile__value">' + accuracy + '%</span>' +
                    '<span class="md-stat-tile__label">Точность</span></div>' +
                '<div class="md-stat-tile"><span class="md-stat-tile__value">' + total + '</span>' +
                    '<span class="md-stat-tile__label">Всего ответов</span></div>' +
            '</div>' +
            progressHead(stats.totalCorrect + ' из ' + total, stats.totalCorrect, total) +
            '<div class="stat-row"><span class="msym">check_circle</span>' +
                '<span class="stat-row__label">Правильных</span>' +
                '<span class="stat-row__value">' + stats.totalCorrect + '</span></div>' +
            '<div class="stat-row"><span class="msym">cancel</span>' +
                '<span class="stat-row__label">Неправильных</span>' +
                '<span class="stat-row__value">' + stats.totalWrong + '</span></div>' +
            '<div class="stat-row"><span class="msym">menu_book</span>' +
                '<span class="stat-row__label">Уроков с ошибками</span>' +
                '<span class="stat-row__value">' + errLessons + '</span></div>';
        if (errCount) {
            html += '<div class="md-button-row"><button class="menu-btn" onclick="showErrors()">' +
                '<span class="msym">rule</span>Разобрать ошибки (' + errCount + ')</button></div>';
        }
    }
    document.getElementById('statsContent').innerHTML = html;
}

function showErrors() {
    showSection('errorsSection');
    let content = document.getElementById('errorsContent');
    let err = stats.errors;
    if (!err || Object.keys(err).length === 0) {
        content.innerHTML = emptyState('task_alt', 'Ошибок нет', 'Отличная работа — разбирать пока нечего');
        return;
    }
    let html = '';
    for (let lesson of Object.keys(err)) {
        let items = err[lesson];
        if (!Array.isArray(items) || items.length === 0) continue;
        html += '<div class="md-subhead">' + (lesson === 'all' ? 'Все слова' : 'Урок ' + escHtml(lesson)) + '</div>';
        for (let e of items) {
            // e.your — то, что напечатал пользователь; в разметку только экранированным
            html += '<div class="error-item"><span class="msym sm">error</span><span>' + escHtml(e.word) +
                ' → правильно: <strong>' + escHtml(e.correct) + '</strong><br>ваш ответ: ' + escHtml(e.your) + '</span></div>';
        }
    }
    html += '<button class="clear-btn" onclick="clearErrors()"><span class="msym sm">delete_sweep</span>Очистить ошибки</button>';
    content.innerHTML = html;
}

function clearErrors() {
    mdDialog({
        icon: 'delete_sweep',
        danger: true,
        headline: 'Очистить список ошибок?',
        body: 'Разбор ошибок будет удалён. Общая статистика ответов сохранится.',
        confirm: 'Очистить'
    }).then(ok => {
        if (!ok) return;
        stats.errors = {};
        saveStats();
        showErrors();
        showToast('Список ошибок очищен', 'delete_sweep');
    });
}

function clearAllProgress() {
    mdDialog({
        icon: 'restart_alt',
        danger: true,
        headline: 'Сбросить прогресс?',
        body: 'Статистика ответов и список ошибок будут удалены безвозвратно.',
        confirm: 'Сбросить'
    }).then(ok => {
        if (!ok) return;
        stats = { totalCorrect: 0, totalWrong: 0, errors: {} };
        saveStats();
        // Кнопка есть в настройках; уводить пользователя с экрана не за что.
        if (currentSectionId === 'statsSection') showStats();
        showToast('Прогресс сброшен', 'restart_alt');
    });
}

