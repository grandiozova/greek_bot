// ============================================================
// ЗАГРУЗЧИК ПРИЛОЖЕНИЯ ДЛЯ ТЕСТОВ
// ============================================================
// Приложение — статические файлы без сборки: index.html и цепочка обычных
// (не module) <script>. jsdom не ходит за внешними ресурсами, поэтому мы
// вклеиваем каждый файл отдельным инлайновым <script> в том же порядке.
//
// Именно «отдельным», а не одним общим: классические скрипты делят одну
// глобальную лексическую область, и повторное `let` в другом файле —
// SyntaxError. Слей мы их в один скрипт, тест перестал бы ловить как раз тот
// класс ошибок, из-за которого приложение однажды не запускалось вовсе.

const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.join(__dirname, '..', '..');

function repoPath(...parts) {
    return path.join(ROOT, ...parts);
}

function readIndex() {
    return fs.readFileSync(repoPath('index.html'), 'utf8');
}

// Тег <script src="…"></script>. Закрывающий тег принимается в любом виде,
// какой понимает браузер (</script >, </SCRIPT>): иначе такой тег проскочил бы
// мимо и проверки порядка, и вклейки.
const SCRIPT_TAG_RE = /<script src="([^"]+)"><\/script[^>]*>/gi;

// Пути из <script src="…"> в порядке разметки — это и есть контракт загрузки.
function scriptOrder(html) {
    return Array.from((html || readIndex()).matchAll(SCRIPT_TAG_RE)).map(m => m[1]);
}

// Пути из <link rel="stylesheet" href="…"> — только свои, без CDN.
function styleOrder(html) {
    return Array.from((html || readIndex()).matchAll(/<link[^>]+href="((?!https?:)[^"]+\.css)"/g)).map(m => m[1]);
}

function inlineScripts(html, { breakScript = null } = {}) {
    return html.replace(SCRIPT_TAG_RE, (m, src) => {
        let code = fs.readFileSync(repoPath(src), 'utf8');
        if (code.includes('</script')) {
            throw new Error('В ' + src + ' есть закрывающий тег script — вклейка сломается');
        }
        // Точка для самопроверки самого загрузчика (см. static.test.js)
        if (breakScript && src === breakScript) code = 'let ЛОМАЕМ = ( ;';
        return '<script data-src="' + src + '">\n' + code + '\n</script>';
    });
}

/**
 * Поднимает приложение в jsdom.
 *
 * @param {object}  [opts]
 * @param {boolean} [opts.prefersDark]  что отвечает matchMedia про тёмную тему
 * @param {boolean} [opts.reducedMotion]  что отвечает matchMedia про prefers-reduced-motion
 * @param {object}  [opts.storage]      начальное содержимое localStorage
 * @param {string}  [opts.breakScript]  подменить файл битым кодом (для самопроверки)
 * @returns {{window, document, errors, get, screen, text, html, msyms, close}}
 */
function loadApp(opts = {}) {
    const html = inlineScripts(readIndex(), { breakScript: opts.breakScript });
    const errors = [];

    // Консоль обязана быть подключена ДО разбора документа: JSDOM выполняет
    // скрипты прямо в конструкторе, и слушатель, навешенный после, пропустит
    // всё, что упало при загрузке. Тесты тогда «зеленеют» на мёртвом файле.
    const virtualConsole = new VirtualConsole();
    virtualConsole.on('jsdomError', e => errors.push(e.stack || e.message));
    virtualConsole.on('error', (...args) => errors.push('console.error: ' + args.join(' ')));

    const dom = new JSDOM(html, {
        runScripts: 'dangerously',
        url: 'http://localhost/greek_bot/',
        pretendToBeVisual: true,
        virtualConsole,
        beforeParse(w) {
            // jsdom не реализует matchMedia; тема читает его при старте.
            w.matchMedia = q => ({
                matches: (!!opts.prefersDark && /prefers-color-scheme:\s*dark/.test(q)) ||
                         (!!opts.reducedMotion && /prefers-reduced-motion:\s*reduce/.test(q)),
                media: q,
                addEventListener() {}, removeEventListener() {},
                addListener() {}, removeListener() {}
            });
            // jsdom не реализует scrollTo — приложение его вызывает и гасит
            // исключение само, но без заглушки тесты тонут в шуме.
            w.scrollTo = () => {};
            w.HTMLElement.prototype.scrollIntoView = function () {};
            for (const [k, v] of Object.entries(opts.storage || {})) {
                w.localStorage.setItem(k, v);
            }
        }
    });

    const window = dom.window;
    const document = window.document;

    return {
        window,
        document,
        errors,
        // let/const на верхнем уровне не становятся свойствами window —
        // читаем их через eval в контексте страницы. (Функции, наоборот,
        // попадают в window и зовутся напрямую: app.window.openLesson(…).)
        //
        // ВАЖНО: массивы и объекты возвращаются из другого realm, поэтому
        // assert.deepStrictEqual придирается к прототипу даже при одинаковом
        // содержимом. Сравнивайте длину, свойство или строку — либо просите
        // сам eval вернуть уже готовую строку (.join(', ')).
        get: name => window.eval(name),
        // id активного экрана
        screen: () => {
            const s = document.querySelector('.section.active');
            return s ? s.id : null;
        },
        backButton: () => document.querySelector('#appBarLeading button'),
        appBarTitle: () => document.getElementById('appBarTitle').textContent,
        fab: () => {
            const el = document.getElementById('mainFab');
            return {
                hidden: el.classList.contains('hidden-fab'),
                label: document.getElementById('mainFabLabel').textContent
            };
        },
        navActive: () => {
            const b = document.querySelector('.md-nav-item.active');
            return b ? b.getAttribute('data-dest') : null;
        },
        // Все имена иконок, присутствующие сейчас в DOM
        msyms: () => Array.from(document.querySelectorAll('.msym'))
            .map(el => el.textContent.trim()).filter(Boolean),
        text: sel => (document.querySelector(sel) || {}).textContent || '',
        html: sel => (document.querySelector(sel) || {}).innerHTML || '',
        close: () => window.close()
    };
}

module.exports = { loadApp, repoPath, readIndex, scriptOrder, styleOrder, ROOT };
