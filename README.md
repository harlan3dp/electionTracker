# Tally

Independent Next.js App Router, TypeScript and Tailwind dashboard for the **New Zealand general election on 7 November 2026**, built for Cloudflare Pages hosting with a Next.js local/Node option. A validated adapter reads the Electoral Commission public media XML feed. Captured source data contains zero counted votes; the app shows waiting, withheld or unavailable states until publishable counts exist. No invented results are shown by default. Nonzero publication remains separately gated.

Tally uses a sage-and-ink interface with a five-stroke tally mark, six directly accessible sections and a responsive mobile navigation grid. Feed provenance, retry controls and explicit loading/unavailable states sit beside the results workflow. The interface uses the local system font stack and a bundled SVG favicon, with no external font or icon requests.

## Development

Use Node 22.12+ and npm (see `.nvmrc`). No database, authentication or feed API key is needed.

```sh
npm ci
npm run dev          # Next.js on port 3000
npm test
npm run lint
npm run typecheck
npm run build
npm run test:runtime # starts/stops its own production server; run after build
npm start           # production server on port 3000
```

In a proxy-based cloud environment use `npm run dev:proxy`, preserving inherited CA trust. Builds use webpack for compatibility with this environment. `test:runtime` verifies production HTML, route validation, legacy redirect and the API contract; an unavailable upstream response is reported distinctly from successful live access. Vitest exercises captured source XML through the actual Next.js route handlers, including cache reuse and failure handling. CI runs tests, lint, TypeScript, build and production smoke checks.

### Project structure

- `app/`: server-rendered page, metadata, layout and Node API route handlers.
- `src/Dashboard.tsx`, `src/Hub.tsx`: client dashboard shell and hash navigation.
- `src/results/`: automatic polling, response validation, national dashboard and local races.
- `lib/results/`: bounded upstream reads, XML validation, normalization and warm-instance cache.
- `src/styles.css`: Tailwind and responsive sage/ink design system.
- `tests/`: captured official source fixtures and adapter/route tests.
- `scripts/smoke-next.mjs`: production HTTP smoke test with server cleanup.

### API and refresh

`GET /api/results` returns the validated national snapshot. `GET /api/electorates/:id` loads a selected electorate. `/api/status` redirects to `/api/results`. The browser refreshes every 60 seconds while visible; timestamps distinguish the source update and last successful retrieval. On failure it retains a clearly stale snapshot for at most ten minutes, then shows unavailable. Retry keeps the last successful snapshot while fetching.

Node route handlers support Vercel without Cloudflare dependencies. A bounded in-memory cache coalesces concurrent requests and reuses snapshots for one minute per warm instance. Public responses also use short CDN caching. Cold starts, separate instances, electorate endpoints and edge locations can independently refetch; there is no global rate limiter, persistent storage or guaranteed cross-instance stale fallback. This simple design fits a small public dashboard, but monitor function usage and source load during election night. Never treat polling-place progress as the fraction of votes counted.

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
- The browser refreshes every 60 seconds while visible, aborts requests after 12 seconds and offers retry. Server snapshots refresh at most once per minute per warm instance/key, coalescing concurrent reads. HTTP/browser caching is shorter. A validated snapshot can be retained for at most ten minutes after a failed refresh, clearly stale; thereafter results are unavailable. Cache eviction or another edge location can require another upstream read; there is no global distributed rate limiter or database.
- Nonzero source updates older than ten minutes are labelled stale. Directory/waiting snapshots retain explicit source timestamps rather than implying zero support. Different publication settings use separate cache keys.

**Production publication prerequisite:** verify Electoral Commission feed-use permission/terms, 2026 identity, that rehearsal/test data has ended, and election-day publishing requirements. Then set the non-secret Vercel Production environment variable `RESULTS_PUBLICATION_CONFIRMED=2026-preliminary` and redeploy. Leave it unset for previews or until review is complete. This is a manual source-confirmation guard, not proof supplied by the feed.

Even with that setting, nonzero counts are withheld before `2026-11-07T19:00:00+13:00` or when the source update precedes that release time. Zero snapshots remain waiting. Both national and electorate APIs enforce this. Counts are always labelled preliminary; a future official-results adapter requires separate verification. Source seat fields and `final` flags are not used to declare winners or infer governments.

