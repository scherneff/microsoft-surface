# EDS conversion log — www.microsoft.com same-design migration

Target: DA org `aemcoder`, site `3bab0b60`, branch `main` —
preview https://main--3bab0b60--aemcoder.aem.page/, live https://main--3bab0b60--aemcoder.aem.live/

## Decisions

- **Publish: yes (decided by the owner before the run).** Every delivered page, the redirects sheet and the
  chrome documents (nav, footer and their variants) are published live on the aem.live origin
  (deploy-batch.mjs without `--no-publish`, or POST https://admin.hlx.page/live/…).
- **Martech: carried over, switched off.** scripts/martech.js scaffolded from stardust/martech-contract.json
  (Adobe Launch + GTM, no CMP); every part disabled — enabling stays with the owner (stardust/martech-handoff.md).
- **Decode tier:** template-slotted for fixed compositions (hero, bands, chrome); reconstructive for repeat
  groups (cards, story listings, carousels). Recorded per block below by the delivering units.

## Units

### foundation (C0)
- **header** — template-slotted, three variants (www UHF / bing common-nav / support UHF category) selected by
  `<html class="chrome-*">` (scripts.js `getChromeVariant()`: metadata `chrome`, else nav path `nav-bing` /
  `nav-support`, else www). Authored anchors and label text nodes are MOVED into the prototype DOM; dropdown
  panels, drawer and mobile triggers that repeat a label are presentational clones (`stripInstrumentation`).
  Deviations, declared: prototype classes sit on the moved anchors/lists (EW2) so the lifted chrome CSS applies
  unchanged; menu/search/cancel/sign-in labels are hosted by `<button>` (EW7, `@ew-exempt` in the JSDoc) because
  the source chrome is button-driven. A www nav doc without a site-logo link renders the home flavour
  (`.hp-header`, single mobile row, cart).
- **footer** — template-slotted (6 link groups → 2 rows of 3, base row: locale, privacy choices, health
  privacy, corporate menu); www/bing share the canon DOM, support uses its float layout. Headings/lists moved.
- **styles** — tokens for the three variants; www base zero-specificity (`:where(html:not(...))`); bing / support
  page bases scoped; canon utilities (.container, .cta, .btn, .link-group, .card); section model:
  `.default-content-wrapper` = the variant's container. Fonts: one sheet per variant on Microsoft's CDN.
- Lint: `npm run lint` clean (`stardust/` tooling added to .eslintignore — not runtime); `lint:breakpoints`
  wired (DESIGN.json has no `target`, so it skips).
- Published-origin check (shells on main--3bab0b60--aemcoder.aem.page): header/footer crop vs live —
  www 1440 0.08 / 0.06 %, www 360 2.27 / 0.02 %, bing 1440 2.47 / 2.62 %, bing 360 0.73 / 3.00 %,
  support 1440 0.25 / 0.00 %, support 360 0.29 / 0.00 %. Every band is 0.00 % against the gated prototype
  capture (replica/gates/<slug>-<w>/build.png), so the residuals are the prototypes' accepted ones (bing: segoe-vf
  vs static Segoe UI + live footer system fallback; www 360: CSS-drawn UHF glyph antialiasing). chrome-parity:
  www 0/0, support 0/0, bing 40 (1440) / 66 (360) — all font-metric, as archetype-bing.md records.

### archetype-support (C-deliver unit A, template `support`)
- **support-cards** — reconstructive (repeat groups), one block, three variants authored as classes:
  `products` (10 inline logo cards), `features` (4 image cards), `groups` (banner card: h3 + h4 section
  links, each preceded by its icon `<p><img></p>`; 3 cards → `support-cards-three` grid). Rows classified
  by content: no image + heading = block head (h1/h2 moved above the grid), no image + no heading = foot
  ("More Microsoft products"), image = card. Card-as-link unwraps the heading anchor (EW6); h1–h4, p and
  pictures are moved (EW1). The block is the bootstrap main column (container × 75 % ≥ 768 px), first/last
  offsets as padding so they never collapse out of `<main>`. Plan id `support-content` → EDS name
  `support-cards` (migrate.mjs modules support support-cards).
- Content: `/support` one section, 4 blocks; 25 images on DA media (`media/support/`, 45 refs; link icons
  are display:none like live). support.microsoft.com relative links made absolute. No search widget: the
  page body has no search box — the header search is foundation chrome (dynamics row 2 stays there).
- captureState: the sign-in teaching callout is header chrome (foundation, opens + dismisses like live);
  no restoreAtDelivery behaviours on this page.
- section-schema: 0 `<section>` in the prototype → schema empty; round-trip run per block instance against
  a sectioned copy (`.work/rollout/probes/support-rt-split.mjs`): 13/9/17/16 editable, 0 🔴.
