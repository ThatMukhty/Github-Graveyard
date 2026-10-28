module.exports = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  try {
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
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.status(401).json({ error: "Failed to obtain access token from GitHub: " + JSON.stringify(tokenData) });
    }

    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Git-Graveyard-App'
      }
    });

    const userData = await userRes.json();

    const reposRes = await fetch('https://api.github.com/user/repos?per_page=100&sort=pushed', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Git-Graveyard-App'
      }
    });

    const reposData = await reposRes.json();

    return res.status(200).json({ user: userData, repos: reposData });

  } catch (err) {
    console.error('OAuth Error:', err);
    return res.status(500).json({ error: err.message || "Internal server error during authentication" });
  }
};