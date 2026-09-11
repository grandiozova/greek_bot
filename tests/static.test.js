// ============================================================
// СТАТИЧЕСКИЕ ПРОВЕРКИ ИСХОДНИКОВ
// ============================================================
// Здесь ловится тот класс ошибок, из-за которого приложение однажды
// не запускалось вовсе: повторное `let` в другом файле, вызов функции,
// которой нигде нет, и файл, забытый в CORE_ASSETS сервис-воркера.
// Ни одна из этих проверок не требует DOM и потому выполняется мгновенно.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { repoPath, readIndex, scriptOrder, styleOrder, loadApp } = require('./helpers/app.js');

const HTML = readIndex();
const SCRIPTS = scriptOrder(HTML);
const STYLES = styleOrder(HTML);
const read = rel => fs.readFileSync(repoPath(rel), 'utf8');

// Верхнеуровневые объявления файла: строка, начинающаяся с ключевого слова.
function topLevelDeclarations(src) {
    const out = { lexical: [], functions: [] };
    for (const m of src.matchAll(/^(let|const|class|var|function)\s+([A-Za-z_$][\w$]*)/gm)) {
        (m[1] === 'function' || m[1] === 'var' ? out.functions : out.lexical).push(m[2]);
    }
    return out;
}

test('порядок загрузки: данные раньше логики, boot.js последним', () => {
    assert.ok(SCRIPTS.length > 0, 'в index.html нет <script src>');

    const lastData = SCRIPTS.map(s => s.startsWith('data/')).lastIndexOf(true);
    const firstLogic = SCRIPTS.findIndex(s => s.startsWith('js/'));
    assert.ok(lastData < firstLogic, 'data/*.js должны идти до js/*.js: ' + SCRIPTS.join(', '));

    assert.strictEqual(SCRIPTS[SCRIPTS.length - 1], 'js/boot.js',
        'boot.js — единственный файл, который что-то выполняет при загрузке, и обязан быть последним');
});

test('tokens.css подключён первым среди своих стилей', () => {
    assert.strictEqual(STYLES[0], 'styles/tokens.css',
        'остальные стили читают переменные из tokens.css: ' + STYLES.join(', '));
});

test('каждый подключённый файл существует', () => {
    for (const rel of [...SCRIPTS, ...STYLES]) {
        assert.ok(fs.existsSync(repoPath(rel)), 'index.html ссылается на несуществующий ' + rel);
    }
});

test('все скрипты и sw.js разбираются как JavaScript', () => {
    for (const rel of [...SCRIPTS, 'sw.js']) {
        assert.doesNotThrow(() => new vm.Script(read(rel), { filename: rel }),
            'синтаксическая ошибка в ' + rel);
    }
});

test('нет повторных верхнеуровневых let/const в разных файлах', () => {
    // Классические скрипты делят одну глобальную лексическую область:
    // второе `let allVocabCache` в другом файле — SyntaxError, и весь этот
    // файл не грузится. Регрессия, из-за которой отваливались словарь
    // и «Отче наш» целиком.
    const seen = new Map();
    const dupes = [];
    for (const rel of SCRIPTS) {
        for (const name of topLevelDeclarations(read(rel)).lexical) {
            if (seen.has(name)) dupes.push(`${name}: ${seen.get(name)} и ${rel}`);
            else seen.set(name, rel);
        }
    }
    assert.deepStrictEqual(dupes, [], 'повторные объявления:\n  ' + dupes.join('\n  '));
});

test('нет функций, объявленных дважды в разных файлах', () => {
    // Это не SyntaxError: более поздний файл молча перетирает более ранний.
    // Так `progressHead` из core.js годами существовал мёртвым кодом рядом
    // с рабочей версией из ui.js.
    const seen = new Map();
    const dupes = [];
    for (const rel of SCRIPTS) {
        for (const name of topLevelDeclarations(read(rel)).functions) {
            if (seen.has(name)) dupes.push(`${name}: ${seen.get(name)} и ${rel}`);
            else seen.set(name, rel);
        }
    }
    assert.deepStrictEqual(dupes, [], 'функция определена дважды:\n  ' + dupes.join('\n  '));
});

