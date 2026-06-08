# Portfolio Website 평가 응답서

> [평가문항](./평가문항.md)에 대한 항목별 답변. 코드 경로는 프로젝트 루트(`04-1.my_project/`) 기준이다.

---

## 항목 1 · 기능 동작

### 반응형 레이아웃

**Q. 브라우저 창 크기를 줄였을 때 레이아웃이 모바일에 맞게 변경되는가?**

기본 스타일은 모바일(좁은 화면)을 기준으로 작성하고, `css/responsive.css`에서 `min-width` 미디어 쿼리로 태블릿·데스크톱 레이아웃을 확장한다.


| 화면        | 주요 변화                                              |
| --------- | -------------------------------------------------- |
| 모바일 (기본)  | 햄버거 메뉴 표시, About 세로 배치, Hero 제목 작은 크기              |
| 768px 이상  | 햄버거 숨김·가로 네비, About 가로 배치, Footer 좌우 정렬            |
| 1024px 이상 | 콘텐츠 `max-inline-size: 1100px` 중앙 정렬, Hero 여백·제목 확대 |


확인 방법: 브라우저 개발자 도구에서 뷰포트를 375px → 768px → 1024px로 바꾸면 네비게이션·About·Footer 배치가 단계적으로 변경된다.

### 테마 전환

**Q. 테마 토글 버튼 클릭 시 다크/라이트 모드가 전환되고, 새로고침 후에도 선택이 유지되는가?**

`js/theme.js`가 테마를 관리한다.

1. 페이지 로드 시 `localStorage.getItem("theme")`로 저장된 값을 읽어 `document.documentElement.dataset.theme`에 적용한다.
2. 토글 클릭 시 `currentTheme`을 `light` ↔ `dark`로 바꾸고, `dataset.theme`과 `localStorage.setItem("theme", ...)`를 함께 갱신한다.
3. `renderTheme()`이 버튼 아이콘(☀/☾), 라벨, `aria-pressed`를 현재 테마에 맞게 업데이트한다.

CSS는 `:root[data-theme="dark"]`에서 색상 변수만 덮어쓰므로, 한 번의 속성 변경으로 전체 페이지 색상이 전환된다.

### 인터랙션 UI

**Q. 햄버거 메뉴, 스크롤 애니메이션, 맨 위로 가기 버튼 등이 정상 동작하는가?**


| 기능           | 구현 파일           | 동작                                                                         |
| ------------ | --------------- | -------------------------------------------------------------------------- |
| 햄버거 메뉴       | `js/nav.js`     | 클릭 시 `isMenuOpen` 토글 → `nav__menu--open` 클래스·`aria-expanded` 갱신            |
| 스무스 스크롤      | `js/nav.js`     | 앵커 링크 클릭 시 `scrollIntoView({ behavior: "smooth" })`, 메뉴 자동 닫힘              |
| 스크롤 시 네비 그림자 | `js/nav.js`     | `scrollY > 60`이면 `nav--scrolled` 클래스 추가                                    |
| 맨 위로 가기      | `js/nav.js`     | `scrollY > 300`이면 `.to-top--visible` 표시, 클릭 시 `scrollTo({ top: 0 })`       |
| 스크롤 애니메이션    | `js/animate.js` | `IntersectionObserver`로 `[data-animate]` 요소가 뷰포트에 들어오면 `is-visible` 클래스 추가 |


### GitHub API

**Q. GitHub API에서 데이터를 불러와 화면에 표시하고, 로딩·에러·빈 상태를 구분하여 보여주는가?**

`js/projects.js`의 `loadProjects()`가 GitHub API(`config.js`의 `PROJECTS_ENDPOINT`)를 호출한다.


| 상태          | 조건                                              | UI                                    |
| ----------- | ----------------------------------------------- | ------------------------------------- |
| **loading** | 요청 시작 직후                                        | 스피너 + "Loading projects..."           |
| **success** | 응답 성공 + 표시할 저장소 있음                              | `repos.map(toCard)`로 카드 렌더링           |
| **empty**   | `GITHUB_USERNAME` 미설정, 또는 fork/archived 제외 후 0건 | "No public repositories yet."         |
| **error**   | `response.ok` 실패 또는 `catch`                     | "Failed to load projects." + Retry 버튼 |


