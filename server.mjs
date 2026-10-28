import express from 'express';
import session from 'express-session';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Put your GitHub credentials here once you register your GitHub app
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'YOUR_CLIENT_ID_HERE';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'YOUR_CLIENT_SECRET_HERE';

app.use(express.static(__dirname));
app.use(session({
  secret: 'github-graveyard-creepy-secret-key',
  resave: false,
  saveUninitialized: true
}));

// 1. Redirect user to GitHub for login
app.get('/auth/github', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo`;
  res.redirect(githubAuthUrl);
});

// 2. GitHub callback handler
app.get('/auth/github/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect('/');

  try {
    const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code
    }, {
      headers: { accept: 'json' }
    });

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) return res.redirect('/');

    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const reposRes = await axios.get('https://api.github.com/user/repos?per_page=100&sort=pushed', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const now = new Date();
    const formattedRepos = reposRes.data.map(repo => {
      const lastPushed = new Date(repo.pushed_at);
      const diffTime = Math.abs(now - lastPushed);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        name: repo.name,
        daysInactive: diffDays,
        stars: repo.stargazers_count,
        fork: repo.fork
      };
    }).filter(repo => !repo.fork);

    req.session.user = userRes.data;
    req.session.repos = formattedRepos;

    res.redirect('/');
  } catch (err) {
    console.error('OAuth Error:', err.response?.data || err.message);
    res.redirect('/');
  }
});

// 3. API endpoint for the frontend
app.get('/api/user', (req, res) => {
  if (!req.session.user) {
    return res.json({ authenticated: false });
  }
  res.json({
    authenticated: true,
    user: req.session.user,
    repos: req.session.repos
  });
});

app.listen(PORT, () => {
  console.log(`💀 GitHub Graveyard running on http://localhost:${PORT}`);
});