const crypto = require("crypto");
const {
  verifyMessage,
  getAddress,
  isAddress
} = require("ethers");

const SESSION = "graveyard_session";
const WEEK = 7 * 24 * 60 * 60;

function secret() {
  const value = process.env.SESSION_SECRET;

  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }

  return crypto.createHash("sha256").update(value).digest();
}

function decrypt(value) {
  try {
    const buffer = Buffer.from(value, "base64url");

    if (buffer.length < 29) return null;

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      secret(),
      buffer.subarray(0, 12)
    );

    decipher.setAuthTag(buffer.subarray(12, 28));

    return JSON.parse(
      Buffer.concat([
        decipher.update(buffer.subarray(28)),
        decipher.final()
      ]).toString("utf8")
    );

  } catch {
    return null;
  }
}

function getSession(req) {
  const part = (req.headers.cookie || "")
    .split(";")
    .map(value => value.trim())
    .find(value => value.startsWith(`${SESSION}=`));

  if (!part) return null;

  let token;

  try {
    token = decodeURIComponent(part.slice(SESSION.length + 1));
  } catch {
    return null;
  }

  const data = decrypt(token);

  return (
    data?.accessToken &&
    data?.user?.id &&
    Date.now() - data.createdAt <= WEEK * 1000
  ) ? data : null;
}

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(data));
}

async function redis(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error("Upstash REST credentials are missing in Vercel.");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command),
    cache: "no-store"
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || "Upstash request failed.");
  }

  return data.result;
}

const userKey = id => `graveyard:wallet:user:${id}`;

const ownerKey = address =>
  `graveyard:wallet:owner:${address.toLowerCase()}`;

const nonceKey = (id, nonce) =>
  `graveyard:wallet:nonce:${id}:${nonce}`;

function normalizeAddress(value) {
  if (typeof value !== "string" || !isAddress(value)) {
    return null;
  }

  try {
    return getAddress(value);
  } catch {
    return null;
  }
}

function readBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  try {
    return JSON.parse(req.body || "{}");
  } catch {
    return {};
  }
}

function origin(req) {
  if (process.env.APP_ORIGIN) {
    return process.env.APP_ORIGIN.replace(/\/$/, "");
  }

  const host =
    req.headers["x-forwarded-host"] ||
    req.headers.host;

  return `${req.headers["x-forwarded-proto"] || "https"}://${host}`;
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");

  try {
    const session = getSession(req);

    if (!session) {
      return json(res, 401, {
        error: "Log in with GitHub before connecting a wallet."
      });
    }

    const id = String(session.user.id);
    const action = req.query?.action;

    /* RESTORE SAVED WALLET */

    if (action === "identity" && req.method === "GET") {
      const address = await redis([
        "GET",
        userKey(id)
      ]);

      return json(res, 200, {
        verified: !!address,
        address: address || null
      });
    }

    /* CREATE SIGNATURE CHALLENGE */

    if (action === "nonce" && req.method === "GET") {
      const address = normalizeAddress(req.query?.address);

      if (!address) {
        return json(res, 400, {
          error: "A valid Ethereum wallet address is required."
        });
      }

      const nonce = crypto.randomBytes(24).toString("hex");

      const message = [
        "GitHub Graveyard wallet verification",
        "",
        `Origin: ${origin(req)}`,
        `GitHub user ID: ${id}`,
        `Wallet: ${address}`,
        `Nonce: ${nonce}`,
        "",
        "Sign this message to prove you control this wallet. This does not authorize a transaction or spend funds."
      ].join("\n");

      const saved = await redis([
        "SET",
        nonceKey(id, nonce),
        JSON.stringify({ address, message }),
        "EX",
        300,
        "NX"
      ]);

      if (saved !== "OK") {
        throw new Error("Could not create verification challenge.");
      }

      return json(res, 200, {
        nonce,
        message
      });
    }

    /* VERIFY SIGNATURE AND SAVE WALLET */

    if (action === "verify" && req.method === "POST") {
      const {
        address: rawAddress,
        signature,
        nonce
      } = readBody(req);

      const address = normalizeAddress(rawAddress);

      if (
        !address ||
        typeof signature !== "string" ||
        typeof nonce !== "string" ||
        !/^[a-f0-9]{48}$/.test(nonce)
      ) {
        return json(res, 400, {
          error: "Invalid wallet verification details."
        });
      }

      const key = nonceKey(id, nonce);
      const stored = await redis(["GET", key]);

      if (!stored) {
        return json(res, 400, {
          error: "Challenge expired or already used. Please reconnect."
        });
      }

      await redis(["DEL", key]);

      const challenge = JSON.parse(stored);

      if (
        challenge.address.toLowerCase() !== address.toLowerCase()
      ) {
        return json(res, 400, {
          error: "Signed wallet does not match the connected wallet."
        });
      }

      let recovered;

      try {
        recovered = getAddress(
          verifyMessage(challenge.message, signature)
        );
      } catch {
        return json(res, 400, {
          error: "Wallet signature could not be verified."
        });
      }

      if (recovered.toLowerCase() !== address.toLowerCase()) {
        return json(res, 401, {
          error: "Signature does not prove wallet ownership."
        });
      }

      const existingOwner = await redis([
        "GET",
        ownerKey(address)
      ]);

      if (existingOwner && String(existingOwner) !== id) {
        return json(res, 409, {
          error: "This wallet is already linked to another GitHub account."
        });
      }

      const oldAddress = await redis([
        "GET",
        userKey(id)
      ]);

      const claim = await redis([
        "SET",
        ownerKey(address),
        id,
        "NX"
      ]);

      if (
        claim !== "OK" &&
        String(await redis(["GET", ownerKey(address)])) !== id
      ) {
        return json(res, 409, {
          error: "This wallet was just linked to another account. Try again."
        });
      }

      await redis([
        "SET",
        userKey(id),
        address
      ]);

      if (
        oldAddress &&
        String(oldAddress).toLowerCase() !== address.toLowerCase()
      ) {
        const oldOwner = await redis([
          "GET",
          ownerKey(String(oldAddress))
        ]);

        if (String(oldOwner) === id) {
          await redis([
            "DEL",
            ownerKey(String(oldAddress))
          ]);
        }
      }

      return json(res, 200, {
        verified: true,
        address
      });
    }

    /* DISCONNECT WALLET */

    if (action === "disconnect" && req.method === "POST") {
      const oldAddress = await redis([
        "GET",
        userKey(id)
      ]);

      if (oldAddress) {
        const owner = await redis([
          "GET",
          ownerKey(String(oldAddress))
        ]);

        if (String(owner) === id) {
          await redis([
            "DEL",
            ownerKey(String(oldAddress))
          ]);
        }
      }

      await redis([
        "DEL",
        userKey(id)
      ]);

      return json(res, 200, {
        disconnected: true
      });
    }

    return json(res, 405, {
      error: "Unsupported wallet action or HTTP method."
    });

  } catch (error) {
    console.error("Wallet API:", error);

    return json(res, 500, {
      error: error.message || "Wallet service failed."
    });
  }
};