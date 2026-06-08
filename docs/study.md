# Responsive Portfolio Website — 학습 가이드

이 문서는 [subject.md](./subject.md) 미션 요구사항을 **학습·복습·자가 점검**용으로 정리한 가이드입니다.  
현재 프로젝트(`04-1.my_project`) 구현과 1:1로 대응하도록 작성했습니다.

---

## 1. 미션 한 줄 요약

**순수 HTML/CSS/JavaScript**로 반응형 포트폴리오를 만들고, **이벤트 → 상태 변경 → 화면 갱신** 패턴을 직접 경험한다.  
GitHub API로 Projects를 동적으로 채우고, 로딩·에러·빈 상태를 UI에 표현한다. 이 흐름은 이후 **React**의 state/rendering 개념의 기초가 된다.

---

## 2. 최종 산출물 체크리스트

| 항목 | 요구 | 이 프로젝트에서 확인할 곳 |
|------|------|---------------------------|
| 반응형 레이아웃 | 모바일·태블릿·데스크톱 | `css/responsive.css` (`768px`, `1024px`) |
| 섹션 6개 | Hero, About, Skills, Projects, Contact, Footer | `index.html` |
| 인터랙션 | 햄버거, 스무스 스크롤, 스크롤 애니메이션, 폼 검증 등 | `js/nav.js`, `js/animate.js`, `js/contact.js` |
| GitHub API | 저장소 목록 동적 렌더 | `js/projects.js`, `js/config.js` |
| 상태 유지 | 다크 모드 `localStorage` | `js/theme.js` |
| 배포 | GitHub Pages 공개 URL | `README.md` Deploy URL 섹션 |

---

## 3. 프로젝트 구조

```
04-1.my_project/
├── index.html          # 시맨틱 마크업, defer 모듈 진입점
├── css/
│   ├── style.css       # 토큰, 레이아웃, 컴포넌트
│   └── responsive.css  # 모바일 퍼스트 미디어 쿼리
├── js/
│   ├── main.js         # 모듈 초기화 오케스트레이션
│   ├── config.js       # API·스크롤·Observer 상수
│   ├── theme.js        # 다크 모드 + localStorage
│   ├── nav.js          # 햄버거, 스크롤, to-top
│   ├── animate.js      # Intersection Observer
│   ├── projects.js     # fetch + 상태별 렌더
│   └── contact.js      # 폼 검증
├── images/
└── docs/
    ├── subject.md      # 과제 명세
    └── study.md        # 본 문서
```

**진입점:** `index.html`에서 `<script type="module" defer src="./js/main.js">`로 로드 후, `main.js`가 각 `init()`을 호출한다.

---

## 4. 학습 목표별 정리 (subject §3)

### 4.1 시맨틱 HTML — 왜 쓰고, 어떻게 썼는가?

**왜:** 스크린 리더·검색엔진·유지보수 관점에서 **역할**이 드러나는 태그가 `div` 남발보다 낫다.

**이 프로젝트:**

- `<header>` + `<nav>`: 상단 네비게이션
- `<main>`: 본문 단일 랜드마크
- `<section id="...">`: Hero, About, Skills, Projects, Contact
- `<footer>`: 저작권·소셜 링크
- Projects 카드: JS에서 `<article class="project-card">` 생성 (`projects.js`)

**자가 점검**

- [ ] 각 섹션에 `id`가 있고, `nav a[href^="#"]`와 짝이 맞는가?
- [ ] 이미지에 의미 있는 `alt`가 있는가? (`about__image`)
- [ ] 폼 `label`의 `for`와 `input` `id`가 연결되어 있는가?

---

### 4.2 Flexbox vs Grid — 차이와 선택 기준

| 도구 | 적합한 경우 | 이 프로젝트 예 |
|------|-------------|----------------|
| **Flexbox** | 한 축(행 또는 열) 정렬, 공간 분배 | `.nav` (로고·메뉴·토글), About 2열, Footer |
| **Grid** | 2차원 배치, 반응형 카드 열 | `.projects-grid` — `repeat(auto-fit, minmax(280px, 1fr))` |

```361:365:04-1.my_project/css/style.css
.projects-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
```

**모바일 퍼스트:** 기본 스타일은 좁은 화면 기준 → `responsive.css`에서 `min-width: 768px`, `1024px`로 확장.

**자가 점검**

- [ ] 768px 미만에서 햄버거가 보이고, 데스크톱에서 메뉴가 가로로 펼쳐지는가?
- [ ] 카드 그리드가 창 너비에 따라 열 개수가 자동으로 바뀌는가?

---

### 4.3 DOM 선택과 이벤트

**규칙 (subject §4.4):**

