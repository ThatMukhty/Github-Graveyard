export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    const code = req.query.code;

    if (!code) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: "Missing authorization code" }));
    }

    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ error: "Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET environment variables on Vercel." }));
    }

    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
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

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: "GitHub token exchange failed", details: tokenData }));
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch authenticated user profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Git-Graveyard'
      }
    });
    const userData = await userResponse.json();

    // 3. Fetch user repositories
    const reposResponse = await fetch('https://api.github.com/user/repos?per_page=100&sort=pushed', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Git-Graveyard'
      }
    });
    const reposData = await reposResponse.json();

    res.statusCode = 200;
    return res.end(JSON.stringify({ user: userData, repos: reposData }));

  } catch (error) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: error.message || "Internal server error" }));
  }
}