Earlier pre-migration live verification recorded in the repository: national API plus Auckland Central and Te Tai Tonga returned validated waiting states. The observed directory had 71 electorates, 530 candidates and 36 party entries (17 registered). Browser checks covered real-source metadata at phone, tablet and desktop widths. Nonzero, withheld, invalid, failure and stale cases use explicitly synthetic test mutations, not real election results. Current-cloud upstream access is blocked by the network allowlist; post-migration live access, public deployment and production nonzero-data behaviour remain unverified.

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

## Collaboration and Vercel deployment

Use the existing checkout and one descriptive feature branch per change. Each contributor/agent should claim a small scope (for example, results UI versus data adapter), avoid editing the same files concurrently, and open a PR against the repository default branch. Never push directly to the base branch. Rebase or merge the latest base before review. All checks above must pass before merging. Do not change the data schema and its consumers in independent PRs without coordination. `AGENTS.md` contains shared rules; `DESIGN.md` documents the visual language. Configure required CI branch protection in GitHub.

### Deploy the waiting dashboard now

1. Sign in to Vercel and choose **Add New → Project → Import Git Repository**, selecting `harlan3dp/electionTracker` and the branch containing this migration. An authorised account owner must connect the repository; no deployment credentials are stored here.
2. Select **Next.js**, root directory `.`, Node **22.x**, build command `npm run build`, install command `npm ci`. Keep the framework's default output directory. Do not set `dist` and do not export a static site: live API routes need Node functions.
3. Leave `RESULTS_PUBLICATION_CONFIRMED` unset. Deploy. Vercel provides a public `*.vercel.app` URL. A waiting/unavailable dashboard is safe to deploy while source checks are pending; this does not verify publication permission for nonzero results.
4. At that URL verify `/`, `/api/results`, and `/api/electorates/1`. Expect 200 with a validated waiting/withheld snapshot when upstream access works, or 503 with explicit unavailable state on upstream failure. Check source timestamps, mobile layout and automatic refresh. A preview/build is not proof the deployed source network works.
5. Once reviewed, set the desired production branch in Vercel. Use PR preview deployments for review, then merge the PR for production. Check current Vercel Hobby terms, account eligibility and free usage limits; no paid service is required by the code.

### Activate nonzero results only after source review

Confirm feed reuse permission, 2026 identity, rehearsal status and applicable election-day publishing requirements with the Electoral Commission. Only then set **Production** `RESULTS_PUBLICATION_CONFIRMED=2026-preliminary` and redeploy. Leave it unset in preview environments. The adapter additionally withholds nonzero counts before 7pm NZDT on 7 November 2026, or if the source timestamp precedes that release. This guard does not itself establish source authenticity or legal permission.

Source-provided seats/final flags are not used to infer winners or project a government. Full MMP seat allocation, electorate qualification, overhang and official certification need separate verification. Scenarios remain explicitly fictional.

Current limitations: no public deployment has been created or verified from this environment; current upstream access and GitHub API access require environment network settings. Read-only Git repository access works through the platform proxy. No application credentials are needed for the public feed. Do not enter secrets in chat.

## Results desk and personal predictions

The Results view records up to 180 distinct preliminary source updates in this browser tab's session storage, with a trend chart and percentage-point changes. It never reconstructs history from the current total. Clearing history removes this tab's stored trend data. Storage restrictions may prevent history surviving reloads.

When preliminary national counts exist, electorate counts refresh in batches of four through the existing validated routes. Partial, stale, missing and tied counts are shown explicitly. An automatic illustrative electorate/list allocation is available only when all source electorates have fresh positive untied leads and all leader affiliations are supported registered parties. It treats current shares and leads as assumptions, never certified seats. Unsupported independent/unregistered outcomes keep it unavailable. The separate seven-party Parliament calculator supports 5%/electorate eligibility, Sainte-Laguë allocation, overhangs and dynamic majority thresholds. It excludes unlisted parties, independents and exceptional statutory rules; it is not a certified full election model. Probability panels remain “Model not yet available”.

The Prediction view is seat-first and includes National, ACT, NZ First, Labour, Green, Te Pāti Māori and TOP only. Percentage mode estimates one party's seats from a user-entered eligible vote pool and electorate floor; it does not perform a joint allocation. The displayed reverse percentage is a proxy, not an inverse MMP calculation. Direct seats stay exact. Users must allocate 120 seats plus their explicitly assumed overhang, and seats cannot fall below the entered electorate floor. Nicknames, dates, input units, assumptions, a chamber, totals and majority are exported as a local PNG. There are no accounts, uploads or automatic scoring. The existing Results publication gate is unchanged.

