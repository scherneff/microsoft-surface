# C-deliver — common brief for every delivery subagent

Project root: /workspace/3bab0b60 (an AEM Edge Delivery boilerplate repo; read AGENTS.md there first).
Site: same-design (replica) migration of www.microsoft.com, hands-off. Design is kept near pixel-perfect.

## Target
- DA org `aemcoder`, repo/site `3bab0b60`, branch `main`.
- Preview origin `https://main--3bab0b60--aemcoder.aem.page`, live `https://main--3bab0b60--aemcoder.aem.live`.
- Code ships by `git push origin main` (Code Sync; force a rebuild with
  `POST https://admin.hlx.page/code/aemcoder/3bab0b60/main/*` when an edited block 404s). Before pushing:
  `git pull --rebase -q origin main` (other agents push too), commit only your own files.
- Content: DA Source API. The token lives in the file named by `$ADOBE_IMS_TOKEN_FILE`. Pass it ONLY as
  `--token-file "$ADOBE_IMS_TOKEN_FILE"` to the shipped scripts, or `Authorization: Bearer $(cat "$ADOBE_IMS_TOKEN_FILE")`
  inline in a curl. Never print it, never copy it into any file, brief or log. Never read any `.env`.
- Publish decision is made: PUBLISH. Pages and chrome documents go live (deploy-batch.mjs without
  `--no-publish`).

## The rules (contract card — read the cited sections, never whole sibling SKILL.md files)
- Contract card: `/home/node/adobe-skills/plugins/stardust/skills/replica/reference/handoff-contract.md`
  § 2 (Deploy — per page: EW1–EW10 editability, decode tiers, DA media protocol, DA deploy protocol, lint)
  and § 3 row C (C-deliver) + § 4 (script usage). Read sections with
  `node stardust/scripts/replica/section.mjs <doc> '<heading regex>'`.
- Deploy skill depth when needed: `/home/node/adobe-skills/plugins/stardust/skills/deploy/SKILL.md` — by section only.
- Scripts: run the project copies under `stardust/scripts/{deploy,rollout,replica,diff,migrate,stardust}/`,
  never plugin paths, never write into project-root `scripts/` except as the foundation allows.
- Reading discipline: JSON via `node stardust/scripts/replica/json-query.mjs`, HTML via `html-slice.mjs`,
  CSS via `css-rules.mjs`; instrument output via `run-bg.mjs wait` / `run-bg.mjs log <job> --grep <re>`, never cat.
  Images: one crop per fact.
- Every long instrument (gate.sh, gate-all.mjs, deploy-batch.mjs, Playwright captures) goes through
  `node stardust/scripts/replica/run-bg.mjs start --name <n> -- <cmd…>` and `run-bg.mjs wait` is your NEXT
  call; no tool call over 4 minutes; never `sleep`.
- Machine is small: at most 2 headless Chromium processes from YOU at a time (another agent may run one).
  Never kill processes by name/pattern (no pkill/killall); stop only PIDs you started.
- Lint: the boilerplate's `npm run lint` (ESLint airbnb-base + Stylelint standard) must pass on your files.
  Lines ≤ 100 chars, kebab-case class names and custom properties, one statement per line.
- Content is VERBATIM from `stardust/current/pages/<slug>.json` / the migrated HTML. No rewording, no invented copy.
- Content files live under `content/<path>.html` (DA body-fragment HTML: `<body><header></header><main>…</main><footer></footer></body>`,
  blocks as `<div class="blockname">` rows/cells, a `metadata` block). Chrome docs: `content/nav.html`,
  `content/footer.html` (+ variants) each with a metadata row `Robots | noindex`.
- Images: editorial images upload via `da-media-upload.mjs --token-file "$ADOBE_IMS_TOKEN_FILE"` from
  `stardust/current/assets/media/` (or the migrated asset files) and are authored as `content.da.live` URLs; decorative
  imagery is CSS-only (code origin). Video/PDF never on content.da.live — serve from code origin.
- Fonts: Segoe UI is licensed — reference it from Microsoft's own CDN as the prototypes do, never rehost.
- Gates on the PUBLISHED origin only (after PUT → preview): `gate-all.mjs --only <slug> --eds-host main--3bab0b60--aemcoder.aem.page`
  (and `--width 360`); bar: pixel ≤ 10 %, |Δh| ≤ 5 %, clipped 0, MISSING+HIDDEN 0. Header/footer bands via crop-compare,
  chrome via chrome-parity. No pixel judgement on a local harness.
- Foundation freeze: after the foundation unit, `styles/ fonts/ head.html scripts/ blocks/header/ blocks/footer/` are
  FROZEN. A needed foundation change = one appended line in `stardust/rollout/foundation-requests.md`
  (`- <unit> | <what> | <evidence> | <templates>`) plus a scoped override in your OWN block CSS. Run
  `node stardust/scripts/replica/foundation-freeze.mjs check` before you report.
- Shared ledgers (coverage, rollout.json, media ledger, deploy ledger) are written only by their scripts
  (`update-coverage.mjs`, `da-media-upload.mjs`, `deploy-batch.mjs`), never by hand.
- One-shot helpers go under `stardust/.work/rollout/probes/`. Record your block decode tiers in
  `stardust/eds-conversion-log.md` (append a short `### <unit>` section).
- Do NOT edit `stardust/rollout/progress.json`, `stardust/status.jsonl`, `stardust/state.json`,
  `tools/replica/*` or `stardust/.labs/*` — the coordinator owns them.
- Report back ONE verdict line (format given in your brief) plus at most 10 lines of notes (files, residuals).
