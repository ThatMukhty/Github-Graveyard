/**
 * GITHUB GRAVEYARD — REPOSITORY SCANNER & BIO OWNERSHIP VERIFIER
 */

window.GraveyardScanner = (() => {
    /* ==========================================================================
       1. CAUSES OF DEATH ARRAY
       ========================================================================== */
    const causesOfDeathList = [
        "Maintainer left for a 5-minute coffee break and never returned.",
        "Crushed under the weight of unaddressed GitHub issues.",
        "Died of sheer boredom after zero commits since last year.",
        "Abandoned after the lead dev discovered sunlight and going outside.",
        "Fatal error: Replaced by a 10-line AI prompt that does the same thing.",
        "Drowned in a sea of broken dependencies and deprecated node modules.",
        "The solo developer got hired by Big Tech and forgot their 2FA credentials.",
        "Succumbed to 999 unmerged PRs titled 'fixed typo in README.md'.",
        "Struck down by a breaking framework release that nobody wanted to migrate.",
        "Flatlined when the original creator realized Web3 wasn't just a 2-week phase.",
        "Exhumed with 0 open PRs because everyone gave up trying to build locally.",
        "Corrupted by node_modules exceeding the total mass of the known universe.",
        "Decayed silently after the primary maintainer deleted their Discord account.",
        "Victim of a forced force-push to main that nobody dared to fix.",
        "Ghosted by its own creator immediately after pushing the initial commit.",
        "Lead architect rage-quit after arguing with an automated linter for 6 hours.",
        "Fell into a coma waiting for the CI/CD pipeline to complete.",
        "Died in production after a junior dev committed directly to main on a Friday at 4:59 PM.",
        "Lost forever in a merge conflict that involved 412 files and no backup.",
        "Abandoned when the maintainer realized they wrote 10,000 lines without a single comment or doc.",
        "Starved to death because nobody hit the ⭐ Star button.",
        "Asphyxiated by a nested `.then()` chain 40 levels deep.",
        "Died when the API key expired and the developer lost access to the original email.",
        "Killed by an unexpected `null` pointer exception in production.",
        "Eaten alive by a swarm of Dependabot alerts.",
        "Died of embarrassment after the hardcoded API keys were pushed to public main.",
        "Decayed after the developer said 'I'll finish this project this weekend' 3 years ago.",
        "Succumbed to an endless loop with no exit condition.",
        "Died when the free tier database reached its storage quota.",
        "Crushed by a 50GB `vendor` folder accidentally committed to git history.",
        "Bleed to death from 10,000 unit test failures ignored with `--force`.",
        "Abandoned after the maintainer decided to rewrite the entire stack in Rust.",
        "Died of starvation while waiting for `npm install` to finish on hotel Wi-Fi.",
        "Perished when someone typed `git reset --hard HEAD~100` instead of `git status`.",
        "Suffocated under a mountain of unanswered StackOverflow questions.",
        "Died when the staging server was repurposed for crypto mining.",
        "Killed by a missing semicolon in a legacy file nobody touched since 2014.",
        "Decayed after the lead engineer forgot which microservice does what.",
        "Died when the developer switched operating systems and gave up setting up Docker.",
        "Crushed by a breaking change in a minor patch release of a transitive dependency.",
        "Perished during an unannounced database migration on a live server.",
        "Died when the developer realized the competitor launched an identical app 2 days earlier.",
        "Abandoned because the code only runs on the creator's machine.",
        "Died of fatigue after 48 continuous hours at a hackathon.",
        "Decayed when the domain name expired and was bought by a domain squatter.",
        "Suffocated by 500 open discussions debating tabs vs spaces.",
        "Killed by an infinite recursion that overflowed the call stack into oblivion.",
        "Died when the maintainer's laptop fell into a swimming pool.",
        "Abandoned when the team realized the core feature was impossible under the laws of physics.",
        "Decayed after being labeled 'Good First Issue' and remaining untouched forever."
    ];

    // Pad to 500 entries dynamically
    for (let i = 51; i <= 500; i++) {
        causesOfDeathList.push(`Unusual Death Case #${i}: Repo flatlined after complete maintainer ghosting and zero activity.`);
    }

    /* ==========================================================================
       2. REPOSITORY SCANNER FUNCTIONS
       ========================================================================== */
    function parseRepoInput(input) {
        if (!input) return null;
        let cleaned = input.trim().replace(/\/$/, '');

        const urlMatch = cleaned.match(/github\.com\/([^\/]+)\/([^\/]+)/i);
        if (urlMatch) {
            return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/i, '') };
        }

        const pairMatch = cleaned.match(/^([^\/]+)\/([^\/]+)$/);
        if (pairMatch) {
            return { owner: pairMatch[1], repo: pairMatch[2] };
        }

        return null;
    }

    async function scanRepository(owner, repo) {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Repository '${owner}/${repo}' not found on GitHub.`);
            } else if (response.status === 403) {
                throw new Error("GitHub API rate limit exceeded. Please try again later.");
            }
            throw new Error(`GitHub API Error: ${response.statusText}`);
        }
        return await response.json();
    }

    function calculateDaysInactive(pushedAtString) {
        const lastPush = new Date(pushedAtString);
        const now = new Date();
        const diffTime = Math.abs(now - lastPush);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    function getMortalityTier(days) {
        if (days < 30) return { tier: "ACTIVE", label: "Alive & Kicking", canBury: false };
        if (days < 90) return { tier: "FADING", label: "Fading Pulse", canBury: true };
        if (days < 365) return { tier: "CRITICAL", label: "Comatose", canBury: true };
        return { tier: "DEAD", label: "Certified Dead", canBury: true };
    }

    function calculateMortalityScore(days) {
        const score = Math.min(100, Math.floor((days / 365) * 100));
        return Math.max(1, score);
    }

    function calculateTokenReward(days, canBury) {
        if (!canBury) return 0;
        return Math.min(10000, Math.floor(days * 10.5));
    }

    function generateCauseOfDeath(data, days) {
        const repoName = data.name || "repo";
        const charSum = repoName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const index = Math.abs(charSum + days) % causesOfDeathList.length;
        return causesOfDeathList[index];
    }

    /* ==========================================================================
       3. BIO OWNERSHIP VERIFIER
       ========================================================================== */
    async function verifyRepoOwnership(githubUsername, walletAddress) {
        try {
            const response = await fetch(`https://api.github.com/users/${githubUsername}`);
            if (!response.ok) {
                throw new Error(`Could not fetch GitHub user profile for '${githubUsername}'.`);
            }
            
            const userData = await response.json();
            const userBio = userData.bio || '';
            const expectedCode = `GRAVEYARD-${walletAddress.substring(0, 8).toUpperCase()}`;

            if (userBio.includes(expectedCode)) {
                return { verified: true, expectedCode };
            } else {
                return { verified: false, expectedCode, currentBio: userBio };
            }
        } catch (err) {
            throw new Error(`Security verification failed: ${err.message}`);
        }
    }

    /* ==========================================================================
       4. UI CARD RENDERER
       ========================================================================== */
    function renderRepoCard(repo, metrics) {
        const container = document.getElementById('results-container');
        if (!container) return;

        const walletState = window.GraveyardWallet ? window.GraveyardWallet.getState() : { address: null };

        container.innerHTML = `
            <div class="repo-card glass-card" style="background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.5rem; margin-top: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
                    <div>
                        <h2 style="font-size: 1.5rem; margin: 0; color: #f0f6fc;">${repo.full_name}</h2>
                        <p style="font-size: 0.85rem; color: #8b949e; margin-top: 0.25rem;">${repo.description || 'No description provided.'}</p>
                    </div>
                    <span class="status-badge status-${metrics.tier.tier.toLowerCase()}" style="padding: 0.25rem 0.75rem; border-radius: 20px; font-weight: bold; font-size: 0.8rem; background: rgba(255,255,255,0.05); color: #ff5555; border: 1px solid #ff5555;">
                        ${metrics.tier.label}
                    </span>
                </div>

                <div class="repo-metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; margin-bottom: 1.25rem;">
                    <div>
                        <span style="display: block; font-size: 0.75rem; color: #8b949e;">Days Inactive</span>
                        <strong style="font-size: 1.2rem; color: #f0f6fc;">${metrics.daysInactive}</strong>
                    </div>
                    <div>
                        <span style="display: block; font-size: 0.75rem; color: #8b949e;">Mortality Score</span>
                        <strong style="font-size: 1.2rem; color: #f0f6fc;">${metrics.mortalityScore}/100</strong>
                    </div>
                    <div>
                        <span style="display: block; font-size: 0.75rem; color: #8b949e;">Stars / Forks</span>
                        <strong style="font-size: 1.2rem; color: #f0f6fc;">⭐ ${repo.stargazers_count} / 🍴 ${repo.forks_count}</strong>
                    </div>
                    <div>
                        <span style="display: block; font-size: 0.75rem; color: #8b949e;">Burial Reward</span>
                        <strong style="font-size: 1.2rem; color: #50fa7b;">+${metrics.reward} $GRAVEYARD</strong>
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 0.75rem; flex-wrap: wrap;">
                    ${metrics.tier.canBury 
                        ? `<button id="bury-repo-btn" class="btn btn-primary" style="padding: 0.75rem 1.25rem;">
                             🪦 ${walletState.address ? 'Verify & Bury Repository' : 'Connect Wallet to Bury'}
                           </button>`
                        : `<button class="btn btn-disabled" disabled style="opacity: 0.5; cursor: not-allowed; padding: 0.75rem 1.25rem;">
                             Repository Still Alive
                           </button>`
                    }
                </div>
            </div>
        `;
    }

    return {
        parseRepoInput,
        scanRepository,
        calculateDaysInactive,
        getMortalityTier,
        calculateMortalityScore,
        calculateTokenReward,
        generateCauseOfDeath,
        verifyRepoOwnership,
        renderRepoCard
    };
})();