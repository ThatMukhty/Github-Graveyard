/**
 * GITHUB GRAVEYARD — MULTI-CHAIN WALLET ADAPTER
 * Handles Web3 wallet connections (EVM & Solana), address formatting, and verification signing.
 */

window.GraveyardWallet = (function () {
    const state = {
        chain: null,      // 'evm' | 'solana' | null
        address: null,    // Connected wallet address
        provider: null    // Raw provider object
    };

    /**
     * Truncate wallet address for UI display (e.g., 0x1234...abcd)
     */
    function formatAddress(addr) {
        if (!addr) return '';
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    }

    /**
     * Connect EVM Wallet (MetaMask, Rabby, Coinbase Wallet)
     */
    async function connectEVM() {
        if (typeof window.ethereum === 'undefined') {
            throw new Error('No EVM wallet detected. Please install MetaMask or another Web3 extension.');
        }

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts selected.');
            }

            state.chain = 'evm';
            state.address = accounts[0];
            state.provider = window.ethereum;

            _setupEVMEvents();
            _updateUI();
            return { chain: state.chain, address: state.address };
        } catch (err) {
            console.error('EVM Connection Error:', err);
            throw err;
        }
    }

    /**
     * Connect Solana Wallet (Phantom, Solflare)
     */
    async function connectSolana() {
        const solanaProvider = window.solana || window.phantom?.solana;

        if (!solanaProvider || !solanaProvider.isPhantom) {
            throw new Error('Solana provider not found. Please install Phantom or Solflare.');
        }

        try {
            const response = await solanaProvider.connect();
            state.chain = 'solana';
            state.address = response.publicKey.toString();
            state.provider = solanaProvider;

            _setupSolanaEvents();
            _updateUI();
            return { chain: state.chain, address: state.address };
        } catch (err) {
            console.error('Solana Connection Error:', err);
            throw err;
        }
    }

    /**
     * Sign Verification Message to Prove Ownership / Intent
     */
    async function signMessage(message) {
        if (!state.address || !state.provider) {
            throw new Error('Wallet not connected.');
        }

        try {
            if (state.chain === 'evm') {
                const signature = await state.provider.request({
                    method: 'personal_sign',
                    params: [message, state.address]
                });
                return { chain: 'evm', signature, address: state.address };
            } 
            else if (state.chain === 'solana') {
                const encodedMessage = new TextEncoder().encode(message);
                const signedMessage = await state.provider.signMessage(encodedMessage, 'utf8');
                return {
                    chain: 'solana',
                    signature: Array.from(signedMessage.signature),
                    address: state.address
                };
            }
        } catch (err) {
            console.error('Signature Error:', err);
            throw new Error('User rejected message signature.');
        }
    }

    /**
     * Disconnect active wallet session
     */
    function disconnect() {
        if (state.chain === 'solana' && state.provider?.disconnect) {
            state.provider.disconnect();
        }

        state.chain = null;
        state.address = null;
        state.provider = null;

        _updateUI();
    }

    /**
     * Event Listeners for EVM Chain/Account Switches
     */
    function _setupEVMEvents() {
        if (!state.provider || !state.provider.on) return;

        state.provider.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                disconnect();
            } else {
                state.address = accounts[0];
                _updateUI();
            }
        });

        state.provider.on('chainChanged', () => {
            window.location.reload();
        });
    }

    /**
     * Event Listeners for Solana Disconnection
     */
    function _setupSolanaEvents() {
        if (!state.provider || !state.provider.on) return;

        state.provider.on('disconnect', () => {
            disconnect();
        });
    }

    /**
     * Synchronize Wallet Button & Status in DOM
     */
    function _updateUI() {
        const walletBtn = document.getElementById('connect-wallet-btn');
        const walletText = document.getElementById('wallet-btn-text');

        if (!walletBtn || !walletText) return;

        if (state.address) {
            walletText.innerText = `${state.chain.toUpperCase()}: ${formatAddress(state.address)}`;
            walletBtn.classList.add('connected');
        } else {
            walletText.innerText = 'Connect Wallet';
            walletBtn.classList.remove('connected');
        }
    }

    return {
        connectEVM,
        connectSolana,
        signMessage,
        disconnect,
        formatAddress,
        getState: () => ({ ...state })
    };
})();