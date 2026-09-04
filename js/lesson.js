// ============================================================
// ОТКРЫТИЕ УРОКА И ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
// ============================================================
function openLesson(lesson) {
    currentLesson = lesson;
    let data = getLessonData(lesson);
    if (!data) return;
    try { localStorage.setItem('greek_last_lesson', String(lesson)); } catch (e) {}
    document.getElementById('lessonTitle').textContent = data.title;
    currentLessonPart = 'grammar';
    showSection('lessonSection');
    updateNavButtons(lesson);

    // ===== СКРЫВАЕМ/ПОКАЗЫВАЕМ ВКЛАДКИ ДЛЯ УРОКОВ 1–2 =====
    let isIntroLesson = (lesson === 1 || lesson === 2);
    let tabButtons = document.querySelectorAll('.tab-bar button');
    let tabMapping = {
        'grammar': 'partGrammar',
        'vocab': 'partVocab',
        'exercise': 'partExercise',
        'flashcards': 'partFlashcards',
        'test': 'partTest',
        'translation': 'partTranslation'
    };
    // Скрываем или показываем каждую вкладку
    tabButtons.forEach(btn => {
        let part = btn.getAttribute('data-part');
        // Для уроков 1–2 показываем только грамматику и словарь
        if (isIntroLesson) {
            if (part === 'grammar' || part === 'vocab') {
                btn.style.display = ''; // показываем
            } else {
                btn.style.display = 'none'; // скрываем
            }
        } else {
            btn.style.display = ''; // показываем все
        }
    });

    document.querySelectorAll('.tab-bar button').forEach(b => b.classList.remove('active'));
    document.querySelector('.tab-bar button[data-part="grammar"]').classList.add('active');

    document.getElementById('grammarContent').innerHTML = data.grammar || '';

    let container = document.getElementById('vocabList');
    container.innerHTML = '';
    if (data.vocabulary) {
        data.vocabulary.forEach(item => {
            let article = item.article ? item.article + ' ' : '';
            let div = document.createElement('div');
            div.className = 'word-item';
            if (item.declension_forms) {
                div.classList.add('clickable');
                div.onclick = function(el) { return function() { toggleDeclension(el); }; }(div);
            }
let detailsHtml = '';
if (item.declension_forms) {
    detailsHtml = '<div class="word-details"><div class="md-table-scroll">' + generateDeclensionTable(item.declension_forms, item.caseTranslations || null) + '</div></div>';
}
            div.innerHTML = '<div class="word-row"><strong>' + article + item.greek + '</strong><span>' + item.translation + '</span></div>' + detailsHtml;
            container.appendChild(div);
        });
    }

    // Упражнения
    let btnContainer = document.getElementById('exerciseButtons');
    btnContainer.innerHTML = '';
    let hasExercises = false;
    if (data.exercises) {
        let keys = Object.keys(data.exercises);
        for (let k of keys) {
            if (data.exercises[k] && data.exercises[k].length > 0) { hasExercises = true; break; }
        }
    }
    if (hasExercises) {
        let types = [
            { key: 'declension_fill', label: 'Склонение', icon: 'account_tree' },
            { key: 'translate_greek_to_russian', label: 'Греческий → русский', icon: 'translate' },
            { key: 'translate_russian_to_greek', label: 'Русский → греческий', icon: 'g_translate' },
            { key: 'case_number', label: 'Падеж и число', icon: 'target' },
            { key: 'agreement', label: 'Согласование', icon: 'link' },
            { key: 'attribute_vs_predicate', label: 'Атрибут / предикатив', icon: 'balance' },
            { key: 'substantivation', label: 'Субстантивация', icon: 'push_pin' },
            { key: 'article_fill', label: 'Артикль', icon: 'abc' }
        ];
        types.forEach(t => {
            if (data.exercises[t.key] && data.exercises[t.key].length > 0) {
                let b = document.createElement('button');
                b.className = 'menu-btn';
                b.innerHTML = '<span class="msym">' + t.icon + '</span>' + t.label;
                b.onclick = (function(type) { return function() { startExercise(type); }; })(t.key);
                btnContainer.appendChild(b);
            }
        });
        if (btnContainer.children.length === 0) btnContainer.innerHTML = emptyState('edit_off', 'Упражнений нет');
    } else {
        btnContainer.innerHTML = emptyState('edit_off', 'Упражнений нет', 'Для этого урока упражнения ещё не подготовлены');
    }
    document.getElementById('exerciseQuestion').innerHTML = '';

    // Карточки
    document.getElementById('flashcardContainer').innerHTML =
        '<div class="md-empty-state"><span class="msym">style</span>' +
        '<div class="md-title-medium">Карточки урока</div>' +
        '<div class="md-body-medium">Переворачивайте карточку и отмечайте, знаете ли вы слово</div></div>' +
        '<button class="menu-btn primary" onclick="startFlashcards()"><span class="msym">play_arrow</span>Начать карточки</button>';
    flashcardState = { words: [], index: 0, revealed: false, correct: 0, total: 0 };

    // Перевод
    let transContainer = document.getElementById('translationButtons');
    transContainer.innerHTML = '';
    if (data.translation) {
        let hasRu = data.translation.ru_to_el && data.translation.ru_to_el.length > 0;
        let hasEl = data.translation.el_to_ru && data.translation.el_to_ru.length > 0;
        if (hasRu) {
            let b = document.createElement('button');
            b.className = 'menu-btn primary';
            b.innerHTML = '<span class="msym">g_translate</span>Русский &rarr; греческий';
            b.onclick = function() { startTranslation('ru_to_el'); };
            transContainer.appendChild(b);
        }
        if (hasEl) {
            let b = document.createElement('button');
            b.className = 'menu-btn';
            b.innerHTML = '<span class="msym">translate</span>Греческий &rarr; русский';
            b.onclick = function() { startTranslation('el_to_ru'); };
            transContainer.appendChild(b);
        }
        if (!hasRu && !hasEl) transContainer.innerHTML = emptyState('translate', 'Упражнений на перевод нет');
    } else {
        transContainer.innerHTML = emptyState('translate', 'Упражнений на перевод нет');
    }
    document.getElementById('translationQuestion').innerHTML = '';

    // Переключаем на грамматику
    switchLessonPart('grammar');
}

