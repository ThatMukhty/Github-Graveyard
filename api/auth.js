export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  try {
    // 1. Securely exchange the temporary code for an access token using your GitHub Client Secret
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'json'
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
      return res.status(401).json({ error: "Failed to obtain access token from GitHub" });
    }

    // 2. Fetch the authenticated user's actual profile securely
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const userData = await userRes.json();

    // 3. Fetch their repositories (including private ones if they granted permission!)
    const reposRes = await fetch('https://api.github.com/user/repos?per_page=100&sort=pushed', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const reposData = await reposRes.json();

    // Send the verified user data and repositories back to your frontend safely
    return res.status(200).json({ user: userData, repos: reposData });

  } catch (err) {
    console.error('OAuth Error:', err);
    return res.status(500).json({ error: "Internal server error during authentication" });
  }
}