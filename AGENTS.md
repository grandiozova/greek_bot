# AGENTS.md

Guidance for AI agents working in this repository.

## What this repo is

An Ancient Greek learning web app, published to GitHub Pages.

| Part | Files | Notes |
|---|---|---|
| Markup shell | `index.html` | `<head>`, the screens, and the tag list that loads everything else. No logic, no styles, no data. |
| Styles | `styles/*.css` | The design system, seven files. See "Project layout". |
| Lesson content | `data/*.js` | Vocabulary, grammar, exercises, prayer, licences, the course registry. |
| Logic | `js/*.js` | Sixteen files, one per feature area. |
| Offline shell | `sw.js`, `manifest.webmanifest`, `icon.svg` | Service worker + PWA metadata. Small, rarely touched — see "Offline shell" below. |
| Source textbooks | `reference/machen-nt-greek/`, `reference/nbbs-hebrew/` | The books the lessons come from, as text. Reference only — never loaded by the app. See "Source textbooks" below. |

The app hosts **two courses**, Greek and Hebrew, chosen on a start screen. `data/courses.js`
is the registry and `js/course.js` the switching; see "Courses" and "The Hebrew course:
phased plan" below.

There is no backend and no build step. Progress is kept in `localStorage`. Do not add a server, a bundler, or new tracked secrets.

The split files are **classic scripts and plain stylesheets**, deliberately not ES modules: 73 inline `onclick=` handlers need their functions to stay global, and `type="module"` / `fetch()` are both blocked on `file://`, which would break "clone and open `index.html`". Keep it that way unless you first replace the inline handlers with delegation.

All user-facing copy is **Russian**. Greek content is **polytonic** (accents, breathings, iota subscript — `ᾅ`, `ὥρᾳ`, `ἡμῶν`). Never "normalise" or strip Greek diacritics; they are the subject matter.

## Project layout

```
index.html           334  <head>, разметка, порядок загрузки
styles/
  tokens.css           249  :root, [data-theme=dark] и [data-script] — все переменные
  base.css             350  сброс, типографика, метки языка (.script/.greek/.hebrew), каркас, app bar, icon button, nav bar, FAB, ripple
  components.css       771  кнопки, list item урока, карточки, табы, search bar, text field, chips
  screens.css          832  вопрос/варианты, обратная связь, списки слов, таблицы и их прокрутка, ритм материала, flashcards и их оборот, статистика, «Отче наш», стартовый экран выбора курса
  dialogs.css           88  snackbar, dialog
  layout.css            64  переходы экранов, утилиты, адаптивность (nav rail)
  settings.css         156  segmented button темы и курса, карточка курса, список лицензий
data/
  lessons.js         1,698  const LESSONS_DATA — уроки ГРЕЧЕСКОГО курса, а не «уроки вообще»
  hebrew-lessons.js     22  const HEBREW_LESSONS_DATA — пока пустой объект (фаза 5)
  prayer.js            136  const PRAYER_DATA
  licenses.js           38  const LICENSES
  courses.js            77  const COURSES/COURSE_ORDER — реестр курсов, грузится последним из data/
tests/                    jsdom-набор, `npm test` — см. tests/README.md
js/
  core.js              120  состояние, shuffle/escHtml/escArg, scheduleAdvance, localStorage
  course.js            244  текущий курс, ключи хранилища, письмо, стартовый экран, переключение курса
  ui.js                 80  ripple, showToast, mdDialog, progressHead, emptyState, resultBlock
  shell.js             238  SCREEN_META/DEST_SECTION/FAB_CONFIG, showSection, navigateTo, renderMainMenu
  theme.js              86  режимы темы, applyTheme, initTheme
  lesson.js            493  openLesson, меню разделов урока, вкладки, свайп, экран упражнения, разметка грамматики
  declension.js        139  generateDeclensionTable, аккордеон
  exercises.js         175  упражнения урока
  flashcards.js        364  карточки: общие и урока, оборот карточки с тренировкой форм
  test.js              205  тест
  translation.js       202  перевод
  stats.js              97  статистика, ошибки, сброс прогресса
  prayer.js            228  «Отче наш»: разбор и упражнения
  vocab.js             428  общий словарь, поиск, фильтр по частям речи
  settings.js           28  showSettings, renderLicenses
  boot.js               74  normalizeTranslationData, init*, глобальные слушатели
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
- **Horizontal swipe switches lesson sections on touch screens.** `initLessonSwipe()` (`js/lesson.js`, called from `boot.js`) listens on `#lessonSection`. The row it moves along is **the tab bar itself** — `lessonSwipeTabs()` reads the visible `#lessonTabs` buttons in markup order, so «Тест» is in it too, and the intro lessons (whose exercise and test tabs are hidden via `style.display`) have nothing to swipe to. `swipeLessonPart()` ends by **clicking the tab it landed on** rather than calling `switchLessonPart()` directly: the test tab carries `startTest()`, not a panel switch, and a swipe must do exactly what a tap on that tab does. That is the whole reason the row is derived from the DOM instead of a list of part names — a hardcoded list silently drops any tab that is an action rather than a panel. A gesture is ignored when it is short, more vertical than horizontal, multi-touch, or started inside something that scrolls sideways itself (`SWIPE_BLOCKERS` — declension tables, the tab bar, chip rows, inputs). Both ends of the row are dead ends; the gesture never wraps.
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

