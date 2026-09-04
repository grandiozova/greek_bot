# AGENTS.md

Guidance for AI agents working in this repository.

## What this repo is

An Ancient Greek learning web app, published to GitHub Pages.

| Part | Files | Notes |
|---|---|---|
| Shell + logic | `index.html` | Markup and the whole application logic, still inline in one `<script>`. |
| Styles | `styles/*.css` | The design system, seven files. See "Project layout". |
| Lesson content | `data/*.js` | Vocabulary, grammar, exercises, prayer, licences. |
| Offline shell | `sw.js`, `manifest.webmanifest`, `icon.svg` | Service worker + PWA metadata. Small, rarely touched — see "Offline shell" below. |

There is no backend and no build step. Progress is kept in `localStorage`. Do not add a server, a bundler, or new tracked secrets.

The split files are **classic scripts and plain stylesheets**, deliberately not ES modules: 73 inline `onclick=` handlers need their functions to stay global, and `type="module"` / `fetch()` are both blocked on `file://`, which would break "clone and open `index.html`". Keep it that way unless you first replace the inline handlers with delegation.

All user-facing copy is **Russian**. Greek content is **polytonic** (accents, breathings, iota subscript — `ᾅ`, `ὥρᾳ`, `ἡμῶν`). Never "normalise" or strip Greek diacritics; they are the subject matter.

## Project layout

```
index.html          ~2,250  <head>, разметка, вся логика в одном <script>
styles/
  tokens.css           164  :root и [data-theme=dark] — все переменные
  base.css             322  сброс, типографика, каркас, app bar, icon button, nav bar, FAB, ripple
  components.css       519  кнопки, list item урока, карточки, табы, search bar, text field, chips
  screens.css          522  вопрос/варианты, обратная связь, списки слов, таблицы, flashcards, статистика, «Отче наш»
  dialogs.css           88  snackbar, dialog
  layout.css            61  переходы экранов, утилиты, адаптивность (nav rail)
  settings.css         120  segmented button темы, список лицензий
data/
  lessons.js         1,495  const LESSONS_DATA
  prayer.js            136  const PRAYER_DATA
  licenses.js           38  const LICENSES
```

**Load order is the contract.** `tokens.css` must come first — everything else reads its variables — and the remaining stylesheets are listed in the order their rules appeared in the old single `<style>`, so the cascade is unchanged. Reordering the `<link>` tags is a silent visual regression. Likewise the `data/*.js` tags must precede the inline `<script>`: the logic reads `LESSONS_DATA` during boot.

Whatever you touch, it is almost always one file:

| Task | File |
|---|---|
| Colours, shape, motion, elevation | `styles/tokens.css` |
| A component's look | `styles/components.css` (or `dialogs.css` / `settings.css`) |
| A screen's look | `styles/screens.css` |
| Responsive / nav rail | `styles/layout.css` |
| **Lesson content** | `data/lessons.js` — **do not touch** unless the task is explicitly about content |
| A new dependency's licence | `data/licenses.js` |
| Anything behavioural | `index.html` |

Structural facts worth knowing before editing:

- Screens are `div.section`; `showSection(id)` clears `.active` from **all** `.section` elements, including the lesson's inner tab panels — which is why `restoreLessonPart()` exists. Keep that invariant if you touch navigation.
- `SCREEN_META`, `DEST_SECTION` and `FAB_CONFIG` drive the app bar title, back button, active nav destination and contextual FAB. Adding a screen means adding entries there, not just markup.
- Top-level `let` and `const` bindings — state (`stats`, `testState`, `allFlashcardState`, …) *and* the data (`LESSONS_DATA`, `PRAYER_DATA`, `LICENSES`) — are **not** on `window`; splitting the data into their own files did not change this, because `const` at the top level of a classic script never creates a window property. `function` declarations *are* on `window`. So a harness can call `window.openLesson(3)` but must reach data through `window.eval('LESSONS_DATA')`. Test through the DOM, not through `window.someState`.
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
- The icon font is **subsetted** via the `icon_names=` parameter on the Google Fonts `<link>` in `<head>`. The full family is 5.4 MB and loads with `display=block`, so the whole UI sits iconless until it arrives; the subset is ~76 KB for the 50 icons currently used. **Adding an icon means adding its ligature name to that list** — otherwise it renders as raw text (`menu_book`) instead of a glyph. Sweep the rendered DOM for `.msym` text to regenerate the list rather than editing it by hand.

## Settings screen

`settingsSection` is the fifth navigation destination and the home for anything that is not study content: theme, data management, licenses.

- **Theme** is a three-way choice — `system` / `light` / `dark` — stored in `greek_theme` as the *mode*, never as the resolved colour. Storing the resolved value is what breaks "follow the system": the app would pin whatever the OS happened to be on first run. `system` stays live via a `matchMedia` listener. A value written by an older build (`light`/`dark`) is still read as a valid manual choice.
- **Licenses** come from the `LICENSES` array; add an entry when you add a dependency. The course material is listed last because it is a copyright statement, not an open licence.
- The nav bar now holds **five** destinations — the M3 maximum. A sixth needs a different pattern, not a sixth item.

## Offline shell

`sw.js` precaches `index.html`, every stylesheet, every data file, the manifest and the icon, and caches the Google Fonts CSS and font files at runtime. Strategies differ on purpose:

- **navigation → network-first**, cache as fallback. A published change reaches users on their next load; going cache-first here would strand them on a stale build.
- **same-origin assets → network-first**, cache as fallback. This used to be cache-first, which was safe while the app was a single file. It is not safe now: fresh `index.html` from the network plus yesterday's `styles/*.css` from the cache is a broken build. Both must come from the same place, so they use the same strategy. Offline is unaffected — with no network the fetch rejects immediately and the cache answers.
- **fonts → cache-first**; their URLs are already content-versioned.

**Adding a stylesheet or data file means adding it to `CORE_ASSETS`.** Miss it and the app still works online, then cold-starts offline with no styles or empty screens — a failure you will not see in any online test.

`manifest.webmanifest` uses **relative** `start_url` and `scope` because Pages serves this from the `/greek_bot/` subpath; absolute paths would break it. Registration is guarded on `location.protocol` so opening the file over `file://` is still fine, and a failed registration is swallowed — offline is a bonus, never a precondition.

Bump `CACHE_VERSION` in `sw.js` when the cached set changes; `activate` deletes every cache that does not match.

## Verify before reporting done

Do not claim completion on a design change without checking it renders. At minimum:

1. **JS syntax** — `node --check` each of `data/*.js` and `sw.js` directly, and extract the inline `<script>` from `index.html` to check that too. A broken string literal is otherwise silent.
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
