const crypto = require("crypto");

const GITHUB_API = "https://api.github.com";
const GITHUB_AUTHORIZE = "https://github.com/login/oauth/authorize";
const SESSION_COOKIE = "graveyard_session";
const STATE_COOKIE = "graveyard_oauth_state";

const SESSION_DURATION = 7 * 24 * 60 * 60;
const STATE_DURATION = 10 * 60;

function getSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }

  return crypto.createHash("sha256").update(secret).digest();
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function cookieOptions(maxAge) {
  return [
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
    ...(isProduction() ? ["Secure"] : [])
  ].join("; ");
}
function setCookie(res, name, value, maxAge) {
  const cookie = `${name}=${encodeURIComponent(value)}; ${cookieOptions(maxAge)}`;

  const existing = res.getHeader("Set-Cookie");

  const cookies =
    existing == null
      ? []
      : Array.isArray(existing)
        ? existing
        : [existing];

  res.setHeader("Set-Cookie", [...cookies, cookie]);
}

function clearCookie(res, name) {
  setCookie(res, name, "", 0);
}

function getCookies(req) {
  const header = req.headers.cookie || "";

  return Object.fromEntries(
    header.split(";").map(part => {
      const separator = part.indexOf("=");

      if (separator === -1) return ["", ""];

      const name = part.slice(0, separator).trim();
      const value = part.slice(separator + 1).trim();

      try {
        return [name, decodeURIComponent(value)];
      } catch {
        return [name, ""];
      }
    }).filter(([name]) => name)
  );
}

function encryptSession(data) {
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    getSecret(),
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data), "utf8"),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  return Buffer.concat([
    iv,
    authTag,
    encrypted
  ]).toString("base64url");
}

function decryptSession(value) {
  try {
    const buffer = Buffer.from(value, "base64url");

    if (buffer.length < 29) return null;

    const iv = buffer.subarray(0, 12);
    const authTag = buffer.subarray(12, 28);
    const encrypted = buffer.subarray(28);

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      getSecret(),
      iv
    );

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    return JSON.parse(decrypted.toString("utf8"));
  } catch {
    return null;
  }
}

function sendJSON(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

function redirect(res, url) {
  res.statusCode = 302;
  res.setHeader("Location", url);
  res.setHeader("Cache-Control", "no-store");
  res.end();
}

function getCallbackURL() {
  const url = process.env.GITHUB_CALLBACK_URL;

  if (!url) {
    throw new Error("GITHUB_CALLBACK_URL is missing.");
  }

  return url;
}

function requireGitHubConfig() {
  if (!process.env.GITHUB_CLIENT_ID) {
    throw new Error("GITHUB_CLIENT_ID is missing.");
  }

  if (!process.env.GITHUB_CLIENT_SECRET) {
    throw new Error("GITHUB_CLIENT_SECRET is missing.");
  }

  getCallbackURL();
  getSecret();
}

async function githubRequest(url, token) {
  const response = await fetch(url, {
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "GitHub-Graveyard"
    }
  });

  if (!response.ok) {
    const error = new Error(
      `GitHub API returned ${response.status}.`
    );

    error.status = response.status;
    throw error;
  }

  return response;
}

async function startLogin(req, res) {
  requireGitHubConfig();

  const state = crypto.randomBytes(32).toString("hex");

  setCookie(res, STATE_COOKIE, state, STATE_DURATION);

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: getCallbackURL(),
    scope: "read:user",
    state
  });

  redirect(res, `${GITHUB_AUTHORIZE}?${params.toString()}`);
}

