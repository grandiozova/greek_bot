// ============================================================
// ПАРАДИГМЫ: ТАБЛИЦЫ СКЛОНЕНИЙ И СПРЯЖЕНИЙ
// ============================================================
// Парадигма — это решётка: оси с упорядоченными значениями и формы в
// пересечениях. Раньше решётка была зашита в код — пять греческих падежей,
// три рода, три лица, — и ничего, кроме греческого имени и глагола, выразить
// не могла.
//
// В иврите падежей нет вовсе, а роды два, и в эту решётку не ложится ни одна
// парадигма пособия: прилагательное — это род × число (гл. 7), личное
// местоимение — пять лиц-с-родом × число (гл. 8), местоименные суффиксы —
// десять лиц × два типа (гл. 9), числительное — четыре колонки
// «муж./жен. × абсолютная/сопряжённая» (гл. 11).
//
// Поэтому оси описываются данными:
//
//   declension_forms: {
//       tables: [{
//           caption: 'Единственное число',        // необязательно
//           rows: { label: 'Лицо', values: [['1cs', '1 общ. ед.'], …] },
//           cols: { values: [['t1', 'Тип 1'], ['t2', 'Тип 2']] },
//           cells: { '1cs': { t1: 'יִ', t2: 'יַ' }, … },
//           translations: { '1cs': 'мой / мои' }  // необязательная колонка
//       }]
//   }
//
// Греческие данные (101 слово в data/lessons.js) записаны прежней вложенной
// формой — forms[род][число][падеж]. Её не переписывали: legacyParadigm()
// раскладывает её в те же оси, поэтому таблица у греческого получается ровно
// та же, что и раньше (tests/declension.test.js сверяет посимвольно), а
// рисующий код остался один.

const CASE_ORDER = ['nom', 'gen', 'dat', 'acc', 'voc'];
const CASE_LABELS = { nom: 'Nom.', gen: 'Gen.', dat: 'Dat.', acc: 'Acc.', voc: 'Voc.' };
const GENDER_COLS = [['m', 'Муж.'], ['f', 'Жен.'], ['n', 'Ср.']];
const NUMBER_COLS = [['singular', 'Ед.ч.'], ['plural', 'Мн.ч.']];

// ------------------------------------------------------------ отрисовка

// Одна таблица. Колонка, объявленная в <thead>, обязана быть в каждой строке —
// иначе таблица едет вбок на строках без перевода; поэтому ячейки перебираются
// по осям, а не по тому, что нашлось в данных.
function paradigmTableHtml(t) {
    if (!t || !t.rows || !t.cols) return '';
    let html = '<table>';
    if (t.caption) html += '<caption>' + t.caption + '</caption>';
    html += '<thead><tr><th>' + (t.rows.label || '') + '</th>';
    for (let col of t.cols.values) html += '<th>' + col[1] + '</th>';
    if (t.translations) html += '<th>Перевод</th>';
    html += '</tr></thead><tbody>';
    for (let row of t.rows.values) {
        let cells = (t.cells && t.cells[row[0]]) || {};
        html += '<tr><td>' + row[1] + '</td>';
        // Форма — текст изучаемого языка, подпись строки и перевод — русские,
        // поэтому метка стоит на ячейках пересечения, а не на всей таблице.
        for (let col of t.cols.values) html += '<td class="script">' + (cells[col[0]] || '') + '</td>';
        if (t.translations) html += '<td>' + (t.translations[row[0]] || '') + '</td>';
        html += '</tr>';
    }
    return html + '</tbody></table>';
}

function generateDeclensionTable(forms, translations) {
    let p = paradigm(forms, translations);
    return p ? p.tables.map(paradigmTableHtml).join('') : '';
}

// Описание осей: либо оно уже в данных, либо его собирают из прежней формы.
function paradigm(forms, translations) {
    if (!forms) return null;
    if (forms.tables) return forms;
    return legacyParadigm(forms, translations);
}

// ------------------------------------------------------------ прежняя форма

// Перевод строки в таблице без разделения по родам искали то в singular, то в
// plural — здесь это сведено в одну карту «падеж → перевод».
function mergedTranslations(translations, keys) {
    if (!translations) return null;
    let out = {};
    for (let k of keys) {
        out[k] = (translations.singular && translations.singular[k]) ||
                 (translations.plural && translations.plural[k]) || '';
    }
    return out;
}

