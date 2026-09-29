// src/config/token.js

export const TOKEN_CONFIG = {
  symbol: "$GRAVEYARD",
  name: "GitHub Graveyard",
  chain: "Ethereum / EVM",
  // Leave empty or set as "TBA" until the coin launches
  contractAddress: process.env.NEXT_PUBLIC_TOKEN_CA || null, 
  treasuryWallet: "0x0000000000000000000000000000000000000000", // Your project wallet
  baseRewardPerBurial: 1000, // Base tokens for a score of 100
};