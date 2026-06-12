# 기준 14 · 상태 객체

> **평가 항목:** 항목 4 · JavaScript  
> **질문:** 상태 객체를 따로 만들어 관리한 이유는 무엇이며, 그냥 변수로 처리하면 안 되는지 설명할 수 있는가?

---

## 결론

**예.** `js/projects.js`는 `state` 객체로 `status`와 `repos`를 한곳에 묶어 관리한다. 개별 변수만으로도 **동작은 가능**하지만, 관련 데이터의 **동기화**·**상태 전이 추적**·**확장성** 측면에서 객체가 유리하다.

---

## 상태 객체 정의

```js
let state = {
  status: "loading",  // "loading" | "success" | "empty" | "error"
  repos: [],
};
```

프로젝트 목록 UI의 **현재 스냅샷**을 표현한다:
- **지금 어떤 화면**을 보여 줘야 하는가? → `status`
- **성공 시 어떤 데이터**를 가지고 있는가? → `repos`

---

## 상태 객체를 쓰는 이유

### 1. 관련 데이터를 한곳에 묶음

`status`와 `repos`는 **항상 함께 변한다**.

| 상황 | `status` | `repos` |
|------|----------|---------|
| 로딩 시작 | `"loading"` | `[]` (비움) |
| 성공 | `"success"` | 필터된 저장소 배열 |
| 빈 결과 | `"empty"` | `[]` |
| 에러 | `"error"` | `[]` (또는 이전 값 무시) |

```js
state = { status: "loading", repos: [] };  // 한 번에 초기화
```

개별 변수 `let status` + `let repos`를 쓰면 로딩 진입 시 **두 줄**을 항상 같이 써야 하고, 하나만 갱신하는 실수가 생길 수 있다.

### 2. 렌더 분기와 1:1 대응

```js
// status 값 → 렌더 함수
"loading" → renderLoading()
"success" → renderSuccess(state.repos)
"empty"   → renderEmpty()
"error"   → renderError()
```

`state.status` 하나만 보면 **어떤 UI를 그려야 하는지** 결정된다. 상태 머신 다이어그램과 코드가 직접 대응한다.

```
        loading
           │
     ┌─────┼─────┐
     ▼     ▼     ▼
  success empty error
```

### 3. 확장성

나중에 필드를 추가하기 쉽다:

```js
let state = {
  status: "loading",
  repos: [],
  errorMessage: "",      // 추가 가능
  lastFetchedAt: null,   // 추가 가능
};
```

함수 시그니처를 바꾸지 않고 객체에 프로퍼티만 늘리면 된다.

### 4. 디버깅·로깅

```js
console.log(state);
// { status: "success", repos: [...] }
```

한 객체를 출력하면 UI 관련 **전체 맥락**을 볼 수 있다. `status`와 `repos`를 따로 로그하면 관계를 추론해야 한다.

### 5. 프레임워크 패턴과의 연결

React:

```js
const [state, setState] = useState({ status: "loading", repos: [] });
```

Vue, Redux 등도 **상태를 객체/스토어**로 묶는다. 바닐라 JS에서 `state` 객체를 쓰는 것은 같은 **"UI 상태 단위"** 개념의 연습이다.

---

## 개별 변수로 처리하면?

```js
let status = "loading";
let repos = [];
```

**동작은 가능하다.** 소규모 코드에서는 문제없이 돌아간다.

### 개별 변수의 한계

| 문제 | 예시 |
|------|------|
| **동기화 실수** | `status = "success"`만 바꾸고 `repos` 갱신을 깜빡함 |
| **인자 전달 증가** | `renderSuccess(repos)` — status는 별도, repos는 인자로 |
| **초기화 분산** | 로딩 시 `status`와 `repos`를 각각 초기화해야 함 |
| **확장 시 복잡도** | 필드 3개면 변수 3개 + 조합 관리 부담 |

```js
// 실수 예: status만 success로
status = "success";
// repos는 아직 [] → renderSuccess([]) → 빈 화면
```

객체로 묶으면:

```js
state.status = "success";
state.repos = visible;  // 같은 블록에서 함께 갱신
renderSuccess(visible);
```

또는:

```js
state = { status: "success", repos: visible };
```

---

## 이 프로젝트에서 상태 객체를 쓴 모듈 vs 안 쓴 모듈

| 모듈 | 상태 방식 | 이유 |
|------|----------|------|
| `projects.js` | `state` 객체 | 4가지 UI 상태 + 데이터 배열 |
| `theme.js` | `currentTheme` 단일 변수 | 값 하나만 관리 |
| `nav.js` | `isMenuOpen` 단일 변수 | boolean 하나 |
| `contact.js` | 폼 필드 값 (DOM이 소스) | 별도 state 불필요 |

**모든 곳에 state 객체가 필요한 것은 아니다.** 데이터·UI 분기가 **복잡할 때** 객체로 묶는다.

---

## 상태 갱신 패턴 in `loadProjects()`

```js
// 패턴 A: 전체 교체 (로딩 진입)
state = { status: "loading", repos: [] };

// 패턴 B: 프로퍼티 갱신 (분기 내)
state.status = "error";
state.status = "success";
state.repos = visible;
```

로딩 진입 시 **전체 교체**로 확실히 초기화하고, 분기 안에서는 필요한 프로퍼티만 갱신한다.

---

## 정리

| 질문 | 답 |
|------|-----|
| 상태 객체를 쓰는 이유? | 관련 데이터 묶음, 렌더 분기 명확, 확장·디버깅 용이 |
| 변수만으로 안 되나? | **된다.** 다만 필드·분기가 늘면 동기화 실수와 복잡도 증가 |
| 언제 객체? | 여러 값이 함께 변하고 UI 상태 전이가 있을 때 |

---

## 관련 파일

- `js/projects.js` — `state` 객체 정의 및 `loadProjects()` 내 갱신
