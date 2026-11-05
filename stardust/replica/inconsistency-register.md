# Inconsistency register — www.microsoft.com replica

One applied entry (R-03, semantic only); otherwise a pure replica. Everything not listed here is frozen; any design
delta found by the gate is a defect, not an improvement.

## Deferred observations (handover list — change nothing in this run)

## R-01 — Content max-width differs between platforms

- **Evidence:** cap-probe (DESIGN.json extensions.breakpoints.capRegister): contentMaxWidth 1600 (about), 1624 (surface), 1520 (bing / explore.microsoft.com), 990 (support.microsoft.com), shell 1320 on one archetype.
- **Finding:** the three source platforms (www foxtrot, explore, support) cap their content at different widths.
- **Minimal change:** none in this run — each archetype keeps its own measured cap.
- **Status:** deferred
- **Where:** all page types

## R-02 — Single-section module caps

- **Evidence:** cap-probe capRegister: 1920px on about #highlight picture; 768px on home store-text-block; 503px on home announcement paragraph.
- **Finding:** one-off caps on single modules (intent or mistake undecided).
- **Minimal change:** none — replicated as measured.
- **Status:** deferred
- **Where:** about (highlight), index (footer store block, announcement)

## R-03 — Surface listing page has no h1

- **Evidence:** captured headings of /en-us/surface/do-more-with-surface start at h2 ("Do more with Surface", 20 headings, none h1); rollout verify: "page should render exactly one <h1>, found 0".
- **Finding:** the page has no top-level heading (SEO and screen-reader landmark gap).
- **Minimal change:** the page title heading is authored as h1 instead of h2; the article-listing block styles it by class (.article-listing-title sets size, weight, line-height, margin), so the rendered look is unchanged.
- **Status:** applied (rollout E, 2026-11-04)
- **Where:** en-us-surface-do-more-with-surface
