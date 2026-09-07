// ============================================================
// НАВИГАЦИЯ (shell)
// ============================================================

// ScrollFrame объявлена здесь, один раз
let scrollFrame = null;

function updateShell() {
    // Обновляет состояние навигации в зависимости от текущей секции
    let navMap = {
        'mainMenu': 'lessons',
        'lessonSection': 'lessons',
        'allVocabSection': 'vocab',
        'allFlashcardsSection': 'cards',
        'statsSection': 'progress',
        'settingsSection': 'settings',
        'errorsSection': 'lessons',
        'testSection': 'lessons',
        'prayerSection': 'lessons',
        'drillSection': 'lessons'
    };
    let active = document.querySelector('.section.active');
    let dest = active ? navMap[active.id] || 'lessons' : 'lessons';
    document.querySelectorAll('.md-nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.dest === dest);
    });
}

function navigateTo(dest) {
    // Переключение между основными разделами (навигационная панель)
    let sectionMap = {
        'lessons': 'mainMenu',
        'vocab': 'allVocabSection',
        'cards': 'allFlashcardsSection',
        'progress': 'statsSection',
        'settings': 'settingsSection'
    };
    let id = sectionMap[dest];
    if (!id) return;
    if (id === 'mainMenu') {
        goToMain();
    } else {
        showSection(id);
        // Если перешли в словарь или карточки – подгружаем данные
        if (id === 'allVocabSection') showAllVocab();
        if (id === 'allFlashcardsSection') startAllFlashcards();
        if (id === 'statsSection') showStats();
    }
    updateShell();
}

function onFabClick() {
    // FAB – возврат к урокам
    goToMain();
}