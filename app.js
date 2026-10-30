(() => {
  "use strict";

  const API = "/api/github";

  const state = {
    user: null,
    repositories: [],
    filter: "all",
    loading: false
  };

  const elements = {
    connectGitHub: document.getElementById("connectGitHub"),
    heroConnect: document.getElementById("heroConnect"),
    connectWallet: document.getElementById("connectWallet"),
    totalRepos: document.getElementById("totalRepos"),
    deadRepos: document.getElementById("deadRepos"),
    aliveRepos: document.getElementById("aliveRepos"),
    mortalityScore: document.getElementById("mortalityScore"),
    scoreFill: document.getElementById("scoreFill"),
    scoreDescription: document.getElementById("scoreDescription"),
    repositoryList: document.getElementById("repositoryList"),
    toastContainer: document.getElementById("toastContainer")
  };

  // ----------------------------------
  // NOTIFICATIONS
  // ----------------------------------

  function notify(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 4500);
  }

  // ----------------------------------
  // SAFE HTML
  // ----------------------------------

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);
  }

  // ----------------------------------
  // GITHUB CONNECTION
  // ----------------------------------

  function connectGitHub() {
    if (state.loading) return;

    window.location.href = `${API}?action=login`;
  }

  // ----------------------------------
  // LOAD AUTHENTICATED USER
  // ----------------------------------

  async function loadUser() {
    const response = await fetch(`${API}?action=me`, {
      method: "GET",
      credentials: "same-origin",
      headers: {
        "Accept": "application/json"
      }
    });

    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Unable to verify your GitHub session.");
    }

    const data = await response.json();
    return data.user || null;
  }

  // ----------------------------------
  // LOAD REPOSITORIES
  // ----------------------------------

  async function loadRepositories() {
    const response = await fetch(`${API}?action=repositories`, {
      method: "GET",
      credentials: "same-origin",
      headers: {
        "Accept": "application/json"
      }
    });

    if (response.status === 401) {
      throw new Error("Your GitHub session has expired. Connect again.");
    }

    if (!response.ok) {
      throw new Error("GitHub repositories could not be loaded.");
    }

    const data = await response.json();

    if (!Array.isArray(data.repositories)) {
      throw new Error("Unexpected repository response.");
    }

    return data.repositories;
  }

  // ----------------------------------
  // REPOSITORY ACTIVITY
  // ----------------------------------

  function getInactiveDays(repository) {
    const activityDate = new Date(repository.last_activity_at);

    if (Number.isNaN(activityDate.getTime())) {
      return null;
    }

    return Math.max(
      0,
      Math.floor((Date.now() - activityDate.getTime()) / 86400000)
    );
  }

  function prepareRepositories(repositories) {
    return repositories.map(repository => {
      const daysInactive = getInactiveDays(repository);

      const condition = daysInactive === null
        ? {
            status: "unknown",
            label: "ACTIVITY UNKNOWN",
            cause: "The records are incomplete. No cause of death can be established."
          }
        : window.GraveyardCauses.getCause(daysInactive);

      return {
        ...repository,
        daysInactive,
        condition
      };
    });
  }

  // ----------------------------------
  // MORTALITY SCORE
  // ----------------------------------

  function calculateMortalityScore(repositories) {
    if (!repositories.length) return 0;

    const known = repositories.filter(
      repo => repo.condition.status !== "unknown"
    );

    if (!known.length) return 0;

    const dead = known.filter(
      repo => repo.condition.status === "dead"
    );

    const deadPercentage = dead.length / known.length;

    const severity = dead.length
      ? dead.reduce((total, repo) => {
          const days = repo.daysInactive || 0;

          return total + Math.min(days / 180, 1);
        }, 0) / dead.length
      : 0;

    const score = (
      deadPercentage * 70 +
      severity * 30
    );

    return Math.round(Math.min(100, Math.max(0, score)));
  }

  function updateStatistics() {
    const repositories = state.repositories;

    const known = repositories.filter(
      repo => repo.condition.status !== "unknown"
    );

    const dead = known.filter(
      repo => repo.condition.status === "dead"
    );

    const alive = known.filter(
      repo => repo.condition.status === "alive"
    );

    const score = calculateMortalityScore(repositories);

    elements.totalRepos.textContent = repositories.length;
    elements.deadRepos.textContent = dead.length;
    elements.aliveRepos.textContent = alive.length;
    elements.mortalityScore.textContent = score;

    elements.scoreFill.style.width = `${score}%`;

    if (!repositories.length) {
      elements.scoreDescription.textContent =
        "No repositories found. Your judgement awaits.";
    } else if (score >= 70) {
      elements.scoreDescription.textContent =
        "Your graveyard is enormous. The evidence is difficult to ignore.";
    } else if (score >= 40) {
      elements.scoreDescription.textContent =
        "A considerable amount of your code has been left behind.";
    } else if (score > 0) {
      elements.scoreDescription.textContent =
        "Some projects have been forgotten. There is still time to revive them.";
    } else {
      elements.scoreDescription.textContent =
        "Your repositories are looking alive. Keep shipping.";
    }
  }

  // ----------------------------------
  // REPOSITORY CARDS
  // ----------------------------------

  function renderRepositories() {
    const filtered = state.repositories.filter(repository => {
      if (state.filter === "all") return true;

      if (state.filter === "dead") {
        return repository.condition.status === "dead";
      }

      if (state.filter === "alive") {
        return repository.condition.status === "alive";
      }

      return true;
    });

    const reportTag = document.querySelector(
      "#repositories .report-tag"
    );

    if (reportTag) {
      reportTag.textContent = `${filtered.length} RECORDS`;
    }

    if (!filtered.length) {
      elements.repositoryList.innerHTML = `
        <div class="empty-state">
          <div class="empty-skull">☠</div>
          <h3>NO RECORDS FOUND</h3>
          <p>There are no repositories in this category.</p>
        </div>
      `;
      return;
    }

    elements.repositoryList.innerHTML = filtered.map(repository => {
      const isDead = repository.condition.status === "dead";
      const isUnknown = repository.condition.status === "unknown";

      const statusClass = isDead
        ? "dead"
        : isUnknown ? "unknown" : "alive";

      const lastActivity = repository.last_activity_at
        ? new Date(repository.last_activity_at).toLocaleDateString(
            undefined,
            { year: "numeric", month: "short", day: "numeric" }
          )
        : "Unknown";

      const activityAge = repository.daysInactive === null
        ? "Unknown"
        : `${repository.daysInactive} days`;

      const url = /^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(
        repository.html_url || ""
      ) ? repository.html_url : "#";

      return `
        <article class="repository-card ${statusClass}">
          <div class="repository-card-top">
            <div>
              <span class="repository-status ${statusClass}">
                ${escapeHTML(repository.condition.label)}
              </span>
              <h3>${escapeHTML(repository.name)}</h3>
              <p class="repository-description">
                ${escapeHTML(repository.description || "No description provided.")}
              </p>
            </div>

            <span class="repository-skull">
              ${isDead ? "☠" : isUnknown ? "?" : "✦"}
            </span>
          </div>

          <div class="repository-meta">
            <span>LAST ACTIVITY: ${escapeHTML(lastActivity)}</span>
            <span>INACTIVE: ${escapeHTML(activityAge)}</span>
          </div>

          <div class="repository-cause">
            <span>CAUSE OF DEATH</span>
            <p>${escapeHTML(repository.condition.cause)}</p>
          </div>

          <a
            class="repository-link"
            href="${escapeHTML(url)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            VIEW ON GITHUB ↗
          </a>
        </article>
      `;
    }).join("");
  }

  // ----------------------------------
  // SCAN
  // ----------------------------------

  async function scanGraveyard() {
    if (state.loading) return;

    state.loading = true;

    elements.connectGitHub.disabled = true;
    elements.heroConnect.disabled = true;

    elements.connectGitHub.textContent = "SCANNING...";
    elements.heroConnect.textContent = "EXAMINING THE GRAVEYARD...";

    try {
      const repositories = await loadRepositories();

      state.repositories = prepareRepositories(repositories);

      updateStatistics();
      renderRepositories();

      notify(`Autopsy complete. ${repositories.length} repositories examined.`);
    } catch (error) {
      notify(error.message || "Something went wrong.");
    } finally {
      state.loading = false;

      elements.connectGitHub.disabled = false;
      elements.heroConnect.disabled = false;

      elements.connectGitHub.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.1c-3.1.67-3.75-1.31-3.75-1.31-.5-1.28-1.24-1.62-1.24-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.71-1.49-2.47-.28-5.06-1.24-5.06-5.52 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.95 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.67.11 2.95.72.78 1.15 1.77 1.15 2.99 0 4.29-2.6 5.23-5.08 5.51.4.35.76 1.03.76 2.08v3.09c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z"/>
        </svg>
        <span>Connect GitHub</span>
      `;

      elements.heroConnect.innerHTML = `
        <span>INSPECT MY GRAVEYARD</span>
        <span class="button-arrow">↗</span>
      `;
    }
  }

  // ----------------------------------
  // FILTERS
  // ----------------------------------

  function setupFilters() {
    document.querySelectorAll(".filter-button").forEach(button => {
      button.addEventListener("click", () => {
        document.querySelectorAll(".filter-button").forEach(item => {
          item.classList.remove("active");
        });

        button.classList.add("active");
        state.filter = button.dataset.filter || "all";

        renderRepositories();
      });
    });
  }

  // ----------------------------------
  // WALLET PLACEHOLDER
  // ----------------------------------

  function connectWallet() {
    notify(
      "Ethereum wallet integration is being prepared. No transaction has been requested."
    );
  }

  // ----------------------------------
  // INITIALIZATION
  // ----------------------------------

  async function initialize() {
    elements.connectGitHub.addEventListener(
      "click",
      connectGitHub
    );

    elements.heroConnect.addEventListener(
      "click",
      connectGitHub
    );

    elements.connectWallet.addEventListener(
      "click",
      connectWallet
    );

    setupFilters();

    try {
      state.user = await loadUser();

      if (state.user) {
        const name = state.user.login || state.user.name || "Developer";

        notify(`Welcome back, ${name}. Preparing your autopsy...`);

        await scanGraveyard();
      }
    } catch (error) {
      notify(error.message || "Could not restore your GitHub session.");
    }
  }

  document.addEventListener("DOMContentLoaded", initialize);
})();