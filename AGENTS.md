# Development instructions

- Use the existing checkout. Cloud tasks are isolated; do not create worktrees unless explicitly requested.
- Work on a descriptive feature branch, never push directly to main. Open a pull request for review.
- Before committing, run npm test, npm run typecheck, and npm run build.
- Keep README.md current with workflow and deployment changes.
- Stack: React, TypeScript, Vite, Tailwind CSS, Cloudflare Pages Functions. Avoid databases and authentication unless explicitly needed.
- All demonstration data must be clearly labelled as fictional. Never present it as real results, polls, or predictions.
- Verify official feed access, permission, schema, and cadence before implementing an adapter. Validate and cache incoming data. Do not invent a schema.
- Unavailable live results must link to https://www.electionresults.govt.nz/. Distinguish stale, preliminary, and official data when live integration is implemented.
- Show leading candidates, never infer winners from preliminary counts.
- Prioritise accessible mobile and desktop layouts. Keep optional features behind the essential workflow.
- Public release requires verification of applicable election-day publishing requirements; never independently publish unverified results.
