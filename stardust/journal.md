# Journal — Microsoft same-design migration (replica, hands-off)

## Extract — 8 of 10 selected pages captured live, design spec written (2026-11-04)

- Scope: the 10 `selected: true` pages of stardust/.labs/site-plan.json; gate breakpoints desktop,mobile → 1440,360.
- crawl.mjs (chrome technique, 3 contexts, --dynamics): 8/8 live renders with Playwright provenance.
  `/` → /en-us (first pass timed out at 45 s, recaptured with --wait slow), `/about` → /en-us/about,
  `/support` → support.microsoft.com/en-us/, `/bing` → explore.microsoft.com/en-us/bing.
- Not pages: `/earn` 301 → https://earn.microsoft.com/ (off-origin; second try hit an Akamai 403 on the target) —
  becomes a redirect entry; `/dashboard` HTTP 404 on the source (2 attempts) — not migrated.
- Vision: 6 ok; `index` full-page screenshot blank below the header (lazy content never painted in one-shot
  capture; DOM complete), `ai` one empty tab panel — gate stitched captures are ground truth for both.
- Page types: landing (index), static (about, accessibility, ai, corporate-responsibility), listing (surface
  do-more), program (bing), unique (support). Archetypes: index, about, surface, bing, support.
- Census at 1440+360, cap-probe on the 5 archetypes (contentMaxWidth 1624, inconsistent across platforms),
  header contract recorded on /en-us/about (home navigation hangs for chrome-explore twice — edge pacing).
- Fonts: Segoe UI family is licensed — referenced from c.s-microsoft.com, never rehosted.

## Preserve direction — current spec promoted verbatim, pure-replica register, dynamics triaged (2026-11-04)

- current/PRODUCT.md, DESIGN.md, DESIGN.json → project root verbatim (DESIGN.json carries cap-probe breakpoints).
- direction.md written (PRESERVE). Register: no applied entries; R-01/R-02 deferred cap observations.
- No --target-breakpoints: source breakpoints kept.
- Dynamics: detect on 5 archetypes (63 findings) → curated 14 rows in dynamic-features.md, every row dispositioned;
  self: header menus, search, listing, carousels/tabs, settings, Nuxt snapshot, video. Owner batch recorded.
- Martech (owner asked to keep tags): spec-martech found Adobe Launch (41 rules, 12 data elements) + GTM, no CMP;
  dynamics-plan --martech wrote martech-contract.json + martech-handoff.md, every part disabled.

## Recreate + source-fidelity gate — 5 archetypes gated at 1440 and 360 (2026-11-04)

Archetypes authored by fan-out agents from stardust/replica/brief.md; www canon (canon.css/js) from about, cumulative on index and the Surface listing; bing and support carry their own platform chrome.

| archetype | type | 1440 px% / Δh | 360 px% / Δh | content 🔴/🟡 | cap-probe |
|---|---|---|---|---|---|
| about | static | 0.90 / 1 | 2.16 / 3 | 0/0 | PASS |
| support | unique | 0.01 / 0 | 0.00 / 0 | 0/0 | PASS |
| bing | program | 1.31 / 1 | 2.99 / −1 | 0/0 | PASS |
| en-us-surface-do-more-with-surface | listing | 0.56 / 0 | 0.59 / 0 | 0/0 | PASS |
| index | landing | 4.81 / 3 | 7.48 / 0 | 0/0 | PASS |

