# 기준 13 · Flexbox · Grid

> **평가 항목:** 항목 3 · HTML·CSS  
> **질문:** Flexbox와 Grid를 각각 어디에 적용했고, 해당 상황에서 그 방식을 선택한 이유를 비교하여 설명할 수 있는가?

---

## 결론

**예.** 이 프로젝트는 **Flexbox로 1차원(한 줄/한 열) 정렬**, **Grid로 2차원(행+열) 카드 배치**라는 역할 분담을 따른다. 각 레이아웃 문제의 성격에 맞는 도구를 선택했다.

---

## Flexbox vs Grid 핵심 차이

| | Flexbox | Grid |
|---|---------|------|
| **차원** | 1차원 (주축 하나) | 2차원 (행 + 열) |
| **강점** | 항목 정렬·분배·줄바꿈 | 격자 구조·균일한 칸 배치 |
| **축 제어** | `justify-content`, `align-items` | `grid-template-columns`, `gap` |
| **적합한 UI** | 네비, 폼, 카드 내부 | 카드 그리드, 대시보드 |

---

## Flexbox 적용 위치

### 1. `.nav` — 네비게이션 바

```css
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
}
```

| 선택 이유 |
|----------|
| 로고·메뉴·테마 토글·햄버거가 **한 줄**에 배치됨 |
| `space-between`으로 양끝 정렬, `margin-left: auto`로 메뉴를 오른쪽으로 밀 수 있음 |
| 768px 이상에서 메뉴가 가로 `flex-direction: row`로 전환 (`responsive.css`) |

### 2. `.hero` — 히어로 섹션

```css
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
```

| 선택 이유 |
|----------|
| 제목·부제·버튼이 **세로로 쌓이고** 가운데 정렬 |
| 1차원(column) 흐름이므로 Flexbox가 자연스러움 |

### 3. `.about__content` — About 레이아웃

```css
.about__content {
  display: flex;
  flex-direction: column;  /* 모바일: 세로 */
  gap: var(--space-5);
}
/* 768px+: flex-direction: row — 텍스트 | 이미지 */
```

| 선택 이유 |
|----------|
| **2개 블록**(텍스트, 이미지)의 가로/세로 전환 |
| 열 개수가 고정이 아니라 **방향만 바꾸면** 되므로 Flexbox로 충분 |
| `flex: 1` / `flex-shrink: 0`으로 비율 조절 |

### 4. `.skills` — 스킬 태그

```css
.skills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}
```

| 선택 이유 |
|----------|
| 태그 개수가 가변적, **줄바꿈**이 필요 |
| `flex-wrap: wrap`으로 공간이 부족하면 다음 줄로 자동 이동 |
| Grid도 가능하지만, 불규칙한 태그 길이에는 Flexbox wrap이 더 유연 |

### 5. `.project-card` — 카드 내부

```css
.project-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
```

| 선택 이유 |
|----------|
| 제목 → 설명 → 메타 → 링크가 **세로 스택** |
| 카드 **내부** 1차원 흐름 |

### 6. `.footer` — 푸터

```css
.footer {
  display: flex;
  flex-direction: column;  /* 모바일 */
  gap: var(--space-4);
}
/* 768px+: flex-direction: row; justify-content: space-between; */
```

| 선택 이유 |
|----------|
| 저작권·소셜 링크 2블록의 세로/가로 전환 (About와 같은 패턴) |

### 7. `.form-group` / `.contact-form` — 폼

```css
.contact-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
```

| 선택 이유 |
|----------|
| 라벨 → 입력 → 오류 메시지 **세로 순서** 고정 |
| 폼은 전형적인 1차원 column Flexbox 사용 사례 |

---

## Grid 적용 위치

### `.projects-grid` — 프로젝트 카드 그리드

```css
.projects-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
```

| 선택 이유 |
|----------|
| **여러 카드**를 행·열로 균일하게 배치 |
| `auto-fit` + `minmax(280px, 1fr)`: 뷰포트 너비에 따라 **열 수 자동 조절** |
| 375px → 1열, 768px → 2열, 1024px → 3열 (대략) |
| 카드 높이가 달라도 **열 정렬**이 Grid가 더 안정적 |

### `.projects-state` — 로딩/에러 상태

```css
.projects-state {
  grid-column: 1 / -1;  /* 그리드 전체 너비 차지 */
  display: flex;
  flex-direction: column;
  align-items: center;
}
```

로딩·에러 UI는 Grid **안**에 있지만 `grid-column: 1 / -1`로 전체 열을 span한다. 내부 정렬은 Flexbox(column, center).

---

## 왜 프로젝트 카드에 Grid, 나머지에 Flexbox?

| 상황 | 선택 | 이유 |
|------|------|------|
| 카드 **여러 개** 2D 배치 | **Grid** | 열 수·간격을 한 선언으로 제어 |
| 네비 **한 줄** 정렬 | **Flexbox** | 주축 정렬·양끝 배치 |
| 2블록 세로↔가로 전환 | **Flexbox** | `flex-direction`만 변경 |
| 카드 **내부** 세로 스택 | **Flexbox** | column + gap |
| 태그 **줄바꿈** | **Flexbox** | `flex-wrap: wrap` |

**Grid로 네비를 만들 수도 있지만**, 항목 4~5개의 1차원 정렬에는 Flexbox가 코드가 짧고 의도가 명확하다.

**Flexbox로 카드 그리드를 만들 수도 있지만** (`flex-wrap` + 고정 너비), 열 수 자동 조절·균일한 칸 배치는 Grid의 `minmax` + `auto-fit`이 더 선언적이다.

---

## 반응형과의 관계

```css
/* responsive.css — About만 Flexbox 방향 변경 */
@media (min-width: 768px) {
  .about__content { flex-direction: row; }
}
```

Grid의 `auto-fit`은 **미디어 쿼리 없이** 열 수가 바뀐다. Flexbox 레이아웃(About, Footer, Nav)은 **브레이크포인트**에서 `flex-direction`을 전환한다.

---

## 관련 파일

- `css/style.css` — Flexbox·Grid 선언
- `css/responsive.css` — Flexbox `flex-direction` 브레이크포인트 변경
