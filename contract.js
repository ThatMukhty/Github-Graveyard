/**
 * GITHUB GRAVEYARD — SMART CONTRACT & TOKEN CLAIM INTERACTION
 */

window.GraveyardContract = (() => {

    // Smart Contract Configuration
    const TOKEN_CONTRACT_ADDRESS = "0xYOUR_TOKEN_CONTRACT_ADDRESS_HERE"; // Deployed ERC-20 token address
    const TOKEN_DECIMALS = 18;

    // Minimal ABI required to send or mint tokens
    const TOKEN_ABI = [
        "function transfer(address to, uint256 amount) public returns (bool)",
        "function claimTokens(address recipient, uint256 amount) public returns (bool)"
    ];

    /**
     * Sends $GRAVEYARD tokens directly to the recipient's wallet address.
     * @param {string} recipientAddress - Connected wallet address.
     * @param {number} tokenAmount - Amount of $GRAVEYARD tokens to send.
     */
    async function claimTokens(recipientAddress, tokenAmount) {
        if (!window.ethereum) {
            throw new Error("No Web3 wallet detected. Please install MetaMask or another Web3 wallet.");
        }

        try {
            // 1. Initialize Ethers provider & signer
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            // 2. Parse token amount to 18 decimals
            const parsedAmount = ethers.utils.parseUnits(tokenAmount.toString(), TOKEN_DECIMALS);

            // 3. Connect to Token Contract
            const contract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, signer);

            // 4. Send transaction
            const tx = await contract.transfer(recipientAddress, parsedAmount);

            // 5. Wait for block confirmation
            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: receipt.transactionHash,
                amountSent: tokenAmount
            };
        } catch (err) {
            console.error("Token Claim Error:", err);
            throw new Error(err.reason || err.message || "Failed to process token claim.");
        }
    }

    return {
        claimTokens
    };

})();