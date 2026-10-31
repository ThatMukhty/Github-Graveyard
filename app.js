import { ethers } from 'https://esm.sh/ethers@6.13.5';

// 1. Reown AppKit Configuration with Phantom, MetaMask, Trust, Coinbase, Zerion support
const projectId = 'your_reown_project_id_here'; // Replace with your actual Reown Cloud Project ID

const metadata = {
    name: 'GitGraveyard',
    description: 'Eternal Rest for Dead Code & On-Chain Tombs',
    url: 'https://gitgraveyard.xyz',
    icons: ['https://gitgraveyard.xyz/favicon.ico']
};

// Initialize AppKit via global UMD bundle
let modal = null;
try {
    const { createAppKit } = window.AppKit || {};
    // Fallback adapter setup if using standard web3modal configurations
    modal = createAppKit ? createAppKit({
        projectId,
        metadata,
        networks: [
            { id: 1, name: 'Ethereum', currency: 'ETH', explorerUrl: 'https://etherscan.io', rpcUrl: 'https://cloudflare-eth.com' },
            { id: 11155111, name: 'Sepolia', currency: 'ETH', explorerUrl: 'https://sepolia.etherscan.io', rpcUrl: 'https://rpc.sepolia.org' }
        ],
        features: { analytics: true }
    }) : null;
} catch (e) {
    console.error('AppKit initialization warning:', e);
}