function legacyParadigm(forms, translations) {
    // --- местоимения и прилагательные: род × падеж, отдельная таблица на число
    if (forms.masculine || forms.feminine || forms.neuter) {
        let genders = { m: forms.masculine, f: forms.feminine, n: forms.neuter };
        let table = (num, cols) => {
            let cells = {};
            for (let c of CASE_ORDER) {
                cells[c] = {};
                for (let g in genders) {
                    let block = genders[g] && genders[g][num];
                    cells[c][g] = (block && block[c]) || '';
                }
            }
            return {
                rows: { label: 'Падеж', values: CASE_ORDER.map(c => [c, CASE_LABELS[c]]) },
                cols: { values: cols },
                cells: cells,
                translations: translations ? (translations[num] || {}) : null
            };
        };
        let tables = [table('singular', GENDER_COLS)];
        let hasPlural = Object.keys(genders).some(g => genders[g] && genders[g].plural);
        if (hasPlural) {
            tables.push(table('plural', GENDER_COLS.map(c => [c[0], c[1] + ' (мн.)'])));
        }
        return { tables: tables };
    }

    if (!forms.singular && !forms.plural) return null;

    // Колонка числа показывается, только если в ней что-то есть.
    let numberCols = NUMBER_COLS.filter(c => forms[c[0]] && Object.keys(forms[c[0]]).length > 0);
    let cellsBy = keys => {
        let cells = {};
        for (let k of keys) {
            cells[k] = {};
            for (let c of NUMBER_COLS) cells[k][c[0]] = (forms[c[0]] && forms[c[0]][k]) || '';
        }
        return cells;
    };

    // --- имя без разделения по родам: падеж × число, пустые падежи пропускаем
    let cases = CASE_ORDER.filter(c => (forms.singular && forms.singular[c]) || (forms.plural && forms.plural[c]));
    if (cases.length) {
        return { tables: [{
            rows: { label: 'Падеж', values: cases.map(c => [c, CASE_LABELS[c]]) },
            cols: { values: numberCols },
            cells: cellsBy(cases),
            translations: mergedTranslations(translations, cases)
        }] };
    }

    // --- глагол: лицо × число
    if (forms.singular && forms.singular['1'] !== undefined) {
        let persons = ['1', '2', '3'];
        return { tables: [{
            rows: { label: 'Лицо', values: persons.map(p => [p, p + '-е лицо']) },
            cols: { values: NUMBER_COLS },
            cells: cellsBy(persons),
            translations: mergedTranslations(translations, persons)
        }] };
    }

    // --- всё остальное: ключи как есть
    let keys = Object.keys(forms.singular || {});
    if (!keys.length) return null;
    return { tables: [{
        rows: { label: '', values: keys.map(k => [k, k]) },
        cols: { values: NUMBER_COLS },
        cells: cellsBy(keys),
        translations: mergedTranslations(translations, keys)
    }] };
}

// ------------------------------------------------------------ перебор форм

// Все формы парадигмы плоским списком — из него строится оборот карточки.
// Ключ и подпись берутся из самих осей, поэтому разбирать ключ строкой
// (cardCaseLabel) приходится только для прежней греческой формы, где ключи
// обязаны совпадать с авторскими declension_fill (gen_sg, nom_pl_m, 2sg).
function paradigmCells(forms) {
    let p = paradigm(forms, null);
    if (!p) return [];
    let out = [];
    for (let t of p.tables) {
        for (let row of t.rows.values) {
            let cells = (t.cells && t.cells[row[0]]) || {};
            for (let col of t.cols.values) {
                let form = cells[col[0]];
                if (!form) continue;
                let label = col[1] ? row[1] + ', ' + col[1] : row[1];
                out.push({ key: row[0] + '_' + col[0], form: form, label: label });
            }
        }
    }
    return out;
}

function toggleDeclension(el) {
    let details = el.querySelector('.word-details');
    if (!details) return;
    let opening = !details.classList.contains('open');
    details.classList.toggle('open', opening);
    el.classList.toggle('open', opening);   // разворачивает стрелку chevron
    // aria-expanded — на строке с role="button", а не на обёртке: состояние
    // объявляется у того элемента, который им управляет.
    let row = el.querySelector('.word-row');
    if (row) row.setAttribute('aria-expanded', opening ? 'true' : 'false');
}
