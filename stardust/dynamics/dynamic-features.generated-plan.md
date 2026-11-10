<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-11-04T03:19:31.700Z · input stardust/current/_dynamics.json (5 pages, 61 findings) · target probe https://main--3bab0b60--aemcoder.aem.page · reconciled against stardust/migrated -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · target = the delivery form (widget where no authored rows remain) · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | target | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | a-first-party-api-post-onecollector-1-0 | A | first-party API POST /OneCollector/1.0/ | 5/5 (reach 8/8) | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? | **dead on target (404)** |
| 2 | a-unknown-third-party-host-uhf-exp-fd-gbcrdgggfbggh0g3-b02-a | A | unknown third-party host uhf-exp-fd-gbcrdgggfbggh0g3.b02.azurefd.net | 3/5 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 3 | a-first-party-api-post-rest-v1-delivery | A | first-party API POST /rest/v1/delivery | 3/5 (reach 4/8) | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? | **dead on target (404)** |
| 4 | a-unknown-third-party-host-api-company-target-com | A | unknown third-party host api.company-target.com | 2/5 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 5 | a-unknown-third-party-host-c-az-clicktale-net | A | unknown third-party host c.az.clicktale.net | 2/5 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 6 | a-unknown-third-party-host-k-af-clicktale-net | A | unknown third-party host k.af.clicktale.net | 2/5 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 7 | a-cms-app-settings-object-datalayer | A | CMS / app settings object dataLayer | 2/5 | static-snapshot | content | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 8 | a-unknown-third-party-host-tag-logger-demandbase-com | A | unknown third-party host tag-logger.demandbase.com | 1/5 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 9 | a-unknown-third-party-host-dc-services-visualstudio-com | A | unknown third-party host dc.services.visualstudio.com | 1/5 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 10 | a-first-party-api-get-msstoreapiprod-api-buybox | A | first-party API GET /msstoreapiprod/api/buyBox | 1/5 (reach 1/8) | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? | **dead on target (404)** |
| 11 | a-cms-app-settings-object-cq | A | CMS / app settings object CQ | 1/5 | static-snapshot | content | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 12 | a-unknown-third-party-host-www-google-com | A | unknown third-party host www.google.com | 1/5 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 13 | a-unknown-third-party-host-s7mbrstream-scene7-com | A | unknown third-party host s7mbrstream.scene7.com | 1/5 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 14 | a-unknown-third-party-host-px-ads-linkedin-com | A | unknown third-party host px.ads.linkedin.com | 1/5 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 15 | a-unknown-third-party-host-edgecdn-embza6g8cacagcbn-z01-azur | A | unknown third-party host edgecdn-embza6g8cacagcbn.z01.azurefd.net | 1/5 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 16 | a-first-party-api-get-edge-api-i18n-1aef7089-en-us-messages- | A | first-party API GET /edge/api/i18n/1aef7089/en-us/messages.json | 1/5 (reach 1/8) | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? | **dead on target (404)** |
| 17 | a-first-party-api-get-edge-api-uhf | A | first-party API GET /edge/api/uhf | 1/5 (reach 1/8) | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? | **dead on target (404)** |
| 18 | cr-client-framework-nuxt | CR | client framework nuxt | 1/5 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 19 | i18n-locale-variants-ai | I18N | locale variants ai | 2/5 | rebuild-native | runtime | needs-business-decision | delivered-by-capture | locale-tree | scope of the locale trees | output already carries "https://www.microsoft.com/ai" |
| 20 | i18n-locale-variants-en-us-en-nz-de-at-fr-be-nl-be-da-dk-fi- | I18N | locale variants en-us,en-nz,de-at,fr-be,nl-be,da-dk,fi-fi,en-ie,en-hk,zh-hk,en-sg,en-in,en-au,en-ca,en-cy,en-eg,en-gb,en-il,en-jo,en-lb,en-lk,en-mt,en-my,en-ng,en-ph,en-pk,en-sa,en-za,ar-eg,ar-iq,ar-ly,ar-sa,bg-bg,cs-cz,de-ch,de-de,el-gr,es-ar,es-bo,es-cl,es-co,es-cr,es-do,es-ec,es-es,es-gt,es-mx,es-ni,es-pa,es-pe,es-pr,es-py,es-sv,es-uy,es-ve,et-ee,fr-ca,fr-ch,fr-dz,fr-fr,fr-lu,fr-ma,fr-tn,he-il,hr-hr,hu-hu,id-id,is-is,it-it,ja-jp,ko-kr,lt-lt,lv-lv,nb-no,nl-nl,pl-pl,pt-br,pt-pt,ro-md,ro-ro,ru-by,ru-kz,ru-ru,sk-sk,sl-si,sv-se,th-th,tr-tr,uk-ua,zh-cn,zh-tw,de-lu,es-hn,vi-vn,ar-ae,en-ae,bs-ba,sr-rs,sr-me,x-default | 1/5 | rebuild-native | runtime | needs-business-decision | delivered-by-capture | locale-tree | scope of the locale trees | output already carries "https://www.xbox.com/en-US/xbox-game-pas" |
| 21 | i18n-locale-variants-en-us-x-default | I18N | locale variants en-us,x-default | 1/5 | rebuild-native | runtime | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 22 | l-listing-candidate-row-row-cols-1-12-cards | L | listing candidate row row-cols-1 (12 cards) | 1/5 | index-backed | block | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 23 | l-listing-candidate-row-row-cols-2-10-cards | L | listing candidate row row-cols-2 (10 cards) | 1/5 | index-backed | block | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 24 | m-modal-trigger-aria-haspopup-chrome-only-target-outside-dom | M | modal trigger aria-haspopup (chrome only) → target outside DOM at capture | 3/5 (reach 36/8) | rebuild-native | runtime | self | delivered-by-capture | chrome-interaction | none (the header contract is the spec) | output already carries "All Microsoft" |
| 25 | s-site-search-form-js-submitted | S | site search form → (JS-submitted) | 4/5 (reach 3/8) | index-backed | widget | self | pending | search-index-backed | none (corpus = the migrated pages; second corpora stay out) |  |
| 26 | s-site-search-form-en-us-search-results | S | site search form → /en-us/Search/results | 1/5 (reach 3/8) | index-backed | widget | self | pending | search-index-backed | none (corpus = the migrated pages; second corpora stay out) |  |
| 27 | t-marketing-ad-retargeting-pixel | T | marketing: ad / retargeting pixel | 4/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 28 | t-unknown-third-party-host-c-bing-com | T | unknown third-party host c.bing.com | 4/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 29 | t-analytics-session-replay | T | analytics: session replay | 3/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 30 | t-analytics-adobe-analytics-experience-cloud-id | T | analytics: Adobe Analytics / Experience Cloud ID | 3/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 31 | t-unknown-third-party-host-login-live-com | T | unknown third-party host login.live.com | 3/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 32 | t-unknown-third-party-host-rum-hlx-page | T | unknown third-party host rum.hlx.page | 2/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 33 | t-unknown-third-party-host-www-facebook-com | T | unknown third-party host www.facebook.com | 2/5 | embed-passthrough | embed | needs-business-decision | delivered-by-capture | consent-gated-tags | which tags run on the new host; property ids | output already carries "www.facebook.com" |
| 34 | t-tag-manager-google-tag-manager | T | tag manager: Google Tag Manager | 2/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 35 | t-unknown-third-party-host-www-google-com | T | unknown third-party host www.google.com | 2/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 36 | t-unknown-third-party-host-www-linkedin-com | T | unknown third-party host www.linkedin.com | 2/5 | embed-passthrough | embed | needs-business-decision | delivered-by-capture | consent-gated-tags | which tags run on the new host; property ids | output already carries "www.linkedin.com" |
| 37 | t-unknown-third-party-host-cdnssl-clicktale-net | T | unknown third-party host cdnssl.clicktale.net | 2/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 38 | t-unknown-third-party-host-js-monitor-azure-com | T | unknown third-party host js.monitor.azure.com | 2/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 39 | t-unknown-third-party-host-c-s-microsoft-com | T | unknown third-party host c.s-microsoft.com | 1/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 40 | t-unknown-third-party-host-tag-demandbase-com | T | unknown third-party host tag.demandbase.com | 1/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 41 | t-unknown-third-party-host-px-ads-linkedin-com | T | unknown third-party host px.ads.linkedin.com | 1/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 42 | t-unknown-third-party-host-id-rlcdn-com | T | unknown third-party host id.rlcdn.com | 1/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 43 | t-unknown-third-party-host-s-company-target-com | T | unknown third-party host s.company-target.com | 1/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 44 | t-unknown-third-party-host-dsum-sec-casalemedia-com | T | unknown third-party host dsum-sec.casalemedia.com | 1/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 45 | t-unknown-third-party-host-image2-pubmatic-com | T | unknown third-party host image2.pubmatic.com | 1/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 46 | t-unknown-third-party-host-segments-company-target-com | T | unknown third-party host segments.company-target.com | 1/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 47 | t-unknown-third-party-host-partners-tremorhub-com | T | unknown third-party host partners.tremorhub.com | 1/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 48 | t-tag-manager-adobe-launch | T | tag manager: Adobe Launch | 1/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 49 | t-unknown-third-party-host-s-vop-sundaysky-com | T | unknown third-party host s-vop.sundaysky.com | 1/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 50 | t-unknown-third-party-host-s-vop-sundayskyads-com | T | unknown third-party host s-vop.sundayskyads.com | 1/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 51 | t-unknown-third-party-host-vop-sundaysky-com | T | unknown third-party host vop.sundaysky.com | 1/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 52 | t-unknown-third-party-host-rtb-csync-smartadserver-com | T | unknown third-party host rtb-csync.smartadserver.com | 1/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 53 | t-unknown-third-party-host-edgestatic-azureedge-net | T | unknown third-party host edgestatic.azureedge.net | 1/5 | embed-passthrough | embed | needs-business-decision | delivered-by-capture | consent-gated-tags | which tags run on the new host; property ids | output already carries "edgestatic.azureedge.net" |
| 54 | t-unknown-third-party-host-www-bing-com | T | unknown third-party host www.bing.com | 1/5 | embed-passthrough | embed | needs-business-decision | delivered-by-capture | consent-gated-tags | which tags run on the new host; property ids | output already carries "www.bing.com" |
| 55 | t-unknown-third-party-host-mem-gfx-ms | T | unknown third-party host mem.gfx.ms | 1/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 56 | t-unknown-third-party-host-aadcdn-msauth-net | T | unknown third-party host aadcdn.msauth.net | 1/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 57 | t-unknown-third-party-host-logincdn-msftauth-net | T | unknown third-party host logincdn.msftauth.net | 1/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 58 | x-sign-in-account-links | X | sign-in / account links | 5/5 | decided-out | — | needs-backend | delivered-by-capture | decided-out | auth / commerce on the new host? | output already carries "https://account.microsoft.com/" |
| 59 | x-auth-identity-provider | X | auth: identity provider | 3/5 | decided-out | — | needs-backend | pending | decided-out | auth / commerce on the new host? |  |
| 60 | x-commerce-signals-cart-true-prices-2 | X | commerce signals (cart: true, prices: 2) | 1/5 | decided-out | — | needs-backend | pending | decided-out | auth / commerce on the new host? |  |
| 61 | x-commerce-signals-cart-true-prices-0 | X | commerce signals (cart: true, prices: 0) | 1/5 | decided-out | — | needs-backend | pending | decided-out | auth / commerce on the new host? |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 5 row(s) — read-settings, settled-dom-snapshot, search-index-backed.
- **One owner decision batch:** 45 row(s) — which tier for the target host; consumer on the migrated pages? · inspect the XHR, add a vendor row · scope of the locale trees · index-driven or editorially curated? · which tags run on the new host; property ids.
- **Already delivered by the capture pipeline:** 8 row(s) — no work.
- **Host-bound on the target:** 5 of 5 probed API paths — the off-origin data work.
- **Martech:** no CMP · 0/2 route(s) enabled by the owner — `stardust/martech-handoff.md`.

## Phases

- **tags** — 31
- **detect** — 12
- **off-origin data** — 5
- **register** — 4
- **locale wave** — 3
- **listings** — 2
- **search** — 2
- **capture** — 1
- **interactive** — 1
