/**
 * GITHUB GRAVEYARD — MULTI-WALLET CONNECTOR
 * Supports Robinhood, Coinbase, Trust, MetaMask, Phantom, and Fomo.
 * Enforces EVM/Ethereum address resolution across all providers.
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

        // MOBILE FLOW: Redirect to dApp browser via deep link if provider isn't injected
        if (isMobile()) {
            const hasInjected = window.ethereum || window.phantom?.ethereum;
            if (!hasInjected) {
                if (DEEP_LINKS[walletType]) {
                    window.location.href = DEEP_LINKS[walletType](currentUrl);
                    return null;
                }
            }
        }

        // DESKTOP & IN-APP BROWSER FLOW (ALWAYS FETCH ETHEREUM ACCOUNT)
        try {
            let provider = null;

           if (walletType === 'phantom') {
          // Check explicit Phantom EVM provider, isPhantom flag, or EIP-6963 multi-provider list
          if (window.phantom?.ethereum) {
            provider = window.phantom.ethereum;
          } else if (window.ethereum?.isPhantom) {
            provider = window.ethereum;
          } else if (window.ethereum?.providers) {
            provider = window.ethereum.providers.find((p) => p.isPhantom);
          }

          if (!provider) {
            if (!isMobile()) {
              window.open('https://phantom.app/', '_blank');
            }
            throw new Error('Phantom Ethereum wallet extension not detected.');
          }
        } else {
                // Standard EVM Wallets
                provider = window.ethereum;

               if (window.ethereum?.providers) {
          if (walletType === 'coinbase')
            provider =
              window.ethereum.providers.find((p) => p.isCoinbaseWallet) ||
              provider;
          else if (walletType === 'trust')
            provider =
              window.ethereum.providers.find((p) => p.isTrust) || provider;
          else if (walletType === 'metamask')
            provider =
              window.ethereum.providers.find(
                (p) => p.isMetaMask && !p.isPhantom
              ) || provider;
          else if (walletType === 'robinhood')
            provider =
              window.ethereum.providers.find((p) => p.isRobinhood) || provider;
          else if (walletType === 'fomo')
            provider =
              window.ethereum.providers.find((p) => p.isFomo) || provider;
          else provider = window.ethereum.providers[0];
        }
            }

            if (!provider) {
                alert(`Please install the ${walletType} browser extension or open inside the ${walletType} mobile app browser.`);
                return null;
            }

            // Request standard EVM address (0x...)
            const accounts = await provider.request({ method: 'eth_requestAccounts' });
            if (accounts && accounts.length > 0) {
                state.address = accounts[0];
                state.provider = provider;
                state.walletType = walletType;
            }

            console.log(`Connected ${walletType} (EVM): ${state.address}`);
            updateUI();
            return state;
        } catch (err) {
            console.error(`Connection Error (${walletType}):`, err);
            throw err;
        }
    }

    async function signMessage(message) {
        if (!state.address || !state.provider) throw new Error("No wallet connected.");

        const signature = await state.provider.request({
            method: 'personal_sign',
            params: [message, state.address]
        });

        return { address: state.address, signature };
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