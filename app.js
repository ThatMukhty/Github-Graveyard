const AUTOPSY_CAUSES = [
  "Died of acute dependency hell: node_modules directory became heavier than a black hole.",
  "Abandoned instantly when the developer discovered a shiny new framework template.",
  "Killed by an unresolvable git merge conflict on a Friday night at 3 AM.",
  "Committed suicide after API keys were accidentally pushed to public GitHub.",
  "Died of loneliness. README.md contained only 'WIP - will finish tomorrow' for 14 months.",
  "Killed by scope creep: started as a simple todo app, ended as a broken microservices cluster.",
  "Died of zero user adoption after 3 months of obsessive localhost testing.",
  "Succumbed to fatal syntax corruption: 404 semi-colons missing across production files."
];

let connectedWalletAddress = null;
let userRepos = [];

const GITHUB_CLIENT_ID = "Ov23liBRVfvbW6RyVwZl";
const REDIRECT_URI = "https://gitgraveyard.xyz";

function loginWithGitHub() {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=repo`;
  window.location.href = githubAuthUrl;
}

window.addEventListener('DOMContentLoaded', async () => {
  const authContainer = document.getElementById('authContainer');
  if (authContainer) {
    authContainer.innerHTML = `
      <button onclick="loginWithGitHub()" class="bg-graveyard-red hover:bg-graveyard-darkred text-white text-xs font-bold px-3 py-1.5 rounded transition border border-red-600 shadow uppercase tracking-wider">
        CONNECT GITHUB
      </button>
    `;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (code) {
    window.history.replaceState({}, document.title, window.location.pathname);
    await fetchPublicGitHubData();
  }
});

async function fetchPublicGitHubData() {
  try {
    const username = prompt("Enter your GitHub Username to scan your graveyard:");
    if (!username) return;

    const userRes = await fetch(`https://api.github.com/users/${username}`);
    const userData = await userRes.json();

    if (userData.message === "Not Found") {
      alert("User not found!");
      return;
    }

    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`);
    const reposData = await reposRes.json();

    document.getElementById('heroSection').classList.add('hidden');
    const dashboard = document.getElementById('dashboardSection');
    dashboard.classList.remove('hidden');

    document.getElementById('authContainer').innerHTML = `
      <div class="flex items-center gap-2 bg-red-950/40 border border-red-800 px-3 py-1 rounded">
        <span class="w-2 h-2 rounded-full bg-graveyard-red animate-pulse"></span>
        <span class="text-xs text-white font-bold uppercase">@${userData.login}</span>
      </div>
    `;

    document.getElementById('userAvatar').src = userData.avatar_url;
    document.getElementById('userName').innerText = userData.name || userData.login;
    document.getElementById('userHandle').innerText = "@" + userData.login;

    const now = new Date();
    userRepos = reposData.map(repo => {
      const lastPushed = new Date(repo.pushed_at);
      const diffDays = Math.max(0, Math.floor((now - lastPushed) / (1000 * 60 * 60 * 24)));

      return {
        name: repo.name,
        daysInactive: diffDays,
        stars: repo.stargazers_count,
        fork: repo.fork
      };
    }).filter(repo => !repo.fork);

    renderGraveyard(userRepos);

  } catch (err) {
    console.error("GitHub API fetch error:", err);
    alert("Failed to pull GitHub data. Please try again.");
  }
}

// Inactivity threshold logic:
// < 30 days = Active 🟢 (Not dead)
// >= 30 days = Dead repo with decay tiers
function getDecayTier(days) {
  if (days < 30) {
    return { name: "Active 🟢", color: "text-green-400 bg-green-950/40 border-green-900", isDead: false };
  }
  if (days >= 120) {
    return { name: "Curse of the Ancients", color: "text-graveyard-red bg-red-950/50 border-red-900", isDead: true };
  }
  if (days >= 90) {
    return { name: "Skeletonized", color: "text-orange-500 bg-orange-950/40 border-orange-900", isDead: true };
  }
  if (days >= 60) {
    return { name: "Decomposing", color: "text-yellow-500 bg-yellow-950/40 border-yellow-900", isDead: true };
  }
  return { name: "Comatose", color: "text-blue-400 bg-blue-950/40 border-blue-900", isDead: true };
}

function renderGraveyard(repos) {
  const deadRepos = repos.filter(r => r.daysInactive >= 30);
  document.getElementById('deadRepoCount').innerText = deadRepos.length;
  document.getElementById('statTotalRepos').innerText = repos.length;

  const mortality = repos.length > 0 ? Math.round((deadRepos.length / repos.length) * 100) : 0;
  document.getElementById('statMortalityRate').innerText = mortality + "%";

  const listContainer = document.getElementById('repoGraveyardList');
  listContainer.innerHTML = "";

  repos.forEach((repo, idx) => {
    const tier = getDecayTier(repo.daysInactive);
    const cardHTML = `
      <div class="border border-graveyard-border bg-graveyard-surface p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm hover:border-gray-700 transition">
        <div class="space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[10px] px-2 py-0.5 rounded border ${tier.color} font-bold uppercase tracking-wide">${tier.name}</span>
            <h5 class="text-sm font-bold text-white">${repo.name}</h5>
          </div>
          <p class="text-xs text-graveyard-muted">Last pushed ${repo.daysInactive === 0 ? "today" : repo.daysInactive + " days ago"}</p>
        </div>
        ${tier.isDead ? `
          <button onclick="openAutopsy(${idx})" class="w-full sm:w-auto bg-graveyard-red hover:bg-graveyard-darkred text-xs text-white px-3.5 py-2 rounded-md font-bold transition flex items-center justify-center gap-1.5 shadow">
            <span>Autopsy</span> ☠️
          </button>
        ` : `
          <span class="text-xs text-green-400 font-semibold px-2 py-1 bg-green-950/30 rounded border border-green-900/50">Healthy</span>
        `}
      </div>
    `;
    listContainer.innerHTML += cardHTML;
  });
}

function openAutopsy(index) {
  const repo = userRepos[index];
  const tier = getDecayTier(repo.daysInactive);
  const randomCause = AUTOPSY_CAUSES[Math.floor(Math.random() * AUTOPSY_CAUSES.length)];

  document.getElementById('modalRepoName').innerText = repo.name;
  document.getElementById('modalCauseOfDeath').innerText = randomCause;
  
  const stageEl = document.getElementById('modalStage');
  stageEl.innerText = tier.name;
  stageEl.className = `text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide border ${tier.color}`;

  document.getElementById('modalDays').innerText = repo.daysInactive + " days ago";

  document.getElementById('autopsyModal').classList.remove('hidden');
}

function closeAutopsyModal() {
  document.getElementById('autopsyModal').classList.add('hidden');
}

function generateTweetCard() {
  const repoName = document.getElementById('modalRepoName').innerText;
  const tweetText = encodeURIComponent(`My GitHub mortality rate is looking tragic 💀 Just autopsied my dead repo '${repoName}' on GitHub Graveyard.\n\nCheck your dead code at https://gitgraveyard.xyz & drop your tombstones below! 🪦👇`);
  window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
}

