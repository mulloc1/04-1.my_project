# 기준 7 · 시맨틱 HTML

> **평가 항목:** 항목 3 · HTML·CSS  
> **질문:** 시맨틱 태그를 사용했고, 어떤 기준으로 태그를 선택했는지 설명할 수 있는가?

---

## 결론

**예.** `index.html`에서 **콘텐츠의 역할과 의미**에 맞는 시맨틱 태그를 선택했다. `<div>`는 레이아웃·스타일 래퍼에만 사용하고, 페이지 구조·탐색·입력·독립 콘텐츠는 각각 적절한 시맨틱 태그로 표현한다.

---

## 태그 선택 기준

시맨틱 태그를 고를 때 적용한 기준:

1. **문서 구조**: 이 영역이 페이지에서 어떤 **역할**을 하는가?
2. **접근성**: 스크린 리더·검색 엔진이 구조를 이해할 수 있는가?
3. **앵커·탐색**: `id`·링크로 이동할 **주제별 구역**인가?
4. **독립성**: 이 콘텐츠를 **따로 빼서 읽을 수** 있는가?

`<div>`·`<span>`은 **의미가 없는** 래퍼이므로, 위 기준에 해당하면 시맨틱 태그를 우선한다.

---

## 태그별 사용 위치와 선택 이유

| 태그 | 사용 위치 | 선택 기준 |
|------|----------|----------|
| `<header>` | 상단 네비게이션을 감싸는 영역 | 페이지 **상단**·사이트 식별·탐색 진입점 |
| `<nav>` | Hero/About/Skills 등 메뉴 링크 목록 | 문서 내 **주요 탐색 경로** |
| `<main>` | Hero ~ Contact 섹션 전체 | 문서의 **핵심 콘텐츠** (페이지당 하나) |
| `<section>` | Hero, About, Skills, Projects, Contact | **주제별 독립 구역**, `id`로 앵커 연결 |
| `<footer>` | 저작권·소셜 링크 | 페이지 **하단 보조 정보** |
| `<form>` | Contact 입력 폼 | 사용자 **입력 수집** |
| `<label>` + `for` | Name, Email, Message 필드 | **접근성**: 라벨-입력 연결, 클릭 시 포커스 |
| `<article>` | 프로젝트 카드 (`projects.js`) | **독립적으로 읽을 수 있는** 콘텐츠 단위 |
| `<h1>` ~ `<h3>` | Hero 제목, 섹션 제목, 카드 제목 | **제목 계층** (h1 → h2 → h3) |
| `<ul>` / `<li>` | 스킬 목록, 소셜 링크, 네비 메뉴 | **목록** 구조 |

---

## 코드 예시

### 페이지 골격 (`index.html`)

```html
<header class="header">
  <nav class="nav">
    <a href="#hero" class="nav__logo">Portfolio</a>
    <ul class="nav__menu">...</ul>
  </nav>
</header>

<main>
  <section id="hero" class="hero" data-animate>...</section>
  <section id="about" class="about" data-animate>...</section>
  <section id="skills" class="skills-section" data-animate>...</section>
  <section id="projects" class="projects-section" data-animate>...</section>
  <section id="contact" class="contact" data-animate>
    <form class="contact-form" novalidate>...</form>
  </section>
</main>

<footer class="footer">...</footer>
```

- `<main>` 안에만 핵심 콘텐츠가 있어 보조 기기가 "본문"을 식별한다.
- 각 `<section>`에 `id`가 있어 `href="#about"` 앵커 네비게이션이 동작한다.

### 접근성 있는 폼

```html
<label for="contact-name">Name</label>
<input type="text" id="contact-name" name="name" required />
```

`for`와 `id`가 연결되어 라벨 클릭 시 입력란에 포커스가 간다.

### 동적 카드 (`js/projects.js`)

```js
const card = document.createElement("article");
card.className = "project-card";
```

각 GitHub 저장소는 독립적인 콘텐츠이므로 `<article>`이 적합하다. RSS 피드에서 항목 하나를 빼는 것과 같은 맥락이다.

---

## `<div>`를 쓴 경우 (의도적)

| 클래스 | 용도 | `<div>`인 이유 |
|--------|------|---------------|
| `.about__content` | 텍스트+이미지 레이아웃 래퍼 | 의미 없는 **배치용** 컨테이너 |
| `.form-group` | 라벨+입력+오류 묶음 | 폼 **시각적 그룹** (fieldset도 가능) |
| `.projects-grid` | 카드 그리드 컨테이너 | JS가 채우는 **빈 슬롯** |

시맨틱 태그로 대체할 수 있는 곳은 대체하고, 순수 레이아웃·스타일 목적만 `<div>`로 남겼다.

---

## 시맨틱 HTML의 이점

| 이점 | 설명 |
|------|------|
| **접근성** | 스크린 리더가 landmark(`header`, `nav`, `main`, `footer`)로 빠른 이동 지원 |
| **SEO** | 검색 엔진이 페이지 구조·주제를 파악하기 쉬움 |
| **유지보수** | 태그 이름만 봐도 영역 역할을 알 수 있음 |
| **표준 준수** | HTML Living Standard 권장 구조 |

---

## 제목 계층

```
h1 — "Your Name" (Hero, 페이지당 하나)
 └─ h2 — "About", "Skills", "Projects", "Contact" (섹션 제목)
      └─ h3 — 프로젝트 카드 제목 (저장소 이름)
```

건너뛰기 없이 `h1 → h2 → h3` 순서를 지켜 문서 아웃라인이 논리적이다.

---

## 관련 파일

- `index.html` — 전체 시맨틱 마크업
- `js/projects.js` — `<article>` 동적 생성
