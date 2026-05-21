# Phase 6 (Optional) — Bonus Tasks

> Parent plan: [`docs/plan.md`](../plan.md) §6 Phase 6
> Detailed plan: [`docs/bonus_plan.md`](../bonus_plan.md)
> Subject reference: [`docs/subject.md`](../subject.md) §5

Phase 6 is **optional** and only begins after Phases 0–5 are committed, deployed, and verified. Per `.cursorrules` §4 (YAGNI) and `plan.md` §6, none of the bonus items are required to satisfy the assignment — they are layered on top of a working core without changing locked decisions in `plan.md` §2.

The full per-task design lives in [`bonus_plan.md`](../bonus_plan.md). This file is the **executive summary** so the phased sequence stays consistent with the core plan.

---

## 1. Goal

Add up to four optional features from subject §5 without breaking the core:

| Item                 | Subject §5 text                              | Sub-phase in `bonus_plan.md` |
| -------------------- | -------------------------------------------- | ---------------------------- |
| Project filtering    | Filter by language with `array.filter()`     | Phase B1                     |
| Hero typing effect   | Typewriter in Hero                           | Phase B2                     |
| Real form submit     | Formspree or EmailJS                         | Phase B3                     |
| System dark mode     | `prefers-color-scheme` media query           | Phase B4                     |

Each bonus item is a separate commit; the README is updated last (Phase B5).

---

## 2. Preconditions

Do not start Phase 6 unless **all** of the following are true:

- [ ] Phases 0–5 are committed and the deploy URL passes the `plan.md` §7 checklist.
- [ ] No regressions or open bugs remain in the core scope.
- [ ] The repo is at a clean state on a dedicated branch (e.g. `bonus`) so bonus work is reviewable in isolation if needed.

If any precondition fails, finish the core scope first.

---

## 3. Sub-phase Sequence (mirrors `bonus_plan.md` §8)

Each sub-phase is one logical change → one commit.

### Phase B0 — Branch off & docs
- Branch off `main` (or whichever branch holds the deployed core) into a `bonus` branch.
- `docs/bonus_plan.md` already exists in this repo; verify it is up to date with locked decisions.
- Commit: `docs: plan bonus tasks (filter, typing, form submit, system dark)`

### Phase B1 — Project language filter
- Extend `js/projects.js` with `activeLanguage` state; derive chip list from `repos`; render a chip row above the grid; reuse the existing Empty branch for empty filter results.
- Add chip styles in `css/style.css`; mobile wrap rules in `css/responsive.css`.
- Manual check: success → switch chip → narrows; pick a rare-language chip → Empty branch with "No projects in <language>".
- Commit: `feat: filter projects by language with chip selector`

### Phase B2 — Hero typing effect
- New module `js/hero.js` exporting `init()`; wired from `js/main.js`.
- Add `HERO_PHRASES` and `TYPE_MS / HOLD_MS / ERASE_MS / GAP_MS` to `js/config.js`.
- CSS caret animation; `min-height` on the tagline to prevent layout shift.
- Respect `prefers-reduced-motion: reduce` — single static phrase, no caret animation.
- Manual check: reduced-motion OS shows the static phrase.
- Commit: `feat: add hero typewriter effect`

### Phase B3 — Real form submit (Formspree)
- Set `FORMSPREE_ENDPOINT` in `js/config.js`.
- Extend `js/contact.js` submit handler: keep client validation; on valid input → POST `FormData` to Formspree; show inline `is-sending` / `is-success` / `is-error` states in the existing status slot.
- On non-2xx or thrown → re-enable submit button so the user can retry.
- Manual check: real submit delivers an email; offline submit shows error + lets the user retry.
- Commit: `feat: submit contact form via formspree`

### Phase B4 — System dark mode
- Update `js/theme.js` initial-load resolution:
  - `localStorage["theme"]` set → use stored value.
  - Otherwise → use `matchMedia("(prefers-color-scheme: dark)").matches` (do **not** write to storage).
- Add a `matchMedia` `change` listener that updates theme only while no override exists.
- Manual check: clear `localStorage` + flip OS theme → site follows live; toggle once → site sticks to the chosen value across reloads and OS theme changes.
- Commit: `feat: respect prefers-color-scheme when no theme override`

### Phase B5 — README sync
- Append a **"Bonus Features"** section to `README.md`: filter UX, typing effect, Formspree setup steps (where the endpoint comes from, free-tier limits), system dark-mode override rule.
- Add new screenshots if visuals changed (filter chip row, typing effect frame).
- Commit: `docs: document bonus features and formspree setup`

---

## 4. Files Touched (cumulative across B1–B5)

See [`bonus_plan.md`](../bonus_plan.md) §3 for the canonical list. Summary:

| File | Phase(s) | Change |
| ---- | -------- | ------ |
| `index.html` | B1, B2 | Filter chip container; Hero typing `<span>` |
| `css/style.css` | B1, B2, B3 | Chip styles, caret keyframe, form status states |
| `css/responsive.css` | B1 | Chip row wraps on mobile |
| `js/config.js` | B1?, B2, B3 | `HERO_PHRASES`, timings, `FORMSPREE_ENDPOINT` |
| `js/projects.js` | B1 | `activeLanguage` state + filter render |
| `js/hero.js` *(new)* | B2 | Typewriter loop, reduced-motion guard |
| `js/main.js` | B2 | Call `hero.init()` |
| `js/contact.js` | B3 | POST submission flow on valid input |
| `js/theme.js` | B4 | `matchMedia` integration with override semantics |
| `README.md` | B5 | "Bonus Features" section + new screenshots |

---

## 5. Acceptance Criteria

These overlay the core checklist; the core checklist must still pass.

- [ ] **Filter**: chips list matches the distinct `language` values; clicking filters without re-fetching; rare-language → Empty branch; `All` reappears after Retry.
- [ ] **Filter a11y**: chips are focusable `<button>` elements with `aria-pressed` reflecting active state.
- [ ] **Typing**: no layout shift on first paint; reduced-motion users see a static phrase; loop runs indefinitely without console errors.
- [ ] **Form**: client validation still blocks invalid input; valid input triggers a real POST; success / error / sending all surface in the existing status slot; submit button re-enables on failure.
- [ ] **Form privacy**: no API key in the bundle; only the public Formspree endpoint URL is shipped.
- [ ] **System dark**: clearing `localStorage` + flipping OS theme updates the site live; once the toggle is used, the stored value wins forever.
- [ ] **No regressions**: every checkbox in `plan.md` §7 still passes on the deployed bonus build.

---

## 6. Commit Sequence Summary

```
docs: plan bonus tasks (filter, typing, form submit, system dark)
feat: filter projects by language with chip selector
feat: add hero typewriter effect
feat: submit contact form via formspree
feat: respect prefers-color-scheme when no theme override
docs: document bonus features and formspree setup
```

---

## 7. Risks / Notes

See [`bonus_plan.md`](../bonus_plan.md) §10 for the full risk register. The two most likely failure modes:

- **GitHub `language` field is `null` for many repos** → keep `null` repos under `All` only; do not surface a `null` chip.
- **Formspree free-tier limits / outages** → mirror Projects error/retry pattern; never block client validation on network.

---

## 8. Definition of Done

- All four bonus features ship on the same deployed GitHub Pages URL.
- No console errors; no broken core flows.
- README documents the four bonus features and Formspree setup.
- No new external libraries beyond the Formspree POST endpoint.
- The core scope from `plan.md` Phases 0–5 remains unchanged in behavior.
