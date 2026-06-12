# 기준 10 · 이벤트 → 상태 → 화면

> **평가 항목:** 항목 4 · JavaScript  
> **질문:** 이벤트 → 상태 변경 → 화면 업데이트 흐름이 코드에서 어떻게 이어지는지 따라가며 설명할 수 있는가?

---

## 결론

**예.** 이 프로젝트는 **이벤트 핸들러 → 상태 변경 → 렌더 함수 → DOM 갱신** 패턴을 일관되게 따른다. 이벤트마다 DOM을 직접 여기저기 수정하기보다, 상태를 먼저 바꾸고 렌더 함수가 화면을 맞춘다.

---

## 공통 패턴

```
[사용자 액션 / 시스템 이벤트]
        ↓
[이벤트 핸들러]
        ↓
[상태 변경]  ← 변수, state 객체, 클래스 플래그
        ↓
[render*() 함수]
        ↓
[DOM 갱신]   ← classList, textContent, innerHTML, replaceChildren
```

이 패턴의 장점:
- **흐름 추적이 쉽다**: "지금 메뉴가 열렸는가?" → `isMenuOpen`만 보면 됨
- **버그 격리**: 렌더 함수만 검사하면 UI 불일치를 찾을 수 있음
- **확장**: 새 상태 값 추가 후 렌더 분기만 늘리면 됨

---

## 예시 1: 햄버거 메뉴 (`js/nav.js`)

### 상태

```js
let isMenuOpen = false;
```

### 흐름

```
[햄버거 클릭]
    → isMenuOpen = !isMenuOpen        // 상태 변경
    → renderMenu()                     // 렌더 호출
        → menu.classList.toggle("nav__menu--open", isMenuOpen)
        → hamburger.setAttribute("aria-expanded", String(isMenuOpen))
```

### 앵커 링크 클릭 시

```
[메뉴 링크 클릭]
    → target.scrollIntoView(...)     // 스크롤 (별도 UI 효과)
    → closeMenu()
        → isMenuOpen = false           // 상태 변경
        → renderMenu()                 // 메뉴 닫힘 반영
```

**포인트:** `isMenuOpen`이 **단일 진실 공급원(Single Source of Truth)** 이다. 클래스를 직접 토글하지 않고 상태 → 렌더 순서를 지킨다.

---

## 예시 2: 테마 토글 (`js/theme.js`)

### 상태

```js
let currentTheme = "light"; // 또는 "dark"
```

### 흐름

```
[토글 클릭]
    → currentTheme = "dark" | "light"           // 1. JS 상태
    → document.documentElement.dataset.theme = … // 2. DOM 데이터 속성 (CSS 트리거)
    → localStorage.setItem("theme", …)          // 3. 영구 저장
    → renderTheme()                             // 4. 버튼 UI 갱신
        → icon.textContent = "☀" | "☾"
        → label.textContent = "Light mode" | "Dark mode"
        → aria-pressed 갱신
```

**포인트:** 색상 전환은 `dataset.theme` → CSS 변수로 **간접** 반영되고, `renderTheme()`은 **버튼 자체** UI만 담당한다. 역할이 분리되어 있다.

---

## 예시 3: GitHub 프로젝트 (`js/projects.js`)

### 상태

```js
let state = {
  status: "loading",  // "loading" | "success" | "empty" | "error"
  repos: [],
};
```

### 흐름

```
[init() 또는 Retry 클릭]
    → loadProjects()
        → state = { status: "loading", repos: [] }
        → renderLoading()                    // 스피너 UI

    → fetch 완료 (성공 경로)
        → state.status = "success"
        → state.repos = visible
        → renderSuccess(visible)             // 카드 그리드

    → fetch 실패 또는 visible = 0
        → state.status = "error" | "empty"
        → renderError() | renderEmpty()
```

### 상태 → 렌더 매핑

| `state.status` | 렌더 함수 | DOM 결과 |
|----------------|----------|----------|
| `loading` | `renderLoading()` | 스피너 + 문구 |
| `success` | `renderSuccess(repos)` | 카드 목록 |
| `empty` | `renderEmpty()` | 빈 상태 문구 |
| `error` | `renderError()` | 에러 문구 + Retry |

**포인트:** `loadProjects()`는 **비동기**이지만 패턴은 동일하다. API 결과에 따라 `state.status`만 바꾸고, 대응하는 `render*()`가 화면 전체를 교체한다.

---

## 예시 4: 폼 검증 (`js/contact.js`)

### 상태 (암묵적)

- 각 필드의 현재 값 (`field.value`)
- 각 필드의 오류 메시지 (`errors[fieldName]`)

### 흐름 (입력 중)

```
[input 이벤트]
    → validateField(name, value)     // 검증 → 오류 문자열 또는 undefined
    → renderFieldError(name, error)  // DOM: .error 텍스트, .is-invalid 클래스
```

### 흐름 (제출)

```
[submit 이벤트]
    → validateAll(formData)          // 전체 오류 객체
    → hasErrors ?
        → renderErrors(errors)       // 모든 필드 피드백
        : onValidSubmit() → renderSuccess()
```

**포인트:** 별도 `state` 객체 없이 **검증 결과**가 곧 화면 상태를 결정한다. 같은 render 패턴의 변형이다.

---

## 예시 5: 스크롤 UI (`js/nav.js`)

```
[scroll 이벤트]
    → handleScroll()
        → nav.classList.toggle("nav--scrolled", scrollY > 60)
        → toTop.classList.toggle("to-top--visible", scrollY > 300)
```

여기서 "상태"는 `window.scrollY` 값 자체이다. 별도 변수 없이 **브라우저 상태**를 읽어 DOM 클래스를 갱신한다.

---

## 패턴 비교 요약

| 기능 | 상태 | 이벤트 | 렌더 |
|------|------|--------|------|
| 햄버거 | `isMenuOpen` | `click` | `renderMenu()` |
| 테마 | `currentTheme` | `click` | `renderTheme()` + CSS 변수 |
| 프로젝트 | `state.status`, `state.repos` | `init`, Retry `click` | `renderLoading/Success/Error/Empty` |
| 폼 | 필드 값 + 오류 | `input`, `submit` | `renderFieldError`, `renderSuccess` |
| 스크롤 UI | `scrollY` | `scroll` | `handleScroll()` (인라인 DOM) |

---

## React와의 연결 (학습 맥락)

```
이벤트 → setState → 리렌더
```

바닐라 JS에서 `state` 객체 + `render*()` 함수는 React의 `useState` + 컴포넌트 리렌더와 같은 **단방향 데이터 흐름** 연습이다.

---

## 관련 파일

- `js/nav.js` — `isMenuOpen`, 스크롤 UI
- `js/theme.js` — `currentTheme`
- `js/projects.js` — `state` 객체
- `js/contact.js` — 검증 → 피드백 렌더
