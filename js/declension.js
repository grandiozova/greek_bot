// ============================================================
// ФУНКЦИИ ДЛЯ АККОРДЕОНА (таблицы склонений)
// ============================================================
function generateDeclensionTable(forms, translations) {
    if (!forms) return '';
    let html = '';
    // Для местоимений с мужским/женским/средним родом
    if (forms.masculine || forms.feminine || forms.neuter) {
        let cases = ['nom','gen','dat','acc','voc'];
        let labels = {nom:'Nom.',gen:'Gen.',dat:'Dat.',acc:'Acc.',voc:'Voc.'};
        html += '<table><thead><tr><th>Падеж</th><th>Муж.</th><th>Жен.</th><th>Ср.</th>';
        if (translations) html += '<th>Перевод</th>';
        html += '</tr></thead><tbody>';
        for (let c of cases) {
            let m = (forms.masculine && forms.masculine.singular && forms.masculine.singular[c]) ? forms.masculine.singular[c] : '';
            let f = (forms.feminine && forms.feminine.singular && forms.feminine.singular[c]) ? forms.feminine.singular[c] : '';
            let n = (forms.neuter && forms.neuter.singular && forms.neuter.singular[c]) ? forms.neuter.singular[c] : '';
            html += '<tr><td>'+labels[c]+'</td><td>'+m+'</td><td>'+f+'</td><td>'+n+'</td>';
            if (translations && translations.singular && translations.singular[c]) {
                html += '<td>'+translations.singular[c]+'</td>';
            }
            html += '</tr>';
        }
        html += '</tbody></table>';
        // Множественное число
        let hasPlural = (forms.masculine && forms.masculine.plural) || (forms.feminine && forms.feminine.plural) || (forms.neuter && forms.neuter.plural);
        if (hasPlural) {
            html += '<table><thead><tr><th>Падеж</th><th>Муж. (мн.)</th><th>Жен. (мн.)</th><th>Ср. (мн.)</th>';
            if (translations) html += '<th>Перевод</th>';
            html += '</tr></thead><tbody>';
            for (let c of cases) {
                let m = (forms.masculine && forms.masculine.plural && forms.masculine.plural[c]) ? forms.masculine.plural[c] : '';
                let f = (forms.feminine && forms.feminine.plural && forms.feminine.plural[c]) ? forms.feminine.plural[c] : '';
                let n = (forms.neuter && forms.neuter.plural && forms.neuter.plural[c]) ? forms.neuter.plural[c] : '';
                html += '<tr><td>'+labels[c]+'</td><td>'+m+'</td><td>'+f+'</td><td>'+n+'</td>';
                if (translations && translations.plural && translations.plural[c]) {
                    html += '<td>'+translations.plural[c]+'</td>';
                }
                html += '</tr>';
            }
            html += '</tbody></table>';
        }
        return html;
    }
    // Для существительных с singular/plural (без разделения по родам)
    if (forms.singular || forms.plural) {
        let cases = ['nom','gen','dat','acc','voc'];
        let labels = {nom:'Nom.',gen:'Gen.',dat:'Dat.',acc:'Acc.',voc:'Voc.'};
        let hasCases = false;
        for (let c of cases) {
            if ((forms.singular && forms.singular[c]) || (forms.plural && forms.plural[c])) {
                hasCases = true;
                break;
            }
        }
        if (hasCases) {
            html += '<table><thead><tr><th>Падеж</th>';
            if (forms.singular && Object.keys(forms.singular).length > 0) html += '<th>Ед.ч.</th>';
            if (forms.plural && Object.keys(forms.plural).length > 0) html += '<th>Мн.ч.</th>';
            if (translations) html += '<th>Перевод</th>';
            html += '</tr></thead><tbody>';
            for (let c of cases) {
                let sg = (forms.singular && forms.singular[c]) ? forms.singular[c] : '';
                let pl = (forms.plural && forms.plural[c]) ? forms.plural[c] : '';
                if (sg || pl) {
                    html += '<tr><td>'+labels[c]+'</td>';
                    if (forms.singular && Object.keys(forms.singular).length > 0) html += '<td>'+sg+'</td>';
                    if (forms.plural && Object.keys(forms.plural).length > 0) html += '<td>'+pl+'</td>';
                    if (translations) {
                        let trans = '';
                        if (translations.singular && translations.singular[c]) trans = translations.singular[c];
                        else if (translations.plural && translations.plural[c]) trans = translations.plural[c];
                        html += '<td>'+trans+'</td>';
                    }
                    html += '</tr>';
                }
            }
            html += '</tbody></table>';
            return html;
        }
// Для глаголов (лица) — добавляем перевод
if (forms.singular && forms.singular["1"] !== undefined) {
    let persons = ['1','2','3'];
    let personLabels = ['1-е лицо','2-е лицо','3-е лицо'];
    html += '<table><thead><tr><th>Лицо</th><th>Ед.ч.</th><th>Мн.ч.</th>';
    if (translations) html += '<th>Перевод</th>';
    html += '</tr></thead><tbody>';
    for (let i=0; i<persons.length; i++) {
        let sg = (forms.singular && forms.singular[persons[i]]) ? forms.singular[persons[i]] : '';
        let pl = (forms.plural && forms.plural[persons[i]]) ? forms.plural[persons[i]] : '';
        html += '<tr><td>'+personLabels[i]+'</td><td>'+sg+'</td><td>'+pl+'</td>';
        if (translations) {
            let trans = '';
            if (translations.singular && translations.singular[persons[i]]) trans = translations.singular[persons[i]];
            else if (translations.plural && translations.plural[persons[i]]) trans = translations.plural[persons[i]];
            html += '<td>'+trans+'</td>';
        }
        html += '</tr>';
    }
    html += '</tbody></table>';
    return html;
}
        // fallback
        let keys = Object.keys(forms.singular || {});
        if (keys.length) {
            html += '<table><thead><tr><th></th><th>Ед.ч.</th><th>Мн.ч.</th>';
            if (translations) html += '<th>Перевод</th>';
            html += '</tr></thead><tbody>';
            for (let k of keys) {
                let sg = forms.singular ? forms.singular[k] : '';
                let pl = forms.plural ? forms.plural[k] : '';
                html += '<tr><td>'+k+'</td><td>'+sg+'</td><td>'+pl+'</td>';
                if (translations) {
                    let trans = '';
                    if (translations.singular && translations.singular[k]) trans = translations.singular[k];
                    else if (translations.plural && translations.plural[k]) trans = translations.plural[k];
                    html += '<td>'+trans+'</td>';
                }
                html += '</tr>';
            }
            html += '</tbody></table>';
        }
        return html;
    }
    return '';
}
   

function toggleDeclension(el) {
    let details = el.querySelector('.word-details');
    if (!details) return;
    let opening = !details.classList.contains('open');
    details.classList.toggle('open', opening);
    el.classList.toggle('open', opening);   // разворачивает стрелку chevron
    el.setAttribute('aria-expanded', opening ? 'true' : 'false');
}