// 100 Deterministic Causes of Death
const CAUSES_OF_DEATH = [
    "Devoured by an untamed node_modules black hole.",
    "Crushed under the weight of 4,000 transitive sub-dependencies.",
    "Fatal dependency conflict: peerDependency demanded blood.",
    "Mummified by a deprecated npm package with 12 open CVEs.",
    "Murdered by a breaking change in a patch update (v1.0.1 -> v1.0.2).",
    "Suffocated inside a circular dependency loop.",
    "Abandoned after left-pad was deleted from existence again.",
    "Poisoned by a rogue malicious package update at 3:00 AM.",
    "Slain by an unresolvable yarn.lock merge conflict.",
    "Frozen in time due to an unupgradable Node.js runtime version.",
    "Bled to death by npm audit reporting 84 high-severity vulnerabilities.",
    "Erased when the underlying API deprecated v1 without documentation.",
    "Entombed by a missing peer dependency that no longer exists on GitHub.",
    "Poisoned by a broken peer-dependency graph on clean install.",
    "Strangulated by an infinite loop inside package-lock.json.",
    "Disintegrated after a global npm update broke local native bindings.",
    "Smothered under a pile of unmaintained Python 2.7 syntax.",
    "Starved to death when the central repository registry went read-only.",
    "Executed by a breaking TypeScript compiler update (tsc strict null check).",
    "Crushed under the weight of an uncompressed 2GB bundle build.",
    "The creator said 'I'll rewrite this in Rust next weekend' and never returned.",
    "Left in a dark corner after the hackathon ended at Sunday midnight.",
    "Abandoned when the developer discovered a shiny new framework on X/Twitter.",
    "Drowned in a sea of 142 unread GitHub notification emails.",
    "Poisoned by scope creep before reaching v0.1.0-alpha.",
    "Sacrificed to the gods of 'Will finish this during holiday break.'",
    "Died of terminal procrastination after creating the initial README.md.",
    "Buried under a mountain of half-written TODO comments.",
    "Vanished after the solo maintainer accepted a full-time Web3 job.",
    "Murdered by the phrase: 'This will only take two hours to finish.'",
    "Entombed when the developer forgot what the codebase actually does.",
    "Died of heartbreak after getting 0 stars in 365 consecutive days.",
    "Strangled by side-project fatigue and unpaid AWS bills.",
    "Lost in the void after the developer changed their local SSH keys.",
    "Crushed by the realization that someone else launched the exact same app on Product Hunt.",
    "Starved when the developer ran out of energy after setting up Tailwind.",
    "Sacrificed during a mid-life career change away from frontend development.",
    "Left to decay after the initial deployment domain expired.",
    "Abandoned following an unhandled rage-quit git reset.",
    "Slain by the sudden realization that the business model was legally impossible.",
    "Vaporized by an out-of-gas transaction on Mainnet.",
    "Drowned in gas fees during the NFT peak frenzy.",
    "Trapped inside an unhandled smart contract reentrancy bug.",
    "Sentenced to eternal purgatory by an unconfirmed transaction with 1 gwei gas price.",
    "Poisoned by a leaked private key hardcoded in config.js on commit #2.",
    "Frozen forever inside a non-upgradeable proxy contract.",
    "Crushed by a hard fork that rendered the RPC nodes incompatible.",
    "Devoured by a MEV sandwich bot before the transaction hit the mempool.",
    "Starved when the testnet faucet ran dry of Goerli/Sepolia ETH.",
    "Lost in the ether after sending tokens to address 0x000...dead.",
    "Slain by an unhandled Web3 provider disconnection during a state transfer.",
    "Execution halted forever by an invalid ABI interface signature.",
    "Buried under a 10,000 block reorg on a dead Layer-2 sidechain.",
    "Vaporized by an unverified smart contract source code mismatch.",
    "Disintegrated after the IPFS gateway node went offline permanently.",
    "Suffocated when the wallet provider updated its EIP-1193 RPC specs.",
    "Poisoned by an integer overflow on an un-audited Solidity contract.",
    "Smothered by an infinite loop inside an EVM assembly CALL instruction.",
    "Executed after setting slippage to 100% on a illiquid DEX pair.",
    "Entombed in block #18,492,011 with zero remaining confirmations.",
    "Executed by a failing GitHub Actions pipeline on step run: npm test.",
    "Smothered by FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory.",
    "Crushed when Docker container ran out of disk space on the build server.",
    "Vaporized by an aggressive git push --force to the main branch.",
    "Poisoned by SIGKILL from an out-of-memory cloud runner.",
    "Trapped inside an infinite loop in a pre-commit husky git hook.",
    "Executed by an accidental rm -rf / in a bash deployment script.",
    "Mummified by an expired SSL/TLS certificate that nobody renewed.",
    "Suffocated by an invalid .env variable missing in production environment.",
    "Murdered by Uncaught SyntaxError: Unexpected token '<' on vendor bundle.",
    "Entombed inside a broken .gitignore that uploaded node_modules to production.",
    "Slain by an unhandled CORS error when fetching from backend origin.",
    "Crushed under a broken Webpack config file with 800 lines of regex.",
    "Erased during a server migration when someone forgot to back up the Postgres DB.",
    "Frozen by a deadlock in the production database pool connections.",
    "Drowned in server logs after turning on DEBUG=* in production.",
    "Executed by a rogue cron job that wiped the staging storage bucket.",
    "Disintegrated after a cloud provider region went down for 48 hours straight.",
    "Poisoned by mixed content errors (http asset requested on https host).",
    "Buried under a broken NGINX reverse proxy configuration error (502 Bad Gateway).",
    "Slain by premature optimization before the MVP was even functional.",
    "Suffocated under an overly complex microservice architecture for a todo app.",
    "Crushed by 15 layers of abstract factory pattern design interfaces.",
    "Murdered by a 4,000-line monolithic index.js file with zero comments.",
    "Entombed when the database schema was modified directly in production.",
    "Poisoned by an unhandled Promise rejection that crashed the process silent.",
    "Vaporized during a total rewrite from React to Vue to Svelte to SolidJS.",
    "Trapped in callback hell 12 levels deep without async/await.",
    "Smothered by a 10GB sqlite file checked directly into git history.",
    "Executed when the founder pivoted the startup to an AI wrapper app.",
    "Mummified because the original author left zero documentation or onboarding guides.",
    "Slain by a race condition that only triggers on production hardware.",
    "Drowned under a mountain of copy-pasted Stack Overflow snippets from 2014.",
    "Disintegrated when the client refused to pay the final 30% milestone invoice.",
    "Erased after being marked as duplicate issue #1 and closed by stale bot.",
    "Starved because the backend service required 128GB of RAM to boot up.",
    "Sacrificed during a company acquisition where all active repos were archived.",
    "Poisoned by a hardcoded localhost:8080 API endpoint URL in production code.",
    "Smothered by a custom state manager created to replace Redux.",
    "Entombed in the GitHub Arctic Code Vault to rot peacefully for the next 1,000 years."
];

let globalRepos = [];
let userToken = null;

// Handle OAuth token in URL
const urlParams = new URLSearchParams(window.location.search);
const tokenParam = urlParams.get('token');
if (tokenParam) {
    localStorage.setItem('github_token', tokenParam);
    window.history.replaceState({}, document.title, window.location.pathname);
    userToken = tokenParam;
} else {
    userToken = localStorage.getItem('github_token');
}

