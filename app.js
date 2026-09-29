/**
 * GitHub Graveyard - Full Production Script (EVM / Ethereum)
 * Verification Method: Dynamic GitHub Bio Code (Zero-Backend Anti-Abuse)
 * Domain: https://gitgraveyard.xyz
 */

document.addEventListener('DOMContentLoaded', () => {
  const TARGET_DOMAIN = 'https://gitgraveyard.xyz';

  // Config for Token Launch & Treasury
  const TOKEN_CONFIG = {
    symbol: "$GRAVEYARD",
    treasuryWallet: "0x0000000000000000000000000000000000000000", // Replace with real contract/treasury address
    baseRewardPerBurial: 1000
  };

  // State Management
  let currentWalletAddress = null;
  let activeVerificationCode = null;
  let currentPendingBuryData = null;
  let currentGraveyardStats = { total: 0, deadCount: 0, mortalityRate: 0 };

  // DOM Elements
  const searchForm = document.getElementById('search-form');
  const usernameInput = document.getElementById('username-input');
  const digBtn = document.getElementById('dig-btn');
  const copySiteBtn = document.getElementById('copy-site-btn');
  
  // Stats Elements
  const statsContainer = document.getElementById('stats-container');
  const statTotal = document.getElementById('stat-total');
  const statDead = document.getElementById('stat-dead');
  const statArchived = document.getElementById('stat-archived');
  const statScore = document.getElementById('stat-score');

  // Hero & Graveyard Container
  const heroContainer = document.getElementById('embarrassing-hero-container');
  const graveyardHeader = document.getElementById('graveyard-header');
  const graveyardTitle = document.getElementById('graveyard-title');
  const reposList = document.getElementById('repos-list');

  // Bio Verification Modal Elements
  const verifyModal = document.getElementById('bio-verify-modal');
  const verifyRepoTitle = document.getElementById('verify-repo-title');
  const verifyTargetUser = document.getElementById('verify-target-user');
  const verifyCodeDisplay = document.getElementById('verify-code-display');
  const copyCodeBtn = document.getElementById('copy-code-btn');
  const confirmVerifyBtn = document.getElementById('confirm-verify-btn');
  const cancelVerifyBtn = document.getElementById('cancel-verify-btn');
  const verifyStatusMsg = document.getElementById('verify-status-msg');

  // Certificate Modal Elements
  const certificateModal = document.getElementById('certificate-modal');
  const closeCertBtn = document.getElementById('close-cert-btn');
  const certCardRender = document.getElementById('certificate-card-render');
  const certTierBadge = document.getElementById('cert-tier-badge');
  const certSerial = document.getElementById('cert-serial');
  const certRepoName = document.getElementById('cert-repo-name');
  const certWalletAddr = document.getElementById('cert-wallet-addr');
  const certDate = document.getElementById('cert-date');
  const certTxContainer = document.getElementById('cert-tx-container');
  const certTxLink = document.getElementById('cert-tx-link');
  const certCause = document.getElementById('cert-cause');
  const certZauthScore = document.getElementById('cert-zauth-score');
  const certTokenReward = document.getElementById('cert-token-reward');
  const downloadCertImgBtn = document.getElementById('download-cert-img-btn');
  const shareCertXBtn = document.getElementById('share-cert-x-btn');

  // Dev Causes of Death
  const deathCausesList = [
    "Skill issue.",
    "Spent 3 weeks picking CSS animation libraries.",
    "Got stuck in Webpack and Vite configuration hell.",
    "OAuth authentication took longer than the core product.",
    "The founder got distracted by a shiny new AI framework.",
    "Attempted a full rewrite in Rust that never got past main.rs.",
    "Over-engineered a microservice folder architecture for 2 total users.",
    "Spent $50 on a domain name before writing a single line of backend logic.",
    "OpenAI released a native tool that rendered this repo completely useless.",
    "Ran into unresolvable CORS errors for 14 consecutive hours.",
    "Got stuck in tutorial hell prior to the second commit.",
    "Overwhelmed by 48 Breaking Changes after updating Node.js.",
    "Target API required an Enterprise tier for $500/month.",
    "Spent 5 days designing a dark mode toggle instead of core logic.",
    "Realized the database schema was completely flawed on week 3.",
    "Hit a GitHub rate limit during a live pitch demo.",
    "Locked into Docker setup issues on local environment.",
    "Tried to implement custom state management from scratch.",
    "Tailwind CSS classes got too long to maintain.",
    "A breaking npm update destroyed the entire dependency tree.",
    "The sole contributor started a new side project over the weekend.",
    "Spent 12 hours choosing a vector database instead of building UI.",
    "Core feature relied on a deprecated third-party endpoint.",
    "Hit severe memory leaks during local load testing.",
    "Attempted to build a custom auth server instead of using Supabase.",
    "Spent 4 straight days tweaking the landing page hero font.",
    "Confused by TypeScript generic interfaces.",
    "A free competitor launched with 10x better features.",
    "Lost the local .env configuration file during a computer format.",
    "Burnout set in after fixing 32 Merge Conflicts."
  ];

  function getHilariousCause(repoId) {
    return deathCausesList[Math.abs(repoId) % deathCausesList.length];
  }

  // Calculate Zauth Score & Reward
  function calculateZauthScore(repo) {
    let score = 0;
    const stars = repo.stargazers_count || 0;
    const forks = repo.forks_count || 0;
    
    const now = new Date();
    const lastPushed = new Date(repo.pushed_at);
    const monthsInactive = Math.max(0, Math.floor((now - lastPushed) / (1000 * 60 * 60 * 24 * 30)));

    score += Math.min(stars * 2 + forks * 3, 40);
    score += Math.min(repo.size ? Math.floor(repo.size / 100) : 10, 30);
    score += Math.min(monthsInactive * 2.5, 30);

    const finalScore = Math.min(Math.round(score), 100);
    const reward = Math.floor(TOKEN_CONFIG.baseRewardPerBurial * (finalScore / 100));

    return { score: finalScore, reward: reward };
  }

  // Recency Tier Calculator
  function getRecencyTier(pushedAtDate) {
    const now = new Date();
    const diffDays = Math.floor((now - new Date(pushedAtDate)) / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return { tier: 'Alive', badgeClass: 'bg-slime-500/10 border-slime-500/40 text-slime-400', icon: '🧟', isAlive: false };
    } else if (diffDays <= 90) {
      return { tier: 'Fading', badgeClass: 'bg-purple-500/10 border-purple-500/40 text-purple-400', icon: '👻', isAlive: false };
    } else if (diffDays <= 180) {
      return { tier: 'Abandoned', badgeClass: 'bg-amber-500/10 border-amber-500/40 text-amber-400', icon: '🪦', isAlive: false };
    } else if (diffDays <= 365) {
      return { tier: 'Dead', badgeClass: 'bg-blood-500/10 border-blood-500/40 text-blood-500', icon: '💀', isAlive: false };
    } else {
      return { tier: 'Ancient', badgeClass: 'bg-slate-700/30 border-slate-600 text-slate-400', icon: '⚰️', isAlive: false };
    }
  }

  // --- LOCAL REGISTRY HELPERS ---
  function getBuriedRegistry() {
    return JSON.parse(localStorage.getItem('gitgraveyard_buried_repos') || '{}');
  }

  function markRepoAsBuried(repoName, walletAddr) {
    const registry = getBuriedRegistry();
    registry[repoName.toLowerCase()] = { wallet: walletAddr, timestamp: new Date().toISOString() };
    localStorage.setItem('gitgraveyard_buried_repos', JSON.stringify(registry));
  }

  function isRepoAlreadyBuried(repoName) {
    const registry = getBuriedRegistry();
    return !!registry[repoName.toLowerCase()];
  }

  // --- URL & SEARCH HANDLING ---
  const urlParams = new URLSearchParams(window.location.search);
  const initialUser = urlParams.get('user');
  if (initialUser) {
    usernameInput.value = initialUser;
    fetchGithubData(initialUser);
  }

  if (copySiteBtn) {
    copySiteBtn.addEventListener('click', () => {
      const shareUrl = `${TARGET_DOMAIN}?user=${encodeURIComponent(usernameInput.value || '')}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        const originalHTML = copySiteBtn.innerHTML;
        copySiteBtn.innerHTML = `<i class="fa-solid fa-check text-slime-400"></i> Copied!`;
        setTimeout(() => { copySiteBtn.innerHTML = originalHTML; }, 2000);
      });
    });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = usernameInput.value.trim();
      if (username) {
        if (window.location.protocol !== 'file:') {
          const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?user=${encodeURIComponent(username)}`;
          window.history.pushState({ path: newUrl }, '', newUrl);
        }
        fetchGithubData(username);
      }
    });
  }

  async function fetchGithubData(username) {
    showLoadingState();
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed&direction=desc`);
      if (!response.ok) {
        if (response.status === 404) throw new Error('User not found on GitHub.');
        if (response.status === 403) throw new Error('API rate limit exceeded. Try again later.');
        throw new Error('Failed to fetch repositories.');
      }
      const repos = await response.json();
      const originalRepos = repos.filter(repo => !repo.fork);
      if (originalRepos.length === 0) {
        showEmptyState(username);
        return;
      }
      processAndRenderRepos(username, originalRepos);
    } catch (error) {
      showErrorState(error.message);
    } finally {
      resetButtonState();
    }
  }

  function processAndRenderRepos(username, repos) {
    let totalRepos = repos.length;
    let deadOrAncientCount = 0;
    let fadingOrAbandonedCount = 0;

    const processedRepos = repos.map(repo => {
      const statusInfo = getRecencyTier(repo.pushed_at);
      const zauthMetrics = calculateZauthScore(repo);

      if (statusInfo.tier === 'Dead' || statusInfo.tier === 'Ancient') deadOrAncientCount++;
      if (statusInfo.tier === 'Fading' || statusInfo.tier === 'Abandoned') fadingOrAbandonedCount++;

      return {
        id: repo.id,
        name: repo.name,
        owner: username,
        description: repo.description || 'No description provided for this codebase.',
        html_url: repo.html_url,
        created_at: new Date(repo.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        pushed_at: new Date(repo.pushed_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        archived: repo.archived,
        statusInfo: statusInfo,
        zauthScore: zauthMetrics.score,
        tokenReward: zauthMetrics.reward,
        cause: statusInfo.isAlive ? null : getHilariousCause(repo.id)
      };
    });

    const totalDead = deadOrAncientCount + fadingOrAbandonedCount;
    const mortalityRate = totalRepos > 0 ? Math.round((totalDead / totalRepos) * 100) : 0;

    currentGraveyardStats = { total: totalRepos, deadCount: totalDead, mortalityRate };

    if (statTotal) statTotal.textContent = totalRepos;
    if (statDead) statDead.textContent = deadOrAncientCount;
    if (statArchived) statArchived.textContent = fadingOrAbandonedCount;
    if (statScore) statScore.textContent = `${mortalityRate}%`;
    if (statsContainer) statsContainer.classList.remove('hidden');

    if (graveyardHeader) graveyardHeader.classList.remove('hidden');
    if (graveyardTitle) graveyardTitle.textContent = `${username}'s Graveyard`;

    renderEmbarrassingHero(username, processedRepos, totalRepos, totalDead);
    renderTombstones(username, processedRepos);
  }

  function renderEmbarrassingHero(username, repos, total, abandonedCount) {
    if (!heroContainer) return;
    const deadRepos = repos.filter(r => !r.statusInfo.isAlive);
    const mostEmbarrassing = deadRepos.length > 0 ? deadRepos[Math.floor(Math.random() * deadRepos.length)] : null;

    if (!mostEmbarrassing) {
      heroContainer.innerHTML = `
        <div id="hero-card-to-capture" class="bg-grave-900 border border-slime-500/50 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
          <div class="flex items-center justify-between mb-2">
            <div class="scary-font text-2xl text-slime-400 tracking-wider">🧟 ALL SYSTEMS ALIVE</div>
            <div class="text-xs font-mono text-slate-400">@${username}</div>
          </div>
          <p class="text-xs font-mono text-slate-300">This developer has zero dead or abandoned repositories. Total survivalist!</p>
        </div>
      `;
    } else {
      heroContainer.innerHTML = `
        <div id="hero-card-to-capture" class="bg-grave-900 border-2 border-blood-600/60 rounded-2xl p-6 relative overflow-hidden shadow-2xl eerie-glow">
          <div class="flex items-center justify-between mb-4">
            <div class="scary-font text-2xl text-blood-500 tracking-wider">💀 GITHUB GRAVEYARD</div>
            <div class="text-xs font-mono text-slate-400">@${username}</div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5 text-center font-mono text-xs">
            <div class="bg-grave-950 p-2.5 rounded-xl border border-grave-800"><span class="text-white font-bold">${total}</span> <span class="text-slate-500">Repos</span></div>
            <div class="bg-grave-950 p-2.5 rounded-xl border border-grave-800"><span class="text-blood-500 font-bold">${abandonedCount}</span> <span class="text-slate-500">Abandoned</span></div>
            <div class="col-span-2 sm:col-span-1 bg-grave-950 p-2.5 rounded-xl border border-grave-800"><span class="text-amber-400 font-bold">gitgraveyard.xyz</span></div>
          </div>

          <div class="bg-grave-950/80 border border-blood-500/30 rounded-xl p-4 mb-5">
            <div class="text-[10px] font-mono text-blood-500 font-bold tracking-widest uppercase mb-1">🪦 Most Embarrassing Death</div>
            <div class="scary-font text-2xl text-white">${mostEmbarrassing.name}</div>
            <div class="text-xs font-mono text-slate-300 mt-1">Cause of death: <span class="text-blood-500 font-bold">"${mostEmbarrassing.cause}"</span></div>
          </div>

          <div class="flex flex-wrap gap-2">
            <button onclick="downloadCardImage('hero-card-to-capture', '${mostEmbarrassing.name}-Best-Death.png')" class="flex-1 bg-slime-500 hover:bg-slime-400 text-grave-950 font-mono font-bold text-xs py-2.5 px-3 rounded-lg transition flex items-center justify-center gap-1.5 shadow">
              <i class="fa-solid fa-download"></i> Download Image
            </button>
            <button onclick="shareHeroToX('${username}', '${mostEmbarrassing.name}', '${escapeHtml(mostEmbarrassing.cause)}')" class="flex-1 bg-grave-800 hover:bg-grave-700 text-white font-mono text-xs py-2.5 px-3 rounded-lg border border-grave-700 transition flex items-center justify-center gap-1.5">
              <i class="fa-brands fa-x-twitter"></i> Share on X
            </button>
          </div>
        </div>
      `;
    }

    heroContainer.classList.remove('hidden');
  }
  // Render Individual Tombstone Cards
  function renderTombstones(username, repos) {
    if (!reposList) return;
    reposList.innerHTML = '';

    repos.forEach((repo) => {
      const isBuried = isRepoAlreadyBuried(repo.name);
      const card = document.createElement('div');
      card.className = 'tombstone-card bg-grave-900 border border-grave-800 hover:border-grave-700 rounded-2xl p-5 sm:p-6 relative overflow-hidden transition-all duration-300 shadow-xl';

      card.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div class="flex items-start gap-3.5">
            <div class="text-3xl sm:text-4xl shrink-0">${repo.statusInfo.icon}</div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <a href="${repo.html_url}" target="_blank" class="scary-font text-xl text-white hover:text-blood-500 transition">${escapeHtml(repo.name)}</a>
                <span class="border text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${repo.statusInfo.badgeClass}">${repo.statusInfo.tier}</span>
              </div>
              <p class="text-xs font-mono text-slate-400 mt-1 line-clamp-2">${escapeHtml(repo.description)}</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-5 pt-3.5 border-t border-grave-800 text-xs font-mono items-center">
          <div><span class="text-slate-500">Created:</span> <span class="text-slate-300">${repo.created_at}</span></div>
          <div><span class="text-slate-500">Last Commit:</span> <span class="text-slate-300">${repo.pushed_at}</span></div>
          ${repo.statusInfo.isAlive ? `
            <div><span class="text-slate-500">Status:</span> <span class="text-slime-400 font-bold">Alive 🧟</span></div>
          ` : `
            <div class="col-span-1 sm:col-span-3 flex flex-col sm:flex-row items-center justify-between gap-3 mt-2 pt-2 border-t border-grave-800/60">
              <div><span class="text-slate-500">Cause:</span> <span class="text-blood-500 font-bold">"${escapeHtml(repo.cause)}"</span></div>
              <button 
                id="bury-btn-${repo.name}"
                ${isBuried ? 'disabled' : ''}
                onclick="initiateBuryFlow('${escapeHtml(repo.name)}', '${escapeHtml(repo.cause)}',${repo.zauthScore}, ${repo.tokenReward}, '${escapeHtml(repo.owner)}')"
                class="${isBuried ? 'bg-grave-800 text-slate-500 cursor-not-allowed' : 'bg-blood-600 hover:bg-blood-500 text-white shadow-blood-600/30'} font-mono font-bold text-xs px-3.5 py-2 rounded-lg transition flex items-center justify-center gap-1.5 shrink-0">
                ${isBuried ? '⚰️ Already Buried' : '⚰️ Bury On-Chain & Mint'}
              </button>
            </div>
          `}
        </div>
      `;

      reposList.appendChild(card);
    });
  }

  // --- BIO CODE VERIFICATION FLOW ---
  window.initiateBuryFlow = function(repoName, cause, zauthScore, tokenReward, repoOwner) {
    if (isRepoAlreadyBuried(repoName)) {
      alert(`The repository '${repoName}' has already been buried and claimed!`);
      return;
    }

    // Store target data for active session
    currentPendingBuryData = { repoName, cause, zauthScore, tokenReward, repoOwner };

    // Generate unique random verification code
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    activeVerificationCode = `GRAVE-${randomDigits}`;

    // Update Bio Verification Modal UI
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
      if (verifyCodeDisplay) {
        navigator.clipboard.writeText(verifyCodeDisplay.value).then(() => {
          const orig = copyCodeBtn.textContent;
          copyCodeBtn.textContent = 'Copied!';
          setTimeout(() => { copyCodeBtn.textContent = orig; }, 2000);
        });
      }
    });
  }

  // Cancel Verification Modal
  if (cancelVerifyBtn) {
    cancelVerifyBtn.addEventListener('click', () => {
      if (verifyModal) {
        verifyModal.classList.add('hidden');
        verifyModal.classList.remove('flex');
      }
      activeVerificationCode = null;
      currentPendingBuryData = null;
    });
  }

  // Confirm Verification & Verify via GitHub API
  if (confirmVerifyBtn) {
    confirmVerifyBtn.addEventListener('click', async () => {
      if (!currentPendingBuryData || !activeVerificationCode) return;

      const { repoOwner } = currentPendingBuryData;
      confirmVerifyBtn.disabled = true;
      confirmVerifyBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Checking Bio...`;
      if (verifyStatusMsg) verifyStatusMsg.classList.add('hidden');

      try {
        const response = await fetch(`https://api.github.com/users/${repoOwner}`, {
          headers: { 'Accept': 'application/vnd.github.v3+json' }
        });

        if (!response.ok) throw new Error("Could not fetch user profile from GitHub.");

        const userData = await response.json();
        const userBio = (userData.bio || '').trim();

        if (userBio.includes(activeVerificationCode)) {
          // OWNERSHIP VERIFIED!
          if (verifyModal) {
            verifyModal.classList.add('hidden');
            verifyModal.classList.remove('flex');
          }
          await executeOnChainMint(currentPendingBuryData);
        } else {
          // VERIFICATION FAILED
          if (verifyStatusMsg) {
            verifyStatusMsg.textContent = `Verification failed! Code '${activeVerificationCode}' was not found in @${repoOwner}'s bio. Please update your bio and click verify again.`;
            verifyStatusMsg.classList.remove('hidden');
          }
        }
      } catch (err) {
        if (verifyStatusMsg) {
          verifyStatusMsg.textContent = err.message || "Error verifying GitHub bio. Please try again.";
          verifyStatusMsg.classList.remove('hidden');
        }
      } finally {
        confirmVerifyBtn.disabled = false;
        confirmVerifyBtn.innerHTML = `Verify & Mint Tokens`;
      }
    });
  }

  // --- EVM WALLET CONNECT ---
  async function connectEthereumWallet() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        currentWalletAddress = accounts[0];
        return currentWalletAddress;
      } catch (err) {
        console.error("User denied account access", err);
        return null;
      }
    } else {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        const currentUrl = encodeURIComponent(window.location.href);
        window.location.href = `https://metamask.app.link/dapp/${currentUrl.replace(/^https?:\/\//, '')}`;
      } else {
        alert("Please install MetaMask, Rabby, Phantom or an EVM-compatible Web3 wallet!");
      }
      return null;
    }
  }

  // --- EXECUTE ON-CHAIN MINT ---
  async function executeOnChainMint(data) {
    const { repoName, cause, zauthScore, tokenReward, repoOwner } = data;

    // Connect EVM Wallet
    const wallet = await connectEthereumWallet();
    if (!wallet) return;

    const formattedWallet = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

    try {
      // Encode memo payload into Hex for Ethereum transaction data
      const memoPayload = JSON.stringify({
        protocol: "GitHubGraveyard",
        repo: repoName,
        owner: repoOwner,
        score: zauthScore,
        reward: tokenReward
      });
      const hexData = '0x' + Array.from(new TextEncoder().encode(memoPayload))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Send 0 ETH transaction to treasury with embedded payload
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: wallet,
          to: TOKEN_CONFIG.treasuryWallet,
          value: '0x0',
          data: hexData
        }]
      });

      // Mark as claimed locally
      markRepoAsBuried(repoName, wallet);

      // Render Grave Pass Modal
      const isWhale = currentGraveyardStats.mortalityRate >= 50 || currentGraveyardStats.deadCount >= 10;
      
      if (certCardRender) {
        if (isWhale) {
          certCardRender.className = "bg-grave-950 border-2 border-amber-500/80 rounded-xl p-6 text-center relative overflow-hidden my-2 shadow-2xl";
          if (certTierBadge) certTierBadge.textContent = "👑 LEGENDARY WHALE PASS";
        } else {
          certCardRender.className = "bg-grave-950 border-2 border-blood-600/80 rounded-xl p-6 text-center relative overflow-hidden my-2 shadow-inner";
          if (certTierBadge) certTierBadge.textContent = "STANDARD GRAVE PASS";
        }
      }

      if (certSerial) certSerial.textContent = `GRAVE #${Math.floor(100000 + Math.random() * 900000)}`;
      if (certRepoName) certRepoName.textContent = repoName;
      if (certWalletAddr) certWalletAddr.textContent = formattedWallet; // Formatted Wallet Address
      if (certDate) certDate.textContent = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      if (certCause) certCause.textContent = `"${cause}"`;
      if (certZauthScore) certZauthScore.textContent = `${zauthScore}/100`;
      if (certTokenReward) certTokenReward.textContent = `+${tokenReward} ${TOKEN_CONFIG.symbol}`;

      if (certTxLink) certTxLink.href = `https://etherscan.io/tx/${txHash}`;
      if (certTxContainer) certTxContainer.classList.remove('hidden');

      if (certificateModal) {
        certificateModal.classList.remove('hidden');
        certificateModal.classList.add('flex');
      }

      // Update button UI state
      const btn = document.getElementById(`bury-btn-${repoName}`);
      if (btn) {
        btn.disabled = true;
        btn.className = "bg-grave-800 text-slate-500 font-mono font-bold text-xs px-3.5 py-2 rounded-lg cursor-not-allowed";
        btn.textContent = "⚰️ Already Buried";
      }

    } catch (err) {
      console.error("Mint Tx Cancelled or Failed:", err);
    }
  }

  // --- HTML2CANVAS & IMAGE DOWNLOAD ---
  window.downloadCardImage = function(elementId, filename) {
    const element = document.getElementById(elementId);
    if (!element || typeof html2canvas === 'undefined') {
      alert("Image generator library loading... please try again in a moment.");
      return;
    }

    html2canvas(element, {
      backgroundColor: '#090a0f',
      scale: 2,
      useCORS: true
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }).catch(err => {
      console.error("Canvas export failed:", err);
    });
  };

  // --- SOCIAL SHARING ---
  window.shareHeroToX = function(username, repoName, cause) {
    const text = `I just checked my GitHub Graveyard 💀\n\nMy most embarrassing dead project is '${repoName}'\nCause of Death: "${cause}"\n\nBury your dead repos and check your mortality score on @gitgraveyard:`;
    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(`${TARGET_DOMAIN}?user=${username}`)}`;
    window.open(shareUrl, '_blank');
  };

  if (shareCertXBtn) {
    shareCertXBtn.addEventListener('click', () => {
      const repoName = certRepoName ? certRepoName.textContent : 'my project';
      const text = `I officially buried '${repoName}' on-chain on @gitgraveyard ⚰️\n\nClaimed my $GRAVEYARD tokens! Check your GitHub mortality score:`;
      const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(TARGET_DOMAIN)}`;
      window.open(shareUrl, '_blank');
    });
  }

  if (downloadCertImgBtn) {
    downloadCertImgBtn.addEventListener('click', () => {
      const repoName = certRepoName ? certRepoName.textContent : 'GravePass';
      downloadCardImage('certificate-card-render', `${repoName}-GravePass.png`);
    });
  }

  if (closeCertBtn) {
    closeCertBtn.addEventListener('click', () => {
      if (certificateModal) {
        certificateModal.classList.add('hidden');
        certificateModal.classList.remove('flex');
      }
    });
  }

  // UI State Helpers
  function showLoadingState() {
    if (digBtn) {
      digBtn.disabled = true;
      digBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Exhuming...`;
    }
  }

  function resetButtonState() {
    if (digBtn) {
      digBtn.disabled = false;
      digBtn.innerHTML = `<i class="fa-solid fa-skull"></i> Exhume Graveyard`;
    }
  }

  function showEmptyState(username) {
    if (reposList) {
      reposList.innerHTML = `
        <div class="text-center py-12 bg-grave-900/50 border border-grave-800 rounded-2xl">
          <div class="text-4xl mb-3">🧟</div>
          <h3 class="scary-font text-xl text-white">NO ORIGINAL REPOSITORIES FOUND</h3>
          <p class="text-xs font-mono text-slate-400 mt-1">@${username} has no non-forked repositories in their public profile.</p>
        </div>
      `;
    }
    if (graveyardHeader) graveyardHeader.classList.remove('hidden');
    if (heroContainer) heroContainer.classList.add('hidden');
    if (statsContainer) statsContainer.classList.add('hidden');
  }

  function showErrorState(message) {
    if (reposList) {
      reposList.innerHTML = `
        <div class="text-center py-12 bg-grave-900/50 border border-blood-500/30 rounded-2xl">
          <div class="text-4xl mb-3">⚠️</div>
          <h3 class="scary-font text-xl text-blood-500">EXHUMATION FAILED</h3>
          <p class="text-xs font-mono text-slate-400 mt-1">${escapeHtml(message)}</p>
        </div>
      `;
    }
    if (graveyardHeader) graveyardHeader.classList.remove('hidden');
    if (heroContainer) heroContainer.classList.add('hidden');
    if (statsContainer) statsContainer.classList.add('hidden');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
});