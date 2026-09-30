/**
 * GITHUB GRAVEYARD — APPLICATION CONTROLLER
 * Main orchestration layer for search triggers, verification workflows, and modal UI rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Element References
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('repo-search-input');
    const scanBtn = document.getElementById('scan-btn');
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    const walletModal = document.getElementById('wallet-modal');
    const certificateModal = document.getElementById('certificate-modal');

    // Global Active State
    let activeRepoData = null;
    let activeMetrics = null;

    /* ==========================================================================
       1. REPOSITORY SEARCH & SCAN EVENT HANDLERS
       ========================================================================== */
    if (searchForm) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const query = searchInput.value;
            const parsed = window.GraveyardScanner.parseRepoInput(query);

            if (!parsed) {
                alert('Please enter a valid GitHub repository in "owner/repo" or URL format.');
                return;
            }

            // UI State: Reset & Start Scanning Animation
            scanBtn.disabled = true;
            scanBtn.innerText = 'Scanning...';
            window.GraveyardRadar.show();

            try {
                const repoData = await window.GraveyardScanner.scanRepository(parsed.owner, parsed.repo);
                
                const daysInactive = window.GraveyardScanner.calculateDaysInactive(repoData.pushed_at);
                const tier = window.GraveyardScanner.getMortalityTier(daysInactive);
                const mortalityScore = window.GraveyardScanner.calculateMortalityScore(daysInactive);
                const reward = window.GraveyardScanner.calculateTokenReward(daysInactive, tier.canBury);

                activeRepoData = repoData;
                activeMetrics = { daysInactive, tier, mortalityScore, reward };

                // Render Card Result
                window.GraveyardScanner.renderRepoCard(repoData, activeMetrics);
            } catch (err) {
                alert(`Scan Failed: ${err.message}`);
            } finally {
                scanBtn.disabled = false;
                scanBtn.innerText = 'Scan Repository';
                window.GraveyardRadar.hide();
            }
        });
    }

    /* ==========================================================================
       2. BURIAL PROCESS & CERTIFICATE MODAL
       ========================================================================== */
    document.addEventListener('click', async (e) => {
        // Handle "Bury Repo" Button Click
        if (e.target && e.target.closest('#bury-repo-btn')) {
            const walletState = window.GraveyardWallet.getState();

            if (!walletState.address) {
                alert('Please connect a Web3 wallet before burying a repository.');
                if (walletModal) walletModal.classList.remove('hidden');
                return;
            }

            try {
                // Generate Sign Message Payload
                const signMsg = `Confirming burial of repository ${activeRepoData.full_name} on GitHub Graveyard.\nTimestamp: ${Date.now()}`;
                const signatureObj = await window.GraveyardWallet.signMessage(signMsg);

                if (signatureObj) {
                    showCertificateModal(activeRepoData, activeMetrics, signatureObj.address);
                }
            } catch (err) {
                console.error('Burial Verification Error:', err);
            }
        }

        // Close Certificate Modal
        if (e.target && e.target.classList.contains('modal-close-trigger')) {
            if (certificateModal) certificateModal.classList.add('hidden');
        }
    });

    /* ==========================================================================
       3. WALLET CONNECTION MODAL CONTROLS
       ========================================================================== */
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', () => {
            const walletState = window.GraveyardWallet.getState();
            if (walletState.address) {
                if (confirm('Disconnect active wallet?')) {
                    window.GraveyardWallet.disconnect();
                }
            } else if (walletModal) {
                walletModal.classList.remove('hidden');
            }
        });
    }

    const connectEvmBtn = document.getElementById('connect-evm-btn');
    const connectSolanaBtn = document.getElementById('connect-solana-btn');

    if (connectEvmBtn) {
        connectEvmBtn.addEventListener('click', async () => {
            try {
                await window.GraveyardWallet.connectEVM();
                if (walletModal) walletModal.classList.add('hidden');
            } catch (err) {
                alert(err.message);
            }
        });
    }

    if (connectSolanaBtn) {
        connectSolanaBtn.addEventListener('click', async () => {
            try {
                await window.GraveyardWallet.connectSolana();
                if (walletModal) walletModal.classList.add('hidden');
            } catch (err) {
                alert(err.message);
            }
        });
    }

    /* ==========================================================================
       4. CERTIFICATE MODAL RENDER FUNCTION
       ========================================================================== */
    function showCertificateModal(repo, metrics, walletAddr) {
        if (!certificateModal) return;

        const passSerial = `GRAVE-${Math.floor(100000 + Math.random() * 900000)}`;
        const passRepoName = document.getElementById('pass-repo-name');
        const passSerialEl = document.getElementById('pass-serial');
        const passDaysEl = document.getElementById('pass-days');
        const passScoreEl = document.getElementById('pass-score');
        const passTokensEl = document.getElementById('pass-tokens');
        const passWalletEl = document.getElementById('pass-wallet');

        if (passRepoName) passRepoName.innerText = repo.full_name;
        if (passSerialEl) passSerialEl.innerText = passSerial;
        if (passDaysEl) passDaysEl.innerText = `${metrics.daysInactive} Days`;
        if (passScoreEl) passScoreEl.innerText = `${metrics.mortalityScore}/100`;
        if (passTokensEl) passTokensEl.innerText = `${metrics.reward} $GRAVEYARD`;
        if (passWalletEl) passWalletEl.innerText = window.GraveyardWallet.formatAddress(walletAddr);

        certificateModal.classList.remove('hidden');
    }
});