- Published-origin gate: 1440 0.04 % Δh 0, 360 0.01 % Δh 0, clipped 0, MISSING+HIDDEN 0, units 0 off;
  header/footer crops 0.25/0.00 % (1440), 0.29/0.00 % (360); chrome-parity 1440 13/13 + 65/65.
- Tool note: unit-geometry caches the origin per `<slug>-units` regardless of width — a 1440 run after a
  360 run compared against 360 geometry (39 false offs); re-measured with the cache moved aside, restored.

### archetype-bing (C-archetype, /bing)
- **bing-intro** — template-slotted: picture → cover background (eager, high priority), search link →
  form action + button label, paragraph → input placeholder (both `@ew-exempt`, attribute-hosted).
  D1 🟡 justified: a bespoke search hero, not prose.
- **bing-manifesto** — template-slotted: picture → layered image, heading moved (copy wrapped in a `p`
  inside the heading like live). D1 🟡 justified: decorative layered composition.
- **bing-panel** — template-slotted panel (media | text | optional options cell), reconstructive over
  rows: 1 row = static side-by-side, ≥ 2 rows = slider (prev/next/dots, live 1.5 s / 1 s transitions,
  idle pages wait left). Variants `reversed sixtyforty gray lightblue features compact`; per-row
  options `rounded rounded-block yellow` (`@variants`, `@ew-exempt`). Absorbs the planned
  `bing-features` (video): an `.mp4` link in the media cell → `<video autoplay muted loop playsinline>`
  served from the code origin (`/media/bing/…mp4`). D3 🟡 (rows with/without the options cell) accepted.
- **bing-footnotes** — template-slotted: list moved whole; `footnote-<n>` ids from the leading `<sup>`.
- Motion: live scroll reveal (`data-reveal` / `-inner` / `-stagger`, IntersectionObserver per block),
  slider transitions, arrow/dot hovers, video autoplay — verified on preview (video currentTime advances,
  7/7 reveal flips, next + dot advance pages). No slider autoplay (live has none).
- Gate (published origin): 1440 1.90 % Δh 1, 360 2.92 % Δh −2, clipped 0, MISSING+HIDDEN 0, units 0 off.
  Bands: header 2.47 / 0.73 %, footer 2.62 / 2.86 % (1440 / 360) = the foundation's segoe-vf residual.
  chrome-parity 1440: 40 deltas (= foundation, font-metric).

