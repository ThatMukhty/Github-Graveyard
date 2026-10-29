const causesOfDeath = [
 
  "Died of acute dependency hell: node_modules directory became heavier than a black hole.",
  "Abandoned instantly when the developer discovered a shiny new framework template.",
  "Killed by an unresolvable git merge conflict on a Friday night at 3 AM.",
  "Committed suicide after API keys were accidentally pushed to public GitHub.",
  "Died of loneliness. README.md contained only 'WIP - will finish tomorrow' for 14 months.",
  "Killed by scope creep: started as a simple todo app, ended as a broken microservices cluster.",
  "Died of zero user adoption after 3 months of obsessive localhost testing.",
  "Succumbed to fatal syntax corruption: 404 semi-colons missing across production files.",
  "Died of chronic tutorial addiction: watched 87 hours of courses but never wrote a single original function.",
  "Murdered by a deprecated package that refused to die quietly.",
  "Died of configuration poisoning: .env file contained more secrets than actual code.",
  "Killed by an infinite loading spinner that outlived its creator's motivation.",
  "Died of acute burnout after the developer promised a Friday launch on Monday.",
  "Murdered by a CSS flexbox that refused to center itself.",
  "Died of a fatal version mismatch between Node.js and the developer's patience.",
  "Killed by an unexpected cloud bill before reaching the first 10 users.",
  "Died of terminal velocity after npm install produced 1,247 warnings.",
  "Murdered by a database migration that deleted production data and the developer's will to continue.",
  "Died of chronic overengineering: needed a button, built an event-driven distributed architecture.",
  "Killed by a mysterious CORS error that survived three AI assistants and two all-nighters.",
  "Died of starvation after the API rate limit consumed its entire data supply.",
  "Murdered by a README so empty that even the developer forgot what the project did.",
  "Died of premature optimization before a single user arrived.",
  "Killed by an authentication system that locked its creator out permanently.",
  "Died of chronic imposter syndrome after seeing another developer's portfolio.",
  "Murdered by a package-lock.json conflict that nobody dared to resolve.",
  "Died of fatal feature bloat: the settings page had settings for its own settings.",
  "Killed by a framework migration that turned a weekend project into a six-month archaeological dig.",
  "Died of acute perfectionism: never released because the button radius was still wrong.",
  "Murdered by a failed deployment at 11:59 PM on launch day.",
  "Died of database amnesia after every refresh erased the entire application.",
  "Killed by a forgotten free-tier limit that shut down the backend during its first demo.",
  "Died of chronic placeholder disease: every feature was marked 'coming soon'.",
  "Murdered by a rogue regular expression that consumed the entire validation layer.",
  "Died of severe GitHub Actions failure after the CI pipeline rejected every possible commit.",
  "Killed by an AI-generated codebase nobody understood well enough to debug.",
  "Died of acute JavaScript callback hell before Promises could arrive.",
  "Murdered by a single missing environment variable that brought down the entire system.",
  "Died of memory leakage after an abandoned setInterval kept every component alive.",
  "Killed by a redesign so ambitious that the original working version was deleted.",
  "Died of terminal confusion after running the development server in the wrong directory for six hours.",
  "Murdered by a broken webhook that silently ignored every incoming event.",
  "Died of excessive abstraction: the function that returned true required eleven helper classes.",
  "Killed by a 500 Internal Server Error that refused to reveal its last words.",
  "Died of dependency starvation after the maintainer unpublished the critical package.",
  "Murdered by a Docker container that worked everywhere except the developer's machine.",
  "Died of chronic procrastination while the launch countdown reached its third anniversary.",
  "Killed by an undocumented API change introduced five minutes before deployment.",
  "Died of a fatal merge into main without testing, witnesses, or a backup.",
  "Murdered by an accidental rm -rf that erased six months of undocumented genius.",
  "Died of serverless confusion after deploying a backend that had no idea how to stay alive.",
  "Killed by a broken OAuth callback redirecting every user into an existential loop.",
  "Died of chronic impromptu rewrites: version 12 never made it past the planning stage.",
  "Murdered by a database schema with 46 tables and absolutely no relationships.",
  "Died of severe mobile responsiveness failure after the entire interface escaped the screen.",
  "Killed by a mysterious race condition that disappeared whenever the developer opened DevTools.",
  "Died of API abandonment after the third-party service changed its pricing overnight.",
  "Murdered by an expired SSL certificate during the project's only viral moment.",
  "Died of acute commit-message neglect: the entire Git history read 'fix', 'fix2', and 'final-final'.",
  "Killed by a package manager civil war between npm, Yarn, and pnpm.",
  "Died of chronic fake productivity: spent 40 hours choosing a tech stack and zero hours building.",
  "Murdered by a broken state management system where changing one checkbox crashed the homepage.",
  "Died of fatal authentication overkill: required biometric verification to display a welcome message.",
  "Killed by an infinite redirect loop that trapped every visitor in digital purgatory.",
  "Died of a missing semicolon in a legacy file nobody had touched since 2019.",
  "Murdered by a frontend-backend treaty violation: both sides expected the other to handle validation.",
  "Died of chronic abandoned branches: 38 feature branches and not one finished release.",
  "Killed by an overconfident refactor that replaced working code with philosophical improvements.",
  "Died of acute deployment anxiety: the developer refused to press the production button.",
  "Murdered by a broken DNS record that sent visitors into the void.",
  "Died of fatal cache corruption: users kept seeing a website that no longer existed.",
  "Killed by a 12 MB hero image that loaded slower than the developer's career progression.",
  "Died of severe testing neglect: the first real user became the entire QA department.",
  "Murdered by a forgotten trial subscription that devoured the project's remaining budget.",
  "Died of chronic empty-state syndrome: the dashboard looked incredible with data nobody had.",
  "Killed by an undocumented legacy function named doStuff() that controlled everything.",
  "Died of acute framework hopping after switching stacks for the fifth time in one month.",
  "Murdered by a production database accidentally pointed at the local development environment.",
  "Died of fatal merge paralysis: three developers disagreed over a variable name for two weeks.",
  "Killed by a security audit that discovered the admin password was 'password123'.",
  "Died of chronic demo-itis: worked perfectly when presented, collapsed immediately afterward.",
  "Murdered by a rogue CSS z-index that buried the entire navigation behind the footer.",
  "Died of API key withdrawal after the only developer with access deleted their account.",
  "Killed by a stale browser compatibility issue that refused to respect modern JavaScript.",
  "Died of fatal abstraction leakage: every simple change required edits across 27 files.",
  "Murdered by an abandoned authentication library whose last update predates the current decade.",
  "Died of acute server-log denial: the errors were visible, but nobody wanted to read them.",
  "Killed by a failed payment integration before the first customer could pay.",
  "Died of chronic localhost delusion: the developer believed the internet was just another port.",
  "Murdered by a corrupted Git repository after the only backup was stored inside the repository.",
  "Died of fatal UI inconsistency: every page looked like it belonged to a different startup.",
  "Killed by an overcomplicated smart contract that required a PhD to mint a memorial.",
  "Died of blockchain gas fees after the memorial cost more to preserve than the project was worth.",
  "Murdered by a wallet connection flow that rejected every wallet except the developer's own.",
  "Died of a failed testnet migration after the entire community moved to a different chain.",
  "Killed by a tokenomics spreadsheet that had more utility than the actual product.",
  "Died of chronic airdrop farming expectations: everyone wanted rewards, nobody wanted to use the app.",
  "Murdered by a smart contract deployed to the wrong network with no upgrade path.",
  "Died of acute founder distraction after discovering a newer, shinier idea on X.",
  "Killed by a launch tweet that received three likes, two of which came from the founder.",
  "Died of chronic feature-request poisoning: every stranger became the product manager.",
  "Murdered by a forgotten TODO comment that became the entire technical roadmap.",
  "Died peacefully after the developer finally admitted that the idea was better than the implementation."

];
function getCauseOfDeath(repoName) {
    let hash = 0;
    for (let i = 0; i < repoName.length; i++) {
        hash = repoName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % causesOfDeath.length;
    return causesOfDeath[index];
}

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

    // CHECK IF WE ALREADY HAVE A SAVED SESSION IN BROWSER STORAGE
    const savedRepos = localStorage.getItem('graveyard_cached_repos');
    const savedUser = localStorage.getItem('graveyard_cached_user');

    if (savedRepos && savedUser) {
        userRepos = JSON.parse(savedRepos);
        const userData = JSON.parse(savedUser);

        // Hide hero, show dashboard instantly without needing GitHub code again!
        document.getElementById('heroSection').classList.add('hidden');
        document.getElementById('dashboardSection').classList.remove('hidden');

        if (authContainer) {
            authContainer.innerHTML = `
                <div class="flex items-center gap-2 bg-red-950/40 border border-red-800 px-3 py-1 rounded">
                    <span class="w-2 h-2 rounded-full bg-graveyard-red animate-pulse"></span>
                    <span class="text-xs text-white font-bold uppercase">@${userData.login}</span>
                </div>
            `;
        }

        document.getElementById('userAvatar').src = userData.avatar_url;
        document.getElementById('userName').innerText = userData.name || userData.login;
        document.getElementById('userHandle').innerText = "@" + userData.login;

        renderGraveyard(userRepos);
    } else if (authContainer) {
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
        await authenticateAndFetchData(code);
    }
});

