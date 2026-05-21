# Phase 0 — Scaffolding & Semantic Markup

> Parent plan: [`docs/plan.md`](../plan.md) §6 Phase 0
> Subject reference: [`docs/subject.md`](../subject.md) §4.1, §4.2, §4.4

This phase lays the **bare-minimum project skeleton** so every later phase has a stable place to drop code. No styling beyond reset + design tokens, no behavior beyond ES Module wiring. Following `.cursorrules` §4 (Minimal-First / YAGNI), nothing more is added here than what is needed to scaffold.

---

## 1. Goal

- Create the static file layout exactly as locked in `plan.md` §3.
- Write **valid semantic HTML** for the six sections (Hero / About / Skills / Projects / Contact / Footer) with empty content shells.
- Declare the `:root` design token set so subsequent phases consume tokens, not hard-coded values.
- Wire `js/main.js` as an ES Module entry point that imports empty stubs from every feature module.
- Result: page loads, no console errors, no visible style — just legible default-browser HTML.

---

## 2. Scope (In / Out)

**In scope**
- File/directory creation per `plan.md` §3 layout.
- HTML5 semantic structure with anchor IDs for nav links.
- `<head>` meta: charset, viewport, title, favicon, Google Fonts `<link>` (CDN `<link>` is the only external resource allowed).
- `css/style.css`: tiny reset (margin/padding/box-sizing) + `:root` token block.
- `css/responsive.css`: empty file with `/* tablet 768 / desktop 1024 */` header comments.
- `js/main.js` + per-feature stubs (`config.js`, `theme.js`, `nav.js`, `animate.js`, `projects.js`, `contact.js`) each exporting an empty `init()`.

**Out of scope**
- Any visual styling beyond reset + tokens.
- Any interactivity (theme toggle, hamburger, fetch, validation).
- Any responsive media queries.
- README content (Phase 5).

---

## 3. Tasks

### 3.1 Directory tree
Create exactly this structure under `04-1.my_project/`:

```
index.html
css/
  style.css
  responsive.css
js/
  main.js
  config.js
  theme.js
  nav.js
  animate.js
  projects.js
  contact.js
images/
  favicon.svg
  profile.*         (placeholder ok)
  projects/         (empty dir)
```

### 3.2 `index.html`
- HTML5 doctype, `lang` attribute, `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- `<link rel="stylesheet" href="./css/style.css">` then `./css/responsive.css`.
- `<script type="module" defer src="./js/main.js"></script>` in `<head>`.
- `<header>` with `<nav>` containing anchor links to `#hero`, `#about`, `#skills`, `#projects`, `#contact`.
- `<main>` containing six `<section id="...">` blocks (or `<section>` + nested `<article>` where appropriate for repeated items).
- `<footer>` with copyright + social links placeholder.
- Every `<img>` carries a meaningful `alt`; every form input has a matching `<label for>` (the form lives in `#contact`).
- **No inline handlers**, no `style="..."`, no `id` used for JS hooks yet — JS will query by class names introduced in later phases.

### 3.3 `css/style.css`
- Top of file: minimal reset (`*, *::before, *::after { box-sizing: border-box; } body { margin: 0; }`).
- Single `:root { ... }` block declaring tokens for:
  - Colors (background, surface, text, muted, accent, border).
  - Spacing scale (e.g. `--space-1` … `--space-8`).
  - Font family / size / line-height.
  - Radius, shadow, transition.
- Add `:root[data-theme="dark"] { ... }` block overriding only the color tokens. Keep value lists short for now (we'll iterate in Phase 1).
- **Do not** style sections yet.

### 3.4 `css/responsive.css`
- Empty body. Add comments to mark the breakpoint slots:

```css
/* === tablet: 768px and up === */

/* === desktop: 1024px and up === */
```

### 3.5 JS module stubs
Each module exports a single named `init` so `main.js` can wire them uniformly.

```js
// js/theme.js (example shape — same for nav/animate/projects/contact)
export function init() {}
```

```js
// js/config.js
export const GITHUB_USERNAME = "";
export const SCROLL_TOP_THRESHOLD = 300;
export const NAV_BG_THRESHOLD = 60;
export const OBSERVER_THRESHOLD = 0.2;
```

```js
// js/main.js
import { init as initTheme } from "./theme.js";
import { init as initNav } from "./nav.js";
import { init as initAnimate } from "./animate.js";
import { init as initProjects } from "./projects.js";
import { init as initContact } from "./contact.js";

initTheme();
initNav();
initAnimate();
initProjects();
initContact();
```

> `GITHUB_USERNAME` stays empty for Phase 0; it is filled in Phase 3.

---

## 4. Files Touched

| File | Action |
| ---- | ------ |
| `index.html` | create |
| `css/style.css` | create (reset + tokens) |
| `css/responsive.css` | create (empty + breakpoint headers) |
| `js/main.js` | create (module imports + init calls) |
| `js/config.js` | create (constants, empty username) |
| `js/theme.js` | create (empty `init`) |
| `js/nav.js` | create (empty `init`) |
| `js/animate.js` | create (empty `init`) |
| `js/projects.js` | create (empty `init`) |
| `js/contact.js` | create (empty `init`) |
| `images/favicon.svg` | create (placeholder) |
| `images/profile.*` | placeholder asset |

---

## 5. Acceptance Criteria

- [ ] Opening `index.html` via Live Server shows the six sections in default-browser style with no console errors.
- [ ] HTML passes [W3C validator](https://validator.w3.org/) (no blocker errors).
- [ ] No `var`; no inline `onclick`; no external JS/CSS libs (verify with `rg "\bvar\b" js/` and `rg "onclick=" index.html`).
- [ ] `:root` tokens are referenced via comments only (no usage yet); `:root[data-theme="dark"]` block exists.
- [ ] `js/main.js` loads as `type="module" defer` and successfully imports all five feature stubs (Network tab shows each `.js` 200 OK).
- [ ] Every `<img>` has `alt`; every `<input>` (when present) has `<label for>`.

---

## 6. Commit

```
chore: scaffold portfolio html, css tokens, js modules
```

One commit covers the whole scaffold per `.cursorrules` §6 Logical Commit Unit.

---

## 7. Risks / Notes

- `type="module"` requires HTTP serving — open `index.html` via Live Server, not `file://`.
- Use **relative paths** (`./css/...`, `./js/...`) so GitHub Pages doesn't 404 in Phase 5.
- Resist the temptation to style sections in this phase; leave that for Phase 1.

---

## 8. Definition of Done

- All files in `plan.md` §3 directory tree exist with the minimal contents above.
- Page loads with zero console errors and zero network 404s.
- Every later phase can edit existing files instead of creating structure.
