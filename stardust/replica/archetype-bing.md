# Archetype: bing (page type `program`, only page of its type)

- Live: https://explore.microsoft.com/en-us/bing?form=MA13QZ (www.microsoft.com/bing redirects here; Nuxt "fluent" platform)
- Prototype: `stardust/prototypes/bing-proposed.html` + `bing.css` + `bing.js`. Standalone; does **not** import `canon.css`.
- Content root: `#main` on both sides (live `main#main`, build `main#main`).
- Chrome: header `.common-nav` (`#nav`, Bing/explore variant: sticky, Features dropdown, search expand with
  "More" overflow, mobile drawer), footer `.uhf-footer` (`#uhf-footer`, the standard Microsoft UHF footer). Class names
  follow live so they can merge into canon later.

## Gate numbers per round

| round | 1440 pixel / Δh | 360 pixel / Δh | notes |
|---|---|---|---|
| iter1 (full) | 1.46 % / 1 | 8.50 % / 26 (4 hot bands) | 🔴 18/20: ROLE SWAP ×13 (live wraps h2 text in p), ICON DIFF ×3 (`<use>`), MISSING CTA ×2 in the footer |
| iter2 (pixel) | 1.44 % / 1 | 3.15 % / −1 | video section +2em bottom padding at ≤810 (from anchor) |
| iter3 (full) | 1.44 % / 1 | 3.11 % / −1 | content 🔴0 🟡0; nav gutter set to min(5vw,40px) |
| iter4 (full) | 1.44 % / 1 | 3.10 % / −1 | header button boxes and inline chevrons |
| motion + structural follow-ups | 1.44 → **1.31 %** / 1 | 3.10 → **2.99 %** / −1 | reveal, hovers, blue CTA variant, tag span, balanced description wrap |

Final (`final4` at 1440, `final5` at 360): content-diff 🔴0 🟡0 (18 advisory) · clip-probe Clipped 0 · overflow 0 ·
unit-geometry PASS (`bing-side-by-side`, 12/12 elements) · **cap-probe PASS** at 2560 (0/11 rows failed).
Static fix iterations: 3 per breakpoint (iter2–iter4). The rounds after that were the interaction pass and its pixel confirmation.

## Fonts
- The public `c.s-microsoft.com` Segoe UI woff2 files (normal / semilight / light / Semibold / Bold) load cross-origin from
  localhost (`access-control-allow-origin: *`). They are wired as `@font-face` "Segoe UI" 300/350/400/600/700.
  The stack is `"Segoe UI", "Liberation Sans", Arimo, sans-serif`, and the gate reports every face loaded.
- Live uses the variable `segoe-vf` (SegoeUI-VF from the edgecdn). The static faces cause the only advisory
  (HEADING FACE ×13 "segoe-vf → Segoe UI") and about 2–3 % glyph-level diff in header crops.
- The live UHF footer names "Segoe UI" but never loads it. The capture shows it rendering in the system fallback ("Segoe UI→sys").
  The build loads real Segoe UI, which is what Windows visitors see on live. The result is ±2–9 px text-width deltas in footer chrome-parity.

## Justified / residuals
- visual 1440 and 360: HEADING FACE ×13. This is a font-family name fork (variable vs static Segoe UI), permanent under the font policy.
- visual 360: FLUSH-LEFT TEXT ×8. These are the hidden "before" slides, translated −100 px exactly as on live (live measures x −48 too).
- chrome-parity: about 40 / 64 deltas, all font-metric (fontFamily name, ±2–9 px text widths in the UHF footer, privacy-link line-height).
  There are no box or structural deltas. Footer at 360: Δh +3 px from the Segoe line-height versus the live system fallback.
  Inherited by: user (font policy).