async function authenticateAndFetchData(code) {

try {

const heroBtn = document.querySelector('#heroSection button');

if (heroBtn) {

heroBtn.innerText = "AUTHENTICATING & SCANNING... ⌛";

heroBtn.disabled = true;

}


let data;
try {
    const res = await fetch(`/api/auth?code=${code}`);
    const textResponse = await res.text();
    
    // Check if Vercel returned an HTML error page instead of JSON
    if (textResponse.includes("FUNCTION_INVOCATION_FAILED") || textResponse.includes("<!DOCTYPE html>")) {
        throw new Error("Vercel API Function failed to execute.");
    }
    
    data = JSON.parse(textResponse);
} catch (parseErr) {
    console.error("Authentication & Scan error:", parseErr);
    alert("Authentication failed because the serverless route crashed.");
    return;
}

if (!data || data.error) {
    alert("Authentication failed: " + (data?.error || "Unable to verify"));
    return;
}



const userData = data.user;

const reposData = data.repos;


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

const cause = getCauseOfDeath(repo.name);


return {

name: repo.name,

daysInactive: diffDays,

stars: repo.stargazers_count,

fork: repo.fork,

causeOfDeath: cause

};

}).filter(repo => !repo.fork);
localStorage.setItem('graveyard_cached_repos', JSON.stringify(userRepos));
localStorage.setItem('graveyard_cached_user', JSON.stringify(userData));

