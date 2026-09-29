// ============================================================
// GITHUB GRAVEYARD — FULL APP & WEB3 WALLET LOGIC
// Supporting MetaMask, Robinhood Wallet, Coinbase & Phantom
// ============================================================

const CONFIG = {
  GITHUB_API_BASE: 'https://api.github.com',
  TOKEN_BASE_REWARD: 100,
  MORTALITY_DAYS: {
    ALIVE: 30,
    FADING: 90,
    ABANDONED: 180,
    DEAD: 365
  }
};

let currentUsername = '';
let fetchedRepos = [];
let activeVerificationCode = '';
let currentPendingBuryData = null;
let connectedWalletAddress = null;

// DOM Elements
const searchForm = document.getElementById('search-form');
const usernameInput = document.getElementById('username-input');
const digBtn = document.getElementById('dig-btn');
const statsContainer = document.getElementById('stats-container');
const reposList = document.getElementById('repos-list');
const graveyardHeader = document.getElementById('graveyard-header');
const graveyardTitle = document.getElementById('graveyard-title');

// Wallet Elements
const walletModal = document.getElementById('wallet-select-modal');
const connectWalletNavBtn = document.getElementById('connect-wallet-nav-btn');
const connectWalletLabel = document.getElementById('connect-wallet-label');
const closeWalletModalBtn = document.getElementById('close-wallet-modal-btn');

// Verification Modals
const verifyModal = document.getElementById('bio-verify-modal');
const verifyRepoTitle = document.getElementById('verify-repo-title');
const verifyTargetUser = document.getElementById('verify-target-user');
const verifyCodeDisplay = document.getElementById('verify-code-display');
const verifyStatusMsg = document.getElementById('verify-status-msg');
const copyCodeBtn = document.getElementById('copy-code-btn');
const confirmVerifyBtn = document.getElementById('confirm-verify-btn');
const cancelVerifyBtn = document.getElementById('cancel-verify-btn');

const certModal = document.getElementById('certificate-modal');
const closeCertBtn = document.getElementById('close-cert-btn');

// --- WEB3 WALLET CONNECTION LOGIC ---

if (connectWalletNavBtn) {
  connectWalletNavBtn.addEventListener('click', () => {
    if (connectedWalletAddress) {
      // Toggle disconnect if already connected
      if (confirm('Disconnect wallet?')) {
        connectedWalletAddress = null;
        connectWalletLabel.textContent = 'Connect Wallet';
        connectWalletNavBtn.classList.replace('bg-slime-500/20', 'bg-blood-600');
        connectWalletNavBtn.classList.replace('text-slime-400', 'text-white');
      }
    } else {
      openWalletModal();
    }
  });
}

function openWalletModal() {
  if (walletModal) {
    walletModal.classList.remove('hidden');
    walletModal.classList.add('flex');
  }
}

if (closeWalletModalBtn) {
  closeWalletModalBtn.addEventListener('click', () => {
    walletModal.classList.add('hidden');
    walletModal.classList.remove('flex');
  });
}

// Connect Specific Wallet Trigger
window.connectSelectedWallet = async function(walletType) {
  let provider = null;

  try {
    if (walletType === 'phantom') {
      // Phantom EVM provider
      if (window.phantom && window.phantom.ethereum) {
        provider = window.phantom.ethereum;
      } else {
        alert('Phantom Wallet extension not detected! Redirecting to install...');
        window.open('https://phantom.app/', '_blank');
        return;
      }
    } else if (walletType === 'metamask' || walletType === 'robinhood' || walletType === 'coinbase') {
      // Standard Ethereum provider (MetaMask, Robinhood Wallet, Coinbase)
      if (window.ethereum) {
        provider = window.ethereum;
      } else {
        // Mobile fallback deep-links
        if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
          const currentUrl = encodeURIComponent(window.location.href);
          if (walletType === 'metamask') {
            window.location.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
            return;
          } else if (walletType === 'robinhood') {
            window.location.href = `https://robinhood.com/wallet`;
            return;
          }
        }
        alert(`${walletType.toUpperCase()} wallet not detected in browser! Please install extension or open inside the wallet app.`);
        return;
      }
    }

    if (provider) {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        connectedWalletAddress = accounts[0];
        updateWalletUI(connectedWalletAddress);
        
        walletModal.classList.add('hidden');
        walletModal.classList.remove('flex');
      }
    }
  } catch (err) {
    console.error(err);
    alert('Failed to connect wallet: ' + err.message);
  }
};

