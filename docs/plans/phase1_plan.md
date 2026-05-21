# Phase 1 — Responsive Layout & Components

> Parent plan: [`docs/plan.md`](../plan.md) §6 Phase 1
> Subject reference: [`docs/subject.md`](../subject.md) §2.1, §4.2, §4.3

This phase converts the empty scaffold from Phase 0 into a **complete, mobile-first visual layout** for all six sections. No interactivity yet — buttons render but do nothing; the Projects grid uses static placeholder cards. Theme tokens drive all colors so that Phase 2's dark-mode toggle works for free.

---

## 1. Goal

- Implement mobile-first layout for **Hero / About / Skills / Projects (static placeholders) / Contact / Footer**.
- Add **768px** and **1024px** breakpoints (`min-width` only — no `max-width`).
- Hamburger button **markup + hide rules** are present (toggle logic comes in Phase 2).
- Nav uses **Flexbox** (logo left / menu right); Projects grid uses **CSS Grid `repeat(auto-fit, minmax(280px, 1fr))`** per `plan.md` §4.4.
- All colors / spacing / radii / shadows reference `:root` tokens — never literals — so dark-mode in Phase 2 needs **zero** further CSS rules.

---

## 2. Scope (In / Out)

**In scope**
- Final `css/style.css` baseline (mobile) styles for every section.
- `css/responsive.css` tablet + desktop layout rules.
- Hover / transition / shadow on cards and buttons.
- Hamburger button markup + media-query visibility (visible only ≤ 767px).
- Static placeholder card markup inside Projects grid (will be replaced dynamically in Phase 3).
- Contact form markup (label–for–id, required attrs) — JS validation is Phase 4.

**Out of scope**
- Theme toggle behavior (Phase 2).
- Smooth scroll / scroll-to-top JS (Phase 2).
- `IntersectionObserver` animations (Phase 2).
- GitHub API fetch (Phase 3).
- Form validation (Phase 4).

---

## 3. Tasks

### 3.1 Token expansion (`css/style.css`)
- Finalize `:root` token names used across this phase: `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-accent`, `--color-border`, `--radius-md`, `--shadow-card`, `--transition-base`, spacing scale.
- Mirror only color tokens under `:root[data-theme="dark"]`. Spacing / radii / shadows can stay shared.

### 3.2 Hero
- Centered headline, sub-headline (placeholder text — Phase 6 Bonus may animate it), primary CTA button.
- Reserve vertical breathing room via spacing tokens, not magic numbers.

### 3.3 About / Skills
- About: two-column layout on desktop (text + portrait); single column on mobile.
- Skills: chip / badge grid using flex-wrap. Each skill is a `<li>` inside a `<ul class="skills">`.

### 3.4 Projects (static)
- Container: `<section id="projects">` → `<div class="projects-grid">`.
- Grid CSS: `display: grid; gap: var(--space-4); grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));`
- 3–6 static placeholder `<article class="project-card">` items, each with title, description snippet, language tag, star count, "View on GitHub" link.
- Card hover: `transform: translateY(-4px)` + `box-shadow: var(--shadow-card-hover)` + `transition: var(--transition-base)`.

### 3.5 Contact (markup only)
- Form fields: `name`, `email`, `message`. Each input has a `<label for>` and a sibling `<p class="error" data-for="<field>"></p>` for Phase 4 to populate.
- Submit button + a single `<p class="form-status" role="status" aria-live="polite"></p>` slot.
- Form `novalidate` so browser-native bubbles don't compete with custom errors in Phase 4.

### 3.6 Footer
- Copyright line + small inline social links (placeholder hrefs ok).

### 3.7 Nav + Hamburger markup
- `<header>` → `<nav class="nav">` with `.nav__logo` and `.nav__menu` (ul of anchor links).
- `<button class="nav__hamburger" aria-label="Open menu" aria-expanded="false">` with three `<span>` bars inside.
- Mobile baseline CSS: `.nav__menu` hidden (e.g. `display: none`), `.nav__hamburger` visible.
- Tablet+ (`@media (min-width: 768px)`): `.nav__menu { display: flex; }`, `.nav__hamburger { display: none; }`.
- Phase 2 will add a class like `.nav__menu--open` that re-shows the menu on mobile via JS toggle.

### 3.8 Responsive rules (`css/responsive.css`)
- `@media (min-width: 768px) { ... }`: enable two-column About, show nav menu, hide hamburger, increase section padding.
- `@media (min-width: 1024px) { ... }`: max-width container (`max-inline-size: 1100px; margin-inline: auto;`), larger Hero spacing.
- No `max-width` queries; mobile is the default.

---

## 4. Files Touched

| File | Change |
| ---- | ------ |
| `index.html` | Fill out section markup (Hero text, Skills list, static project cards, Contact form, Footer) + hamburger button |
| `css/style.css` | All baseline (mobile) styles + hover/transition/shadow + extended token set |
| `css/responsive.css` | 768 / 1024 media queries |
| `images/` | Add real placeholders for profile + (optional) static card images |

JS files are untouched in this phase.

---

## 5. Acceptance Criteria

- [ ] At Chrome DevTools widths **360 / 768 / 1280**, every section is laid out with no horizontal scrollbar.
- [ ] Nav menu hidden at ≤ 767px; hamburger button visible (no toggle yet — that's Phase 2).
- [ ] Nav menu visible at ≥ 768px; hamburger hidden.
- [ ] Project cards reflow via `auto-fit minmax(280px, 1fr)` — verify by resizing the window.
- [ ] Card hover triggers a visible transform + shadow change with smooth transition.
- [ ] No color / spacing / radius literal appears in stylesheets (all reference `var(--...)`). Verify with `rg "#[0-9a-fA-F]{3,6}" css/` and confirm only the `:root` token declarations match.
- [ ] HTML still validates (no blocker errors). Every `<input>` has `<label for>`; every `<img>` has `alt`.
- [ ] No console errors. No JS behavior added — buttons are clickable but cause no side effects (yet).

---

## 6. Commit

```
feat: add responsive layout for all sections
```

---

## 7. Risks / Notes

- Hard-coding any color or spacing literal will create rework in Phase 2 — keep tokens disciplined.
- Static placeholder cards are intentional; Phase 3 replaces the grid contents at runtime. Use markup similar to the dynamic cards so the swap is mechanical.
- Project card minimum width (280px) was chosen to allow 3-up at 1024px with comfortable gutters; do not lower without re-verifying the 1024 layout.

---

## 8. Definition of Done

- Mobile / tablet / desktop layouts complete for all six sections.
- Tokens drive all visual styling; dark theme tokens already declared though not yet toggleable.
- Phase 2 can attach behavior to the existing markup without HTML restructure.
