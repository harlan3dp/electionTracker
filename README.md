# NZ Election Tracker

Independent dashboard for the 7 November 2026 New Zealand General Election.
**Stage 1: demonstration foundation. No live election results are connected.**

## Local development

Use Node 22.12+ (see `.nvmrc`) and npm.

```sh
npm ci
npm run dev
```

Vite serves the UI on port 5173. The dashboard deliberately uses fictional figures, visibly labelled throughout. Electorate search, refresh, and feed integration are future stages. No API keys or environment variables are required.

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

- Stage 2: electorate search and results, further responsive/accessibility testing.
- Stage 3: verify access, permissions, real XML format, and update cadence for `http://media.election.net.nz/xml/`; implement a validated, cached Pages Functions adapter, refresh and loading/stale/unavailable states. No feed claims have been verified yet.
- Stage 4: mobile/desktop testing, election data accuracy, failure testing, deployment verification, and confirmation of applicable election-day publishing requirements before public release.

Official results: https://www.electionresults.govt.nz/
