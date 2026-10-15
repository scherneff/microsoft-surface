# Migration Plan: Surface Laptop Ultra Page

> **Waiting on Execute mode:** You've asked me to start, but Plan mode is still on, and in Plan mode I can only read and plan. I can't scrape the page, create blocks or import content. Switch to **Execute mode** and I'll start on the first checklist item right away and work through the rest in order.

## Overview
This plan moves the Microsoft Surface Laptop Ultra product page (`https://www.microsoft.com/en-us/surface/devices/surface-laptop-ultra`) to AEM Edge Delivery Services as a standard content page. The project is set up for Universal Editor authoring: it has component definitions, models and filters. It already includes a set of starter blocks: accordion, cards, carousel, columns, embed, footer, form, fragment, header, hero, modal, quote, search, table, tabs and video. Per your choice, the page will be treated as a marketing page, not a commerce product page.

## Approach
1. **Analyze the page:** Scrape the page, which may be bot-protected and need the fallback scraper. Then capture screenshots and cleaned HTML, find the sections, and decide which parts are default content and which are blocks.
2. **Map blocks:** Match each content pattern to the existing blocks where they fit. Name new block variants only where the existing blocks can't represent the content. Likely areas include the product hero, feature highlights, spec comparisons, media and video sections, and CTA banners.
3. **Build the blocks:** Create or extend the block code and their Universal Editor models for any new variants.
4. **Build the import tooling:** Generate a block parser for each variant, plus page transformers that clean up the page, split it into sections and handle Microsoft's image delivery.
5. **Import the content:** Bundle the import script and run it to produce the page content.
6. **Check the preview:** Confirm the page renders correctly and compare it against the original.
7. **Style the page:** Apply the site's global design (fonts, colors, spacing) and the block-level styling.
8. **Validate:** Run a visual critique against the original and fix any differences.

## Assumptions
- **Out of scope by default:** Header/navigation and footer are global elements and are migrated separately. I can add them on request.
- **Not migrated:** Dynamic or regional features (pricing widgets, configurators, live chat) will be shown as static content or links.
- **Assets:** Images will be downloaded and referenced from the imported content.
- **No add-ons needed:** You chose a standard migration without the Commerce add-on. The source is a live web page rather than a Figma design, and it has no forms to convert, so the Figma and Forms add-ons don't apply.

## Checklist
- [ ] Scrape and analyze the source page: sections, content sequences and authoring decisions
- [ ] Review the existing block inventory and map page content to existing blocks or new variants
- [ ] Record block mappings (DOM selectors) in the page template
- [ ] Generate or extend blocks (JS, CSS, Universal Editor models) for any new variants
- [ ] Generate block parsers for each variant
- [ ] Generate page transformers (cleanup, sections, image handling)
- [ ] Bundle the import script and run the content import for the page
- [ ] Preview the imported page and verify that blocks render without errors
- [ ] Migrate the global design (typography, colors, spacing) and style each block
- [ ] Run a visual critique against the original page and fix differences
- [ ] Summarize results and suggest next steps (header/footer migration, more Surface device pages)

## Execution Notes
- **Mode:** The work needs Execute mode. Once you switch, I'll go through the checklist in order without stopping between steps unless I need a decision from you.
- **Order:** Steps run in sequence, because each step's output feeds the next one (analysis → mappings → blocks → parsers and transformers → import → styling → validation).
- **Check-ins:** I'll only stop to ask if something is unclear, such as which block to use for an unusual section or what to do if the page blocks scraping.