1. **No hard-coded colors.** Not in CSS, not in inline `style=`, not in JS-generated markup strings. Every color is `var(--md-sys-color-*)` or `var(--md-extended-color-*)`. A literal hex anywhere outside the two token blocks is a bug — this codebase had ~20 of them and dark mode was broken everywhere as a result. The only permitted literals are the bootstrap `<meta name="theme-color">` tags, which must paint before CSS loads; keep them in sync with `surface` in both schemes. Where JS needs a color it reads the token — see `applyTheme()`, which pulls `--md-sys-color-surface` via `getComputedStyle` rather than repeating the hex.
2. **Always use the `on-` pair.** `background: primary-container` requires `color: on-primary-container`. Never mix roles across pairs.
3. **Both themes, always.** Any new role goes into `:root` *and* `[data-theme="dark"]`. Never ship a token defined in only one.
4. **Spacing on a 4dp grid**, shape from the shape scale, motion from the motion tokens. No arbitrary `border-radius: 7px` or `transition: 0.15s ease`.
5. **Touch targets ≥ 48×48dp**, even when the visual element is smaller.
6. **State layers on everything interactive** — hover 8%, focus 10%, pressed 10%, via the `::before` overlay pattern used throughout, plus ripple (`RIPPLE_TARGETS`).
7. **Respect `prefers-reduced-motion`.** The global reduce block exists; do not add animations that bypass it.

### Token vocabulary

Defined in the `:root` / `[data-theme="dark"]` blocks. Use these names, add new ones only when a genuine M3 role is missing.

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
- The icon font is **subsetted** via the `icon_names=` parameter on the Google Fonts `<link>` in `<head>`. The full family is 5.4 MB and loads with `display=block`, so the whole UI sits iconless until it arrives; the subset is ~76 KB for the 50 icons currently used. **Adding an icon means adding its ligature name to that list** — otherwise it renders as raw text (`menu_book`) instead of a glyph. Sweep the rendered DOM for `.msym` text to regenerate the list rather than editing it by hand.

## Settings screen

`settingsSection` is the fifth navigation destination and the home for anything that is not study content: theme, data management, licenses.

- **Course** is the first card: which course is open, a button back to the start screen, and `app_default_course` — whether the start screen asks on every load or drops straight into one course.
- **Theme** is a three-way choice — `system` / `light` / `dark` — stored in `app_theme` as the *mode*, never as the resolved colour. Storing the resolved value is what breaks "follow the system": the app would pin whatever the OS happened to be on first run. `system` stays live via a `matchMedia` listener. A value written by an older build (`light`/`dark`) is still read as a valid manual choice, and the pre-courses key `greek_theme` is read as a fallback and migrated forward once.
- **Licenses** come from the `LICENSES` array; add an entry when you add a dependency. The course material is listed last because it is a copyright statement, not an open licence.
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

## The Hebrew course: phased plan

The app is being extended from one course to two. Agreed scope: **a pilot of
chapters 1–11**, the nominal system. The verb (chapters 12–36) is out of scope for
now, which is what defers Phase 4.

Phases are ordered so each one lands working. Mark a phase done here when it is.

| # | Phase | State |
|---|---|---|
| 0 | Extract the textbook into `reference/nbbs-hebrew/` | **done** |
| 1 | Course shell: start screen, course switching, namespaced storage | **done** |
| 2 | RTL rendering | **done** |
| 3 | Hebrew-specific drills | not started |
| 4 | Data-driven paradigm engine | **deferred** — needs the verb system |
| 5 | Author chapters 1–11 into `data/hebrew-lessons.js` | not started |

**Phase 1 — course shell.** Done; see "Courses" below for what it built.

**Phase 2 — RTL.** Done; the contract is in "Writing direction" below. In short:
`<html>` never gets a `dir`, two attributes on it resolve into two tokens, and the
marker class in generated markup is `.script` (it replaced `class="greek"`, and
`.options--greek` / `.vocab-example__greek` became `--script` likewise). The word bank
is marked by the language of its chips rather than by the course, because one screen
shows both. Noto Serif Hebrew joined the font link for the niqqud.

**Phase 3 — Hebrew drills.** New exercise types with no Greek equivalent: niqqud
(name the vowel, supply the missing one), silent vs vocal shva, dagesh forte vs lene,
qamets vs qamets-hatuf, syllable division, begadkefat, gutturals, the construct chain,
and pronominal suffixes (type 1 vs type 2). Mechanically each is one more branch in
the `s.type` chain in `js/exercises.js` plus an entry in `LESSON_DRILL_GROUPS`
(`js/lesson.js`) and `TEST_TYPES` (`js/test.js`) — the engine already takes them as
data. Keep exercise keys course-neutral where the concept is shared
(`translate_*`, `agreement`) and prefix the rest.

