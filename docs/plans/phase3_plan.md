# Phase 3 — GitHub API Integration & 4-State Render

> Parent plan: [`docs/plan.md`](../plan.md) §6 Phase 3
> Subject reference: [`docs/subject.md`](../subject.md) §2.3, §4.6, §4.7

Replace the static project cards from Phase 1 with **live data from the GitHub Public REST API**. This phase owns the second of the three required state flows: `status` ∈ {`loading`, `success`, `error`, `empty`}. All four UI branches must be reachable and visually distinct.

---

## 1. Goal

- `loadProjects()` in `js/projects.js` fetches `https://api.github.com/users/{GITHUB_USERNAME}/repos?sort=updated&per_page=12` and renders the **Projects** section accordingly.
- Four states are exhaustive and mutually exclusive: **Loading**, **Success**, **Error**, **Empty**.
- Cards are built from a `map` over the response; user input / API strings are inserted via `textContent` (or an escape helper) — never raw `innerHTML` interpolation of API data.
- The **Retry** button on the error branch re-invokes `loadProjects()`, closing the event → state loop.

---

## 2. State Flow

```
init()          → loadProjects()
loadProjects() → renderLoading() → fetch → success ? renderSuccess(repos) || renderEmpty()
                                       → catch  → renderError() → user clicks Retry → loadProjects()
```

| Status     | DOM result                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| `loading`  | Spinner + "Loading projects..." text inside `.projects-grid` container     |
| `success`  | N `<article class="project-card">` cards rendered into `.projects-grid`    |
| `error`    | Message "Failed to load projects." + `<button class="retry">` Retry button |
| `empty`    | Message "No public repositories yet."                                      |

Internal state shape:

```js
let state = {
  status: "loading",        // "loading" | "success" | "error" | "empty"
  repos: [],
};
```

---

## 3. Tasks

