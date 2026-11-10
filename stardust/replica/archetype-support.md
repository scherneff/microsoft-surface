# Archetype: support (page type `unique`)

- Live: https://support.microsoft.com/en-us/ (source /support redirects here; different platform, UHF "Support" category header + Microsoft footer)
- Prototype: `stardust/prototypes/support-proposed.html` + `support.css` + `support.js` (self-contained; does NOT import canon.css)
- Content root: `#supMainContent` (live `main#supMainContent`; prototype `main#supMainContent.sup-main`)
- Generator (content from the capture, clean re-authored markup): `stardust/.work/support/tools/build.mjs` + `extract.mjs` → `stardust/.work/support/content.json`

## Gate rounds

| round | 1440 pixel | Δh | content 🔴/🟡 | chrome-parity | 360 pixel | Δh | content 🔴/🟡 | chrome-parity |
|---|---|---|---|---|---|---|---|---|
| iter1 (full, baseline) | 2.55% | 2 | 51/9 | 14 Δ | 0.04% | 0 | 52/9 | 4 Δ |
| iter2 (full, fix 1) | 2.51% | 2 | 0/0 | 8 Δ | 0.01% | 0 | 0/0 | 2 Δ |
| iter3 (pixel, fix 2) | 0.09% | 0 | – | 9 Δ (Home leak) | 0.01% | 0 | – | 1 Δ |
| iter4 (full, fix 3 = confirm) | 0.01% | 0 | 0/0 | ✓ | 0.00% | 0 | 0/0 | ✓ |
| iter5 (full, after interaction pass) | 0.01% | 0 | 0/0 | ✓ | 0.00% | 0 | 0/0 | ✓ |

Final (iter5): visual-diff 0 flags; clip-probe Clipped 0 both widths; overflow 0 px both widths; unit-geometry 12 units PASS;
chrome crop bands header 0.25% (1440, band 0–54) / 0.29% (360, band 0–88), footer 0.00% both; cap-probe PASS (0 of 4 rows).
Fix iterations: 3/3 per breakpoint (no residual left by the static gate).

Fixes that mattered: section-link role swap/missing icons (mirrored the source's hidden icon column + heading column structure),
hidden source chrome bits carried over (mobile title chevrons, "More" overflow, search tooltip/"No results", Manage cookies),
header reset specificity (`:where()`), inline-block nav items (live whitespace gaps), 2 px header→article gap, mobile
category strip (34 px, #e6e6e6 rules, e70d chevron, trailing-space text), me-control "Sign in" removed below 860 px like live.

## Capture state
- Sign-in teaching callout ("Sign in with Microsoft"): open in the extract capture; the gate's overlay dismissal closes it on
  BOTH sides (live and build each log "marketing modal dismissed"). Prototype renders it open by default with the lifted
  teaching-callout.css geometry (336 px, right 2vw, caret, shadow; hidden ≤770 px) and a working dismiss → parity with live
  in both states. Logged as a capture-state item, not a residual.
- Search box (dynamic-features row 2): rendered statically faithful (desktop + mobile open states). Suggestions and submit
  (`/en-us/search/results?query=`) are NOT wired — deferred to the dynamics phase (submit is prevented in support.js).

## Fonts
- `c.s-microsoft.com` Segoe UI woff2 files load cross-origin (ACAO `*`) — referenced via @font-face, no files in repo.
- Mirrored the live site-fonts.css FAMILY model: "Segoe UI" = 400 face only (live 600/700 text is synthesized from it — so
  is ours), plus "Segoe UI Semibold" (h1/h2/callout heading), "Segoe UI Bold", "Segoe UI Light", "Segoe UI Semilight".
  Gate: "every declared face loaded" on both sides; no font forks.
- UHF icon glyphs (chevrons e70d/e70e, hamburger e700, search e721, globe e909, cancel e711, back e0d5) use the live
  MWF-MDL2 woff from www.microsoft.com (CORS-open) — hot-linked; REHOST AT DELIVERY. Callout close uses MWF e711 in place
  of the support-site "Support MDL2 Assets" icon font (same MDL2 glyph).
- Images: live `support.microsoft.com/en-us/media/*.png` + `uhf.microsoft.com` logo URLs as captured (live has no srcset/sizes).
- Impeccable design hook flagged the live font family names as "outside DESIGN.md"; suppressed narrowly with
  `ignore-value design-system-font` (Segoe UI Semibold/Bold/Light/Semilight, MWF-MDL2) in `.impeccable/config.json`.

## Header contract (`stardust/chrome/header-contract-support.json`) and interaction parity
- Implemented: 1440 search open (input from x246, Cancel 76 px, logo stays) / Cancel; 390 hamburger → All Microsoft panel +
  6 collapsible groups; 390 "Support" category strip → category menu (Home…Buy Microsoft 365) + Products/Devices/Resources;
  390 search open (back arrow, full-width input) / close; Escape returns focus to the trigger; Tab moves into open panels;
  outside click closes menus and search; callout dismiss.
- chrome-compare (replica profile) went 31 → 15 errors. Remaining: search type-ahead (6 suggestions) + submit at both widths
  (deferred dynamic feature, 4 errors); open-state panel crops 2.1–6% at 390 and 17% for the 1440 search panel (panel-rect
  height/crop mismatch 54 vs 48 px, content visually aligned); "Other" sub-group has no build crop; close-search colour
  motion; Cancel state panel-rect quirk. Warnings: desktop Products/Devices/Resources/All Microsoft open on click on the
  build only — chrome-explore saw none at 1440, but motion-observe recorded the live Products click firing `fadeIn`
  (.3s cubic-bezier(.68,-.55,.265,1.55)), so they are implemented on that evidence.
- Motion (`stardust/replica/motion/support.json`, `support-build.json`; motion-compare 7 parity, 0 extra, 0 out of tolerance):
  observed = feature-card hover (translateY(-2px) + shadow, 150 ms), section-link hover bg #f3f3f3, search hover colour
  rgba(0,0,0,.8) 100 ms, dropdown fadeIn, header `js` class; implemented = all five (the `js` class is set at script
  start, before the observer attaches, so motion-compare reports it "missing" — advisory, no visual effect);
  dead = header scroll-morph, product-card / more-products / nav-link / category-logo / footer-link hovers.

## Residuals
- Permanent/advisory: chrome-compare items above (search dynamics deferred; open-state crop deltas at 390 menus 2–6%).
- Delivery flags: MWF-MDL2 icon font and all images are hot-linked to Microsoft hosts (rehost/media wiring at delivery).

## Repeated units
`stardust/replica/units.json`: support-product-card, support-feature-card, support-section-card, support-section-link.

## Canon back-port requests
None — chrome authored self-contained in support.css with mergeable `uhf-` names (`.uhf-header`, `.uhf-nav`, `.uhf-allms`,
`.uhf-search`, `.uhf-me`, `.uhf-callout`, `.uhf-footer`). The footer is the same UHF footer as www (shell.css `c-uhff`
values); if canon's footer converges on the same values, support.css's footer block can be dropped in favour of canon's.
