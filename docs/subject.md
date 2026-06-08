# Responsive Portfolio Website Mission

---

## 1. Mission Overview

HTML, CSS, and JavaScript are the foundation of all web development. They are what browsers understand; frameworks like React/Vue/Angular ultimately compile down to these three.

In this mission you build a **responsive portfolio website** from scratch using only **plain HTML/CSS/JavaScript**—no external libraries. The goal is not just layout: you see how **user events → DOM manipulation → screen change** works on the web.

You also integrate the **GitHub API** and handle **loading, error, and empty states** as in real products. This mission is essential groundwork for **React**—components, state, and events abstract the DOM and event handling you practice here.

---

## 2. Final Deliverable

Complete **one responsive portfolio website** meeting the following.

### 2.1 Responsive Website

- Layout optimized on mobile, tablet, and desktop
- Sections: **Hero**, **About**, **Skills**, **Projects**, **Contact**, **Footer**

### 2.2 Interactive UI

- Dark mode toggle, hamburger menu, smooth scroll, scroll animations, etc.
- **Form validation** implemented

### 2.3 External API

- Fetch your repos from **GitHub API** and render **Projects** dynamically
- Express loading, error, and empty states in the **UI**

### 2.4 Persisted State

- Save dark mode in **localStorage**; survives refresh

### 2.5 Deployment

- Deploy on **GitHub Pages** with a publicly accessible URL

---

## 3. Learning Objectives

After completing this assignment, learners should be able to explain the following on their own.

1. Why **semantic HTML** is used and how they structured the page.
2. Difference between **Flexbox** and **Grid** and when to pick each.
3. Selecting DOM with `querySelector` and wiring events with `addEventListener`.
4. Why arrow functions, destructuring, and array methods (`map`/`filter`) matter and how they were used.
5. Fetching async data with `fetch` and `async`/`await` and showing **loading/success/failure** in the UI.
6. How **event → state change → DOM update** connects for one feature (basis for React state/rendering).

---

## 4. Functional Requirements

You must satisfy **all** of the following.

### 4.1 Project Layout


| Path         | Role        |
| ------------ | ----------- |
| `index.html` | Main page   |
| `css/`       | Stylesheets |
| `js/`        | JavaScript  |
| `images/`    | Images      |


- Link external CSS/JS correctly in HTML
- Dev with **VS Code + Live Server**

### 4.2 HTML (Semantic Markup)

- Use **semantic tags**, not only `div`: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Sections: **Hero**, **About**, **Skills**, **Projects** (GitHub API), **Contact** (form), **Footer** (copyright, social)
- Nav **anchor links** to each section
- Meaningful **alt** on all images
- Form `<label>` **for–id** pairs

### 4.3 CSS (Layout & Responsive)


| Item              | Requirement                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| **Styles**        | External `css/style.css`                                                                               |
| **Variables**     | Colors, fonts, spacing in `:root`; dark theme under `**[data-theme="dark"]`**                          |
| **Nav**           | **Flexbox** (logo left, menu right)                                                                    |
| **Project cards** | **Grid** (`auto-fit`, `minmax` for responsive)                                                         |
| **Responsive**    | **Mobile first**. Breakpoints **768px** (tablet), **1024px** (desktop). Hide nav on mobile + hamburger |
| **Visual**        | Button/card **hover** + **transition**, card **box-shadow**                                            |


### 4.4 JavaScript Basics (DOM & Events)


| Item            | Requirement                                       |
| --------------- | ------------------------------------------------- |
| **Load**        | JS with `**defer`**                               |
| **Variables**   | `const`/`let` only (**no** `var`)                 |
| **Events**      | **No** HTML `onclick`; use `**addEventListener`** |
| **Select**      | `querySelector`, `querySelectorAll`               |
| **Content**     | `textContent`, `innerHTML`                        |
| **Classes**     | `classList.add` / `remove` / `toggle`             |
| **Event types** | `click`, `submit`, `scroll`, `input`, etc.        |
| **Default**     | Use `event.preventDefault()` where needed         |


### 4.5 Required Interactions


| Feature              | Requirement                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Hamburger**        | Toggle on mobile; use `classList.toggle('active')`                                                              |
| **Smooth scroll**    | Nav click scrolls to section smoothly                                                                           |
| **Scroll to top**    | Button after **300px+** scroll (document threshold in README), click goes to top                                |
| **Nav style**        | Background change after **60px+** scroll (document in README)                                                   |
| **Dark mode**        | Toggle + **localStorage** persistence                                                                           |
| **Scroll animation** | **Intersection Observer**, threshold **≥ 0.2** (note changes in README)                                         |
| **Contact form**     | Name, email, message; required + email format; errors near fields; `preventDefault` + success message on submit |


### 4.6 ES6+ & Array Methods

- Arrow functions, **template literals** for dynamic HTML, **destructuring**
- `map`: GitHub data → card HTML
- `filter`: optional conditional filter
- `forEach`: iteration

### 4.7 Async & API


| Item          | Requirement                                                                     |
| ------------- | ------------------------------------------------------------------------------- |
| **Call**      | `fetch` + `async`/`await`                                                       |
| **Endpoint**  | `https://api.github.com/users/{your-id}/repos`                                  |
| **UI states** | Loading (spinner/text), success (cards), error (message + retry), empty message |
| **Errors**    | `try`/`catch`                                                                   |


### 4.8 State Management Pattern

**Event → state change → UI update** must be clear; at least **3** **state → render** flows, e.g.:


| Example      | Flow                                               |
| ------------ | -------------------------------------------------- |
| 1            | Dark toggle → theme state → global styles          |
| 2            | API call → loading/success/error → Projects render |
| 3            | Form input → validation state → show/hide errors   |
| 4 (optional) | Filter click → filter state → project list         |


### 4.9 Deploy & README


| Item       | Requirement                                           |
| ---------- | ----------------------------------------------------- |
| **Deploy** | GitHub Pages; all features work on deploy URL         |
| **Verify** | Responsive, interactions, GitHub API, form validation |
| **README** | Description, stack, **deploy URL**, **screenshots**   |


---

## 5. Bonus (Optional)


| Item                  | Content                                  |
| --------------------- | ---------------------------------------- |
| **Project filtering** | Filter by language with `array.filter()` |
| **Typing effect**     | Typewriter in Hero                       |
| **Real form submit**  | Formspree or EmailJS                     |
| **System dark mode**  | `prefers-color-scheme` media query       |


