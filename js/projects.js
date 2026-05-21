import { GITHUB_USERNAME, PROJECTS_ENDPOINT } from "./config.js";

let state = {
  status: "loading",
  repos: [],
};

const getGrid = () => document.querySelector(".projects-grid");

export function init() {
  loadProjects();
}

async function loadProjects() {
  const grid = getGrid();

  if (!grid) {
    return;
  }

  state = { status: "loading", repos: [] };
  renderLoading();

  if (!GITHUB_USERNAME) {
    state.status = "empty";
    renderEmpty();
    return;
  }

  try {
    const response = await fetch(PROJECTS_ENDPOINT);

    if (!response.ok) {
      state.status = "error";
      renderError();
      return;
    }

    const repos = await response.json();
    const visible = repos.filter((repo) => !repo.fork && !repo.archived);

    if (visible.length === 0) {
      state.status = "empty";
      state.repos = [];
      renderEmpty();
      return;
    }

    state.status = "success";
    state.repos = visible;
    renderSuccess(visible);
  } catch {
    state.status = "error";
    renderError();
  }
}

function renderLoading() {
  const grid = getGrid();
  grid.innerHTML = `
    <div class="projects-state projects-state--loading">
      <div class="spinner" aria-hidden="true"></div>
      <p class="projects-state__message">Loading projects...</p>
    </div>
  `;
}

function renderSuccess(repos) {
  const grid = getGrid();
  grid.replaceChildren(...repos.map(toCard));
}

function renderError() {
  const grid = getGrid();
  grid.innerHTML = `
    <div class="projects-state projects-state--error">
      <p class="projects-state__message">Failed to load projects.</p>
      <button class="btn btn--primary retry" type="button">Retry</button>
    </div>
  `;
  grid.querySelector(".retry")?.addEventListener("click", loadProjects);
}

function renderEmpty() {
  const grid = getGrid();
  grid.innerHTML = `
    <p class="projects-state projects-state--empty">No public repositories yet.</p>
  `;
}

function toCard({ name, description, language, stargazers_count, html_url }) {
  const card = document.createElement("article");
  card.className = "project-card";
  card.innerHTML = `
    <h3 class="project-card__title"></h3>
    <p class="project-card__description"></p>
    <div class="project-card__meta">
      <span class="project-card__language"></span>
      <span class="project-card__stars"></span>
    </div>
    <a class="project-card__link" target="_blank" rel="noopener noreferrer">View on GitHub</a>
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
