# 기준 6 · 코드 구조 (HTML / CSS / JS 분리)

> **평가 항목:** 항목 2 · 코드 구조  
> **질문:** HTML, CSS, JavaScript가 각각의 파일로 분리되어 있고, 분리한 이유와 각 파일의 역할을 구분하여 설명할 수 있는가?

---

## 결론

**예.** 프로젝트는 **관심사 분리(Separation of Concerns)** 원칙에 따라 구조(HTML), 표현(CSS), 동작(JS)을 별도 파일로 나눈다. JavaScript는 ES Module로 기능 단위 모듈을 만들고 `main.js`에서 조합한다.

---

## 프로젝트 디렉터리 구조

```
04-1.my_project/
├── index.html          ← 구조 (마크업)
├── css/
│   ├── style.css       ← 기본 스타일·디자인 토큰
│   └── responsive.css  ← 반응형 오버라이드
├── js/
│   ├── main.js         ← 진입점
│   ├── config.js       ← 상수
│   ├── theme.js        ← 테마
│   ├── nav.js          ← 네비게이션
│   ├── animate.js      ← 스크롤 애니메이션
│   ├── projects.js     ← GitHub API
│   └── contact.js      ← 폼 검증
└── images/
```

---

## 분리한 이유

### 1. 관심사 분리 (Separation of Concerns)

| 레이어 | 담당 | 수정 시 영향 |
|--------|------|-------------|
| HTML | **무엇**이 화면에 있는가 (구조·의미) | 콘텐츠·시맨틱 변경 |
| CSS | **어떻게** 보이는가 (색·간격·레이아웃) | 디자인 변경 |
| JS | **어떻게** 동작하는가 (이벤트·API·상태) | 인터랙션·로직 변경 |

예: 버튼 색을 바꿀 때 CSS만 수정하면 되고, GitHub API URL을 바꿀 때 `config.js`만 수정하면 된다. HTML을 건드릴 필요가 없다.

### 2. 캐시 효율

CSS·JS를 별도 파일로 두면 브라우저가 **개별 캐시**한다. HTML만 바뀌었을 때 CSS·JS를 다시 다운로드하지 않아 로딩이 빨라진다.

### 3. HTML 가독성·유지보수

인라인 `<style>`·`<script>`가 수백 줄이면 `index.html`이 비대해진다. 파일 분리로 HTML은 **페이지 골격**만 담당해 읽기 쉽다.

### 4. JS 모듈화

```js
// main.js
import { init as initTheme } from "./theme.js";
import { init as initNav } from "./nav.js";
// ...
initTheme();
initNav();
```

기능별로 `init()` 함수를 export하고 진입점에서 호출한다. 테마만 수정할 때 `theme.js`만 열면 된다.

---

## 각 파일의 역할

### HTML

| 파일 | 역할 |
|------|------|
| `index.html` | 페이지 구조, 시맨틱 마크업, 섹션 골격, CSS·JS `<link>`/`<script>` 연결 |

- 동적 콘텐츠(프로젝트 카드)를 제외한 **정적 구조**를 정의한다.
- `<div class="projects-grid"></div>`처럼 JS가 채울 **빈 컨테이너**만 둔다.

### CSS

| 파일 | 역할 |
|------|------|
| `css/style.css` | 디자인 토큰(`:root` 변수), 리셋, 컴포넌트 스타일, 다크 테마 변수 |
| `css/responsive.css` | 768px·1024px 브레이크포인트별 레이아웃 오버라이드 |

- `style.css` = 모든 화면 크기에 공통인 스타일
- `responsive.css` = 큰 화면에서만 달라지는 규칙 (모바일 퍼스트)

### JavaScript

| 파일 | 역할 |
|------|------|
| `js/main.js` | 각 모듈 `init()` 호출 **진입점** |
| `js/config.js` | API URL, 스크롤 임계값 등 **변경 가능한 상수** |
| `js/theme.js` | 다크/라이트 테마 전환, `localStorage` 영구 저장 |
| `js/nav.js` | 햄버거 메뉴, 스무스 스크롤, to-top, 스크롤 네비 그림자 |
| `js/animate.js` | `IntersectionObserver` 스크롤 등장 애니메이션 |
| `js/projects.js` | GitHub API 호출, 상태 관리, 카드 렌더링 |
| `js/contact.js` | 폼 유효성 검사, 오류·성공 피드백 |

---

## 연결 방식 (`index.html`)

```html
<link rel="stylesheet" href="./css/style.css" />
<link rel="stylesheet" href="./css/responsive.css" />
<script type="module" defer src="./js/main.js"></script>
```

- CSS는 `<head>`에서 로드 → 렌더링 전 스타일 적용
- JS는 `type="module"` + `defer` → HTML 파싱 후 ES Module로 실행
- `main.js`가 다른 모듈을 `import`하므로 **단일 진입점**만 HTML에 연결

---

## 분리하지 않았을 때의 문제 (비교)

| 문제 | 인라인 혼합 시 | 파일 분리 시 |
|------|---------------|-------------|
| 300줄 `<style>` in HTML | HTML 수정 시 실수 위험 | CSS 파일만 수정 |
| `<button onclick="...">` | HTML에 로직 혼입 | `addEventListener` in JS |
| GitHub API 로직 in HTML | 테스트·재사용 불가 | `projects.js` 독립 모듈 |
| 팀 협업 | 같은 파일 충돌 | 역할별 파일로 분업 |

---

## 관련 파일

- `index.html` — 구조·연결
- `css/style.css`, `css/responsive.css` — 스타일
- `js/main.js` 및 `js/*.js` — 동작 모듈
