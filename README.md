# NZ Election Tracker

Independent React/TypeScript/Vite/Tailwind dashboard, deployed with Cloudflare Pages and Pages Functions. **The official media XML feed is connected.** The observed source currently contains zero counted votes, so results show an awaiting-counts state. Nonzero publication is separately gated; invented figures remain opt-in and separate.

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

Vite serves port 5173 and runs the same `/api/results` and selected-electorate handlers through a development-only middleware. Cloudflare Pages serves those handlers from `functions/` in production. `/api/status` is a legacy redirect to `/api/results`. No API key is needed for the public feed.

In this proxy-based cloud environment use `npm run dev:proxy` (Node’s `NODE_USE_ENV_PROXY=1`, with inherited CA trust intact). On an ordinary computer, `npm run dev` suffices. Wrangler is included for `npm run dev:pages` and `npm run build:functions`. The standalone local workerd runtime does not inherit this sandbox’s outbound proxy, so it can return 503 here; this is not a successful deployed-network check. The Vite development API and live isolate test below explicitly support the inherited proxy.

```sh
npm run test:runtime  # captured source fixtures; verifies the compiled Cloudflare isolate and cache
NODE_USE_ENV_PROXY=1 node scripts/feed-runtime.cjs --live  # after build:functions; real source
```

The runtime test uses Miniflare’s supported outbound-service bridge to preserve proxy/TLS routing for this environment. It is test-only and not deployed. CI runs fixture tests, TypeScript, Vite build and the offline isolate test. Neither a local build nor this bridge proves a public deployment.

## Navigation and data boundaries

- **Results:** validated source counts or waiting/withheld/unavailable/stale states. Explicit demo toggle reveals fictional party votes.
- **Electorates:** all 71 source electorates, including seven Māori electorates, with source candidate names/affiliations and on-demand counts. The search is macron-insensitive. Map markers only cover matched reference anchors; the text list gives complete source coverage. Māori/general geography overlaps and Te Tai Tonga spans both islands. Fictional demo mode retains the older reference explorer, separate from source counts.
- **Parties:** 36 entries from the source feed, including 17 marked registered in the observed capture. These source counts can change. Registration flags are displayed as supplied. Coalition and target-share tools retain their separate historical/demo party choices and never silently substitute source counts.
- **Coalitions:** three hypothetical presets, a chamber illustration, and custom grouping controls. These do not imply political agreements or likely governments.
- **Analysis:** descriptive margins from validated preliminary party counts, or an honest waiting/withheld state. No source-derived seat forecasts or win probabilities. Opt-in fictional analysis and target-share calculators remain separate.
- **Sources:** source destinations, data limitations, and verification status. Names of 2023 elected representatives are manually entered historical references, explicitly not current MP or 2026 candidate claims. Source rechecks are pending; later by-elections, vacancies, deaths and affiliation changes are not reflected.

Routes use hashes and support browser back/forward. Navigation retains the state of each view during a session. Demo mode is shared by Results, Electorates and Analysis, resets on a full reload, and remains explicitly labelled. Coalition calculators always use fictional data, regardless of the Results toggle.

## Official feed connection and activation

Source: `https://media.election.net.nz/xml/`. The official source homepage identifies the 2026 election and says preliminary results begin at 7pm NZ time on 7 November 2026. The observed XML does **not** contain an explicit election-year/test identifier. As of the captured 6 November source timestamp, counts are zero. An electorate `final="true"` flag appears even with zero counts, so it is never interpreted as certification or a winner declaration.

- `/api/results` reads `election.xml`, `statistics.xml`, `parties.xml`, `electorates.xml` and `candidates.xml`.
- `/api/electorates/:id` reads the selected `eNN/eNN.xml` only, after validating the ID against the source directory. No arbitrary upstream URL is accepted.
- XML is validated before parsing; DTD/entities, oversized bodies, redirects, invalid IDs, duplicate or broken references, impossible dates, negative/nonfinite counts, directory-count mismatches and inconsistent percentages are rejected. Party ID 0 is kept as “No party listed in source”; list-only candidates are not shown as electorate candidates.
- Source times are explicitly interpreted as NZDT within the supported November–December 2026 window. Other windows fail closed instead of guessing DST/year.
- The browser refreshes every 60 seconds while visible, aborts requests after 12 seconds and offers retry. Edge snapshots refresh at most once per minute per cache location/key, coalescing concurrent reads in an isolate. HTTP/browser caching is shorter. A validated snapshot can be retained for at most ten minutes after a failed refresh, clearly stale; thereafter results are unavailable. Cache eviction or another edge location can require another upstream read; there is no global distributed rate limiter or database.
- Nonzero source updates older than ten minutes are labelled stale. Directory/waiting snapshots retain explicit source timestamps rather than implying zero support. Different publication settings use separate cache keys.

**Production publication prerequisite:** verify Electoral Commission feed-use permission/terms, 2026 identity, that rehearsal/test data has ended, and election-day publishing requirements. Then set the non-secret Cloudflare Pages production variable `RESULTS_PUBLICATION_CONFIRMED=2026-preliminary` and redeploy. Leave it unset for previews or until review is complete. This is a manual source-confirmation guard, not proof supplied by the feed.

Even with that setting, nonzero counts are withheld before `2026-11-07T19:00:00+13:00` or when the source update precedes that release time. Zero snapshots remain waiting. Both national and electorate APIs enforce this. Counts are always labelled preliminary; a future official-results adapter requires separate verification. Source seat fields and `final` flags are not used to declare winners or infer governments.

Live verification performed in the cloud machine: national API plus Auckland Central and Te Tai Tonga returned validated waiting states. The observed directory had 71 electorates, 530 candidates and 36 party entries (17 registered). Browser checks covered real-source metadata at phone, tablet and desktop widths. Nonzero, withheld, invalid, failure and stale cases use explicitly synthetic test mutations, not real election results. Public deployment and production nonzero-data behaviour remain unverified.

Historical references link to `https://archive.electionresults.govt.nz/electionresults_2023/`. No poll observations or historical vote totals are loaded.

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
