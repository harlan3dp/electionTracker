# NZ Election Tracker

Independent dashboard for the 7 November 2026 New Zealand General Election.
**Stage 2: demonstration dashboard and interactive scenario tools. No live election results are connected.**

## Local development

Use Node 22.12+ (see `.nvmrc`) and npm.

```sh
npm ci
npm run dev
```

Vite serves the UI on port 5173. The dashboard deliberately uses fictional figures, visibly labelled throughout. Electorate search covers an illustrative subset with synthetic candidates. Refresh and feed integration are future stages. No API keys or environment variables are required.

```sh
npm test
npm run typecheck
npm run build
npm run preview
```

Vite does not run Pages Functions. `/api/status` is a Pages Function that reports live data as unavailable and links to the official site. It never returns demonstration votes. Test it locally with `npx wrangler pages dev dist` after building (Wrangler requires a separate installation/download), or on a Cloudflare preview deployment. Unit tests exercise the handler directly.

## Cloudflare Pages deployment

1. Connect this GitHub repository to Cloudflare Pages using the Git integration.
2. Set production branch to `main`, build command to `npm run build`, output directory to `dist`, and root directory to the repository root.
3. Use Node 22.12+ for the build (set `NODE_VERSION=22` in Cloudflare if needed).
4. Pages automatically includes the root `functions/` directory. `wrangler.jsonc` records the output directory and compatibility date.
5. Pull requests receive preview deployments once the integration is configured. Merging to `main` triggers production deployment.
6. Verify the dashboard labels all values as demo and `/api/status` returns `mode: unavailable` before sharing a preview.

Cloudflare account connection, project creation, a public URL, and automatic deployment require a maintainer to configure the Git integration. They have not been provisioned by this repository. No secrets belong in source control.

## Collaboration

Use separate feature branches and pull requests; never push directly to `main`. CI runs tests, TypeScript checks, and the production build. Enable branch protection and require CI and review in GitHub settings. See `AGENTS.md` for shared instructions.

The repository was initially empty, with no `main` branch. A maintainer must initialize a base branch before GitHub can accept the first pull request. The foundation is kept on a feature branch.

## Remaining stages

- Stage 2 implemented: searchable demo electorate subset, region filters, geographic schematic, candidate leaders, a Parliament scenario and remaining-vote target calculator. Official electorate boundaries, complete 2026 roster and real candidates still need verified sources. The schematic deliberately makes no boundary claims.
- Stage 3: verify access, permissions, real XML format, and update cadence for `http://media.election.net.nz/xml/`; implement a validated, cached Pages Functions adapter, refresh and loading/stale/unavailable states. No feed claims have been verified yet.
- Stage 4: mobile/desktop testing, election data accuracy, failure testing, deployment verification, and confirmation of applicable election-day publishing requirements before public release.

Official results: https://www.electionresults.govt.nz/

## Analysis and visualisation scope

The geographic selector uses approximate locations for 11 demonstration electorates, not official polygons or a complete 2026 map. Colours identify fictional leading parties; selection also works through the text list. All candidates and votes are synthetic. No winners are declared.

The Parliament graphic allocates a fixed 120 seats with Sainte-Laguë divisors (1, 3, 5…). It assumes every listed party is eligible and omits electorate seats, qualification rules, overhangs and other official allocation rules. Ties use display order. Changing Labour’s share scales other demo parties proportionally. Coalition checkboxes express user scenarios, not political agreements. This is not a projected election result.

The remaining-vote calculator solves `(target - current * countedFraction) / remainingFraction`. It assumes a known fixed final party-vote total. Reporting-place percentages are not interchangeable with that fraction. A Labour vote-share target is not a threshold to win or form a government.

Before adding in-depth forecasts:

1. Verify official 2026 electorate boundaries, roster, candidate lists, reuse permissions and provenance; include Māori electorates and handle overlapping geography.
2. Ingest verified historical results with boundary crosswalks. Do not compare changed boundaries as though electorates were unchanged.
3. Record poll publisher, fieldwork dates, sample, methodology, uncertainty and reuse rights; distinguish polls from counted votes.
4. Model reporting order and special votes, implement complete MMP eligibility and seat rules, and backtest before publishing projections. Publish assumptions, source timestamps, model version and uncertainty.
5. Define “win” explicitly: most party votes, most seats, or parliamentary support to form a government. Do not infer agreements from a user-selected grouping.
6. Review election-day publishing requirements before public release, particularly poll and predictive material.

No live forecasts, historical comparisons or poll estimates are currently produced.