## Summary homepage and fictional replay

Results now opens in **Fictional demo** mode for design review, with a persistent amber disclaimer. Six deterministic fictional updates illustrate party-share movement, electorate/list seats, overhangs and majority thresholds. Play advances every eight seconds; Pause, Next update and Reset replay give manual control. Playback stops advancing when the tab is hidden or another section is selected. The demo stops at its last frame; Play restarts it. Its 70-electorate roster is explicitly hypothetical, not a verified 2026 roster.

The **Live feed** switch uses only the existing validated feed and actual observed history. Replay frames are never passed to the source adapter or written to recorded trend storage. The home mode is independent of fictional examples elsewhere in the app. Vote and Parliament summaries lead the page, trends and changes follow, and electorate details/calculators are disclosed below. Probability modelling remains unavailable. The existing personal prediction builder is unchanged.

## Cloudflare Pages live build (current hosting target)

The current hosted target is `https://electiontracker-40v.pages.dev/`. `npm run build` now builds both Next.js (for local/Node deployments) and a Cloudflare Pages artifact at `dist/`. Pages serves the same React dashboard using a Vite browser bundle and a compiled `_worker.js` containing the validated national/electorate handlers. It does not attempt to serve `.next/` as static files. Keep the Pages build command **npm run build**, output directory **dist**, root **repository root**, and Node **22.x**. The production branch must track this repository's actual default branch, `feat/stage-1-foundation`. Account-side settings cannot be changed by committing source; verify these in the Cloudflare dashboard before release.

`npm run test:pages` rehearses the compiled Pages worker in workerd using only captured/synthetic fixtures, including positive counts after release with the review gate enabled in the test isolate. `npm run verify:hosted -- https://electiontracker-40v.pages.dev/` checks that the current Tally browser artifact and API routes are actually deployed. Successful API responses identify this release as `applicationBuild: tally-live-v2`. Unit tests cover malformed data, partial/stale responses, eligibility and overhangs. Local success is not a guarantee of hosted availability.

### Live default and demo lock

Home opens in Live feed mode. Replay is enabled only for a fresh server-approved waiting state before 7pm NZDT on 7 November 2026. The server and browser both disable demo at that scheduled cutoff as a fail-closed backstop for fresh devices and source resets. Any preliminary positive or withheld count also locks demo, persisting in local storage and synchronising across tabs. Storage failures disable replay. Replay never receives live data or writes to observed history. Old legacy fictional vote views are removed; personal predictions and clearly labelled assumption calculators remain separate tools.

Polling refuses older source timestamps, refreshes once a minute and on tab visibility, exposes retry and stale/source timestamps above the counts, and expires retained snapshots after ten minutes even without another network response. Failed validation never falls back to fictional counts.

### Required release review — not automatically activated

The existing `RESULTS_PUBLICATION_CONFIRMED=2026-preliminary` gate is preserved. A Cloudflare account owner must verify official feed-use permission, actual 2026 election identity/test status and publishing requirements before setting it as a **production Pages environment variable** and redeploying. Without confirmation nonzero counts are intentionally withheld. Preview environments should leave it unset. The release-time guard remains 7pm NZDT, 7 November 2026. Source access and schema validation alone do not establish permission or election identity. If the hosted Pages build is still an older version, merging this PR and a successful Pages deployment are required before these changes reach the public URL.

The Pages Worker is compiled directly from `cloudflare/worker.ts` as an ES2020 Web-only module. It reuses the validated API handlers but does not inject Wrangler's Node compatibility shims. `keepNames` is disabled and the build rejects `__name`, `unenv` and class-static initializer blocks: the hosted Pages deployment previously crashed in a generated `__name(this, ...)` initializer. The workerd rehearsal checks both a 2023 compatibility date and the current date, plus unknown-route and unsupported-method responses. Wrangler remains a local runtime/test dependency, not the Worker bundler.

`wrangler.jsonc` makes the Pages output directory and Web-only runtime configuration explicit. The pinned compatibility date is an API compatibility baseline, not the election date; it avoids enabling Node compatibility by a newer-date default. No Node compatibility flag is required for these handlers.