### 3.1 `js/config.js`
- Fill in `GITHUB_USERNAME` (the project owner's GitHub handle).
- Export the endpoint via a tiny helper so the URL lives in one place:

```js
export const GITHUB_USERNAME = "your-handle";
export const PROJECTS_ENDPOINT = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12`;
```

### 3.2 `js/projects.js`
Public surface:

```js
export function init() { loadProjects(); }
```

Internal helpers (private to the module):

- `loadProjects()`: switches state to `loading`, calls `renderLoading()`, then `await fetch(PROJECTS_ENDPOINT)`. Branch on `response.ok` and `data.length`:
  - non-2xx → `renderError()`.
  - 2xx + empty array → `renderEmpty()`.
  - 2xx + non-empty → `renderSuccess(data)`.
- `renderLoading()`: writes spinner markup into `.projects-grid`.
- `renderSuccess(repos)`: clears container, builds cards via `repos.map(toCard)`, appends in a single DOM write.
- `renderError()`: writes error markup + a `<button class="retry">Retry</button>`; binds `click` → `loadProjects()`.
- `renderEmpty()`: writes "No public repositories yet." into the container.
- `toCard(repo)`: returns an `<article>` Element (not a string) built via `document.createElement` so untrusted fields go through `textContent`.

### 3.3 Escape strategy (`plan.md` §4.2)
- Insert `name`, `description`, `language` via `el.textContent = repo.field ?? "—"` — never via template literal into `innerHTML`.
- The card's static skeleton can be a template literal + `innerHTML`; the **values** are then set with `textContent` on individual child nodes selected from the new card.

Pattern:

```js
function toCard({ name, description, language, stargazers_count, html_url }) {
  const card = document.createElement("article");
  card.className = "project-card";
  card.innerHTML = `
    <h3 class="project-card__title"></h3>
    <p class="project-card__desc"></p>
    <div class="project-card__meta">
      <span class="project-card__lang"></span>
      <span class="project-card__stars"></span>
    </div>
    <a class="project-card__link" target="_blank" rel="noopener noreferrer">View on GitHub</a>
  `;
  card.querySelector(".project-card__title").textContent = name;
  card.querySelector(".project-card__desc").textContent = description ?? "No description";
  card.querySelector(".project-card__lang").textContent = language ?? "—";
  card.querySelector(".project-card__stars").textContent = `★ ${stargazers_count}`;
  card.querySelector(".project-card__link").href = html_url;
  return card;
}
```

### 3.4 Optional `filter`
- Subject §4.6 calls out `filter` as a desirable usage. A minimal use without bonus scope: exclude forks and archived repos before rendering.

```js
const visible = repos.filter(r => !r.fork && !r.archived);
```

- This is not required, but if added it must not break the **Empty** branch (a username with only forks should still show empty).

### 3.5 CSS for the four states (`css/style.css`)
- Spinner: small CSS-only `@keyframes spin` rotation on a circular border.
- Error message + Retry button styled with the existing button tokens.
- Empty message uses the muted text color token.

### 3.6 `index.html`
- Remove the static placeholder cards that lived inside `.projects-grid` in Phase 1. The grid container stays; its children are now JS-managed.
- Keep section heading + description (those are static copy, not API data).

---

## 4. Files Touched

| File | Change |
| ---- | ------ |
| `js/projects.js` | Full implementation of fetch + 4-state render |
| `js/config.js` | Set `GITHUB_USERNAME`, export `PROJECTS_ENDPOINT` |
| `index.html` | Remove static project card placeholders (keep `.projects-grid` empty) |
| `css/style.css` | Spinner, error/retry, empty-state styles |

`theme.js`, `nav.js`, `animate.js`, `contact.js` are untouched.

---

## 5. Acceptance Criteria

- [ ] On page load with a valid `GITHUB_USERNAME`: spinner is briefly visible, then cards render.
- [ ] Block network in DevTools (or set `GITHUB_USERNAME = "this-user-does-not-exist-xyz"`) → error state shows with a working **Retry** button. Re-enable network → Retry transitions through Loading → Success.
- [ ] Set `GITHUB_USERNAME` to an account known to have **zero public repos** → empty state shows ("No public repositories yet.").
- [ ] Cards render `name`, `description` (or `"No description"`), `language` (or `"—"`), star count, and a working link with `target="_blank" rel="noopener noreferrer"`.
- [ ] `name` / `description` / `language` are inserted via `textContent`; verify by injecting `<script>` into a repo description on a test account — it must render as text, not execute.
- [ ] `fetch` uses `async`/`await` + `try`/`catch` (`plan.md` §4.3); no `.then()` chains.
- [ ] Scroll-in animation from Phase 2 still works on the new dynamic cards (cards either are observed when added, or skip animation gracefully).
- [ ] No console errors. Rate-limit 403 (rare in dev) still routes to the error branch.

---

## 6. Commit

```
feat: render github repositories with loading and error states
```

---

## 7. Risks / Notes

- **GitHub API rate limit** is 60/hour unauthenticated. Heavy reload during dev can produce 403 — document in README (Phase 5). Bonus phase can introduce `sessionStorage` caching.
- **`innerHTML` + untrusted data** is the most likely XSS hole in this assignment. Stick to the `createElement` + `textContent` pattern above.
- **Animate-in interaction**: if `animate.js` runs once at load, dynamically added cards may never get observed. Either (a) export `animate.observe(el)` from `animate.js` and call it from `renderSuccess`, or (b) reveal cards instantly without animation. Pick the simpler one for this phase; option (a) is a small lift if observer instance is exposed.
- **Relative paths**: ensure no hard-coded URL beyond the GitHub endpoint; assets remain `./images/...`.

---

## 8. Definition of Done

- All four state branches are reachable and visually distinct.
- Retry closes the event → state loop cleanly without page reload.
- API fields render safely via `textContent`.
- Phase 4 can build the contact-form validation flow with no further changes to `projects.js`.
