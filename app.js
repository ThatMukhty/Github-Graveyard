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
    userRepos = reposData.map((repo, idx) => {
      const lastPushed = new Date(repo.pushed_at);
      const diffDays = Math.max(0, Math.floor((now - lastPushed) / (1000 * 60 * 60 * 24)));
      // Assign a consistent cause of death based on repo name length/index
      const cause = AUTOPSY_CAUSES[(repo.name.length + idx) % AUTOPSY_CAUSES.length];

      return {
        name: repo.name,
        daysInactive: diffDays,
        stars: repo.stargazers_count,
        fork: repo.fork,
        causeOfDeath: cause
      };
    }).filter(repo => !repo.fork);

    renderGraveyard(userRepos);

  } catch (err) {
    console.error("GitHub API fetch error:", err);
    alert("Failed to pull GitHub data. Please try again.");
  }
}

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
    
    if (tier.isDead) {
      // Scary Tombstone Card for Dead Repos
      const cardHTML = `
      <div class="tombstone-card transition-all duration-200 border-2 border-red-950 bg-gradient-to-b from-graveyard-surface to-black p-5 rounded-xl shadow-xl space-y-4 relative overflow-hidden">
          <div class="absolute top-0 right-0 bg-red-950/80 text-graveyard-red text-[10px] font-black px-3 py-1 rounded-bl uppercase tracking-widest border-l border-b border-red-900">
            ${tier.name}
          </div>
          
          <div class="space-y-1">
            <span class="text-xs text-graveyard-muted uppercase tracking-wider">🪦 RIP Codebase</span>
            <h4 class="text-lg font-black text-white tracking-tight">${repo.name}</h4>
            <p class="text-xs text-graveyard-muted">Rotting in silence for <span class="text-white font-bold">${repo.daysInactive} days</span></p>
          </div>

          <div class="bg-black/80 p-3.5 rounded-lg border border-red-950/60 space-y-1">
            <span class="text-[10px] font-bold text-graveyard-red uppercase tracking-wider">Official Cause of Death:</span>
            <p class="text-xs text-gray-300 italic leading-relaxed">"${repo.causeOfDeath}"</p>
          </div>

          <!-- Action Buttons Bar -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-graveyard-border">
            <button onclick="downloadTombstoneCard('${repo.name}', '${repo.daysInactive}', '${tier.name}')" class="bg-black hover:bg-graveyard-border border border-graveyard-border text-gray-200 text-xs font-bold py-2 px-3 rounded transition flex items-center justify-center gap-1.5">
              <span>📥 Download Card</span>
            </button>
            <button onclick="tweetRepoCause('${repo.name}')" class="bg-graveyard-red hover:bg-graveyard-darkred text-white text-xs font-bold py-2 px-3 rounded transition flex items-center justify-center gap-1.5 shadow">
              <span>🐦 Tweet Reason</span>
            </button>
           <button onclick="openWalletModalForRepo('${repo.name}')" class="bg-blue-950/60 hover:bg-blue-900/80 border border-blue-800 text-blue-200 text-xs font-bold py-2.5 px-3 rounded transition flex items-center justify-center gap-1.5">

<span id="mintBtn-${idx}">🔗 ${connectedWalletAddress ? connectedWalletAddress.substring(0,6) + '...' + connectedWalletAddress.substring(38) : 'Connect EVM'}</span>

</button>
          </div>
        </div>
      `;
      listContainer.innerHTML += cardHTML;
    } else {
      // Clean Healthy Row for Active Repos
      const cardHTML = `
        <div class="border border-graveyard-border bg-graveyard-surface/60 p-3.5 rounded-lg flex items-center justify-between gap-3">
          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <span class="text-[10px] px-2 py-0.5 rounded border ${tier.color} font-bold uppercase">${tier.name}</span>
              <h5 class="text-xs font-bold text-white">${repo.name}</h5>
            </div>
            <p class="text-[11px] text-graveyard-muted">Last pushed ${repo.daysInactive === 0 ? "today" : repo.daysInactive + " days ago"}</p>
          </div>
          <span class="text-xs text-green-400 font-semibold px-2.5 py-1 bg-green-950/30 rounded border border-green-900/50">Healthy</span>
        </div>
      `;
      listContainer.innerHTML += cardHTML;
    }
  });
}
function downloadTombstoneCard(repoName, days, tier) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#08080a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#991b1b';
  ctx.lineWidth = 8;
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

  ctx.fillStyle = '#991b1b';
  ctx.fillRect(80, 80, 260, 45);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('🪦 RIP CODEBASE', 105, 110);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 50px sans-serif';
  ctx.fillText(repoName, 80, 190);

  ctx.fillStyle = '#888899';
  ctx.font = '22px sans-serif';
  ctx.fillText(`Rotting in silence for ${days} days — Status: ${tier}`, 80, 235);

  ctx.fillStyle = '#111116';
  ctx.fillRect(80, 280, canvas.width - 160, 160);
  ctx.strokeStyle = '#22222e';
  ctx.lineWidth = 2;
  ctx.strokeRect(80, 280, canvas.width - 160, 160);

  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('OFFICIAL CAUSE OF DEATH:', 120, 330);

  const repoObj = userRepos.find(r => r.name === repoName);
  const causeText = repoObj ? repoObj.causeOfDeath : "Died of unresolvable dependency rot.";
  
  ctx.fillStyle = '#d1d5db';
  ctx.font = 'italic 24px sans-serif';
  ctx.fillText(`"${causeText}"`, 120, 385, canvas.width - 240);

  ctx.fillStyle = '#888899';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('gitgraveyard.xyz •  ALL CODE DIES EVENTUALLY', 80, 520);

  const link = document.createElement('a');
  link.download = `${repoName}-tombstone.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function tweetRepoCause(repoName) {
  const repoObj = userRepos.find(r => r.name === repoName);
  const cause = repoObj ? repoObj.causeOfDeath : "Died of dependency hell.";
  const tweetText = encodeURIComponent(`My codebase '${repoName}' just died on GitHub Graveyard 💀 Cause of death: "${cause}"\n\nCheck your repo mortality rate at https://gitgraveyard.xyz & drop your tombstones below! Tagging @1 @2 🪦👇`);
  window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
}

