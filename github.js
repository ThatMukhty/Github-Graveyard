/**
 * GITHUB GRAVEYARD — REPOSITORY SCANNER & METRICS ENGINE
 */

window.GraveyardScanner = (function () {
    // Configurable API Proxy (falls back gracefully)
    const API_BASE_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:8000/api' 
        : null;

    function parseRepoInput(input) {
        if (!input) return null;
        let cleaned = input.trim().replace(/^https?:\/\/(www\.)?github\.com\//, '');
        cleaned = cleaned.replace(/\/$/, '');
        const parts = cleaned.split('/');
        
        if (parts.length >= 2) {
            return { owner: parts[0], repo: parts[1] };
        }
        return null;
    }

    function calculateDaysInactive(pushedAt) {
        const lastPush = new Date(pushedAt);
        const now = new Date();
        const diffTime = Math.abs(now - lastPush);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Compute Mortality Tier
     * Fixed: Repos > 30 days inactive can now be buried.
     */
    function getMortalityTier(days) {
        if (days <= 30) {
            return { name: 'Alive', class: 'tier-alive', badgeClass: 'badge-alive', canBury: false };
        } else if (days <= 90) {
            return { name: 'Fading', class: 'tier-fading', badgeClass: 'badge-fading', canBury: true };
        } else if (days <= 180) {
            return { name: 'Abandoned', class: 'tier-abandoned', badgeClass: 'badge-abandoned', canBury: true };
        } else {
            return { name: 'Dead', class: 'tier-dead', badgeClass: 'badge-dead', canBury: true };
        }
    }

    function calculateMortalityScore(days) {
        if (days <= 30) return 0;
        const score = Math.floor((days / 365) * 100);
        return Math.min(100, score);
    }

    function calculateTokenReward(days, canBury) {
        if (!canBury) return 0;
        const rawReward = 100 + (days * 0.5);
        return Math.min(500, Math.floor(rawReward));
    }

    /**
     * Cause of Death Generator
     */
    function generateCauseOfDeath(data, days) {
        const causes = [
            `Maintainer left for a 5-minute coffee break ${days} days ago and never returned.`,
            `Crushed under the weight of ${data.open_issues_count || 42} unaddressed GitHub issues.`,
            `Died of sheer boredom after zero commits since ${new Date(data.pushed_at).getFullYear()}.`,
            `Abandoned after the lead dev discovered sunlight and going outside.`,
            `Fatal error: Replaced by a 10-line AI prompt that does the same thing.`,
            `Drowned in a sea of broken dependencies and deprecated node modules.`
        ];
        const index = Math.abs(data.name.length + days) % causes.length;
        return causes[index];
    }

    async function scanRepository(owner, repo) {
        if (API_BASE_URL) {
            try {
                const response = await fetch(`${API_BASE_URL}/scan/${owner}/${repo}`);
                if (response.ok) return await response.json();
            } catch (err) {
                console.info('Proxy offline, using direct GitHub API call...');
            }
        }

        const fallbackRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (!fallbackRes.ok) {
            throw new Error('Repository not found or GitHub API limit reached.');
        }
        const data = await fallbackRes.json();
        return {
            name: data.name,
            full_name: data.full_name,
            owner: data.owner.login,
            pushed_at: data.pushed_at,
            created_at: data.created_at,
            stargazers_count: data.stargazers_count,
            forks_count: data.forks_count,
            open_issues_count: data.open_issues_count,
            html_url: data.html_url,
            description: data.description || ''
        };
    }

    function renderRepoCard(data, metrics) {
        const container = document.getElementById('repo-card-anchor');
        const resultsSection = document.getElementById('results-section');
        
        if (!container || !resultsSection) return;

        const walletState = window.GraveyardWallet ? window.GraveyardWallet.getState() : { address: null };
        const causeOfDeath = generateCauseOfDeath(data, metrics.daysInactive);

        let buryActionHtml = '';
        if (!metrics.tier.canBury) {
            buryActionHtml = `<button class="btn btn-secondary" disabled>Active & Healthy (Cannot Bury)</button>`;
        } else if (!walletState.address) {
            buryActionHtml = `<button id="connect-wallet-trigger-btn" class="btn btn-primary">Connect Wallet to Bury</button>`;
        } else {
            buryActionHtml = `<button id="bury-repo-btn" class="btn btn-primary" data-repo="${data.full_name}" data-tokens="${metrics.reward}">
                    <span>Bury Repo & Claim ${metrics.reward} $GRAVEYARD</span>
               </button>`;
        }

        // Twitter Share Text
        const tweetText = encodeURIComponent(`🪦 RIP ${data.full_name}\n\nDays Inactive: ${metrics.daysInactive}\nMortality Score: ${metrics.mortalityScore}/100\nCause of Death: "${causeOfDeath}"\n\nBuried on @GitGraveyard 🚀\nhttps://gitgraveyard.xyz`);
        const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

        container.innerHTML = `
            <div class="glass-card repo-card ${metrics.tier.class}">
                <div class="repo-card-header">
                    <div>
                        <a href="${data.html_url}" target="_blank" class="repo-title-link">${data.full_name}</a>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">
                            ${data.description || 'No description provided.'}
                        </p>
                    </div>
                    <span class="mortality-badge ${metrics.tier.badgeClass}">${metrics.tier.name}</span>
                </div>

                <div style="background: rgba(239, 68, 68, 0.08); border-left: 3px solid var(--blood-red); padding: 0.75rem; border-radius: 4px; margin: 0.5rem 0;">
                    <span style="font-size: 0.75rem; color: var(--blood-red); font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Cause of Death:</span>
                    <p style="font-size: 0.9rem; font-style: italic; color: var(--text-primary); margin-top: 0.2rem;">"${causeOfDeath}"</p>
                </div>

                <div class="repo-metrics-grid">
                    <div class="metric-item">
                        <span class="metric-label">Days Inactive</span>
                        <span class="metric-value">${metrics.daysInactive}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Mortality Score</span>
                        <span class="metric-value">${metrics.mortalityScore}/100</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Burial Reward</span>
                        <span class="metric-value">${metrics.reward} $GRAVEYARD</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Stars / Forks</span>
                        <span class="metric-value">⭐ ${data.stargazers_count} / 🍴 ${data.forks_count}</span>
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; flex-wrap: wrap;">
                    <a href="${tweetUrl}" target="_blank" class="btn btn-secondary" style="text-decoration: none;">
                        <span>Share on 𝕏</span>
                    </a>
                    ${buryActionHtml}
                </div>
            </div>
        `;

        resultsSection.classList.remove('hidden');
    }

    return {
        parseRepoInput,
        calculateDaysInactive,
        getMortalityTier,
        calculateMortalityScore,
        calculateTokenReward,
        generateCauseOfDeath,
        scanRepository,
        renderRepoCard
    };
})();