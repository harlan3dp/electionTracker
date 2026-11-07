# Tally election-night interface review

## Design read and scope

Simplify the existing election dashboard for casual voters, retaining Tally’s forest-green, cream and white identity, system typography, party colours and native controls. Use the existing React/Next.js/Tailwind structure. Taste settings: `DESIGN_VARIANCE: 3`, `MOTION_INTENSITY: 2`, `VISUAL_DENSITY: 6`.

The initial working tree was clean. Work started on `feat/election-night-three-tab-ui` from the latest default-branch merge of the preceding UI PR. No dependency was added. No feed adapter, validation, polling hook, publication guard, allocation algorithm, forecast method or image-export implementation is changed.

## Audit

The former seven destinations separated related results from their detail. Repeated headlines, live/demo notices and feed explanations pushed election information down the page. Coalitions exposed many controls before the chamber, while an empty prediction image occupied space before any entry.

The existing reusable pieces are retained: `Chamber`, source directories, observed trends, coverage model, scenario calculators, prediction form and PNG exporter. Predictions originally retained state only while mounted during navigation; there was no reload-persistent prediction store.

## Content and component map

| Destination | Contents | Existing link compatibility |
| --- | --- | --- |
| Results | Concise status, national votes, next-Parliament illustration, searchable electorates | Default and `#results`; `#electorates` opens the electorate section |
| Results details | Party directory and all shares; trends, analysis, coverage and remaining-vote tool | `#parties`, `#analysis`, `#analysis-title` open the relevant disclosures |
| Parliament | Shared chamber, compact party totals, presets and custom coalition selection | `#parliament` and former `#coalitions` |
| Parliament advanced | Existing seven-party MMP table and legacy share/grouping controls | `#advanced-scenarios` and former `#seat-title` |
| Your Prediction | Seven-party seat/percentage inputs, totals, validation, partial chamber and valid sharing preview | `#prediction` |
| Information | Existing sources, methodology and technical limitations | `#sources`, linked from footer and Results information icon |

There are three primary navigation links, with no nested tab system. Hash navigation, browser back/forward and mounted form state remain supported. Live detail components remain mounted while the sample preview is shown so their filters are retained.

## Chamber and data meaning

`Chamber.tsx` is the sole interactive SVG chamber renderer for source estimates, coalition exploration, advanced scenarios and predictions. Its existing `seatPoints` geometry and allocation inputs are unchanged. A selected-party mask changes dot emphasis only; identity is used rather than colour so matching colours cannot highlight an unrelated party.

Results displays a chamber only when the existing coverage model supports a fresh, complete estimate. That estimate is labelled modelled and conditional, never an official allocation. The API currently has no verified official-seat allocation. Without a supported estimate, Results shows a concise empty state and draws no invented seats.

Parliament uses the supported model when available. Otherwise it clearly labels the existing fictional 120-seat example in amber. Its preset totals use the displayed rows and the existing dynamic majority function. The example never enters live Results. Mobile controls repeat the selected-seat outcome and provide a direct return to the highlighted chamber.

Partial personal predictions draw exactly the entered seats and retain the threshold for the intended complete chamber, including assumed overhang. The full sharing image preview appears only after both allocation and nickname are valid. The existing canvas PNG exporter, which also uses the shared seat geometry, and its content are unchanged.

## Copy and mobile behavior

Headlines are Election 2026, Parliament and Your Prediction. One compact source component shows status and last successful check, with diagnostics, source timestamp and retry under Feed details. The gated sample replay is a secondary disclosure with an unmistakable fictional banner and return action.

In the waiting-state phone comparison, visible paragraph copy fell from 182 to 61 words before the final candidate-message shortening. Detailed methodology remains available. This measurement excludes hidden disclosures and data labels; it is not a claim about every possible feed state.

The three primary links fit on one row on phones. National votes precede the chamber in reading order. Electorate map geography and advanced controls are expandable. Controls retain readable labels, visible focus and at least 44px ordinary touch targets. Existing approximate map markers retain an equivalent searchable list.

## Verification

- 41 Vitest tests pass, including legacy-route compatibility and chamber identity highlighting, unchanged geometry, overhang thresholds and incomplete-prediction thresholds.
- Lint, typecheck and both Next.js/Cloudflare Pages builds pass.
- Chromium checks cover Results, Parliament, Your Prediction and Information at 320, 375, 390, 430, 768, 1024 and 1440 CSS pixels, plus six data-state layouts: 34 combinations without page overflow.
- Axe reports no WCAG A/AA violations on the three primary destinations at 375px and 1440px. Additional scans of a valid prediction, selected coalition and the Information view also pass. Visual and keyboard review supplements this automated scan.
- Interaction checks cover keyboard skip/focus, nine legacy routes, retry, all three coalition presets, exact 61-seat majority, unchanged chamber marks, custom selection, prediction percentage conversion, invalid totals, reset, session state retention, PNG download, electorate filtering and secondary sample preview.
- Local fictional fixtures cover loading, waiting, unavailable, stale, withheld, preliminary and incomplete data. They never enter the live feed or observed history. Browser checks recorded no page or hydration errors.
- The compiled Pages worker passes waiting, withheld, positive and offline fixture rehearsals. The Next.js production smoke check passes its HTML, invalid-ID, redirect and API contract checks; its upstream response was explicitly unavailable in the local runtime.
- Read-only hosted verification against `https://tally.org.nz` passes and returns `200 waiting`. This verifies the existing public feed response, not publication permission, future nonzero results or deployment of this UI branch.

No merge, deployment, production setting change or result activation is performed by this task.
