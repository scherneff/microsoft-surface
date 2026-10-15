/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-media. Base: accordion.
 * Source: https://www.microsoft.com/en-us/surface/devices/surface-laptop-ultra
 * Selector (page-templates.json): [id="PANEL 6: RUN LOCAL. RUN FREE"] > section
 *
 * Output (accordion convention, 2 columns, one row per item):
 *   cell 1 = title (BUILD. / CREATE. / ANALYZE.)
 *   cell 2 = body paragraph(s) present in the DOM + desktop video link for the item
 *
 * Items (h2 > button triggers) and stage videos (one per item, in a separate container) are
 * paired by index. Collapsed panels are read whether hidden or not; when the site has not
 * rendered a collapsed panel's body, only the title + video are emitted (no invented text).
 * The decorator consumes only the first video link per row, so only the desktop source is emitted.
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

  // ---- stage videos (one per item) ----
  const videoSrcs = [...element.querySelectorAll('video')].map((v) => (
    v.querySelector('source[src]')?.getAttribute('src') || v.getAttribute('src') || ''
  ));
  const posters = [...element.querySelectorAll('video')].map((v) => v.getAttribute('poster') || '');

  // ---- accordion items ----
  let items = [...element.querySelectorAll('h2 > button, h3 > button')].map((btn) => {
    const heading = btn.parentElement;
    const wrapper = heading.parentElement;
    let panel = null;
    const ctrl = btn.getAttribute('aria-controls');
    if (ctrl) panel = wrapper.querySelector(`[id="${ctrl}"]`) || document.getElementById(ctrl);
    if (!panel) {
      panel = [...wrapper.children].find((c) => c !== heading && c.querySelector('.rich-text-content, p'));
    }
    const titleSpan = btn.querySelector('span');
    return { title: clean((titleSpan || btn).textContent), panel };
  });
  if (!items.length) {
    items = [...element.querySelectorAll('h2, h3')].map((h) => ({
      title: clean(h.textContent),
      panel: h.nextElementSibling,
    }));
  }
  items = items.filter((it) => it.title);

  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = items.map((it, i) => {
    const body = [];
    if (it.panel) {
      const parts = [...it.panel.querySelectorAll('.rich-text-content > p, .rich-text-content > ul, .rich-text-content > ol')];
      (parts.length ? parts : [...it.panel.querySelectorAll('p')]).forEach((el) => {
        if (clean(el.textContent)) body.push(el);
      });
    }
    if (posters[i]) {
      const img = document.createElement('img');
      img.src = posters[i];
      body.push(img);
    }
    if (videoSrcs[i]) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = videoSrcs[i];
      a.textContent = videoSrcs[i];
      p.append(a);
      body.push(p);
    }
    return [it.title, body.length ? body : ''];
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-media', cells });
  element.replaceWith(block);
}