renderGraveyard(userRepos);


} catch (err) {

console.error("Authentication & Scan error:", err);

alert("Failed to authenticate with GitHub. Please try again.");

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

    // Strict weighted calculation for the giveaway
    let totalDecayScore = 0;
    repos.forEach(repo => {
        if (repo.daysInactive >= 365) totalDecayScore += 100;     // 1+ year dead
        else if (repo.daysInactive >= 180) totalDecayScore += 80;  // 6+ months dead
        else if (repo.daysInactive >= 90) totalDecayScore += 50;   // 3+ months dead
        else if (repo.daysInactive >= 30) totalDecayScore += 10;   // Just crossed 30 days (10%)
    });

    const mortality = repos.length > 0 ? Math.round(totalDecayScore / repos.length) : 0;
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

provider = window.phantom?.ethereum || (window.ethereum?.isPhantom ? window.ethereum : null);

} else if (['metamask', 'rabby', 'coinbase', 'walletconnect'].includes(walletType)) {

provider = window.ethereum;

}


const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);


// REPLACEMENT 1: Removed window.location.href redirects to stop session wipes
if (!provider && isMobile) {
    document.getElementById('walletStatus').innerHTML = `Please open <b>gitgraveyard.xyz</b> inside your ${walletType.toUpperCase()} app's browser to connect safely!`;
    return;
}


if (!provider) {

document.getElementById('walletStatus').innerText = `Please open inside ${walletType.toUpperCase()} app or install extension.`;

return;

}


// Request wallet connection

const accounts = await provider.request({ method: 'eth_requestAccounts' });

if (accounts && accounts.length > 0) {

connectedWalletAddress = accounts[0];

const maskedAddr = `${connectedWalletAddress.substring(0, 6)}...${connectedWalletAddress.substring(38)}`;

document.getElementById('walletStatus').innerText = `Connected: ${maskedAddr}`;

closeWalletModal();

renderGraveyard(userRepos);


// ON-CHAIN BURIAL / MINTING TRANSACTION

if (activeMintRepo) {

document.getElementById('walletStatus').innerText = `Burying '${activeMintRepo}' on-chain... 🪦`;

// REPLACEMENT 2: Updated transaction handling structure to prevent blank execution
const transactionParameters = {
    to: 'YOUR_DEPLOYED_CONTRACT_ADDRESS', 
    from: connectedWalletAddress,
    value: '0x0', 
    data: '0x' // Ensure you replace this with your encoded mint function bytecode or use an ethers.js contract instance
};


try {

// This pops up MetaMask/Phantom/Rabby to approve the actual burial transaction

const txHash = await provider.request({

method: 'eth_sendTransaction',

params: [transactionParameters],

});

alert(`Repository '${activeMintRepo}' successfully buried on-chain! 🪦⛓️\nTx Hash: ${txHash}`);

} catch (txErr) {

console.error("Transaction rejected:", txErr);

alert("On-chain burial transaction was cancelled or failed.");

}

}

}


} catch (err) {

console.error('Wallet error:', err);

document.getElementById('walletStatus').innerText = 'Connection failed or rejected.';

}

};