/* eslint-disable */
/* global WebImporter */

/**
 * tabs-media parser (Surface product pages).
 *
 * Block model (mirrors content/en-us/surface/devices/surface-laptop-ultra.plain.html):
 *   one row per tab, 2 cells:
 *     cell 1: tab label
 *     cell 2: <picture> (or poster + video link) followed by optional caption text
 *
 * Only tab panels present in the static DOM are emitted (no fabricated panels).
 * Per panel: the default-colour product image, the "Shown in ..." line and the spec stats.
 * Colour swatch buttons are dropped.
 */

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function absUrl(url, document) {
  if (!url) return '';
  try {
    return new URL(url, document.baseURI || 'https://www.microsoft.com/').href;
  } catch (e) {
    return url;
  }
}

function tabLabel(button) {
  const hidden = button.querySelector('.tw-hidden');
  if (hidden && clean(hidden.textContent)) return clean(hidden.textContent).replace(/-\s+/g, '-');
  const direct = [...button.childNodes]
    .filter((n) => !(n.nodeType === 1 && n.classList.contains('tw-hidden')))
    .map((n) => n.textContent).join('');
  return clean(direct).replace(/-\s+/g, '-');
}

/** Copy inline content; footnote refs <sup><a>n</a></sup> become <a><sup>n</sup></a>. */
function appendInline(target, source, document) {
  const clone = source.cloneNode(true);
  clone.querySelectorAll('sup').forEach((sup) => {
    const a = sup.querySelector('a[href]');
    if (!a) return;
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    const s = document.createElement('sup');
    s.textContent = clean(a.textContent);
    link.append(s);
    sup.replaceWith(link);
  });
  const p = clone.querySelector('p') || clone;
  [...p.childNodes].forEach((n) => {
    if (n.nodeType === 8) return;
    if (n.nodeType === 1) target.append(n);
    else if (clean(n.textContent)) target.append(document.createTextNode(clean(n.textContent)));
  });
}

function buildPanel(panel, document) {
  const content = [];

  // default colour image = first (visible) product image
  const img = [...panel.querySelectorAll('img')]
    .find((im) => !/^data:/.test(im.getAttribute('src') || ''));
  if (img) {
    const picture = document.createElement('picture');
    const newImg = document.createElement('img');
    newImg.src = absUrl(img.getAttribute('src'), document);
    newImg.alt = img.getAttribute('alt') || '';
    picture.append(newImg);
    content.push(picture);
  }

  // "Shown in <colour>" caption
  const shown = [...panel.querySelectorAll('p')]
    .find((p) => /^shown in/i.test(clean(p.textContent)));
  if (shown) {
    const p = document.createElement('p');
    p.textContent = clean(shown.textContent);
    content.push(p);
  }

  // spec stats: label / value / detail
  const items = [...panel.querySelectorAll('ul > li')];
  if (items.length) {
    const ul = document.createElement('ul');
    items.forEach((li) => {
      const label = li.querySelector(':scope > p');
      const value = [...li.querySelectorAll(':scope > div')].find((d) => !d.querySelector('.rich-text-content'));
      const detail = li.querySelector('.rich-text-content');
      const item = document.createElement('li');
      if (label && clean(label.textContent)) {
        const strong = document.createElement('strong');
        strong.textContent = clean(label.textContent);
        item.append(strong);
      }
      if (value && clean(value.textContent)) {
        if (item.childNodes.length) item.append(document.createElement('br'));
        item.append(document.createTextNode(clean(value.textContent)));
      }
      if (detail && clean(detail.textContent)) {
        if (item.childNodes.length) item.append(document.createElement('br'));
        appendInline(item, detail, document);
      }
      if (item.childNodes.length) ul.append(item);
    });
    if (ul.children.length) content.push(ul);
  }
  return content;
}

export default function parse(element, { document }) {
  const buttons = [...element.querySelectorAll('#laptop-tabs button')]
    .filter((b) => tabLabel(b));

  // panels: tabpanel role on the live page, else the direct children of the content container
  let panels = [...element.querySelectorAll('[role="tabpanel"]')];
  if (!panels.length) {
    panels = [...element.querySelectorAll(':scope > .container > div')]
      .filter((d) => d.querySelector('img'));
  }

  const selectedIdx = buttons.findIndex((b) => b.getAttribute('aria-selected') === 'true'
    || b.hasAttribute('data-selected') || b.getAttribute('data-state') === 'active');

  const cells = [];
  panels.forEach((panel, i) => {
    let button = panel.id
      ? buttons.find((b) => b.getAttribute('aria-controls') === panel.id)
      : null;
    if (!button && panels.length === 1 && selectedIdx > -1) button = buttons[selectedIdx];
    if (!button) button = buttons[i];
    const label = button ? tabLabel(button) : `${i + 1}`;
    const content = buildPanel(panel, document);
    if (content.length) cells.push([label, content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-media', cells });
  element.replaceWith(block);
}
