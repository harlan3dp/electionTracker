# Tally interface review

## Design read

A public election dashboard for New Zealand voters. Preserve Tally’s calm sage-and-ink identity and improve scanning, source confidence and mobile task access. This is a targeted evolution of the existing React, Tailwind and native-control design system.

Taste settings: `DESIGN_VARIANCE: 3`, `MOTION_INTENSITY: 2`, `VISUAL_DENSITY: 6`. The interface needs predictable navigation, restrained interaction feedback and enough density to read election information quickly. Marketing-page imagery, ornamental motion and a new component framework would not help this workflow.

## Audit

- Brand: ink `#18352f`, sage action `#285c49`, paper `#f7f8f4`, white surfaces, Inter-first system sans. Existing 12px panels, 8px controls and 4px labels are retained. Party colors remain reserved for labelled data.
- Architecture: seven hash views, browser back/forward, retained form state and an optional prediction builder. Routes, primary navigation labels, wordmark, metadata and data policies are preserved.
- Hierarchy: three separate home notices repeated live/demo and feed status before showing the count. Source context and recovery actions belonged in one panel.
- Mobile: the prediction navigation item created a third navigation row. Repeated notices and a tall trend empty state delayed useful content.
- Controls: mode buttons read as separate actions rather than a mutually exclusive choice. The 17-party custom coalition form obscured the grouping outcome.
- Accessibility: native controls, skip link, focus rings, source links, live announcements and reduced-motion handling are preserved. Browser inspection also found server/browser floating-point differences in chamber SVG coordinates that produced hydration warnings.

## Changes

The home starts with its national heading and a grouped live/demo control. Its availability explanation is linked with `aria-describedby`; the existing cutoff and fail-closed demo rules are unchanged. One source panel contains the current feed state, source and retrieval timestamps, retry action and official-results link. Stale and unavailable states have an attention border and text label.

Count and Parliament empty states use the existing icon family to distinguish their purpose. The count panel gives the official-results action priority and offers a direct electorate link. Trend prerequisites occupy a compact notice.

Mobile navigation uses four columns and two rows, with the prediction link spanning two columns. Small phones omit decorative navigation icons while keeping every label and 44px targets. Tablet navigation scrolls within its row rather than widening the page. Desktop navigation stays on one line.

Custom coalition checkboxes are behind a native disclosure with a selected-party count. Presets, allocation, reset and form persistence retain their existing behavior. SVG seat positions are serialized to three decimal places to keep server and browser markup stable without changing allocation or the number of marks.

## Verification

On 7 November 2026, `npm test` passed all 33 tests; lint and typecheck passed. `npm run build` produced both the Next.js and Cloudflare Pages builds.

Chromium checks covered all seven views at 320, 390, 768, 1024 and 1440 CSS pixels: 35 view/width combinations without page overflow. Automated axe checks reported no WCAG A/AA violations on all seven views at 320px and 1440px. These checks supplement visual and keyboard review; they do not establish a complete accessibility certification.

Keyboard and interaction checks passed for the skip link, demo opt-in and replay reset, return to live mode, grouping selection/reset, back navigation, electorate search/reset, Māori roll filtering and a prediction chamber containing exactly 120 marks.

Local fixture-driven browser checks covered connecting, waiting, unavailable, stale, withheld and preliminary source states and confirmed that demo remains locked when required. No page errors or hydration warnings were recorded after the coordinate fix. Test fixtures were never added to the live feed.

No deployment or feed activation is part of this UI change.