fork·archived 저장소는 `repos.filter((repo) => !repo.fork && !repo.archived)`로 제외한다.

### 폼 유효성 검사

**Q. 필수 입력값 누락, 이메일 형식 오류 시 즉각적인 피드백이 표시되는가?**

`js/contact.js`가 Contact 폼을 처리한다.

- **입력 중(`input` 이벤트)**: 필드별 `validateField()` 실행 → `.error[data-for]`에 메시지 표시, `is-invalid` 클래스 토글
- **제출 시(`submit` 이벤트)**: `validateAll()`로 전체 검증, 오류가 있으면 각 필드에 피드백 표시 후 전송 중단

검증 규칙:


| 필드      | 규칙                | 오류 메시지                                              |
| ------- | ----------------- | --------------------------------------------------- |
| name    | 공백만 있으면 실패        | "Please enter your name."                           |
| email   | `EMAIL_REGEX` 불일치 | "Please enter a valid email address."               |
| message | 10자 미만            | "Please enter a message of at least 10 characters." |


오류 메시지는 `role="alert"`·`aria-live="polite"`로 스크린 리더에도 전달된다.

---

## 항목 2 · 코드 구조

**Q. HTML, CSS, JavaScript가 각각의 파일로 분리되어 있고, 분리한 이유와 각 파일의 역할을 구분하여 설명할 수 있는가?**

### 분리 이유

- **관심사 분리**: 구조(HTML), 표현(CSS), 동작(JS)을 나누면 각 레이어를 독립적으로 수정·재사용할 수 있다.
- **캐시·유지보수**: CSS·JS를 별도 파일로 두면 브라우저 캐시가 효율적이고, HTML이 비대해지지 않는다.
- **역할별 모듈화**: JS는 ES module로 기능 단위(`theme`, `nav`, `projects` 등)를 분리해 진입점(`main.js`)에서 조합한다.

### 파일 역할


| 파일                   | 역할                                 |
| -------------------- | ---------------------------------- |
| `index.html`         | 페이지 구조·시맨틱 마크업, 섹션 골격, 스크립트·스타일 연결 |
| `css/style.css`      | 디자인 토큰(변수), 기본 레이아웃, 컴포넌트 스타일      |
| `css/responsive.css` | 브레이크포인트별 반응형 오버라이드                 |
| `js/main.js`         | 각 모듈 `init()` 호출 진입점               |
| `js/config.js`       | API URL, 스크롤 임계값 등 상수              |
| `js/theme.js`        | 다크/라이트 테마 전환·localStorage          |
| `js/nav.js`          | 햄버거 메뉴, 스무스 스크롤, to-top, 스크롤 네비    |
| `js/animate.js`      | IntersectionObserver 스크롤 애니메이션     |
| `js/projects.js`     | GitHub API 호출·상태·카드 렌더링            |
| `js/contact.js`      | 폼 유효성 검사·피드백                       |


---

## 항목 3 · HTML·CSS

### 시맨틱 HTML

**Q. 시맨틱 태그를 사용했고, 어떤 기준으로 태그를 선택했는지 설명할 수 있는가?**

`index.html`에서 **콘텐츠의 역할**에 맞는 태그를 선택했다.


| 태그                | 사용 위치                                  | 선택 기준                  |
| ----------------- | -------------------------------------- | ---------------------- |
| `<header>`        | 상단 네비게이션 영역                            | 페이지 상단·사이트 식별·탐색       |
| `<nav>`           | 메뉴 링크 목록                               | 주요 탐색 경로               |
| `<main>`          | Hero~Contact 섹션 묶음                     | 문서의 핵심 콘텐츠(한 페이지에 하나)  |
| `<section>`       | Hero, About, Skills, Projects, Contact | 주제별 독립 구역, `id`로 앵커 연결 |
| `<footer>`        | 저작권·소셜 링크                              | 페이지 하단 보조 정보           |
| `<form>`          | Contact 폼                              | 사용자 입력 수집              |
| `<label>` + `for` | 각 입력 필드                                | 접근성: 라벨-입력 연결          |
| `<article>`       | 프로젝트 카드(`projects.js`)                 | 독립적으로 읽을 수 있는 콘텐츠 단위   |


