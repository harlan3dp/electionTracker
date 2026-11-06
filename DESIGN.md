---
name: NZ Election Tracker
description: Next.js election-night dashboard with editorial typography, transparent source states and accessible exploration.
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
    fontSize: "clamp(30px, 3.3vw, 42px)"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  headline:
    fontSize: "clamp(24px, 2.5vw, 28px)"
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

# Design System: NZ Election Tracker

## Overview

Preserve the established sage and ink identity: restrained green text, warm pale backgrounds, white panels and explicit numeric hierarchy. This is a working dashboard; a compact introduction brings the national figures and navigation into view quickly.

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

Use six hash-based views: Results, Electorates, Parties, Coalitions, Analysis and Sources. Preserve each view’s form state while switching; support browser back/forward. On phones, display all six navigation links in a 3×2 grid; use an inline row on desktop.

Results default to unavailable. Fictional figures require explicit opt-in, shared across Results, electorate demo votes and analysis insights. Coalition tools always use fictional votes. Keep provenance visible in every view; never imply that unverified historical names establish current MPs, candidates or party registration.

The directory contains seven Māori and eleven general historical reference entries. Separate general, Māori and combined layers. Te Tai Tonga belongs in both island filters, with one indicative South Island map anchor; markers are not boundaries. The 17 historical party names remain an unverified 2023 reference rather than a complete current register.

Show three hypothetical coalition presets with the same seat allocation as the chamber. Keep source confidence, model assumptions and missing data accessible in Sources and Analysis. Preserve explicit no-data, no-match and reset states.

## Official feed states

Default Results, Parties, Electorates and descriptive Analysis use a shared validated media-feed snapshot. Distinguish loading, connected/waiting, withheld, preliminary, stale and unavailable. Always show source timestamps in NZ time and a route to the official site. Missing counts use “not published” or a dash, never zero support. Show candidate leads only from positive counts; never label elected winners from a feed final flag. Source directories replace historical transcriptions in normal mode; scenarios and opt-in fictional views stay clearly separate. Map anchor coverage is partial even when source list coverage is complete.

## Next.js national dashboard

The national view uses an editorial serif headline above three source metrics and a party-vote panel. Desktop pairs this with an official-source panel and explicit seat availability; mobile stacks the panels. No decorative chart may imply missing votes or projected seats. Use dashes and waiting/unavailable copy before verified counts exist. Party bars animate on updates and respect reduced motion. Keep retrieval and source timestamps visible below the data.
