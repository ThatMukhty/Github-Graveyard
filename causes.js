const GraveyardCauses = {
  fresh: [
    "Still breathing. The autopsy has been postponed."
  ],

  causes: [
    "Died of acute dependency hell. node_modules became heavier than the application.",
    "Abandoned after the developer discovered a shinier framework.",
    "Killed by an unresolved merge conflict on a Friday night.",
    "Died of chronic localhost syndrome. Nobody outside the developer's laptop ever saw it.",
    "Succumbed to terminal procrastination. The final command was never executed.",
    "Died waiting for the perfect README.",
    "Murdered by scope creep. A simple todo app became an imaginary enterprise platform.",
    "Killed by an API that changed its documentation without warning.",
    "Died of excessive console.log exposure.",
    "Abandoned after the developer watched one too many startup tutorials.",
    "Died waiting for version 2.0, which was never started.",
    "Killed by a configuration file nobody understood.",
    "Succumbed to an incurable CSS alignment problem.",
    "Died of severe tutorial dependency. Could not survive without following a video.",
    "Abandoned when the developer decided to rewrite everything in Rust.",
    "Killed by a database migration that nobody dared to run.",
    "Died after the first deployment error.",
    "Succumbed to README neglect. The documentation contained only 'coming soon'.",
    "Killed by an expired API key and an unwilling developer.",
    "Died of chronic feature addiction. The MVP never arrived.",
    "Abandoned after the developer discovered a new JavaScript library.",
    "Died from an overdose of unnecessary abstractions.",
    "Killed by a package update that broke everything.",
    "Succumbed to environment variable confusion.",
    "Died waiting for the developer to return from a short break.",
    "Abandoned after the first negative comment.",
    "Killed by an authentication flow that became a full-time job.",
    "Died of premature optimization before acquiring a single user.",
    "Succumbed to a fatal lack of deployment documentation.",
    "Killed by a forgotten .env file.",
    "Died after the developer realized the idea required actual users.",
    "Abandoned in favour of a completely unrelated side project.",
    "Killed by an endless redesign cycle.",
    "Died of severe commit message neglect. Its final record was 'stuff'.",
    "Succumbed to an unhandled promise rejection.",
    "Killed by a broken build pipeline.",
    "Died waiting for a domain name that was never purchased.",
    "Abandoned after the developer discovered AI could generate another project.",
    "Killed by an outdated dependency nobody wanted to update.",
    "Died from excessive brainstorming and insufficient execution.",
    "Succumbed to a missing semicolon that was never actually missing.",
    "Killed by an overcomplicated folder structure.",
    "Died of chronic perfectionism. It was never good enough to launch.",
    "Abandoned after the developer changed the product name for the seventh time.",
    "Killed by a deployment platform that refused to cooperate.",
    "Died waiting for the first paying customer.",
    "Succumbed to the mysterious disappearance of the original developer.",
    "Killed by an incomplete payment integration.",
    "Died of severe frontend-backend communication failure.",
    "Abandoned after the developer realized the project needed a backend.",
    "Killed by a forgotten database password.",
    "Died of excessive feature requests from imaginary users.",
    "Succumbed to a dependency update with catastrophic consequences.",
    "Killed by an undocumented breaking change.",
    "Died waiting for the developer's motivation to return.",
    "Abandoned after the developer discovered a better project name.",
    "Killed by an ambitious roadmap and a very short attention span.",
    "Died of chronic placeholder content. Every section said 'Lorem ipsum'.",
    "Succumbed to a fatal shortage of test coverage.",
    "Killed by an untested production deployment.",
    "Died after the developer forgot how the code worked.",
    "Abandoned when the original idea stopped feeling exciting.",
    "Killed by a missing database index.",
    "Died of severe mobile responsiveness neglect.",
    "Succumbed to an infinite loading spinner.",
    "Killed by a broken OAuth callback.",
    "Died waiting for a feature that was supposed to take ten minutes.",
    "Abandoned after the developer started a new repository with the same idea.",
    "Killed by an expired SSL certificate.",
    "Died of chronic GitHub notification avoidance.",
    "Succumbed to a fatal lack of user feedback.",
    "Killed by a hardcoded value nobody remembered.",
    "Died after the developer decided to learn another programming language.",
    "Abandoned because the prototype looked better than the actual product.",
    "Killed by a forgotten database backup.",
    "Died from an overdose of unnecessary npm packages.",
    "Succumbed to an endless authentication redesign.",
    "Killed by a broken environment configuration.",
    "Died waiting for the perfect logo.",
    "Abandoned after the developer discovered a more exciting side hustle.",
    "Killed by a failed refactor that nobody reverted.",
    "Died of chronic technical debt.",
    "Succumbed to a fatal absence of production monitoring.",
    "Killed by an API rate limit nobody anticipated.",
    "Died after the developer decided the market was too crowded.",
    "Abandoned because the launch announcement never got written.",
    "Killed by an unmaintained third-party service.",
    "Died of excessive planning. The code was always coming tomorrow.",
    "Succumbed to a mysterious branch nobody merged.",
    "Killed by a forgotten cron job.",
    "Died waiting for the developer to finish university assignments.",
    "Abandoned after the developer lost access to the original laptop.",
    "Killed by a failed database connection pool.",
    "Died of severe documentation abandonment.",
    "Succumbed to a fatal lack of deployment confidence.",
    "Killed by a feature that worked only on the developer's machine.",
    "Died after the developer announced a complete rewrite.",
    "Abandoned when the developer opened a new repository instead of fixing this one.",
    "Killed by the legendary final 5% that took six months."
  ],

  getCause(daysInactive) {
    if (!Number.isFinite(daysInactive) || daysInactive < 30) {
      return {
        status: "alive",
        label: "STILL BREATHING",
        cause: this.fresh[0]
      };
    }

    let stage;

    if (daysInactive < 60) {
      stage = "RECENTLY ABANDONED";
    } else if (daysInactive < 90) {
      stage = "SHOWING SIGNS OF DECAY";
    } else if (daysInactive < 120) {
      stage = "PRESUMED DEAD";
    } else {
      stage = "LONG DEAD";
    }

    const index = Math.floor(
      daysInactive / 30
    ) % this.causes.length;

    return {
      status: "dead",
      label: stage,
      cause: this.causes[index]
    };
  }
};

if (typeof window !== "undefined") {
  window.GraveyardCauses = GraveyardCauses;
}