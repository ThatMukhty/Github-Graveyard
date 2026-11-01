import { initializeWallet, restoreWalletIdentity } from "./wallet.js";
import { getCauseOfDeath } from "./causes.js";

const $ = s => document.querySelector(s);

const state = {
  user: null,
  repositories: [],
  filter: "all",
  search: "",
  memorial: null
};

let toastTimer;

function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}

function dateLabel(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown"
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
}

function daysSince(value) {
  if (!value) return null;
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000);
  return Number.isFinite(days) && days >= 0 ? days : null;
}

function classify(repo) {
  const days = daysSince(repo.last_activity_at || repo.updated_at);

  if (days === null) {
    return { key: "unknown", label: "RECORDS INCOMPLETE", days: null };
  }

  if (days < 30) return { key: "alive", label: "STILL ALIVE", days };
  if (days < 60) return { key: "warning", label: "ON LIFE SUPPORT", days };
  if (days < 90) return { key: "warning", label: "CRITICALLY ABANDONED", days };
  if (days < 120) return { key: "dead", label: "PRESUMED DEAD", days };

  return { key: "dead", label: "LONG DEAD", days };
}

function esc(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function renderStats() {
  const statuses = state.repositories.map(classify);
  const total = statuses.length;
  const dead = statuses.filter(s => s.key === "dead").length;
  const alive = statuses.filter(s => s.key === "alive").length;

  $("#statTotal").textContent = total;
  $("#statDead").textContent = dead;
  $("#statAlive").textContent = alive;
  $("#statMortality").textContent = total
    ? `${Math.round(dead / total * 100)}%`
    : "0%";

  $("#scanStatus").textContent = `${total} RECORDS SCANNED`;
}

function renderRepositories() {
  const query = state.search.trim().toLowerCase();

  const list = state.repositories.filter(repo => {
    const status = classify(repo).key;

    const matchesFilter =
      state.filter === "all" ||
      (state.filter === "alive" && status === "alive") ||
      (state.filter === "warning" && status === "warning") ||
      (state.filter === "dead" && status === "dead");

    const matchesSearch = !query ||
      `${repo.name} ${repo.description || ""} ${repo.language || ""}`
        .toLowerCase()
        .includes(query);

    return matchesFilter && matchesSearch;
  });

  $("#repoGrid").innerHTML = list.map((repo, index) => {
    const status = classify(repo);

    return `
      <article class="repo-card" style="animation-delay:${Math.min(index * 30, 300)}ms">
        <div class="repo-top">
          <strong class="repo-name">${esc(repo.name)}</strong>
          <span class="repo-status ${status.key}">${esc(status.label)}</span>
        </div>

        <p class="repo-description">
          ${esc(repo.description || "No description left behind.")}
        </p>

        <div class="repo-meta">
          <span>${status.days === null ? "AGE UNKNOWN" : `${status.days} DAYS SINCE PUSH`}</span>
          <span>${esc(repo.language || "UNKNOWN LANGUAGE")}</span>
          <span>★ ${Number(repo.stargazers_count || 0)}</span>
        </div>

        <div class="repo-card-actions">
          <button data-memorial="${repo.id}">VIEW MEMORIAL †</button>
          <a href="${esc(repo.html_url)}" target="_blank" rel="noopener noreferrer">OPEN REPO ↗</a>
        </div>
      </article>
    `;
  }).join("");

  $("#emptyState").classList.toggle("hidden", list.length !== 0);
  $("#repoGrid").classList.toggle("hidden", list.length === 0);

  $("#repoGrid")
    .querySelectorAll("[data-memorial]")
    .forEach(button => {
      button.addEventListener("click", () => {
        openMemorial(button.dataset.memorial);
      });
    });
}

function openMemorial(id) {
  const repo = state.repositories.find(
    item => String(item.id) === String(id)
  );

  if (!repo) return;

  state.memorial = repo;

  const status = classify(repo);

  $("#memorialTitle").textContent = repo.name;
  $("#memorialDescription").textContent =
    repo.description || "No description was recorded for this repository.";

  $("#memorialLastActivity").textContent =
    dateLabel(repo.last_activity_at || repo.updated_at);

  $("#memorialCause").textContent =
    status.key === "dead"
      ? getCauseOfDeath(repo.id)
      : status.label;

  $("#memorialRepoLink").href = repo.html_url;
  $("#memorialModal").classList.remove("hidden");
}

function closeMemorial() {
  $("#memorialModal").classList.add("hidden");
  state.memorial = null;
}

function showUser(user) {
  state.user = user;

  $("#welcomeState").classList.add("hidden");
  $("#dashboard").classList.remove("hidden");

  $("#connectGithub").classList.add("hidden");
  $("#heroConnect").classList.add("hidden");
  $("#welcomeConnect").classList.add("hidden");

  $("#logoutGithub").classList.remove("hidden");
  $("#userBlock").classList.remove("hidden");

  $("#userAvatar").src = user.avatar_url || "";
  $("#userLogin").textContent = user.login;
}

function loggedOut() {
  state.user = null;
  state.repositories = [];

  $("#dashboard").classList.add("hidden");
  $("#welcomeState").classList.remove("hidden");

  $("#connectGithub").classList.remove("hidden");
  $("#heroConnect").classList.remove("hidden");
  $("#welcomeConnect").classList.remove("hidden");

  $("#logoutGithub").classList.add("hidden");
  $("#userBlock").classList.add("hidden");
}

async function loadRepositories() {
  $("#scanStatus").textContent = "SCANNING...";
  $("#repoGrid").innerHTML = "";

  try {
    const response = await fetch("/api/github?action=repositories", {
      credentials: "same-origin",
      cache: "no-store"
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not load repositories.");
    }

    state.repositories = data.repositories || [];

    renderStats();
    renderRepositories();

    await restoreWalletIdentity();
  } catch (error) {
    toast(error.message || "Repository scan failed.");
    $("#scanStatus").textContent = "SCAN FAILED";
  }
}

function login() {
  location.href = "/api/github?action=login";
}

async function init() {
  ["#connectGithub", "#heroConnect", "#welcomeConnect"].forEach(selector => {
    $(selector).addEventListener("click", login);
  });

  $("#logoutGithub").addEventListener("click", () => {
    location.href = "/api/github?action=logout";
  });

  $("#rescanButton").addEventListener("click", loadRepositories);

  $("#repoSearch").addEventListener("input", event => {
    state.search = event.target.value;
    renderRepositories();
  });

  $("#filterBar").addEventListener("click", event => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;

    state.filter = button.dataset.filter;

    $("#filterBar")
      .querySelectorAll(".filter")
      .forEach(item => {
        item.classList.toggle("active", item === button);
      });

    renderRepositories();
  });

  $("#closeMemorial").addEventListener("click", closeMemorial);

  $("#memorialModal").addEventListener("click", event => {
    if (event.target.dataset.close) closeMemorial();
  });

  $("#shareMemorial").addEventListener("click", () => {
    if (!state.memorial) return;

    const repo = state.memorial;
    const text = `A digital tombstone for ${repo.name} in the GitHub Graveyard. ${repo.html_url}`;

    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  });

  initializeWallet();

  const params = new URLSearchParams(location.search);

  if (params.has("github_error")) {
    toast(`GitHub login issue: ${params.get("github_error").replaceAll("_", " ")}`);
  }

  try {
    const response = await fetch("/api/github?action=me", {
      credentials: "same-origin",
      cache: "no-store"
    });

    if (!response.ok) {
      loggedOut();
      return;
    }

    const data = await response.json();

    showUser(data.user);
    await loadRepositories();
  } catch {
    loggedOut();
  }
}

init();