// ============================================================
// ТЁМНАЯ / СВЕТЛАЯ ТЕМА
// ============================================================
// 'system' хранится как выбор, а не как вычисленная тема: иначе смена темы
// в ОС перестанет доходить до приложения после первого же запуска.
const THEME_MODES = ['system', 'light', 'dark'];
let themeMode = 'system';

const darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

function systemTheme() { return darkQuery && darkQuery.matches ? 'dark' : 'light'; }
function resolvedTheme() { return themeMode === 'system' ? systemTheme() : themeMode; }

function setThemeMode(mode) {
    if (THEME_MODES.indexOf(mode) === -1) mode = 'system';
    themeMode = mode;
    try { localStorage.setItem('greek_theme', mode); } catch (e) {}
    applyTheme(resolvedTheme());
    syncThemeControls();
}

// Подсветка выбранного режима и подпись под ним.
function syncThemeControls() {
    let group = document.getElementById('themeSegmented');
    if (group) {
        group.querySelectorAll('[data-theme-mode]').forEach(b => {
            b.setAttribute('aria-checked', b.getAttribute('data-theme-mode') === themeMode ? 'true' : 'false');
        });
    }
    let hint = document.getElementById('themeHint');
    if (hint) {
        hint.textContent = themeMode === 'system'
            ? 'Тема следует за настройкой системы: сейчас ' + (resolvedTheme() === 'dark' ? 'тёмная' : 'светлая') + '.'
            : 'Тема выбрана вручную и не меняется вместе с системной.';
    }
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    // Строка состояния браузера следует за поверхностью M3.
    // Цвет читаем из токена, а не дублируем — иначе он разъедется с палитрой.
    let surface = getComputedStyle(document.documentElement)
        .getPropertyValue('--md-sys-color-surface').trim();
    if (surface) {
        let meta = document.getElementById('themeColorMeta');
        if (!meta) {
            // Статические media-варианты нужны до запуска скрипта; дальше
            // цветом управляет выбор пользователя, и они только мешают.
            document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.remove());
            meta = document.createElement('meta');
            meta.id = 'themeColorMeta';
            meta.name = 'theme-color';
            document.head.appendChild(meta);
        }
        if (meta.content !== surface) meta.content = surface;
    }
}

function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem('greek_theme'); } catch (e) {}
    // До появления настроек здесь лежала уже вычисленная тема ('light'/'dark') —
    // такое значение остаётся валидным выбором «вручную».
    themeMode = THEME_MODES.indexOf(saved) !== -1 ? saved : 'system';
    applyTheme(resolvedTheme());
    syncThemeControls();
    // Пока выбран режим «как в системе», следим за переключением темы в ОС.
    if (darkQuery) {
        let onChange = () => { if (themeMode === 'system') { applyTheme(resolvedTheme()); syncThemeControls(); } };
        if (darkQuery.addEventListener) darkQuery.addEventListener('change', onChange);
        else if (darkQuery.addListener) darkQuery.addListener(onChange);
    }
}

