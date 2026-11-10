# Dynamic features plan — www.microsoft.com replica

| phase | deliverable | authoring contract | verification | owner decision | effort |
|---|---|---|---|---|---|
| interactive (Phase 3/4 + C0) | header menus, mobile drawer, search box (row 1, 2); carousels, tabs, read-more toggles (row 4) | header/footer as nav/footer documents; carousels/tabs as blocks with authored rows | header contract chrome-compare exit 0; motion-observe/motion-compare per archetype | none | M |
| search (rollout D2) | search results widget over the migrated corpus (query index) | widget, no authored rows | search-query parity (count + titles over migrated corpus) | none | S |
| listings | Surface story grid as authored cards | card rows | content-diff | none | S |
| tags (before deploy) | scripts/martech.js scaffolded from martech-contract.json, everything disabled | none | dynamics-check martech: `/` requests no route host | enable routes | S |
| off-origin data | price/telemetry/uhf APIs — interim static snapshot | none | static page renders | rows 7–9 | — |
| locale wave | en-us only; picker links to source | footer link | link check | locale scope | — |
