# AGENTS.md

Guidance for AI agents working in this repository.

## What this repo is

An Ancient Greek learning web app, published to GitHub Pages.

| Part | Files | Notes |
|---|---|---|
| Markup shell | `index.html` | `<head>`, the screens, and the tag list that loads everything else. No logic, no styles, no data. |
| Styles | `styles/*.css` | The design system, seven files. See "Project layout". |
| Lesson content | `data/*.js` | Vocabulary, grammar, exercises, prayer, licences. |
| Logic | `js/*.js` | Fifteen files, one per feature area. |
| Offline shell | `sw.js`, `manifest.webmanifest`, `icon.svg` | Service worker + PWA metadata. Small, rarely touched — see "Offline shell" below. |
| Source textbook | `reference/machen-nt-greek/` | The book the lessons come from, as text. Reference only — never loaded by the app. See "Source textbook" below. |

There is no backend and no build step. Progress is kept in `localStorage`. Do not add a server, a bundler, or new tracked secrets.

The split files are **classic scripts and plain stylesheets**, deliberately not ES modules: 73 inline `onclick=` handlers need their functions to stay global, and `type="module"` / `fetch()` are both blocked on `file://`, which would break "clone and open `index.html`". Keep it that way unless you first replace the inline handlers with delegation.

All user-facing copy is **Russian**. Greek content is **polytonic** (accents, breathings, iota subscript — `ᾅ`, `ὥρᾳ`, `ἡμῶν`). Never "normalise" or strip Greek diacritics; they are the subject matter.

## Project layout

```
index.html           286  <head>, разметка, порядок загрузки
styles/
  tokens.css           217  :root и [data-theme=dark] — все переменные
  base.css             326  сброс, типографика, каркас, app bar, icon button, nav bar, FAB, ripple
  components.css       751  кнопки, list item урока, карточки, табы, search bar, text field, chips
  screens.css          651  вопрос/варианты, обратная связь, списки слов, таблицы и их прокрутка, ритм материала, flashcards и их оборот, статистика, «Отче наш»
  dialogs.css           88  snackbar, dialog
  layout.css            64  переходы экранов, утилиты, адаптивность (nav rail)
  settings.css         134  segmented button темы, список лицензий
data/
  lessons.js         1,699  const LESSONS_DATA
  prayer.js            136  const PRAYER_DATA
  licenses.js           38  const LICENSES
js/
  core.js              113  состояние, shuffle/escHtml/escArg, scheduleAdvance, localStorage
  ui.js                 80  ripple, showToast, mdDialog, progressHead, emptyState, resultBlock
  shell.js             206  SCREEN_META/DEST_SECTION/FAB_CONFIG, showSection, navigateTo, renderMainMenu
  theme.js              74  режимы темы, applyTheme, initTheme
  lesson.js            475  openLesson, меню разделов урока, вкладки, свайп, экран упражнения, разметка грамматики
  declension.js        139  generateDeclensionTable, аккордеон
  exercises.js         175  упражнения урока
  flashcards.js        364  карточки: общие и урока, оборот карточки с тренировкой форм
  test.js              198  тест
  translation.js       194  перевод
  stats.js              97  статистика, ошибки, сброс прогресса
  prayer.js            223  «Отче наш»: разбор и упражнения
  vocab.js             426  общий словарь, поиск, фильтр по частям речи
  settings.js           27  showSettings, renderLicenses
  boot.js               60  normalizeTranslationData, init*, глобальные слушатели
```

**Load order is the contract.** Three rules, all enforced only by the order of tags in `index.html`:

1. `tokens.css` first — everything else reads its variables. The other six stylesheets are listed in the order their rules appeared in the old single `<style>`, so the cascade is unchanged; reordering the `<link>` tags is a silent visual regression.
2. `data/*.js` before `js/*.js` — the logic reads `LESSONS_DATA` during boot.
3. **`boot.js` last.** It is the only file that *executes* anything at load time; every other file just declares. Top-level `let`/`const` across classic scripts share one global lexical environment, so a file that ran code referencing a binding declared in a later file would hit a temporal-dead-zone `ReferenceError`. Keep new files declaration-only, and keep `boot.js` at the bottom.

The two exceptions to "declaration-only" are `ui.js` (the ripple `pointerdown`/`keydown` listeners) and `prayer.js` (the click-outside handler); both only register callbacks, which run long after every script has loaded.

Whatever you touch, it is almost always one file:

