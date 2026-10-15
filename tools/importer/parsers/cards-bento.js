/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-bento. Base: cards.
 * Source: https://www.microsoft.com/en-us/surface/devices/surface-laptop-ultra
 * Selector (page-templates.json): [id="Feature grid"] > section > div > ul
 *
 * Output (cards convention, 2 columns, one row per tile):
 *   cell 1 = image (or poster image + video link)
 *   cell 2 = paragraph(s)
 *
 * Iterates the block-level <li> tiles (structure.json: iterationSafe, 3 items).
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

  let items = [...element.querySelectorAll(':scope > li')];
  if (!items.length) items = [...element.querySelectorAll('li')];

  const cells = [];
  items.forEach((li) => {
    // ---- media cell ----
    const mediaCell = [];
    const mediaWrap = li.querySelector('.inner-media-fill') || li;
    const img = mediaWrap.querySelector('picture img[src]:not([src^="data:"])')
      || mediaWrap.querySelector('img[src]:not([src^="data:"])');
    const video = mediaWrap.querySelector('video');
    if (img) {
      const out = document.createElement('img');
      out.src = img.getAttribute('src');
      out.alt = img.getAttribute('alt') || '';
      mediaCell.push(out);
    } else if (video && video.getAttribute('poster')) {
      const out = document.createElement('img');
      out.src = video.getAttribute('poster');
      mediaCell.push(out);
    }
    if (video) {
      const src = video.querySelector('source[src]')?.getAttribute('src') || video.getAttribute('src');
      if (src) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = src;
        a.textContent = src;
        p.append(a);
        mediaCell.push(p);
      }
    }

    // ---- text cell ----
    const textCell = [];
    li.querySelectorAll('h2, h3, h4').forEach((h) => {
      if (clean(h.textContent)) textCell.push(h);
    });
    li.querySelectorAll('.rich-text-content > p, .rich-text-content > ul, .rich-text-content > ol').forEach((el) => {
      if (clean(el.textContent)) textCell.push(el);
    });
    if (!li.querySelector('.rich-text-content')) {
      li.querySelectorAll('p').forEach((el) => {
        if (clean(el.textContent)) textCell.push(el);
      });
    }

    if (!mediaCell.length && !textCell.length) return;
    cells.push([mediaCell.length ? mediaCell : '', textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-bento', cells });
  element.replaceWith(block);
}
