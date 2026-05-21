# Portfolio Bonus Implementation Plan (bonus_plan.md)

This document plans the **bonus tasks** in `docs/subject.md` §5. It assumes the core mission (`docs/plan.md` Phases 0–5) is **done and deployed**, and starts a new phase on top of the working portfolio site. Per `.cursorrules` §4 (YAGNI), we keep additions **minimal** and only extend modules where the existing responsibility already fits.

Subject §5 lists four optional items:

| Item                  | Subject text                                        |
| --------------------- | --------------------------------------------------- |
| **Project filtering** | Filter by language with `array.filter()`            |
| **Typing effect**     | Typewriter in Hero                                  |
| **Real form submit**  | Formspree or EmailJS                                |
| **System dark mode**  | `prefers-color-scheme` media query                  |

---

## 1. Goal Summary

- Add the four bonus features **without breaking** the four Projects UI states, the form validation flow, or the dark-mode persistence locked in `plan.md` §2 / §5.
- Keep the **single static `index.html`** model; no build step, no external libraries beyond the third-party form endpoint (Formspree or EmailJS) which is contacted only at submit time.
- Follow the existing module split (`theme` / `nav` / `animate` / `projects` / `contact` in `js/`); add only when an existing file's responsibility no longer fits (.cursorrules §4 “split after evidence”).
- Bonus features ship as a **separate set of commits** so the core grading scope is untouched (`.cursorrules` §6 Logical Commit Unit).
- Keep `localStorage["theme"]` as the **explicit override** — system dark mode applies only when the user has never toggled.

---

## 2. Locked Decisions

Decisions for items left free by subject §5 (UI placement, filter syntax, fallback behavior, etc.) and for choices that would be expensive to reverse later.

| Item                                  | Decision                                                                                                                  | Rationale                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Project filter source                 | **GitHub repo `language` field**, normalized to lowercase                                                                 | Same data already fetched in core; no extra API call                               |
| Project filter UI                     | Horizontal **chip group** above the Projects grid: `All` + one chip per distinct language present in the response        | Auto-derived from data; no manual maintenance                                      |
| Project filter selection model        | **Single-select** (`activeLanguage: string \| "all"`)                                                                     | Subject demonstrates `array.filter()`; multi-select adds combinator semantics (YAGNI) |
| Project filter state placement        | Lives inside `js/projects.js` (extends the existing `status`/`repos[]` state)                                             | Same module already owns the cards; avoids cross-module wiring                     |
| Project filter empty result           | Reuse the existing **Empty** state DOM with text `No projects in <language>`                                              | One render path; no fifth UI state                                                 |
| Typing effect placement               | Hero **sub-headline only** (a single role / tagline). Main name stays static for accessibility and CLS                    | Avoids re-rendering the main heading; preserves SEO crawl                          |
| Typing effect data                    | Array of phrases in `js/config.js` (e.g. `["Frontend Developer", "Open Source"]`)                                         | Single source of truth, no DOM scraping                                            |
| Typing effect motion                  | Type → hold → erase → next; respects **`prefers-reduced-motion: reduce`** by showing the first phrase statically          | A11y requirement                                                                   |
| Typing effect timing                  | Type 60 ms/char · hold 1500 ms · erase 30 ms/char · gap 400 ms — all constants in `js/config.js`                          | Tunable in one place                                                               |
| Real form submit provider             | **Formspree** (HTML form `action` POST; no API key in JS)                                                                 | Simpler than EmailJS SDK; no extra library; works on a static GitHub Pages host    |
| Form endpoint storage                 | Endpoint URL in `js/config.js` as `const FORMSPREE_ENDPOINT = "..."`                                                      | Public anyway; one place to swap                                                   |
| Form submit flow                      | Keep existing client validation. On valid input: `fetch(endpoint, { method: "POST", body: FormData })`; show success/error in the existing message slot | Reuses validation, success UI, and error patterns                                  |
| Form submit fallback                  | If `fetch` rejects or returns non-2xx → show existing error message + **Retry** affordance (re-submit re-enables button)  | Mirrors Projects error/retry pattern                                               |
| System dark mode trigger              | **Only when `localStorage["theme"]` is unset**. Once the user toggles, the stored value wins forever                      | User intent overrides system; predictable across devices                           |
| System dark mode listener             | `window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ...)` — applied **only** while no override  | Live-updates if OS theme changes mid-session                                       |
| Toggle reset (optional, not in scope) | No "reset to system" button in this phase                                                                                 | YAGNI                                                                              |

