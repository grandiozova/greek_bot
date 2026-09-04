// ============================================================
// M3: ripple, snackbar, dialog, progress
// ============================================================
const RIPPLE_TARGETS = '.menu-btn, .md-button, .option-btn, .md-icon-button, .lesson-item, .md-fab, .md-feature-card, .tab-bar button, .flashcard-buttons button, .word-bank .chip, .prayer-word, .clear-btn, .input-group button, .md-nav-item';

document.addEventListener('pointerdown', function (e) {
    let host = e.target.closest && e.target.closest(RIPPLE_TARGETS);
    if (!host || host.disabled) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // у navigation item всплеск живёт внутри «пилюли» индикатора
    if (host.classList.contains('md-nav-item')) host = host.querySelector('.md-nav-item__indicator') || host;
    let rect = host.getBoundingClientRect();
    let size = Math.max(rect.width, rect.height) * 2;
    let ripple = document.createElement('span');
    ripple.className = 'md-ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    host.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
});

let snackbarTimer = null;
function showToast(message, icon) {
    let bar = document.getElementById('snackbar');
    if (!bar) return;
    bar.innerHTML = (icon ? '<span class="msym sm">' + icon + '</span>' : '') + '<span>' + message + '</span>';
    bar.classList.add('show');
    clearTimeout(snackbarTimer);
    snackbarTimer = setTimeout(() => bar.classList.remove('show'), 4000);
}

let dialogResolve = null;
function mdDialog(opts) {
    return new Promise(resolve => {
        dialogResolve = resolve;
        document.getElementById('dialogIcon').textContent = opts.icon || 'help';
        document.getElementById('dialogHeadline').textContent = opts.headline || '';
        document.getElementById('dialogBody').textContent = opts.body || '';
        let confirmBtn = document.getElementById('dialogConfirmBtn');
        confirmBtn.textContent = opts.confirm || 'ОК';
        confirmBtn.className = opts.danger === false ? 'menu-btn primary' : 'menu-btn danger';
        document.getElementById('dialogScrim').classList.add('show');
    });
}
function mdDialogClose(result) {
    document.getElementById('dialogScrim').classList.remove('show');
    if (dialogResolve) { dialogResolve(result); dialogResolve = null; }
}
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.getElementById('dialogScrim').classList.contains('show')) mdDialogClose(false);
});

// Заголовок прогресса упражнения: линейный индикатор + счётчик
function progressHead(label, done, total) {
    let pct = total ? Math.round((done / total) * 100) : 0;
    return '<div class="md-progress-head">' +
        '<div class="md-linear-progress" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100">' +
            '<div class="md-linear-progress__bar" style="width:' + pct + '%"></div>' +
        '</div>' +
        '<span class="md-progress-label">' + label + '</span>' +
    '</div>';
}

// Пустое состояние списка
function emptyState(icon, text, hint) {
    return '<div class="md-empty-state"><span class="msym">' + icon + '</span>' +
        '<div class="md-title-medium">' + text + '</div>' +
        (hint ? '<div class="md-body-medium">' + hint + '</div>' : '') + '</div>';
}

// Экран результата серии упражнений
function resultBlock(correct, total, title) {
    let p = total ? Math.round((correct / total) * 100) : 0;
    return '<div class="feedback ' + (p >= 70 ? 'ok' : 'fail') + '"><span>' + title +
        '<br>Результат: ' + correct + ' из ' + total + ' (' + p + '%)</span></div>';
}