- 360 band y 4000–4500 is about 3.6 % (wallpaper/mobile), with thin-edge glyph texture. No hot band remains at either width.
- captureState: the Features video `autoplay muted loop playsinline` is paused at frame 0 by stitch-shot. restoreAtDelivery: autoplay muted loop (implemented as HTML attributes).
  Sliders are held on slide 1. restoreAtDelivery: the live sliders do not auto-rotate (no idle class mutations observed); prev/next/dots are implemented.

## Header contract (`stardust/chrome/header-contract-bing.json`, compared with `header-build-bing.json`, verdict `stardust/chrome/header-parity-bing.json`)
Implemented as recorded:
- **Features dropdown:** click and Enter open it. The float layer locks scroll and fades in at 0.4 s opacity, with the panel aligned to the trigger (258,39 182×283).
  It closes on Escape (focus returns), on an outside click, and on the toggle.
- **Search expand:** Blog and Support fold into **More ⌄**, which has its own dropdown with the same behaviour. The form gets a focus border and outline transition, and the submit hover does translateY.
- **360 drawer:** 320 px right drawer with overlay and scroll lock, 15 links, and a Features sub-menu. It closes on Escape, outside click, toggle, and the close button.
- **Sticky nav** adds the `common-nav--scrolled` shadow on scroll.

Remaining chrome-compare errors (need a site-owner decision; agents cannot sign them):
1. `control-missing@360 menu`: the live hamburger has **no accessible name**. The build names it "Menu" (a11y improvement), so the pairing by name fails.
   Behaviour is identical (drawer, 15 links, close paths). Recommend an owner decision or a register entry.
2. `Download Edge [hover/click/key]`: on live this "state" is a nav re-render artifact (0 links, 59 nodes swapped, crop shows the nav at rest).
   No visible state exists, so there is nothing to implement.
3. `panel-visual@1440 Search` at 3.4 % (bar 2 %): glyph-level font fork. The geometry matches within about 3 px; the header at rest differs 2.5 % for the same reason.

## Motion (`stardust/replica/motion/bing.json`, `bing-build.json`, motion-compare: 10 parity, 0 missing, 0 extra)
- **observed:**
  - scroll reveal: section opacity/transform 0.8 s +0.1 s, inner 6vh, media stagger 2rem 0.65 s
  - slider page transitions (1.5 s / 1 s cubic-bezier(.075,.82,.165,1), ±100 px)
  - nav scrolled shadow
  - arrow-button hover (scale 1.033 + shadow, 0.2 s)
  - dot hover (translateY −1 px, 0.2 s)
  - Download Edge hover (bg #3172e4 + shadow, 0.4 s; from chrome-explore)
  - video autoplay
- **implemented:** all of the above. The reveal uses the live `[data-reveal]` / `[data-reveal-inner]` / `[data-reveal-stagger]` conventions with `.block-page--reveal-enabled`; an IntersectionObserver with threshold 0 flips `data-reveal="true"`.
- **dead (not implemented):**
  - CTA button hover (no measured diff on live)
  - nav link hover diff (not measured; the source CSS underlines via `span::after`. This rule is kept as lifted, because the observer cannot see pseudo-elements)
  - no slider autoplay
  - no prefers-reduced-motion handling on live, so none is added

## Canon back-port requests
None. canon.css was neither imported nor edited. To merge later: `.uhf-footer*` (UHF footer, which uses an 11 px "Segoe UI" stack) and `.common-nav*` (explore-platform header). Both are self-contained in `bing.css`.

## Other notes for the main agent
- units.json: added the `bing-side-by-side` family (merged; other keys kept).
- Gate quirk: `unit-geometry` caches the live side at `stardust/current/measure/bing-units.json` regardless of width. Running 1440 and 360 `--full` rounds concurrently reuses the other width's origin and reads FAIL. Delete the cache, or run the widths sequentially.
- cap-probe notes that DESIGN.json `containerMaxWidth` 1624px differs from this platform's content cap of 1520px. That is expected for explore.microsoft.com and advisory only.
- Scratch: `stardust/.work/bing/` (fetched live CSS, measure JSON, small readers). Not served content.
