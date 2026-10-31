(() => {
  "use strict";

  const API = "/api/github";

  const state = {
    user: null,
    repositories: [],
    filter: "all",
    loading: false
  };

  const $ = (id) => document.getElementById(id);

  const elements = {
    connectGitHub: $("connectGitHub"),
    heroConnect: $("heroConnect"),
    connectWallet: $("connectWallet"),
    totalRepos: $("totalRepos"),
    deadRepos: $("deadRepos"),
    aliveRepos: $("aliveRepos"),
    mortalityScore: $("mortalityScore"),
    scoreFill: $("scoreFill"),
    scoreDescription: $("scoreDescription"),
    repositoryList: $("repositoryList"),
    toastContainer: $("toastContainer")
  };

  // --------------------------------------------------
  // CARD STYLES
  // --------------------------------------------------

  function addMemorialStyles() {
    if (document.getElementById("memorial-card-styles")) return;

    const style = document.createElement("style");
    style.id = "memorial-card-styles";

    style.textContent = `
      .repository-card {
        position: relative;
        overflow: hidden;
        background: #101010;
        border: 1px solid #303030;
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 16px;
      }

      .repository-card::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: var(--grave-accent, #a52b2b);
      }

      .repository-card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 18px;
      }

      .repository-status {
        display: inline-flex;
        align-items: center;
        padding: 7px 11px;
        border-radius: 6px;
        background: #292929;
        color: #e5e5e5;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 1.2px;
      }

      .repository-status.dead {
        color: #ff7777;
        background: #351717;
      }

      .repository-status.alive {
        color: #dedede;
        background: #252525;
      }

      .repository-card h3 {
        color: #fff;
        font-size: 20px;
        margin: 0 0 8px;
        overflow-wrap: anywhere;
      }

      .repository-card p {
        color: #aaa;
        font-size: 13px;
        line-height: 1.6;
      }

      .repository-meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin: 20px 0;
      }

      .memorial-detail {
        background: #191919;
        border: 1px solid #292929;
        border-radius: 9px;
        padding: 12px;
        min-width: 0;
      }

      .memorial-detail small {
        display: block;
        color: #858585;
        font-size: 9px;
        letter-spacing: 1px;
        margin-bottom: 7px;
      }

      .memorial-detail strong {
        display: block;
        color: #eee;
        font-size: 12px;
        overflow-wrap: anywhere;
      }

      .repository-cause {
        padding: 13px;
        margin: 16px 0;
        background: #211313;
        border-left: 3px solid #a52b2b;
        border-radius: 5px;
      }

      .repository-cause small {
        color: #c66b6b;
        display: block;
        font-size: 9px;
        letter-spacing: 1px;
        margin-bottom: 7px;
      }

      .repository-cause p {
        color: #eee;
        margin: 0;
        font-size: 13px;
      }

      .repository-link {
        color: #ff7777;
        text-decoration: none;
        font-size: 12px;
        font-weight: 700;
      }

      .memorial-actions {
        display: flex;
        gap: 9px;
        flex-wrap: wrap;
        margin-top: 18px;
      }

      .memorial-actions button {
        flex: 1;
        min-width: 120px;
        padding: 11px;
        border: 1px solid #444;
        border-radius: 7px;
        background: #242424;
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
      }

      .memorial-actions button:hover {
        background: #383838;
      }

      .memorial-actions .share-x {
        background: #8e2020;
        border-color: #8e2020;
      }

      .memorial-actions .share-x:hover {
        background: #b52b2b;
      }

      .memorial-card-image {
        width: 100%;
        box-sizing: border-box;
        padding: 26px;
        background: #090909;
        color: white;
        border: 1px solid #5a2424;
        border-radius: 12px;
        font-family: Arial, sans-serif;
      }

      .memorial-card-image .image-brand {
        color: #d65b5b;
        font-size: 10px;
        letter-spacing: 3px;
        font-weight: bold;
      }

      .memorial-card-image .image-stage {
        display: inline-block;
        margin: 24px 0 14px;
        padding: 9px 12px;
        background: #351515;
        color: #ff8585;
        font-size: 11px;
        font-weight: bold;
        letter-spacing: 1.5px;
      }

      .memorial-card-image h2 {
        color: #fff;
        font-size: 25px;
        overflow-wrap: anywhere;
        margin: 0 0 10px;
      }

      .memorial-card-image .image-description {
        color: #aaa;
        font-size: 12px;
        line-height: 1.5;
      }

      .memorial-card-image .image-footer {
        border-top: 1px solid #333;
        margin-top: 24px;
        padding-top: 14px;
        color: #888;
        font-size: 10px;
      }

      @media (max-width: 420px) {
        .repository-meta {
          grid-template-columns: 1fr 1fr;
        }

        .repository-card {
          padding: 15px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // --------------------------------------------------
  // UTILITIES
  // --------------------------------------------------

  function notify(message, type = "info") {
    if (!elements.toastContainer) {
      console.log(message);
      return;
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => toast.remove(), 4000);
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }

  function formatDate(value) {
    if (!value) return "Unknown";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function addDays(dateValue, days) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return null;

    date.setDate(date.getDate() + days);
    return date;
  }

  function formatDateObject(date) {
    if (!date) return "Unknown";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  // --------------------------------------------------
  // REPOSITORY STATUS
  // --------------------------------------------------

  function getInactiveDays(repository) {
    if (!repository.last_activity_at) return null;

    const lastActivity = new Date(repository.last_activity_at);

    if (Number.isNaN(lastActivity.getTime())) return null;

    return Math.max(
      0,
      Math.floor((Date.now() - lastActivity.getTime()) / 86400000)
    );
  }

  function getStage(days) {
    if (days === null) {
      return {
        label: "RECORDS INCOMPLETE",
        status: "unknown",
        threshold: null
      };
    }

    if (days < 30) {
      return {
        label: "STILL ALIVE",
        status: "alive",
        threshold: 0
      };
    }

    if (days < 60) {
      return {
        label: "ON LIFE SUPPORT",
        status: "warning",
        threshold: 30
      };
    }

    if (days < 90) {
      return {
        label: "CRITICALLY ABANDONED",
        status: "warning",
        threshold: 60
      };
    }

    if (days < 120) {
      return {
        label: "PRESUMED DEAD",
        status: "dead",
        threshold: 90
      };
    }

    return {
      label: "LONG DEAD",
      status: "dead",
      threshold: 120
    };
  }

  function prepareRepositories(repositories) {
    return repositories.map((repository) => {
      const daysInactive = getInactiveDays(repository);
      const stage = getStage(daysInactive);

      let condition = {};

      if (daysInactive !== null && window.GraveyardCauses) {
        condition = window.GraveyardCauses.getCause(daysInactive) || {};
      }

      return {
        ...repository,
        daysInactive,
        stage,
        condition
      };
    });
  }

  // --------------------------------------------------
  // STATISTICS
  // --------------------------------------------------

  function updateStatistics() {
    const total = state.repositories.length;

    const dead = state.repositories.filter(
      (repo) => repo.stage.status === "dead"
    ).length;

    const alive = state.repositories.filter(
      (repo) => repo.stage.status === "alive"
    ).length;

    const mortality = total ? Math.round((dead / total) * 100) : 0;

    if (elements.totalRepos) elements.totalRepos.textContent = total;
    if (elements.deadRepos) elements.deadRepos.textContent = dead;
    if (elements.aliveRepos) elements.aliveRepos.textContent = alive;

    if (elements.mortalityScore) {
      elements.mortalityScore.textContent = `${mortality}%`;
    }

    if (elements.scoreFill) {
      elements.scoreFill.style.width = `${mortality}%`;
    }

    if (elements.scoreDescription) {
      elements.scoreDescription.textContent =
        total === 0
          ? "Scan your GitHub repositories to calculate your score."
          : `${dead} of ${total} repositories are classified as dead based on inactivity.`;
    }
  }

  // --------------------------------------------------
  // MEMORIAL CARD
  // --------------------------------------------------

  function createRepositoryCard(repository) {
    const isDead = repository.stage.status === "dead";
    const isAlive = repository.stage.status === "alive";

    const lastActivity = formatDate(repository.last_activity_at);

    // A repository is considered dead at 90 days of inactivity.
    // The date is an estimate, not a confirmed deletion or abandonment date.
    const estimatedDeathDate = isDead
      ? addDays(repository.last_activity_at, 90)
      : null;

    const stageEnteredDate =
      repository.stage.threshold !== null
        ? addDays(repository.last_activity_at, repository.stage.threshold)
        : null;

    const cause = isDead
      ? (
          repository.condition?.cause ||
          repository.condition?.label ||
          "No specific cause recorded."
        )
      : "";

    const accent = isDead ? "#a52b2b" : "#777777";

    const description =
      repository.description || "No description provided.";

    const language = repository.language || "Not specified";

    const stars = Number(repository.stargazers_count || 0);
    const forks = Number(repository.forks_count || 0);

    const card = document.createElement("article");
    card.className = "repository-card";
    card.style.setProperty("--grave-accent", accent);

    card.innerHTML = `
      <div class="repository-card-top">
        <span class="repository-status ${isDead ? "dead" : isAlive ? "alive" : ""}">
          ${escapeHTML(repository.stage.label)}
        </span>

        <span style="color:#777;font-size:11px;">
          ${repository.daysInactive === null
            ? "Activity unknown"
            : `${repository.daysInactive} days inactive`}
        </span>
      </div>

      <h3>${escapeHTML(repository.name)}</h3>

      <p>${escapeHTML(description)}</p>

      <div class="repository-meta">
        <div class="memorial-detail">
          <small>LAST ACTIVITY</small>
          <strong>${escapeHTML(lastActivity)}</strong>
        </div>

        <div class="memorial-detail">
          <small>${isDead ? "EST. DATE OF DEATH" : "STAGE ENTERED"}</small>
          <strong>${escapeHTML(
            isDead
              ? formatDateObject(estimatedDeathDate)
              : stageEnteredDate
                ? formatDateObject(stageEnteredDate)
                : isAlive
                  ? "Currently active"
                  : "Unknown"
          )}</strong>
        </div>

        <div class="memorial-detail">
          <small>LANGUAGE</small>
          <strong>${escapeHTML(language)}</strong>
        </div>

        <div class="memorial-detail">
          <small>STARS / FORKS</small>
          <strong>${stars} / ${forks}</strong>
        </div>
      </div>

      ${
        isDead
          ? `
            <div class="repository-cause">
              <small>CAUSE OF DEATH</small>
              <p>${escapeHTML(cause)}</p>
            </div>
          `
          : ""
      }

      <a
        class="repository-link"
        href="${escapeHTML(repository.html_url || "#")}"
        target="_blank"
        rel="noopener noreferrer"
      >
        VIEW ON GITHUB ↗
      </a>

      <div class="memorial-actions">
        <button type="button" data-action="download">
          DOWNLOAD CARD
        </button>

        <button type="button" class="share-x" data-action="share">
          SHARE ON X
        </button>
      </div>

      <div class="memorial-card-image" data-memorial-image style="display:none;">
        <div class="image-brand">THE GITHUB GRAVEYARD</div>

        <div class="image-stage">
          ${escapeHTML(repository.stage.label)}
        </div>

        <h2>${escapeHTML(repository.name)}</h2>

        <p class="image-description">
          ${escapeHTML(description)}
        </p>

        <div class="repository-meta">
          <div class="memorial-detail">
            <small>LAST ACTIVITY</small>
            <strong>${escapeHTML(lastActivity)}</strong>
          </div>

          <div class="memorial-detail">
            <small>${isDead ? "EST. DATE OF DEATH" : "STAGE ENTERED"}</small>
            <strong>${escapeHTML(
              isDead
                ? formatDateObject(estimatedDeathDate)
                : stageEnteredDate
                  ? formatDateObject(stageEnteredDate)
                  : isAlive
                    ? "Currently active"
                    : "Unknown"
            )}</strong>
          </div>
        </div>

        ${
          isDead
            ? `
              <div class="repository-cause">
                <small>CAUSE OF DEATH</small>
                <p>${escapeHTML(cause)}</p>
              </div>
            `
            : ""
        }

        <div class="image-footer">
          github.com/${escapeHTML(state.user?.login || "")}/${escapeHTML(repository.name)}
          <br><br>
          A repository remembered by GitHub Graveyard.
        </div>
      </div>
    `;

    card.dataset.repositoryUrl = repository.html_url || "";
    card.dataset.repositoryName = repository.name;

    return card;
  }

  // --------------------------------------------------
  // DOWNLOAD IMAGE
  // --------------------------------------------------

  function loadHtml2Canvas() {
    if (window.html2canvas) return Promise.resolve();

    if (window.__graveyardCanvasLoading) {
      return window.__graveyardCanvasLoading;
    }

    window.__graveyardCanvasLoading = new Promise((resolve, reject) => {
      const script = document.createElement("script");

      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";

      script.onload = resolve;
      script.onerror = () => reject(
        new Error("Could not load the image generator.")
      );

      document.head.appendChild(script);
    });

    return window.__graveyardCanvasLoading;
  }

  async function downloadMemorialCard(card) {
    const image = card.querySelector("[data-memorial-image]");

    if (!image) return null;

    await loadHtml2Canvas();

    image.style.display = "block";

    try {
      const canvas = await window.html2canvas(image, {
        backgroundColor: "#090909",
        scale: 2,
        useCORS: true
      });

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      if (!blob) throw new Error("Could not create the image.");

      const fileName =
        (card.dataset.repositoryName || "repository")
          .replace(/[^a-z0-9-_]/gi, "-") + "-graveyard.png";

      const file = new File([blob], fileName, {
        type: "image/png"
      });

      return { blob, file, fileName };
    } finally {
      image.style.display = "none";
    }
  }

  async function handleDownload(card) {
    try {
      notify("Preparing your memorial card...");

      const result = await downloadMemorialCard(card);
      if (!result) return;

      const url = URL.createObjectURL(result.blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = result.fileName;
      link.click();

      URL.revokeObjectURL(url);

      notify("Memorial card downloaded.", "success");
    } catch (error) {
      console.error(error);
      notify("Could not generate the card. Please try again.", "error");
    }
  }

  // --------------------------------------------------
  // SHARE ON X
  // --------------------------------------------------

  async function handleShare(card, repository) {
    const isDead = repository.stage.status === "dead";

    const cause = isDead
      ? (
          repository.condition?.cause ||
          repository.condition?.label ||
          "No specific cause recorded."
        )
      : "";

    const text = isDead
      ? `Another repository has fallen.\n\n${repository.name}\nStage: ${repository.stage.label}\nCause of death: ${cause}\n\nRemember your abandoned repositories.`
      : `This repository is still alive.\n\n${repository.name}\nStatus: ${repository.stage.label}\nLast activity: ${formatDate(repository.last_activity_at)}\n\nCheck your repositories at GitHub Graveyard.`;

    try {
      const result = await downloadMemorialCard(card);

      if (result && navigator.canShare?.({ files: [result.file] })) {
        await navigator.share({
          files: [result.file],
          title: "GitHub Graveyard",
          text
        });

        return;
      }

      if (result) {
        const url = URL.createObjectURL(result.blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = result.fileName;
        link.click();

        URL.revokeObjectURL(url);
      }

      const shareUrl =
        "https://twitter.com/intent/tweet?text=" +
        encodeURIComponent(text);

      window.open(shareUrl, "_blank", "noopener,noreferrer");

      notify(
        "Card downloaded. Attach it to your X post.",
        "success"
      );
    } catch (error) {
      if (error.name === "AbortError") return;

      console.error(error);

      const shareUrl =
        "https://twitter.com/intent/tweet?text=" +
        encodeURIComponent(text);

      window.open(shareUrl, "_blank", "noopener,noreferrer");

      notify("Opened your X post.", "info");
    }
  }

  // --------------------------------------------------
  // RENDER AND FILTER
  // --------------------------------------------------

  function renderRepositories() {
    if (!elements.repositoryList) return;

    const filtered = state.repositories.filter((repository) => {
      if (state.filter === "all") return true;
      if (state.filter === "dead") return repository.stage.status === "dead";
      if (state.filter === "alive") return repository.stage.status === "alive";
      return true;
    });

    if (!filtered.length) {
      elements.repositoryList.innerHTML = `
        <p style="color:#888;text-align:center;padding:30px;">
          No repositories found in this category.
        </p>
        `;
      return;
    }

    elements.repositoryList.innerHTML = "";

    filtered.forEach((repository) => {
      elements.repositoryList.appendChild(
        createRepositoryCard(repository)
      );
    });
  }

  // --------------------------------------------------
  // GITHUB API
  // --------------------------------------------------

  function connectGitHub() {
    window.location.href = `${API}?action=login`;
  }

  async function loadUser() {
    const response = await fetch(`${API}?action=me`);

    if (!response.ok) {
      throw new Error("Could not verify your GitHub session.");
    }

    const data = await response.json();
    state.user = data.user || data;

    return state.user;
  }

  async function loadRepositories() {
    const response = await fetch(`${API}?action=repositories`);

    if (!response.ok) {
      throw new Error("Could not load your repositories.");
    }

    const data = await response.json();

    return data.repositories || data;
  }

  async function scanGraveyard() {
    if (state.loading) return;

    state.loading = true;
    notify("Scanning your repositories...");

    try {
      const repositories = await loadRepositories();

      state.repositories = prepareRepositories(repositories);

      updateStatistics();
      renderRepositories();

      notify(
        `Scan complete. ${state.repositories.length} repositories examined.`,
        "success"
      );
    } catch (error) {
      console.error(error);
      notify(error.message || "Repository scan failed.", "error");
    } finally {
      state.loading = false;
    }
  }

  // --------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------

  function initialize() {
    addMemorialStyles();

    elements.connectGitHub?.addEventListener("click", connectGitHub);
    elements.heroConnect?.addEventListener("click", connectGitHub);

    elements.connectWallet?.addEventListener("click", () => {
      notify(
        "Ethereum wallet integration is not active yet.",
        "info"
      );
    });

    document.querySelectorAll(".filter-button").forEach((button) => {
      button.addEventListener("click", () => {
        state.filter = button.dataset.filter || "all";

        document.querySelectorAll(".filter-button").forEach((item) => {
          item.classList.toggle("active", item === button);
        });

        renderRepositories();
      });
    });

    elements.repositoryList?.addEventListener("click", async (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;

      const card = button.closest(".repository-card");
      if (!card) return;

      const repository = state.repositories.find(
        (repo) => repo.name === card.dataset.repositoryName
      );

      if (!repository) return;

      if (button.dataset.action === "download") {
        await handleDownload(card);
      }

      if (button.dataset.action === "share") {
        await handleShare(card, repository);
      }
    });

    loadUser()
      .then((user) => {
        if (user) scanGraveyard();
      })
      .catch(() => {
        // User is not connected yet.
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();