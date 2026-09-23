/**
 * GitHub Graveyard - Full Production Script
 */

document.addEventListener('DOMContentLoaded', () => {
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

  // Hero Section
  const heroContainer = document.getElementById('embarrassing-hero-container');

  // Graveyard List Elements
  const graveyardHeader = document.getElementById('graveyard-header');
  const graveyardTitle = document.getElementById('graveyard-title');
  const reposList = document.getElementById('repos-list');

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
  const certStatusTag = document.getElementById('cert-status-tag');
  const downloadCertImgBtn = document.getElementById('download-cert-img-btn');
  const shareCertXBtn = document.getElementById('share-cert-x-btn');

  let currentGraveyardStats = { total: 0, deadCount: 0, mortalityRate: 0 };

  // Hilarious Dev Causes of Death
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

  // 5-Tier Recency Calculator
  function getRecencyTier(pushedAtDate) {
    const now = new Date();
    const diffDays = Math.floor((now - new Date(pushedAtDate)) / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return { tier: 'Alive', badgeClass: 'bg-slime-500/10 border-slime-500/40 text-slime-400', icon: '🧟', isAlive: true };
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

  // Check URL Query Parameters
  const urlParams = new URLSearchParams(window.location.search);
  const initialUser = urlParams.get('user');
  if (initialUser) {
    usernameInput.value = initialUser;
    fetchGithubData(initialUser);
  }

  // Copy Main Site Share Link
  if (copySiteBtn) {
    copySiteBtn.addEventListener('click', () => {
      const shareUrl = window.location.protocol === 'file:' 
        ? window.location.href 
        : `${window.location.origin}${window.location.pathname}?user=${encodeURIComponent(usernameInput.value || '')}`;
      
      navigator.clipboard.writeText(shareUrl).then(() => {
        const originalHTML = copySiteBtn.innerHTML;
        copySiteBtn.innerHTML = `<i class="fa-solid fa-check text-slime-400"></i> Copied!`;
        setTimeout(() => { copySiteBtn.innerHTML = originalHTML; }, 2000);
      });
    });
  }

  // Search Form Submission
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

  async function fetchGithubData(username) {
    showLoadingState();
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed&direction=desc`);
      if (!response.ok) {
        if (response.status === 404) throw new Error('User not found on GitHub.');
        if (response.status === 403) throw new Error('API rate limit exceeded. Try again in a few minutes.');
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
      if (statusInfo.tier === 'Dead' || statusInfo.tier === 'Ancient') deadOrAncientCount++;
      if (statusInfo.tier === 'Fading' || statusInfo.tier === 'Abandoned') fadingOrAbandonedCount++;

      return {
        id: repo.id,
        name: repo.name,
        description: repo.description || 'No description provided for this codebase.',
        html_url: repo.html_url,
        created_at: new Date(repo.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        pushed_at: new Date(repo.pushed_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        archived: repo.archived,
        statusInfo: statusInfo,
        cause: statusInfo.isAlive ? null : getHilariousCause(repo.id)
      };
    });

    const totalDead = deadOrAncientCount + fadingOrAbandonedCount;
    const mortalityRate = totalRepos > 0 ? Math.round((totalDead / totalRepos) * 100) : 0;

    currentGraveyardStats = { total: totalRepos, deadCount: totalDead, mortalityRate };

    statTotal.textContent = totalRepos;
    statDead.textContent = deadOrAncientCount;
    statArchived.textContent = fadingOrAbandonedCount;
    statScore.textContent = `${mortalityRate}%`;
    statsContainer.classList.remove('hidden');

    graveyardHeader.classList.remove('hidden');
    graveyardTitle.textContent = `${username}'s Graveyard`;

    renderEmbarrassingHero(username, processedRepos, totalRepos, totalDead);
    renderTombstones(username, processedRepos);
  }

  function renderEmbarrassingHero(username, repos, total, abandonedCount) {
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
            <div class="col-span-2 sm:col-span-1 bg-grave-950 p-2.5 rounded-xl border border-grave-800"><span class="text-amber-400 font-bold">githubgraveyard.xyz</span></div>
          </div>

          <div class="bg-grave-950/80 border border-blood-500/30 rounded-xl p-4 mb-5">
            <div class="text-[10px] font-mono text-blood-500 font-bold tracking-widest uppercase mb-1">🪦 Most Embarrassing Death</div>
            <div class="scary-font text-2xl text-white">${mostEmbarrassing.name}</div>
            <div class="text-xs font-mono text-slate-300 mt-1">Cause of death: <span class="text-blood-500 font-bold">"${mostEmbarrassing.cause}"</span></div>
          </div>

          <div class="flex flex-wrap gap-2">
            <button onclick="downloadHeroCardImage()" class="flex-1 bg-slime-500 hover:bg-slime-400 text-grave-950 font-mono font-bold text-xs py-2.5 px-3 rounded-lg transition flex items-center justify-center gap-1.5 shadow">
              <i class="fa-solid fa-download"></i> Download Best Death Image
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

  function renderTombstones(username, repos) {
    reposList.innerHTML = '';
    const highlightedRepo = urlParams.get('repo');

    repos.forEach((repo) => {
      const cardGraveyardUrl = window.location.protocol === 'file:' 
        ? window.location.href 
        : `${window.location.protocol}//${window.location.host}${window.location.pathname}?user=${encodeURIComponent(username)}&repo=${encodeURIComponent(repo.name)}`;
      
      const shareMsg = repo.statusInfo.isAlive 
        ? `Checked out '${repo.name}' on GitHub Graveyard 🧟\nStatus: Alive & Active\n\n${cardGraveyardUrl}`
        : `I exhumed '${repo.name}' on GitHub Graveyard 💀\nStatus: ${repo.statusInfo.tier} ${repo.statusInfo.icon}\nCause: "${repo.cause}"\n\n${cardGraveyardUrl}`;
      
      const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMsg)}`;

      const card = document.createElement('div');
      card.id = `repo-card-${repo.name}`;
      
      const isTargeted = highlightedRepo && highlightedRepo.toLowerCase() === repo.name.toLowerCase();
      const baseClasses = 'tombstone-card bg-grave-900 border border-grave-800 rounded-2xl p-5 sm:p-6 relative overflow-hidden transition-all duration-300 animate-pvz-rise';
      card.className = isTargeted ? `${baseClasses} ring-2 ring-blood-500` : baseClasses;

      card.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div class="flex items-start gap-3.5">
            <div class="text-3xl sm:text-4xl shrink-0 floating-ghost">${repo.statusInfo.icon}</div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <a href="${repo.html_url}" target="_blank" class="scary-font text-xl sm:text-2xl text-white hover:text-blood-500 transition tracking-wide">
                  ${repo.name}
                </a>
                <span class="border text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${repo.statusInfo.badgeClass}">
                  ${repo.statusInfo.tier}
                </span>
                ${repo.archived ? `<span class="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-mono px-2 py-0.5 rounded">Archived</span>` : ''}
              </div>
              <p class="text-xs text-slate-400 mt-1 line-clamp-2">${escapeHtml(repo.description)}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2 shrink-0 self-end md:self-start">
            <a 
              href="${xShareUrl}" 
              target="_blank"
              class="bg-grave-800 hover:bg-grave-700 text-white font-mono text-xs px-3 py-2 rounded-lg border border-grave-700 transition flex items-center gap-1.5">
              <i class="fa-brands fa-x-twitter"></i> Share
            </a>
            <button 
              onclick="copyCardLink('${escapeHtml(cardGraveyardUrl)}', this)"
              class="bg-grave-800 hover:bg-grave-700 text-slate-300 font-mono text-xs px-3 py-2 rounded-lg border border-grave-700 transition flex items-center gap-1.5">
              <i class="fa-solid fa-copy"></i> Copy Link
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-5 pt-3.5 border-t border-grave-800 text-xs font-mono items-center">
          <div><span class="text-slate-500">Created:</span> <span class="text-slate-300">${repo.created_at}</span></div>
          <div><span class="text-slate-500">Last Commit:</span> <span class="text-slate-300">${repo.pushed_at}</span></div>
          
          ${repo.statusInfo.isAlive ? `
            <div><span class="text-slate-500">Status:</span> <span class="text-slime-400 font-bold">Currently Breathing 🧟</span></div>
          ` : `
            <div class="col-span-1 sm:col-span-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2 pt-2 border-t border-grave-800/60">
              <div><span class="text-slate-500">Cause of Death:</span> <span class="text-blood-500 font-bold">"${repo.cause}"</span></div>
              <button 
                onclick="buryOnChain('${escapeHtml(repo.name)}', '${escapeHtml(repo.cause)}')"
                class="bg-blood-600 hover:bg-blood-500 text-white font-mono font-bold text-xs px-3.5 py-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow shadow-blood-600/30 shrink-0">
                ⚰️ Bury On-Chain & Mint
              </button>
            </div>
          `}
        </div>
      `;

      reposList.appendChild(card);
    });

    if (highlightedRepo) {
      const el = document.getElementById(`repo-card-${highlightedRepo}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // SOLANA MAINNET ON-CHAIN BURY & MINT
  window.buryOnChain = async function(repoName, cause) {
    try {
      const provider = window.solana || window.solflare;
      if (!provider) {
        alert("Please install Phantom or Solflare wallet extension to mint your on-chain memorial!");
        return;
      }

      const resp = await provider.connect();
      const pubKey = resp.publicKey;
      const fullAddr = pubKey.toString();
      const walletAddressTruncated = `${fullAddr.slice(0, 4)}...${fullAddr.slice(-4)}`;

      const isWhale = currentGraveyardStats.mortalityRate >= 50 || currentGraveyardStats.deadCount >= 10;
      const tierTitle = isWhale ? "LEGENDARY WHALE GRAVE" : "STANDARD GRAVE";

      if (isWhale) {
        certCardRender.className = "bg-grave-950 border-2 border-gold-500 rounded-xl p-6 text-center relative overflow-hidden my-2 shadow-2xl shadow-gold-500/10";
        certTierBadge.className = "absolute top-2 right-3 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded uppercase tracking-widest bg-gold-500/20 text-gold-400 border border-gold-500";
        certTierBadge.textContent = "👑 LEGENDARY WHALE PASS";
      } else {
        certCardRender.className = "bg-grave-950 border-2 border-blood-600 rounded-xl p-6 text-center relative overflow-hidden my-2 shadow-inner";
        certTierBadge.className = "absolute top-2 right-3 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded uppercase tracking-widest bg-blood-600/20 text-blood-500 border border-blood-500";
        certTierBadge.textContent = "STANDARD GRAVE PASS";
      }

      const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'), 'confirmed');
      const memoProgramId = new solanaWeb3.PublicKey('MemoSouls1111111111111111111111111111111111');
      
      const payload = JSON.stringify({
        protocol: "GitHubGraveyard",
        tier: tierTitle,
        repo: repoName,
        cause: cause,
        date: "2026-09-21"
      });

      const instruction = new solanaWeb3.TransactionInstruction({
        keys: [{ pubkey: pubKey, isSigner: true, isWritable: true }],
        programId: memoProgramId,
        data: new TextEncoder().encode(payload)
      });

      const transaction = new solanaWeb3.Transaction().add(instruction);
      transaction.feePayer = pubKey;
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTransaction = await provider.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signedTransaction.serialize());
const serialNum = `#${Math.floor(100000 + Math.random() * 900000)}`;
      certSerial.textContent = `GRAVE ${serialNum}`;
      certRepoName.textContent = repoName;
      certWalletAddr.textContent = walletAddressTruncated;
      certDate.textContent = "September 21, 2026";
      certCause.textContent = `"${cause}"`;

      certTxLink.href = `https://solscan.io/tx/${txid}`;
      certTxContainer.classList.remove('hidden');
      certStatusTag.textContent = "MINTED ON-CHAIN ⚰️";
      certStatusTag.className = "inline-block bg-slime-500/20 border border-slime-500 text-slime-400 text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-widest";

      certificateModal.classList.remove('hidden');
      certificateModal.classList.add('flex');

    } catch (err) {
      console.error("On-Chain Mint Error/Cancellation:", err);
      if (err.message && err.message.includes("User rejected")) {
        alert("Transaction cancelled. You can mint your grave on-chain whenever you're ready!");
      } else {
        certSerial.textContent = `#${Math.floor(100000 + Math.random() * 900000)}`;
        certRepoName.textContent = repoName;
        certWalletAddr.textContent = "Web3 Dev";
        certDate.textContent = "September 21, 2026";
        certCause.textContent = `"${cause}"`;
        certTxContainer.classList.add('hidden');

        certificateModal.classList.remove('hidden');
        certificateModal.classList.add('flex');
      }
    }
  };

  // Close Modal
  if (closeCertBtn) {
    closeCertBtn.addEventListener('click', () => {
      certificateModal.classList.add('hidden');
      certificateModal.classList.remove('flex');
    });
  }

  // Download Certificate PNG
  if (downloadCertImgBtn) {
    downloadCertImgBtn.addEventListener('click', () => {
      html2canvas(certCardRender, { backgroundColor: '#07080c' }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${certRepoName.textContent}-OnChain-Memorial.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    });
  }

  // Download Hero Card PNG Image
  window.downloadHeroCardImage = function() {
    const element = document.getElementById('hero-card-to-capture');
    html2canvas(element, { backgroundColor: '#0f111a' }).then(canvas => {
      const link = document.createElement('a');
      link.download = `GitHub-Graveyard-Best-Death.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  // Share Summary Card to X
  window.shareHeroToX = function(username, repoName, cause) {
    const text = `💀 GITHUB GRAVEYARD SUMMARY for @${username}\n\nMost Embarrassing Death: '${repoName}'\nCause: "${cause}"\n\nGive your dead code a proper funeral at githubgraveyard.xyz 🪦`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Share Mint Certificate on X
  if (shareCertXBtn) {
    shareCertXBtn.addEventListener('click', () => {
      const text = `⚰️ OFFICIAL ON-CHAIN GRAVE CERTIFICATE\n\nRepo: '${certRepoName.textContent}'\n${certSerial.textContent}\nCause of Death: ${certCause.textContent}\n\nBury your dead code on-chain at githubgraveyard.xyz 💀`;
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    });
  }

  // Helper Utilities
  function showLoadingState() {
    digBtn.disabled = true;
    digBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Exhuming...`;
    reposList.innerHTML = `
      <div class="text-center py-12 bg-grave-900/50 border border-grave-800 rounded-2xl">
        <div class="text-5xl mb-3 floating-ghost">🧟</div>
        <div class="text-xs font-mono text-slate-400">Digging through GitHub archives...</div>
      </div>
    `;
  }

  function resetButtonState() {
    digBtn.disabled = false;
    digBtn.innerHTML = `<i class="fa-solid fa-skull"></i> Exhuming Dead Repos`;
  }

  function showEmptyState(username) {
    statsContainer.classList.add('hidden');
    heroContainer.classList.add('hidden');
    graveyardHeader.classList.add('hidden');
    reposList.innerHTML = `
      <div class="text-center py-12 bg-grave-900/50 border border-grave-800 rounded-2xl">
        <div class="text-4xl mb-3">👻</div>
        <div class="text-sm font-mono font-bold text-white">No original repositories found</div>
        <div class="text-xs font-mono text-slate-500 mt-1">${username} has no public non-fork repositories.</div>
      </div>
    `;
  }

  function showErrorState(message) {
    statsContainer.classList.add('hidden');
    heroContainer.classList.add('hidden');
    graveyardHeader.classList.add('hidden');
    reposList.innerHTML = `
      <div class="text-center py-12 bg-grave-900/50 border border-blood-500/30 rounded-2xl">
        <div class="text-4xl mb-3">⚠️</div>
        <div class="text-sm font-mono font-bold text-blood-500">${message}</div>
      </div>
    `;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  window.copyCardLink = function(url, btn) {
    navigator.clipboard.writeText(url).then(() => {
      const originalHTML = btn.innerHTML;
      btn.innerHTML = `<i class="fa-solid fa-check text-slime-400"></i> Copied!`;
      setTimeout(() => { btn.innerHTML = originalHTML; }, 2000);
    });
  };
});