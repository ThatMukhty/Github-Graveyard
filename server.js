const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Step 1: Redirect to GitHub OAuth
app.get('/api/auth/github', (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=https://gitgraveyard.xyz/api/auth/callback&scope=repo`;
    res.redirect(githubAuthUrl);
});

// Step 2: Handle GitHub OAuth Callback & Token Exchange
app.get('/api/auth/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send('Authorization code missing.');

    try {
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code,
            redirect_uri: 'https://gitgraveyard.xyz/api/auth/callback'
        }, {
            headers: { Accept: 'application/json' }
        });

        const accessToken = tokenResponse.data.access_token;
        if (!accessToken) return res.status(400).send('Failed to retrieve access token from GitHub.');

        res.redirect(`/?token=${accessToken}`);
    } catch (error) {
        console.error('OAuth exchange error:', error.response?.data || error.message);
        res.status(500).send('Authentication handshake failed.');
    }
});

// Step 3: Secure proxy to fetch authenticated user repos
app.get('/api/repos', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No authorization token provided.' });

    try {
        const response = await axios.get('https://api.github.com/user/repos?sort=updated&direction=asc&per_page=100', {
            headers: { Authorization: authHeader }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Fetch repos error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch repositories from GitHub.' });
    }
});

app.listen(PORT, () => {
    console.log(`[GITGRAVEYARD] Server spinning on port ${PORT}`);
});