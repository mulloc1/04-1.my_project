# `js/projects.js` — GitHub Projects 모듈

GitHub REST API에서 공개 저장소 목록을 가져와 Projects 섹션(`.projects-grid`)에 카드 UI로 렌더링한다.  
로딩·성공·에러·빈 상태를 **상태 객체**로 관리한다.

---

## 1. 역할 요약

| 기능 | 설명 |
|------|------|
| API fetch | `config.js`의 `PROJECTS_ENDPOINT` 호출 |
| 필터링 | fork·archived 저장소 제외 |
| 상태 UI | loading / success / error / empty 4가지 화면 |
| 재시도 | error 상태에서 Retry 버튼 → `loadProjects()` 재호출 |
| 카드 생성 | `map` + `replaceChildren`으로 `<article class="project-card">` 렌더 |

---

## 2. 의존성

### import

```js
import { GITHUB_USERNAME, PROJECTS_ENDPOINT } from "./config.js";
```

| 상수 | 예시 | 용도 |
|------|------|------|
| `GITHUB_USERNAME` | `"mulloc1"` | API 사용자, empty 분기 |
| `PROJECTS_ENDPOINT` | `https://api.github.com/users/{user}/repos?sort=updated&per_page=12` | fetch URL |

### HTML

```html
<section id="projects" class="projects-section" data-animate>
  <h2 class="section-title">Projects</h2>
  <div class="projects-grid"></div>   <!-- JS가 이 안을 채움 -->
</section>
```

`.projects-grid`가 없으면 `loadProjects()`가 **즉시 return** 한다.

---

## 3. 상태 객체

```js
let state = {
  status: "loading",  // "loading" | "success" | "error" | "empty"
  repos: [],
};
```

| status | 조건 | 렌더 함수 |
|--------|------|-----------|
| `loading` | fetch 시작 | `renderLoading()` |
| `success` | API 성공 + 표시할 repo ≥ 1 | `renderSuccess(repos)` |
| `error` | HTTP 실패, 네트워크/JSON 예외 | `renderError()` |
| `empty` | username 없음, 또는 필터 후 0건 | `renderEmpty()` |

**이벤트 → 상태 → 화면** 패턴의 대표 예시다.

---

## 4. `loadProjects()` 흐름

```text
init() / Retry 클릭
  │
  ├─ .projects-grid 없음 → return
  │
  ├─ state = { loading, repos: [] }
  ├─ renderLoading()
  │
  ├─ !GITHUB_USERNAME → empty → renderEmpty() → return
  │
  └─ try
       ├─ fetch(PROJECTS_ENDPOINT)
       ├─ !response.ok → error → renderError() → return
       ├─ repos = await response.json()
       ├─ visible = repos.filter(fork/archived 제외)
       ├─ visible.length === 0 → empty → renderEmpty() → return
       └─ success → renderSuccess(visible)
     catch
       └─ error → renderError()
```

---

## 5. 렌더 함수

### `renderLoading()`

- 스피너 + `"Loading projects..."` 메시지
- `innerHTML`로 `.projects-grid` 교체

### `renderSuccess(repos)`

```js
grid.replaceChildren(...repos.map(toCard));
```

- `map`으로 각 repo → `<article class="project-card">`
- `replaceChildren` — 기존 자식을 한 번에 교체 (loading/error UI 제거)

### `renderError()`

- `"Failed to load projects."` + **Retry** 버튼
- Retry 클릭 → `loadProjects()` 재등록·재호출

```js
grid.querySelector(".retry")?.addEventListener("click", loadProjects);
```

### `renderEmpty()`

- `"No public repositories yet."`
- username 미설정 또는 public repo 없음 (필터 후)

---

## 6. `toCard()` — 카드 DOM 생성

```js
function toCard({ name, description, language, stargazers_count, html_url }) {
  // <article class="project-card"> 생성
  // textContent로 XSS 방지 (innerHTML에 사용자/API 문자열 직접 삽입 최소화)
}
```