> All other free choices follow `docs/plan.md` §2 (breakpoints, scroll thresholds, ES Modules, relative paths, etc.). This file does **not** override any decision locked there.

---

## 3. Affected Files (Minimal Footprint)

Edit existing modules rather than introduce new layers. No new JS module is justified because each bonus item maps onto an existing one.

| File                | Change                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| `index.html`        | Add filter chip container above Projects grid; add `<span>` slot for Hero typing text; small a11y attributes |
| `css/style.css`     | Filter chip styles (active state via token), typing caret animation, form status states                      |
| `css/responsive.css`| Filter chip row wraps to two lines on mobile                                                                 |
| `js/config.js`      | Add `HERO_PHRASES`, typing timings, `FORMSPREE_ENDPOINT`                                                     |
| `js/projects.js`    | Extend state with `activeLanguage`; derive chip list from `repos`; filter before render; empty-state copy    |
| `js/theme.js`       | Initial-load lookup: `localStorage` first → else `matchMedia` → else light; add `matchMedia` change listener guarded by "no override" |
| `js/contact.js`     | After local validation passes: POST to `FORMSPREE_ENDPOINT`; reuse error/success slot                        |
| `js/hero.js` *(new)*| Typewriter loop; honors `prefers-reduced-motion`; exports `init()` called from `main.js`                     |
| `js/main.js`        | Call `hero.init()` alongside existing module inits                                                           |
| `README.md`         | Append a "Bonus Features" section once the items land; document Formspree setup and override semantics      |

> The single new module (`js/hero.js`) is justified because no current module owns Hero animation; folding it into `animate.js` would mix `IntersectionObserver` orchestration with text-mutation logic (.cursorrules §5 SRP).

---

## 4. Project Filtering (subject §5 item 1)

### 4.1 State extension

`js/projects.js` already holds `{ status, repos }`. Add `activeLanguage: string` (default `"all"`).

- After a successful fetch, derive `languages = Array.from(new Set(repos.map(r => r.language).filter(Boolean))).sort()`.
- Render the chip row: `All` + each language (lowercased label, original casing for display).
- Clicking a chip sets `activeLanguage` and triggers `renderSuccess` again.

### 4.2 Filter logic

```js
const visible = activeLanguage === "all"
  ? repos
  : repos.filter(r => (r.language ?? "").toLowerCase() === activeLanguage);
```

- Repos with `language === null` show only under `All`.
- If `visible.length === 0` → reuse the **Empty** branch with copy `No projects in <language>`. Do **not** introduce a fifth UI state.

### 4.3 Output / behavior

- Active chip has `aria-pressed="true"` and a token-driven highlight.
- Switching chips never re-fetches; cards re-render from the in-memory `repos`.
- On `Retry` (Error → Loading → Success) the filter selection is reset to `"all"` to avoid showing a stale empty message.

---

## 5. Typing Effect (subject §5 item 2)

### 5.1 Module shape (`js/hero.js`)

A small finite-state loop with one `setTimeout` chain (no `setInterval`):

1. Read `HERO_PHRASES` from `config.js`. If empty → skip.
2. Check `window.matchMedia("(prefers-reduced-motion: reduce)").matches`. If reduced → set `textContent` to `HERO_PHRASES[0]` and return.
3. Otherwise loop: type each char with `TYPE_MS` delay → hold `HOLD_MS` → erase with `ERASE_MS` → wait `GAP_MS` → advance phrase index modulo `HERO_PHRASES.length`.

