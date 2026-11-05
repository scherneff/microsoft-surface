# Rollout report — www.microsoft.com replica → main--3bab0b60--aemcoder.aem.live (2026-11-04)

## Summary

| | |
|---|---|
| **Pages** | 9 live and verified: 8 migrated pages (10 selected; /earn is a 301 off-origin → redirect row, /dashboard 404 on the source) + /search built for site search |
| **Templates** | 5 page types, one gated archetype each: landing (home), static (about + accessibility, ai, corporate-responsibility), listing (Surface), program (Bing), unique (Support); plus search |
| **Blocks** | 20 distinct blocks, 20 converted; header/footer as nav/footer documents (11 chrome docs, all noindex); 1 widget (search) |
| **Fidelity (published origin, pixel % / Δh px)** | 1440: index 7.39/3 (override: live variance), about 2.34/−1, support 0.04/0, accessibility 1.92/3, ai 6.59/32, bing 1.90/1, CR 3.04/−142 (within 5 %), Surface 0.57/0 · 360: index 9.70/−12 (override), about 4.10/67, support 0.01/0, accessibility 2.62/−34, ai 18.6/−9 (override: live capture state), bing 2.92/−2, CR 5.66/6, Surface 2.00/−1 — 8/8 delivered at both widths |
| **Quality** | optimize health 100/100; open P1 0 / P2 0 / P3 0; 4 JSON-LD fixed (source structured data carried); 4 source-parity informational |
| **Dynamics** | 13 features; parity 9/9 PASS on aem.live (menus, search, listing, carousel, Bing video, martech gate) |
| **Site** | sitemap served 9 = assembled 9; redirects sheet 11 rows live; `/` 200; links: internal 14/14 200 |
| **Martech** | Adobe Launch + GTM carried over in scripts/martech.js, every part disabled (owner turns them on) |
| **Register** | R-03 applied (Surface title h1, semantic only); R-01, R-02 deferred |

## To deliver / owner decisions

- Tags and consent: enable routes in stardust/martech-contract.json (stardust/martech-handoff.md).
- Telemetry/personalization endpoints, store price feed, sign-in, locale scope, unknown hosts (stardust/dynamic-features.md § Decision batch).
- 220 out-of-scope www.microsoft.com targets stay absolute links to the source (direction.md § Link audit decision); 3 external links are dead on the source itself.
- Licensed Segoe UI Variable is not rehosted; metric-matched substitute in the stack.
- Production host: robots.txt on aem.live/aem.page disallows all by design; configure the production CDN host before go-live.