`<div>`는 레이아웃·스타일 래퍼(`about__content`, `form-group`)에만 사용하고, 의미 있는 영역은 시맨틱 태그로 표현했다.

### CSS 변수

**Q. CSS 변수로 색상, 폰트 등을 정의했고, 변수로 관리하면 어떤 이점이 있는지 구체적으로 설명할 수 있는가?**

`css/style.css`의 `:root`에 디자인 토큰을 정의한다.

```css
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --font-family-base: "Inter", system-ui, sans-serif;
  --space-4: 1rem;
  /* ... */
}
```

**이점:**

1. **일관성**: 같은 `--color-accent`를 버튼·링크·포커스 테두리에 공유해 색상 불일치를 방지한다.
2. **테마 전환**: `:root[data-theme="dark"]`에서 변수 값만 바꾸면 수백 개의 `color` 선언을 수정할 필요가 없다.
3. **유지보수**: 간격·폰트 크기를 `--space-`*, `--font-size-`* 스케일로 관리해 한 곳에서 조정 가능하다.
4. **가독성**: `var(--space-5)`는 `1.5rem`보다 의도(간격 단계)가 명확하다.

### Flexbox · Grid

**Q. Flexbox와 Grid를 각각 어디에 적용했고, 해당 상황에서 그 방식을 선택한 이유를 비교하여 설명할 수 있는가?**


| 방식          | 적용 위치                                                                                    | 선택 이유                                                                                            |
| ----------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Flexbox** | `.nav`, `.hero`, `.about__content`, `.skills`, `.project-card`, `.footer`, `.form-group` | **1차원**(가로 또는 세로) 정렬·간격·정렬 축 제어. 햄버거·테마 토글을 양끝에 배치하거나, 스킬 태그를 `flex-wrap`으로 줄바꿈하는 데 적합           |
| **Grid**    | `.projects-grid`                                                                         | **2차원** 카드 배치. `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`로 열 수를 뷰포트에 맞게 자동 조절 |


**비교:**

- Flexbox는 "한 줄(또는 한 열) 안에서 항목을 어떻게 배치할지"에 강하다 → 네비, 폼, 카드 내부 레이아웃.
- Grid는 "행과 열을 동시에 정의"하는 데 강하다 → 프로젝트 카드처럼 균일한 그리드가 필요한 영역.
- 이 프로젝트는 **Flexbox로 컴포넌트 내부·1차원 흐름**, **Grid로 카드 그리드**라는 역할 분담을 따른다.

### 반응형 전략

**Q. 반응형 디자인에서 모바일 퍼스트로 작성한 이유를 설명할 수 있는가?**

`css/responsive.css`는 `@media (min-width: 768px)`, `@media (min-width: 1024px)`만 사용한다. 즉 **기본 = 모바일**, 큰 화면에서 스타일을 **추가(enhance)** 한다.

**모바일 퍼스트를 선택한 이유:**

1. **실제 사용 비중**: 포트폴리오·랜딩 페이지는 모바일 트래픽 비율이 높아, 먼저 좁은 화면에서 읽기·탭하기 쉽게 만드는 것이 우선이다.
2. **점진적 향상**: 모바일에 필요한 최소 CSS만 기본으로 두고, 여유가 생기는 화면부터 가로 메뉴·2열 About 등을 덧붙인다. 데스크톱 퍼스트는 "큰 화면용 스타일을 미디어 쿼리로 제거"해야 해서 규칙이 복잡해지기 쉽다.
3. **성능**: 작은 화면 사용자는 불필요한 데스크톱 전용 규칙을 파싱하지 않는다.
4. **이 프로젝트 맥락**: 햄버거 메뉴·세로 Hero가 기본이고, 768px 이상에서만 가로 네비로 전환하는 흐름과 자연스럽게 맞는다.

---