function openWalletModal() {
  document.getElementById('walletModal').classList.remove('hidden');
}

function closeWalletModal() {
  document.getElementById('walletModal').classList.add('hidden');
}

window.connectSelectedWallet = async function(walletType) {
  let provider = null;
  try {
    if (walletType === 'phantom') {
      provider = window.phantom?.ethereum;
    } else if (walletType === 'metamask' || walletType === 'coinbase') {
      provider = window.ethereum;
    }

    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    if (!provider && isMobile) {
      const currentUrl = encodeURIComponent(window.location.href);
      if (walletType === 'metamask') {
        window.location.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
        return;
      } else if (walletType === 'phantom') {
        window.location.href = `https://phantom.app/ul/browse/${currentUrl}`;
        return;
      }
    }

    if (!provider) {
      document.getElementById('walletStatus').innerText = `Please install ${walletType.toUpperCase()}.`;
      return;
    }

    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    if (accounts && accounts.length > 0) {
      connectedWalletAddress = accounts[0];
      const shortAddr = `${connectedWalletAddress.substring(0, 6)}...${connectedWalletAddress.substring(38)}`;
      document.getElementById('walletStatus').innerText = `Connected: ${shortAddr}`;
      
      const modalBtn = document.getElementById('modalWalletConnectBtn');
      if (modalBtn) {
        modalBtn.innerHTML = `<span>🟢 ${shortAddr}</span>`;
        modalBtn.classList.replace('bg-blue-900/40', 'bg-green-950/60');
        modalBtn.classList.replace('border-blue-700', 'border-green-800');
        modalBtn.classList.replace('text-blue-200', 'text-green-300');
      }
      setTimeout(() => closeWalletModal(), 1000);
    }
  } catch (err) {
    console.error('Wallet error:', err);
    document.getElementById('walletStatus').innerText = 'Connection failed.';
  }
};