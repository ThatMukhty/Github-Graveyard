/**
 * GITHUB GRAVEYARD — MAIN APPLICATION CONTROLLER
 * Full feature suite: Scan routing, Exhumation execution, Bio-verification, 
 * Multi-wallet connection, Download card PNG, Copy link, and Toast UI.
 */

// Application State
let state = {
    activeRepoData: null,
    isScanning: false,
    isExhuming: false
};

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

/**
 * Initialize Event Listeners & Core Handlers
 */
function initApp() {
    // 1. Scan Form & Button Handling
    const scanForm = document.getElementById('scan-form');
    const scanBtn = document.getElementById('scan-btn');
    const repoInput = document.getElementById('repo-input');

    if (scanForm) {
        scanForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleScan();
        });
    } else if (scanBtn) {
        scanBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleScan();
        });
    }

    if (repoInput) {
        repoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleScan();
            }
        });
    }

    // 2. Global Wallet Connect Button Listener
    const walletConnectBtn = document.getElementById('connect-wallet-btn');
    if (walletConnectBtn) {
        walletConnectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openWalletModal();
        });
    }

    // 3. Modal Close Triggers
    document.querySelectorAll('.modal-close, .close-modal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllModals();
        });
    });

    // 4. Wallet Provider Selection in Modal

document.querySelectorAll('.wallet-select-btn, .wallet-option-btn').forEach(btn => {

btn.addEventListener('click', async (e) => {

e.preventDefault();

const walletType = btn.dataset.wallet;

if (walletType) {

await connectWalletProvider(walletType);

}

});

});

   // 5. Global Event Delegation

document.addEventListener('click', handleGlobalClickEvents);


// 6. Auto-reopen verification modal if returning from editing GitHub bio on mobile

const pending = localStorage.getItem('pending_verification');

if (pending) {

try {

const data = JSON.parse(pending);

if (data.walletAddress) {

openBioModal(data.walletAddress);

}

} catch (e) {

localStorage.removeItem('pending_verification');

}

}

}

/**
 * Handles Repository Scanning
 */
async function handleScan() {
    if (state.isScanning) return;

    const input = document.getElementById('repo-input')?.value;
    const container = document.getElementById('results-container');

    const parsed = window.GraveyardScanner.parseRepoInput(input);
    if (!parsed) {
        showToast("Please enter a valid GitHub repository URL or owner/repo format.", "error");
        return;
    }

    state.isScanning = true;
    if (container) {
        container.innerHTML = `
            <div class="loader-container" style="text-align: center; padding: 3rem 1rem;">
                <p style="color: #8b949e; font-size: 1rem;">Scanning graveyard records for <strong>${parsed.owner}/${parsed.repo}</strong>...</p>
            </div>
        `;
    }
try {
  const repoData = await window.GraveyardScanner.scanRepository(
    parsed.owner,
    parsed.repo
  );
  state.activeRepoData = repoData; // Save state globally

  renderCardFromData(repoData);
  showToast(`Successfully scanned ${repoData.full_name}`, 'success');

  // Trigger Bio Verification immediately after scanning
  openBioModal(state.activeRepoData.owner?.login);
} catch (err) {
  if (container) {
    container.innerHTML = `
<div class="error-card glass-card" style="padding: 2rem; text-align: center; border: 1px solid #ff5555; background: rgba(255,85,85,0.05); border-radius: 12px; margin-top: 1.5rem;">
<h3 style="color: #ff5555; margin-top: 0;">Scan Failed</h3>
<p style="color: #c9d1d9;">${err.message}</p>
</div>
`;
  }
  showToast(err.message, 'error');
} finally {
  state.isScanning = false;
}
        if (container) {
            container.innerHTML = `
                <div class="error-card glass-card" style="padding: 2rem; text-align: center; border: 1px solid #ff5555; background: rgba(255,85,85,0.05); border-radius: 12px; margin-top: 1.5rem;">
                    <h3 style="color: #ff5555; margin-top: 0;">Scan Failed</h3>
                    <p style="color: #c9d1d9;">${err.message}</p>
                </div>
            `;
        }
        showToast(err.message, "error");
    } finally {
        state.isScanning = false;
    }
}

/**
 * Computes Metrics & Calls Scanner Card Render
 */
function renderCardFromData(repoData) {
    const daysInactive = window.GraveyardScanner.calculateDaysInactive(repoData.pushed_at);
    const tier = window.GraveyardScanner.getMortalityTier(daysInactive);
    const mortalityScore = window.GraveyardScanner.calculateMortalityScore(daysInactive);
    const reward = window.GraveyardScanner.calculateTokenReward(daysInactive, tier.canBury);

    const metrics = { daysInactive, tier, mortalityScore, reward };
    window.GraveyardScanner.renderRepoCard(repoData, metrics);
}

/**
 * Handles Global Clicks (Delegation for Exhumation, Burial, Downloads, Shares, Copy Links)
 */