## 항목 4 · JavaScript

### 이벤트 등록 방식

**Q. `onclick` 인라인 속성 대신 `addEventListener`를 사용한 이유를 두 방식의 차이를 비교하여 설명할 수 있는가?**

이 프로젝트의 모든 이벤트는 `addEventListener`로 등록한다(예: `theme.js`의 토글, `nav.js`의 햄버거·스크롤, `contact.js`의 `input`/`submit`).


| 비교 항목  | `onclick` (인라인)                    | `addEventListener`            |
| ------ | ---------------------------------- | ----------------------------- |
| 위치     | HTML 속성 (`<button onclick="...">`) | JS 파일                         |
| 핸들러 개수 | 요소당 하나(덮어쓰기)                       | 같은 이벤트에 여러 리스너 등록 가능          |
| 관심사 분리 | HTML에 동작 로직 혼입                     | 마크업과 동작 분리                    |
| 옵션     | 제한적                                | `{ passive: true }` 등 세밀한 제어  |
| 제거     | 속성 삭제 필요                           | `removeEventListener`로 명시적 해제 |


**선택 이유:** HTML은 구조만 담당하고, 동작은 JS 모듈에 모아 테스트·수정·재사용이 쉽다. 스크롤 리스너에는 `{ passive: true }`로 스크롤 성능을 보호한다(`nav.js`).

### 이벤트 → 상태 → 화면

**Q. 이벤트 → 상태 변경 → 화면 업데이트 흐름이 코드에서 어떻게 이어지는지 따라가며 설명할 수 있는가?**

#### 예시 1: 햄버거 메뉴 (`js/nav.js`)

```
클릭 이벤트 → isMenuOpen = !isMenuOpen (상태 변경)
           → renderMenu() → classList.toggle("nav__menu--open")
           → aria-expanded 갱신 (화면·접근성 반영)
```

#### 예시 2: 테마 토글 (`js/theme.js`)

```
클릭 이벤트 → currentTheme 토글 (상태 변경)
           → dataset.theme + localStorage 갱신
           → renderTheme() → 아이콘·라벨·aria-pressed 업데이트
```

#### 예시 3: GitHub 프로젝트 (`js/projects.js`)

```
init() / Retry 클릭 → state.status = "loading" → renderLoading()
fetch 완료         → state.status = "success" | "error" | "empty"
                   → renderSuccess() | renderError() | renderEmpty()
```

공통 패턴: **이벤트 핸들러가 상태(변수·`state` 객체)를 바꾸고, 렌더 함수가 DOM을 갱신**한다. HTML을 직접 이벤트마다 조작하기보다 "상태 → 렌더"로 나누어 흐름을 추적하기 쉽다.

### API 비동기 처리

**Q. `async`/`await`와 `try`/`catch`를 사용하여 API 호출 성공과 실패를 어떻게 분기 처리했는지 코드 흐름을 따라 설명할 수 있는가?**

`js/projects.js`의 `loadProjects()` 흐름:

```text
1. state = { status: "loading", repos: [] }
2. renderLoading()                    ← UI: 로딩 표시
3. GITHUB_USERNAME 없으면 → empty 분기 후 return
4. try {
     response = await fetch(...)
     if (!response.ok) → state.status = "error", renderError(), return
     repos = await response.json()
     visible = repos.filter(...)
     if (visible.length === 0) → empty 분기
     else → success 분기, renderSuccess(visible)
   } catch {
     state.status = "error"
     renderError()                   ← 네트워크 예외 처리
   }
```

- `async`/`await`: Promise 체인 없이 동기 코드처럼 읽히며, `fetch`와 `response.json()` 순서가 명확하다.
- `response.ok` 검사: HTTP 4xx/5xx는 예외가 아니므로 `try` 밖이 아닌 **명시적 분기**로 처리한다.
- `catch`: 네트워크 단절·CORS 등 **throw되는 오류**를 한곳에서 처리한다.
- `renderError()`의 Retry 버튼이 `loadProjects`를 다시 호출해 실패 후 재시도가 가능하다.

### 배열 메서드 · UI 변환

