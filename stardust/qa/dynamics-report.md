# Dynamics parity check — https://main--3bab0b60--aemcoder.aem.live — 2026-11-04T09:13:06.528Z

Replayed 8 checks over 14 features · pass 8 · fail 0. Flows, not presence.

| feature | class | status | check | result | detail | third-party requests |
|---|---|---|---|---|---|---|
| UHF header menus, mobile drawer | M | done | dom-count | PASS | 58 × header nav a (min 40) | c.s-microsoft.com:200×2 |
| UHF header menus, mobile drawer | M | done | no-page-errors | PASS | none on 5 page(s) |  |
| header search → results page | S | done | search-query | PASS | 4 results · first: accessibility technology & tools / microsoft accessibility · matches the source | c.s-microsoft.com:200×2 |
| header search → results page | S | done | dom-count | PASS | 1 × form.uhf-search-form[action$='/search'] (min 1) | c.s-microsoft.com:200×2 |
| Surface story card grid (authored rows) | L | done | dom-count | PASS | 27 × .article-listing a (min 24) | c.s-microsoft.com:200×3 |
| home carousel, accessibility/ai tabs and toggles | M | done | dom-count | PASS | 1 × .stories-carousel (min 1) | c.s-microsoft.com:200×2 |
| Bing section video (autoplay, muted, loop) | V | done | video-plays | PASS | iframe/video: false · video playing (Δt 0.81s) | c.s-microsoft.com:200×2 |
| martech: consent + tag routing | T | scaffolded-off | martech | PASS | no tag host requested (2 gated · 1 cross-site host(s) blocked) |  |

## Features without checks

- dataLayer / CQ settings objects (A) — done
- explore.microsoft.com client render (CR) — done
- home buy-box price (A) — interim · owner: wire a live price feed for the new host, or keep the captured 'price unavailable' state
- /edge/api/uhf, i18n messages (A) — interim · owner: none needed while chrome stays authored (nav/footer documents)
- 1DS telemetry, personalization delivery (A) — scaffolded-awaiting-owner · owner: telemetry endpoint + consent on the new host
- Sign in / account (T) — interim · owner: sign-in link points at the source sign-in URL
- locale picker + hreflang variants (I18N) — interim · owner: locale scope; interim en-us only, picker links to the source locale page
- uhf-exp/edgecdn azurefd, visualstudio dc, company-target, google (T) — interim · owner: inspect and classify
