/**
 * GITHUB GRAVEYARD — MULTI-WALLET CONNECTOR
 * Handles Extension detection on Desktop and Mobile Universal Deep Linking.
 */

window.GraveyardWallet = (() => {
    let state = {
        address: null,
        walletType: null, // 'robinhood' | 'coinbase' | 'trust' | 'metamask' | 'phantom' | 'fomo'
        provider: null
    };

    const DEEP_LINKS = {
        robinhood: (url) => `https://robinhood.com/wallet/dapp?url=${encodeURIComponent(url)}`,
        coinbase: (url) => `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(url)}`,
        trust: (url) => `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(url)}`,
        metamask: (url) => `https://metamask.app.link/dapp/${url.replace(/^https?:\/\//, '')}`,
        phantom: (url) => `https://phantom.app/ul/browse/${encodeURIComponent(url)}`,
        fomo: (url) => `https://fomo.family/dapp?url=${encodeURIComponent(url)}`
    };

    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    async function connectWallet(walletType) {
        const currentUrl = window.location.href;

        // MOBILE FLOW: Redirect to app via deep link if extension isn't injected
        if (isMobile()) {
            const hasInjected = (walletType === 'phantom' && window.phantom) || window.ethereum;
            if (!hasInjected) {
                if (DEEP_LINKS[walletType]) {
                    window.location.href = DEEP_LINKS[walletType](currentUrl);
                    return null;
                }
            }
        }

        // DESKTOP & IN-APP BROWSER FLOW
        try {
            if (walletType === 'phantom') {
                const phantom = window.phantom?.solana || window.solana;
                if (!phantom) {
                    window.open('https://phantom.app/', '_blank');
                    throw new Error("Phantom extension not detected.");
                }
                const res = await phantom.connect();
                state.address = res.publicKey.toString();
                state.provider = phantom;
                state.walletType = 'phantom';
            } else {
                // EVM Wallets (Robinhood, Coinbase, Trust, MetaMask, Fomo)
                let provider = window.ethereum;

                // Handle multi-provider injection collisions
                if (window.ethereum?.providers) {
                    if (walletType === 'coinbase') provider = window.ethereum.providers.find(p => p.isCoinbaseWallet);
                    else if (walletType === 'trust') provider = window.ethereum.providers.find(p => p.isTrust);
                    else if (walletType === 'metamask') provider = window.ethereum.providers.find(p => p.isMetaMask);
                    else provider = window.ethereum.providers[0];
                }

                if (!provider) {
                    alert(`Please install the ${walletType} browser extension or open this site inside the ${walletType} mobile app browser.`);
                    return null;
                }

                const accounts = await provider.request({ method: 'eth_requestAccounts' });
                if (accounts && accounts.length > 0) {
                    state.address = accounts[0];
                    state.provider = provider;
                    state.walletType = walletType;
                }
            }

            console.log(`Connected to ${walletType}: ${state.address}`);
            updateUI();
            return state;
        } catch (err) {
            console.error(`Connection Error (${walletType}):`, err);
            throw err;
        }
    }

    async function signMessage(message) {
        if (!state.address || !state.provider) throw new Error("No wallet connected.");

        if (state.walletType === 'phantom') {
            const encoded = new TextEncoder().encode(message);
            const signed = await state.provider.signMessage(encoded, "utf8");
            return { address: state.address, signature: signed.signature };
        } else {
            const signature = await state.provider.request({
                method: 'personal_sign',
                params: [message, state.address]
            });
            return { address: state.address, signature };
        }
    }

    function disconnect() {
        state = { address: null, walletType: null, provider: null };
        updateUI();
    }

    function formatAddress(addr) {
        if (!addr) return '';
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    }

    function updateUI() {
        const btnText = document.getElementById('wallet-btn-text');
        if (btnText) {
            btnText.innerText = state.address ? formatAddress(state.address) : 'Connect Wallet';
        }
    }

    return {
        connectWallet,
        signMessage,
        disconnect,
        formatAddress,
        getState: () => state
    };
})();