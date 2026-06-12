# 기준 4 · GitHub API

> **평가 항목:** 항목 1 · 기능 동작  
> **질문:** GitHub API에서 데이터를 불러와 화면에 표시하고, 로딩·에러·빈 상태를 구분하여 보여주는가?

---

## 결론

**예.** `js/projects.js`의 `loadProjects()`가 GitHub REST API에서 저장소 목록을 가져와 프로젝트 카드로 렌더링한다. **loading / success / empty / error** 네 가지 상태를 `state.status`로 관리하고, 각 상태에 맞는 UI를 별도 렌더 함수로 표시한다.

---

## API 설정

`js/config.js`:

```js
export const GITHUB_USERNAME = "mulloc1";
export const PROJECTS_ENDPOINT =
  `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12`;
```

- `sort=updated`: 최근 업데이트 순 정렬
- `per_page=12`: 최대 12개 저장소 요청
- 사용자명만 바꾸면 다른 계정의 저장소를 불러올 수 있다.

---

## 상태 머신 구조

```
init() → loadProjects()
           │
           ├─ loading  → renderLoading()   (스피너)
           ├─ empty    → renderEmpty()     (저장소 없음)
           ├─ success  → renderSuccess()   (카드 목록)
           └─ error    → renderError()     (실패 + Retry)
```

### 상태 객체

```js
let state = {
  status: "loading",
  repos: [],
};
```

모든 분기는 `state.status`를 기준으로 렌더 함수를 호출한다.

---

## 상태별 상세 동작

### loading — 요청 시작 직후

```js
state = { status: "loading", repos: [] };
renderLoading();
```

UI:
- 회전 스피너 (`.spinner`)
- "Loading projects..." 메시지

이전에 표시되던 카드나 에러 메시지가 즉시 지워지고 로딩 UI로 교체된다. Retry 클릭 시에도 동일하게 loading 상태로 진입한다.

### empty — 표시할 저장소가 없을 때

두 가지 경우에 empty 분기로 들어간다:

1. **`GITHUB_USERNAME`이 비어 있을 때** (설정 누락)
2. **API 응답은 성공했지만** `filter` 후 표시 대상이 0건일 때

```js
const visible = repos.filter((repo) => !repo.fork && !repo.archived);

if (visible.length === 0) {
  state.status = "empty";
  renderEmpty();
  return;
}
```

- **fork 저장소 제외**: 다른 사람 프로젝트를 포크한 것은 본인 작업이 아니므로
- **archived 저장소 제외**: 더 이상 유지보수하지 않는 저장소

UI: "No public repositories yet."

### success — 데이터 로드 성공

```js
state.status = "success";
state.repos = visible;
renderSuccess(visible);
```

`renderSuccess`는 `repos.map(toCard)`로 각 저장소를 `<article class="project-card">` DOM 노드로 변환하고 `grid.replaceChildren(...cards)`로 한 번에 화면에 반영한다.

카드에 표시되는 정보:
- 저장소 이름 (`name`)
- 설명 (`description`, 없으면 "No description")
- 주요 언어 (`language`)
- 스타 수 (`stargazers_count`)
- GitHub 링크 (`html_url`)

### error — HTTP 오류 또는 네트워크 예외

**HTTP 4xx/5xx** (`response.ok === false`):

```js
if (!response.ok) {
  state.status = "error";
  renderError();
  return;
}
```

**네트워크 단절·CORS 등 throw**:

```js
} catch {
  state.status = "error";
  renderError();
}
```

UI:
- "Failed to load projects." 메시지
- **Retry** 버튼 → `loadProjects()` 재호출

```js
grid.querySelector(".retry")?.addEventListener("click", loadProjects);
```

---

## 상태별 UI 비교

| 상태 | 조건 | 화면 | 사용자 액션 |
|------|------|------|------------|
| **loading** | fetch 시작 | 스피너 + 로딩 문구 | 대기 |
| **success** | 200 OK + visible ≥ 1 | 프로젝트 카드 그리드 | 카드 클릭 → GitHub |
| **empty** | username 없음 또는 visible = 0 | "No public repositories yet." | 없음 |
| **error** | !response.ok 또는 catch | 실패 문구 + Retry 버튼 | Retry 클릭 |

---

## 데이터 → UI 변환 (요약)

```
fetch(PROJECTS_ENDPOINT)
  → response.json()        // JSON 배열
  → .filter(...)           // fork/archived 제외
  → .map(toCard)           // DOM 노드 배열
  → replaceChildren(...)   // 화면 반영
```

`toCard`는 `textContent`로 사용자 데이터를 삽입해 XSS 위험을 줄인다 (기준 12에서 상세 설명).

---

## 확인 방법

1. **success**: 정상 네트워크에서 Projects 섹션에 카드가 표시되는지 확인.
2. **loading**: 개발자 도구 Network → Slow 3G로 스로틀 후 새로고침 → 스피너 확인.
3. **error**: Network → Offline 후 Retry → 에러 UI 확인.
4. **empty**: `config.js`에서 `GITHUB_USERNAME = ""`로 설정 후 새로고침.

---

## 관련 파일

- `js/projects.js` — API 호출, 상태 관리, 렌더링
- `js/config.js` — `GITHUB_USERNAME`, `PROJECTS_ENDPOINT`
- `css/style.css` — `.projects-grid`, `.project-card`, `.projects-state`, `.spinner`
- `index.html` — `<div class="projects-grid"></div>` (JS가 채움)
