---
name: Tally
description: Sage and ink dashboard with explicit demonstration status and accessible election exploration.
colors:
  ink: "#18352f"
  muted: "#506459"
  paper: "#f7f8f4"
  surface: "#ffffff"
  line: "#dce3da"
  ocean: "#e9f0ee"
  selected: "#e7efe4"
  action: "#285c49"
  focus: "#2869ba"
  notice: "#fbf5e7"
  notice-ink: "#6b5120"
typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "32px desktop / 28px mobile"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  headline:
    fontSize: "24px desktop / 22px mobile"
    fontWeight: 650
    letterSpacing: "-0.025em"
  body:
    fontSize: "14px"
    lineHeight: 1.75
  label:
    fontSize: "12px"
    fontWeight: 600
rounded:
  label: "4px"
  control: "8px"
  card: "12px"
spacing:
  compact: "8px"
  related: "16px"
  group: "24px"
  panel: "28px"
  section: "32px"
components:
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.panel}"
  field:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "12px"
  selected-row:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.ink}"
    height: "48px"
---

# Design System: Tally

## Overview

Preserve the established sage and ink identity: restrained green text, warm pale backgrounds, white panels and explicit numeric hierarchy. This is a working dashboard; a compact introduction brings the national figures and navigation into view quickly.

Tally’s wordmark pairs a five-stroke tally symbol with compact sans-serif lettering. Navigation uses consistent 24-unit line icons, a pale selected surface and a persistent underline. Keep the introduction above the provenance notice; group source status and recovery actions in a single feed panel. The feed’s loading and unavailable states retain a visible explanation and official-results link. UI typography uses fixed sizes with structural breakpoint changes; shared values live in `src/styles.css` custom properties.

**Key Characteristics:**

- Quiet surfaces and clear section divisions.
- Party colours reserved for labelled election data.
- Visible demonstration status and discoverable assumptions.
- Native controls with keyboard and touch access.

## Colors

Ink carries headings and primary text; muted green carries explanatory text. Paper frames white panels, while ocean distinguishes geographic context. Amber identifies the demonstration notice. Blue is the keyboard focus indicator.

**The Party Neutrality Rule.** Interface actions use the sage and ink palette. Party colours identify data; party names and numerical values carry the same information without colour.

## Typography

Use the existing Inter-first system sans stack; do not require a network font. Display type is compact, with balanced wrapping. Section headings introduce tasks; body copy stays within roughly 65–75 characters per line. Explanations and caveats remain readable at 12–14px. Align comparable quantities and use tabular numerals for changing figures.

## Layout

The shared shell is capped at 1160px, with 32px desktop and 20px mobile side padding. National results use a wider primary column; map and list share a paired panel; scenario controls sit beside the chamber. At 700px these grids stack in reading order. Preserve a compact hero and direct section navigation. Keep essential controls and results visible; place extended methodology in disclosure panels.

## Elevation & Depth

Panels are flat, separated by fine borders and pale tonal changes. Small shadows distinguish geographic points and labels only. Avoid adding decorative depth to the dashboard. Any optional transition must respect reduced-motion preferences; information must remain available without animation.

## Shapes

Use gently rounded panels and controls, with compact label corners. Party dots and chamber seats are circular data marks. Fine borders describe grouping; selected rows use a pale sage fill and stronger text.

## Components

### Buttons and inputs

Keep native select, range, checkbox and search behaviour. Label every field explicitly. Give ordinary controls a touch target of at least 44px; list rows use 48px. Keep all interactive controls reachable by keyboard, with the visible blue 3px focus outline and sufficient offset. Preserve the skip link and meaningful live announcements. Reset and clear-filter actions remain textually explicit.

### Cards and status labels

Use white bordered panels with generous internal spacing. Status tags describe data provenance rather than acting as controls. Keep the demonstration notice near the top and repeat short contextual caveats beside scenarios and fictional results. Link unavailable live results to the Electoral Commission's official results site.

### Geographic selector

The coastline is actual New Zealand geography from Natural Earth's public-domain 1:50m Admin 0 Countries dataset, bundled locally in `src/data/nz-coastline.json`. Coastline and markers share the projection in `src/geography.ts`. The view focuses on the main islands and omits offshore islands.

Markers indicate approximate city locations for the demo subset, not official electorate boundaries or electorate centroids. State this next to the map and retain source attribution. Use explicit selection outlines; show the selected label persistently and reveal other labels on hover or keyboard focus. Preserve the equivalent searchable text list so map precision is never required to select an electorate.

### Scenario tools

