# 기준 9 · 이벤트 등록 방식 (`addEventListener` vs `onclick`)

> **평가 항목:** 항목 4 · JavaScript  
> **질문:** `onclick` 인라인 속성 대신 `addEventListener`를 사용한 이유를 두 방식의 차이를 비교하여 설명할 수 있는가?

---

## 결론

**예.** 이 프로젝트의 모든 이벤트는 HTML 인라인 속성 없이 JavaScript에서 `addEventListener`로 등록한다. HTML은 구조만 담당하고, 동작은 JS 모듈에 모아 **관심사 분리**·**유지보수**·**성능 옵션**을 확보한다.

---

## 두 방식 비교

### `onclick` (인라인 속성)

```html
<!-- 인라인 방식 (이 프로젝트에서 사용하지 않음) -->
<button onclick="toggleTheme()">Toggle</button>
```

### `addEventListener` (이 프로젝트 방식)

```html
<button class="theme-toggle" type="button">...</button>
```

```js
toggle.addEventListener("click", () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  // ...
});
```

---

## 상세 비교표

| 비교 항목 | `onclick` (인라인) | `addEventListener` |
|----------|-------------------|-------------------|
| **위치** | HTML 속성 (`<button onclick="...">`) | JS 파일 |
| **핸들러 개수** | 요소당 **하나** (나중 것이 덮어씀) | 같은 이벤트에 **여러 리스너** 등록 가능 |
| **관심사 분리** | HTML에 동작 로직 혼입 | 마크업(구조)과 동작 분리 |
| **전역 오염** | `toggleTheme()`을 `window`에 노출해야 함 | 모듈 스코프 내 클로저로 캡슐화 |
| **옵션** | 제한적 | `{ passive: true }`, `{ once: true }`, `capture` 등 |
| **제거** | 속성 삭제 또는 `null` 할당 | `removeEventListener`로 명시적 해제 |
| **디버깅** | HTML·JS 양쪽 추적 | JS 파일만 보면 됨 |
| **CSP** | `unsafe-inline` 필요할 수 있음 | 외부 JS 파일로 정책 준수 용이 |

---

## 이 프로젝트의 `addEventListener` 사용 예

### 테마 토글 (`js/theme.js`)

```js
toggle.addEventListener("click", () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = currentTheme;
  localStorage.setItem("theme", currentTheme);
  renderTheme();
});
```

### 햄버거 메뉴 (`js/nav.js`)

```js
hamburger.addEventListener("click", () => {
  isMenuOpen = !isMenuOpen;
  renderMenu();
});
```

### 스크롤 (`js/nav.js`) — `passive` 옵션

```js
window.addEventListener("scroll", handleScroll, { passive: true });
```

`{ passive: true }`는 리스너가 `preventDefault()`를 호출하지 않음을 브라우저에 알린다. 스크롤 이벤트는 초당 수십 번 발생하므로, 브라우저가 스크롤을 **먼저 처리**할 수 있어 **메인 스레드 차단**을 줄인다.

### 폼 입력·제출 (`js/contact.js`)

```js
field?.addEventListener("input", () => { /* 즉각 검증 */ });
form.addEventListener("submit", (event) => { /* 전체 검증 */ });
```

`input`과 `submit`은 **서로 다른 이벤트**이므로 같은 폼 요소에 각각 리스너를 등록할 수 있다. `onclick`은 요소당 하나만 가능해 이런 패턴이 어렵다.

### Retry 버튼 (`js/projects.js`)

```js
grid.querySelector(".retry")?.addEventListener("click", loadProjects);
```

에러 UI를 `innerHTML`로 동적 생성한 **후**에 리스너를 붙인다. 인라인 `onclick`은 동적 HTML에 함수 이름을 문자열로 넣어야 해서 모듈 스코프와 맞지 않는다.

---

## `addEventListener`를 선택한 이유 (요약)

### 1. 관심사 분리

`index.html`에는 `onclick`이 **한 곳도 없다**. HTML을 열면 **구조만** 보이고, 동작은 `js/`에서 찾는다.

### 2. ES Module과의 궁합

```js
// main.js
import { init as initTheme } from "./theme.js";
```

모듈 스코프의 함수는 `window`에 자동 노출되지 않는다. 인라인 `onclick="initTheme()"`는 전역 등록이 필요해 모듈 패턴과 충돌한다.

### 3. 여러 리스너·이벤트 타입

- `nav.js`: `click` + `scroll` on `window`
- `contact.js`: `input` on 각 필드 + `submit` on form
- `animate.js`: `IntersectionObserver` 콜백 (이벤트 리스너와 유사한 패턴)

### 4. 성능·접근성 옵션

스크롤 리스너의 `{ passive: true }`는 인라인 `onclick`으로는 불가능한 최적화다.

### 5. 테스트·유지보수

테마 로직 변경 시 `theme.js`만 수정. HTML을 건드리지 않아 **회귀 위험**이 적다.

---

## `onclick`이 쓰이기도 하는 경우 (참고)

- 아주 간단한 프로토타입·학습용 한 페이지
- 레거시 코드베이스

프로덕션·모듈화된 프로젝트에서는 `addEventListener`가 표준에 가깝다.

---

## 관련 파일

- `index.html` — `onclick` 없음 (구조만)
- `js/theme.js`, `js/nav.js`, `js/contact.js`, `js/projects.js` — `addEventListener` 사용
