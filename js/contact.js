const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIELDS = ["name", "email", "message"];

let form = null;
let statusSlot = null;

export function init() {
  form = document.querySelector(".contact-form");

  if (!form) {
    return;
  }

  statusSlot = form.querySelector(".form-status");

  FIELDS.forEach((fieldName) => {
    const field = form.querySelector(`[name="${fieldName}"]`);

    field?.addEventListener("input", () => {
      const error = validateField(fieldName, field.value);
      renderFieldError(fieldName, error);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = {
      name: form.querySelector('[name="name"]')?.value ?? "",
      email: form.querySelector('[name="email"]')?.value ?? "",
      message: form.querySelector('[name="message"]')?.value ?? "",
    };

    const errors = validateAll(formData);
    const hasErrors = FIELDS.some((fieldName) => errors[fieldName]);

    if (hasErrors) {
      renderErrors(errors);
      statusSlot.textContent = "";
      statusSlot.classList.remove("form-status--success", "form-status--error");
      return;
    }

    onValidSubmit(formData);
  });
}

function validateField(name, value) {
  switch (name) {
    case "name":
      if (!value.trim()) {
        return "Please enter your name.";
      }
      return undefined;
    case "email":
      if (!EMAIL_REGEX.test(value.trim())) {
        return "Please enter a valid email address.";
      }
      return undefined;
    case "message":
      if (value.trim().length < 10) {
        return "Please enter a message of at least 10 characters.";
      }
      return undefined;
    default:
      return undefined;
  }
}

function validateAll(formData) {
  return {
    name: validateField("name", formData.name),
    email: validateField("email", formData.email),
    message: validateField("message", formData.message),
  };
}

function renderFieldError(fieldName, error) {
  const field = form.querySelector(`[name="${fieldName}"]`);
  const errorSlot = form.querySelector(`.error[data-for="${fieldName}"]`);

  if (!field || !errorSlot) {
    return;
  }

  errorSlot.textContent = error ?? "";
  field.classList.toggle("is-invalid", Boolean(error));
}

function renderErrors(errors) {
  FIELDS.forEach((fieldName) => {
    renderFieldError(fieldName, errors[fieldName]);
  });
}

function onValidSubmit() {
  renderSuccess();
}

function renderSuccess() {
  FIELDS.forEach((fieldName) => {
    renderFieldError(fieldName, undefined);
  });

  form.reset();
  statusSlot.textContent = "Thanks! Message sent.";
  statusSlot.classList.remove("form-status--error");
  statusSlot.classList.add("form-status--success");
}
