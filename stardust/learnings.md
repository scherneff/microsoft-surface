# Learnings — www.microsoft.com replica (2026-11-04)

- **verify.mjs requests folder-index pages with a trailing slash.** Archetypes whose migrated source is `<slug>/index.html` (about, bing, support) were fetched as `/<slug>/` and read as 404 while `/<slug>` served 200. Trailing-slash redirect rows fixed it for verify and visitors alike; the root cause is the coverage row's migratedHtml shape.
- **verify.mjs flags the dynamics widget link (`/widgets/<path>/<name>.html?q=`) as a broken page link.** The project copy skips `/widgets/` (code-bus paths).
- **The origin unit cache (stardust/current/measure/<slug>-units.json) is keyed per slug, not per width.** A 360 gate-all run after a 1440 run reused the 1440 inventory and failed all 66 units; clear the cache between widths.
- **Source JSON-LD carries cleanly as a `json-ld` metadata row** — the pipeline renders it as a head `<script type="application/ld+json">`, which server-side checks (optimize) see.
- **The source's canonical URLs differ from the selected ones** (/about → /en-us/about, / → /en-us): redirect rows for the extract `finalUrl`s let localize-links make in-content links root-relative.
- **helix-query.yaml in the code branch built the index within ~50 s** of re-publishing the pages; no configuration-service write.
