module.exports = async function handler(req, res) {
  // Always respond with JSON headers
  res.setHeader('Content-Type', 'application/json');

  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: "No authorization code provided." });
    }

    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      return res.status(500).json({ error: "Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET in Vercel environment variables." });
    }

    // 1. Exchange code for token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return res.status(401).json({ error: "Failed to obtain access token from GitHub", details: tokenData });
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Git-Graveyard-App',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    const userData = await userRes.json();

    // 3. Fetch user repositories
    const reposRes = await fetch('https://api.github.com/user/repos?per_page=100&sort=pushed', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Git-Graveyard-App',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    const reposData = await reposRes.json();

    return res.status(200).json({ user: userData, repos: reposData });

  } catch (err) {
    console.error("Critical API Route Failure:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
};