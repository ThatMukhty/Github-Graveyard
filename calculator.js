// Calculates Zauth-style score (0 - 100) based on repo quality metrics
export function calculateRepoScore({ stars, commits, monthsInactive, forks }) {
  let score = 0;

  // Star power (max 40 pts)
  score += Math.min(stars * 2, 40);

  // Historical effort / Commits (max 30 pts)
  score += Math.min(commits * 0.5, 30);

  // Inactivity multiplier - deeper graveyard status (max 30 pts)
  score += Math.min(monthsInactive * 2.5, 30);

  return Math.min(Math.round(score), 100);
}

// Calculates $GRAVEYARD tokens awarded
export function calculateTokenReward(score, baseReward = 1000) {
  return Math.floor(baseReward * (score / 100));
}