import { OBSERVER_THRESHOLD } from "./config.js";

export function init() {
  const targets = document.querySelectorAll("[data-animate]");

  if (targets.length === 0) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: OBSERVER_THRESHOLD }
  );

  targets.forEach((element) => {
    observer.observe(element);
  });
}
