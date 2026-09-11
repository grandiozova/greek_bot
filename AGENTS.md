# AGENTS.md

Guidance for AI agents working in this repository.

## What this repo is

**Anticus** — a biblical-languages learning web app, Ancient Greek and Biblical Hebrew, published to GitHub Pages. The name is the product name only; the repository, the Pages URL and the `greek_*` storage keys predate it and are unchanged.

| Part | Files | Notes |
|---|---|---|
| Markup shell | `index.html` | `<head>`, the screens, and the tag list that loads everything else. No logic, no styles, no data. |
| Styles | `styles/*.css` | The design system, seven files. See "Project layout". |
| Lesson content | `data/*.js` | Vocabulary, grammar, exercises, prayer, licences, the course registry. |
| Logic | `js/*.js` | Sixteen files, one per feature area. |
| Offline shell | `sw.js`, `manifest.webmanifest`, `icon.svg`, `icon-dark.svg` | Service worker + PWA metadata. Small, rarely touched — see "Offline shell" below. |
| Source textbooks | `reference/machen-nt-greek/`, `reference/nbbs-hebrew/` | The books the lessons come from, as text. Reference only — never loaded by the app. See "Source textbooks" below. |

The app hosts **two courses**, Greek and Hebrew, chosen on a start screen. `data/courses.js`
is the registry and `js/course.js` the switching; see "Courses" and "The Hebrew
course" below.

There is no backend and no build step. Progress is kept in `localStorage`. Do not add a server, a bundler, or new tracked secrets.

The split files are **classic scripts and plain stylesheets**, deliberately not ES modules: the ~80 inline `onclick=` handlers, in `index.html` and in generated markup alike, need their functions to stay global, and `type="module"` / `fetch()` are both blocked on `file://`, which would break "clone and open `index.html`". Keep it that way unless you first replace the inline handlers with delegation.

All user-facing copy is **Russian**. Greek content is **polytonic** (accents, breathings, iota subscript — `ᾅ`, `ὥρᾳ`, `ἡμῶν`). Never "normalise" or strip Greek diacritics; they are the subject matter.

## How to work here

The rest of this file is *what* the code is. This section is *how* to change it without
breaking something you did not look at.

### Before editing

1. **Find the section of this file that covers your task and read it.** The task table
   under "Project layout" names the file; the sections below it name the traps. Most
   bugs this repo has had were an invariant written down here and not read.
2. **Run `npm test` first** (215 tests, ~30 s). A failure afterwards is then known to be
   yours. If the baseline is already red, say so before you start.
3. **Read the code directly.** There are about thirty source files and every function is
   global, so Grep for the name and Read the file. `reference/` is the large part — enter
   it through its `INDEX.md`, not a repo-wide search.

### Subagents

**Work inline by default.** A subagent starts cold and has to re-read this file to work
safely, and most tasks touch one or two files, so spawning usually costs more than it saves.
Spawn one only when:

- **A read-only sweep** where only the conclusion matters: "which lessons use X", "where
  in the textbook is Y taught".
- **Independent verification in parallel**: checking lesson data against `reference/`,
  one agent per range of lessons or chapters, each told to **report, not edit**.
- **A second opinion** on a large diff before it is reported as done.

Never let two agents edit the same file at once. `data/lessons.js` and
`data/hebrew-lessons.js` are single large files, so concurrent edits clobber each other.
A subagent's brief must name the sections of this file that apply, restate the
no-normalisation rule for Greek and Hebrew, and say "do not commit".

### Large features go in phases

The Hebrew course went in as phases 0–5, one commit each. Do the same for anything bigger
than an afternoon:

- **Phase 0 is groundwork with no visible change**, for example a registry or an extracted
  helper. Its test is that nothing moved.
- **Every phase leaves the app working and `npm test` green.** Nothing lands half-wired.
- **Every phase updates its own docs and plumbing in the same commit**: this file,
  `tests/README.md`, a new test, `CORE_ASSETS`/`CACHE_VERSION`, `data/licenses.js`. Do not
  save them for a clean-up at the end, because they get lost.

### Things that live in more than one place

Missing one of these edits causes most of the bugs, and several of them are invisible in an
online test. When you add:

| You add… | Also change |
|---|---|
| a file in `styles/`, `data/`, `js/` | its tag in `index.html` **in the right place** (see load order) + `CORE_ASSETS` in `sw.js` + bump `CACHE_VERSION` |
| an icon | `icon_names=` on the fonts `<link>` |
| a screen | markup + `SCREEN_META` / `DEST_SECTION` / `FAB_CONFIG` |
| an exercise kind | `EXERCISE_TYPES` + `LESSON_DRILL_GROUPS` and/or `TEST_TYPES` |
| a colour role | `:root`, `[data-theme="dark"]` **and** `[data-theme="sepia"]` |
| a part-of-speech `type` | `VOCAB_TYPE_ORDER` + `TYPE_LABELS` |
| a cache that spans screens | a reset in `applyCourse()` |
| a dependency, font or asset | an entry in `data/licenses.js` |
| a test file | a row in the `tests/README.md` table |

### Content

- **Leave `data/*.js` alone unless the task is explicitly about content.**
- **Copy studied-language strings out of `reference/`; never retype them.** A retyped Hebrew
  word can look identical and still be a different string. A retyped Greek word can lose a
  breathing. Check any Greek word against `restoration-report.md` before trusting it.
- **Do not NFC-normalise, trim diacritics or "clean up" Unicode**, whether by hand or with a
  script.

### Finishing

- **Report what you verified and what you did not.** `npm test` covers behaviour. Contrast,
  rendering and offline have no harness (see "Verify before reporting done"). If you
  changed how something looks and did not screenshot it, say so. Do not imply you did.
- **Keep this file current in the same change.** When you settle a decision or find an
  invariant that was not obvious, write it here with the reason. The *why* is what stops
  the next agent from re-litigating it.