**Q. 배열 메서드를 활용하여 GitHub 데이터를 카드 UI로 변환하는 과정을 단계별로 정리할 수 있는가?**

`loadProjects()` → `renderSuccess(visible)` → `toCard()` 순서:


| 단계  | 메서드/처리                                            | 입력 → 출력                                             |
| --- | ------------------------------------------------- | --------------------------------------------------- |
| 1   | `await response.json()`                           | HTTP 응답 → 저장소 객체 배열                                 |
| 2   | `.filter((repo) => !repo.fork && !repo.archived)` | 전체 repos → 표시 대상만                                   |
| 3   | `.map(toCard)`                                    | 각 repo 객체 → `<article class="project-card">` DOM 노드 |
| 4   | `grid.replaceChildren(...cards)`                  | DOM 노드 배열 → 화면에 일괄 반영                               |


`toCard({ name, description, language, stargazers_count, html_url })`는 구조 분해로 필요한 필드만 꺼내 `createElement("article")`과 `textContent`로 카드를 만든다. `innerHTML`에 사용자 데이터를 넣지 않고 `textContent`를 쓰는 이유는 XSS 위험을 줄이기 위함이다.

### 상태 객체

**Q. 상태 객체를 따로 만들어 관리한 이유는 무엇이며, 그냥 변수로 처리하면 안 되는지 설명할 수 있는가?**

`js/projects.js`:

```js
let state = {
  status: "loading",
  repos: [],
};
```

**상태 객체를 쓰는 이유:**

1. **관련 데이터를 한곳에 묶음**: `status`와 `repos`는 항상 함께 변한다(로딩 중에는 `repos`가 비어 있고, 성공 시에만 채워짐). 객체로 묶으면 "프로젝트 목록의 현재 스냅샷"이 명확하다.
2. **렌더 분기와 대응**: `renderLoading` / `renderSuccess` / `renderError` / `renderEmpty`가 모두 `state.status`를 기준으로 호출되므로, 상태 전이를 추적하기 쉽다.
3. **확장성**: 나중에 `errorMessage`, `lastFetchedAt` 등을 같은 객체에 추가하기 쉽다.

**개별 변수(`let status`, `let repos`)만으로도 동작은 가능**하나, 필드가 늘어날수록 인자 전달·동기화 실수가 생기기 쉽다. React의 `useState`로 묶는 것과 같은 맥락으로, **UI와 연결된 데이터를 하나의 상태 단위로 관리**하는 연습이다.

---

## 확인 체크리스트


| 기준                           | 충족  | 근거 파일                                                     |
| ---------------------------- | --- | --------------------------------------------------------- |
| 1 · 반응형                      | ✅   | `css/responsive.css`                                      |
| 2 · 테마 + localStorage        | ✅   | `js/theme.js`, `css/style.css` `:root[data-theme="dark"]` |
| 3 · 인터랙션 UI                  | ✅   | `js/nav.js`, `js/animate.js`                              |
| 4 · GitHub API + 상태 UI       | ✅   | `js/projects.js`, `js/config.js`                          |
| 5 · 폼 검증                     | ✅   | `js/contact.js`                                           |
| 6 · 파일 분리                    | ✅   | `index.html`, `css/`, `js/`                               |
| 7 · 시맨틱 HTML                 | ✅   | `index.html`                                              |
| 8 · CSS 변수                   | ✅   | `css/style.css` `:root`                                   |
| 9 · addEventListener         | ✅   | 전체 `js/` 모듈                                               |
| 10 · 이벤트→상태→화면               | ✅   | `nav.js`, `theme.js`, `projects.js`                       |
| 11 · async/await + try/catch | ✅   | `js/projects.js` `loadProjects()`                         |
| 12 · 배열 메서드 → 카드 UI          | ✅   | `filter`, `map`, `replaceChildren`                        |
| 13 · Flexbox vs Grid         | ✅   | `css/style.css`                                           |
| 14 · 상태 객체                   | ✅   | `js/projects.js` `state`                                  |
| 15 · 모바일 퍼스트                 | ✅   | `css/responsive.css` `min-width` 쿼리                       |