// Индикатор вкладок скользит под активной вкладкой (M3 primary tabs)
function moveTabIndicator() {
    let bar = document.getElementById('lessonTabs');
    let ind = document.getElementById('lessonTabsIndicator');
    if (!bar || !ind) return;
    let active = bar.querySelector('button.active');
    if (!active) { ind.style.width = '0'; return; }
    ind.style.width = active.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + active.offsetLeft + 'px)';
    // держим активную вкладку в поле зрения (Element.scrollTo есть не везде)
    let left = Math.max(0, active.offsetLeft - (bar.clientWidth - active.offsetWidth) / 2);
    if (typeof bar.scrollTo === 'function') bar.scrollTo({ left: left, behavior: 'smooth' });
    else bar.scrollLeft = left;
}

// Возврат на экран урока восстанавливает выбранную вкладку
function restoreLessonPart() {
    let target = document.getElementById('part' + currentLessonPart.charAt(0).toUpperCase() + currentLessonPart.slice(1));
    if (target) target.classList.add('active');
    requestAnimationFrame(moveTabIndicator);
}

function switchLessonPart(part) {
    currentLessonPart = part;
    document.querySelectorAll('.tab-bar button').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    let activeTab = document.querySelector('.tab-bar button[data-part="' + part + '"]');
    if (activeTab) { activeTab.classList.add('active'); activeTab.setAttribute('aria-selected', 'true'); }
    moveTabIndicator();

    document.querySelectorAll('#lessonSection .section').forEach(s => s.classList.remove('active'));
    let target = document.getElementById('part' + part.charAt(0).toUpperCase() + part.slice(1));
    if (target) target.classList.add('active');

    if (part === 'flashcards' && flashcardState.words.length === 0) startFlashcards();
    if (part === 'translation') {
        let data = getLessonData(currentLesson);
        if (data.translation) {
            let hasRu = data.translation.ru_to_el && data.translation.ru_to_el.length > 0;
            let hasEl = data.translation.el_to_ru && data.translation.el_to_ru.length > 0;
            let container = document.getElementById('translationButtons');
            if (container.innerHTML.trim() === '') {
                if (hasRu) {
                    let b = document.createElement('button');
                    b.className = 'menu-btn primary';
                    b.innerHTML = '<span class="msym">g_translate</span>Русский &rarr; греческий';
                    b.onclick = function() { startTranslation('ru_to_el'); };
                    container.appendChild(b);
                }
                if (hasEl) {
                    let b = document.createElement('button');
                    b.className = 'menu-btn';
                    b.innerHTML = '<span class="msym">translate</span>Греческий &rarr; русский';
                    b.onclick = function() { startTranslation('el_to_ru'); };
                    container.appendChild(b);
                }
                if (!hasRu && !hasEl) container.innerHTML = emptyState('translate', 'Упражнений на перевод нет');
            }
        }
    }
}


// ============================================================
// НАВИГАЦИЯ МЕЖДУ УРОКАМИ
// ============================================================
  
function nextExercise() {
    exerciseState.index++;
    showExercise();
}

function nextTranslation() {
    translationState.index++;
    showTranslation();
}
    
function goToPrevLesson() {
    let prev = currentLesson - 1;
    if (prev < 1) {  // было prev < 3
        showToast('Это первый урок.');
        return;
    }
    let data = getLessonData(prev);
    if (!data) {
        showToast('Урок ' + prev + ' ещё не добавлен.');
        return;
    }
    openLesson(prev);
    updateNavButtons(prev);
}

function goToNextLesson() {
    let next = currentLesson + 1;
    if (next > 10) {
        showToast('Это последний урок (урок 10).');
        return;
    }
    let data = getLessonData(next);
    if (!data) {
        showToast('Урок ' + next + ' ещё не добавлен.');
        return;
    }
    openLesson(next);
    updateNavButtons(next);
}

function updateNavButtons(lesson) {
    let prevBtn = document.getElementById('prevLessonBtn');
    let nextBtn = document.getElementById('nextLessonBtn');
    
    if (prevBtn) prevBtn.disabled = (lesson <= 1);
    if (nextBtn) nextBtn.disabled = (lesson >= 10);
}