### 5.2 Markup contract

```
<h1>Your Name</h1>
<p class="hero-tagline">
  I'm a <span id="hero-typed" aria-live="polite"></span><span class="caret" aria-hidden="true"></span>
</p>
```

- The `<span id="hero-typed">` is the only text mutated.
- Caret blink is a pure CSS keyframe — no JS for the caret.

### 5.3 Acceptance

- No layout shift while typing (the `<p>` reserves height via `min-height` token).
- Reduced-motion users see a single static phrase, no caret animation.

---

## 6. Real Form Submit (subject §5 item 3)

### 6.1 Flow change in `js/contact.js`

Current flow (core): validate → `preventDefault()` → success message + reset.

Bonus flow:

1. Run existing client validation. If invalid → unchanged behavior.
2. On valid:
   - Disable submit button, show inline "Sending..." status (reuse existing status slot).
   - `await fetch(FORMSPREE_ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) })`.
   - On 2xx → show success message, reset form.
   - On non-2xx or thrown → show error message + re-enable button so user can retry.
3. Wrap network call in `try/catch`; never leave the button disabled on failure.

### 6.2 Why Formspree (not EmailJS) for this phase

- Formspree accepts a plain `POST` from the browser to a per-form endpoint URL; no SDK to load.
- EmailJS requires importing their SDK and exposing two IDs + a user key in JS — larger surface for the same outcome.
- The locked decision is reversible: only `FORMSPREE_ENDPOINT` and the body shape change if we ever switch.

### 6.3 Status DOM

Reuse the existing `<p class="form-status" role="status" aria-live="polite">` element. Toggle modifier classes `is-sending` / `is-success` / `is-error` so styling stays in CSS.

---

## 7. System Dark Mode (subject §5 item 4)

### 7.1 Initial-load resolution in `js/theme.js`

```
stored = localStorage.getItem("theme")
if stored in {"light", "dark"} → apply stored
else if matchMedia("(prefers-color-scheme: dark)").matches → apply "dark" (do NOT write to storage)
else → apply "light" (do NOT write to storage)
```

Writing to storage **only** happens inside the toggle handler. That preserves "system follows OS" until the user makes an explicit choice.

### 7.2 Live update

Add a `matchMedia("(prefers-color-scheme: dark)").addEventListener("change", handler)`. Inside the handler:

```
if localStorage.getItem("theme") is set → do nothing  // user override wins
else → apply system preference
```

### 7.3 Acceptance

- Fresh visit on a dark-mode OS → site loads in dark, `localStorage` empty.
- User toggles to light once → site stays light forever across reloads, OS change ignored.
- Different browser profile / cleared storage → falls back to OS preference again.

---

## 8. Phased Plan

Each phase = **one logical change = one commit** (`.cursorrules` §6). Conventional Commits prefix.

### Phase B0 — Branch off & docs

- Branch off (e.g. `bonus`) from the deployed core.
- Add this file as `docs/bonus_plan.md`.
- Commit: `docs: plan bonus tasks (filter, typing, form submit, system dark)`

### Phase B1 — Project language filter

- Extend `js/projects.js` state and render; add chip styles in `css/style.css`; wrap row on mobile in `css/responsive.css`.
- Manual check: success → switch chip → empty branch on rare language.
- Commit: `feat: filter projects by language with chip selector`

### Phase B2 — Hero typing effect

- Add `js/hero.js` and wire `init()` in `main.js`; add `HERO_PHRASES` + timings to `config.js`; CSS caret keyframe; `min-height` on tagline `<p>`.
- Manual check: reduced-motion OS shows static phrase.
- Commit: `feat: add hero typewriter effect`

### Phase B3 — Real form submit (Formspree)

