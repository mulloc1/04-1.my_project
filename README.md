# Responsive Portfolio Website

A single-page responsive portfolio built with plain HTML, CSS, and JavaScript by **mulloc1**. It showcases six sections (Hero, About, Skills, Projects, Contact, Footer), fetches GitHub repositories dynamically, and implements interactive UI features with no external libraries.

---

## Deploy URL

> GitHub Pages is not enabled yet. When deployed, the site will be available at:
>
> **[https://mulloc1.github.io/04-1.my_project/](https://mulloc1.github.io/04-1.my_project/)**
>
> Until then, run locally (see [Local Development](#local-development) below).

---

## Screenshots

Three viewports × two themes. Capture with Chrome DevTools Device Mode (360 / 768 / 1280 px) and save under `images/screenshots/`.

| | Light | Dark |
| --- | --- | --- |
| **Mobile (360px)** | ![Mobile light](images/screenshots/mobile-light.png) | ![Mobile dark](images/screenshots/mobile-dark.png) |
| **Tablet (768px)** | ![Tablet light](images/screenshots/tablet-light.png) | ![Tablet dark](images/screenshots/tablet-dark.png) |
| **Desktop (1280px)** | ![Desktop light](images/screenshots/desktop-light.png) | ![Desktop dark](images/screenshots/desktop-dark.png) |

---

## Tech Stack

| Layer | Choice |
| --- | --- |
| Markup | Semantic HTML5 |
| Styles | Plain CSS (mobile-first, `:root` design tokens, Flexbox + Grid) |
| Scripts | Vanilla JavaScript (ES Modules, `defer`) |
| Data | GitHub REST API (`/users/{username}/repos`) |
| Persistence | `localStorage` (dark mode) |
| Deployment | GitHub Pages (planned) |

**No external libraries** — no React, jQuery, Bootstrap, or npm packages. Google Fonts (Inter) is loaded via CDN `<link>` only.

---

## Features

Subject §2 deliverables:

- [x] **Responsive website** — Mobile-first layout with breakpoints at 768px (tablet) and 1024px (desktop). Six sections: Hero, About, Skills, Projects, Contact, Footer.
- [x] **Interactive UI** — Dark mode toggle, hamburger menu, smooth scroll, scroll-to-top button, nav background on scroll, Intersection Observer animations, and contact form validation.
- [x] **External API** — Projects section loads public repos from the GitHub API with loading, success, error (+ retry), and empty states.
- [x] **Persisted state** — Dark mode preference saved in `localStorage` under key `theme`; survives page reload.
- [ ] **Deployment** — GitHub Pages setup pending. All features verified locally via HTTP server.

---

## Local Development

### Prerequisites

- A local HTTP server — **VS Code Live Server** extension, or Python 3 built-in server.
- Modern browser (Chrome, Firefox, Safari, Edge).

> **Important:** `type="module"` scripts do **not** work when opening `index.html` via `file://`. You must serve the folder over HTTP.

### Steps

```bash
git clone git@github.com:mulloc1/04-1.my_project.git
cd 04-1.my_project
```

**Option A — VS Code Live Server**

1. Open the project folder in VS Code.
2. Right-click `index.html` → **Open with Live Server**.
3. Browser opens at `http://127.0.0.1:5500/` (port may vary).

**Option B — Python**

```bash
python3 -m http.server 8000
# Visit http://localhost:8000
```

---

## Configuration

Edit `js/config.js`:

```js
export const GITHUB_USERNAME = "mulloc1";  // your GitHub handle
```

| Constant | Default | Purpose |
| --- | --- | --- |
| `GITHUB_USERNAME` | `"mulloc1"` | GitHub account whose public repos populate the Projects section |
| `SCROLL_TOP_THRESHOLD` | `300` | Pixels scrolled before the scroll-to-top button appears |
| `NAV_BG_THRESHOLD` | `60` | Pixels scrolled before the nav background activates |
| `OBSERVER_THRESHOLD` | `0.2` | Intersection Observer ratio for scroll-in animations |

**GitHub API rate limit:** Unauthenticated requests are capped at **60 per hour per IP**. Frequent reloads during development may return HTTP 403 and trigger the error state — this is expected. Use the Retry button or wait for the limit to reset.

---

## Architecture Notes

### JS modules (single responsibility)

| Module | Responsibility |
| --- | --- |
| `main.js` | Entry point — imports and calls each module's `init()` |
| `config.js` | Shared constants (GitHub username, scroll thresholds) |
| `theme.js` | Dark/light toggle, `localStorage` persistence, `<html data-theme>` |
| `nav.js` | Hamburger menu, smooth scroll, nav scroll background, scroll-to-top |
| `animate.js` | `IntersectionObserver` scroll-in animations on `[data-animate]` sections |
| `projects.js` | GitHub API fetch, loading/success/error/empty rendering |
| `contact.js` | Form validation, per-field errors, success message on valid submit |

### Event → state → render flows

**1. Theme (`theme.js`)**

```
click toggle → currentTheme flips → <html data-theme> + localStorage updated → icon/label re-rendered
```

**2. Projects (`projects.js`)**

```
page load / Retry click → status = loading → spinner shown
                       → fetch succeeds → status = success → repo cards rendered
                       → fetch fails    → status = error   → message + Retry button
                       → no repos       → status = empty   → empty message
```

**3. Contact (`contact.js`)**

```
input event  → validateField → error text shown/hidden near field
submit event → validateAll   → if errors: render field errors
                             → if valid:   reset form + success message
```

---

## Subject Mapping

Quick reference for graders — maps `docs/subject.md` requirements to implementation.

| Subject ref | Requirement | Implementation |
| --- | --- | --- |
| §2.1 | Responsive layout, 6 sections | `index.html` — Hero, About, Skills, Projects, Contact, Footer |
| §2.2 | Interactive UI + form validation | `js/theme.js`, `js/nav.js`, `js/animate.js`, `js/contact.js` |
| §2.3 | GitHub API + UI states | `js/projects.js` — loading / success / error / empty |
| §2.4 | Persisted dark mode | `js/theme.js` — `localStorage.setItem("theme", ...)` |
| §2.5 | GitHub Pages deployment | Pending — see [Deploy URL](#deploy-url) |
| §4.1 | Project layout | `index.html`, `css/`, `js/`, `images/` |
| §4.2 | Semantic HTML, nav anchors, alt, label–for | `index.html` |
| §4.3 | CSS variables, Flexbox nav, Grid cards, responsive | `css/style.css`, `css/responsive.css` |
| §4.4 | defer, const/let, addEventListener, no onclick | All `js/*.js` modules |
| §4.5 | Hamburger, smooth scroll, scroll-to-top (300px), nav bg (60px), dark mode, IntersectionObserver (0.2), contact form | `js/nav.js`, `js/theme.js`, `js/animate.js`, `js/contact.js`, `js/config.js` |
| §4.6 | ES6+, map/filter, template literals | `js/projects.js`, `js/contact.js` |
| §4.7 | fetch + async/await, try/catch, API endpoint | `js/projects.js`, `js/config.js` |
| §4.8 | Event → state → render (≥ 3 flows) | `theme.js`, `projects.js`, `contact.js` |
| §4.9 | Deploy + README | This file |

---

## Acknowledgements

- **Font:** [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts CDN
- **Icons:** Unicode symbols (☀ / ☾) for theme toggle; no icon library
- **API:** [GitHub REST API](https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user) — public repos endpoint
- **Assignment:** Codyssey responsive portfolio mission (`docs/subject.md`)