let activeMintRepo = null;
function openWalletModalForRepo(repoName) {
  activeMintRepo = repoName;
  openWalletModal();
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
      provider = window.phantom?.ethereum || window.ethereum;
    } else if (['metamask', 'rabby', 'coinbase', 'walletconnect'].includes(walletType)) {
      provider = window.ethereum;
    }

    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    if (!provider && isMobile) {
      const currentUrl = encodeURIComponent(window.location.href);
      if (walletType === 'metamask') {
        window.location.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
        return;
      }
    }

    if (!provider) {
      document.getElementById('walletStatus').innerText = `Please install ${walletType.toUpperCase()} extension.`;
      return;
    }

    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    if (accounts && accounts.length > 0) {
      connectedWalletAddress = accounts[0];
      const maskedAddr = `${connectedWalletAddress.substring(0, 6)}...${connectedWalletAddress.substring(38)}`;
      document.getElementById('walletStatus').innerText = `Connected: ${maskedAddr}`;
      
      setTimeout(() => {
        closeWalletModal();
        renderGraveyard(userRepos); // Refreshes UI to show masked address on cards
        if (activeMintRepo) {
          alert(`Wallet connected (${maskedAddr})! Ready to mint tombstone NFT on-chain for '${activeMintRepo}' ⚡`);
        }
      }, 800);
    }
  } catch (err) {
    console.error('Wallet error:', err);
    document.getElementById('walletStatus').innerText = 'Connection failed or rejected.';
  }
};