| 필드 | 표시 | null 처리 |
|------|------|-----------|
| `name` | 제목 | — |
| `description` | 설명 | `"No description"` |
| `language` | 언어 | `"—"` |
| `stargazers_count` | `★ N` | — |
| `html_url` | "View on GitHub" 링크 | `target="_blank" rel="noopener noreferrer"` |

---

## 7. 오류 처리 (Error handling)

`projects.js`는 **명시적 error state + UI + 재시도** 패턴을 사용한다.

### 7.1 Guard (사전 검사)

```js
if (!grid) return;
if (!GITHUB_USERNAME) { /* empty */ return; }
```

DOM·설정 문제는 API 호출 전에 분기한다.

### 7.2 HTTP 오류 — `response.ok`

```js
if (!response.ok) {
  state.status = "error";
  renderError();
  return;
}
```

| 예시 | 결과 |
|------|------|
| HTTP 403 (rate limit) | error UI |
| HTTP 404 (잘못된 user) | error UI |
| HTTP 200 | JSON 파싱 진행 |

GitHub API 비인증 요청: **시간당 60회/IP** 제한. 개발 중 자주 새로고침하면 403 → error 상태가 정상 동작이다.

### 7.3 네트워크 / JSON 예외 — `try/catch`

```js
try {
  const response = await fetch(PROJECTS_ENDPOINT);
  // ...
} catch {
  state.status = "error";
  renderError();
}
```

- 오프라인, CORS, JSON 파싱 실패 등 **throw** 되는 경우 처리
- `catch` 블록에 error 객체를 쓰지 않음 — 사용자에게 세부 메시지 대신 통일된 error UI

### 7.4 empty vs error 구분

| | empty | error |
|---|-------|-------|
| 원인 | username 없음, repo 0건 | API/네트워크 실패 |
| UI | 안내 문구만 | 문구 + Retry |
| 복구 | `config.js` username 변경 | Retry 또는 rate limit 대기 |

### 7.5 데이터 null 방어

```js
description ?? "No description"
language ?? "—"
```

API 필드가 `null`이어도 카드가 깨지지 않는다.

---

## 8. `nav.js`와 오류 처리 비교

| | `nav.js` | `projects.js` |
|---|----------|---------------|
| try/catch | ❌ | ✅ |
| 외부 의존 | 없음 (DOM만) | GitHub API |
| 실패 시 UI | 없음 (조용히 skip) | error / empty 메시지 |
| 복구 | — | Retry 버튼 |
| 패턴 | guard + early return | state machine + render |

---

## 9. `main.js`에서의 호출

```js
import { init as initProjects } from "./projects.js";

initProjects();  // → loadProjects() 즉시 실행
```

페이지 로드 시 자동으로 API를 호출한다. 별도 버튼 없이 Projects 섹션이 채워진다.

---

## 10. 자가 점검

- [ ] `config.js`의 `GITHUB_USERNAME`이 본인 계정인가?
- [ ] 로드 시 잠깐 loading 스피너가 보이는가?
- [ ] 성공 시 fork/archived 제외된 카드가 표시되는가?
- [ ] DevTools에서 네트워크 차단 → error + Retry 동작하는가?
- [ ] Retry 클릭 시 loading → success/error 재진행하는가?
- [ ] `http://` 서버로 열었는가?
- [ ] 403 rate limit 시 error UI — Retry 또는 대기 후 정상 복구되는가?

---

## 11. 관련 파일

| 파일 | 관계 |
|------|------|
| `index.html` | `.projects-grid` 컨테이너 |
| `js/config.js` | `GITHUB_USERNAME`, `PROJECTS_ENDPOINT` |
| `js/main.js` | `initProjects()` 호출 |
| `css/style.css` | `.project-card`, `.projects-state`, `.spinner` |
| `README.md` | API rate limit, username 설정 안내 |

---

## 12. 확장 아이디어 (참고)

- error UI에 HTTP status / rate limit 안내 문구 추가
- `catch (err)`로 개발 환경에서만 `console.error(err)`
- 캐시(`sessionStorage`)로 rate limit 완화
- skeleton UI로 loading UX 개선
