# Martech hand-off

Everything below is scaffolded **off**. To ship it, set `enabled: true` on `consent.cmp` and on each route in `stardust/martech-contract.json`, then re-run `deploy/scripts/martech-scaffold.mjs` and `dynamics/scripts/dynamics-check.mjs` to confirm the enabled tags load. Enabled tags load on `www.microsoft.com`, `explore.microsoft.com`, `support.microsoft.com` only; preview with `?martech=on` (add `&consent=accept` to grant every category).

## Consent

- **CMP:** none detected
- **Model `owner-decision`:** no evidence of consent gating inside the tag manager. Keep the source behaviour (route `category` null), or set a route `category` to a consent group id to load that tag manager only once the group is granted.
- **Categories:** no CMP configuration read — run `spec-martech.mjs` first, or decide categories with the owner.

## Routes

| id | vendor | src | CMP groups listing its host | enabled |
|---|---|---|---|---|
| adobe-launch | Adobe Launch | `https://assets.adobedtm.com/5ef092d1efb5/4c272e8cc694/launch-EN7506e353034849faa4a18bc4c20e727c.min.js` | — | false |
| google-tag-manager | Google Tag Manager | `https://www.googletagmanager.com/gtag/js?id=DC-572608` | — | false |

Also seen, not routed (loaded by the tag manager or inline on the source — confirm each still fires): analytics: session replay · marketing: ad / retargeting pixel.

## Rewrite before go-live

These read the old URLs or DOM and will not match the migrated pages:
- data element `IsAEM` — selectors `.aem-Grid`
- data element `skipCCPACheck` — selectors `#primaryArea[data-m]`
- data element `CMS` — selectors `#primaryArea[data-m]`, `meta[name=`
- data element `JSLL RedTiger` — selectors `#primaryArea[data-m]`

## Data layer

The source pages expose `dataLayer`; keep the same global names.
Rules in Google Tag Manager were not parsed. Read each library listed in `martech/tags.json` and record its rules and data elements in the contract's `tagNotes`, keyed by tag manager, each citing where it was read (`from`); until then their triggers and events come from the tagging plan.
Ask the owner for the tagging plan (solution design reference): each event, its payload and the interaction that pushes it. With it, add each push in the block that owns the interaction.
