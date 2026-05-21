# Responsive Portfolio Website Implementation Plan (plan.md)

This document is a phased implementation plan that satisfies both the requirements in `docs/subject.md` and the coding/structure rules in the repository `.cursorrules`. Following the **Minimal-First / YAGNI** principle (.cursorrules §4) and **Lightweight Plans** (.cursorrules §2), we start with the **minimum structure that meets requirements**; bonus tasks (subject §5) are separated into a later phase after the core assignment is done.

---

## 1. Goal Summary

- Build a **responsive portfolio website** using only **plain HTML / CSS / JavaScript** as a single page (not an SPA — one `index.html`) (subject §1, §4.1).
- Mobile-first responsive layout with six sections: **Hero**, **About**, **Skills**, **Projects**, **Contact**, **Footer** (subject §2.1, §4.2).
- Fetch your repositories via the **GitHub Public REST API**, render the **Projects** section dynamically, and express **loading / success / error / empty** UI states (subject §2.3, §4.7).
- Implement dark mode, hamburger menu, smooth scroll, scroll animations (`IntersectionObserver`), and form validation in vanilla JS (subject §4.5).
- Persist dark mode choice in **localStorage** (subject §2.4, §4.5).
- Modularize so the **event → state change → DOM update** flow is clearly visible in the code structure (at least 3 flows) (subject §3, §4.8).
- Deploy on **GitHub Pages** so all features work on a public URL (subject §2.5, §4.9).

---

## 2. Locked Decisions

Decisions for items left open in subject (“free”, etc.) and other choices fixed for this assignment that are costly to reverse now. (Specific function names, CSS variable names, etc. are decided during implementation — .cursorrules §2)

| Item | Decision | Rationale (subject / .cursorrules) |
| ---- | -------- | ---------------------------------- |
| Build tooling | **None** (static serving via Live Server) | subject §4.1 “VS Code + Live Server” |
| External libraries | **Not allowed** (CSS / JS vanilla only). Google Fonts CDN `<link>` only | subject §1, §4.1 |
| Module system | **ES Modules** (`<script type="module" src="js/main.js" defer>`) | Split multiple JS files without IIFE; satisfies `defer` (subject §4.4) |
| Breakpoints | mobile-first; tablet **`min-width: 768px`**, desktop **`min-width: 1024px`** (no `max-width`) | subject §4.3 reference values |
| CSS variable scope | Light tokens on `:root`; dark tokens on **`:root[data-theme="dark"]`** (toggle on `<html>`, not `body`) | subject §4.3 (`[data-theme="dark"]`) |
| Dark mode key | `localStorage` key **`theme`**, values `"light"` / `"dark"` | subject §2.4 / §4.5 persistence requirement |
| Scroll thresholds | scroll-to-top button **`> 300px`**, nav background change **`> 60px`** | subject §4.5 (sync with README) |
| `IntersectionObserver` threshold | **`0.2`** | subject §4.5 |
| GitHub API endpoint | `https://api.github.com/users/{USERNAME}/repos?sort=updated&per_page=12` | subject §4.7 + reasonable card grid size |
| GitHub username | **`const GITHUB_USERNAME = "..."`** in `js/config.js` only | Public info; single place to change |
| Form submit behavior | **Local validation only**, then success message (no real send). Formspree/EmailJS as bonus | subject §4.5, §5 |
| Image assets | Your own assets + favicon under `images/`. No external placeholder services | subject §4.1 |
| Deployment | **GitHub Pages** (`gh-pages` branch or `/` root on `main`). Single `index.html` entry | subject §2.5, §4.9 |
| Code style | **2-space indent** for HTML/CSS/JS; JS prefers `const`/`let`, arrow functions, template literals, destructuring | subject §4.4, §4.6 |

---

## 3. Directory / File Layout

Follows the recommended layout in subject §4.1. Module split is the **minimum** needed so **event → state → render** flows are clearly visible in at least 3 places (.cursorrules §4 “split after evidence”).

```
04-1.my_project/
├── README.md                 # intro · stack · deploy URL · screenshots (subject §4.9)
├── docs/
│   ├── subject.md
│   └── plan.md               # (this document)
├── index.html                # semantic markup for 6 sections
├── css/
│   ├── style.css             # :root tokens · shared components · section styles
│   └── responsive.css        # 768 / 1024 media queries · hamburger menu
├── js/
│   ├── main.js               # entry — calls each module's init()
│   ├── config.js             # GITHUB_USERNAME, thresholds, etc.
│   ├── theme.js              # dark mode: event → state → <html data-theme>
│   ├── nav.js                # hamburger toggle · smooth scroll · scroll nav bg · top button
│   ├── animate.js            # IntersectionObserver scroll-in animations
│   ├── projects.js           # GitHub API fetch · loading/success/error/empty render
│   └── contact.js            # form validation: input → validation state → error/success UI
└── images/
    ├── favicon.svg
    ├── profile.*
    └── projects/             # optional static card images
```