### archetype-about
- Blocks (renamed from the plan's page-copy names to reusable ones; coverage ids keep the plan names):
  **highlight** (hero) template-slotted — 1 or 2 pictures (wide >= 1084 / narrow), card h1 + copy + CTAs.
  **feature-band** (plan id feature-band, reused by index) reconstructive — optional head (in-table
  or reabsorbed default content) + one item per row (picture(s) wide >= 860 / narrow, heading, copy,
  CTAs); a CTA to a video file becomes the MWF modal trigger (`<dialog>`, .15s fade / .3s slide).
  Default = about's single horizontal card; index adds its grid as a variant.
  **material-cards** (commitments) reconstructive, variant `peach`; **text-cards** (discover + values)
  reconstructive, variants `peach` / `divider`; **panes** (culture) reconstructive (first pair left,
  rest stacked right, ruled); **showcase** (copilot) reconstructive by content (bg, logo+h2 intro,
  video link + poster, sub-heading, story cards, closing CTA strip); **explore** reconstructive
  (link list + follow row of linked icons). Section heads are default content reabsorbed (EW8).
- EW: block-roundtrip --ew 0 structural, 0 dead / 0 duplicated; 1 declared exemption (showcase video
  source link → `<video>` src + accessible name).
- Media: 20 editorial images in DA `media/about/`; videos stay on Microsoft's Dynamic Media CDN
  (36–44 MB MP4s, too big for the code bus; ACAO *), authored as links. Copilot video autoplays muted
  (IntersectionObserver play; probe: currentTime advancing, muted). Culture 400px assets are taken at
  native size (the `wid=549` renditions are white-padded by the CDN).
- Gate (published origin): 1440 2.34 % Δh −1, 360 4.10 % Δh +67 (0.7 %), clipped 0, MISSING+HIDDEN 0;
  video rows masked (gates/all-<w>/masks.json — live UMP frame is time-dependent, R1). Unit-geometry at
  1440 reads the width-agnostic origin cache (R3, instrument). Crops: header 0.08 / 2.27 % (360 = the
  foundation's accepted glyph residual R2), footer 0.02 / 0.02 %; chrome-parity 1440 11/11 + 65/65.

### archetype-en-us-surface-do-more-with-surface (C-deliver unit A, template `en-us-surface-do-more-with-surface`)
- **article-listing** — reconstructive (repeat group), rows classified by content: heading row = head
  (h2 + `<p>` search label, kept as the field's visually hidden `aria-labelledby` label), `<p>` + `<ul>` =
  category tabs (`<strong>` marks the current category; "All" authored as a self link — live has no
  href), image row = article card (picture, read-time `<p>`, `<h4><a>` → link wraps the heading like
  live, description `<p>`), list of `#` links = static pagination (`<strong>` = current; a second number
  after the ellipsis = the xs last page). Search button toggles `active-search` + focus (observed motion).
- **social-follow** — reconstructive: heading = "Follow us:", image + link row = follow item (image moved
  into the authored link, link text kept as a hidden label), lone `#` link = MWF fixed-sticky back-to-top
  band (`.stuck` while the slot is below the fold > 540 px, 1 s opacity fade after 100 px, smooth scroll
  + skip-link focus). Container is `flow-root` (the prototype wrap is a flex item; margins must not
  collapse into the band). Footer flush under the band = scoped override.
- Chrome: new www nav doc `/nav-surface` (Discover Surface site logo, Surface contextual menu, mobile
  Home, Cart) selected by page metadata `nav`; default footer. Cart order before Sign in = scoped
  override (`order`) in article-listing.css + foundation request; footer margin request filed too.
- Content: 14 images on DA media (`media/en-us-surface-do-more-with-surface/`, incl. og image).
  No h1 (live has none — delivery-lint P0 kept as source-faithful). captureState: none on this page.
- Published-origin gate: 1440 0.57 % Δh 0, 360 2.00 % Δh −1 px, clipped 0, MISSING+HIDDEN 0, units
  66/66 both widths; header/footer crops 1440 99.91/99.98 %, 360 96.96 (canon R1 glyph residual,
  100 % vs prototype)/99.95 %; chrome-parity 1440 11/11 + 65/65. `replica/units.json`
  dmws-article-card gained the EDS build selector.

### archetype-index (C-deliver unit A, template `index`, delivered at `/`)

- Blocks: `announce` (template-slotted, 1 row: copy + CTA; dismiss control code-side), `hero`
  (template-slotted shell + reconstructive tabs: per-tab rows of promo cards, quick links, featured
  banner; tolerant of `<p>`-wrapped cells; tab/pill labels `@ew-exempt` — hosted by buttons as live),
  `feature-band` reused with the additive `grid` variant (3-up "Get to know AI and Copilot"),
  `stories-carousel` (reconstructive, slides moved as authored; starts paused — the approved prototype
  has no idle auto-advance), `follow` (reconstructive linked social icons). Round-trip --ew: 0 🔴,
  editable 63/87, dead 0, duplicated 0, exempt 24 (proto maps `.hp-*` sections).
- Chrome: www home nav doc `/nav-home` (noindex) via metadata `nav`; template `home` → `body.home`
  page-scoped overrides in hero.css: html+body horizontal clip (carousel peeks), mobile
  `--header-height: 54px` (foundation request filed).
- Content: 38 images on DA media (`media/index/`, 12 pure-vector SVG quick-link icons). Metadata block
  moved into its own section (the harness strips the metadata wrapper section).
- Published-origin gate (round 2 of 3): 1440 7.39 % Δh 3, 360 9.70 % Δh −12, clipped 0; content MISSING
  0 @1440 / 2 @360 and units off/missing at both widths are live variance (promo carousel start card
  rotates per load; Personal banner copy changed on live after capture) → documented in
  `gates/all-{1440,360}/{presence,overrides}.json`; `replica/units.json` index families gained EDS
  build selectors. Header/footer crops 1440 99.30/99.86 %, 360 96.71 (R3 glyph residual)/99.78 %.

### cluster-about (static siblings: accessibility, corporate-responsibility, ai)
- Reused about blocks via additive variants (template-slotted highlight; reconstructive cards/bands); text-cards head keeps CTA/copy order; feature-band reads a paragraph before the heading as eyebrow. New: **backdrop** (template-slotted section image + `Theme | dark` page override), **ds-section** / **ds-stories** / **ds-faq** (reconstructive, rows classified by content), **ds-anchor-nav** (template-slotted). EW: ew-editability-probe /ai 341/341, a11y 53/53, CR 12/12, 0 dead, 0 duplicated; ds-faq declares the Expand/Collapse labels and ds-section the ask placeholder `@ew-exempt`.
- Deviations: /ai skip links ("Back to …"), the mobile nav dropdown label and the Ask Microsoft chat widget dropped; the ask field submits to Microsoft search (decision); aria-labels authored as link titles.