async function handleCallback(req, res) {
  requireGitHubConfig();

  const cookies = getCookies(req);

  const expectedState = cookies[STATE_COOKIE];
  const returnedState = req.query.state;
  const code = req.query.code;
  const oauthError = req.query.error;

  clearCookie(res, STATE_COOKIE);

  if (oauthError) {
    return redirect(res, "/?github_error=authorization_denied");
  }

  if (
    !expectedState ||
    !returnedState ||
    expectedState !== returnedState ||
    typeof code !== "string"
  ) {
    return redirect(res, "/?github_error=invalid_oauth_state");
  }

  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: getCallbackURL()
      })
    }
  );

  if (!tokenResponse.ok) {
    throw new Error("GitHub token exchange failed.");
  }

  const tokenData = await tokenResponse.json();

  if (!tokenData.access_token) {
    throw new Error("GitHub did not return an access token.");
  }

  const userResponse = await githubRequest(
    `${GITHUB_API}/user`,
    tokenData.access_token
  );

  const user = await userResponse.json();

  const session = {
    accessToken: tokenData.access_token,
    user: {
      login: user.login,
      name: user.name,
      avatar_url: user.avatar_url,
      html_url: user.html_url
    },
    createdAt: Date.now()
  };

  setCookie(
    res,
    SESSION_COOKIE,
    encryptSession(session),
    SESSION_DURATION
  );

  redirect(res, "/");
}

function getSession(req) {
  const cookies = getCookies(req);
  const encryptedSession = cookies[SESSION_COOKIE];

  if (!encryptedSession) return null;

  const session = decryptSession(encryptedSession);

  if (!session || !session.accessToken || !session.user) {
    return null;
  }

  if (Date.now() - session.createdAt > SESSION_DURATION * 1000) {
    return null;
  }

  return session;
}

async function getCurrentUser(req, res) {
  const session = getSession(req);

  if (!session) {
    return sendJSON(res, 401, {
      error: "Not authenticated."
    });
  }

  sendJSON(res, 200, {
    user: session.user
  });
}

async function getRepositories(req, res) {
  const session = getSession(req);

  if (!session) {
    return sendJSON(res, 401, {
      error: "Not authenticated."
    });
  }

  const repositories = [];

  let page = 1;

  while (true) {
    const url = new URL(`${GITHUB_API}/user/repos`);

    url.searchParams.set("visibility", "public");
    url.searchParams.set("affiliation", "owner");
    url.searchParams.set("sort", "pushed");
    url.searchParams.set("direction", "desc");
    url.searchParams.set("per_page", "100");
    url.searchParams.set("page", String(page));

    const response = await githubRequest(
      url.toString(),
      session.accessToken
    );

    const batch = await response.json();

    if (!Array.isArray(batch)) {
      throw new Error("Invalid repository data received from GitHub.");
    }

    repositories.push(...batch);

    if (batch.length < 100) break;

    page += 1;

    if (page > 20) {
      throw new Error("Repository scan limit reached.");
    }
  }

  const formattedRepositories = repositories
    .filter(repo => !repo.fork)
    .map(repo => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      html_url: repo.html_url,
      private: repo.private,
      fork: repo.fork,
      archived: repo.archived,
      created_at: repo.created_at,
      last_activity_at: repo.pushed_at
    }));

  sendJSON(res, 200, {
    repositories: formattedRepositories,
    count: formattedRepositories.length
  });
}

async function logout(req, res) {
  clearCookie(res, SESSION_COOKIE);
  clearCookie(res, STATE_COOKIE);

  redirect(res, "/");
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");

  if (req.method !== "GET") {
    return sendJSON(res, 405, {
      error: "Method not allowed."
    });
  }

  const action = req.query.action;

  try {
    if (action === "login") {
      return await startLogin(req, res);
    }

    if (action === "callback") {
      return await handleCallback(req, res);
    }

    if (action === "me") {
      return await getCurrentUser(req, res);
    }

    if (action === "repositories") {
      return await getRepositories(req, res);
    }

    if (action === "logout") {
      return await logout(req, res);
    }

    return sendJSON(res, 404, {
      error: "Unknown GitHub API action."
    });

  } catch (error) {
    console.error("GitHub Graveyard API error:", error);

    return sendJSON(res, 500, {
      error: "Something went wrong while communicating with GitHub."
    });
  }
};