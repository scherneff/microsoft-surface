# Surface Laptop page migration plan

**Status:** Ready to run, but nothing has started yet. Chat is still in Plan mode, which only allows planning. Switch to Execute mode and I'll work through the checklist from the first item.

**Source page:** https://www.microsoft.com/en-us/surface/devices/surface-laptop
**Target page path:** `/en-us/surface/devices/surface-laptop` (the source URL path is kept)
**Goal:** Import the page into AEM using the blocks this project already has. A new block or variant is only created for a pattern no existing block can cover.

## What already exists

- **Surface product blocks.** These were built for the Surface Laptop Ultra page and fit this kind of product page:
  - `hero-product`
  - `carousel-scroll`
  - `tabs-media`
  - `cards-specs`
  - `cards-bento`
  - `accordion-media`
  - `cards-feature`
  - `cards-product`
  - `accordion-faq`
- **A proven section order.** The Surface Laptop Ultra page runs: hero, scroll story, media tabs with specs, bento grid, use-case accordion, centered story, feature cards, product compare, CTA band, FAQ, footnotes.
- **The Surface design.** It covers the dark theme, Surface fonts, pill buttons and the section styles `dark`, `light`, `centered`, `cta` and `footnotes`. It switches on by itself when the page starts with a `hero-product` block, so no design work should be needed.
- **The Surface navigation.** It already exists and already links to this page.
- **Other blocks to fall back on:** `feature-band (surface)`, `highlight`, `text-cards`, `columns`, `ds-anchor-nav`, `cards`.
- **What's missing:** there are no import scripts yet (no page template, block parsers, cleanup or section rules, or import script). They have to be built for this page. The Surface Laptop page is also not in the site catalog yet.

## Approach

1. **Analyze the page.** Record its sections, the content in each one and which block each part could become, along with screenshots and cleaned-up HTML.
2. **Match each part to an existing block first.** I check the 9 Surface blocks above, then the general blocks. An existing block or variant is reused when it is at least 80% similar. If nothing fits, I'll stop and ask before creating a new variant or block.
3. **Set up a reusable `surface-product` page template.** It maps each part of the source page to its block and gives each section its style (`dark`, `light`, `centered`, `cta`, `footnotes`). Other Surface device pages, including Ultra, can use it later.
4. **Build the import scripts:**
   - One parser per block variant the page uses
   - A cleanup step that removes cookie banners, tracking pixels, the site header and footer, and the source's skip links
   - A section step that adds the section breaks and section styles
5. **Bundle and run the import script** for this one URL. It sets the page metadata: title, description, image, and `nav` pointing to the Surface navigation.
6. **Check the result.** Confirm in the preview that every block renders, compare it side by side with the source page, and fix the import scripts where the two differ.
7. **Keep any styling fixes small** and limited to the reused blocks, so other pages (including Surface Laptop Ultra) don't change.

## Out of scope

- Nothing goes to Document Authoring, and nothing is previewed or published on Edge Delivery unless you ask for it separately.
- The header and footer aren't migrated. The page uses the existing Surface navigation and site footer.
- The Surface Laptop Ultra page has leftover test text ("INNsadasd", "sdasdasdasadsa", "Chamnges") and one block (`hero-gradient`) that has no code behind it. I'm leaving both alone; I can clean them up separately if you want.

## Checklist

- [ ] Analyze https://www.microsoft.com/en-us/surface/devices/surface-laptop (sections, content, possible blocks, screenshots)
- [ ] Match each part of the page to an existing block or variant, Surface product blocks first
- [ ] Flag anything no existing block covers, and agree with you on a new variant or block before creating it
- [ ] Add the `surface-product` page template with its block and section mappings
- [ ] Add the page and template to the site catalog
- [ ] Write a parser for each reused block variant
- [ ] Write the cleanup step (including removing tracking pixels and cookie banners) and the section step
- [ ] Create and bundle the `surface-product` import script
- [ ] Import the page to `/en-us/surface/devices/surface-laptop`
- [ ] Confirm the page starts with `hero-product` so the Surface design and fonts load
- [ ] Set the page metadata: title, description, image, and `nav` pointing to the Surface navigation
- [ ] Check the preview: every block renders, videos and images load, no empty cells or console errors
- [ ] Compare the preview with the source page and fix any differences in the import scripts
- [ ] Check the Surface Laptop Ultra page still looks right if any shared block code or styling changed
- [ ] Report which blocks were reused, any new ones, and confirm the changes are local only (not in Document Authoring, preview or live)
