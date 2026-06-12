# 기준 12 · 배열 메서드 · UI 변환

> **평가 항목:** 항목 4 · JavaScript  
> **질문:** 배열 메서드를 활용하여 GitHub 데이터를 카드 UI로 변환하는 과정을 단계별로 정리할 수 있는가?

---

## 결론

**예.** GitHub API가 반환한 **저장소 객체 배열**을 `filter` → `map` → `replaceChildren` 파이프라인으로 **DOM 카드 노드 배열**로 변환해 화면에 반영한다.

---

## 전체 파이프라인

```
HTTP 응답 (JSON)
    │
    ▼
await response.json()          →  repos: Object[]
    │
    ▼
.filter(!fork && !archived)    →  visible: Object[]
    │
    ▼
.map(toCard)                   →  cards: HTMLElement[]
    │
    ▼
grid.replaceChildren(...cards)  →  화면에 렌더링
```

---

## 단계 1: JSON → 배열 (`await response.json()`)

```js
const repos = await response.json();
```

GitHub API `/users/{username}/repos` 응답 예시 (각 항목 일부):

```json
{
  "name": "my-project",
  "description": "Portfolio website",
  "language": "JavaScript",
  "stargazers_count": 12,
  "html_url": "https://github.com/user/my-project",
  "fork": false,
  "archived": false
}
```

`repos`는 이런 객체들의 **배열**이다.

---

## 단계 2: `filter` — 표시 대상만 남기기

```js
const visible = repos.filter((repo) => !repo.fork && !repo.archived);
```

| 메서드 | 역할 | 입력 | 출력 |
|--------|------|------|------|
| `.filter()` | 조건을 만족하는 요소만 **걸러냄** | 12개 repo | N개 visible |

**필터 조건:**
- `!repo.fork` — 포크한 저장소 제외 (본인 작업이 아님)
- `!repo.archived` — 아카이브된 저장소 제외 (비활성 프로젝트)

`filter`는 **새 배열**을 반환한다. 원본 `repos`는 변경하지 않는다 (불변성).

---

## 단계 3: `map` — 객체 → DOM 노드

```js
function renderSuccess(repos) {
  const grid = getGrid();
  grid.replaceChildren(...repos.map(toCard));
}
```

| 메서드 | 역할 | 입력 | 출력 |
|--------|------|------|------|
| `.map(toCard)` | 각 요소를 **변환** | N개 repo 객체 | N개 `<article>` DOM 노드 |

### `toCard` 함수 상세

```js
function toCard({ name, description, language, stargazers_count, html_url }) {
  const card = document.createElement("article");
  card.className = "project-card";
  card.innerHTML = `
    <h3 class="project-card__title"></h3>
    <p class="project-card__description"></p>
    ...
  `;

  card.querySelector(".project-card__title").textContent = name;
  card.querySelector(".project-card__description").textContent =
    description ?? "No description";
  card.querySelector(".project-card__language").textContent = language ?? "—";
  card.querySelector(".project-card__stars").textContent = `★ ${stargazers_count}`;

  const link = card.querySelector(".project-card__link");
  link.href = html_url;

  return card;
}
```

**핵심 기법:**

1. **구조 분해 할당** — `{ name, description, ... }`로 필요한 필드만 추출
2. **`createElement("article")`** — 시맨틱 카드 요소 생성
3. **빈 템플릿 + `textContent`** — API 데이터를 `textContent`로 삽입

### `textContent` vs `innerHTML` (보안)

```js
// ✅ 안전 — HTML로 해석하지 않음
element.textContent = description;

// ⚠️ 위험 — 악성 스크립트 실행 가능
element.innerHTML = description;
```

GitHub 저장소 설명에 `<script>` 등이 포함될 수 있으므로, 사용자/API 데이터는 `textContent`로 넣는다. 카드 **골격**만 `innerHTML`로 만들고, **데이터**는 `textContent`로 채운다.

### Null 병합 (`??`)

```js
description ?? "No description"
language ?? "—"
```

`null`·`undefined`일 때 기본값을 표시한다.

---

## 단계 4: `replaceChildren` — 화면 반영

```js
grid.replaceChildren(...repos.map(toCard));
```

| API | 역할 |
|-----|------|
| `replaceChildren(...nodes)` | 컨테이너의 **모든 자식**을 새 노드로 교체 |

- 스프레드(`...`)로 DOM 노드 배열을 개별 인자로 전달
- 기존 로딩 UI·에러 UI가 **한 번에** 카드 목록으로 교체됨
- `innerHTML = cards.join()`보다 **DOM API를 직접** 쓰는 방식

---

## 데이터 변환 예시 (구체적)

입력 (`visible` 배열, 2건):

```js
[
  { name: "portfolio", description: "My site", language: "HTML", stargazers_count: 5, html_url: "..." },
  { name: "api-demo", description: null, language: "JS", stargazers_count: 0, html_url: "..." }
]
```

`.map(toCard)` 후:

```html
<article class="project-card">...</article>
<article class="project-card">...</article>
```

`replaceChildren` 후 `.projects-grid` 안에 2개 카드가 렌더링된다.

---

## 사용한 배열 메서드 정리

| 메서드 | 단계 | 하는 일 | 반환 |
|--------|------|---------|------|
| `filter` | 2 | 조건 통과 요소만 선택 | 새 배열 (객체) |
| `map` | 3 | 각 요소를 카드 DOM으로 변환 | 새 배열 (HTMLElement) |
| (spread) | 4 | 배열 → 함수 인자 목록 | — |

**사용하지 않은 메서드 (참고):**
- `forEach` — 반환값 없어 `map` 대신 쓰기 어려움
- `reduce` — 단순 1:1 변환에는 `map`이 더 읽기 쉬움

---

## CSS 그리드와의 연동

```css
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
```

`map`으로 만든 `<article>` 카드들이 Grid 컨테이너 안에 자동으로 열 배치된다. JS는 **카드 노드 생성**만, **배치**는 CSS가 담당한다.

---

## 관련 파일

- `js/projects.js` — `filter`, `map`, `toCard`, `replaceChildren`
- `css/style.css` — `.projects-grid`, `.project-card`
