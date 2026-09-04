# AGENTS.md

Guidance for AI agents working in this repository.

## What this repo is

An Ancient Greek learning web app, published to GitHub Pages.

| Part | Files | Notes |
|---|---|---|
| Web app | `index.html` | Single self-contained file. Data, styles and logic are all inline. All work happens here. |

There is no backend and no build step: `index.html` is the whole application. Progress is kept in `localStorage`. Do not add a server, a bundler, or new tracked secrets.

All user-facing copy is **Russian**. Greek content is **polytonic** (accents, breathings, iota subscript — `ᾅ`, `ὥρᾳ`, `ἡμῶν`). Never "normalise" or strip Greek diacritics; they are the subject matter.

## `index.html` anatomy

~5,400 lines in four bands. Line numbers drift — locate by anchor, not by number.

| Band | Anchor | Rule |
|---|---|---|
| Head + design tokens + CSS | `<head>` → `</style>` | The whole design system lives here. |
| Markup shell | `<body>` → first `<script>` | App bar, screens, nav bar, FAB, snackbar, dialog. |
| **Lesson data** | `const LESSONS_DATA` → `const PRAYER_DATA` → its closing `};` | **Do not touch.** ~1,600 lines of vocabulary, grammar, exercises. Edit only when the task is explicitly about content. |
| Application logic | from `let currentLesson = 3;` to `</script>` | Screens, navigation, exercises, rendering. |

Structural facts worth knowing before editing:

- Screens are `div.section`; `showSection(id)` clears `.active` from **all** `.section` elements, including the lesson's inner tab panels — which is why `restoreLessonPart()` exists. Keep that invariant if you touch navigation.
- `SCREEN_META`, `DEST_SECTION` and `FAB_CONFIG` drive the app bar title, back button, active nav destination and contextual FAB. Adding a screen means adding entries there, not just markup.
- Top-level `let` bindings (`stats`, `testState`, `allFlashcardState`, …) are **not** on `window`. Test through the DOM, not through `window.someState`.
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

## Verify before reporting done

Do not claim completion on a design change without checking it renders. At minimum:

1. **JS syntax** — extract both `<script>` blocks and `node --check` each. The file is one giant HTML blob; a broken string literal is otherwise silent.
2. **Contrast** — compute WCAG ratios for every `on-*`/container pair in **both** themes. Text ≥ 4.5:1, outlines/non-text ≥ 3:1, adjacent surface tones distinguishable (≥ ~1.10:1). Parse the tokens straight out of `index.html` so the audit cannot drift from the source.
3. **Behaviour** — exercise every screen (jsdom is enough) and confirm no screen renders empty, no `undefined` leaks into markup, and no stray hex colors appear in the live DOM.
4. **Render** — screenshot light and dark, mobile (412px) and desktop (1280px), and check for console errors and horizontal overflow.

These harnesses are not committed; they are quick to rewrite. Ask before adding a `tools/` directory and its dependencies to the repo.

## Environment gotchas

- Windows. The Bash tool mangles heredocs containing quotes — write patch scripts to a file and run them, rather than piping a heredoc.
- jsdom does not implement `window.scrollTo`/`Element.scrollTo`; those errors in test output are harness noise, not app bugs. The app already guards both calls.
- Playwright needs `npx playwright install chromium` before first use.
