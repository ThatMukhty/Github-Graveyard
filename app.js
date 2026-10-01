/**
 * GITHUB GRAVEYARD — APPLICATION CONTROLLER
 */

document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       0. MOBILE RESPONSIVE LAYOUT PATCH
       ========================================================================== */
    const styleFix = document.createElement('style');
    styleFix.innerHTML = `
        @media (max-width: 640px) {
            .search-box-wrapper, .search-input-group {
                flex-direction: column !important;
                width: 100% !important;
                gap: 0.5rem !important;
            }
            .input-prefix {
                display: none !important;
            }
            #repo-input {
                width: 100% !important;
                border-radius: 8px !important;
                font-size: 0.9rem !important;
                padding: 0.75rem !important;
            }
            #scan-btn {
                width: 100% !important;
                border-radius: 8px !important;
                justify-content: center !important;
            }
            header .header-container {
                flex-direction: column !important;
                gap: 0.75rem !important;
                align-items: center !important;
            }
            .wallet-controls, #connect-wallet-btn {
                width: 100% !important;
                justify-content: center !important;
            }
            .modal-content {
                width: 92% !important;
                padding: 1.25rem !important;
            }
            .repo-metrics-grid, .pass-stats-grid {
                grid-template-columns: 1fr 1fr !important;
                gap: 0.5rem !important;
            }
        }
    `;
    document.head.appendChild(styleFix);

    if (!window.html2canvas) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        document.head.appendChild(script);
    }

    /* ==========================================================================
       1. GLOBAL STATE & ELEMENT REFERENCES
       ========================================================================== */
    const searchInput = document.getElementById('repo-input');
    const scanBtn = document.getElementById('scan-btn');
    const walletModal = document.getElementById('wallet-modal');
    const certificateModal = document.getElementById('certificate-modal');

    let activeRepoData = null;
    let activeMetrics = null;

    /* ==========================================================================
       2. WALLET MODAL TOGGLE HELPER
       ========================================================================== */
    function toggleWalletModal(show = true) {
        if (!walletModal) return;

        if (show) {
            walletModal.classList.remove('hidden');
            walletModal.style.display = 'flex';
        } else {
            walletModal.classList.add('hidden');
            walletModal.style.display = 'none';
        }
    }

    /* ==========================================================================
       3. REPOSITORY SCAN HANDLER
       ========================================================================== */
    if (scanBtn) {
        scanBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!searchInput) return;

            const query = searchInput.value;
            const parsed = window.GraveyardScanner ? window.GraveyardScanner.parseRepoInput(query) : null;

            if (!parsed) {
                alert('Please enter a valid GitHub repository (e.g., owner/repo or full URL).');
                return;
            }

            scanBtn.disabled = true;
            const originalText = scanBtn.innerText;
            scanBtn.innerText = 'Scanning...';

            try {
                const repoData = await window.GraveyardScanner.scanRepository(parsed.owner, parsed.repo);
                const daysInactive = window.GraveyardScanner.calculateDaysInactive(repoData.pushed_at);
                const tier = window.GraveyardScanner.getMortalityTier(daysInactive);
                const mortalityScore = window.GraveyardScanner.calculateMortalityScore(daysInactive);
                const reward = window.GraveyardScanner.calculateTokenReward(daysInactive, tier.canBury);

                activeRepoData = repoData;
                activeMetrics = { daysInactive, tier, mortalityScore, reward };

                window.GraveyardScanner.renderRepoCard(repoData, activeMetrics);
            } catch (err) {
                alert(`Scan Failed: ${err.message}`);
            } finally {
                scanBtn.disabled = false;
                scanBtn.innerText = originalText;
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && scanBtn) {
                scanBtn.click();
            }
        });
    }

    /* ==========================================================================
       4. GLOBAL CLICK ROUTING (WALLETS, BURIAL, MODALS, DOWNLOADS)
       ========================================================================== */
    document.addEventListener('click', async (e) => {
        // Trigger Wallet Modal
        if (e.target && (e.target.closest('#connect-wallet-btn') || e.target.closest('#connect-wallet-trigger-btn'))) {
            e.preventDefault();
            const walletState = window.GraveyardWallet ? window.GraveyardWallet.getState() : { address: null };

            if (walletState.address) {
                if (confirm(`Connected: ${walletState.address}\n\nDo you want to disconnect?`)) {
                    if (window.GraveyardWallet) window.GraveyardWallet.disconnect();
                    if (activeRepoData && activeMetrics) {
                        window.GraveyardScanner.renderRepoCard(activeRepoData, activeMetrics);
                    }
                }
            } else {
                toggleWalletModal(true);
            }
        }

        // Wallet Selection (Robinhood, Coinbase, Trust, MetaMask, Phantom, Fomo)
        const walletOptionBtn = e.target.closest('.wallet-select-btn');
        if (walletOptionBtn) {
            const walletType = walletOptionBtn.getAttribute('data-wallet');
            try {
                await window.GraveyardWallet.connectWallet(walletType);
                toggleWalletModal(false);
                if (activeRepoData && activeMetrics) {
                    window.GraveyardScanner.renderRepoCard(activeRepoData, activeMetrics);
                }
            } catch (err) {
                alert(`Failed to connect ${walletType}: ${err.message}`);
            }
        }

        // Handle "Bury Repo" Button
        if (e.target && e.target.closest('#bury-repo-btn')) {
            const walletState = window.GraveyardWallet ? window.GraveyardWallet.getState() : { address: null };

            if (!walletState.address) {
                toggleWalletModal(true);
                return;
            }

            try {
                const signMsg = `Confirming burial of repository ${activeRepoData.full_name} on GitHub Graveyard.\nTimestamp: ${Date.now()}`;
                const signatureObj = await window.GraveyardWallet.signMessage(signMsg);

                if (signatureObj) {
                    showCertificateModal(activeRepoData, activeMetrics, signatureObj.address);
                }
            } catch (err) {
                console.error('Burial Verification Error:', err);
            }
        }

        // Modal Close Triggers
        if (e.target && (e.target.classList.contains('wallet-modal-close') || e.target.classList.contains('modal-close-trigger'))) {
            toggleWalletModal(false);
            if (certificateModal) certificateModal.classList.add('hidden');
        }

        // Download Certificate Image
        if (e.target && e.target.closest('#download-cert-btn')) {
            const certElement = document.getElementById('certificate-card-node');
            if (certElement && window.html2canvas) {
                const downloadBtn = e.target.closest('#download-cert-btn');
                downloadBtn.innerText = 'Generating...';
                
                window.html2canvas(certElement, { backgroundColor: '#070a0f', scale: 2 }).then(canvas => {
                    const link = document.createElement('a');
                    link.download = `${activeRepoData.name}-burial-pass.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    downloadBtn.innerText = 'Download Pass Image';
                });
            }
        }
    });

    /* ==========================================================================
       5. CERTIFICATE PASS MODAL RENDER FUNCTION
       ========================================================================== */
    function showCertificateModal(repo, metrics, walletAddr) {
        if (!certificateModal) return;

        const passSerial = `GRAVE-${Math.floor(100000 + Math.random() * 900000)}`;
        const causeOfDeath = window.GraveyardScanner ? window.GraveyardScanner.generateCauseOfDeath(repo, metrics.daysInactive) : "Abandoned by maintainer";
        const tweetText = encodeURIComponent(`I just buried ${repo.full_name} on @GitGraveyard!\n\nCause of Death: "${causeOfDeath}"\nClaimed ${metrics.reward} $GRAVEYARD tokens 🪦\n\nhttps://gitgraveyard.xyz`);

        certificateModal.innerHTML = `
            <div class="modal-backdrop modal-close-trigger" style="display: flex;">
                <div class="modal-content glass-card" onclick="event.stopPropagation()">
                    <button class="modal-close modal-close-trigger">&times;</button>
                    
                    <div id="certificate-card-node" class="certificate-pass" style="background: #0d1117; border: 1px solid rgba(255,255,255,0.1); padding: 1.25rem; border-radius: 8px;">
                        <div class="pass-header" style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #8b949e; margin-bottom: 0.75rem;">
                            <span class="pass-tag" style="color: var(--blood-red, #ff5555); font-weight: bold;">OFFICIAL BURIAL CERTIFICATE</span>
                            <span class="pass-serial">${passSerial}</span>
                        </div>
                        
                        <div class="pass-repo-name" style="font-size: 1.25rem; font-weight: bold; color: #f0f6fc; margin-bottom: 0.5rem;">${repo.full_name}</div>
                        
                        <p style="font-size: 0.85rem; font-style: italic; color: #ff6e6e; margin-bottom: 1rem;">
                            Cause of Death: "${causeOfDeath}"
                        </p>

                        <div class="pass-stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; background: rgba(0,0,0,0.2); padding: 0.75rem; border-radius: 6px;">
                            <div class="pass-stat">
                                <span class="metric-label" style="display: block; font-size: 0.7rem; color: #8b949e;">Days Inactive</span>
                                <span class="metric-value" style="font-weight: bold; color: #f0f6fc;">${metrics.daysInactive}</span>
                            </div>
                            <div class="pass-stat">
                                <span class="metric-label" style="display: block; font-size: 0.7rem; color: #8b949e;">Mortality Score</span>
                                <span class="metric-value" style="font-weight: bold; color: #f0f6fc;">${metrics.mortalityScore}/100</span>
                            </div>
                            <div class="pass-stat">
                                <span class="metric-label" style="display: block; font-size: 0.7rem; color: #8b949e;">Tokens Minted</span>
                                <span class="metric-value" style="font-weight: bold; color: #f0f6fc;">${metrics.reward} $GRAVEYARD</span>
                            </div>
                            <div class="pass-stat">
                                <span class="metric-label" style="display: block; font-size: 0.7rem; color: #8b949e;">Buried By</span>
                                <span class="metric-value" style="font-weight: bold; color: #f0f6fc;">${window.GraveyardWallet ? window.GraveyardWallet.formatAddress(walletAddr) : walletAddr}</span>
                            </div>
                        </div>

                        <div class="pass-footer" style="display: flex; justify-content: space-between; font-size: 0.7rem; color: #8b949e; margin-top: 1rem;">
                            <span>GITGRAVEYARD.XYZ</span>
                            <span>${new Date().toISOString().split('T')[0]}</span>
                        </div>
                    </div>

                    <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.25rem; flex-wrap: wrap;">
                        <a href="https://twitter.com/intent/tweet?text=${tweetText}" target="_blank" class="btn btn-secondary" style="text-decoration: none;">
                            Share Certificate on 𝕏
                        </a>
                        <button id="download-cert-btn" class="btn btn-primary">
                            Download Pass Image
                        </button>
                    </div>
                </div>
            </div>
        `;

        certificateModal.classList.remove('hidden');
    }
});