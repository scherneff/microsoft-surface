# Dynamic features — www.microsoft.com (replica, 8 pages)

Curated from stardust/dynamics/dynamic-features.generated-plan.md (63 draft rows, 5 archetypes probed, reach over 8 pages).
Hands-off: every non-self row ships its interim tier with a named assumption; nothing is decided-out.

## Listings contract
Surface story grid (en-us-surface-do-more-with-surface, 12 cards; row-cols-2 band of 10) — editorially curated:
the document carries every card as authored rows (title, image, link). No index read. Pages emit `title`,
`description`, `og:image` metadata only.

## Features
| # | id | feature | class | reach | disposition | target | reproducibility | status | pattern | decision / owner | evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | chrome-menus | UHF header menus (All Microsoft mega menu, section nav dropdowns, mobile drawer) | M | 8/8 | rebuild-native | runtime | self | pending | chrome-interaction | none — header contract | stardust/chrome/header-contract.json |
| 2 | site-search | header search box (JS-submitted; home → /en-us/Search/results) | S | 8/8 | index-backed | widget | self | pending | search-index-backed | none — corpus = migrated pages | _dynamics.json s-site-search-* |
| 3 | surface-listing | Surface story card grids | L | 1/8 | rebuild-native (authored rows) | block | self | pending | listing (curated) | assumption: editorially curated | l-listing-candidate-* |
| 4 | carousels-tabs | home product carousel, accessibility hero carousel, ai/accessibility tab sets, Read more/less toggles | M | 4/8 | client-only | block | self | pending | client-only | none | crawl HYDRATED + motion-observe at Phase 4 |
| 5 | settings-objects | dataLayer / CQ settings objects | A | 3/8 | static-snapshot | content | self | pending | read-settings | none — ids carried in martech contract | a-cms-app-settings-* |
| 6 | nuxt-bing | explore.microsoft.com (Nuxt) client render | CR | 1/8 | static-snapshot | content | self | pending | settled-dom-snapshot | none — settled DOM captured, non-empty | cr-client-framework-nuxt |
| 7 | store-price | home buy-box price (/msstoreapiprod/api/buyBox) — captured "price unavailable" | A | 1/8 | static-snapshot | content | needs-business-decision | interim | off-origin-data | owner: live price feed for the new host? Interim: replicated as captured | a-first-party-api-get-msstoreapiprod-api-buybox |
| 8 | uhf-api | /edge/api/uhf, /edge/api/i18n messages (support/bing header data) | A | 2/8 | static-snapshot | content | needs-business-decision | interim | off-origin-data | owner: none needed if chrome stays authored; host-bound on target | dead on target |
| 9 | telemetry | /OneCollector/1.0/, /rest/v1/delivery (1DS telemetry, personalization delivery) | A | 8/8 | embed-passthrough | embed | needs-business-decision | scaffolded-awaiting-owner | consent-gated-tags | owner: telemetry endpoint + consent on the new host | host-bound 5/5 |
| 10 | tags | Adobe Launch (41 rules, 12 data elements), Google Tag Manager (DC-572608), session replay (Clicktale), ad pixels (LinkedIn, Facebook, Demandbase, Bing UET, pubmatic, casalemedia, tremorhub, smartadserver, rlcdn), Azure monitor | T | 8/8 | embed-passthrough | embed | needs-business-decision | scaffolded-awaiting-owner | consent-gated-tags | owner: enable routes in martech contract | stardust/martech-contract.json (all disabled) |
| 11 | sign-in | Sign in / account (login.live.com, aadcdn.msauth.net) | T | 8/8 | embed-passthrough | runtime | needs-business-decision | interim | chrome-interaction | interim: sign-in link points at the source sign-in URL | header contract |
| 12 | locales | locale picker + hreflang variants (en-us + ~60 locales) | I18N | 8/8 | rebuild-native | runtime | needs-business-decision | interim | locale-tree | owner: locale scope; interim: en-us only, picker links to source locale page | i18n-locale-variants-* |
| 13 | video | inline/cascade media player (home, surface: s7mbrstream.scene7.com, sundaysky) | V | 2/8 | embed-passthrough | content | self | pending | player | none — player URL carried | media 3 |
| 14 | unknown-hosts | uhf-exp azurefd, edgecdn azurefd, dc.services.visualstudio.com, company-target, www.google.com | T | ≤3/8 | static-snapshot | — | needs-human-capture | interim | inspect | undecided — revisit at rollout | inspect rows 2,4,8,9,12,15 |

## Decision batch (one message to the owner)
- **Tags & consent:** turn on routes in stardust/martech-contract.json (Adobe Launch, GTM); provide the CMP (none detected on the probed pages; Microsoft's own consent banner "Your Privacy Choices" is UHF-native). See stardust/martech-handoff.md.
- **Telemetry / personalization APIs** (rows 9, 8): endpoints for the new host, or keep off.
- **Store price feed** (row 7): wire a live price, or keep the captured "price unavailable" state.
- **Sign-in** (row 11) and **locale scope** (row 12).
- **Unknown hosts** (row 14): inspect and classify.

## Register (decided-out)
| feature | reason | production statement |
|---|---|---|
| — | none | — |
