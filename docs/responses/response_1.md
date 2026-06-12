# 기준 1 · 반응형 레이아웃

> **평가 항목:** 항목 1 · 기능 동작  
> **질문:** 브라우저 창 크기를 줄였을 때 레이아웃이 모바일에 맞게 변경되는가?

---

## 결론

**예.** 이 프로젝트는 **모바일 퍼스트** 전략으로 기본 스타일을 좁은 화면에 맞추고, `css/responsive.css`의 `min-width` 미디어 쿼리로 태블릿·데스크톱 레이아웃을 단계적으로 확장한다. 창 너비를 줄이면 네비게이션·About·Footer·Hero 등 주요 영역의 배치가 모바일에 맞게 바뀐다.

---

## 구현 방식

### 1. 뷰포트 설정

`index.html` `<head>`에 다음 메타 태그가 있어 모바일 기기에서 1:1 픽셀 비율로 렌더링된다.

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

이 설정이 없으면 모바일 브라우저가 페이지를 데스크톱 너비로 축소해 보여 주므로, 반응형 CSS가 의도대로 동작하지 않는다.

### 2. 기본(모바일) 레이아웃 — `css/style.css`

모바일에서의 핵심 동작은 기본 CSS에 정의되어 있다.

| 영역 | 모바일 기본 동작 | 관련 선택자 |
|------|-----------------|-------------|
| 네비게이션 | 햄버거 버튼 표시, 메뉴는 기본 숨김 | `.nav__hamburger`, `.nav__menu { display: none }` |
| 메뉴 열림 | 햄버거 클릭 시 세로 드롭다운 | `.nav__menu--open` |
| About | 텍스트·이미지 **세로** 배치 | `.about__content { flex-direction: column }` |
| Hero | 제목·부제·버튼 중앙 정렬, 작은 제목 크기 | `.hero` |
| Footer | 저작권·소셜 링크 **세로** 배치 | `.footer { flex-direction: column }` |
| 프로젝트 카드 | 1열 그리드 (`minmax(280px, 1fr)`) | `.projects-grid` |

### 3. 브레이크포인트 확장 — `css/responsive.css`

#### 태블릿 (768px 이상)

```css
@media (min-width: 768px) {
  .nav__hamburger { display: none; }
  .nav__menu { display: flex; flex-direction: row; ... }
  .about__content { flex-direction: row; }
  .footer { flex-direction: row; justify-content: space-between; }
  .hero__title { font-size: var(--font-size-3xl); }
}
```

- 햄버거가 사라지고 **가로 네비게이션**이 나타난다.
- About 섹션이 텍스트(좌) + 이미지(우) **2열** 구조로 바뀐다.
- Footer가 좌우 정렬된다.

#### 데스크톱 (1024px 이상)

```css
@media (min-width: 1024px) {
  .nav, section, .footer {
    max-inline-size: 1100px;
    margin-inline: auto;
  }
  .hero__title { font-size: calc(var(--font-size-3xl) + var(--space-2)); }
}
```

- 콘텐츠가 최대 1100px로 제한되고 **화면 중앙**에 정렬된다.
- Hero 여백·제목 크기가 더 커진다.

---

## 화면별 변화 요약

| 뷰포트 | 네비 | About | Footer | 콘텐츠 너비 |
|--------|------|-------|--------|-------------|
| ~767px (모바일) | 햄버거 + 드롭다운 | 세로 | 세로 | 전체 너비 |
| 768px~1023px (태블릿) | 가로 메뉴 | 가로 2열 | 좌우 정렬 | 전체 너비 |
| 1024px+ (데스크톱) | 가로 메뉴 | 가로 2열 | 좌우 정렬 | max 1100px 중앙 |

---

## 직접 확인 방법

1. `index.html`을 브라우저에서 연다.
2. 개발자 도구(F12) → **디바이스 툴바** 또는 반응형 모드 활성화.
3. 뷰포트를 순서대로 변경하며 관찰:
   - **375px** (iPhone): 햄버거 표시, About 세로, Footer 세로
   - **768px**: 햄버거 사라짐, 가로 메뉴, About 가로
   - **1024px**: 콘텐츠 중앙 정렬, Hero 제목 확대

---

## 관련 파일

- `index.html` — viewport 메타 태그
- `css/style.css` — 모바일 기본 레이아웃
- `css/responsive.css` — 768px, 1024px 브레이크포인트
- `js/nav.js` — 햄버거 메뉴 토글 (모바일 전용 UI)