document.getElementById('github-auth-btn').addEventListener('click', () => {
    window.location.href = '/api/auth/github';
});

document.getElementById('wallet-connect-btn').addEventListener('click', async () => {
    if (modal && modal.open) {
        await modal.open();
    } else {
        alert('Wallet connection modal is loading or unavailable.');
    }
});

// Strict Deterministic Cause Selector using Hash
function getDeterministicCause(repoName) {
    let hash = 0;
    for (let i = 0; i < repoName.length; i++) {
        hash = repoName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % CAUSES_OF_DEATH.length;
    return CAUSES_OF_DEATH[index];
}

// Strict Precision Float Mortality Score Calculation
function calculateMortalityScore(daysInactive, openIssues, forks) {
    let baseScore = Math.min(100, (daysInactive / 365) * 70);
    let issuePenalty = Math.min(20, openIssues * 0.5);
    let forkBonus = Math.max(-10, -forks * 0.2);
    let total = baseScore + issuePenalty + forkBonus;
    return Math.max(0, Math.min(100, total)).toFixed(2);
}

// Fetch user repos if token exists
async function initApp() {
    if (!userToken) return;

    document.getElementById('hero-landing').style.display = 'none';
    document.getElementById('github-auth-btn').textContent = 'Linked to GitHub';
    document.getElementById('github-auth-btn').disabled = true;

    try {
        const res = await axios.get('/api/repos', {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        globalRepos = res.data;
        processAndRenderDashboard(globalRepos);
        renderRepos(globalRepos, 'all');
    } catch (err) {
        console.error('Failed to load repositories', err);
        localStorage.removeItem('github_token');
        alert('Session expired or invalid token. Please reconnect GitHub.');
        location.reload();
    }
}

function processAndRenderDashboard(repos) {
    const now = new Date();
    let total = repos.length;
    let deadCount = 0;
    let riskCount = 0;
    let cumulativeMortality = 0;

    repos.forEach(repo => {
        const lastActivity = new Date(repo.pushed_at || repo.updated_at);
        const daysInactive = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
        const score = parseFloat(calculateMortalityScore(daysInactive, repo.open_issues_count || 0, repo.forks_count || 0));
        cumulativeMortality += score;

        if (daysInactive >= 90) deadCount++;
        else if (daysInactive >= 30) riskCount++;
    });

    const avgMortality = total > 0 ? (cumulativeMortality / total).toFixed(2) : '0.00';

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-dead').textContent = deadCount;
    document.getElementById('stat-risk').textContent = riskCount;
    document.getElementById('stat-mortality').textContent = `${avgMortality}%`;

    document.getElementById('dashboard-stats').style.display = 'grid';
    document.getElementById('filter-bar').style.display = 'flex';
}

function renderRepos(repos, filter) {
    const grid = document.getElementById('repo-grid');
    grid.innerHTML = '';

    const now = new Date();

    repos.forEach(repo => {
        const lastActivity = new Date(repo.pushed_at || repo.updated_at);
        const daysInactive = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
        const mortalityScore = calculateMortalityScore(daysInactive, repo.open_issues_count || 0, repo.forks_count || 0);
        
        let status = 'alive';
        let stageName = 'Living Code';
        if (daysInactive >= 90) {
            status = 'dead';
            stageName = daysInactive > 365 ? 'Stage III: Entombed Rest' : (daysInactive > 180 ? 'Stage II: Decay & Moss' : 'Stage I: Dormant Spirit');
        } else if (daysInactive >= 30) {
            status = 'risk';
            stageName = 'At Risk (Fading)';
        }

        if (filter !== 'all' && filter !== status) return;

        const causeOfDeath = status === 'dead' ? getDeterministicCause(repo.name) : null;
        
        // Twitter Share text
        const tweetText = status === 'dead' 
            ? encodeURIComponent(`My repo @${repo.name} has officially died after ${daysInactive} days of silence. Mortality Score: ${mortalityScore}%. Cause of death: "${causeOfDeath}" Buried at gitgraveyard.xyz #GitGraveyard #Web3`)
            : encodeURIComponent(`Checking code mortality for @${repo.name} on GitGraveyard (Score: ${mortalityScore}%). gitgraveyard.xyz`);

        const card = document.createElement('div');
        card.className = 'tomb-card';
        card.innerHTML = `
            <div>
                <div class="tomb-header">
                    <span class="repo-name">${repo.name}</span>
                    <span class="mortality-badge ${status === 'dead' ? 'dead' : ''}">${mortalityScore}% Mortality</span>
                </div>
                <div class="tomb-body">
                    <p>${repo.description || 'No description provided.'}</p>
                    <p style="margin-top: 0.5rem; font-size: 0.75rem; color: #737373;">Stage: <strong>${stageName}</strong></p>
                    <p style="font-size: 0.75rem; color: #737373;">Last pushed: ${lastActivity.toISOString().split('T')[0]} (${daysInactive}d ago)</p>
                    ${causeOfDeath ? `<div class="cause-box"><strong>Cause of Death:</strong> ${causeOfDeath}</div>` : ''}
                </div>
            </div>
            <div class="tomb-footer">
                <a href="https://twitter.com/intent/tweet?text=${tweetText}" target="_blank" class="card-action-btn">Tweet X</a>
                <button class="card-action-btn" onclick="downloadMemorialCard('${repo.name}', '${mortalityScore}', '${stageName}', '${daysInactive}d', '${causeOfDeath || 'N/A'}')">Card PNG</button>
                ${status === 'dead' ? `<button class="card-action-btn primary" onclick="mintTombstoneNFT('${repo.id}', '${repo.name}')">Mint NFT</button>` : ''}
            </div>
        `;
        grid.appendChild(card);
    });
}

// Filter Tab Handlers
document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        renderRepos(globalRepos, e.target.getAttribute('data-filter'));
    });
});