- Set `FORMSPREE_ENDPOINT` in `config.js`; extend `contact.js` submit flow; status DOM modifiers.
- Manual check: valid submit → real email arrives; offline → error + retry; invalid → still blocked client-side.
- Commit: `feat: submit contact form via formspree`

### Phase B4 — System dark mode

- Update `theme.js` initial resolution and `matchMedia` listener; keep override semantics intact.
- Manual check: clear storage + flip OS theme → site follows; toggle once → site sticks.
- Commit: `feat: respect prefers-color-scheme when no theme override`

### Phase B5 — README sync

- Append a "Bonus Features" section to `README.md` documenting filter UX, typing effect, Formspree setup, and the system dark-mode override rule. Add screenshots if any chip/state visuals changed.
- Commit: `docs: document bonus features and formspree setup`

---

## 9. Verification Strategy

Same posture as `plan.md` §7 (no automated suite required; manual checklist). New checks layered on top of the core checklist:

- [ ] **Filter**: chip row matches the set of distinct `language` values; clicking a chip filters cards without re-fetching; rare-language chip → existing Empty DOM with `No projects in <language>`; `All` always reappears after Retry.
- [ ] **Filter a11y**: active chip has `aria-pressed="true"`; chips are focusable buttons (not divs).
- [ ] **Typing**: no layout shift on first paint; reduced-motion users see a static phrase; loop continues indefinitely without console errors.
- [ ] **Form**: client validation still blocks invalid input; valid input triggers a real POST; success/error/sending states reuse the existing status slot; submit button re-enables on failure.
- [ ] **Form privacy**: no API key in the JS bundle; only the public Formspree endpoint URL is shipped.
- [ ] **System dark**: clearing `localStorage` + flipping OS theme updates the site live; once the toggle is used, storage value wins forever.
- [ ] **Regressions**: all core checklist items in `plan.md` §7 still pass on the deployed bonus build.

---

## 10. Risks / Open Points

| Risk                                                                | Mitigation                                                                                                                       |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| GitHub API `language` field is `null` for many repos                | Treat `null` as "uncategorized", visible only under `All`; do not surface a `null` chip                                          |
| Formspree free tier limits / outages                                 | Show retry on non-2xx; document the limit in `README.md`; never block client validation on network state                         |
| Typewriter conflicts with screen readers (announcement spam)         | `aria-live="polite"` + reduced-motion fallback; do not animate the visible heading                                              |
| `matchMedia` event listener leak on hot reload during dev            | Single `addEventListener` in `theme.init()`; idempotent guard so re-init doesn't double-subscribe                               |
| Exposed Formspree endpoint abused via scripted POSTs                 | Out of scope for this assignment; mention in `README.md` and consider Formspree's reCAPTCHA toggle only if abuse appears        |
| User flips between OS dark/light expecting site to follow after toggling once | Documented as locked behavior (override wins); add an explicit "reset to system" button only if requested (deferred)        |
| Filter chip row overflowing on small screens                        | `flex-wrap` + token-based gap; verified at 360px in the responsive checklist                                                     |

---

## 11. Definition of Done

- Filter chip row renders one chip per distinct language plus `All`; selecting a chip narrows the visible cards via `array.filter()`; empty filter result reuses the existing Empty DOM.
- Hero sub-headline cycles through the configured phrases with a CSS caret; reduced-motion users see a single static phrase with no caret animation.
- Contact form sends a real POST to `FORMSPREE_ENDPOINT` on valid input, surfaces success / error / sending in the existing status slot, and re-enables the submit button on failure.
- On a fresh visit with no `localStorage["theme"]`, the site follows `prefers-color-scheme` (including live OS theme changes); once the user toggles, the stored choice overrides the system forever.
- All four bonus features work on the same deployed GitHub Pages URL as the core site; no console errors; no broken core flows from `plan.md` §9.
- `README.md` documents the four bonus features, the Formspree setup, and the system-dark-mode override rule.
- No new external JS/CSS libraries beyond the Formspree POST endpoint.