- Prototype tables (gate-all --stage prototype): 4/5 full PASS per width after clearing the single-width unit
  caches (stardust/current/measure/*-units.json hold one width — run widths sequentially). index fails only
  on unit geometry: its promo/stories carousels rotate per live load.
- Residuals: mobile header crops 96.7–97.7% (icon-font glyphs redrawn in CSS — the font is licensed, not
  rehosted); about 360 video mid-playback; accepted.json carries 8 content-diff acceptances (icons, single search
  input, captured prices). Header-contract comparisons for bing/support have open items for the owner.
- Fonts: Segoe UI referenced from c.s-microsoft.com (cross-origin OK), face "SegoeUI" on www pages.

## A-inventory, B-block, B2-dynamic — handoff opened, 5 archetypes rendered and planned (2026-11-04)

- migrate: `render --all` placed the 5 approved archetypes (Path A) under stardust/migrated/; modules[] set per page.
  The 3 static siblings (accessibility, ai, corporate-responsibility) render after the static (about) archetype unit.
- martech-scaffold wrote scripts/martech.js (no CMP found, 0 routes enabled — every contract part stays off for the owner).
- A-inventory: 5 pages. inventory.mjs `--state` was dropped: its state merge keeps the trailing slash of
  `/en-us/surface/do-more-with-surface/` and added a duplicate `-x` row; siblings join from the migrated tree instead.
- B-block: 20 distinct module blocks (feature-band shared by about + index). B2-dynamic: plan re-run against the
  preview origin — 61 raw rows, the 14 curated rows of dynamic-features.md unchanged, 5/5 first-party APIs host-bound
  (as triaged: Microsoft account/search services stay on microsoft.com).

## C-deliver — variance probe for the static template (2026-11-04)

sibling-variance (about vs accessibility, ai, corporate-responsibility; probes hero/card/h2 at 1440) exit 2: every sibling
varies — hero heights 496/612/540 vs 450 with dark/white heading variants, card families 5–7 vs 6, and /ai runs a
different component system (`--ds-*` tokens, 10 hero-like bands, no h2 under #primaryArea). Evidence:
stardust/migrate/variance/static.json. The static cluster budgets these as block variants or new blocks.

## C-deliver unit foundation — 3 chrome variants live, foundation frozen (2026-11-04)

Header/footer blocks with www (UHF), bing and support variants selected by page metadata `nav`; 6 chrome documents
live with Robots noindex; 3 preview-only shells under /drafts. Main-agent gate: chrome-parity ✓ for www and support at
1440; bing's 40/66 text-metric deltas and its 2.5–3 % bands match the approved prototype (0.00 % build-vs-prototype) —
the licensed variable Segoe face is not rehosted. Freeze: 15 files (foundation-freeze.json).

## C-deliver unit archetype-support — support home live, 0.04 % / 0.01 % (2026-11-04)

One block `support-cards` (products/features/groups variants), 25 images on DA media, published. Gate row on preview:
1440 0.04 % Δh 0, 360 0.01 % Δh 0, clipped 0, missing 0. One fix round (main top margin collapse at 360).
gate-all reads `status: deployed` + `liveUrl` from state.json — the coordinator now marks delivered pages there
(state.mjs has no `deployed` target). unit-geometry's live cache holds one width: run widths sequentially.

## C-deliver unit archetype-bing — Bing page live, 1.90 % / 2.92 % (2026-11-04)

Blocks bing-intro, bing-manifesto, bing-panel (absorbs the video section: autoplay muted loop from the code origin),
bing-footnotes; 13 images on DA media; published. Gate row: 1440 1.90 % Δh 1, 360 2.92 % Δh −2, clipped 0, missing 0
(round 2; round 1 failed unit geometry only). Chrome bands carry the known Segoe residual.

## C-deliver unit archetype-about — About page live, 2.34 % / 4.10 % (2026-11-04)

Blocks highlight, feature-band, material-cards, showcase, text-cards, panes, explore (general, variant-driven, for the
static siblings and index). Gate row: 1440 2.34 % Δh −1, 360 4.10 % Δh +67, clipped 0, missing 0; the mid-playback video
rows are masked (masks.json, documented). The 1440 row's unit-geometry FAIL comes from a 360-width live cache (R3) —
re-measured at gate-all. Videos link Microsoft's CDN (36–44 MB, too large for the code origin).

## C-deliver unit archetype-en-us-surface-do-more-with-surface — Surface listing live, 0.57 % / 2.00 % (2026-11-04)

Blocks article-listing + social-follow (reconstructive), new chrome doc /nav-surface (noindex), 14 images. Gate row:
1440 0.57 % Δh 0, 360 2.00 % Δh −1, clipped 0, missing 0, 66/66 card units. delivery-lint's no-h1 P0 is source parity
(live has no h1) — kept. "All" tab links to the page itself (EW: text-only tab failed editability). 2 foundation
requests queued (cart before Sign in; footer flush under back-to-top), page-scoped overrides ship meanwhile.

## C-deliver — session boundary with two units in flight (2026-11-04)

Runner asked to stop at 96 min. archetype-index and cluster-about were stopped mid-unit and stay `running` in
stardust/rollout/progress.json (migrate unit `static` likewise): the next session re-runs them from disk state —
index had blocks in progress (hero tabs tolerant of `<p>`-wrapped cells), the static cluster was writing image
manifests for accessibility and corporate-responsibility. Done: foundation, archetype + cluster for support, bing,
Surface listing; archetype-about. Coordinator marks delivered pages `deployed` + `liveUrl` in state.json with
stardust/.work/rollout/probes/mark-deployed.mjs (gate-all's roster).

## C-deliver unit archetype-index — home page live, 7.39 % / 9.70 % (2026-11-04)

Blocks announce, hero (tabs), stories-carousel, follow + feature-band `grid`; /nav-home chrome doc; 38 images on DA
media; published. Gate row (round 2): 1440 7.39 % Δh 3, 360 9.70 % Δh −12, clipped 0. MISSING 0 @1440, 2 @360 and the
units FAIL are live variance (promo carousel start card rotates per load; Personal banner copy changed after capture)
— recorded as presence/overrides sidecars, not fixed by re-authoring. Fixes: stories carousel paused like the
prototype, html+body clip on home, 54 px mobile header reserve (foundation request queued).

## C-deliver unit cluster-about — 3 static siblings live, accessibility + CR pass 1440, /ai and the 360 rows over the bar (2026-11-04)

About blocks reused with variant classes (highlight carousel/backplate/band, text-cards with-icons/tiles/halves/band, material-cards dark/flat, feature-band surface/alternate/reversed/pair, explore stacked) plus new `backdrop` (section image, page theme dark); /ai's reimagine system got `ds-section`, `ds-anchor-nav`, `ds-stories`, `ds-faq`. 6 docs published (3 pages, 3 nav docs), 108 /ai images on DA media.
Gate (published origin): accessibility 1440 3.35 % Δh +14 PASS / 360 15.92 % Δh +23 FAIL (missing 1 = hero slide timing); CR 1440 3.11 % Δh −142 PASS / 360 10.95 % Δh −98 FAIL; /ai 1440 10.43 % Δh +20 FAIL / 360 19.23 % Δh −13 FAIL (clipped 1: banner CTA). 3-round cap reached on every page.
Residuals: hero carousels masked (autoplay; interval set to the live 5 s); /ai carousels + case-study carousel are presence counts-only (viewport-edge peek reads aria-labels on live); licensed Segoe UI Variable not rehosted; Ask Microsoft chat widget dropped; live aria-labels carried as link titles.
About re-gated after the additive changes: 1440 2.34 % Δh −1, 360 4.10 % Δh +67 (unchanged). 1 foundation request (page theme dark); foundation-freeze check 0.

## C-deliver unit gate-all — C-final requests applied, roster gated 7/8 @1440, 5/8 @360 (2026-11-04)

C-final start: foundation-freeze check 0; the 4 queued requests moved verbatim from their page-scoped overrides into the foundation (header.css cart order ≥860 for every www non-home header, footer.css flush under a back-to-top band, styles.css home 54 px mobile header + page theme `dark` tokens, header.css dark bar), overrides removed, pushed, re-frozen (15 files).
gate-all (--skip-existing, EDS recaptured): 1440 6 PASS + index override = 7/8 (ai 10.43 % FAIL); 360 4 PASS + override = 5/8 (accessibility 15.92 %, CR 10.95 %, ai 19.23 % clipped 1) — the cluster-about residuals, unchanged by the requests.
Instrument defect: unit-geometry caches the origin inventory per slug, not per width (stardust/current/measure/<slug>-units.json), so the first 1440 pass compared 1440 builds against 360 origin units (5 false unit FAILs). Caches set aside per width (stardust/.work/rollout/units-cache-*), both widths re-measured. Coverage gained the 3 static sibling rows (update-coverage --new); support row corrected to deployed.

## C-deliver unit final — static siblings fix wave (2026-11-04)

Fixes (block CSS/JS only, variant- or width-scoped): highlight carousel controls 12px under the stage <1084 and hero autoplay phase-locked to live (first advance 6.8 s after navigation, then 5 s); material-cards flat/dark card CTAs as MWF .cta link groups; text-cards band/with-icons CTA rhythm <860; explore follow-only row 64px under the band; feature-band surface reversed rhythm <860; ds-section promo card (24/32 h2, inset media, 58px arrows, no peek), people promo column, closing cards, card-carousel slides / ask / banner / FAQ at 360; ds-stories testimonial-card frame.
Numbers (before → after): corporate-responsibility 360 10.95 % Δh −98 → 5.66 % Δh +6 PASS (1440 3.04 % PASS); accessibility 360 15.92 % MISSING 1 → 2.62 % Δh −34 content 0 PASS (1440 3.35 → 1.92 % PASS); ai 1440 10.43 % → 6.59 % Δh +32 PASS; ai 360 19.23 % clipped 1 → 18.6 % Δh −9 clipped 0 FAIL (pixel only). About unchanged: 1440 2.34 % Δh −1, 360 4.10 % Δh +67.
Residual ai 360 (3 rounds spent): the reused origin capture caught Ask Microsoft mid-hydration (prompt field collapsed under the chips, 52px shorter than the live band in every later session), so every band below 1000px is offset 40–90px against the frozen origin; live-session geometry now matches per section (textpos), the pixel number does not. Also the mobile anchor nav is a live dropdown (EDS scroller) and one closing card image is a different rendition. Re-capturing the /ai origin at 360 is the next step, not more CSS.
Foundation requests 0; foundation-freeze check 0.

## C-deliver unit final — roster 8/8 delivered at both widths, C-deliver closed (2026-11-04)

After the siblings fix wave: /ai 360 re-shot from the live origin (--recapture-origin) still 18.6 %: the live stitch reproducibly catches the Ask Microsoft widget before its input row hydrates (live bands ~50 px high) and the licensed Segoe UI Variable wraps "Advance your AI journey" to 2 lines; measure.mjs --all-matches main h2 against a settled live load puts every heading within 0 to −40 px. Recorded as a documented override in gates/all-360/overrides.json (height, clip, content pass).
Final roster (--skip-existing, origin unit caches cleared per width): 1440 7 PASS + index override = 8/8; 360 6 PASS + index, ai overrides = 8/8. Coverage 8/8 deployed, 0 failed. foundation-freeze check 0, no new requests.

## D-site — sitemap served 8 = assembled 8, redirects sheet live (2026-11-04)

assemble.mjs: sitemap 8, robots.txt; `--verify-origin` on aem.live exit 0 (extra 0, missing 0). Every chrome document (nav, footer, 7 nav-* and 2 footer-* variants) already served `robots: noindex`. stardust/redirects.tsv seeded by hand (no spec knowledge in this run): the two trailing-slash source paths → extensionless delivered URLs, and /earn → https://earn.microsoft.com/ (the 301 extract recorded). PUT as DA sheet /redirects.json, previewed + published; all three answer 301 on aem.live. Source root serves a page, so `/` is the index document (no `/` row); aem.page `/` 200. /dashboard (404 on source) gets no row.

## D2-dynamic — site search rebuilt over the migrated corpus, 8/8 parity checks pass (2026-11-04)

/query-index.json answered 404: added helix-query.yaml (chrome, drafts and /search excluded; title, description, image, robots, text), pushed, re-published the 8 pages live; index total 8 on the 10th 5 s poll. Built widgets/search/search.{html,css,js} (title-first ranking, deeper fields only below 3 hits, dedupe, 10 per page) mounted on a new /search document; the six www navs' search link now points at /search (header form posts ?q=). Support and Bing navs keep support.microsoft.com and bing.com search — separate services. stardust/dynamics/parity.json written (13 features, 8 checks + martech); dynamics-check on aem.live exit 0: menus 58 links, no page errors on 5 pages, search 4 results with /accessibility first, Surface grid 27 links, carousel, Bing video playing (Δt 0.81 s), martech gate (no tag host requested, all parts disabled). Source search covers all of microsoft.com (second corpus), so count parity is over the migrated pages — recorded as an environment limit. /search added to coverage (--new, origin dynamics); served sitemap 9 = assembled 9.

## E-full-site — 9/9 verified on aem.live (2026-11-04)

Gate tables 1440 + 360 folded into coverage (8/8 rows matched, 0 flips). First verify: 5 failed — /about, /bing, /support fetched as `/<slug>/` (their migrated sources are folder index.html files, lib publicUrl), Surface listing and /search had no h1 in the served HTML. Fixes: trailing-slash redirects /about/, /bing/, /support/ → the pages (sheet now 6 rows, live, 301 verified); /search carries its h1 in the document; Surface title authored h1 instead of h2 — register R-03 (applied, semantic only: the block styles it by class); project verify.mjs skips `/widgets/` code links (the dynamics widget contract; reported as a false broken-page link). Re-gate of the Surface page on aem.live: 1440 0.57 % Δh 0 PASS, 360 2.00 % Δh −1 PASS (units 66 within) — identical to the C-final row. The origin unit cache (stardust/current/measure/<slug>-units.json) is keyed per slug, not per width: a 360 run after a 1440 run reuses the 1440 inventory and fails every unit; clear it between widths. No restoreAtDelivery entries; Bing autoplay video plays (D2 replay). Verify 9/9.

## E2-link-audit — internal 14/14 → 200, 220 out-of-scope targets kept absolute (2026-11-04)

localize-links over content/: 1 link localized (/en-us/ai on home) after adding the five canonical en-us redirects (sheet now 11 rows, live, 301 verified); home re-deployed. href audit over the 9 pages + 11 chrome docs on aem.live: 498 hrefs, internal 14/14 200, external 462 200 / 17 403 (bot-gated non-browser fetch) / 2 TLS / 3 source-dead 404. Decision recorded in direction.md § Link audit decision. No page outside the site plan was added.

## F-optimize — gate clean, health 100, source JSON-LD carried (2026-11-04)

optimize run-1: 0 P1, 5 P2 ai-search/jsonld where the source page carries JSON-LD (home WebSite+SearchAction, about / CR / Surface Organization) plus /search; 4 source-parity P2 (support, ai, bing, accessibility have none on the source either). Fix: each page's captured JSON-LD added verbatim as a `json-ld` metadata row (probe helper stardust/.work/rollout/probes/add-jsonld.mjs); the pipeline renders it as a head `<script type="application/ld+json">` — parsed OK on all four. DA sources matched git before the PUT. /search (built in D2, no source counterpart) accepted rather than fabricated. Final: health 100/100, open P1 0 / P2 0, 4 fixed.

## G-aem — nothing to autofix (2026-11-04)

autofix-aem --dry-run: 0 candidates (F left no open finding). Re-verify after the F re-deploy of four pages: 9/9 verified.

## H-report — report and learnings written (2026-11-04)

stardust/rollout/report.md: 9 pages verified (8 migrated + /search), 5 templates, 20 blocks, gates 8/8 at 1440 and 360 (3 documented overrides), health 100, parity 9/9, owner decisions listed. stardust/learnings.md: 6 entries.

## I-dashboard — dashboard written, rollout A–I complete (2026-11-04)

dashboard.mjs → stardust/rollout/dashboard/{index.html,data.json}: pages 9 identified / prototyped / deployed, 5 optimised. Rollout phases A through I ended.

## Handoff — run complete (2026-11-04)

Rollout A–I ended; done-check `{"complete":true,"gaps":[]}`. Delivered: 8 migrated pages + /search live on main--3bab0b60--aemcoder.aem.live, gate 8/8 at 1440 and 360, verify 9/9, optimize health 100, dynamics parity 9/9, redirects sheet 11 rows, sitemap served 9, martech carried over disabled. Owner decisions: stardust/rollout/report.md § To deliver.