- **Git:** commit or push only when asked. Write commit messages in Russian, as one short
  line in the style of the log ("Интеграция иврита в приложение, фаза 3", "Исправлены
  опечатки."). **No AI attribution anywhere**: no `Co-Authored-By` trailer and no mention
  of the assistant in commits or PR descriptions, even if your tooling adds one by
  default. The repository's history is its authors'.

## Project layout

```
index.html           338  <head>, разметка, порядок загрузки
styles/
  tokens.css           280  :root, [data-theme=dark], [data-theme=sepia] и [data-script] — все переменные
  base.css             350  сброс, типографика, метки языка (.script/.greek/.hebrew), каркас, app bar, icon button, nav bar, FAB, ripple
  components.css       777  кнопки, list item урока, карточки, табы, search bar, text field, chips
  screens.css          862  вопрос/варианты, обратная связь, списки слов, таблицы и их прокрутка, ритм материала, flashcards и их оборот, статистика, «Отче наш», стартовый экран выбора курса
  dialogs.css           88  snackbar, dialog
  layout.css            64  переходы экранов, утилиты, адаптивность (nav rail)
  settings.css         156  segmented button темы и курса, карточка курса, список лицензий
data/
  lessons.js         1,812  const LESSONS_DATA (греческий курс) и GREEK_ALPHABET — пул букв для уроков 1–2
  hebrew-lessons.js    872  const HEBREW_LESSONS_DATA — главы 1–11: грамматика, словарь, упражнения; HEBREW_ALPHABET — пул букв и огласовок
  prayer.js            136  const PRAYER_DATA
  licenses.js           49  const LICENSES
  courses.js            94  const COURSES/COURSE_ORDER — реестр курсов, грузится последним из data/
tests/                    jsdom-набор, `npm test` — см. tests/README.md
js/
  core.js              171  состояние, shuffle/escHtml/escArg, keywordsMatch, isScriptText, scheduleAdvance, localStorage
  course.js            253  текущий курс, ключи хранилища, письмо, алфавит курса, стартовый экран, переключение курса
  ui.js                 92  ripple, showToast, mdDialog, progressHead, emptyState, resultBlock
  shell.js             238  SCREEN_META/DEST_SECTION/FAB_CONFIG, showSection, navigateTo, renderMainMenu
  theme.js             108  режимы темы, applyTheme, иконка вкладки по теме, initTheme
  lesson.js            544  openLesson, меню разделов урока, вкладки, свайп, экран упражнения, разметка грамматики
  declension.js        197  парадигма как описание осей, отрисовка таблицы, перебор ячеек
  exercises.js         513  EXERCISE_TYPES — список видов упражнений, отрисовка вопроса, проверка ответа
  flashcards.js        375  карточки: общие и урока, оборот карточки с тренировкой форм
  test.js              193  тест
  translation.js       230  перевод
  stats.js             107  статистика, ошибки, сброс прогресса
  prayer.js            237  «Отче наш»: разбор и упражнения
  vocab.js             435  общий словарь, поиск, фильтр по частям речи
  settings.js           28  showSettings, renderLicenses
  boot.js               77  normalizeTranslationData, init*, глобальные слушатели
```

**Load order is the contract.** Three rules, all enforced only by the order of tags in `index.html`:

1. `tokens.css` first — everything else reads its variables. The other six stylesheets are listed in the order their rules appeared in the old single `<style>`, so the cascade is unchanged; reordering the `<link>` tags is a silent visual regression.
2. `data/*.js` before `js/*.js` — the logic reads the lesson data during boot. Within `data/`, **`courses.js` comes last**: the registry references the objects the other data files declare, so it must see them already bound.
3. **`boot.js` last.** It is the only file that *executes* anything at load time; every other file just declares. Top-level `let`/`const` across classic scripts share one global lexical environment, so a file that ran code referencing a binding declared in a later file would hit a temporal-dead-zone `ReferenceError`. Keep new files declaration-only, and keep `boot.js` at the bottom.

The two exceptions to "declaration-only" are `ui.js` (the ripple `pointerdown`/`keydown` listeners) and `prayer.js` (the click-outside handler); both only register callbacks, which run long after every script has loaded.

Whatever you touch, it is almost always one file:

| Task | File |
|---|---|
| Colours, shape, motion, elevation | `styles/tokens.css` |
| A component's look | `styles/components.css` (or `dialogs.css` / `settings.css`) |
| A screen's look | `styles/screens.css` |
| Responsive / nav rail | `styles/layout.css` |
| **Lesson content** | `data/lessons.js` (Greek) / `data/hebrew-lessons.js` (Hebrew) — **do not touch** unless the task is explicitly about content |
| Letters, sounds, alphabet drill questions | `GREEK_ALPHABET` / `HEBREW_ALPHABET` in the same two files — see "Alphabet and reading" |
| Finding content in the textbook | `reference/machen-nt-greek/INDEX.md` or `reference/nbbs-hebrew/INDEX.md` — then the lesson file it points to |
| A new dependency's licence | `data/licenses.js` |
| Behaviour | the matching `js/*.js` — the table above says which |
| A new screen | `index.html` markup **+** `SCREEN_META`/`DEST_SECTION`/`FAB_CONFIG` in `js/shell.js` |
| A course, or a fact that varies by course | `data/courses.js` — see "Courses" |

Structural facts worth knowing before editing:

- Screens are `div.section`; `showSection(id)` (`js/shell.js`) clears `.active` from **all** `.section` elements, including the lesson's inner tab panels — which is why `restoreLessonPart()` (`js/lesson.js`) exists. Keep that invariant if you touch navigation.
- **The lesson is three levels deep, not one.** Opening a lesson lands on `#partMenu` — its sections offered as a list of M3 list items (`renderLessonMenu()`), not on the material. Choosing one calls `switchLessonPart()`, which reveals the tab bar; `#lessonTabs` carries `.hidden` while the part is `'menu'`, so the tabs exist only inside a section, where there is something to switch between. The part names map to panel ids by capitalisation (`material` → `partMaterial`, `menu` → `partMenu`), which is what `switchLessonPart()` and `restoreLessonPart()` rely on, and `'menu'` is a part like any other — that is why `currentLessonPart` starts as `'menu'`. Back is a step **up**, not out: `goBack()` (`js/shell.js`) turns a section back into the menu, and only from the menu does it leave for the lesson list.
- **`#partMaterial` holds the grammar card with the lesson's vocabulary card under it; `#partExercise` holds only the list of drills.** A drill is one entry in `LESSON_DRILL_GROUPS` (`js/lesson.js`) with a `kind` that says what runs it and where it draws: `exercise` → `startExercise()` into `#exerciseQuestion`, `translation` → `startTranslation()` into `#translationQuestion`, `flashcards` → `startFlashcards()` into `#flashcardContainer`. Those three containers live on **`#drillSection`, a screen of its own** — a chosen drill is a page, not a card appended under the list. `startLessonDrill()` shows the one container the chosen drill needs, clears the other two and calls `showSection('drillSection')`, so the three renderers keep their own ids and none of them had to change; `closeLessonDrill()` is the way back, and every drill's result block offers it. The app bar titles that screen from `currentDrill.label`, which is why `currentDrill` holds the drill **object**. Adding a drill means one entry in that catalogue — plus an availability rule in `lessonDrillAvailable()` if it is not an `exercises`/`translation` key.
- **The grammar in `data/lessons.js` is a `<br>`-separated stream, and the app does not render it raw.** In the data, paragraphs are separated by pairs of `<br>`, a section heading is a line that is nothing but `<b>…</b>`, and a list is *either* lines starting with `•` *or* a real `<ul>` (lesson 5 is the one that uses tags). That shape makes vertical rhythm a function of how many `<br>` someone typed, and it puts a wrapped bullet's second line under the marker. `renderGrammarHtml()` (`js/lesson.js`) rebuilds it into real blocks at render time — `.grammar-h`, `.grammar-p`, `.grammar-list` — so spacing comes from CSS instead. It changes markup only, never text; `<b>Примечание:</b> …` with the sentence continuing on the same line stays a paragraph, which is why the heading test requires the bold element to span the **whole** line. Fix grammar spacing here or in `screens.css`, **not** by editing `<br>` runs in the content.
- **`<table>`, `<ul>` and `<ol>` are lifted out of the stream before it is split** (`GRAMMAR_LIFT_RE` → placeholders → `grammarLiftedHtml()`). Two reasons, and both bite: `<br>` and `•` mean nothing inside them, and — the subtler one — a native `<ul>` in the source has no `<br>` around it, so without lifting, the paragraph before it, the list, and the paragraph after it all collapse into one `.grammar-p` with no spacing between them, and the `<ul>` never gets `.grammar-list`, which drops it through to the global `* { margin: 0; padding: 0 }` reset with no indent at all. A lifted table comes back wrapped in `.md-table-scroll`; a lifted list comes back carrying `.grammar-list`, the same class the `•` form produces. The lift regex is non-nesting — a list inside a list would break it, and there are none.
- **A table wider than the screen scrolls inside its own strip; the page never scrolls sideways.** Every table sits in `.md-table-scroll` (`overflow-x: auto` plus `overscroll-behavior-x: contain`, so the gesture does not chain to the page), and `body` has `overflow-x: clip` as the backstop — `clip` rather than `hidden` because `hidden` would make `body` a scroll container and break the `window.scrollY` the app bar reads. Inside the strip the table is `width: auto; min-width: 100%` and its cells are `white-space: nowrap`: squeezing columns to fit would inflate a row to three lines because of a «Перевод» column that is off-screen anyway. All cells are left-aligned. If you add a table anywhere, wrap it.
- **Horizontal swipe switches lesson sections on touch screens.** `initLessonSwipe()` (`js/lesson.js`, called from `boot.js`) listens on `#lessonSection`. The row it moves along is **the tab bar itself** — `lessonSwipeTabs()` reads the visible `#lessonTabs` buttons in markup order, so «Тест» is in it too, and intro lessons (whose exercise and test tabs are hidden via `style.display` — none at present, see `introLessons`) have nothing to swipe to. `swipeLessonPart()` ends by **clicking the tab it landed on** rather than calling `switchLessonPart()` directly: the test tab carries `startTest()`, not a panel switch, and a swipe must do exactly what a tap on that tab does. That is the whole reason the row is derived from the DOM instead of a list of part names — a hardcoded list silently drops any tab that is an action rather than a panel. A gesture is ignored when it is short, more vertical than horizontal, multi-touch, or started inside something that scrolls sideways itself (`SWIPE_BLOCKERS` — declension tables, the tab bar, chip rows, inputs). Both ends of the row are dead ends; the gesture never wraps.
- `SCREEN_META`, `DEST_SECTION` and `FAB_CONFIG` (`js/shell.js`) drive the app bar title, back button, active nav destination and contextual FAB. Adding a screen means adding entries there, not just markup.
- Functions call freely across files — they are all globals on `window`, and every file is loaded before anything runs. There is no import graph to keep in sync; the only ordering rule is the one about `boot.js` above.
- Top-level `let` and `const` bindings — state (`stats`, `testState`, `allFlashcardState`, …) *and* the data (`LESSONS_DATA`, `PRAYER_DATA`, `LICENSES`) — are **not** on `window`; splitting the data into their own files did not change this, because `const` at the top level of a classic script never creates a window property. `function` declarations *are* on `window`. So a harness can call `window.openLesson(3)` but must reach data through `window.eval('LESSONS_DATA')`. Test through the DOM, not through `window.someState`.
- **Формы слова тренируются на обороте карточки, а не отдельным упражнением.** `declension_fill` больше не значится в `LESSON_DRILL_GROUPS`: круглая кнопка в углу карточки (появляется только после «Показать перевод») переворачивает её и запускает тот же вопрос о форме с теми же `.option-btn`. Вопросы собирает `cardDeclensionQuestions()` (`js/flashcards.js`) из двух источников — авторских `exercises.declension_fill` урока про это же слово (их дистракторы продуманы вручную, и их же берёт «Тест», поэтому данные не осиротели) и остальной парадигмы из `declension_forms`. Ключи генерируемых форм намеренно совпадают с авторскими (`gen_sg`, `2pl`, `nom_pl_m`, `dat_sg_f`), иначе один и тот же падеж попадёт в колоду дважды. Результат кешируется в `word._declQuestions` — тем же приёмом, что `entry._examples`. Ответ перерисовывает только `#cardDeclension`, а не всю карточку: иначе анимация переворота проигрывалась бы на каждый вариант.
- **The dictionary and the flashcards share one cache.** `buildAllVocabCache()` (`js/vocab.js`) collects the vocabulary of every lesson ≥ `VOCAB_FIRST_LESSON` (lesson 1 is the letter names, not words), de-duplicates it and serves both screens; `startAllFlashcards(type)` builds its deck from there, not from `LESSONS_DATA` directly. A card and a dictionary entry are therefore literally the same object — which is why `findUsageExamples()` caches the full set in `entry._examples` and slices it, instead of caching whatever count the first caller asked for.
- **Part of speech is a filter, not just a heading.** `item.type` in `data/lessons.js` drives the dictionary's section headings, the `.filter-chip` row above both screens, and which words go into a flashcard deck. The permitted values are listed in `VOCAB_TYPE_ORDER` and `TYPE_LABELS` (`js/vocab.js`): `noun`, `verb`, `adjective`, `pronoun`, `adverb`, `preposition`, `conjunction`, `particle`, `article`, `other`. A new type must go into both lists, or its words fall into «Прочее» and get no chip.
- Progress is `localStorage` only, and the keys are **per course**: `courseKey('stats')` and `courseKey('last_lesson')` resolve to `greek_stats` / `hebrew_last_lesson` and so on. Genuinely global settings take an `app_` prefix instead — `app_theme`, `app_course`, `app_default_course`. Never hard-code a course's key. See "Courses". All reads/writes must stay wrapped in `try/catch` — they throw in private-mode Safari.

## Design: Material 3 (Material You) — mandatory

**Follow the current Material 3 / Material You specification strictly at all times, unless the user directly instructs otherwise in that request.** A user preference expressed for one element does not license abandoning the system elsewhere. When the spec and a local habit disagree, the spec wins. Reference: <https://m3.material.io>.

The app is already a full M3 implementation. Extend it; do not reintroduce ad-hoc styling.

### Non-negotiables

1. **No hard-coded colors.** Not in CSS, not in inline `style=`, not in JS-generated markup strings. Every color is `var(--md-sys-color-*)` or `var(--md-extended-color-*)`. A literal hex anywhere outside the theme blocks in `styles/tokens.css` is a bug — this codebase had ~20 of them and dark mode was broken everywhere as a result. The only permitted literals are the two bootstrap `<meta name="theme-color">` tags, which must paint before CSS loads; keep them in sync with `surface` in the light and dark schemes. Sepia gets none: it is a manual choice, not a system preference, and nothing knows about it before JS runs — `applyTheme()` then removes all of them and writes one from the token. Where JS needs a color it reads the token — see `applyTheme()`, which pulls `--md-sys-color-surface` via `getComputedStyle` rather than repeating the hex. The other exception is the two app icons. An SVG loaded as an icon never sees the page's CSS, so its colours are written into the file. `icon.svg` is the light one. `icon-dark.svg` uses the dark scheme's `primary-container` / `on-primary-container`, the dark FAB's pair, so change it with that pair. Its geometry and its Ω (U+03A9, not the look-alike ohm sign U+2126) are copied from `icon.svg`, so keep the two in step. The tab icon follows the theme the same way `theme-color` does. `<head>` carries a `media` variant per system scheme for the moment before JS runs. `applyThemeIcon()` then leaves a single link chosen by the app's own theme: the dark icon for dark, the light one for light and sepia.
2. **Always use the `on-` pair.** `background: primary-container` requires `color: on-primary-container`. Never mix roles across pairs.
3. **All three themes, always.** Any new role goes into `:root`, `[data-theme="dark"]` *and* `[data-theme="sepia"]`. Never ship a token defined in only some of them. The exception is a role a scheme inherits unchanged from `:root` — `shadow`, `scrim` and the elevation levels are correct for both light schemes, so dark overrides the elevations and sepia overrides nothing; anything else missing is a bug, not an inheritance.
4. **Spacing on a 4dp grid**, shape from the shape scale, motion from the motion tokens. No arbitrary `border-radius: 7px` or `transition: 0.15s ease`.
5. **Touch targets ≥ 48×48dp**, even when the visual element is smaller.
6. **State layers on everything interactive** — hover 8%, focus 10%, pressed 10%, via the `::before` overlay pattern used throughout, plus ripple (`RIPPLE_TARGETS`).
7. **Respect `prefers-reduced-motion`.** The global reduce block exists; do not add animations that bypass it. It cannot reach script-driven scrolling: `behavior: 'smooth'` passed to `scrollTo()` overrides any CSS. So every scroll from JS takes its behaviour from `scrollBehavior()` (or `scrollPageTop()`) in `js/ui.js`; never write `'smooth'` literally. `shell.test.js` checks both settings.

### Token vocabulary

Defined in the `:root`, `[data-theme="dark"]` and `[data-theme="sepia"]` blocks. Use these names, add new ones only when a genuine M3 role is missing.

- Color: `primary`, `secondary`, `tertiary`, `error` (each with `on-*`, `*-container`, `on-*-container`); `surface`, `surface-dim`, `surface-bright`, `surface-container-lowest|low|<base>|high|highest`, `on-surface`, `on-surface-variant`, `outline`, `outline-variant`, `inverse-surface`, `inverse-on-surface`, `inverse-primary`, `shadow`, `scrim`.
- Custom extended color: `--md-extended-color-success*` — correct answers. Errors use the standard `error` role.
- Shape: `--md-sys-shape-corner-none … -full`.
- Motion: `--md-sys-motion-easing-*` (emphasized, standard, and their accelerate/decelerate variants) and `--md-sys-motion-duration-short1 … long4`.
- Elevation: `--md-sys-elevation-level0 … level5`.
- Typography: the `.md-display-*` / `.md-headline-*` / `.md-title-*` / `.md-body-*` / `.md-label-*` classes.

Surface-role conventions in this app: page background `surface`; filled cards `surface-container`; anything nested inside a card `surface-container-high`; tables and the sentence-building area `surface-container-lowest`; nav bar and scrolled app bar `surface-container`. `card--elevated` is `surface-container-low` **plus** a shadow — that pairing is the whole point of the elevated variant, so never use that tone flat.

### Component mapping

Legacy class names were kept to avoid rewriting every generated HTML string. They implement real M3 components — treat the M3 semantics as the contract:

| Class | M3 component |
|---|---|
| `.menu-btn` | filled tonal button (`.primary` filled, `.outlined`, `.text`, `.elevated`, `.danger` error-tonal, `.danger-outlined`) |
| `.card` | filled card |
| `.option-btn` | outlined button with `correct` / `wrong` answer states |
| `.word-bank .chip` | suggestion chip |
| `.filter-chip` | filter chip (ряд `.chip-set` над словарём и карточками) |
| `.tab-bar` | scrollable primary tabs with sliding indicator (`moveTabIndicator()`) |
| `.search-box` | search bar |
| `.input-group input` | outlined text field |
| `.word-item` | list item, expandable |
| `.md-snackbar` / `.md-scrim` + `.md-dialog` | snackbar / basic dialog |

Use `showToast(msg, icon)` and `mdDialog({...})`. **Never** `alert()`, `confirm()` or `prompt()` — they are not Material and were deliberately removed.

### Adaptive layout

Window size classes drive navigation: bottom **navigation bar** in compact, **navigation rail** at ≥905px (same DOM, CSS-only transform in the `min-width: 905px` block). If you add a destination, verify both.

### Typography

- UI: **Noto Sans** (`--md-ref-typeface-plain`).
- The language being studied: **`--md-ref-typeface-script`** — Noto Serif for Greek, **Noto Serif Hebrew** for Hebrew (the Greek serif has no Hebrew glyph at all, let alone niqqud). The token resolves per course; the two raw faces stay available as `--md-ref-typeface-greek` / `--md-ref-typeface-hebrew`. Applied *only* where that language is the object of study — headwords, flashcards, chips and tokens, prayer text, and answer options via `.options--script`. Russian UI text never gets the serif; a rule outside `tokens.css`/`base.css` that names `--md-ref-typeface-greek` directly is a bug, and `tests/rtl.test.js` fails on it.
- Mark studied-language text inside a Russian sentence with `<span class="script">`, not `<b>` — see "Writing direction" below.
- Icons are **Material Symbols Rounded** (`<span class="msym">name</span>`). No emoji in the interface.
- The icon font is **subsetted** via the `icon_names=` parameter on the Google Fonts `<link>` in `<head>`. The full family is 5.4 MB and loads with `display=block`, so the whole UI sits iconless until it arrives; the subset carries only the icons actually used and downloads in a fraction of that. **Adding an icon means adding its ligature name to that list** — otherwise it renders as raw text (`menu_book`) instead of a glyph. Sweep the rendered DOM for `.msym` text to regenerate the list rather than editing it by hand.

## Settings screen

`settingsSection` is the fifth navigation destination and the home for anything that is not study content: theme, data management, licenses.

- **Course** is the first card: which course is open, a button back to the start screen, and `app_default_course` — whether the start screen asks on every load or drops straight into one course.
- **Theme** is a four-way choice — `system` / `light` / `dark` / `sepia` — stored in `app_theme` as the *mode*, never as the resolved colour. `sepia` is a warm light scheme built on the same M3 tone map as `:root`, not a filter over it. Storing the resolved value is what breaks "follow the system": the app would pin whatever the OS happened to be on first run. `system` stays live via a `matchMedia` listener. A value written by an older build (`light`/`dark`) is still read as a valid manual choice, and the pre-courses key `greek_theme` is read as a fallback and migrated forward once.
- **Licenses** come from the `LICENSES` array; add an entry when you add a dependency. Only the middle of that list is open licences: the app's own code is first and is all-rights-reserved (see `LICENSE`), and the course materials are last as their holders' copyright. Both are statements, not licences, and carry no `url`.
- The nav bar now holds **five** destinations — the M3 maximum. A sixth needs a different pattern, not a sixth item. That is exactly why the course picker is a full-screen overlay rather than a destination.

## Source textbooks

There are two, one per course. Both are **reference material only**: nothing under
`reference/` is loaded by the app, precached by `sw.js`, or listed in `index.html` —
do not wire it in.

### Greek — `reference/machen-nt-greek/`

`reference/machen-nt-greek/` holds the book the lessons are built from — Machen's
*New Testament Greek for Beginners* in the Russian Bible Society edition (33 lessons,
241 pages), extracted from its PDF as Markdown plus two JSON vocabulary files.
Start at `reference/machen-nt-greek/INDEX.md`; the rules are in its `README.md`.

The Greek there **is polytonic and can be copied** — but check one thing first.
The source PDF is a scan whose OCR layer had lost every breathing and circumflex;
the marks were restored by re-OCRing the 600-dpi page images with an ancient-Greek
model and accepting a form only where two independent readings agreed. That covers
13 560 of 14 267 Greek words (95%). The remaining 707 are left in their original,
accent-less form and are all listed in `reference/machen-nt-greek/restoration-report.md`.

So: if a word is not in that report, its polytonic form is verified — use it. If it is,
restore the form yourself (against NA28/SBLGNT, or the verified lessons 1–10 already in
`data/lessons.js`). A vowel-initial word with no breathing is always unverified — that
is the visible tell. Russian text, page numbers and structure are reliable throughout.

### Hebrew — `reference/nbbs-hebrew/`

`reference/nbbs-hebrew/` holds the Novosibirsk Biblical Theological Seminary's
*Учебное пособие по грамматике древнееврейского языка* (2011, after Pratico &
Van Pelt's *Basics of Biblical Hebrew Grammar*; 273 pages, 36 chapters).
**Chapters 1–11 are transcribed** — the whole nominal system, up to the verb.
Start at `reference/nbbs-hebrew/INDEX.md`.

Unlike the Greek, this was never OCR'd. The PDF stores Hebrew in the **BWHEBB**
legacy font encoding — Latin characters that a font draws as Hebrew glyphs, so
דָּבָר is stored as `rb'D"`. That mapping is reversible and lossless, and
`tools/unfont.py` applies it mechanically. **So the Hebrew forms can be copied as
they stand**; there is no per-word verification list, because nothing was guessed.

Two things to know before copying:

- **Never NFC-normalise the Hebrew.** Canonical ordering sorts combining marks by
  class and puts the vowel *before* the dagesh — which matches neither BHS nor the
  Leningrad Codex, and some fonts render it wrong. The decoder deliberately emits
  consonant → dagesh → shin/sin dot → vowel → meteg → accent and leaves it there.
  Same rule as the Greek diacritics, with a concrete cost if broken.
- **The weak link is the hand transcription**, not the decoding. `unfont.py --audit`
  flags glyphs missing from the table, which catches impossible input (it found a
  Cyrillic `а` typed for a Latin `a`); it cannot catch one *valid* glyph typed for
  another. Verify against the Westminster Leningrad Codex anything that goes into
  a drill. See `reference/nbbs-hebrew/restoration-report.md`.

## The Hebrew course

Scope is a pilot of **chapters 1–11**, the nominal system; the verb (chapters 12–36) is
out of scope. All eleven chapters are authored in `data/hebrew-lessons.js` — grammar,
163 dictionary entries ordered by the textbook's own Hebrew-Bible frequency, drills for
every `heb_*` type, and sentence-building where the book prints sentences. That file
carries the field-by-field authoring guide; follow it rather than inferring the shape
from a neighbouring entry.

Chapters 1–2 are the alphabet and the vowel points, and they now carry drills like
every other chapter — see "Alphabet and reading". Chapter 9 has drills but no
dictionary — the book gives it no vocabulary section. Neither is a gap to fill.

**The one thing to know before editing this data**: 220 of the Hebrew strings written by
hand were byte-wrong on the first pass, and none of it was visible. Hebrew combining
marks have no canonical order — the textbook writes dagesh before the vowel
(`תּ` = 05EA 05BC 05B8), and typing the same glyph naturally produces the reverse
(05EA 05B8 05BC). Identical on screen, different strings to every search and comparison.
This is exactly the failure `restoration-report.md` says the decoding audit cannot catch.
`tests/hebrew-content.test.js` catches it mechanically: every Hebrew token in the lesson
data must occur verbatim somewhere in `reference/nbbs-hebrew/`. **Do not "fix" a failure
from that test by retyping the word** — copy it out of the reference, or the same
reordering comes back.

One decision already settled in the data, so it does not get re-litigated: **`אֵת`
occurs twice in chapter 6 as two different words.** The dictionary forbids duplicate
headwords, so the preposition sense is folded into a comment and only the object-marker
entry ships. It is not a missing entry.

## Exercise types

**`EXERCISE_TYPES` in `js/exercises.js` is the list of drill kinds.** An entry says how
one kind is asked — the question text, where the options come from, and whether those
options are in the studied language. `choiceQuestionHtml()` renders from it, and both
the lesson drill (`showExercise`) and the lesson test (`showTest`) call it with their
own answer handler. A new kind is an entry in that table, not a branch.

- **A kind lives in three lists**, and forgetting one is the usual bug: `EXERCISE_TYPES`
  (how it is drawn), `LESSON_DRILL_GROUPS` in `js/lesson.js` (its label, icon and place
  in the menu) and `TEST_TYPES` in `js/test.js` (whether the lesson test may ask it).
  `tests/drills.test.js` checks that every declared kind is reachable from at least one
  of the last two, and that nothing in them is undeclared.
- **Two kinds are not multiple choice** — `translate_greek_to_russian` (a text field)
  and `translate_russian_to_greek` (a word bank). Their markup differs between the drill
  screen and the test screen (different element ids, different handlers), so there is no
  shared code to extract; they are declared `custom: true` and drawn by the caller.
- **A typed Russian answer is checked with `keywordsMatch()` (`js/core.js`), never by a
  raw substring.** Keywords are written like dictionary entries — «почему?», «(домашнее)
  животное», «локоть (мера длины)» — and nobody types the brackets or the question mark.
  Both sides are reduced to bare words: parenthetical glosses dropped, punctuation and
  case ignored, ё = е. The data is not rewritten; only the comparison is. This applies to
  the Russian answer only; the studied-language text is never folded.
- **Extra chips in the sentence drills are words, not dictionary entries.** They come from
  the lesson's vocabulary through `headwordChip()` / `glossChips()` (`js/translation.js`),
  which keep the headword without its gender endings or labels («ἀγαθός, ή, όν» → ἀγαθός,
  «ἔρχομαι (dep.)» → ἔρχομαι) and each gloss separately without its brackets. Taken raw,
  they put «-ее)» and «(с Acc.)» into the word bank and made the wrong chips obvious.
  Parentheses attached to a word are movable ν (λύουσι(ν)) and are kept.
- **Options are either a fixed array or derived from the question.** Fixed sets — «Немое»
  / «Произносимое» шва and the like — live in the table so the author does not retype
  them per question; the question's `correct` must then match one of them exactly, which
  a test enforces across every course's data.
- **When the options are derived, they are derived by `otherValues()` — which never
  returns the correct value.** It hands back look-alikes at an even stride through the
  pool (so neighbouring letters show up among the distractors, which is the point), and
  the kind must therefore put the right answer in **first**:
  `options: q => [q.correct].concat(otherValues(…, q.correct, 3))`. Forgetting the
  prefix produces a question whose answer is not on screen — a perfectly normal-looking
  question you can only fail. All nine alphabet kinds that derive options had this bug
  at once; `tests/alphabet.test.js` now checks every question of every alphabet kind for
  it, by calling `exerciseOptions()`.
- **Keys name the concept, not the language, when the concept is shared.** `agreement`,
  `translate_*` and `article_fill` are used by both courses — Hebrew's article question
  is the same question, just with `הָ`/`הַ`/`הֶ` as the forms. So are the four
  `letter_*` kinds both courses answer (`letter_name`, `letter_from_name`,
  `letter_sound`, `letter_order`). Kinds that exist only in
  the Hebrew course are prefixed `heb_`: `heb_vowel_name`, `heb_vowel_fill`, `heb_shva`,
  `heb_dagesh`, `heb_qamets`, `heb_gender_number`, `heb_begadkefat`, `heb_syllables`,
  `heb_gutturals`, `heb_construct`, `heb_suffix_type`, plus the alphabet's
  `heb_letter_translit`, `heb_letter_final` and `heb_letter_guttural`. Hebrew has no
  cases, so `heb_gender_number` is its own kind rather than a reuse of Greek's
  `case_number`, which is labelled «Падеж и число». The prefix is a convention for
  readers; no code parses it.
- **A group with nothing available is not drawn.** That is what keeps the phonology
  group («Огласовка и чтение») off Greek lesson screens without any branching on course.
- **Do not put the answer in the question.** `heb_construct` and `heb_suffix_type` carry
  a translation in the data and deliberately do not show it: «его кони» announces the
  number, «(этот) голос (этого) человека» announces the definiteness.

## Alphabet and reading

The first lesson of each course has no words in it: Greek lesson 1 and Hebrew chapter 1
are the letters, and the lesson after them is the reading rules (Greek: diphthongs,
breathings, accents; Hebrew: the vowel points). Those two units per course are now
drilled like any other material — fifteen kinds exist for them.

**The letters live in a pool per course, not in the questions.** `GREEK_ALPHABET`
(`data/lessons.js`) and `HEBREW_ALPHABET` (`data/hebrew-lessons.js`) hold the letters
once with everything there is to ask about them; the kinds build both the question and
the wrong answers out of it. Writing the alphabet out per question would have been four
copies of the same table, and they would have drifted.

| Pool | Fields |
|---|---|
| `GREEK_ALPHABET` | `letters` ×24 — `{letter, upper, name, sound}`; `diphthongs` ×8 — `{diphthong, sound}`; `breathings` ×6 — `{sign, correct}`; `accents` ×9 — `{sign, correct}` |
| `HEBREW_ALPHABET` | `letters` ×22 — `{letter, name, translit, sound}`; `finals` ×5 — `{letter, final}`; `vowels` ×15 — `{sign, name, sound}` |

- **`courseAlphabet()` (`js/course.js`) is the only way to the pool** — `COURSES.greek.alphabet`
  is not. Same rule as `courseLessons()`.
- **A pool holds only what the course has, and that absence is load-bearing.** Greek has
  no `finals`/`vowels` fields and Hebrew has no `upper`/`diphthongs`/`breathings`/`accents`
  (asserted as `undefined`, not as empty arrays). A kind whose questions can only be built
  from a field the course does not have simply has no questions there, so the phonology
  group never appears on a Greek lesson screen — no branching on course anywhere.
- **`letter_order` asks what comes next, so the last letter is not asked about.**
  `alphabetSuccessor()` returns the letter after the one in the question, and `''` for the
  last; the authored questions are `letters.slice(0, -1)`, which a test checks against the
  pool rather than trusting.
- **`script` may be a function of the question, not of the kind.** «Как называется эта
  буква?» is one question in both courses, but its options are Greek names (`ἄλφα`) in one
  and Russian ones (`а́леф`) in the other, so `letter_name` computes `script` from
  `isScriptText(q.name)`. `letter_from_name` is the mirror image and can be constant: the
  options are always letters.
- **The line under the question is set from its own content, not from the course.**
  `choiceQuestionHtml()` picks `.md-prompt-strong` when `isScriptText(subject)` and
  `.md-prompt-ru` otherwise, because the subject is sometimes the letter (`בּ`) and
  sometimes its Russian name (`а́леф`) — within one kind, in one course. `.script` on the
  *options* still comes from the kind or the question, as everywhere else.
- **The tables in the textbook's grammar are the source of truth for the pool.**
  `tests/alphabet.test.js` re-derives the pool from the Greek lesson-1 table, the Hebrew
  alphabet table, the diphthong line, the breathings and accents, the five finals bullets,
  the begadkefat rows, the gutturals sentence and the vowel table in chapter 2 — and fails
  if the data and the book disagree. Write the pool first, then reconcile it with the
  grammar text; do not type it twice from memory.
- **A directional drill label reads «shown → chosen»**, as in «Фразы: {lang} → русский».
  `letter_case_lower` shows the capital, so it is «Прописная → строчная». The first
  version said «Строчная к прописной» and «Прописная к строчной». Russian «X к Y»
  reads either way, and both labels came out backwards. `alphabet.test.js` pins them
  against the letter that is actually displayed.
- **`introLessons` is empty in both courses and the mechanism is now inert.** It still
  means "material only, no drills and no test", and `isIntroLesson()` still honours it,
  but no lesson is on either list: the alphabet is trainable, so there is no material-only
  lesson left. Only `tests/shell.test.js` exercises the flag, by pushing a lesson onto the
  list for the length of one test.

## Paradigms

A paradigm is a grid: axes with ordered values, and forms at the intersections.
**`js/declension.js` takes that description from the data** — `declension_forms.tables`,
one entry per table, each with `rows`, `cols`, `cells` and optional `caption` and
`translations`. The exact shape is documented at the top of that file and again in
`data/hebrew-lessons.js`, where the Hebrew paradigms are authored.

- **Greek data was not rewritten.** All 101 paradigms in `data/lessons.js` keep the old
  nested notation (`forms[gender][number][case]`); `legacyParadigm()` expands it into the
  same axes, so there is one renderer and no second code path. Greek output is unchanged
  down to the byte — `declension.test.js` holds that line, and it is the reason the
  legacy branch reproduces small oddities like always emitting five case rows.
- **Cell keys must keep matching authored `declension_fill` questions** (`gen_sg`,
  `nom_pl_m`, `2sg`) for Greek, which is why `collectCardForms()` in `js/flashcards.js`
  still builds those keys itself. Axis-described paradigms need none of that: the key is
  `row_col` and the label comes from the axis values, so nothing parses a key with a
  regular expression.
- **Forms are marked `.script`, the row labels and the translation column are not.** The
  paradigm table was the one place studied-language text was still drawn in the interface
  font — invisible with Greek, fatal with niqqud at 14px. Cell size is
  `max(0.875rem, var(--md-ref-script-min-size))`: unchanged for Greek, floored for Hebrew.
- **Anything that walks the data looking for word forms must go through
  `paradigmCells()`**, not over the object. Axis labels are Russian strings living in the
  same structure; `getWordSearchForms()` in `js/vocab.js` used to collect every string it
  found, which would have made the dictionary highlight «Тип 1» inside example sentences.
- The verb (chapters 12–36) is still out of scope, but nothing about it needs new
  machinery now: a binyan × conjugation × PGN cube is a list of tables, which is what the
  description already is.

## Courses

The app hosts two courses. **`data/courses.js` is the registry**; `js/course.js` holds
the state and the switching.

- A course is one entry in `COURSES` — its name, its lessons object, its prayer data,
  its alphabet pool, and the handful of facts that used to be hard-coded for Greek:
  which lessons are intro-only (no drills), which lesson the dictionary starts at, the
  search placeholder, the script and its writing direction, and `lang` — the name of the
  language as it appears in drill labels ("Фразы: {lang} → русский", "Переведите на
  …"). Read that one through `courseLang()` and `drillLabel()`; a literal
  "греческий" in a shared string is a bug. Adding a course is a data entry plus its
  lesson file; it is not a code change.
- **Read lesson data through `courseLessons()`, never `LESSONS_DATA` directly.** The
  same goes for `coursePrayer()`. `LESSONS_DATA` is now *the Greek course's* lessons,
  not *the* lessons. `getLessonData()` and `lessonNumbers()` in `js/core.js` already
  go through the active course; use them.
- **Storage keys are namespaced by course**: `courseKey('stats')` → `greek_stats` /
  `hebrew_stats`, `courseKey('last_lesson')` likewise. This is why no migration was
  needed for progress — the pre-existing `greek_stats` and `greek_last_lesson` are
  exactly what the scheme produces for the Greek course. Anything genuinely global
  gets an `app_` prefix instead: `app_theme` (migrated from `greek_theme`, which is
  still read as a fallback), `app_course`, `app_default_course`.
- **The start screen is an overlay, not a `.section`.** `#startScreen` sits outside
  `.app` and is toggled by `body.start-open`, which hides the app bar, nav bar and FAB
  in CSS. It was deliberately not made a sixth screen: the nav bar is already at the
  M3 maximum of five destinations, and a launcher is not a destination. The app behind
  it is fully booted on the active course, so dismissing it is just hiding it.
- **`app_default_course` decides whether the start screen appears at all.** `ask`
  (the default) shows it on every load; a course id skips straight into that course.
  The setting lives on the settings screen next to the course switcher, which is the
  only other way back to the start screen.
- Switching a course goes through `applyCourse(id)`, which reloads stats, drops
  `allVocabCache`, resets the decks and re-renders. Anything you add that caches
  across screens must be reset there, or it will leak one course's words into the
  other.

## Writing direction

Hebrew is written right to left; the interface is Russian and stays left to right.
Those two facts are kept apart by one rule: **`<html>` never gets a `dir`.** Turning
the page over would turn over the app bar, the tabs, the nav bar and every Russian
label with it. Only the text of the language being studied is turned over.

Three pieces carry it:

1. **`applyCourseChrome()` (`js/course.js`) puts two attributes on `<html>`** from the
   registry: `data-script` (which script — `course.script`) and `data-script-dir`
   (`course.dir`). Nothing else in the app reads the course to decide how to draw text.
2. **`styles/tokens.css` resolves them into tokens**: `--md-ref-typeface-script`,
   `--md-ref-script-direction` and `--md-ref-script-min-size`. Every rule that draws
   studied-language text declares the first two plus `unicode-bidi: isolate`, so no
   rule mentions a course.
3. **`.script` is the marker class in generated markup.** A Hebrew word quoted inside
   a Russian sentence is an inline island: `<span class="script">…</span>`. `isolate`
   is what keeps the sentence's full stop from jumping to the wrong end of the word.

A few consequences worth knowing before you touch the rendering:

- **`.script` means "whatever the current course is". `.greek`, `.hebrew`, `lang="grc"`
  and `lang="he"` mean a specific language and win over it** — they are declared after
  `.script` in `base.css` for exactly that reason. Use them in `data/*.js` (`<td
  lang="he">`) where the content, not the course, decides.
- **The word bank is marked by the language of the chips, not by the course.**
  `ru_to_el` builds a phrase in the studied language, `el_to_ru` builds a Russian one,
  and the same screen does both — hence `word-bank--script` / `build-area--script`
  rather than a rule keyed on the course. Direction there reorders the chips: in RTL
  the first word picked lands on the right. `chosen[]` keeps logical order, so the
  answer check never learns about direction.
- **The same goes for the `<strong>` in the feedback line and in the error review.**
  Whether it holds a form or a Russian keyword depends on the drill; the code that
  builds the string adds `.script` when it is a form. The error list sweeps every
  drill into one place, so there no code path knows which it is. `errorText()`
  (`js/stats.js`) asks the string itself through `isScriptText()` and marks each of
  the three columns separately. `<strong>` keeps `unicode-bidi: plaintext` as the
  fallback for a mixed string. It used to force the script font instead, and that
  broke both ways at once. A Hebrew subject had no `.script`, so its niqqud was set
  in the interface font and drifted off the letter. A Russian answer («патах»,
  «[о]») got Noto Serif Hebrew, which has no Cyrillic. `stats.test.js` holds this.
- **Niqqud have a floor on how small they may be set.** `--md-ref-script-min-size` is
  `0` for Greek and `1.25rem` for Hebrew, and small studied-language text is written
  `font-size: max(<its own size>, var(--md-ref-script-min-size))`. Hebrew vowel points
  are dots below and inside the letter: at the 15px the word-bank chips use, the dagesh
  merges into the letter it sits in and qamets is not distinguishable from segol. Large
  text — the flashcard word, the drill prompt — is already above the floor and left
  alone. Add the `max()` when you set a small size on script text, and leave it off
  where the text may be Russian. The error list has it on `.error-item .script`, which
  only ever holds text that `isScriptText()` has already recognised.
- **Paradigm tables turn over with the course** (`.word-details > .md-table-scroll`):
  in RTL the first column is the right one. Grammar tables in the lesson data do not —
  they are often Russian — so they opt in with `<table dir="rtl">`, and
  `grammarLiftedHtml()` copies that `dir` onto the scroll strip. It has to: the strip
  is its own element, and a strip with `direction: ltr` would open a too-wide RTL
  table on its *last* column.
- **Interface chrome stays put.** The flashcard flip button, the tab bar, the swipe
  direction and the dictionary row layout are all part of the LTR interface, so none
  of them mirror. Use logical properties (`text-align: start`,
  `padding-inline-start`) inside anything that can turn over.

`tests/rtl.test.js` covers all of this, including a synthetic Hebrew chapter written
over `HEBREW_LESSONS_DATA[3]`. The fixture exercises every RTL feature in one chapter
and keeps the test independent of the authored content, so editing a real chapter cannot
quietly change what the rendering is asserted against.

## Offline shell

`sw.js` precaches `index.html`, every stylesheet, every data file, the manifest and the icon, and caches the Google Fonts CSS and font files at runtime. Strategies differ on purpose:

- **navigation → network-first**, cache as fallback. A published change reaches users on their next load; going cache-first here would strand them on a stale build.
- **same-origin assets → network-first**, cache as fallback. This used to be cache-first, which was safe while the app was a single file. It is not safe now: fresh `index.html` from the network plus yesterday's `styles/*.css` from the cache is a broken build. Both must come from the same place, so they use the same strategy. Offline is unaffected — with no network the fetch rejects immediately and the cache answers.
- **fonts → cache-first**; their URLs are already content-versioned.

**Adding any file under `styles/`, `data/` or `js/` means adding it to `CORE_ASSETS`.** Miss it and the app still works online, then cold-starts offline with no styles or empty screens — a failure you will not see in any online test.

`manifest.webmanifest` uses **relative** `start_url` and `scope` because Pages serves this from the `/greek_bot/` subpath; absolute paths would break it. Its icons stay the light `icon.svg`: a manifest cannot switch icons by colour scheme in any shipping browser, and its `background_color` is the light surface anyway. Registration is guarded on `location.protocol` so opening the file over `file://` is still fine, and a failed registration is swallowed — offline is a bonus, never a precondition.

Bump `CACHE_VERSION` in `sw.js` when the cached set changes; `activate` deletes every cache that does not match.

## Verify before reporting done

**Start with `npm test`.** The suite lives in `tests/` and is committed; it
boots the real `index.html` in jsdom and drives every screen. It covers points
1, 3 and 5 below, plus the load-order contract and `CORE_ASSETS` completeness.
See `tests/README.md` for how it is wired and what it deliberately does not
cover. `npm install` once; jsdom is the only dependency, and the app itself
still has none.

Do not claim completion on a design change without checking it renders. At minimum:

1. **JS syntax** — covered by `npm test` (`static.test.js`), or `node --check` every file in `js/` and `data/`, plus `sw.js`.
2. **Contrast** — compute WCAG ratios for every `on-*`/container pair in **all three** themes. Text ≥ 4.5:1, outlines/non-text ≥ 3:1, adjacent surface tones distinguishable (≥ ~1.10:1). Parse the tokens straight out of `styles/tokens.css` so the audit cannot drift from the source.
3. **Behaviour** — covered by `npm test`: every screen is exercised, every drill in every lesson is played to its result screen, and `undefined`/`NaN` leaking into markup fails the run. Add a test here rather than re-deriving a throwaway harness.
4. **Render** — screenshot light, dark and sepia, mobile (412px) and desktop (1280px), and check for console errors and horizontal overflow.
5. **Icon coverage** — covered by `npm test` (`icons.test.js`): it drives every screen, collects `.msym` text and diffs it against `icon_names=`. A missing name is invisible in jsdom and obvious to users.
6. **Offline** — if you touched `sw.js`, the manifest, or anything in `<head>`: serve the repo over HTTP under a `/greek_bot/` subpath, load once, `setOffline(true)`, and confirm a cold load still boots and renders. Then confirm an edited `index.html` is still served when back online — a service worker that pins a stale build is worse than no service worker.

Points 2, 4 and 6 have no committed harness — they need a browser or a server,
and are still written ad hoc. Ask before adding further tooling and dependencies
to the repo.

## Environment gotchas

- Windows. The Bash tool mangles heredocs containing quotes — write patch scripts to a file and run them, rather than piping a heredoc.
- **Never write Greek or Hebrew through the shell.** In Windows PowerShell 5.1, `Set-Content` and `Add-Content` write in the ANSI codepage, which turns every polytonic or pointed character into `?`, and `Out-File -Encoding utf8` adds a BOM. Edit files with the editor tool. If a script has to write them, use Node or Python with explicit UTF-8.
- PowerShell 5.1 has no `&&` or `||`. Chain with `;`, or use `if ($?) { … }`.
- jsdom does not implement `window.scrollTo`/`Element.scrollTo`; the test loader stubs both. The app also guards the calls itself.
- Playwright needs `npx playwright install chromium` before first use.
