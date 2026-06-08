# `js/nav.js` — 네비게이션 모듈

햄버거 메뉴, 앵커 스무스 스크롤, 스크롤 시 네비 스타일, 맨 위로 가기 버튼을 담당하는 모듈이다.

---

## 1. 역할 요약


| 기능         | 트리거                   | 상태 / DOM 변경                                           |
| ---------- | --------------------- | ----------------------------------------------------- |
| 햄버거 메뉴     | `.nav__hamburger` 클릭  | `isMenuOpen` 토글 → `.nav__menu--open`, `aria-expanded` |
| 스무스 스크롤    | `nav a[href^="#"]` 클릭 | `scrollIntoView({ behavior: "smooth" })`, 메뉴 닫기       |
| 네비 스크롤 스타일 | `window` scroll       | `scrollY > 60` → `.nav--scrolled`                     |
| 맨 위로 가기    | scroll + `.to-top` 클릭 | `scrollY > 300` → `.to-top--visible`, 클릭 시 top으로      |


---

## 2. 의존성

### import

```js
import { NAV_BG_THRESHOLD, SCROLL_TOP_THRESHOLD } from "./config.js";
```


| 상수                     | 기본값   | 용도                    |
| ---------------------- | ----- | --------------------- |
| `NAV_BG_THRESHOLD`     | `60`  | 네비 배경/그림자 활성화 스크롤(px) |
| `SCROLL_TOP_THRESHOLD` | `300` | to-top 버튼 표시 스크롤(px)  |


### HTML 요소 (필수 / 선택)


| 선택자                | 필수  | 용도                     |
| ------------------ | --- | ---------------------- |
| `.nav`             | ✅   | 스크롤 시 `.nav--scrolled` |
| `.nav__hamburger`  | ✅   | 모바일 메뉴 토글              |
| `.nav__menu`       | ✅   | 드롭다운 메뉴                |
| `.to-top`          | 선택  | 맨 위로 버튼 (`?.`로 안전 처리)  |
| `nav a[href^="#"]` | 선택  | 앵커 smooth scroll 대상    |


`nav`, `hamburger`, `menu` 중 하나라도 없으면 `init()`이 **즉시 return** 하고 나머지 기능은 등록되지 않는다.

---

## 3. CSS와의 연동

### 모바일 (< 768px)

- `.nav__menu` → `display: none` (기본 숨김)
- `.nav__menu--open` → `display: flex` (햄버거 클릭 시 표시)
- `.nav__hamburger` → 표시

### 태블릿+ (≥ 768px, `responsive.css`)

- `.nav__hamburger` → `display: none`
- `.nav__menu` → 항상 가로 메뉴 (`display: flex`)

JS는 화면 너비를 직접 검사하지 않는다. CSS 미디어 쿼리와 클래스 토글이 역할을 나눈다.

---

## 4. 함수 / 로직 구조

```
init()
├── DOM 조회 + guard (nav, hamburger, menu)
├── renderMenu()          — isMenuOpen → class / aria
├── closeMenu()           — isMenuOpen = false
├── hamburger click       — isMenuOpen 토글
├── anchorLinks click     — smooth scroll + closeMenu
├── handleScroll()        — nav--scrolled, to-top--visible
└── toTop click           — scrollTo top
```

### `renderMenu()`

```js
menu.classList.toggle("nav__menu--open", isMenuOpen);
hamburger.setAttribute("aria-expanded", String(isMenuOpen));
```

- **상태:** `isMenuOpen` (모듈 스코프 변수)
- **화면:** CSS 클래스 + 접근성 속성 동시 갱신

### 앵커 링크 클릭

```js
if (!href || href === "#") return;

const target = document.querySelector(href);
if (!target) return;

event.preventDefault();
target.scrollIntoView({ behavior: "smooth", block: "start" });
closeMenu();
```

- `preventDefault()` — 브라우저 기본 점프 대신 smooth scroll
- 유효하지 않은 `href`나 존재하지 않는 `#id`는 **조용히 무시**

### `handleScroll()`

```js
nav.classList.toggle("nav--scrolled", window.scrollY > NAV_BG_THRESHOLD);
toTop?.classList.toggle("to-top--visible", window.scrollY > SCROLL_TOP_THRESHOLD);
```

- `{ passive: true }` — 스크롤 성능 보호
- 초기 로드 시 `handleScroll()` 한 번 호출 — 새로고침 후 스크롤 위치 반영

---

## 5. 이벤트 → 상태 → 화면

```
[햄burger 클릭]
  이벤트: click
  상태:   isMenuOpen = !isMenuOpen
  화면:   .nav__menu--open, aria-expanded

[About 링크 클릭]
  이벤트: click
  상태:   (스크롤 위치 변경), isMenuOpen = false
  화면:   smooth scroll, 메뉴 닫힘

[스크롤]
  이벤트: scroll
  상태:   scrollY vs threshold
  화면:   .nav--scrolled, .to-top--visible
```

---

## 6. 오류 처리 (Error handling)

`nav.js`는 **try/catch를 사용하지 않는다.** 외부 API·비동기 호출이 없고, 실패 가능 지점을 **사전 검사(guard)** 로 막는다.


| 상황               | 처리 방식                       | 사용자 피드백        |
| ---------------- | --------------------------- | -------------- |
| 필수 DOM 없음        | `init()` early return       | 기능 없음 (조용히)    |
| `href` 없음 / `#`만 | click handler return        | 링크 기본 동작 유지    |
| `#id` 대상 없음      | click handler return        | 아무 동작 없음       |
| `.to-top` 없음     | `toTop?.` optional chaining | scroll/nav만 동작 |


**패턴 이름:** defensive programming / fail silently

API 모듈(`projects.js`)과 달리, 네비는 **오류 UI·Retry가 필요 없는** 로컬 UI라 조용히 skip하는 것이 적절하다.

---

## 7. `main.js`에서의 호출

```js
import { init as initNav } from "./nav.js";

initNav();
```

페이지 로드 시 한 번 `init()`이 실행되고, 이벤트 리스너가 등록된다. 리스너는 페이지가 닫힐 때까지 유지된다.

---

## 8. 자가 점검

- 모바일(≤767px)에서 햄버거 클릭 시 메뉴가 펼쳐지는가?
- 메뉴 링크 클릭 후 모바일 메뉴가 닫히는가?
- 768px 이상에서 햄버거 없이 가로 메뉴가 보이는가?
- `#about` 등 앵커 클릭 시 smooth scroll 되는가?
- 60px / 300px 스크롤 임계값에서 nav / to-top 스타일이 바뀌는가?
- `http://` 서버로 열었는가? (`file://`에서는 ES module 실패 가능)

---

## 9. 관련 파일


| 파일                   | 관계                                                     |
| -------------------- | ------------------------------------------------------ |
| `index.html`         | `.nav`, `.nav__menu`, `.nav__hamburger`, `.to-top` 마크업 |
| `css/style.css`      | nav, menu, hamburger, to-top 기본 스타일                    |
| `css/responsive.css` | 768px+ 햄버거 숨김, 가로 메뉴                                   |
| `js/config.js`       | `NAV_BG_THRESHOLD`, `SCROLL_TOP_THRESHOLD`             |
| `js/main.js`         | `initNav()` 호출                                         |


