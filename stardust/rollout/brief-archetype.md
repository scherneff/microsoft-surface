# C-deliver — archetype + cluster unit brief (per template)

Read `stardust/rollout/brief-common.md` first (binding). The foundation (styles, fonts, header/footer blocks,
chrome documents) is DONE and FROZEN (`stardust/rollout/foundation-freeze.json`); see
`stardust/runtime-contract.json` for how a page selects its chrome (page metadata `nav` / `footer`).
Foundation notes: `stardust/eds-conversion-log.md` § foundation.

## Unit A — archetype (your template's gated archetype)
Inputs: the gated prototype `stardust/prototypes/<slug>-proposed.html` (+ `<slug>.css`/`.js`, `canon.css`/`canon.js`
for www pages), the migrated page `stardust/migrated/<path>/index.html` + `_meta.json` (modules[]), the archetype notes
`stardust/replica/archetype-<slug>.md`, the gate record `stardust/replica/progress.json` → `types.<slug>`
(json-query; its `captureState[].restoreAtDelivery` entries are BEHAVIOURS TO DELIVER — autoplay muted video, carousel
rotation — never a frozen frame), the plan step `stardust/rollout/plan.json` (convert = blocks you create; reuse = blocks
another unit created — reuse by name, never recreate), and the capture `stardust/current/pages/<slug>.json` (+ `.html`).

Chain (contract card § 2 + § 3 row C, in order):
1. `node stardust/scripts/deploy/section-schema.mjs <protoURL> --out stardust/eds-schema/<slug>.json` (serve the
   prototypes dir with `python3 -m http.server <port>` from `stardust/prototypes/` — probe the port with curl first,
   reuse a server already serving that dir; stop only the PID you started).
2. Author `content/<path>.html` (DA body fragment: sections, blocks as `<div class="name">` rows/cells, default content
   for plain headings/text/buttons, `section-metadata` for section styles, a `metadata` block with Title, Description,
   og image, and `nav`/`footer` when the page uses a non-default chrome). Content VERBATIM. Internal links to the 8
   in-scope pages root-relative; every other microsoft.com link absolute.
3. Author blocks `blocks/<name>/<name>.{js,css}` for your `convert` list: template-slotted decode for fixed compositions,
   reconstructive for repeat groups; EW1–EW10 (move authored nodes; never rebuild from textContent). CSS values from the
   gated prototype CSS, scoped to `.<name>`. Widgets with no authored content → `widgets/<path>/<name>`.
4. Editorial images: `da-media-upload.mjs --org aemcoder --repo 3bab0b60 --scope <slug> --dir <dir with the images you
   author> --token-file "$ADOBE_IMS_TOKEN_FILE"`; author the printed content.da.live URLs. Video from code origin.
5. Local structural asserts only: `build-harness.mjs` → `qa-gate.mjs` and `block-roundtrip.mjs <protoURL>
   content/<path>.html --ew` (exit 0). `delivery-lint.mjs`, `media-reconcile.mjs --deploy-host
   main--3bab0b60--aemcoder.aem.live`, `davids-model-lint.mjs`, `localize-links.mjs --source-host www.microsoft.com
   --content content --check`, `sanitise.js content/<path>.html`. `npm run lint` clean on your files.
6. Commit your blocks + content, `git pull --rebase -q origin main && git push -q origin main`; verify a block file
   serves on the preview origin (bounded curl poll).
7. Deploy: write the DA path(s) to `stardust/rollout/units/<unit>.paths`; `deploy-batch.mjs --org aemcoder --repo
   3bab0b60 --branch main --content content --paths stardust/rollout/units/<unit>.paths --ledger
   stardust/deploy/ledger-<unit>.json --log stardust/.work/rollout/<unit>/deploy.log --concurrency 1 --token-file
   "$ADOBE_IMS_TOKEN_FILE"` through run-bg (publishes live). `.plain.html` checks.
8. Published-origin gate row, both widths, through run-bg (`--slots 2`):
   `node stardust/scripts/replica/gate-all.mjs --only <slug> --eds-host main--3bab0b60--aemcoder.aem.page`
   and the same with `--width 360`. Bar: pixel ≤ 10 %, |Δh| ≤ 5 %, clipped 0, MISSING+HIDDEN 0.
   Fix rounds cap 3 (`source-fidelity-gate.md § What a failing row means`: block CSS/JS rides a push, a content fix
   re-PUTs the page with `--force`). Also header/footer band check once (crop-compare on the gate-all captures) and
   chrome-parity live vs preview at 1440.
9. Coverage: `node stardust/scripts/rollout/update-coverage.mjs <slug> --status deployed --url <preview-url>` and
   `node stardust/scripts/rollout/update-coverage.mjs --block <name> --status deployed --eds-name <name>` per block.
   `node stardust/scripts/migrate/migrate.mjs modules <slug> <final block names>` if the names changed.

Report ONE verdict line: `archetype-<slug>: live 1/1, blocks k, gate 1440 x% Δh / 360 y% Δh, clipped c, missing m,
requests r` + ≤ 10 lines (blocks, residuals with cause, foundation requests filed).

## Unit B — cluster (siblings of your template), only when your brief names siblings
After unit A is done: per sibling, build the sibling's rendered HTML by FORKING the archetype structure with the
sibling's own captured content (`stardust/current/pages/<sib>.json` + `.html`; verbatim), write it to
`stardust/.work/migrate/<sib>.html`, then `node stardust/scripts/migrate/migrate.mjs render <sib> --source
<sib>=stardust/.work/migrate/<sib>.html --archetype <sib>=<archetype-slug>`, then author `content/<path>.html` reusing
the archetype's blocks (variance → block VARIANT classes; a genuinely new composition → a new block, EW rules apply),
same chain 2–9 for the siblings (`--only <sib,…>`), `migrate.mjs gate <sib> content-fidelity --evidence "…"`.
Report: `cluster-<template>: pages n/n live, blocks k, gate 1440 x% / 360 y%, requests r` + ≤ 10 lines.

## Learned in earlier units (apply)
- gate-all selects pages with `status: "deployed"` + `liveUrl` in the state file, which you must not edit: run it with
  `--state stardust/.work/rollout/<unit>/state-gate.json` (a copy holding only your pages, status deployed,
  `liveUrl: https://main--3bab0b60--aemcoder.aem.live/<path>`, `deployedPath`). `--eds-host` needs the scheme:
  `--eds-host https://main--3bab0b60--aemcoder.aem.page`.
- unit-geometry caches live measurements per slug WITHOUT the width (`stardust/current/measure/<slug>-units.json`):
  run 1440 and 360 sequentially, moving the cache aside between widths.
- A `<main>` top margin can collapse out on EDS sections — prefer padding.
