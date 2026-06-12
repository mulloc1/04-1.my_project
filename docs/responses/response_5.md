# 기준 5 · 폼 유효성 검사

> **평가 항목:** 항목 1 · 기능 동작  
> **질문:** 필수 입력값 누락, 이메일 형식 오류 시 즉각적인 피드백이 표시되는가?

---

## 결론

**예.** `js/contact.js`가 Contact 폼의 유효성을 검사한다. **입력 중(`input` 이벤트)** 과 **제출 시(`submit` 이벤트)** 두 시점 모두에서 피드백이 표시되며, 오류 메시지는 `role="alert"`·`aria-live="polite"`로 스크린 리더에도 전달된다.

---

## 검증 규칙

| 필드 | 규칙 | 오류 메시지 |
|------|------|------------|
| `name` | 공백만 있으면 실패 (`!value.trim()`) | "Please enter your name." |
| `email` | `EMAIL_REGEX` 불일치 | "Please enter a valid email address." |
| `message` | 10자 미만 (`value.trim().length < 10`) | "Please enter a message of at least 10 characters." |

이메일 정규식:

```js
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

기본적인 `local@domain.tld` 형식을 검증한다. HTML5 `type="email"` 기본 검증보다 **커스텀 메시지**를 일관되게 보여 줄 수 있다.

---

## 두 가지 검증 시점

### 1. 입력 중 — 즉각 피드백 (`input` 이벤트)

```js
FIELDS.forEach((fieldName) => {
  const field = form.querySelector(`[name="${fieldName}"]`);
  field?.addEventListener("input", () => {
    const error = validateField(fieldName, field.value);
    renderFieldError(fieldName, error);
  });
});
```

사용자가 타이핑할 때마다 해당 필드만 검증한다.

- 오류가 있으면 → `.error[data-for="필드명"]`에 메시지 표시 + 입력란에 `is-invalid` 클래스
- 오류가 없으면 → 메시지 지우기 + `is-invalid` 제거

**"즉각적인 피드백"** 요구사항은 이 `input` 리스너로 충족된다. 제출을 누르기 전에도 이메일 형식이 틀리면 바로 알 수 있다.

### 2. 제출 시 — 전체 검증 (`submit` 이벤트)

```js
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = { name, email, message };
  const errors = validateAll(formData);
  const hasErrors = FIELDS.some((fieldName) => errors[fieldName]);

  if (hasErrors) {
    renderErrors(errors);
    return; // 전송 중단
  }
  onValidSubmit(formData);
});
```

- `validateAll()`이 세 필드를 한꺼번에 검증한다.
- 하나라도 오류가 있으면 **모든 오류 필드**에 피드백을 표시하고 전송을 중단한다.
- 빈 필드를 건너뛰고 제출하는 것을 방지한다.

---

## 피드백 렌더링

```js
function renderFieldError(fieldName, error) {
  const field = form.querySelector(`[name="${fieldName}"]`);
  const errorSlot = form.querySelector(`.error[data-for="${fieldName}"]`);

  errorSlot.textContent = error ?? "";
  field.classList.toggle("is-invalid", Boolean(error));
}
```

### HTML 구조 (`index.html`)

```html
<div class="form-group">
  <label for="contact-name">Name</label>
  <input type="text" id="contact-name" name="name" required />
  <p class="error" data-for="name" role="alert" aria-live="polite"></p>
</div>
```

| 요소 | 역할 |
|------|------|
| `.error[data-for]` | 필드별 오류 메시지 슬롯 |
| `role="alert"` | 오류 발생 시 스크린 리더가 즉시 읽음 |
| `aria-live="polite"` | 메시지 변경 시 보조 기기에 알림 |
| `.is-invalid` | 입력란에 빨간 테두리 등 시각적 오류 표시 |

### `novalidate` 속성

```html
<form class="contact-form" novalidate>
```

브라우저 기본 HTML5 검증 팝업을 끄고, **JS 커스텀 검증·메시지**만 사용한다. 스타일과 메시지를 프로젝트 전체와 일관되게 유지할 수 있다.

---

## 성공 시 동작

검증을 모두 통과하면:

```js
function renderSuccess() {
  FIELDS.forEach((fieldName) => {
    renderFieldError(fieldName, undefined); // 오류 메시지 제거
  });
  form.reset();
  statusSlot.textContent = "Thanks! Message sent.";
  statusSlot.classList.add("form-status--success");
}
```

- 모든 오류 표시 제거
- 폼 초기화
- `.form-status`에 성공 메시지 표시

---

## 확인 시나리오

| 시나리오 | 기대 결과 |
|----------|----------|
| Name 비우고 탭 이동 | "Please enter your name." 즉시 표시 |
| Email에 `abc` 입력 | "Please enter a valid email address." 표시 |
| Message에 5자 입력 | "10 characters" 오류 표시 |
| Message 10자 이상 입력 | 해당 필드 오류 사라짐 |
| 오류 있는 채 Submit | 전송 안 됨, 모든 오류 필드에 메시지 |
| 모두 올바르게 입력 후 Submit | "Thanks! Message sent." 표시 |

---

## 관련 파일

- `js/contact.js` — 검증 로직, 이벤트, 피드백 렌더링
- `index.html` — Contact 폼 마크업, `data-for`, `role="alert"`
- `css/style.css` — `.form-group`, `.error`, `.is-invalid`, `.form-status`
