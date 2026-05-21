# Phase 4 — Contact Form Validation

> Parent plan: [`docs/plan.md`](../plan.md) §6 Phase 4
> Subject reference: [`docs/subject.md`](../subject.md) §4.4, §4.5, §4.8

The contact form is the third (and final required) **event → state → render** flow. This phase owns client-side validation only — no real network send. Real submission belongs in `bonus_plan.md` Phase B3.

---

## 1. Goal

- `js/contact.js` validates the contact form **on input** (live errors) and **on submit** (full check + success).
- On invalid submit: `event.preventDefault()` and surface field-level error messages.
- On valid submit: `event.preventDefault()` (still — no real send in this phase), reset the form, and show a success message in the existing status slot.
- Validation state shape: `errors: { name?: string, email?: string, message?: string }`.

---

## 2. State Flow

| Event              | State change                              | Render                                                      |
| ------------------ | ----------------------------------------- | ----------------------------------------------------------- |
| `input` on field   | Re-run validator for that field           | Toggle `.error` text + `.is-invalid` class on the field      |
| `submit` invalid   | Recompute errors for all fields           | All error messages visible; status slot empty               |
| `submit` valid     | Clear errors                              | Reset form values; status slot shows "Thanks! Message sent." |

---

## 3. Validation Rules (locked in `plan.md` §5.3)

| Field    | Rule                                                                 |
| -------- | -------------------------------------------------------------------- |
| `name`   | Non-empty after `trim()`                                             |
| `email`  | Matches `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`                               |
| `message`| Non-empty after `trim()`. Minimum length **10** characters recommended |

Error copy (decide during implementation, keep short):
- `name`: "Please enter your name."
- `email`: "Please enter a valid email address."
- `message`: "Please enter a message of at least 10 characters."

---

## 4. Tasks

### 4.1 `js/contact.js`
- Inside `init()`:
  1. Query `.contact-form` form element. If absent, return (defensive).
  2. Query each field (`[name="name"]`, `[name="email"]`, `[name="message"]`), its sibling error slot (`.error[data-for="<field>"]`), and the form status `<p class="form-status">`.
  3. Bind `input` listeners per field that call `validateField(field)` and update DOM.
  4. Bind `submit` listener that calls `event.preventDefault()`, runs `validateAll()`, and routes to either `renderErrors(errors)` or `renderSuccess()`.

- Helpers:
  - `validateField(name, value)` → returns `string | undefined` (error text or none).
  - `validateAll(formData)` → returns the full `errors` object.
  - `renderErrors(errors)`: for each field, set `.error[data-for]` `textContent` to message or empty; toggle `.is-invalid` on the field via `classList.toggle`.
  - `renderSuccess()`: clear all error slots, reset `.is-invalid` everywhere, `form.reset()`, set the status slot to the success copy + add `.form-status--success` class.

- All DOM access via `querySelector`; all class changes via `classList`; no inline styles.

### 4.2 `index.html`
Phase 1 already added the form skeleton — verify it matches this contract:

```html
<form class="contact-form" novalidate>
  <label for="contact-name">Name</label>
  <input id="contact-name" name="name" type="text" required>
  <p class="error" data-for="name" role="alert" aria-live="polite"></p>

  <label for="contact-email">Email</label>
  <input id="contact-email" name="email" type="email" required>
  <p class="error" data-for="email" role="alert" aria-live="polite"></p>

  <label for="contact-message">Message</label>
  <textarea id="contact-message" name="message" rows="5" required></textarea>
  <p class="error" data-for="message" role="alert" aria-live="polite"></p>

  <button type="submit" class="btn btn--primary">Send Message</button>
  <p class="form-status" role="status" aria-live="polite"></p>
</form>
```

- `novalidate` prevents browser-native bubbles from competing with custom errors.
- `aria-live="polite"` lets screen readers announce error changes without interrupting.

### 4.3 CSS additions (`css/style.css`)
- `.error` text token: small, accent-warning color.
- `input.is-invalid`, `textarea.is-invalid`: border / outline in warning color, focus ring preserved.
- `.form-status--success`, `.form-status--error`: distinct foreground colors via tokens.

---

## 5. Files Touched

| File | Change |
| ---- | ------ |
| `js/contact.js` | Full implementation of validation + submit flow |
| `index.html` | Verify (and adjust if needed) form structure to match the contract above |
| `css/style.css` | `.error`, `.is-invalid`, `.form-status--success/--error` styles |

`theme.js`, `nav.js`, `animate.js`, `projects.js` are untouched.

---

## 6. Acceptance Criteria

- [ ] Typing in a field clears its existing error live (only when current value would pass).
- [ ] Submitting with an empty name → name error shown, focus or status reflects failure, no other side effects.
- [ ] Submitting with an invalid email (e.g. `foo@bar`) → email error shown.
- [ ] Submitting with `message.trim().length < 10` → message error shown.
- [ ] Submitting with all three valid → all errors clear, form fields reset to empty, status slot shows the success message styled with `.form-status--success`.
- [ ] `event.preventDefault()` is called in every submit branch (no navigation to a new URL). Verify by submitting — URL must not change.
- [ ] No browser-native validation bubbles appear (because of `novalidate`).
- [ ] No console errors. No `getElementById`. No inline handlers. No `var`.

---

## 7. Commit

```
feat: add contact form with client-side validation
```

---

## 8. Risks / Notes

- The email regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) is intentionally simple — it accepts common typos like `a@b.c`. Subject only requires "simple format check"; do not chase RFC 5322.
- The `message` length floor (10 chars) is a recommendation. If you change it, update the error copy and `plan.md` §5.3 in the same commit.
- Live validation on `input` may feel noisy if errors appear before the user finishes typing. A common pattern is: only display an error on `input` if the field **previously failed**, otherwise wait for `blur` / `submit`. Choose the simpler "always validate on input" for this phase unless UX feedback says otherwise.
- Phase B3 (bonus) will hook the success branch into a real Formspree POST. Keep the success branch easy to extend — encapsulate the "what happens after validation passes" logic in a small function (e.g. `onValidSubmit(formData)`).

---

## 9. Definition of Done

- Validation passes / fails per the rules above.
- Errors render near each field; success message renders in the shared status slot.
- All three required state flows from `plan.md` §4.1 (`theme`, `projects`, `contact`) are now functional.
- Phase 5 (deploy + README) can begin without any further behavioral changes.
