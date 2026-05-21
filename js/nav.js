import { NAV_BG_THRESHOLD, SCROLL_TOP_THRESHOLD } from "./config.js";

export function init() {
  const nav = document.querySelector(".nav");
  const hamburger = document.querySelector(".nav__hamburger");
  const menu = document.querySelector(".nav__menu");
  const toTop = document.querySelector(".to-top");
  const anchorLinks = document.querySelectorAll('nav a[href^="#"]');

  if (!nav || !hamburger || !menu) {
    return;
  }

  let isMenuOpen = false;

  const renderMenu = () => {
    menu.classList.toggle("nav__menu--open", isMenuOpen);
    hamburger.setAttribute("aria-expanded", String(isMenuOpen));
  };

  const closeMenu = () => {
    isMenuOpen = false;
    renderMenu();
  };

  hamburger.addEventListener("click", () => {
    isMenuOpen = !isMenuOpen;
    renderMenu();
  });

  anchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") {
        return;
      }

      const target = document.querySelector(href);

      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      closeMenu();
    });
  });

  const handleScroll = () => {
    nav.classList.toggle("nav--scrolled", window.scrollY > NAV_BG_THRESHOLD);
    toTop?.classList.toggle("to-top--visible", window.scrollY > SCROLL_TOP_THRESHOLD);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  toTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