**Split rationale (.cursorrules §4·§5 SRP)**

- `theme` / `nav` / `animate` / `projects` / `contact` each own one **event → state → render** flow, naturally satisfying subject §4.8 “at least 3”.
- `config.js` is the single source of truth for public constants; change thresholds/username in one file only.
- `style.css` ↔ `responsive.css` is only base vs breakpoint responsibility — do not split further.

---

## 4. Architecture Overview

### 4.1 State Flow (State → Render) — subject §4.8 (minimum 3)

Each module follows this pattern:

```
DOM event  →  module internal state change  →  DOM class/attribute/text update
```

| Module | Trigger events | State | Render result |
| ------ | -------------- | ----- | ------------- |
| `theme` | toggle `click`, initial load | `currentTheme: "light"\|"dark"` | Update `<html data-theme>` + save `localStorage["theme"]` |
| `projects` | page load / **Retry** `click` | `status: "loading"\|"success"\|"error"\|"empty"`, `repos[]` | Projects section: cards / spinner / error + retry / empty message (4 branches) |
| `contact` | `input`, form `submit` | `errors: { name?, email?, message? }` | Toggle error text near fields; on success reset form + success message |
| `nav` | `click`, `scroll` | `isMenuOpen`, `isScrolled` | Hamburger `active` toggle, nav background class, scroll-to-top visibility |

### 4.2 DOM / Event Rules (subject §4.4)

- No inline handlers (`onclick`, etc.) in HTML. Bind everything in each module's `init()` via `addEventListener`.
- Use `querySelector` / `querySelectorAll` consistently. Do not use `getElementById` (consistency).
- Class changes only via `classList.add/remove/toggle` (no `element.className =`).
- Dynamic HTML: **template literals + `innerHTML`** or `document.createElement` — use `innerHTML` only at card granularity. No user input in dynamic HTML — escape GitHub API fields via `textContent` or an escape helper before display.
- Form submit: `event.preventDefault()` then custom validation.

### 4.3 Async / API (subject §4.7)

- Use `fetch` + `async`/`await` + `try/catch`.
- `projects.js`: single `loadProjects()` owns state transitions; render helpers `renderLoading / renderSuccess / renderError / renderEmpty` touch DOM only (.cursorrules §5 SRP).
- `map` repo → card HTML; optional `filter` to exclude fork/archived; inject into card grid container once.
- Retry button on error calls `loadProjects()` again — closed event → state loop.

### 4.4 CSS Tokens / Responsive (subject §4.3)

- Define color, spacing, font, shadow, radius, transition tokens on `:root`; dark theme overrides same keys on `:root[data-theme="dark"]`.
- Navigation = **Flexbox** (logo left / menu right); project cards = **CSS Grid `repeat(auto-fit, minmax(280px, 1fr))`**.
- Mobile first: base CSS is mobile; progressive enhancement at `min-width: 768px` / `1024px`.
- Hover, transitions, card shadows defined via tokens.

---

## 5. Output / UI Specification (Acceptance UI States)

Use the visual/behavior spec below as the baseline for README screenshots and manual verification (no automated test suite required).

### 5.1 Projects Section — 4 States

| State | DOM |
| ----- | --- |
| Loading | Spinner + text “Loading projects...” inside container |
| Success | N cards (name, description, language, ★, link). Card hover: transform/shadow |
| Error | Message “Failed to load projects.” + **Retry** button |
| Empty | Message “No public repositories yet.” |

### 5.2 Dark Mode

- Initial load: `localStorage.theme` first → else light. (Bonus: add `prefers-color-scheme`)
- On toggle, only `<html data-theme>` changes; all sections update via token overrides.

### 5.3 Form Validation

- Name: non-empty.
- Email: simple regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
- Message: non-empty (min length 10 chars recommended; finalize during implementation).
- Errors shown in `.error` below each field; on pass keep `preventDefault`, reset form, show success message.

### 5.4 Interactions

- Hamburger: visible only at ≤ 767px; click toggles menu container `classList.toggle('active')`.
- Smooth scroll: nav anchor click → `scrollIntoView({ behavior: 'smooth' })`.
- Scroll-to-top: toggle visible class when `window.scrollY > 300`; click → `window.scrollTo({ top: 0, behavior: 'smooth' })`.
- Nav background: toggle `scrolled` when `window.scrollY > 60`.
- Scroll animation: `IntersectionObserver` with `threshold: 0.2` adds `visible` to sections/cards (unobserve after first appearance).

---

## 6. Phased Implementation Plan

Each phase = **one logical change = one commit** (.cursorrules §6 Logical Commit Unit), with Conventional Commits prefixes. (.cursorrules §2 “coarse steps: 3–7”)

### Phase 0 — Scaffolding & Semantic Markup

- `index.html` skeleton for 6 sections (`<header>/<nav>/<main>/<section>/<article>/<footer>`), valid `alt` / `label-for`.
- `css/style.css`: reset + `:root` tokens only; `css/responsive.css` empty stub.
- `js/main.js`: `<script type="module" defer>` wiring only; modules export empty stubs.
- Commit: `chore: scaffold portfolio html, css tokens, js modules`