- `const` / `let`만 사용 (`var` 금지)
- HTML `onclick` 금지 → `addEventListener`
- `querySelector`, `querySelectorAll`
- 필요 시 `event.preventDefault()`

**패턴 예 — 네비 앵커 스무스 스크롤:**

```31:48:04-1.my_project/js/nav.js
  anchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      // ...
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      closeMenu();
    });
  });
```

**자가 점검**

- [ ] `classList.toggle`, `add`, `remove`를 어디서 쓰는지 각각 한 곳씩 말할 수 있는가?
- [ ] `textContent` vs `innerHTML` — XSS·성능 관점에서 프로젝트가 어떤 선택을 했는가?

---

### 4.4 ES6+와 배열 메서드

| 기능 | 용도 | 코드 위치 |
|------|------|-----------|
| 화살표 함수 | 콜백, 짧은 핸들러 | 전 모듈 |
| 템플릿 리터럴 | 로딩/에러 UI HTML | `projects.js` `renderLoading`, `renderError` |
| 구조 분해 | `toCard({ name, description, ... })` | `projects.js` |
| `filter` | fork/archived 제외 | `repos.filter((repo) => !repo.fork && !repo.archived)` |
| `map` | 저장소 → DOM 카드 | `repos.map(toCard)` |
| `forEach` | 필드별 input 리스너, Observer entries | `contact.js`, `animate.js` |

**자가 점검**

- [ ] `map` 결과가 문자열이 아니라 **DOM 노드 배열**인 이유(`replaceChildren`)를 설명할 수 있는가?

---

### 4.5 비동기 API — fetch, async/await, UI 상태

**엔드포인트:** `config.js`의 `PROJECTS_ENDPOINT`  
(`https://api.github.com/users/{username}/repos`)

**상태 머신 (`projects.js`):**

```
loading → success | error | empty
```

| 상태 | UI |
|------|-----|
| `loading` | 스피너 + 문구 |
| `success` | 카드 그리드 |
| `error` | 메시지 + Retry 버튼 (`loadProjects` 재호출) |
| `empty` | 공개 저장소 없음 메시지 |

```30:55:04-1.my_project/js/projects.js
  try {
    const response = await fetch(PROJECTS_ENDPOINT);
    if (!response.ok) {
      state.status = "error";
      renderError();
      return;
    }
    const repos = await response.json();
    const visible = repos.filter((repo) => !repo.fork && !repo.archived);
    // ...
  } catch {
    state.status = "error";
    renderError();
  }
```

**자가 점검**

- [ ] `response.ok`가 false일 때와 `catch`일 때 사용자에게 보이는 차이는?
- [ ] 네트워크 탭에서 실제 요청 URL·상태 코드를 확인해 봤는가?

---

### 4.6 이벤트 → 상태 → UI (React 예행연습)

subject §4.8: 최소 **3가지** “상태 변경 후 렌더” 흐름을 명확히 할 것.

| # | 이벤트 | 상태 | UI 갱신 |
|---|--------|------|---------|
| 1 | 다크 모드 클릭 | `currentTheme` + `data-theme` + `localStorage` | CSS 변수(`:root[data-theme="dark"]`), 토글 라벨·아이콘 |
| 2 | 페이지 로드 / Retry | `state.status`, `state.repos` | Projects 영역 전체 교체 |
| 3 | input / submit | 필드별 에러 객체 | `.error[data-for]`, `.is-invalid`, `.form-status` |
| 4 (선택) | 언어 필터 클릭 | `filterLanguage` | 카드 목록 재렌더 (보너스) |

**다크 모드 흐름:**

```10:34:04-1.my_project/js/theme.js
  let currentTheme = "light";
  const storedTheme = localStorage.getItem("theme");
  // ... 복원 ...
  toggle.addEventListener("click", () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = currentTheme;
    localStorage.setItem("theme", currentTheme);
    renderTheme();
  });
```

CSS는 `[data-theme="dark"]`가 아니라 **`:root[data-theme="dark"]`** 로 토큰을 덮어쓴다 (`style.css`).

---

## 5. 기능 요구사항 ↔ 구현 매핑

### 5.1 필수 인터랙션

| 기능 | 요구 | 구현 | 상수 (`config.js`) |
|------|------|------|---------------------|
| 햄버거 | `classList.toggle`, 모바일 메뉴 | `nav.js` — `nav__menu--open` | — |
| 스무스 스크롤 | nav 클릭 시 섹션 이동 | `scrollIntoView({ behavior: "smooth" })` | — |
| Scroll to top | 300px+ 표시 | `.to-top--visible` | `SCROLL_TOP_THRESHOLD = 300` |
| Nav 배경 | 60px+ 스크롤 시 스타일 | `.nav--scrolled` | `NAV_BG_THRESHOLD = 60` |
| 다크 모드 | toggle + localStorage | `theme.js` | key: `"theme"` |
| 스크롤 애니메이션 | Intersection Observer, threshold ≥ 0.2 | `animate.js` — `data-animate` → `.is-visible` | `OBSERVER_THRESHOLD = 0.2` |
| Contact 폼 | required, 이메일 형식, 필드 옆 에러, submit 시 preventDefault + 성공 메시지 | `contact.js` | `EMAIL_REGEX`, 메시지 10자 이상 |

