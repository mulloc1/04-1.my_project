export function init() {
  const toggle = document.querySelector(".theme-toggle");
  const icon = document.querySelector(".theme-toggle__icon");
  const label = document.querySelector(".theme-toggle__label");

  if (!toggle || !icon || !label) {
    return;
  }

  let currentTheme = "light";
  const storedTheme = localStorage.getItem("theme");

  if (storedTheme === "light" || storedTheme === "dark") {
    currentTheme = storedTheme;
    document.documentElement.dataset.theme = currentTheme;
  } else {
    document.documentElement.dataset.theme = "light";
  }

  const renderTheme = () => {
    const isDark = currentTheme === "dark";
    toggle.setAttribute("aria-pressed", String(isDark));
    icon.textContent = isDark ? "☀" : "☾";
    label.textContent = isDark ? "Light mode" : "Dark mode";
  };

  renderTheme();

  toggle.addEventListener("click", () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = currentTheme;
    localStorage.setItem("theme", currentTheme);
    renderTheme();
  });
}
