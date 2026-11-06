# NZ Election Tracker

Independent React/TypeScript/Vite/Tailwind dashboard, deployed with Cloudflare Pages and Pages Functions. **No verified live results are connected.** Results default to an honest unavailable state; invented vote totals are opt-in.

## Development

Use Node 22.12+ and npm (see `.nvmrc`).

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run build
npm run preview
```

Vite serves port 5173; it does not execute Pages Functions. The `/api/status` handler deliberately reports live results as unavailable and is exercised by unit tests. For a local Pages runtime, build and run `npx wrangler pages dev dist` (requires a separate Wrangler installation/download). No API keys or environment variables are required for the bundled interface.

## Navigation and data boundaries

- **Results:** no fictional votes by default. Explicit demo toggle reveals fictional party votes.
- **Electorates:** 11 general reference entries and seven named Māori electorate references from the 2023 roster. Search is macron-insensitive; separate General/Māori/Both roll controls avoid implying non-overlapping boundaries. Te Tai Tonga spans both islands. The island filter includes Te Tai Tonga in both islands; its map anchor remains in the South Island.
- **Parties:** 17 names from an editorial historical 2023 party-vote reference. This is not a verified current party register or full list of 2026 candidates. Scenario selectors include every reference name; added parties have zero fictional baseline votes, which makes no claim about real support.
- **Coalitions:** three hypothetical presets, a chamber illustration, and custom grouping controls. These do not imply political agreements or likely governments.
- **Analysis:** current analysis is unavailable. Opt-in demo analysis computes the fictional party-vote margin and simplified seats. A target-share calculator supports every listed party.
- **Sources:** source destinations, data limitations, and verification status. Names of 2023 elected representatives are manually entered historical references, explicitly not current MP or 2026 candidate claims. Source rechecks are pending; later by-elections, vacancies, deaths and affiliation changes are not reflected.

Routes use hashes and support browser back/forward. Navigation retains the state of each view during a session. Demo mode is shared by Results, Electorates and Analysis, resets on a full reload, and remains explicitly labelled. Coalition calculators always use fictional data, regardless of the Results toggle.

## Official data verification status

Initial source checks were blocked by the former restricted network policy. After environment publication on 6 November 2026, the runtime reports enforced unrestricted networking. The official results homepage and the media XML directory now return HTTP 200. The XML directory is an HTML index, not a validated result payload. The homepage links historical results through `https://archive.electionresults.govt.nz/electionresults_2023/`; the old www-hosted historical path returns 404 and has been corrected in the reference source link.

Network access does not establish feed permission, current data validity or a completed adapter. Verify permissions and the actual feed schema, import the full 2026 party register, electorate roster and candidates, and distinguish current MPs from nominees. Do not replace the unavailable result state until those checks succeed. Historical reference transcriptions also require independent source checks before reliance. No poll observations or historical vote totals are loaded.

## Map provenance

`src/data/nz-coastline.json` retains New Zealand geometry from Natural Earth’s public-domain 1:50m Admin 0 Countries dataset:
https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson

Downloaded 6 November 2026. Coastline and markers share an equirectangular projection adjusted for 41°S. The viewport focuses on the main islands. Offshore islands are omitted. The markers are approximate city/region anchors, not official electorate boundaries or electorate centroids. Māori anchors are deliberately shown on a separate selectable layer. No runtime tile service or access token is needed.

## Scenario methodology

The chamber illustrates a fixed 120 seats using Sainte-Laguë divisors 1, 3, 5… All listed parties are assumed eligible. Exact ties use display order. Electorate qualification, electorate wins, overhangs, vacancies and other official allocation rules are omitted. This is **not a complete NZ MMP calculator or forecast**. A 61-seat threshold applies only to this fixed chamber.

Changing a party share scales all other fictional shares proportionally; every selector restores its party’s fictional baseline on change. Reset scenario restores that baseline and clears groupings. Presets and comparison rows use the same allocation function. User-selected groupings express scenarios, not agreements.

The remaining-vote tool solves `(target - current * countedFraction) / remainingFraction` under a known fixed final party-vote total. Polling-place reporting percentages are not valid substitutes for that fraction. Reaching a party-vote target does not imply winning or forming a government.

Future forecasts need attributed/licensed polls with fieldwork dates and methods; verified historical results with boundary crosswalks; reporting-order and special-vote modelling; full MMP rules; backtesting; uncertainty intervals; model versions and input timestamps. No such forecast is currently generated.

## Collaboration and deployment

Use existing checkouts and feature branches; never push directly to `main`. Open PRs, run all checks and keep docs current. See `AGENTS.md` and `DESIGN.md`. CI runs tests, TypeScript and the build. Configure branch protection in GitHub.

For Cloudflare Pages, connect this GitHub repository, set production branch `main`, build command `npm run build`, root repository directory and output `dist`. Use Node 22.12+ (set `NODE_VERSION=22` if necessary). Root `functions/` is bundled by Pages. `wrangler.jsonc` records output and compatibility date. Once configured, PRs get previews and merges to main trigger production builds. Account integration, deployment, a public URL and deployed API validation remain unverified. The repository initially had no main branch; a maintainer must establish a base before using main.

Before public release, verify current facts, source reuse permissions, deployment, feed failures, data accuracy and applicable election-day publishing requirements—particularly for polling and predictive material. Do not independently publish unverified election results.
