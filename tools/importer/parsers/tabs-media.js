/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-media. Base: tabs.
 * Source: https://www.microsoft.com/en-us/surface/devices/surface-laptop-ultra
 * Selector (page-templates.json): [id="#display"] > section > div > div:nth-child(2)
 *
 * Output (tabs convention, 2 columns, one row per tab):
 *   cell 1 = tab label (Morning / Afternoon / Evening)
 *   cell 2 = poster image + video link
 *
 * Tab buttons (tab list) and tab panels live in separate containers; paired by index.
 * Panels are read whether visible or hidden.
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

  // ---- labels ----
  let tabs = [...element.querySelectorAll('[role="tablist"] [role="tab"]')];
  if (!tabs.length) tabs = [...element.querySelectorAll('button[id^="base-ui"], [role="tab"]')];
  if (!tabs.length) {
    tabs = [...element.querySelectorAll('button')].filter((b) => clean(b.textContent) && !b.querySelector('img'));
  }
  tabs = tabs.filter((t) => clean(t.textContent));
  const labels = tabs.map((t) => clean(t.textContent));

  // ---- panels ----
  // The live page (base-ui tabs) renders ONLY the selected panel; the scraped DOM holds all.
  let panels = [...element.querySelectorAll('[role="tabpanel"]')];
  if (!panels.length) {
    const container = element.querySelector('div.container') || element;
    panels = [...container.querySelectorAll(':scope > div')].filter((d) => d.querySelector('video, picture, img'));
  }

  // Assign each panel to a tab index: aria-labelledby -> tab id, then panel inner id containing
  // the label text (e.g. id="DESKTOP VIDEO - MORNING"), then document order when counts match.
  const panelForTab = new Array(labels.length).fill(null);
  const unassigned = [];
  panels.forEach((panel) => {
    let idx = -1;
    const labelledBy = panel.getAttribute('aria-labelledby');
    if (labelledBy) idx = tabs.findIndex((t) => t.id === labelledBy);
    if (idx < 0) {
      const ids = [panel.id, ...[...panel.querySelectorAll('[id]')].map((n) => n.id)].join(' ').toLowerCase();
      idx = labels.findIndex((l, i) => !panelForTab[i] && ids.includes(l.toLowerCase()));
    }
    if (idx >= 0 && !panelForTab[idx]) panelForTab[idx] = panel;
    else unassigned.push(panel);
  });
  unassigned.forEach((panel) => {
    const free = panelForTab.findIndex((p) => !p);
    if (free >= 0 && panels.length === labels.length) panelForTab[free] = panel;
    else panelForTab.push(panel);
  });

  const contents = panelForTab.map((panel) => {
    if (!panel) return [];
    const cell = [];
    const img = panel.querySelector('picture img[src]:not([src^="data:"])')
      || panel.querySelector('img[src]:not([src^="data:"])');
    const video = panel.querySelector('video');
    if (img) {
      const out = document.createElement('img');
      out.src = img.getAttribute('src');
      out.alt = img.getAttribute('alt') || '';
      cell.push(out);
    } else if (video && video.getAttribute('poster')) {
      const out = document.createElement('img');
      out.src = video.getAttribute('poster');
      cell.push(out);
    }
    if (video) {
      const src = video.querySelector('source[src]')?.getAttribute('src') || video.getAttribute('src');
      if (src) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = src;
        a.textContent = src;
        p.append(a);
        cell.push(p);
      }
    }
    // any panel text (captions) present in the DOM
    panel.querySelectorAll('h2, h3, h4, p').forEach((el) => {
      if (clean(el.textContent) && !el.closest('button')) cell.push(el);
    });
    return cell;
  });

  const count = Math.max(labels.length, contents.length);
  if (!count) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  for (let i = 0; i < count; i += 1) {
    cells.push([labels[i] || '', contents[i] && contents[i].length ? contents[i] : '']);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-media', cells });
  element.replaceWith(block);
}