### Phase 1 — Responsive Layout & Components

- Complete mobile UI for Hero / About / Skills / Projects (static card placeholders) / Contact / Footer.
- Apply 768 / 1024 breakpoints in `responsive.css`; hamburger markup and hide rules.
- Card grid `auto-fit minmax`, nav flexbox.
- Commit: `feat: add responsive layout for all sections`

### Phase 2 — Interactions & Dark Mode Persistence

- `theme.js` (initial apply + toggle + localStorage), `nav.js` (hamburger / smooth scroll / scroll-to-top / background), `animate.js` (`IntersectionObserver`).
- Each module exports `init()`; `main.js` calls them.
- Commit: `feat: add theme toggle, navigation, and scroll animations`

### Phase 3 — GitHub API Integration & 4-State Render

- `projects.js`: `loadProjects()` + 4-branch render, cards via `map`, errors via `try/catch` → Retry.
- Username / endpoint in `config.js`.
- Verify empty state for blank username or zero repos.
- Commit: `feat: render github repositories with loading and error states`

### Phase 4 — Contact Form Validation

- `contact.js`: live errors on `input`, `preventDefault` + full validation on `submit`, success message.
- Commit: `feat: add contact form with client-side validation`

### Phase 5 — Deploy & README

- Enable GitHub Pages; verify all features on public URL (no console errors + light Lighthouse check).
- `README.md`: intro / stack / deploy URL / screenshots (mobile/tablet/desktop, light/dark) / local run instructions / subject mapping.
- Commit: `docs: add readme with deployment url and screenshots`

### Phase 6 (Optional) — Bonus (subject §5)

- Only after core passes, in separate commits (.cursorrules §4 YAGNI).
- Candidates: language filter (`filter`), Hero typing effect, Formspree/EmailJS real submit, system dark mode via `prefers-color-scheme`.

---

## 7. Verification Strategy

This assignment has no mandatory automated tests; use a **manual verification checklist** for acceptance (.cursorrules §6 Testing Determinism discourages network-dependent tests — verify GitHub API manually and confirm error branch offline).

Checklist:

- [ ] Responsive: all 6 sections layout correctly at Chrome DevTools widths 360 / 768 / 1280.
- [ ] Semantic: HTML Validator passes (no blocker errors); every `<img>` has `alt`; every `<input>` has matching `<label for>`.
- [ ] JS: zero console errors; no `var`; no inline `onclick` (confirm with `grep`).
- [ ] Dark mode: toggle persists after refresh (`localStorage.theme`).
- [ ] Hamburger: visible only ≤ 767px; toggle class works.
- [ ] Scroll: nav background after > 60px; top button after > 300px; click scrolls to top.
- [ ] Smooth scroll: nav click aligns target section correctly.
- [ ] `IntersectionObserver`: one-time entrance animation for cards/sections.
- [ ] GitHub API: spinner → cards. Block network → error + Retry. Change username to account with 0 repos → empty.
- [ ] Form: errors on empty/invalid email; success message + form reset on valid input; no navigation (`preventDefault`).
- [ ] Deploy: same behavior on GitHub Pages URL; no 404 asset paths.

---

## 8. Risks / Deferred Decisions

| Item | Risk | Mitigation |
| ---- | ---- | ---------- |
| GitHub API rate limit (60/h) | Frequent refresh during demo → 403 | Cache response in `sessionStorage` (bonus) — document limit in README for core scope |
| `innerHTML` with external data | XSS | Insert `name`/`description`/`language` via `textContent` or escape helper |
| GitHub Pages asset paths | Absolute paths (`/css/...`) 404 on user/project pages | Use **relative paths** (`./css/...`) for all static assets |
| Live Server vs `file://` | `type="module"` fails on `file://` due to CORS | README: must use Live Server / `python -m http.server` |
| Bonus vs plan drift | Later choices may diverge from §2 table | Update §2 table when starting bonus; note plan changes in commit message |

---

## 9. Definition of Done

- All five deliverables in subject §2 are met (responsive / interactive UI / external API / persisted state / deployment).
- Six semantic sections exist; no inline handlers, `var`, or external libraries in HTML (subject §4.2, §4.4).
- Layout holds at mobile/tablet/desktop; dark mode survives refresh (subject §2.4, §4.5).
- Projects section shows all four states: loading / success / error / empty per GitHub API (subject §4.7).
- Contact form: client validation + `preventDefault` + success message (subject §4.5).
- **Event → state → render** is separated into at least **`theme` / `projects` / `contact`** modules (subject §4.8).
- All features work the same on the public GitHub Pages URL (subject §2.5, §4.9).
- `README.md` includes intro, stack, deploy URL, screenshots, local run instructions (subject §4.9).
- All six learning objectives in subject §3 can be explained from this plan §3–§4 and the implementation.