async function handleGlobalClickEvents(e) {
    // A. EXHUME BUTTON CLICK
    const exhumeBtn = e.target.closest('#exhume-repo-btn');
    if (exhumeBtn) {
        e.preventDefault();
        e.stopPropagation();
        await executeExhumation(exhumeBtn);
        return;
    }

    // B. BURY BUTTON CLICK
    const buryBtn = e.target.closest('#bury-repo-btn');
    if (buryBtn) {
        e.preventDefault();
        e.stopPropagation();
        await handleBuryClick();
        return;
    }

    // C. COPY SHARE LINK BUTTON
    const copyLinkBtn = e.target.closest('#copy-share-link-btn');
    if (copyLinkBtn) {
        e.preventDefault();
        navigator.clipboard.writeText(window.location.href);
        showToast("Direct link copied to clipboard!", "success");
        return;
    }

    // D. DOWNLOAD CARD IMAGE BUTTON
    const downloadCardBtn = e.target.closest('#download-card-btn');
    if (downloadCardBtn) {
        e.preventDefault();
        if (window.html2canvas) {
            const cardElem = document.getElementById('graveyard-card');
            if (cardElem) {
                showToast("Generating card screenshot...", "info");
                window.html2canvas(cardElem, { backgroundColor: '#0d1117' }).then(canvas => {
                    const link = document.createElement('a');
                    link.download = `${state.activeRepoData?.name || 'graveyard'}-certificate.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    showToast("Download started!", "success");
                });
            }
        } else {
            window.print();
        }
        return;
    }

    // E. COPY VERIFICATION BIO CODE
    const copyBioBtn = e.target.closest('#copy-bio-code-btn');
    if (copyBioBtn) {
        e.preventDefault();
        const codeText = document.getElementById('bio-code-text')?.innerText;
        if (codeText) {
            navigator.clipboard.writeText(codeText);
            showToast("Verification code copied to clipboard!", "success");
        }
        return;
    }
// F. VERIFY BIO & CONFIRM BURIAL

const verifyBioBtn = e.target.closest('#verify-bio-btn, #verify-bio-modal-btn');

if (verifyBioBtn) {

e.preventDefault();

await executeBioVerification();

return;

}
}

/**
 * Execute Exhumation Logic Safely
 */
async function executeExhumation(exhumeBtn) {
    if (state.isExhuming) return;

    let owner = state.activeRepoData?.owner?.login;
    let repo = state.activeRepoData?.name;

    if (!owner || !repo) {
        const input = document.getElementById('repo-input')?.value;
        const parsed = window.GraveyardScanner.parseRepoInput(input);
        if (parsed) {
            owner = parsed.owner;
            repo = parsed.repo;
        }
    }

    if (!owner || !repo) {
        showToast("No active repository loaded to exhume.", "error");
        return;
    }

    state.isExhuming = true;
    const originalContent = exhumeBtn.innerHTML;
    exhumeBtn.innerHTML = `⚡ Verifying GitHub...`;
    exhumeBtn.style.pointerEvents = "none";
    exhumeBtn.style.opacity = "0.7";

    try {
        const result = await window.GraveyardScanner.exhumeRepo(owner, repo);

       if (result.success) {
      showToast(result.message, 'success');
      state.activeRepoData = result.repoData;
      renderCardFromData(result.repoData);

      // Prompt Wallet Connection after repo is exhumed
      openWalletModal();
    } else {
            showToast(result.message, "info");
            exhumeBtn.innerHTML = originalContent;
            exhumeBtn.style.pointerEvents = "auto";
            exhumeBtn.style.opacity = "1";
        }
    } catch (err) {
        showToast(err.message, "error");
        exhumeBtn.innerHTML = originalContent;
        exhumeBtn.style.pointerEvents = "auto";
        exhumeBtn.style.opacity = "1";
    } finally {
        state.isExhuming = false;
    }
}

/**
 * Handle Burial Step & Prompt Wallet / Verification Modals
 */
async function handleBuryClick() {

    if (!state.activeRepoData) {
        showToast("Please scan a repository first.", "error");
        return;
    }

    // Check module state first
    let walletState = window.GraveyardWallet ? window.GraveyardWallet.getState() : null;
    let activeAddress = walletState?.address;

    // Fallback: If wallet state isn't synced yet, check if window.ethereum has connected accounts
    if (!activeAddress && window.ethereum && window.ethereum.selectedAddress) {
        activeAddress = window.ethereum.selectedAddress;
    }

    // If still no address, pop the wallet modal so the user can select their wallet
    if (!activeAddress) {
        showToast("Please select and connect your Web3 wallet.", "info");
        openWalletModal();
        return;
    }

    // Address is verified -> Proceed to bio verification modal
    openBioModal(activeAddress);
}

/**
 * Verifies Bio Code on GitHub Profile
 */
async function executeBioVerification() {
    const walletState = window.GraveyardWallet ? window.GraveyardWallet.getState() : null;
    const githubUsernameInput = document.getElementById('github-username-input')?.value;

    if (!githubUsernameInput) {
        showToast("Please enter your GitHub username.", "error");
        return;
    }

    if (!walletState || !walletState.address) {
        showToast("Wallet is not connected.", "error");
        return;
    }

    const verifyBtn = document.getElementById('verify-bio-btn');
    if (verifyBtn) {
        verifyBtn.innerText = "Verifying Profile...";
        verifyBtn.disabled = true;
    }

    try {
        const res = await window.GraveyardScanner.verifyRepoOwnership(githubUsernameInput.trim(), walletState.address);
if (res.verified) {
            showToast('GitHub Ownership Verified!', 'success');
            closeAllModals();

            // Programmatically trigger Exhumation step
            const exhumeBtn = document.getElementById('exhume-repo-btn') || document.createElement('button');
            await executeExhumation(exhumeBtn);
        }
    } else 
            showToast(`Verification code '${res.expectedCode}' not found in GitHub bio.`, "error");
        }
    } catch (err) {
        showToast(err.message, "error");
    } finally {
        if (verifyBtn) {
            verifyBtn.innerText = "Verify Bio & Complete Burial";
            verifyBtn.disabled = false;
        }
    }
}

// Duplicate handleBuryClick removed
/**
 * Modal Helpers
 */
function openBioModal(walletAddress) {
    const modal = document.getElementById('bio-modal');
    const codeDisplay = document.getElementById('bio-code-text');
    const usernameInput = document.getElementById('github-username-input');

    // Extract repo owner as default username if available
    if (usernameInput && !usernameInput.value && state.activeRepoData) {
        usernameInput.value = state.activeRepoData.owner?.login || '';
    }

    const updateCodeDisplay = () => {
        if (!walletAddress) return;
        const username = (usernameInput?.value.trim() || 'USERNAME').toUpperCase();
        const walletEnd = walletAddress.slice(-4).toUpperCase();
        const code = `GRAVEYARD-${username}-${walletEnd}`;
        if (codeDisplay) codeDisplay.innerText = code;
    };

    updateCodeDisplay();

    if (usernameInput && !usernameInput.dataset.hasBioListener) {
        usernameInput.addEventListener('input', updateCodeDisplay);
        usernameInput.dataset.hasBioListener = 'true';
    }

    if (walletAddress) {
        localStorage.setItem('pending_verification', JSON.stringify({
            walletAddress,
            repo: state.activeRepoData?.full_name || ''
        }));
    }

    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
}
function closeAllModals() {

localStorage.removeItem('pending_verification');

document.querySelectorAll('.modal-overlay, .modal, .modal-backdrop, #wallet-modal, #bio-modal').forEach(modal => {

modal.style.display = 'none';

modal.classList.add('hidden');

});

}
/**
 * Custom Toast Notifications
 */
function showToast(message, type = "info") {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    const bgColor = type === 'error' ? '#ff5555' : type === 'success' ? '#50fa7b' : '#8be9fd';

    toast.style.cssText = `
        background: ${bgColor};
        color: #0d1117;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: bold;
        font-size: 0.9rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(10px);
    `;
    toast.innerText = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
/**
 * Modal Helper Functions
 */
function openWalletModal() {
    const walletModal = document.getElementById('wallet-modal');
    if (walletModal) {
        walletModal.classList.remove('hidden');
        walletModal.style.display = 'flex';
    } else {
        console.error("wallet-modal element not found in HTML.");
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal, #wallet-modal, #bio-modal');
    modals.forEach(modal => {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    });
}
/**
 * Handles wallet provider selection & connection logic
 */
async function connectWalletProvider(walletType) {
    try {
        if (!window.GraveyardWallet) {
            throw new Error("GraveyardWallet module is not loaded.");
        }

        const connectFn = window.GraveyardWallet.connectWallet || window.GraveyardWallet.connect;
        const res = await connectFn(walletType);

        // Retrieve connected address from state or window.ethereum/window.phantom
        const connectedAddress = res?.address || window.ethereum?.selectedAddress || window.phantom?.solana?.publicKey?.toString();
if (connectedAddress) {
        const formatted = window.GraveyardWallet.formatAddress
          ? window.GraveyardWallet.formatAddress(connectedAddress)
          : `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(
              -4
            )}`;
        showToast(`Connected: ${formatted}`, 'success');
        closeAllModals();

        // Final step: Sign burial / claim message after wallet is connected
        const msg = `Confirm Burial of ${
          state.activeRepoData?.full_name || 'repo'
        } for Wallet: ${connectedAddress}`;
        if (window.GraveyardWallet && window.GraveyardWallet.signMessage) {
          await window.GraveyardWallet.signMessage(msg);
        }
      } else {
            showToast("Wallet connection succeeded but no address was returned.", "error");
        }

    } catch (err) {
        showToast(`Connection failed: ${err.message}`, "error");
    }
}