---
name: Microsoft (www.microsoft.com, en-us) — current state
description: Descriptive snapshot of the live Microsoft corporate site, captured for a same-design migration.
colors:
  background: "#ffffff"
  text: "#000000"
  text-muted: "#616161"
  heading-ink: "#0e1726"
  primary: "#0078d4"
  accent-link: "#006dac"
  secondary-plum: "#702573"
  plum-deep: "#3e143f"
  navy: "#112d52"
  navy-deep: "#17253d"
  ink-dark: "#242424"
  surface-tint-blue: "#e6f2fb"
  border: "#e6e6e6"
  footer-bg: "#f2f2f2"
typography:
  display:
    fontFamily: "Segoe UI Variable Display, Segoe UI, SegoeUI, Helvetica Neue, sans-serif"
    fontSize: "50px"
    fontWeight: 600
  h2:
    fontFamily: "Segoe UI, SegoeUI, Helvetica Neue, sans-serif"
    fontSize: "48px"
    fontWeight: 500
  h3:
    fontFamily: "Segoe UI, SegoeUI, Helvetica Neue, sans-serif"
    fontSize: "32px"
    fontWeight: 500
  body:
    fontFamily: "Segoe UI Variable Text, Segoe UI, SegoeUI, Helvetica Neue, sans-serif"
    fontSize: "16px"
    fontWeight: 400
rounded:
  sm: "4px"
  md: "8px"
  lg: "16px"
  pill: "200px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.sm}"
  footer:
    backgroundColor: "{colors.footer-bg}"
    textColor: "{colors.text-muted}"
---
<!-- stardust:provenance writtenBy=stardust:extract writtenAt=2026-11-04T01:32:39Z source=stardust/current/_computed-styles.json mode=descriptive -->

## Overview
Microsoft's corporate site: a white, spacious, typographic system set in Segoe UI, organised as stacked full-width
bands (hero, card grids, feature bands, promo strips) between the Universal Header (UHF) and the light-grey
six-column footer. Three platforms appear in scope: www.microsoft.com (AEM "foxtrot" pages), explore.microsoft.com
(Bing) and support.microsoft.com (Support).

## Colors
White backgrounds with black/near-black text; Microsoft blue (#0078d4 / #006dac) for primary actions and links;
section-specific deep tones — plum (#702573, #3e143f) on the AI page, navy (#112d52, #17253d) on accessibility and
corporate responsibility, pale blue tint (#e6f2fb) panels. Footer #f2f2f2 with #616161 links.

## Typography
Segoe UI family throughout (Segoe UI Variable Display for heroes, Variable Text for UI/buttons). Ramp observed:
62/56/50/48/40/37/32/28/24/21/18/16/15/14/12 px. h1 ≈ 50/600, h2 ≈ 48/500, h3 ≈ 32/500, body 16/400.

## Layout
Full-bleed bands with a centred content column; card grids of 3–4 columns at desktop collapsing to one at 360.
Container model: see DESIGN.json extensions.breakpoints (cap-probe).

## Elevation & Depth
Soft card shadows: 0 0 2px rgba(0,0,0,.12) + 0 2px 4px rgba(0,0,0,.14); deeper 0 3px 7px rgba(0,0,0,.13).

## Shapes
Radius mode 8px on controls and cards, 16–24px on large image cards, pill (200px) chips, circular icon buttons.

## Components
UHF header (logo + section name + nav + All Microsoft mega-menu + search + sign-in); hero bands; content cards;
feature bands with image + text; tab sets; product carousel (home); product tile grid (support); six-column footer.

## Do's and Don'ts
Do keep the captured state exactly. Don't introduce changes without an inconsistency-register entry.
