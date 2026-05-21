# Phase 5 — Deploy & README

> Parent plan: [`docs/plan.md`](../plan.md) §6 Phase 5
> Subject reference: [`docs/subject.md`](../subject.md) §2.5, §4.9

The portfolio is feature-complete after Phase 4. This phase pushes it to **GitHub Pages**, verifies every feature on the public URL, and writes the README that subject §4.9 grades on.

---

## 1. Goal

- Enable **GitHub Pages** on the repository so the portfolio is reachable at a public URL.
- Verify all features work identically on the deployed URL (no `file://`-only assumptions, no broken asset paths).
- Author `README.md` with: project intro, tech stack, **deploy URL**, **screenshots** (mobile / tablet / desktop, light / dark), local run instructions, and a subject-mapping checklist.

---

## 2. Deployment Steps

### 2.1 Pre-flight checks
Before enabling Pages, audit the working tree once:

- All asset paths in `index.html` are **relative** (`./css/...`, `./js/...`, `./images/...`). Hard-coded leading `/` will 404 on user/project Pages.
- `index.html` is at the root of the deployment directory (whichever directory Pages serves from).
- `js/config.js` `GITHUB_USERNAME` is set to a real account that has at least one public repo (otherwise Empty branch shows in deploy demo).
- No `console.log` debug lines remaining. Use `rg "console\." js/` to verify.
- No unused stub functions; every module's `init()` actually does something.

### 2.2 Enable GitHub Pages

Option A — `main` branch root:
1. Push the latest `main` to the remote.
2. Repo → Settings → Pages → Source → "Deploy from a branch" → Branch `main` → Folder `/ (root)`.
3. Save. Wait ~30–60s for the Pages build job.
4. Note the published URL (e.g. `https://<user>.github.io/<repo>/`).

Option B — `gh-pages` branch:
1. Create / push a `gh-pages` branch containing the production files.
2. Repo → Settings → Pages → Source → Branch `gh-pages` → Folder `/ (root)`.

Use Option A by default — the assignment is a static site living next to its docs in the same repo; no build step required.

### 2.3 Subdirectory note (important)
If the portfolio lives in a subdirectory (e.g. `04-1.my_project/index.html`), GitHub Pages does **not** serve subdirectories of `main` by default. Two acceptable workarounds:

- **Workaround A (preferred for this repo)**: publish only `04-1.my_project/` by either (1) using a dedicated branch where that folder is the root, or (2) creating a separate repo for the portfolio whose root contains `index.html`.
- **Workaround B**: leave the portfolio as a normal project page and embed only the live URL in the README. The assignment grades on the deployed URL, not on the source layout.

Lock the choice during this phase and document it in README. The simplest path is a dedicated repo whose root is the portfolio.

---

## 3. Post-deploy Verification

Re-run the `plan.md` §7 checklist against the **deployed URL** in three viewport widths (360 / 768 / 1280):

- [ ] Page loads with no console errors and no 404 in the Network tab.
- [ ] All six sections render at all three widths.
- [ ] Hamburger menu visible only at ≤ 767px and toggles correctly.
- [ ] Smooth scroll + nav background + scroll-to-top all work.
- [ ] Dark-mode toggle persists across reloads on the deployed URL.
- [ ] Projects section reaches **Loading → Success** on first load; **Error → Retry → Success** when network is throttled offline in DevTools; **Empty** for a username with zero public repos.
- [ ] Contact form errors / success render exactly as in local dev.
- [ ] Run a **Lighthouse** pass (Chrome DevTools → Lighthouse → Mobile). Aim for green on Performance / Accessibility / Best Practices / SEO; capture the score for the README "Validation" section. Address only easy wins (missing `meta description`, alt text gaps) — deeper perf tuning is out of scope.

---

## 4. README.md Contents

`README.md` lives at the **portfolio root** (next to `index.html`). It is the assignment's primary grading artifact for subject §4.9.

Required sections (in order):

1. **Title + one-line summary** — what this is and who built it.
2. **Deploy URL** — large, clickable link near the top.
3. **Screenshots** — three viewports × two themes = 6 images, embedded from `images/screenshots/` (create that folder). Use a small table layout so the README renders well on GitHub.
4. **Tech Stack** — Plain HTML / CSS / JS, ES Modules, GitHub REST API, deployed via GitHub Pages. Explicitly state "no external libraries".
5. **Features** — bulleted list mapping subject §2 deliverables: responsive layout / interactive UI / external API / persisted state / deployment. Mark each with a checkmark and one-sentence description.
6. **Local Development**
   - Prereq: VS Code with Live Server, or `python -m http.server`.
   - Steps to clone and run.
   - Note: `type="module"` does **not** work via `file://` — must use a local server.
7. **Configuration**
   - Edit `js/config.js` and set `GITHUB_USERNAME` to your handle.
   - Note the GitHub API rate limit (60/h unauthenticated) — frequent reloads can produce 403 / error state; this is expected.
8. **Architecture Notes** (short)
   - The 5 JS modules and their single responsibility.
   - The three event → state → render flows (`theme`, `projects`, `contact`).
9. **Subject Mapping** — table mapping each subject §2 / §4 requirement to a file or feature, so the grader can verify quickly.
10. **Acknowledgements** — fonts, icons (if any), references.

### 4.1 Screenshot capture tips
- Use Chrome DevTools "Device Mode" to set viewport to 360 / 768 / 1280, then DevTools → "Capture full size screenshot".
- Capture each viewport once in light and once in dark mode.
- Save as PNG under `images/screenshots/` with descriptive names: `mobile-light.png`, `tablet-dark.png`, etc.
- Keep file sizes reasonable (≤ 400 KB each); use a tool like `pngquant` if needed.

---

## 5. Files Touched

| File | Change |
| ---- | ------ |
| `README.md` | Author full content per §4 above |
| `images/screenshots/` | Add 6 screenshots |
| `js/config.js` | (Verify only) `GITHUB_USERNAME` is set |
| Repo settings | Enable Pages (no file change) |

No JS / CSS / HTML changes belong in this phase. If a bug is discovered during verification, fix it in its own phase / commit, not bundled with the README commit.

---

## 6. Commit

```
docs: add readme with deployment url and screenshots
```

---

## 7. Risks / Notes

- **Asset path 404s** are the single most common Pages deploy failure. Triple-check `./` prefixes everywhere.
- **Pages cache** can delay updates by a minute or two — hard-refresh (Cmd-Shift-R) when re-verifying.
- **API rate limit** during demos: open the deployed URL in a fresh incognito window if you've been reloading; otherwise the Empty / Error branch is fine to demonstrate intentionally.
- **Lighthouse Accessibility** score: ensure every interactive control has an accessible name (button `aria-label`, link text, etc.). Easy wins to grab here.
- Do not commit any `.env`, screenshots of private repos, or other secrets.

---

## 8. Definition of Done

- A public GitHub Pages URL renders the portfolio with all five subject §2 deliverables working.
- `README.md` includes intro, stack, deploy URL, screenshots, local run instructions, and subject mapping.
- All six manual verification items in §3 pass on the deployed URL.
- The assignment's core scope (`plan.md` Phases 0–5) is complete; bonus work continues in `bonus_plan.md`.
