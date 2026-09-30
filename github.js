/**
 * GITHUB GRAVEYARD — REPOSITORY SCANNER & METRICS ENGINE
 * Handles API requests, commit age calculations, mortality tiers, and capped token math.
 */

window.GraveyardScanner = (function () {
    // API Proxy Endpoint (Python Backend)
    const API_BASE_URL = 'http://localhost:8000/api';

    /**
     * Parse raw repository input string into { owner, repo }
     * Handles inputs like: "owner/repo", "https://github.com/owner/repo"
     */
    function parseRepoInput(input) {
        if (!input) return null;
        let cleaned = input.trim().replace(/^https?:\/\/github\.com\//, '');
        cleaned = cleaned.replace(/\/$/, '');
        const parts = cleaned.split('/');
        
        if (parts.length >= 2) {
            return { owner: parts[0], repo: parts[1] };
        }
        return null;
    }

    /**
     * Calculate days elapsed since the last commit (`pushed_at`)
     */
    function calculateDaysInactive(pushedAt) {
        const lastPush = new Date(pushedAt);
        const now = new Date();
        const diffTime = Math.abs(now - lastPush);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Compute Mortality Tier, Badge Style, and Classification
     */
    function getMortalityTier(days) {
        if (days <= 30) {
            return { name: 'Alive', class: 'tier-alive', badgeClass: 'badge-alive', canBury: false };
        } else if (days <= 90) {
            return { name: 'Fading', class: 'tier-fading', badgeClass: 'badge-fading', canBury: false };
        } else if (days <= 180) {
            return { name: 'Abandoned', class: 'tier-abandoned', badgeClass: 'badge-abandoned', canBury: true };
        } else {
            return { name: 'Dead', class: 'tier-dead', badgeClass: 'badge-dead', canBury: true };
        }
    }

    /**
     * Compute Mortality Score (0 - 100)
     */
    function calculateMortalityScore(days) {
        if (days <= 30) return 0;
        const score = Math.floor((days / 365) * 100);
        return Math.min(100, score);
    }

    /**
     * Calculate $GRAVEYARD Token Emission Reward with 500 Token Cap
     */
    function calculateTokenReward(days, canBury) {
        if (!canBury) return 0;
        const rawReward = 100 + (days * 0.5);
        // Cap token emission at a maximum of 500 $GRAVEYARD tokens per repository
        return Math.min(500, Math.floor(rawReward));
    }

    /**
     * Fetch Repository Details via Backend Proxy
     */
    async function scanRepository(owner, repo) {
        try {
            const response = await fetch(`${API_BASE_URL}/scan/${owner}/${repo}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Repository not found on GitHub.');
                }
                throw new Error(`Scanner Error (${response.status})`);
            }
            return await response.json();
        } catch (err) {
            // Fallback: If proxy is down, attempt direct client fetch (Subject to IP limits)
            console.warn('Proxy unreachable, attempting direct GitHub API fallback...');
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
    }

    /**
     * Render Repository Card HTML in DOM
     */
    function renderRepoCard(data, metrics) {
        const container = document.getElementById('repo-card-anchor');
        const resultsSection = document.getElementById('results-section');
        
        if (!container || !resultsSection) return;

        const buryButtonHtml = metrics.tier.canBury
            ? `<button id="bury-repo-btn" class="btn btn-primary" data-repo="${data.full_name}" data-tokens="${metrics.reward}">
                    <span>Bury Repo & Claim ${metrics.reward} $GRAVEYARD</span>
               </button>`
            : `<button class="btn btn-secondary" disabled>Active & Healthy (Cannot Bury)</button>`;

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

                <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 0.5rem;">
                    ${buryButtonHtml}
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
        scanRepository,
        renderRepoCard
    };
})();