Offer every demo party in both tools. Keep each tool's party choice independent, update its baseline when the party changes, and expose reset behaviour. Chamber dots have a labelled seat breakdown. Grouping checkboxes express user choices and imply no political agreement. Keep the fixed 120-seat simplification and omitted MMP rules discoverable. Remaining-vote targets are hypothetical share calculations, with clear unreachable and no-votes-remaining states.

## Do's and Don'ts

- **Do** preserve the sage and ink palette and compact dashboard hierarchy.
- **Do** pair colour with labels, values and visible selected states.
- **Do** support touch, keyboard, visible focus and reduced motion.
- **Do** label synthetic figures, candidates and scenarios as fictional or hypothetical.
- **Don't** imply that approximate markers are electorate boundaries.
- **Don't** describe demo leaders as winners, scenarios as forecasts, or user groupings as agreements.
- **Don't** invent live reporting progress, timestamps, polls or predictive certainty.

## Election hub navigation and provenance

Use three primary destinations: Results, Parliament and Your Prediction. Keep one navigation row at phone and desktop sizes. Preserve old hash links: electorates, parties and analysis open within Results; coalitions opens Parliament. Sources is an auxiliary information view reached from the footer or information icon. Form state survives navigation and browser back/forward.

Results starts with Election 2026, one concise live status and national party votes, followed immediately in reading order by the next-Parliament composition. Searchable electorates follow; party details and analysis use native disclosures. Put feed diagnostics, source timestamps and retry inside Feed details. Missing votes or seats remain unavailable, never zero or invented marks.

Parliament leads with the shared chamber, compact party totals and a dynamic majority threshold. Presets and custom choices highlight existing dots without reallocating seats. Show a short majority outcome beside the chamber and near mobile controls. Mathematical combinations imply no agreement. If a complete source estimate is unavailable, identify the fictional example explicitly with an amber label. Advanced sliders and the MMP table remain collapsed by default.

## Official feed states

Default Results, Parties, Electorates and descriptive Analysis use a shared validated media-feed snapshot. Distinguish loading, connected/waiting, withheld, preliminary, stale and unavailable. Always show source timestamps in NZ time and a route to the official site. Missing counts use “not published” or a dash, never zero support. Show candidate leads only from positive counts; never label elected winners from a feed final flag. Source directories replace historical transcriptions in normal mode; scenarios and opt-in fictional views stay clearly separate. Map anchor coverage is partial even when source list coverage is complete.

## Next.js national dashboard

Use the established sans-serif type and forest-green palette. Pair party votes and the shared Parliament chamber on desktop and stack them in reading order on phones. Empty states must be concise and must not draw invented seats. The source status shows the last successful check; detailed diagnostics remain expandable. A conditional seat estimate is always labelled modelled, never official.

## Results desk and prediction builder

Extend the sage-and-ink dashboard with observed count history, provisional electorate coverage and explicit seat assumptions. Separate source counts, conditional seat illustrations, personal predictions and unavailable probabilities through visible labels. The prediction editor and export preview share seven labelled party colours; saved PNGs include provenance and assumptions. Touch controls remain at least 44px, tables scroll within their panel on phones, and the prediction editor stacks above its preview. Chamber marks must exactly equal entered seats. Incomplete predictions never imply a complete parliamentary majority.

## Summary home

Live results are the default. Keep the gated fictional replay under a secondary Preview with sample data disclosure. Preserve its persistent amber disclaimer, keyboard-accessible controls and separation from observed history. Group explanatory details below the immediate election story.

## Election-night live states

Live mode is the default. Demo is unavailable unless server status explicitly permits it, and locks on detected counts or the scheduled release cutoff. Explain the lock beside the disabled demo control, fail closed during outages, and never replace unavailable source data with fiction. Put feed provenance, last successful check, stale status and retry above the count panels. Small-screen inputs use at least 16px text to prevent focus zoom, and long party/status labels wrap within their panel.

## Interface refinement

Keep Results, Parliament and Your Prediction as the only primary links. Retain native controls, readable field labels, 44px targets and visible focus. Mobile coalition controls offer a compact selected-seat status and a direct return to the highlighted chamber. Advanced tools use disclosures rather than nested tabs.

Predictions show allocated and remaining seats above the seven inputs. Partial allocations use the shared chamber with the full intended majority threshold. Show the full sharing preview only after both allocation and nickname are valid; keep image generation unchanged. Assumptions stay collapsed and entered values survive navigation.

See `docs/UI_REVIEW.md` for the audit, Taste settings, component mapping and verification.
