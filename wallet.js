import { createAppKit } from "@reown/appkit";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { mainnet } from "@reown/appkit/networks";
import { BrowserProvider } from "ethers";

const PROJECT_ID = "dffa7597189ed7c0084fe43fb2113831";

let appKit = null;

const $ = selector => document.querySelector(selector);

function walletMessage(message) {
  $("#walletMessage").textContent = message;
}

function showConnected(address) {
  $("#walletStatusText").textContent = "VERIFIED WALLET";
  $("#walletAddress").textContent = address;
  $("#walletAddress").classList.remove("hidden");
  $("#connectWallet").classList.add("hidden");
  $("#disconnectWallet").classList.remove("hidden");
}

function showDisconnected() {
  $("#walletStatusText").textContent = "WALLET NOT CONNECTED";
  $("#walletAddress").classList.add("hidden");
  $("#connectWallet").classList.remove("hidden");
  $("#disconnectWallet").classList.add("hidden");
}

async function api(action, options = {}) {
  const response = await fetch(`/api/wallet?action=${action}`, {
    credentials: "same-origin",
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Wallet request failed.");
  }

  return data;
}

export async function restoreWalletIdentity() {
  try {
    const data = await api("identity");

    if (data.verified && data.address) {
      showConnected(data.address);
      walletMessage("Wallet linked to your GitHub identity.");
    } else {
      showDisconnected();
      walletMessage("No Ethereum wallet is associated with this GitHub account.");
    }
  } catch {
    showDisconnected();
  }
}

async function connectWallet() {
  try {
    walletMessage("Opening wallet connection...");

    if (!appKit) {
      throw new Error("Add your Reown Project ID to wallet.js first.");
    }

    await appKit.open();

    const address = appKit.getAddress();

    if (!address) {
      walletMessage("Connect an Ethereum wallet to continue.");
      return;
    }

    const provider = appKit.getWalletProvider();

    if (!provider) {
      throw new Error("Could not access your wallet provider.");
    }

    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    const challenge = await api(
      `nonce&address=${encodeURIComponent(address)}`
    );

    const signature = await signer.signMessage(challenge.message);

    const result = await api("verify", {
      method: "POST",
      body: JSON.stringify({
        address,
        signature,
        nonce: challenge.nonce
      })
    });

    showConnected(result.address);

    walletMessage(
      "Wallet ownership verified and saved to your Graveyard identity."
    );

  } catch (error) {
    walletMessage(error.message || "Wallet connection failed.");
  }
}

async function disconnectWallet() {
  try {
    await api("disconnect", {
      method: "POST",
      body: JSON.stringify({})
    });

    showDisconnected();

    walletMessage(
      "Wallet association removed from your Graveyard identity."
    );

  } catch (error) {
    walletMessage(error.message || "Could not disconnect wallet.");
  }
}

export function initializeWallet() {
  $("#connectWallet").addEventListener("click", connectWallet);
  $("#disconnectWallet").addEventListener("click", disconnectWallet);

  if (!PROJECT_ID || PROJECT_ID === "YOUR_REOWN_PROJECT_ID") {
    walletMessage(
      "Add your Reown Project ID in wallet.js to enable wallet connection."
    );
    return;
  }

  appKit = createAppKit({
    adapters: [new EthersAdapter()],
    networks: [mainnet],
    projectId: PROJECT_ID,

    metadata: {
      name: "GitHub Graveyard",
      description: "The final resting place for abandoned repositories.",
      url: window.location.origin,
      icons: [`${window.location.origin}/favicon.ico`]
    },

    features: {
      analytics: false,
      email: false,
      socials: false
    }
  });
}