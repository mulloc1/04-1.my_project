# 기준 8 · CSS 변수

> **평가 항목:** 항목 3 · HTML·CSS  
> **질문:** CSS 변수로 색상, 폰트 등을 정의했고, 변수로 관리하면 어떤 이점이 있는지 구체적으로 설명할 수 있는가?

---

## 결론

**예.** `css/style.css`의 `:root`에 **디자인 토큰**으로 색상·간격·타이포그래피·반경·그림자·전환·레이아웃 값을 CSS Custom Properties(`--*`)로 정의한다. 다크 테마는 `:root[data-theme="dark"]`에서 **같은 변수 이름**에 다른 값만 할당한다.

---

## 변수 정의 구조

```css
:root {
  /* Colors (light) */
  --color-bg: #ffffff;
  --color-surface: #f5f5f5;
  --color-text: #1a1a1a;
  --color-muted: #6b7280;
  --color-accent: #2563eb;
  --color-border: #e5e7eb;
  --color-error: #dc2626;
  --color-success: #16a34a;

  /* Spacing scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-8: 4rem;

  /* Typography */
  --font-family-base: "Inter", system-ui, sans-serif;
  --font-size-base: 1rem;
  --font-size-xl: 1.5rem;
  --font-size-3xl: 2.5rem;
  --line-height-base: 1.5;

  /* Radius, shadow, transition */
  --radius-md: 0.5rem;
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.1);
  --transition-base: 0.2s ease;

  /* Layout */
  --nav-height: 4rem;
}
```

### 다크 테마 오버라이드

```css
:root[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-text: #f1f5f9;
  --color-accent: #60a5fa;
  /* 색상 변수만 교체 */
}
```

간격·폰트·반경은 테마와 무관하므로 **색상 계열만** 덮어쓴다.

---

## 사용 예시

```css
body {
  font-family: var(--font-family-base);
  color: var(--color-text);
  background-color: var(--color-bg);
}

.btn--primary {
  background-color: var(--color-accent);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
}

section {
  padding: var(--space-7) var(--space-4);
}
```

하드코딩 `color: #2563eb` 대신 `var(--color-accent)`를 쓰면 **의도(강조색)** 가 코드에 드러난다.

---

## 변수로 관리하는 구체적 이점

### 1. 디자인 일관성

같은 `--color-accent`를 버튼·링크·포커스 테두리·호버 상태에 공유한다.

- 한 곳에서 `#2563eb` → `#1d4ed8`로 바꾸면 **모든 강조 요소**가 동시에 변경된다.
- 개발자마다 비슷하지만 다른 hex를 쓰는 **색상 불일치**를 방지한다.

### 2. 테마 전환 (이 프로젝트의 핵심 활용)

JS는 `document.documentElement.dataset.theme = "dark"` 한 줄만 실행한다.

- CSS가 `:root[data-theme="dark"]`에서 `--color-*` 값을 교체
- `var(--color-bg)`를 쓰는 **수백 규칙**이 자동 반영
- 개별 요소의 `style`이나 클래스를 일일이 바꿀 필요 없음

**변수 없이 테마를 구현한다면:** `.dark .btn`, `.dark .nav`, `.dark section` … 모든 선택자에 다크 색상을 중복 선언해야 한다.

### 3. 유지보수·스케일 시스템

간격을 `--space-1` ~ `--space-8` 스케일로 관리한다.

| 변수 | 값 | 의미 |
|------|-----|------|
| `--space-4` | 1rem | 기본 단위 |
| `--space-5` | 1.5rem | 중간 여백 |
| `--space-8` | 4rem | 섹션 상하 패딩 |

`padding: 1.5rem`보다 `padding: var(--space-5)`가 **"5단계 간격"** 이라는 의도가 명확하고, 전체 간격 비율을 한 곳에서 조정할 수 있다.

### 4. 가독성·의도 표현

```css
/* 의도 불명확 */
padding: 1.5rem;
font-size: 2.5rem;

/* 의도 명확 */
padding: var(--space-5);
font-size: var(--font-size-3xl);
```

새 팀원이 `--space-5`가 디자인 시스템의 표준 간격임을 바로 이해한다.

### 5. 런타임 변경 가능 (JS 연동)

CSS 변수는 JS에서도 읽고 쓸 수 있다 (`getComputedStyle`, `setProperty`). 이 프로젝트는 `data-theme` 속성으로 간접 제어하지만, 슬라이더로 `--font-size-base`를 조절하는 것도 같은 메커니즘이다.

### 6. 상속·캐스케이드

`:root`에 정의된 변수는 자식 요소에 **상속**된다. 컴포넌트 어디서든 `var(--color-text)`만 쓰면 된다.

---

## 변수 카테고리 정리

| 카테고리 | 변수 접두사 | 예시 | 역할 |
|----------|------------|------|------|
| 색상 | `--color-*` | `--color-accent` | 브랜드·상태 색 |
| 간격 | `--space-*` | `--space-5` | padding, gap, margin |
| 타이포 | `--font-*` | `--font-size-xl` | 글꼴·크기·행간 |
| 형태 | `--radius-*` | `--radius-md` | border-radius |
| 효과 | `--shadow-*` | `--shadow-card` | box-shadow |
| 동작 | `--transition-*` | `--transition-base` | transition duration |
| 레이아웃 | `--nav-height` 등 | `--card-lift` | 컴포넌트 치수 |

---

## 하드코딩과 비교

| 상황 | 하드코딩 | CSS 변수 |
|------|---------|----------|
| 강조색 변경 | 20곳 수정 | `:root` 1곳 |
| 다크 모드 | 모든 선택자 2벌 | 색상 변수 1벌 |
| 간격 통일 | `1.5rem` vs `24px` 혼재 | `--space-5` 일원화 |
| 의미 파악 | 숫자만 보임 | `--color-error` = 오류색 |

---

## 관련 파일

- `css/style.css` — `:root`, `:root[data-theme="dark"]` 정의 및 `var()` 사용
- `js/theme.js` — `data-theme` 속성으로 변수 값 전환 트리거
