/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feature. Base: cards.
 * Source: https://www.microsoft.com/en-us/surface/devices/surface-laptop-ultra
 * Selector (page-templates.json): .ms-gc-section.ms-gc-container
 *
 * Output (cards convention, 2 columns, one row per card):
 *   cell 1 = image
 *   cell 2 = H3 title + paragraph(s)
 *
 * Cards are the block-level column divs (div.flex-col) inside the row wrapper; each holds a
 * <figure> image, an h3.ms-gc-heading and a .ms-gc-body rich text.
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

  // Card columns: direct children of the flex row that contain a heading or figure
  const row = element.querySelector(':scope > div') || element;
  let cards = [...row.children].filter((c) => c.querySelector('h2, h3, h4, figure, img'));
  if (!cards.length) {
    cards = [...element.querySelectorAll('h3')].map((h) => h.closest('div.flex-col') || h.parentElement);
  }

  const cells = [];
  cards.forEach((card) => {
    const imgCell = [];
    const img = card.querySelector('figure img, picture img, img');
    if (img && img.getAttribute('src') && !img.getAttribute('src').startsWith('data:')) {
      imgCell.push(img);
    }

    const textCell = [];
    const heading = card.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading && clean(heading.textContent)) {
      const h3 = document.createElement('h3');
      h3.textContent = clean(heading.textContent);
      textCell.push(h3);
    }
    const parts = [...card.querySelectorAll('.rich-text-content > p, .rich-text-content > ul, .rich-text-content > ol')];
    (parts.length ? parts : [...card.querySelectorAll('p')]).forEach((el) => {
      if (clean(el.textContent)) textCell.push(el);
    });
    card.querySelectorAll('a[href]').forEach((a) => {
      if (!a.closest('.rich-text-content') && clean(a.textContent)) {
        const p = document.createElement('p');
        p.append(a);
        textCell.push(p);
      }
    });

    if (!imgCell.length && !textCell.length) return;
    cells.push([imgCell.length ? imgCell : '', textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
