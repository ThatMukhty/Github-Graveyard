module.exports = async (req, res) => {
  // Set JSON content type header immediately so frontend never gets text/html
  res.setHeader('Content-Type', 'application/json');

  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: "No authorization code provided in query params." });
  }

  // Validate that environment variables exist before calling fetch
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    console.error("CRITICAL CONFIG ERROR: Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET environment variables.");
    return res.status(500).json({ error: "Server misconfiguration: Missing GitHub OAuth environment variables on Vercel." });
  }

  try {
    // 1. Exchange code for access token
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

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("GitHub Token Exchange Failed:", tokenData);
      return res.status(401).json({ 
        error: "GitHub token exchange failed", 
        details: tokenData.error_description || tokenData.message || "Invalid or expired code." 
      });
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch authenticated user data
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Git-Graveyard-App',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const userData = await userRes.json();

    if (!userRes.ok) {
      console.error("GitHub User API Failed:", userData);
      return res.status(userRes.status).json({ error: "Failed to fetch GitHub user profile", details: userData.message });
    }

    // 3. Fetch user repositories
    const reposRes = await fetch('https://api.github.com/user/repos?per_page=100&sort=pushed', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Git-Graveyard-App',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const reposData = await reposRes.json();

    if (!reposRes.ok) {
      console.error("GitHub Repos API Failed:", reposData);
      return res.status(reposRes.status).json({ error: "Failed to fetch GitHub repositories", details: reposData.message });
    }

    // Success response
    return res.status(200).json({ user: userData, repos: reposData });

  } catch (err) {
    console.error('Unhandled Serverless Exception:', err);
    return res.status(500).json({ error: "Internal server error during authentication", message: err.message });
  }
};