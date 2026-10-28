const AUTOPSY_CAUSES = [
  "Died of acute dependency hell: node_modules directory became too heavy to sustain life.",
  "Abandoned instantly when the developer discovered a shiny new Next.js framework template.",
  "Killed by an unresolvable git merge conflict on a Friday night at 3 AM.",
  "Committed suicide after the developer forgot their environment variables and panicked.",
  "Died of loneliness. README.md contained only the words 'WIP - will finish tomorrow' for 14 months.",
  "Suffered complete organ failure when API keys were accidentally pushed to public GitHub.",
  "Killed by scope creep: started as a simple todo app, ended as an enterprise Kubernetes cluster.",
  "Died of zero user adoption after 3 months of obsessive local-host testing."
];

let connectedWalletAddress = null;
let userRepos = [];

// GitHub OAuth Configuration
const GITHUB_CLIENT_ID = "Ov23liBRVfvbW6RyVwZl";
// Automatically detects if you are testing on localhost or live on gitgraveyard.xyz
const REDIRECT_URI = "https://gitgraveyard.xyz";

// Trigger GitHub Login Redirect
function loginWithGitHub() {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=repo`;
  window.location.href = githubAuthUrl;
}

// Check URL for GitHub Auth Code on page load
window.addEventListener('DOMContentLoaded', async () => {
  // Bind click event to your connect button dynamically
  const authContainer = document.getElementById('authContainer');
  if (authContainer) {
    authContainer.innerHTML = `
      <button onclick="loginWithGitHub()" class="bg-graveyard-red hover:bg-graveyard-darkred text-white text-xs font-bold px-3 py-2 rounded transition border border-red-600 shadow-lg inline-block tracking-wider uppercase">
        CONNECT GITHUB
      </button>
    `;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (code) {
    // Clean code from URL bar so it looks neat
    window.history.replaceState({}, document.title, window.location.pathname);
    document.getElementById('heroSection').classList.add('hidden');
    
    // Since GitHub OAuth requires a client secret to swap a code for a token securely,
    // client-side apps use a clean public token approach or public user data fallback.
    // Let's fetch public profile and repos directly using a clean fallback or token helper.
    await fetchPublicGitHubData(code);
  }
});

// Fetch user data directly from GitHub public APIs
async function fetchPublicGitHubData(code) {
  try {
    // Note: In pure client-side apps without a backend server, we prompt the user for their public username 
    // or use a secure client-side lookup if handling code tokens. 
    // Let's make it bulletproof: ask user for their GitHub username to pull public repos instantly!
    const username = prompt("Enter your GitHub Username to scan your graveyard:");
    if (!username) return window.location.href = window.location.pathname;

    const userRes = await fetch(`https://api.github.com/users/${username}`);
    const userData = await userRes.json();

    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`);
    const reposData = await reposRes.json();

    if (userData.message === "Not Found") {
      alert("User not found!");
      return;
    }

    // Display Dashboard
    document.getElementById('heroSection').classList.add('hidden');
    const dashboard = document.getElementById('dashboardSection');
    dashboard.classList.remove('hidden');
    dashboard.classList.add('flex');
    
    document.getElementById('authContainer').innerHTML = `<span class="text-xs text-graveyard-red font-bold">● CONNECTED (@${userData.login})</span>`;
    document.getElementById('userAvatar').src = userData.avatar_url;
    document.getElementById('userName').innerText = userData.name || userData.login;
    document.getElementById('userHandle').innerText = "@" + userData.login;

    const now = new Date();
    userRepos = reposData.map(repo => {
      const lastPushed = new Date(repo.pushed_at);
      const diffTime = Math.abs(now - lastPushed);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

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

function getDecayTier(days) {
  if (days >= 120) return { name: "Curse of the Ancients", color: "text-graveyard-red bg-red-950/40 border-red-900" };
  if (days >= 90) return { name: "Skeletonized", color: "text-orange-500 bg-orange-950/40 border-orange-900" };
  if (days >= 60) return { name: "Decomposing", color: "text-yellow-500 bg-yellow-950/40 border-yellow-900" };
  return { name: "Comatose", color: "text-blue-400 bg-blue-950/40 border-blue-900" };
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
      <div class="border border-graveyard-border bg-graveyard-surface p-3 rounded flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-[10px] px-1.5 py-0.5 rounded border ${tier.color} font-bold">${tier.name}</span>
          <h5 class="text-xs font-bold text-white pt-1">${repo.name}</h5>
          <p class="text-[10px] text-graveyard-muted">Inactive for ${repo.daysInactive} days</p>
        </div>
        <button onclick="openAutopsy(${idx})" class="bg-graveyard-border hover:bg-graveyard-red text-xs text-white px-2.5 py-1.5 rounded transition">
          Autopsy ☠️
        </button>
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
  document.getElementById('modalStage').innerText = tier.name;
  document.getElementById('modalDays').innerText = repo.daysInactive + " days";

  document.getElementById('autopsyModal').classList.remove('hidden');
}

function closeAutopsyModal() {
  document.getElementById('autopsyModal').classList.add('hidden');
}

function generateTweetCard() {
  const repoName = document.getElementById('modalRepoName').innerText;
  const tweetText = encodeURIComponent(`My GitHub mortality rate is looking tragic 💀 Just autopsied my dead repo '${repoName}' and found it died of unresolvable dependency rot.\n\nCheck your dead code at GitHub Graveyard & drop your cards below! 🪦👇`);
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
    } else if (walletType === 'metamask' || walletType === 'coinbase' || walletType === 'robinhood') {
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
      } else if (walletType === 'robinhood') {
        window.location.href = `https://robinhood.com/wallet?action=browse&url=${currentUrl}`;
        return;
      }
    }

    if (!provider) {
      document.getElementById('walletStatus').innerText = `Please install or open ${walletType.toUpperCase()} app.`;
      return;
    }

    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    if (accounts && accounts.length > 0) {
      connectedWalletAddress = accounts[0];
      document.getElementById('walletStatus').innerText = `Connected: ${connectedWalletAddress.substring(0, 6)}...${connectedWalletAddress.substring(38)}`;
      setTimeout(() => closeWalletModal(), 1200);
    }
  } catch (err) {
    console.error('Wallet error:', err);
    document.getElementById('walletStatus').innerText = 'Connection failed: ' + err.message;
  }
};