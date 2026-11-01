const crypto = require("crypto");

const API = "https://api.github.com";
const SESSION = "graveyard_session";
const STATE = "graveyard_oauth_state";
const SESSION_SECONDS = 7 * 24 * 60 * 60;

function secret() {
  const value = process.env.SESSION_SECRET;

  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }

  return crypto.createHash("sha256").update(value).digest();
}

function prod() {
  return process.env.NODE_ENV === "production";
}

function cookie(res, name, value, age) {
  const item =
    `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${prod() ? "; Secure" : ""}`;

  const old = res.getHeader("Set-Cookie");

  res.setHeader(
    "Set-Cookie",
    [...(old ? (Array.isArray(old) ? old : [old]) : []), item]
  );
}

function clear(res, name) {
  cookie(res, name, "", 0);
}

function cookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || "")
      .split(";")
      .map(part => {
        const i = part.indexOf("=");

        if (i < 0) return ["", ""];

        try {
          return [
            part.slice(0, i).trim(),
            decodeURIComponent(part.slice(i + 1).trim())
          ];
        } catch {
          return ["", ""];
        }
      })
      .filter(([key]) => key)
  );
}

function encrypt(data) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", secret(), iv);

  const body = Buffer.concat([
    cipher.update(JSON.stringify(data), "utf8"),
    cipher.final()
  ]);

  return Buffer.concat([
    iv,
    cipher.getAuthTag(),
    body
  ]).toString("base64url");
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

function session(req) {
  const token = cookies(req)[SESSION];

  if (!token) return null;

  const data = decrypt(token);

  if (
    !data?.accessToken ||
    !data?.user?.id ||
    Date.now() - data.createdAt > SESSION_SECONDS * 1000
  ) {
    return null;
  }

  return data;
}

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(data));
}

function redirect(res, url) {
  res.statusCode = 302;
  res.setHeader("Location", url);
  res.setHeader("Cache-Control", "no-store");
  res.end();
}

function callback() {
  if (!process.env.GITHUB_CALLBACK_URL) {
    throw new Error("GITHUB_CALLBACK_URL is missing.");
  }

  return process.env.GITHUB_CALLBACK_URL;
}

function config() {
  if (
    !process.env.GITHUB_CLIENT_ID ||
    !process.env.GITHUB_CLIENT_SECRET
  ) {
    throw new Error("GitHub OAuth credentials are missing.");
  }

  callback();
  secret();
}

async function gh(url, token) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "GitHub-Graveyard"
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API returned ${response.status}.`);
  }

  return response;
}

async function login(res) {
  config();

  const state = crypto.randomBytes(32).toString("hex");

  cookie(res, STATE, state, 600);

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: callback(),
    scope: "read:user",
    state
  });

  redirect(
    res,
    `https://github.com/login/oauth/authorize?${params}`
  );
}

async function oauthCallback(req, res) {
  config();

  const expected = cookies(req)[STATE];

  const {
    state,
    code,
    error
  } = req.query || {};

  clear(res, STATE);

  if (error) {
    return redirect(res, "/?github_error=authorization_denied");
  }

  if (
    !expected ||
    !state ||
    expected !== state ||
    typeof code !== "string"
  ) {
    return redirect(res, "/?github_error=invalid_oauth_state");
  }

  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: callback()
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

  const userResponse = await gh(
    `${API}/user`,
    tokenData.access_token
  );

  const user = await userResponse.json();

  const data = {
    accessToken: tokenData.access_token,
    user: {
      id: user.id,
      login: user.login,
      name: user.name,
      avatar_url: user.avatar_url,
      html_url: user.html_url
    },
    createdAt: Date.now()
  };

  cookie(
    res,
    SESSION,
    encrypt(data),
    SESSION_SECONDS
  );

  redirect(res, "/");
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");

  try {
    const action = req.query?.action;

    if (action === "login" && req.method === "GET") {
      return await login(res);
    }

    if (action === "callback" && req.method === "GET") {
      return await oauthCallback(req, res);
    }

    if (action === "logout" && req.method === "GET") {
      clear(res, SESSION);
      clear(res, "graveyard_wallet_nonce");
      return redirect(res, "/");
    }

    if (action === "me" && req.method === "GET") {
      const s = session(req);

      return s
        ? json(res, 200, { user: s.user })
        : json(res, 401, { error: "Not authenticated." });
    }

    if (action === "repositories" && req.method === "GET") {
      const s = session(req);

      if (!s) {
        return json(res, 401, { error: "Not authenticated." });
      }

      const repos = [];

      for (let page = 1; page <= 20; page++) {
        const url = new URL(`${API}/user/repos`);

        Object.entries({
          visibility: "public",
          affiliation: "owner",
          sort: "pushed",
          direction: "desc",
          per_page: "100",
          page: String(page)
        }).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });

        const batch = await (
          await gh(url.toString(), s.accessToken)
        ).json();

        if (!Array.isArray(batch)) {
          throw new Error("Invalid repository data received from GitHub.");
        }

        repos.push(...batch);

        if (batch.length < 100) break;

        if (page === 20) {
          throw new Error("Repository scan limit reached.");
        }
      }

      const result = repos
        .filter(repo => !repo.fork && !repo.private)
        .map(repo => ({
          id: repo.id,
          name: repo.name,
          description: repo.description,
          html_url: repo.html_url,
          private: repo.private,
          fork: repo.fork,
          archived: repo.archived,
          created_at: repo.created_at,
          last_activity_at: repo.pushed_at,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          updated_at: repo.updated_at
        }));

      return json(res, 200, {
        repositories: result,
        count: result.length
      });
    }

    return json(res, 404, {
      error: "Unknown GitHub API action."
    });

  } catch (error) {
    console.error("GitHub Graveyard API:", error);

    return json(res, 500, {
      error: "Something went wrong while communicating with GitHub."
    });
  }
};