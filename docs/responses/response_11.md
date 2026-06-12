# 기준 11 · API 비동기 처리 (`async`/`await` + `try`/`catch`)

> **평가 항목:** 항목 4 · JavaScript  
> **질문:** `async`/`await`와 `try`/`catch`를 사용하여 API 호출 성공과 실패를 어떻게 분기 처리했는지 코드 흐름을 따라 설명할 수 있는가?

---

## 결론

**예.** `js/projects.js`의 `loadProjects()`는 `async` 함수로 선언하고, `await fetch()`로 GitHub API를 호출한다. HTTP 오류(`!response.ok`)와 네트워크 예외(`catch`)를 **별도 경로**로 분기해 각각 `error` 상태 UI를 표시한다.

---

## 전체 코드 흐름

```js
async function loadProjects() {
  const grid = getGrid();
  if (!grid) return;

  // ① 로딩 상태 진입
  state = { status: "loading", repos: [] };
  renderLoading();

  // ② 사전 조건 검사 (API 호출 전)
  if (!GITHUB_USERNAME) {
    state.status = "empty";
    renderEmpty();
    return;
  }

  // ③ 비동기 API 호출
  try {
    const response = await fetch(PROJECTS_ENDPOINT);

    // ④ HTTP 상태 코드 검사
    if (!response.ok) {
      state.status = "error";
      renderError();
      return;
    }

    // ⑤ JSON 파싱
    const repos = await response.json();
    const visible = repos.filter((repo) => !repo.fork && !repo.archived);

    // ⑥ 데이터 유무 검사
    if (visible.length === 0) {
      state.status = "empty";
      renderEmpty();
      return;
    }

    // ⑦ 성공
    state.status = "success";
    state.repos = visible;
    renderSuccess(visible);

  } catch {
    // ⑧ 네트워크·파싱 예외
    state.status = "error";
    renderError();
  }
}
```

---

## 단계별 상세 설명

### ① 로딩 상태 (`loading`)

```js
state = { status: "loading", repos: [] };
renderLoading();
```

`fetch`를 호출하기 **전에** UI를 로딩으로 바꾼다. 사용자는 요청이 진행 중임을 즉시 본다. Retry 시에도 동일하게 loading으로 초기화한다.

### ② 사전 조건 (`empty` — 설정 누락)

```js
if (!GITHUB_USERNAME) {
  state.status = "empty";
  renderEmpty();
  return;
}
```

API를 호출할 필요 없이 **설정 오류**를 먼저 처리한다. 불필요한 네트워크 요청을 막는다.

### ③ `await fetch()` — 비동기 요청

```js
const response = await fetch(PROJECTS_ENDPOINT);
```

- `fetch`는 **Promise**를 반환한다.
- `await`는 Promise가 resolve될 때까지 함수 실행을 **일시 정지**하고, resolve되면 `response`에 할당한다.
- `.then()` 체인 대신 **동기 코드처럼 읽히는** 흐름이 된다.

### ④ HTTP 오류 분기 (`error` — 4xx/5xx)

```js
if (!response.ok) {
  state.status = "error";
  renderError();
  return;
}
```

**중요:** `fetch`는 HTTP 404·500에서도 **reject하지 않는다**. `response.ok`(status 200~299)가 `false`이면 **명시적으로** error 분기로 보낸다.

| status | `response.ok` | 처리 |
|--------|--------------|------|
| 200 | true | JSON 파싱 진행 |
| 403 (rate limit) | false | `renderError()` |
| 404 (user 없음) | false | `renderError()` |

### ⑤ `await response.json()` — JSON 파싱

```js
const repos = await response.json();
```

응답 본문을 JavaScript 배열로 변환한다. 이것도 Promise이므로 `await`한다. 잘못된 JSON이면 **catch**로 떨어진다.

### ⑥ 빈 데이터 분기 (`empty` — 필터 후 0건)

```js
if (visible.length === 0) {
  state.status = "empty";
  renderEmpty();
  return;
}
```

HTTP는 성공했지만 표시할 저장소가 없는 경우. API 실패와 **다른 UI**를 보여 준다.

### ⑦ 성공 분기 (`success`)

```js
state.status = "success";
state.repos = visible;
renderSuccess(visible);
```

### ⑧ `catch` — 네트워크 예외 (`error`)

```js
} catch {
  state.status = "error";
  renderError();
}
```

다음 경우에 `catch`로 진입한다:
- 네트워크 오프라인
- DNS 실패
- CORS 차단
- `response.json()` 파싱 실패

`catch` 블록에서도 `renderError()`를 호출해 **사용자에게 동일한 실패 UI**를 보여 주고, Retry로 재시도할 수 있다.

---

## `async`/`await` vs `.then()` 체인

### `.then()` 방식 (사용하지 않음)

```js
fetch(url)
  .then(res => {
    if (!res.ok) throw new Error();
    return res.json();
  })
  .then(repos => { /* success */ })
  .catch(() => { /* error */ });
```

### `async`/`await` 방식 (이 프로젝트)

```js
try {
  const response = await fetch(url);
  if (!response.ok) { /* error */ return; }
  const repos = await response.json();
  /* success */
} catch { /* error */ }
```

**선택 이유:**
- `if (!response.ok)`와 `empty` 분기를 **중간에 return**으로 넣기 쉽다
- 가독성: 위에서 아래로 읽는 **순차적 흐름**
- `try`/`catch`로 예외를 한곳에서 처리

---

## 성공 vs 실패 분기 다이어그램

```
loadProjects()
    │
    ├─ username 없음 ──────────→ empty
    │
    └─ try
         ├─ fetch
         │    ├─ !response.ok ─→ error
         │    └─ response.json()
         │         ├─ visible = 0 ─→ empty
         │         └─ visible ≥ 1 ──→ success
         │
         └─ catch ────────────────→ error
```

---

## Retry와의 연동

```js
grid.querySelector(".retry")?.addEventListener("click", loadProjects);
```

`loadProjects`는 **같은 async 함수**를 재호출한다. ①번부터 다시 실행되어 loading → (성공|실패) 흐름이 반복된다.

---

## 관련 파일

- `js/projects.js` — `loadProjects()` async 함수
- `js/config.js` — `PROJECTS_ENDPOINT`
