/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-product. Base: cards.
 * Source: https://www.microsoft.com/en-us/surface/devices/surface-laptop-ultra
 * Selector (page-templates.json): [id="#compare"] > section > div.container-wide > div.grid
 *
 * Output (cards convention, 2 columns, one row per product):
 *   cell 1 = product image
 *   cell 2 = H3 title + tagline paragraph + one paragraph per link (Learn more, Buy/Pre-order)
 *
 * Iterates block-level <article> cards (not the anchors - the image overlay <a> is empty and
 * iterating inline anchors is unsafe under html2md sibling merging).
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

  let cards = [...element.querySelectorAll('article')];
  if (!cards.length) cards = [...element.querySelectorAll(':scope > div')];

  const cells = [];
  cards.forEach((card) => {
    // ---- image ----
    const imgCell = [];
    const img = [...card.querySelectorAll('img[src]')].find((i) => !i.getAttribute('src').startsWith('data:'));
    if (img) {
      const out = document.createElement('img');
      out.src = img.getAttribute('src');
      out.alt = img.getAttribute('alt') || '';
      imgCell.push(out);
    }

    // ---- text ----
    const textCell = [];
    const heading = card.querySelector('h1, h2, h3, h4');
    if (heading && clean(heading.textContent)) {
      const h3 = document.createElement('h3');
      h3.textContent = clean(heading.textContent);
      textCell.push(h3);
    }
    card.querySelectorAll('.rich-text-content > p, .rich-text-content > ul').forEach((el) => {
      if (clean(el.textContent)) textCell.push(el);
    });
    // CTA links with text (skip the empty image-overlay anchor); drop decorative svg icons
    card.querySelectorAll('a[href]').forEach((a) => {
      const text = clean(a.textContent);
      if (!text || a.closest('.rich-text-content')) return;
      const p = document.createElement('p');
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = text;
      p.append(link);
      textCell.push(p);
    });

    if (!imgCell.length && !textCell.length) return;
    cells.push([imgCell.length ? imgCell : '', textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}
