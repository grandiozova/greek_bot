// ============================================================
// НАСТРОЙКИ
// ============================================================

function renderLicenses() {
    let box = document.getElementById('licenseList');
    if (!box) return;
    let parts = [];
    for (let l of LICENSES) {
        parts.push('<div class="license-item">',
            '<div class="license-item__name">', escHtml(l.name), '</div>',
            '<div class="license-item__terms">', escHtml(l.terms));
        if (l.url) {
            parts.push(' <a href="', escHtml(l.url), '" target="_blank" rel="noopener noreferrer">',
                'текст лицензии<span class="msym">open_in_new</span></a>');
        }
        parts.push('</div></div>');
    }
    box.innerHTML = parts.join('');
}

function showSettings() {
    showSection('settingsSection');
    syncThemeControls();
    renderLicenses();
}