test('каждый обработчик в разметке ссылается на существующую функцию', () => {
    const defined = new Set();
    for (const rel of SCRIPTS) {
        const d = topLevelDeclarations(read(rel));
        d.lexical.forEach(n => defined.add(n));
        d.functions.forEach(n => defined.add(n));
    }
    const missing = new Set();
    for (const m of HTML.matchAll(/\bon(?:click|input|keydown)="([^"]+)"/g)) {
        for (const call of m[1].matchAll(/([A-Za-z_$][\w$]*)\s*\(/g)) {
            const name = call[1];
            if (name === 'if' || defined.has(name)) continue;
            missing.add(name);
        }
    }
    assert.deepStrictEqual([...missing], [],
        'разметка зовёт несуществующие функции: ' + [...missing].join(', '));
});

test('CORE_ASSETS сервис-воркера покрывает всё, что грузит index.html', () => {
    // Забытый здесь файл не виден онлайн и ломает холодный старт офлайн —
    // отказ, которого ни один онлайн-тест не покажет.
    const sw = read('sw.js');
    const assets = Array.from(sw.matchAll(/'\.\/([^']*)'/g)).map(m => m[1]);
    const missing = [...SCRIPTS, ...STYLES].filter(rel => !assets.includes(rel));
    assert.deepStrictEqual(missing, [],
        'нет в CORE_ASSETS: ' + missing.join(', ') + ' (и не забудьте поднять CACHE_VERSION)');
});

test('CORE_ASSETS не перечисляет то, чего нет на диске', () => {
    const sw = read('sw.js');
    const assets = Array.from(sw.matchAll(/'\.\/([^']*)'/g)).map(m => m[1]).filter(Boolean);
    const ghosts = assets.filter(rel => !fs.existsSync(repoPath(rel)));
    assert.deepStrictEqual(ghosts, [], 'в CORE_ASSETS указаны отсутствующие файлы: ' + ghosts.join(', '));
});

test('самопроверка загрузчика: битый скрипт виден тесту', () => {
    // Если бы ошибки скриптов не доходили до errors, все остальные тесты
    // проходили бы на неработающем приложении. Проверяем на живом примере.
    const app = loadApp({ breakScript: 'js/vocab.js' });
    assert.ok(app.errors.length > 0, 'загрузчик не заметил синтаксическую ошибку во вклеенном скрипте');
    app.close();
});

test('картинки README лежат там, куда он ссылается, и не под .gitignore', () => {
    // Скриншоты дважды пропадали со страницы репозитория: сначала их папка
    // называлась «screenshots » с пробелом на конце, потом README сослался на
    // screenshots/, а файлы лежат в docs/screenshots/. Корневой screenshots/
    // к тому же в .gitignore — положить туда файлы не выйдет.
    const readme = read('README.md');
    const srcs = Array.from(readme.matchAll(/<img[^>]+src="([^"]+)"/g)).map(m => m[1])
        .concat(Array.from(readme.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)).map(m => m[1]))
        .filter(src => !/^[a-z]+:/i.test(src));
    assert.ok(srcs.length > 0, 'в README не нашлось ни одной картинки — тест ничего не проверил');

    const missing = srcs.filter(src => !fs.existsSync(repoPath(src)));
    assert.deepStrictEqual(missing, [], 'README ссылается на отсутствующие файлы: ' + missing.join(', '));

    const ignoredDirs = read('.gitignore').split(/\r?\n/)
        .map(l => l.trim()).filter(l => /^[^#!*][^*]*\/$/.test(l));
    const ignored = srcs.filter(src => ignoredDirs.some(dir => src.startsWith(dir)));
    assert.deepStrictEqual(ignored, [], 'картинки README в папке из .gitignore: ' + ignored.join(', '));
});