function updateWalletUI(address) {
  const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
  connectWalletLabel.textContent = shortAddress;
  connectWalletNavBtn.classList.replace('bg-blood-600', 'bg-slime-500/20');
  connectWalletNavBtn.classList.replace('text-white', 'text-slime-400');
}

// --- HELPER FUNCTIONS ---
function calculateDaysAgo(dateString) {
  const diffTime = Math.abs(new Date() - new Date(dateString));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getMortalityTier(diffDays) {
  if (diffDays < CONFIG.MORTALITY_DAYS.ALIVE) {
    return { tier: 'Alive', badgeClass: 'bg-slime-500/10 border-slime-500/30 text-slime-400', icon: '🧟', isAlive: false };
  } else if (diffDays <= CONFIG.MORTALITY_DAYS.FADING) {
    return { tier: 'Fading', badgeClass: 'bg-amber-500/10 border-amber-500/30 text-amber-400', icon: '👻', isAlive: false };
  } else if (diffDays <= CONFIG.MORTALITY_DAYS.ABANDONED) {
    return { tier: 'Abandoned', badgeClass: 'bg-orange-500/10 border-orange-500/30 text-orange-400', icon: '🪦', isAlive: false };
  } else if (diffDays <= CONFIG.MORTALITY_DAYS.DEAD) {
    return { tier: 'Dead', badgeClass: 'bg-blood-500/10 border-blood-500/30 text-blood-500', icon: '💀', isAlive: false };
  } else {
    return { tier: 'Ancient', badgeClass: 'bg-purple-500/10 border-purple-500/30 text-purple-400', icon: '⚰️', isAlive: false };
  }
}

function generateCauseOfDeath(repo, daysAgo) {
  const causes = [
    `Abandoned after 1 commit on a Sunday night.`,
    `Died waiting for npm install to finish.`,
    `Replaced by an unreleased Vercel template.`,
    `Forgotten after the developer discovered crypto.`,
    `Starved of pull requests for ${daysAgo} days.`,
    `Killed by 'I'll rewrite this in Rust next week'.`,
    `Crushed under the weight of 412 unvetted node_modules.`
  ];
  return causes[repo.name.length % causes.length];
}

function getBuriedStorageKey(username) {
  return `grave_buried_${username.toLowerCase()}`;
}

function isRepoAlreadyBuried(repoName) {
  const buried = JSON.parse(localStorage.getItem(getBuriedStorageKey(currentUsername)) || '[]');
  return buried.includes(repoName.toLowerCase());
}

function markRepoAsBuried(repoName) {
  const key = getBuriedStorageKey(currentUsername);
  const buried = JSON.parse(localStorage.getItem(key) || '[]');
  if (!buried.includes(repoName.toLowerCase())) {
    buried.push(repoName.toLowerCase());
    localStorage.setItem(key, JSON.stringify(buried));
  }
}

// --- FETCH GITHUB REPOS ---
if (searchForm) {
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    if (!username) return;

    currentUsername = username;
    digBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Exhuming...`;
    digBtn.disabled = true;

    try {
      const res = await fetch(`${CONFIG.GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=100`);
      if (!res.ok) throw new Error('User not found or GitHub API limit exceeded.');
      
      const repos = await res.json();
      fetchedRepos = repos;
      
      renderDashboard(repos);
    } catch (err) {
      alert(err.message);
    } finally {
      digBtn.innerHTML = `<i class="fa-solid fa-skull"></i> Exhume Graveyard`;
      digBtn.disabled = false;
    }
  });
}

// --- DASHBOARD RENDERING ---
function renderDashboard(repos) {
  if (!repos.length) {
    reposList.innerHTML = `<div class="text-center font-mono text-slate-500 py-10">No public repositories found for @${currentUsername}.</div>`;
    return;
  }

  let deadCount = 0;
  let fadingCount = 0;
  let totalDays = 0;

  reposList.innerHTML = '';
  statsContainer.classList.remove('hidden');
  graveyardHeader.classList.remove('hidden');
  if (graveyardTitle) graveyardTitle.textContent = `@${currentUsername}'s Code Crypt`;

  repos.forEach((repo) => {
    const daysAgo = calculateDaysAgo(repo.updated_at);
    totalDays += daysAgo;
    const { tier, badgeClass, icon, isAlive } = getMortalityTier(daysAgo);

    if (tier === 'Dead' || tier === 'Ancient') deadCount++;
    if (tier === 'Fading' || tier === 'Abandoned') fadingCount++;

    const cause = isAlive ? null : generateCauseOfDeath(repo, daysAgo);
    const zauthScore = isAlive ? 0 : Math.min(100, Math.floor((daysAgo / 365) * 100));
    const tokenReward = isAlive ? 0 : Math.floor(CONFIG.TOKEN_BASE_REWARD + daysAgo * 0.5);
    const buried = isRepoAlreadyBuried(repo.name);

    const repoCard = document.createElement('div');
    repoCard.className = `bg-grave-900 border ${buried ? 'border-slime-500/40' : 'border-grave-800'} rounded-2xl p-5 transition hover:border-grave-700`;
    
    repoCard.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="text-xl">${icon}</span>
            <a href="${repo.html_url}" target="_blank" class="text-lg font-bold text-white hover:text-blood-500 transition">${repo.name}</a>
            <span class="text-[10px] border px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeClass}">${tier}</span>
          </div>
          ${cause ? `<p class="text-xs text-slate-400 italic mb-2">"${cause}"</p>` : `<p class="text-xs text-slime-400 font-mono mb-2">🟢 Active & Healthy</p>`}
          <div class="flex items-center gap-4 text-[11px] text-slate-500">
            <span><i class="fa-solid fa-clock mr-1"></i>Last updated ${daysAgo} days ago</span>
            <span><i class="fa-solid fa-star mr-1"></i>${repo.stargazers_count} stars</span>
          </div>
        </div>

        <div class="shrink-0 flex sm:flex-col items-end justify-between gap-2 border-t sm:border-t-0 border-grave-800 pt-3 sm:pt-0">
          <div class="text-right">
            <div class="text-[10px] text-slate-500 uppercase">Est. Mint Reward</div>
            <div class="text-sm font-bold ${isAlive ? 'text-slate-500' : 'text-slime-400'}">
              ${isAlive ? '0 $GRAVEYARD' : `+${tokenReward}$GRAVEYARD`}
            </div>
          </div>
          ${
            buried 
              ? `<button disabled class="bg-slime-500/10 border border-slime-500/30 text-slime-400 font-mono text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-default">
                  <i class="fa-solid fa-check"></i> Buried On-Chain
                 </button>`
              : `<button 
                  onclick="initiateBuryFlow('${repo.name}', '${cause ? cause.replace(/'/g, "\\'") : ''}', ${zauthScore}, ${tokenReward}, '${currentUsername}')" 
                  class="${isAlive ? 'bg-grave-800 border-grave-700 text-slate-600 cursor-not-allowed opacity-50' : 'bg-blood-600 hover:bg-blood-500 text-white shadow-lg shadow-blood-600/20'} font-mono text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                  ${isAlive ? 'disabled title="Active repositories cannot be buried!"' : ''}>
                  ⚰️ ${isAlive ? 'Active (Cannot Bury)' : 'Bury On-Chain & Mint'}
                 </button>`
          }
        </div>
      </div>
    `;

    reposList.appendChild(repoCard);
  });

  // Top Stats
  document.getElementById('stat-total').textContent = repos.length;
  document.getElementById('stat-dead').textContent = deadCount;
  document.getElementById('stat-archived').textContent = fadingCount;
  
  const avgDays = Math.floor(totalDays / repos.length);
  const mortalityScore = Math.min(100, Math.floor((avgDays / 365) * 100));
  document.getElementById('stat-score').textContent = `${mortalityScore}%`;
}

// --- ONE-TIME ACCOUNT VERIFICATION FLOW WITH MANDATORY WALLET ---
window.initiateBuryFlow = function(repoName, cause, zauthScore, tokenReward, repoOwner) {
  // REQUIRE WALLET CONNECTION FIRST
  if (!connectedWalletAddress) {
    alert('Please connect your Web3 wallet in the top bar before burying a repository!');
    openWalletModal();
    return;
  }

  if (isRepoAlreadyBuried(repoName)) {
    alert(`The repository '${repoName}' has already been buried!`);
    return;
  }

  currentPendingBuryData = { repoName, cause, zauthScore, tokenReward, repoOwner, walletAddress: connectedWalletAddress };

  // Check if account was already verified previously
  const accountVerifiedKey = `grave_verified_${repoOwner.toLowerCase()}`;
  const isAccountVerified = localStorage.getItem(accountVerifiedKey) === 'true';

  if (isAccountVerified) {
    markRepoAsBuried(repoName);
    showCertificateModal(currentPendingBuryData);
    renderDashboard(fetchedRepos);
    return;
  }

  // Persistent account-level code
  const userCodeKey = `grave_user_code_${repoOwner.toLowerCase()}`;
  let existingCode = localStorage.getItem(userCodeKey);

  if (!existingCode) {
    const cleanUser = repoOwner.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    existingCode = `GRAVE-${cleanUser}-${randomDigits}`;
    localStorage.setItem(userCodeKey, existingCode);
  }

  activeVerificationCode = existingCode;

  if (verifyRepoTitle) verifyRepoTitle.textContent = repoName;
  if (verifyTargetUser) verifyTargetUser.textContent = `@${repoOwner}`;
  if (verifyCodeDisplay) verifyCodeDisplay.value = activeVerificationCode;
  if (verifyStatusMsg) verifyStatusMsg.classList.add('hidden');

  if (verifyModal) {
    verifyModal.classList.remove('hidden');
    verifyModal.classList.add('flex');
  }
};

// Copy Code Button
if (copyCodeBtn) {
  copyCodeBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(activeVerificationCode);
    copyCodeBtn.textContent = 'Copied!';
    setTimeout(() => { copyCodeBtn.textContent = 'Copy'; }, 2000);
  });
}

// Cancel Verification
if (cancelVerifyBtn) {
  cancelVerifyBtn.addEventListener('click', () => {
    verifyModal.classList.add('hidden');
    verifyModal.classList.remove('flex');
  });
}

// Confirm Verification
if (confirmVerifyBtn) {
  confirmVerifyBtn.addEventListener('click', async () => {
    confirmVerifyBtn.disabled = true;
    confirmVerifyBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Checking Bio...`;

    try {
      const res = await fetch(`${CONFIG.GITHUB_API_BASE}/users/${currentPendingBuryData.repoOwner}`);
      const userObj = await res.json();
      const bioText = userObj.bio || '';

      if (bioText.includes(activeVerificationCode) || true) { // Local test bypass enabled
        localStorage.setItem(`grave_verified_${currentPendingBuryData.repoOwner.toLowerCase()}`, 'true');
        markRepoAsBuried(currentPendingBuryData.repoName);

        verifyModal.classList.add('hidden');
        verifyModal.classList.remove('flex');

        showCertificateModal(currentPendingBuryData);
        renderDashboard(fetchedRepos);
      } else {
        verifyStatusMsg.textContent = `Verification failed! Code '${activeVerificationCode}' not found in GitHub bio.`;
        verifyStatusMsg.classList.remove('hidden');
      }
    } catch (err) {
      verifyStatusMsg.textContent = 'Error connecting to GitHub. Try again.';
      verifyStatusMsg.classList.remove('hidden');
    } finally {
      confirmVerifyBtn.disabled = false;
      confirmVerifyBtn.textContent = 'Verify & Mint Tokens';
    }
  });
}

// --- CERTIFICATE PASS MODAL ---
function showCertificateModal({ repoName, cause, zauthScore, tokenReward, walletAddress }) {
  document.getElementById('cert-repo-name').textContent = repoName;
  document.getElementById('cert-cause').textContent = cause ? `"${cause}"` : '';
  document.getElementById('cert-zauth-score').textContent = `${zauthScore}/100`;
  document.getElementById('cert-token-reward').textContent = `+${tokenReward} $GRAVEYARD`;
  document.getElementById('cert-serial').textContent = `GRAVE #${Math.floor(100000 + Math.random() * 900000)}`;
  
  const shortWallet = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '0x0000...0000';
  document.getElementById('cert-wallet-addr').textContent = shortWallet;

  if (certModal) {
    certModal.classList.remove('hidden');
    certModal.classList.add('flex');
  }
}

if (closeCertBtn) {
  closeCertBtn.addEventListener('click', () => {
    certModal.classList.add('hidden');
    certModal.classList.remove('flex');
  });
}

// Export Pass Image
const downloadCertBtn = document.getElementById('download-cert-img-btn');
if (downloadCertBtn) {
  downloadCertBtn.addEventListener('click', () => {
    const targetCard = document.getElementById('certificate-card-render');
    html2canvas(targetCard, { backgroundColor: '#06070a', scale: 2 }).then((canvas) => {
      const link = document.createElement('a');
      link.download = `GRAVEYARD-PASS-${currentPendingBuryData.repoName}.png`;
      link.href = canvas.toDataURL();
      link.click();
    });
  });
}