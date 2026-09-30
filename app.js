/**
 * GITHUB GRAVEYARD — APPLICATION CONTROLLER
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inject html2canvas dynamically for certificate image download
    if (!window.html2canvas) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        document.head.appendChild(script);
    }

    const searchInput = document.getElementById('repo-input');
    const scanBtn = document.getElementById('scan-btn');
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    const walletModal = document.getElementById('wallet-modal');
    const certificateModal = document.getElementById('certificate-modal');
    const connectEvmBtn = document.getElementById('connect-evm-btn');
    const connectSolanaBtn = document.getElementById('connect-solana-btn');

    let activeRepoData = null;
    let activeMetrics = null;

    /* 1. REPOSITORY SCAN HANDLER */
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

    /* 2. GLOBAL CLICK ROUTING */
    document.addEventListener('click', async (e) => {
        // Trigger Wallet Modal if clicking "Connect Wallet to Bury"
        if (e.target && e.target.closest('#connect-wallet-trigger-btn')) {
            if (walletModal) walletModal.classList.remove('hidden');
        }

        // Handle Bury Button
        if (e.target && e.target.closest('#bury-repo-btn')) {
            const walletState = window.GraveyardWallet ? window.GraveyardWallet.getState() : { address: null };

            if (!walletState.address) {
                if (walletModal) walletModal.classList.remove('hidden');
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

        // Close Modals
        if (e.target && e.target.classList.contains('modal-close-trigger')) {
            if (certificateModal) certificateModal.classList.add('hidden');
            if (walletModal) walletModal.classList.add('hidden');
        }

        // Download Certificate Image
        if (e.target && e.target.closest('#download-cert-btn')) {
            const certElement = document.getElementById('certificate-card-node');
            if (certElement && window.html2canvas) {
                const downloadBtn = e.target.closest('#download-cert-btn');
                downloadBtn.innerText = 'Generating Image...';
                
                window.html2canvas(certElement, { backgroundColor: '#070a0f' }).then(canvas => {
                    const link = document.createElement('a');
                    link.download = `${activeRepoData.name}-burial-certificate.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    downloadBtn.innerText = 'Download Pass Image';
                });
            }
        }
    });

    /* 3. WALLET CONTROLS */
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', () => {
            const walletState = window.GraveyardWallet ? window.GraveyardWallet.getState() : { address: null };
            if (walletState.address) {
                if (confirm('Disconnect active wallet?')) {
                    window.GraveyardWallet.disconnect();
                    if (activeRepoData && activeMetrics) {
                        window.GraveyardScanner.renderRepoCard(activeRepoData, activeMetrics);
                    }
                }
            } else if (walletModal) {
                walletModal.classList.remove('hidden');
            }
        });
    }

    if (connectEvmBtn) {
        connectEvmBtn.addEventListener('click', async () => {
            try {
                await window.GraveyardWallet.connectEVM();
                if (walletModal) walletModal.classList.add('hidden');
                if (activeRepoData && activeMetrics) {
                    window.GraveyardScanner.renderRepoCard(activeRepoData, activeMetrics);
                }
            } catch (err) { alert(err.message); }
        });
    }

    if (connectSolanaBtn) {
        connectSolanaBtn.addEventListener('click', async () => {
            try {
                await window.GraveyardWallet.connectSolana();
                if (walletModal) walletModal.classList.add('hidden');
                if (activeRepoData && activeMetrics) {
                    window.GraveyardScanner.renderRepoCard(activeRepoData, activeMetrics);
                }
            } catch (err) { alert(err.message); }
        });
    }

    /* 4. CERTIFICATE MODAL RENDER */
    function showCertificateModal(repo, metrics, walletAddr) {
        if (!certificateModal) return;

        const passSerial = `GRAVE-${Math.floor(100000 + Math.random() * 900000)}`;
        const causeOfDeath = window.GraveyardScanner.generateCauseOfDeath(repo, metrics.daysInactive);
        const tweetText = encodeURIComponent(`I just buried ${repo.full_name} on @GitGraveyard!\n\nCause of Death: "${causeOfDeath}"\nClaimed ${metrics.reward} $GRAVEYARD tokens 🪦\n\nhttps://gitgraveyard.xyz`);

        certificateModal.innerHTML = `
            <div class="modal-backdrop modal-close-trigger">
                <div class="modal-content glass-card" onclick="event.stopPropagation()">
                    <button class="modal-close modal-close-trigger">&times;</button>
                    
                    <div id="certificate-card-node" class="certificate-pass">
                        <div class="pass-header">
                            <span class="pass-tag">OFFICIAL BURIAL CERTIFICATE</span>
                            <span class="pass-serial">${passSerial}</span>
                        </div>
                        
                        <div class="pass-repo-name">${repo.full_name}</div>
                        
                        <p style="font-size: 0.85rem; font-style: italic; color: var(--blood-red);">
                            Cause of Death: "${causeOfDeath}"
                        </p>

                        <div class="pass-stats-grid">
                            <div class="pass-stat">
                                <span class="metric-label">Days Inactive</span>
                                <span class="metric-value">${metrics.daysInactive}</span>
                            </div>
                            <div class="pass-stat">
                                <span class="metric-label">Mortality Score</span>
                                <span class="metric-value">${metrics.mortalityScore}/100</span>
                            </div>
                            <div class="pass-stat">
                                <span class="metric-label">Tokens Minted</span>
                                <span class="metric-value">${metrics.reward} $GRAVEYARD</span>
                            </div>
                            <div class="pass-stat">
                                <span class="metric-label">Buried By</span>
                                <span class="metric-value">${window.GraveyardWallet ? window.GraveyardWallet.formatAddress(walletAddr) : walletAddr}</span>
                            </div>
                        </div>

                        <div class="pass-footer">
                            <span>GITGRAVEYARD.XYZ</span>
                            <span>${new Date().toISOString().split('T')[0]}</span>
                        </div>
                    </div>

                    <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem;">
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