/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-specs. Base: cards (no images).
 * Source: https://www.microsoft.com/en-us/surface/devices/surface-laptop-ultra
 * Selector (page-templates.json): [id="PARA WITH COLUMNS"] > section > div > ul
 *
 * Output: 1 column, one row per item; cell = H3 title + paragraph(s)
 * (footnote markers kept as superscript links).
 * Iterates block-level <li> items (structure.json: iterationSafe, 3 items).
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

  let items = [...element.querySelectorAll(':scope > li')];
  if (!items.length) items = [...element.querySelectorAll('li')];

  const cells = [];
  items.forEach((li) => {
    const cell = [];
    // Title: styled paragraph (p.heading-6) or real heading
    const titleEl = li.querySelector('h2, h3, h4, p[class*="heading"]');
    if (titleEl && clean(titleEl.textContent)) {
      const h3 = document.createElement('h3');
      h3.textContent = clean(titleEl.textContent);
      cell.push(h3);
    }
    const bodies = [...li.querySelectorAll('.rich-text-content > p, .rich-text-content > ul, .rich-text-content > ol')];
    if (bodies.length) {
      bodies.forEach((el) => { if (clean(el.textContent)) cell.push(el); });
    } else {
      li.querySelectorAll('p').forEach((el) => {
        if (el !== titleEl && clean(el.textContent)) cell.push(el);
      });
    }
    if (cell.length) cells.push([cell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-specs', cells });
  element.replaceWith(block);
}
