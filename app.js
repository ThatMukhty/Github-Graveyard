// ============================================================
// GITHUB GRAVEYARD — PRODUCTION APP LOGIC
// Real On-Chain Minting & Strict GitHub Bio Verification
// ============================================================

const CONFIG = {
  GITHUB_API_BASE: 'https://api.github.com',
  TOKEN_BASE_REWARD: 100,
  // ------------------------------------------------------------
  // PASTE YOUR LIVE CONTRACT ADDRESS (CA) HERE
  // ------------------------------------------------------------
  CONTRACT_ADDRESS: 'YOUR_LIVE_CA_HERE',
  CHAIN_ID: '0xaa36a7', // Sepolia Testnet Hex ('0x1' for Mainnet)
  MORTALITY_DAYS: {
    ALIVE: 30,
    FADING: 90,
    ABANDONED: 180,
    DEAD: 365
  }
};

// Standard ERC-20 + Mint Function ABI
const CONTRACT_ABI = [
  "function mintBurialReward(address to, string calldata repoName, uint256 amount) external",
  "function isRepoBuried(string calldata repoName) external view returns (bool)",
  "function balanceOf(address account) external view returns (uint256)"
];

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

// --- WEB3 WALLET CONNECTION ---
if (connectWalletNavBtn) {
  connectWalletNavBtn.addEventListener('click', () => {
    if (connectedWalletAddress) {
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

window.connectSelectedWallet = async function(walletType) {
  let provider = null;

  try {
    if (walletType === 'phantom') {
      if (window.phantom && window.phantom.ethereum) {
        provider = window.phantom.ethereum;
      } else if (window.phantom && window.phantom.solana) {
        provider = window.phantom.solana;
      }
    } else if (walletType === 'metamask' || walletType === 'robinhood' || walletType === 'coinbase') {
      if (window.ethereum) {
        provider = window.ethereum;
      }
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
      } else if (walletType === 'coinbase') {
        window.location.href = `https://go.cb-w.com/dapp?cb_url=${currentUrl}`;
        return;
      }
    }

    if (!provider) {
      alert(`Please install or open ${walletType.toUpperCase()} wallet to continue.`);
      return;
    }

    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    if (accounts && accounts.length > 0) {
      connectedWalletAddress = accounts[0];
      
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: CONFIG.CHAIN_ID }],
        });
      } catch (switchError) {
        console.warn('Chain switch error or user rejected switch:', switchError);
      }

      updateWalletUI(connectedWalletAddress);
      
      if (walletModal) {
        walletModal.classList.add('hidden');
        walletModal.classList.remove('flex');
      }
    }
  } catch (err) {
    console.error('Wallet connection error:', err);
    alert('Failed to connect wallet: ' + err.message);
  }
};

function updateWalletUI(address) {
  const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
  connectWalletLabel.textContent = shortAddress;
  connectWalletNavBtn.classList.replace('bg-blood-600', 'bg-slime-500/20');
  connectWalletNavBtn.classList.replace('text-white', 'text-slime-400');
}

// --- EXECUTE ON-CHAIN MINT TRANSACTION ---
async function executeOnChainMint({ repoName, cause, zauthScore, tokenReward, walletAddress }) {
  if (!CONFIG.CONTRACT_ADDRESS || CONFIG.CONTRACT_ADDRESS === 'YOUR_LIVE_CA_HERE') {
    alert('Please insert your deployed Smart Contract Address (CA) into app.js before minting!');
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const rewardWei = ethers.parseUnits(tokenReward.toString(), 18);

    // Wallet popup triggers here
    const tx = await contract.mintBurialReward(walletAddress, repoName, rewardWei);
    
    alert(`Transaction submitted! Hash: ${tx.hash}\nWaiting for block confirmation...`);
    await tx.wait();

    markRepoAsBuried(repoName);
    showCertificateModal({ repoName, cause, zauthScore, tokenReward, walletAddress });
    renderDashboard(fetchedRepos);

  } catch (err) {
    console.error('On-chain minting error:', err);
    alert('Minting failed or transaction rejected: ' + (err.reason || err.message));
  }
}