| Task | File |
|---|---|
| Colours, shape, motion, elevation | `styles/tokens.css` |
| A component's look | `styles/components.css` (or `dialogs.css` / `settings.css`) |
| A screen's look | `styles/screens.css` |
| Responsive / nav rail | `styles/layout.css` |
| **Lesson content** | `data/lessons.js` — **do not touch** unless the task is explicitly about content |
| Finding content in the textbook | `reference/machen-nt-greek/INDEX.md` — then the lesson file it points to |
| A new dependency's licence | `data/licenses.js` |
| Behaviour | the matching `js/*.js` — the table above says which |
| A new screen | `index.html` markup **+** `SCREEN_META`/`DEST_SECTION`/`FAB_CONFIG` in `js/shell.js` |

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
- Progress is `localStorage` only: `greek_stats`, `greek_theme`, `greek_last_lesson`. All reads/writes must stay wrapped in `try/catch` — they throw in private-mode Safari.

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
- Greek: **Noto Serif** (`--md-ref-typeface-greek`), applied *only* where Greek is the object of study — headwords, flashcards, chips and tokens, prayer text, and Greek answer options via `.options--greek`. Russian UI text never gets the serif.
- Mark inline Greek inside Russian sentences with `<span class="greek">`, not `<b>`.
- Icons are **Material Symbols Rounded** (`<span class="msym">name</span>`). No emoji in the interface.
- The icon font is **subsetted** via the `icon_names=` parameter on the Google Fonts `<link>` in `<head>`. The full family is 5.4 MB and loads with `display=block`, so the whole UI sits iconless until it arrives; the subset is ~76 KB for the 50 icons currently used. **Adding an icon means adding its ligature name to that list** — otherwise it renders as raw text (`menu_book`) instead of a glyph. Sweep the rendered DOM for `.msym` text to regenerate the list rather than editing it by hand.

## Settings screen

`settingsSection` is the fifth navigation destination and the home for anything that is not study content: theme, data management, licenses.

- **Theme** is a three-way choice — `system` / `light` / `dark` — stored in `greek_theme` as the *mode*, never as the resolved colour. Storing the resolved value is what breaks "follow the system": the app would pin whatever the OS happened to be on first run. `system` stays live via a `matchMedia` listener. A value written by an older build (`light`/`dark`) is still read as a valid manual choice.
- **Licenses** come from the `LICENSES` array; add an entry when you add a dependency. The course material is listed last because it is a copyright statement, not an open licence.
- The nav bar now holds **five** destinations — the M3 maximum. A sixth needs a different pattern, not a sixth item.

## Source textbook

`reference/machen-nt-greek/` holds the book the lessons are built from — Machen's
*New Testament Greek for Beginners* in the Russian Bible Society edition (33 lessons,
241 pages), extracted from its PDF as Markdown plus two JSON vocabulary files.
Start at `reference/machen-nt-greek/INDEX.md`; the rules are in its `README.md`.

It is **reference material only**. Nothing there is loaded by the app, precached by
`sw.js`, or listed in `index.html` — do not wire it in.

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

## Offline shell

`sw.js` precaches `index.html`, every stylesheet, every data file, the manifest and the icon, and caches the Google Fonts CSS and font files at runtime. Strategies differ on purpose:

- **navigation → network-first**, cache as fallback. A published change reaches users on their next load; going cache-first here would strand them on a stale build.
- **same-origin assets → network-first**, cache as fallback. This used to be cache-first, which was safe while the app was a single file. It is not safe now: fresh `index.html` from the network plus yesterday's `styles/*.css` from the cache is a broken build. Both must come from the same place, so they use the same strategy. Offline is unaffected — with no network the fetch rejects immediately and the cache answers.
- **fonts → cache-first**; their URLs are already content-versioned.

**Adding any file under `styles/`, `data/` or `js/` means adding it to `CORE_ASSETS`.** Miss it and the app still works online, then cold-starts offline with no styles or empty screens — a failure you will not see in any online test.

`manifest.webmanifest` uses **relative** `start_url` and `scope` because Pages serves this from the `/greek_bot/` subpath; absolute paths would break it. Registration is guarded on `location.protocol` so opening the file over `file://` is still fine, and a failed registration is swallowed — offline is a bonus, never a precondition.

Bump `CACHE_VERSION` in `sw.js` when the cached set changes; `activate` deletes every cache that does not match.

## Verify before reporting done

Do not claim completion on a design change without checking it renders. At minimum:

1. **JS syntax** — `node --check` every file in `js/` and `data/`, plus `sw.js`. There is no inline script left to extract.
2. **Contrast** — compute WCAG ratios for every `on-*`/container pair in **both** themes. Text ≥ 4.5:1, outlines/non-text ≥ 3:1, adjacent surface tones distinguishable (≥ ~1.10:1). Parse the tokens straight out of `index.html` so the audit cannot drift from the source.
3. **Behaviour** — exercise every screen (jsdom is enough) and confirm no screen renders empty, no `undefined` leaks into markup, and no stray hex colors appear in the live DOM.
4. **Render** — screenshot light and dark, mobile (412px) and desktop (1280px), and check for console errors and horizontal overflow.
5. **Icon coverage** — drive every screen and collect `.msym` text, then diff it against `icon_names=`. A missing name is invisible in jsdom and obvious to users.
6. **Offline** — if you touched `sw.js`, the manifest, or anything in `<head>`: serve the repo over HTTP under a `/greek_bot/` subpath, load once, `setOffline(true)`, and confirm a cold load still boots and renders. Then confirm an edited `index.html` is still served when back online — a service worker that pins a stale build is worse than no service worker.

These harnesses are not committed; they are quick to rewrite. Ask before adding a `tools/` directory and its dependencies to the repo.

## Environment gotchas

- Windows. The Bash tool mangles heredocs containing quotes — write patch scripts to a file and run them, rather than piping a heredoc.
- jsdom does not implement `window.scrollTo`/`Element.scrollTo`; those errors in test output are harness noise, not app bugs. The app already guards both calls.
- Playwright needs `npx playwright install chromium` before first use.
