---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-11-04T01:46:17Z
  againstInput: https://www.microsoft.com/en-us/surface/do-more-with-surface/
  readArtifacts:
    - stardust/current/PRODUCT.md
    - stardust/current/DESIGN.md
    - stardust/current/DESIGN.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of https://www.microsoft.com (the 10 pages selected in
stardust/.labs/site-plan.json; 8 captured), promoted verbatim (no direct invocation, no creative decisions).

Promoted: current/PRODUCT.md → PRODUCT.md · current/DESIGN.md → DESIGN.md · current/DESIGN.json → DESIGN.json
(at 2026-11-04T01:46:17Z). Provenance: verbatim --prep promotion.

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md (0 applied entries — pure replica;
deferred observations ride along as a handover list).

Fidelity: ia verbatim · design verbatim · content verbatim.

Roster caps: 8 pages (index, about, support, accessibility, ai, bing, corporate-responsibility,
en-us-surface-do-more-with-surface); /earn → redirect to https://earn.microsoft.com/; /dashboard 404 — not migrated.
Gate breakpoints: 1440, 360 (run.json "desktop,mobile").

## Link audit decision (rollout E2, 2026-11-04)

- **Scope extension → repointed to the source (kept absolute):** 220 distinct www.microsoft.com targets linked from the 8 pages and the chrome are outside the fixed page scope of this run (site plan: 10 selected pages). They stay absolute links to www.microsoft.com; none is crawled or authored. Top targets: /en-us/store/b/business, /en-us/copilot, /en-us/education, /en-us/security, /en-us/download, /en-us/windows, /surface, /rewards (full list: `localize-links.mjs --dry-run`).
- **Captured pages under their canonical source URLs → delivered:** /en-us, /en-us/about, /en-us/accessibility, /en-us/ai, /en-us/corporate-responsibility redirect to the delivered pages (redirects sheet); the one in-content link (/en-us/ai on the home page) is root-relative.
- **Other hosts (support.microsoft.com, explore.microsoft.com, bing.com, marketplace, aka.ms, go.microsoft.com):** external, unchanged.
- **Every href GET (stardust/rollout/link-audit.json):** 498 distinct hrefs; internal 14/14 → 200; external 462 → 200, 17 → 403 (Microsoft hosts refuse a non-browser fetch; the same links work in a browser), 2 TLS-chain errors in this environment, 3 → 404 on the source itself (aka.ms/AISkills4Accessibility, a /en/customers story, support.microsoft.com/en-us/security) — carried verbatim, owner list.
