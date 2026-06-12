# 기준 2 · 테마 전환

> **평가 항목:** 항목 1 · 기능 동작  
> **질문:** 테마 토글 버튼 클릭 시 다크/라이트 모드가 전환되고, 새로고침 후에도 선택이 유지되는가?

---

## 결론

**예.** `js/theme.js`가 테마 상태를 관리하고, `localStorage`에 저장해 새로고침·재방문 후에도 사용자 선택이 유지된다. CSS는 `:root[data-theme="dark"]`에서 색상 변수만 덮어써 전체 페이지가 한 번에 전환된다.

---

## 동작 흐름 (단계별)

### 1단계: 페이지 로드 — 저장된 테마 복원

```js
let currentTheme = "light";
const storedTheme = localStorage.getItem("theme");

if (storedTheme === "light" || storedTheme === "dark") {
  currentTheme = storedTheme;
  document.documentElement.dataset.theme = currentTheme;
} else {
  document.documentElement.dataset.theme = "light";
}
```

- `localStorage`에 `"light"` 또는 `"dark"`가 저장되어 있으면 그 값을 읽어 `<html>` 요소의 `data-theme` 속성에 적용한다.
- 저장된 값이 없거나 잘못된 값이면 기본값 `"light"`를 사용한다.
- **이 시점에서 CSS 변수가 즉시 적용**되므로, JS가 로드되기 전에도 FOUC(깜빡임)를 최소화할 수 있다.

### 2단계: UI 초기 렌더링

```js
const renderTheme = () => {
  const isDark = currentTheme === "dark";
  toggle.setAttribute("aria-pressed", String(isDark));
  icon.textContent = isDark ? "☀" : "☾";
  label.textContent = isDark ? "Light mode" : "Dark mode";
};
renderTheme();
```

| 현재 테마 | 아이콘 | 라벨 | `aria-pressed` |
|-----------|--------|------|----------------|
| light | ☾ | "Dark mode" | false |
| dark | ☀ | "Light mode" | true |

접근성 속성(`aria-pressed`, `aria-label`)도 테마에 맞게 갱신된다.

### 3단계: 토글 클릭 — 상태·저장·UI 동시 갱신

```js
toggle.addEventListener("click", () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = currentTheme;
  localStorage.setItem("theme", currentTheme);
  renderTheme();
});
```

클릭 한 번에 세 가지가 동시에 일어난다:

1. **JS 상태** (`currentTheme`) 토글
2. **DOM 속성** (`dataset.theme`) 갱신 → CSS 변수 전환 트리거
3. **영구 저장** (`localStorage.setItem`) → 새로고침 후 복원 가능

---

## CSS와의 연동

`css/style.css`에서 라이트 모드 색상은 `:root`에, 다크 모드는 `[data-theme="dark"]`에 정의한다.

```css
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --color-accent: #2563eb;
  /* ... */
}

:root[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-text: #f1f5f9;
  --color-accent: #60a5fa;
  /* ... */
}
```

**핵심:** 개별 요소의 `color`·`background`를 JS로 바꾸지 않는다. `<html data-theme="dark">` 한 속성 변경으로 `--color-*` 변수가 전역 교체되고, `var(--color-bg)` 등을 쓰는 모든 요소가 자동으로 색이 바뀐다.

---

## 새로고침 후 유지 확인 방법

1. 페이지를 연다 → 기본 라이트 모드.
2. 테마 토글 버튼(☾)을 클릭 → 다크 모드로 전환.
3. **F5 또는 Cmd+R로 새로고침** → 다크 모드가 유지되는지 확인.
4. 개발자 도구 → Application → Local Storage → `theme: "dark"` 항목 확인.
5. 다시 토글 후 새로고침 → `theme: "light"`로 바뀌었는지 확인.

---

## 설계상 이점

| 관점 | 설명 |
|------|------|
| 관심사 분리 | JS는 `data-theme` 속성만 바꾸고, 색상 결정은 CSS 변수가 담당 |
| 확장성 | 새 컴포넌트에 `var(--color-*)`만 쓰면 테마 자동 대응 |
| 성능 | 수백 개 요소를 개별 조작하지 않아 리플로우 비용이 적다 |
| 접근성 | `aria-pressed`로 현재 토글 상태를 스크린 리더에 전달 |

---

## 관련 파일

- `js/theme.js` — 테마 상태·localStorage·토글 이벤트
- `css/style.css` — `:root`, `:root[data-theme="dark"]` 변수 정의
- `index.html` — `.theme-toggle` 버튼 마크업