// Download Memorial Card as PNG
window.downloadMemorialCard = function(name, score, stage, inactiveDays, cause) {
    const canvas = document.getElementById('memorial-canvas');
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer border
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Header Title
    ctx.fillStyle = '#f5f5f5';
    ctx.font = 'bold 36px Cinzel, serif';
    ctx.fillText('GIT_GRAVEYARD MEMORIAL', 70, 90);

    ctx.fillStyle = '#a3a3a3';
    ctx.font = '20px "JetBrains Mono", monospace';
    ctx.fillText('gitgraveyard.xyz', canvas.width - 280, 90);

    // Repo Name
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 48px Cinzel, serif';
    ctx.fillText(name, 70, 180);

    // Metrics
    ctx.fillStyle = '#f5f5f5';
    ctx.font = '24px "JetBrains Mono", monospace';
    ctx.fillText(`Mortality Score: ${score}%`, 70, 240);
    ctx.fillText(`Stage: ${stage}`, 70, 280);
    ctx.fillText(`Inactivity: ${inactiveDays}`, 70, 320);

    // Cause of Death box
    ctx.fillStyle = '#121212';
    ctx.fillRect(70, 370, canvas.width - 140, 150);
    ctx.strokeStyle = '#262626';
    ctx.strokeRect(70, 370, canvas.width - 140, 150);

    ctx.fillStyle = '#fca5a5';
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.fillText('CAUSE OF DEATH:', 100, 410);

    ctx.fillStyle = '#f5f5f5';
    ctx.font = '18px "JetBrains Mono", monospace';
    
    // Word wrap helper for canvas
    let words = cause.split(' ');
    let line = '';
    let y = 450;
    for(let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > canvas.width - 200 && n > 0) {
            ctx.fillText(line, 100, y);
            line = words[n] + ' ';
            y += 30;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, 100, y);

    // Trigger download
    const link = document.createElement('a');
    link.download = `${name}-tombstone.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
};

// Mint NFT Function using Phantom / WalletProvider & Ethers.js
window.mintTombstoneNFT = async function(repoId, repoName) {
    try {
        let walletProvider = null;
        if (modal && modal.getWalletProvider) {
            walletProvider = modal.getWalletProvider();
        } else if (window.ethereum) {
            walletProvider = window.ethereum;
        }

        if (!walletProvider) {
            alert('Please connect your Ethereum wallet first using the Connect Wallet button.');
            if (modal) await modal.open();
            return;
        }

        const provider = new ethers.BrowserProvider(walletProvider);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        alert(`Ready to mint tombstone NFT for "${repoName}" from verified address ${address} on connected network.`);
    } catch (err) {
        console.error('Minting error:', err);
        alert('Wallet connection or transaction aborted.');
    }
};

initApp();