# Phase 2 — Interactions & Dark Mode Persistence

> Parent plan: [`docs/plan.md`](../plan.md) §6 Phase 2
> Subject reference: [`docs/subject.md`](../subject.md) §2.4, §4.4, §4.5, §4.8

This phase brings the layout to life. Three modules — `theme`, `nav`, `animate` — each own one **event → state → render** flow per `plan.md` §4.1, satisfying subject §4.8's "at least 3 flows" requirement before we even touch the GitHub API.

---

## 1. Goal

- `theme.js`: dark-mode toggle that persists in `localStorage["theme"]`.
- `nav.js`: hamburger toggle, smooth-scroll on nav anchor click, scroll-to-top button (> 300px), nav background change (> 60px).
- `animate.js`: `IntersectionObserver` with `threshold: 0.2` adds an entrance class once per element.
- Each module exports a single `init()` called from `main.js` (already wired in Phase 0).
- All DOM access uses `querySelector` / `querySelectorAll` and `addEventListener`; classes toggled only via `classList`.

---

## 2. State → Render Flows Locked Here

Per `plan.md` §4.1:

| Module | Trigger | State | Render |
| ------ | ------- | ----- | ------ |
| `theme` | toggle `click`, page load | `currentTheme: "light" \| "dark"` | `<html data-theme="...">` + write `localStorage["theme"]` |
| `nav` | `click`, `scroll` | `isMenuOpen`, `isScrolled` | `.nav__menu--open`, `.nav--scrolled`, `.to-top--visible` |
| `animate` | `IntersectionObserver` `intersect` | per-element `seen: boolean` | add `.is-visible`, then `unobserve` |

---

## 3. Tasks

### 3.1 `js/theme.js`
- Inside `init()`:
  1. Read `localStorage.getItem("theme")`. If `"light"` or `"dark"`, apply to `document.documentElement.dataset.theme`. Otherwise default to `"light"` (do **not** write to storage at load time — Phase 6 Bonus depends on this).
  2. Query the toggle button (e.g. `.theme-toggle`) and bind `click` to a handler that flips `dataset.theme` and writes the new value to `localStorage["theme"]`.
  3. Update the toggle's `aria-pressed` and visible icon/label to reflect current state.
- Pure DOM mutation through `classList` / `dataset`; no inline `style`.

### 3.2 `js/nav.js`
- `init()` queries:
  - `.nav__hamburger`, `.nav__menu` for menu open/close.
  - `nav` element + thresholds `NAV_BG_THRESHOLD` / `SCROLL_TOP_THRESHOLD` from `config.js`.
  - All `a[href^="#"]` inside the nav for smooth scroll.
  - `.to-top` button for scroll-to-top.
- Behaviors:
  - **Hamburger**: `click` toggles `.nav__menu--open` and updates `aria-expanded`. Close on anchor click to dismiss the menu after navigation on mobile.
  - **Smooth scroll**: anchor `click` → `event.preventDefault()` → `document.querySelector(href).scrollIntoView({ behavior: "smooth", block: "start" })`.
  - **Scroll listener** (`window`, passive): set `.nav--scrolled` when `scrollY > NAV_BG_THRESHOLD`; set `.to-top--visible` when `scrollY > SCROLL_TOP_THRESHOLD`. Use `classList.toggle(name, condition)`.
  - **Scroll-to-top click**: `window.scrollTo({ top: 0, behavior: "smooth" })`.

### 3.3 `js/animate.js`
- `init()`:
  1. Select every element that should animate in (e.g. `[data-animate]` or `.section, .project-card`).
  2. Instantiate `new IntersectionObserver(entries => ..., { threshold: OBSERVER_THRESHOLD })`.
  3. On `entry.isIntersecting === true`, add `.is-visible` to `entry.target`, then call `observer.unobserve(entry.target)` so animation runs once.
  4. Loop through the selection and `observer.observe(el)`.
- Add CSS in `css/style.css` for the initial hidden state and the `.is-visible` final state (opacity + translateY transition tied to `--transition-base`).

### 3.4 CSS additions (`css/style.css`)
- `.nav--scrolled` background / shadow change.
- `.nav__menu--open` displays the menu container on mobile (`display: flex; flex-direction: column; ...`).
- `.to-top` base + `.to-top--visible` (`opacity` + `pointer-events`).
- Animate-in baseline: `[data-animate] { opacity: 0; transform: translateY(16px); transition: ...; }` and `.is-visible` resets both.

### 3.5 `config.js`
- Confirm constants already present from Phase 0 are used here:
  - `SCROLL_TOP_THRESHOLD = 300`
  - `NAV_BG_THRESHOLD = 60`
  - `OBSERVER_THRESHOLD = 0.2`

---

## 4. Files Touched

| File | Change |
| ---- | ------ |
| `js/theme.js` | Full implementation of toggle + persistence |
| `js/nav.js` | Full implementation of hamburger, smooth scroll, scroll listeners |
| `js/animate.js` | `IntersectionObserver` wiring + unobserve-after-visible |
| `css/style.css` | Add `.nav--scrolled`, `.nav__menu--open`, `.to-top--visible`, `[data-animate]` / `.is-visible` styles |
| `index.html` | Mark animate targets with `data-animate` if not already; ensure `.theme-toggle` and `.to-top` button exist |

`projects.js` and `contact.js` stay as empty stubs.

---

## 5. Acceptance Criteria

- [ ] Toggle dark mode → `<html data-theme="dark">` appears; reload preserves the choice (`localStorage["theme"] === "dark"`).
- [ ] Toggle to light → storage updates to `"light"` and survives reload.
- [ ] At ≤ 767px width, hamburger button toggles the menu; `aria-expanded` reflects state; tapping any nav link closes the menu.
- [ ] Nav anchor click smoothly scrolls to the target section with the section's heading aligned to the top of the viewport.
- [ ] Scrolling past 60px adds a visible background/shadow to the nav; scrolling back removes it.
- [ ] Scrolling past 300px fades in the scroll-to-top button; clicking it smoothly scrolls to top.
- [ ] Sections / cards fade & translate in once when entering the viewport, then never re-animate (verified by scrolling out and back).
- [ ] No console errors. No `var`. No inline `onclick`. No `getElementById` (use `querySelector` only).
- [ ] All dynamic class changes use `classList.add` / `remove` / `toggle` — verify with `rg "\.className\s*=" js/` (should be empty).

---

## 6. Commit

```
feat: add theme toggle, navigation, and scroll animations
```

---

## 7. Risks / Notes

- Use `passive: true` on the `scroll` listener (`{ passive: true }`) for smoother performance.
- Re-running `init()` (e.g. during dev with module HMR-like reloads) should not double-bind listeners. For this assignment a fresh page reload is the contract — but keep handlers in named functions so an idempotent guard can be added in Phase 6 if needed.
- `IntersectionObserver` is supported on every browser the assignment targets; no polyfill needed.
- The "initial load = don't write to localStorage" rule matters for the bonus phase that adds `prefers-color-scheme`. Honor it now.

---

## 8. Definition of Done

- Three independent **event → state → render** flows wired and verifiable in the browser.
- Dark-mode persistence survives full reloads.
- Nav, hamburger, smooth-scroll, scroll-to-top, scroll-background, and entrance-animation all functional via vanilla JS.
- Phase 3 can plug `projects.js` into the existing markup without touching theme/nav/animate code.