**Phase 4 — paradigm engine.** `generateDeclensionTable()` (`js/declension.js`)
hard-codes `['nom','gen','dat','acc','voc']`, three genders and three persons. Hebrew's
verb is a binyan × conjugation × 9-PGN cube, which that function cannot express. The
fix is a table renderer driven by an axis description in the data rather than by
hard-coded case lists. **Deferred on purpose**: chapters 1–11 stop before the verb, and
the nominal paradigms in them fit the existing table. Do not start this until the
scope grows past chapter 11.

**Phase 5 — content.** Author chapters 1–11 into `data/hebrew-lessons.js`, in the same
lesson shape as `data/lessons.js` (`title`, `grammar`, `vocabulary`, `exercises`,
`translation`). The file already exists and is wired in — it is an empty object waiting
for content. Source material and its caveats are in `reference/nbbs-hebrew/`.
`data/vocabulary-by-lesson.json` there carries a `freq` per word (the textbook's own
count of its occurrences in the Hebrew Bible) — an axis the Greek data has no
equivalent of, and the natural way to order what gets taught first.

## Courses

The app hosts two courses. **`data/courses.js` is the registry**; `js/course.js` holds
the state and the switching.

- A course is one entry in `COURSES` — its name, its lessons object, its prayer data,
  and the handful of facts that used to be hard-coded for Greek: which lessons are
  intro-only (no drills), which lesson the dictionary starts at, the search
  placeholder, the script and its writing direction, and `lang` — the name of the
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
2. **`styles/tokens.css` resolves them into two tokens**: `--md-ref-typeface-script`
   and `--md-ref-script-direction`. Every rule that draws studied-language text
   declares that pair plus `unicode-bidi: isolate`, so no rule mentions a course.
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
  builds the string adds `.script` when it is a form. Where the mix is genuinely
  unknowable — the error list sweeps every drill into one place — the CSS uses
  `unicode-bidi: plaintext`, which takes the direction from the text itself.
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

`tests/rtl.test.js` covers all of this, including a synthetic Hebrew chapter injected
into `HEBREW_LESSONS_DATA` — chapters 1–11 are not written yet (Phase 5), and without
it the first real chapter would be the first test of the rendering.

## Offline shell

`sw.js` precaches `index.html`, every stylesheet, every data file, the manifest and the icon, and caches the Google Fonts CSS and font files at runtime. Strategies differ on purpose:

- **navigation → network-first**, cache as fallback. A published change reaches users on their next load; going cache-first here would strand them on a stale build.
- **same-origin assets → network-first**, cache as fallback. This used to be cache-first, which was safe while the app was a single file. It is not safe now: fresh `index.html` from the network plus yesterday's `styles/*.css` from the cache is a broken build. Both must come from the same place, so they use the same strategy. Offline is unaffected — with no network the fetch rejects immediately and the cache answers.
- **fonts → cache-first**; their URLs are already content-versioned.

**Adding any file under `styles/`, `data/` or `js/` means adding it to `CORE_ASSETS`.** Miss it and the app still works online, then cold-starts offline with no styles or empty screens — a failure you will not see in any online test.

`manifest.webmanifest` uses **relative** `start_url` and `scope` because Pages serves this from the `/greek_bot/` subpath; absolute paths would break it. Registration is guarded on `location.protocol` so opening the file over `file://` is still fine, and a failed registration is swallowed — offline is a bonus, never a precondition.

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
2. **Contrast** — compute WCAG ratios for every `on-*`/container pair in **both** themes. Text ≥ 4.5:1, outlines/non-text ≥ 3:1, adjacent surface tones distinguishable (≥ ~1.10:1). Parse the tokens straight out of `styles/tokens.css` so the audit cannot drift from the source.
3. **Behaviour** — covered by `npm test`: every screen is exercised, every drill in every lesson is played to its result screen, and `undefined`/`NaN` leaking into markup fails the run. Add a test here rather than re-deriving a throwaway harness.
4. **Render** — screenshot light and dark, mobile (412px) and desktop (1280px), and check for console errors and horizontal overflow.
5. **Icon coverage** — covered by `npm test` (`icons.test.js`): it drives every screen, collects `.msym` text and diffs it against `icon_names=`. A missing name is invisible in jsdom and obvious to users.
6. **Offline** — if you touched `sw.js`, the manifest, or anything in `<head>`: serve the repo over HTTP under a `/greek_bot/` subpath, load once, `setOffline(true)`, and confirm a cold load still boots and renders. Then confirm an edited `index.html` is still served when back online — a service worker that pins a stale build is worse than no service worker.

Points 2, 4 and 6 have no committed harness — they need a browser or a server,
and are still written ad hoc. Ask before adding further tooling and dependencies
to the repo.

## Environment gotchas

- Windows. The Bash tool mangles heredocs containing quotes — write patch scripts to a file and run them, rather than piping a heredoc.
- jsdom does not implement `window.scrollTo`/`Element.scrollTo`; the test loader stubs both. The app also guards the calls itself.
- Playwright needs `npx playwright install chromium` before first use.
