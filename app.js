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

// Check if user just logged in and fetch profile/repos on load
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/user');
    const data = await res.json();

    if (data.authenticated) {
      document.getElementById('heroSection').classList.add('hidden');
      const dashboard = document.getElementById('dashboardSection');
      dashboard.classList.remove('hidden');
      dashboard.classList.add('flex');
      document.getElementById('authContainer').innerHTML = `<span class="text-xs text-graveyard-red font-bold">● CONNECTED</span>`;

      document.getElementById('userAvatar').src = data.user.avatar_url;
      document.getElementById('userName').innerText = data.user.name || data.user.login;
      document.getElementById('userHandle').innerText = "@" + data.user.login;

      userRepos = data.repos;
      renderGraveyard(userRepos);
    }
  } catch (err) {
    console.error("Not authenticated or fetch failed:", err);
  }
});

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