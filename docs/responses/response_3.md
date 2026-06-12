# 기준 3 · 인터랙션 UI

> **평가 항목:** 항목 1 · 기능 동작  
> **질문:** 햄버거 메뉴, 스크롤 애니메이션, 맨 위로 가기 버튼 등이 정상 동작하는가?

---

## 결론

**예.** 네비게이션 관련 인터랙션은 `js/nav.js`가, 스크롤 등장 애니메이션은 `js/animate.js`가 담당한다. 각 기능은 **이벤트 → 상태 변경 → 렌더 함수 → DOM 갱신** 패턴으로 구현되어 있다.

---

## 1. 햄버거 메뉴

### 동작

모바일(~767px)에서 햄버거 버튼(`.nav__hamburger`)을 클릭하면 메뉴가 열리고 닫힌다.

### 코드 흐름 (`js/nav.js`)

```js
let isMenuOpen = false;

const renderMenu = () => {
  menu.classList.toggle("nav__menu--open", isMenuOpen);
  hamburger.setAttribute("aria-expanded", String(isMenuOpen));
};

hamburger.addEventListener("click", () => {
  isMenuOpen = !isMenuOpen;
  renderMenu();
});
```

| 상태 | CSS 클래스 | 시각적 결과 | 접근성 |
|------|-----------|------------|--------|
| 닫힘 | (없음) | `.nav__menu { display: none }` | `aria-expanded="false"` |
| 열림 | `nav__menu--open` | 세로 드롭다운 메뉴 표시 | `aria-expanded="true"` |

### CSS (`css/style.css`)

```css
.nav__menu { display: none; }

.nav__menu--open {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 100%;
  /* ... */
}
```

768px 이상(`responsive.css`)에서는 햄버거가 `display: none`이 되고 메뉴가 항상 가로로 표시된다.

---

## 2. 스무스 스크롤 + 메뉴 자동 닫힘

### 동작

네비 앵커 링크(`#about`, `#projects` 등) 클릭 시 해당 섹션으로 부드럽게 스크롤되고, 열려 있던 햄버거 메뉴가 자동으로 닫힌다.

### 코드

```js
anchorLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    const target = document.querySelector(href);
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    closeMenu();
  });
});
```

- `preventDefault()`로 기본 점프 스크롤을 막고 `scrollIntoView`로 부드러운 이동을 구현한다.
- `closeMenu()`로 `isMenuOpen = false` → 메뉴가 닫힌다.

---

## 3. 스크롤 시 네비 그림자

### 동작

페이지를 60px 이상 스크롤하면 네비게이션에 그림자(`nav--scrolled`)가 추가된다.

### 코드

```js
const handleScroll = () => {
  nav.classList.toggle("nav--scrolled", window.scrollY > NAV_BG_THRESHOLD);
  // NAV_BG_THRESHOLD = 60 (config.js)
};

window.addEventListener("scroll", handleScroll, { passive: true });
handleScroll(); // 초기 로드 시에도 적용
```

`{ passive: true }` 옵션은 스크롤 리스너가 `preventDefault`를 호출하지 않음을 브라우저에 알려 **스크롤 성능을 보호**한다.

---

## 4. 맨 위로 가기 버튼

### 동작

300px 이상 스크롤하면 우하단 `.to-top` 버튼이 나타나고, 클릭 시 페이지 최상단으로 부드럽게 이동한다.

### JS (`js/nav.js`)

```js
toTop?.classList.toggle("to-top--visible", window.scrollY > SCROLL_TOP_THRESHOLD);
// SCROLL_TOP_THRESHOLD = 300

toTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
```

### CSS (`css/style.css`)

```css
.to-top {
  opacity: 0;
  pointer-events: none; /* 숨김 시 클릭 불가 */
}

.to-top--visible {
  opacity: 1;
  pointer-events: auto;
}
```

`opacity`와 `pointer-events`를 함께 쓰면 보이지 않을 때 실수로 클릭되는 것을 방지한다.

---

## 5. 스크롤 등장 애니메이션

### 동작

`data-animate` 속성이 있는 섹션(Hero, About, Skills, Projects, Contact)이 뷰포트에 들어오면 아래에서 위로 페이드인된다.

### JS (`js/animate.js`)

```js
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // 한 번만 실행
      }
    });
  },
  { threshold: OBSERVER_THRESHOLD } // 0.2 = 20% 보이면 트리거
);
```

### CSS (`css/style.css`)

```css
[data-animate] {
  opacity: 0;
  transform: translateY(var(--space-4));
  transition: opacity 0.2s ease, transform 0.2s ease;
}

[data-animate].is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

`IntersectionObserver`를 쓰는 이유: `scroll` 이벤트마다 `getBoundingClientRect()`를 호출하는 것보다 **성능 비용이 낮고** 코드가 간결하다.

---

## 기능별 요약표

| 기능 | 파일 | 트리거 | DOM 변화 |
|------|------|--------|----------|
| 햄버거 메뉴 | `nav.js` | 버튼 클릭 | `nav__menu--open`, `aria-expanded` |
| 스무스 스크롤 | `nav.js` | 앵커 링크 클릭 | `scrollIntoView`, 메뉴 닫힘 |
| 네비 그림자 | `nav.js` | scroll > 60px | `nav--scrolled` |
| 맨 위로 | `nav.js` | scroll > 300px / 버튼 클릭 | `to-top--visible`, `scrollTo` |
| 등장 애니메이션 | `animate.js` | 요소 20% 진입 | `is-visible` |

---

## 확인 방법

1. **햄버거**: 뷰포트 375px → 햄버거 클릭 → 메뉴 열림/닫힘 확인.
2. **스무스 스크롤**: 메뉴에서 "About" 클릭 → 부드럽게 이동 + 메뉴 닫힘.
3. **네비 그림자**: 아래로 스크롤 → 상단 네비에 그림자 추가.
4. **맨 위로**: 300px 이상 스크롤 → ↑ 버튼 표시 → 클릭 시 최상단 이동.
5. **애니메이션**: 페이지 로드 후 각 섹션이 스크롤 시 페이드인.

---

## 관련 파일

- `js/nav.js` — 햄버거, 스크롤, to-top
- `js/animate.js` — IntersectionObserver 애니메이션
- `js/config.js` — `NAV_BG_THRESHOLD`, `SCROLL_TOP_THRESHOLD`, `OBSERVER_THRESHOLD`
- `css/style.css` — 메뉴·to-top·애니메이션 스타일
- `index.html` — `data-animate` 속성, 버튼 마크업