### 5.2 CSS 요구

| 항목 | 구현 파일·선택자 |
|------|------------------|
| CSS 변수 `:root` | `style.css` — 색·간격·타이포·shadow |
| 다크 테마 | `:root[data-theme="dark"]` |
| Nav Flexbox | `.nav { display: flex; }` |
| 카드 Grid | `.projects-grid` |
| hover + transition | `.btn`, `.project-card` 등 |
| box-shadow 카드 | `--shadow-card`, `--shadow-card-hover` |

### 5.3 Contact 폼 검증 규칙

- **name:** trim 후 비어 있으면 안 됨
- **email:** 정규식 `EMAIL_REGEX`
- **message:** trim 길이 ≥ 10
- **input 시:** 실시간 `renderFieldError`
- **submit 시:** `preventDefault` → 전체 검증 → 실패 시 에러만, 성공 시 `form.reset()` + status 메시지

---

## 6. 복습용 스스로 답하기 (口頭/메모 추천)

1. React 없이도 “상태”는 어디에 저장되는가? (`let` 변수, `state` 객체, `localStorage`, DOM `dataset`)
2. `defer`와 `type="module"`을 같이 쓰면 로드 순서는 어떻게 되는가?
3. `prefers-color-scheme`와 `localStorage`를 동시에 쓰면 우선순위는 어떻게 설계할 것인가? (보너스)
4. GitHub API rate limit에 걸리면 UI는 어떤 상태인가?
5. `innerHTML`로 카드를 만들 때와 `createElement` + `textContent`로 만들 때의 트레이드오프는?

---

## 7. 보너스 과제 (subject §5)

| 보너스 | 학습 포인트 | 참고 |
|--------|-------------|------|
| 프로젝트 언어 필터 | `filter` + 상태 + 재렌더 | `docs/bonus_plan.md` |
| 타이핑 효과 | `setInterval` / 문자열 조작 | Hero `.hero__title` |
| Formspree / EmailJS | 실제 제출 | `contact.js` submit 핸들러 확장 |
| 시스템 다크 모드 | `@media (prefers-color-scheme: dark)` | `theme.js` 초기화 분기 |

---

## 8. 배포·README 점검

배포 전·후에 아래를 **실기기 또는 DevTools 디바이스 모드**로 확인한다.

- [ ] GitHub Pages URL에서 CSS/JS 경로가 깨지지 않는가 (상대 경로 `./css/...`)
- [ ] `config.js`의 `GITHUB_USERNAME`이 본인 계정인가
- [ ] README에 deploy URL, 스크린샷(모바일/태블릿/데스크톱 × 라이트/다크)이 있는가
- [ ] 라이트/다크 전환 후 **새로고침**해도 테마가 유지되는가

---

## 9. React로 넘어갈 때 연결 고리

| Vanilla (이 미션) | React에서의 대응 |
|-------------------|------------------|
| `let currentTheme` + `renderTheme()` | `useState` + re-render |
| `state.status` + `renderLoading()` … | 조건부 JSX / 상태 기반 UI |
| `addEventListener` | props `onClick`, synthetic events |
| `document.querySelector` | refs (필요 시), 대부분 선언적 JSX |
| `classList.toggle` | `className` / CSS modules |
| `localStorage` | 동일 + `useEffect`로 hydrate |

이 미션에서 **“상태를 어디에 두고, 어떤 함수가 화면을 갱신하는지”**를 파일별로 말할 수 있으면, 컴포넌트·hooks 학습 시 마찰이 크게 줄어든다.

---

## 10. 빠른 파일 읽기 순서 (추천)

1. `index.html` — 구조와 훅(id, data-animate, 폼 마크업)
2. `css/style.css` — `:root` 토큰, Grid/Flex, 다크 테마
3. `css/responsive.css` — 브레이크포인트 동작
4. `js/main.js` → `theme.js` → `nav.js` → `projects.js` → `contact.js` → `animate.js`
5. `js/config.js` — 한곳에서 임계값·API 수정

---

## 참고

- 과제 원문: [subject.md](./subject.md)
- 단계별 계획: [plan.md](./plan.md), [plans/](./plans/)
- 보너스: [bonus_plan.md](./bonus_plan.md)
