import { createOptimizedPicture } from '../../scripts/aem.js';

const hasText = (el) => !!el.textContent.trim();

/** a paragraph whose only content is one or more links */
function isLinkOnly(el) {
  const links = [...el.querySelectorAll('a')];
  if (!links.length) return false;
  const squash = (s) => s.replace(/\s+/g, '');
  return squash(el.textContent) === squash(links.map((a) => a.textContent).join(''));
}

/**
 * Re-optimizes same-origin (media bus) images; external URLs keep their picture.
 * Never optimizes SVGs.
 */
function optimize(picture) {
  const img = picture.querySelector('img');
  if (!img) return;
  const url = new URL(img.src, window.location.href);
  const sameOrigin = url.origin === window.location.origin;
  const isSvg = url.pathname.toLowerCase().endsWith('.svg');
  if (sameOrigin && !isSvg) {
    picture.replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '500' }]));
  } else {
    img.loading = 'lazy';
    img.decoding = 'async';
  }
}

/** wraps bare text in a paragraph so every cell holds block-level children */
function cellContent(cell) {
  const nodes = [...cell.childNodes].filter((n) => n.nodeType === 1 || n.textContent.trim());
  if (nodes.length && nodes.every((n) => n.nodeType === 3 || !/^(P|DIV|H[1-6]|UL|OL|PICTURE)$/.test(n.tagName))) {
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    return [p];
  }
  return nodes;
}

/** the first row is the product header when it carries images or links (footnotes excluded) */
function isHeaderRow(row) {
  return !!row.querySelector('picture, img')
    || [...row.querySelectorAll('a[href]')].some((a) => !a.closest('sup'));
}

/** splits a product header cell into its image, name and price/Buy parts */
function parseProduct(cell) {
  const image = document.createElement('div');
  image.className = 'table-compare-product-image';
  const details = [];
  const actions = document.createElement('div');
  actions.className = 'table-compare-product-actions';

  cellContent(cell).forEach((el) => {
    if (el.nodeType !== 1) return;
    const picture = el.tagName === 'PICTURE' ? el : el.querySelector('picture');
    if (picture && !hasText(el)) {
      image.append(picture);
    } else if (isLinkOnly(el)) {
      el.querySelectorAll('a').forEach((a) => {
        // unformatted links still render as the primary pill
        if (!a.classList.contains('secondary')) a.classList.add('button', 'primary');
        actions.append(a);
      });
    } else if (hasText(el)) {
      details.push(el);
    }
  });

  const [name, ...prices] = details;
  name?.classList.add('table-compare-product-name');
  prices.forEach((el) => el.classList.add('table-compare-product-price'));
  const info = [...prices];
  if (actions.childElementCount) info.push(actions);
  return {
    image: image.childElementCount ? image : null,
    name: name || null,
    info,
  };
}

/** swatch colours of the Surface finishes; names a cell lists that are not here stay text */
const SWATCHES = {
  black: '#515356',
  dune: '#d3a68c',
  jade: '#9baa8f',
  platinum: '#e2e4e4',
  violet: '#a19dc4',
};

const COLOUR_LINE = /^(.+?)(?:\s+(#[0-9a-f]{3,8}))?$/i;

/** a fresh, display-ready copy of a colour photo (media bus images are re-optimized) */
function colourPicture(picture) {
  const img = picture.querySelector('img');
  const url = new URL(img.src, window.location.href);
  if (url.origin === window.location.origin && !url.pathname.toLowerCase().endsWith('.svg')) {
    return createOptimizedPicture(img.src, img.alt, false, [{ width: '500' }]);
  }
  const copy = picture.cloneNode(true);
  copy.querySelector('img').decoding = 'async';
  return copy;
}

/**
 * Colors cell -> swatch buttons. Two authoring forms:
 *   "Violet, Platinum, Black" (names only), or one line per colour, "Violet #a19dc4", each
 *   optionally preceded by a photo of the product in that colour. With photos, a swatch swaps
 *   the product photo in the header (fading in, like the source).
 * The first colour is selected (the one pictured). Unknown names without a code stay text.
 */
function buildSwatches(cell, imageCell, productName) {
  const entries = [];
  let pendingPicture = null;
  cellContent(cell).forEach((el) => {
    if (el.nodeType !== 1) return;
    const picture = el.tagName === 'PICTURE' ? el : el.querySelector('picture');
    if (picture && !hasText(el)) {
      pendingPicture = picture;
      return;
    }
    const lines = el.textContent.split(/,|\band\b/).map((n) => n.trim()).filter(Boolean);
    lines.forEach((line, i) => {
      const [, name, code] = line.match(COLOUR_LINE);
      entries.push({
        name,
        color: code || SWATCHES[name.toLowerCase()],
        picture: i === 0 ? pendingPicture : null,
      });
    });
    pendingPicture = null;
  });
  if (!entries.length || cell.querySelector('a') || entries.some((e) => !e.color)) return false;

  const group = document.createElement('div');
  group.className = 'table-compare-swatches';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', productName ? `${productName} colours` : 'Colours');
  const buttons = entries.map(({ name, color }, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'table-compare-swatch';
    button.style.setProperty('--table-compare-swatch', color);
    button.title = name;
    button.setAttribute('aria-label', name);
    button.setAttribute('aria-pressed', i === 0);
    if (i === 0) button.classList.add('selected');
    group.append(button);
    return button;
  });

  const select = (index) => {
    buttons.forEach((b, i) => {
      b.setAttribute('aria-pressed', i === index);
      b.classList.toggle('selected', i === index);
    });
    const { picture } = entries[index];
    const box = imageCell?.querySelector('.table-compare-product-image');
    if (!picture || !box) return;
    const next = colourPicture(picture);
    const img = next.querySelector('img');
    img.classList.add('table-compare-fade');
    // two frames: the hidden state must render once, or a cached photo skips the fade
    const reveal = () => requestAnimationFrame(() => requestAnimationFrame(() => img.classList.add('is-loaded')));
    if (img.complete && img.naturalWidth) reveal();
    else {
      img.addEventListener('load', reveal, { once: true });
      img.addEventListener('error', reveal, { once: true });
    }
    box.replaceChildren(next);
  };
  buttons.forEach((b, i) => b.addEventListener('click', () => {
    if (b.getAttribute('aria-pressed') !== 'true') select(i);
  }));

  cell.replaceChildren(group);
  return true;
}

function buildCell(tag, cell) {
  const el = document.createElement(tag);
  if (cell) el.append(...cellContent(cell));
  return el;
}

export default function decorate(block) {
  const rows = [...block.children].filter((row) => hasText(row) || row.querySelector('picture, img'));
  if (!rows.length) return;

  // every row is padded to the widest one so columns stay aligned when authors omit cells
  const columns = Math.max(...rows.map((row) => row.children.length));

  const table = document.createElement('table');
  const headerSource = isHeaderRow(rows[0]) ? rows.shift() : null;

  if (headerSource) {
    // one header row per part (image / name / price + Buy), like the source, so each part lines up
    // across products however long the names are
    const cells = [...headerSource.children];
    const products = cells.slice(1, columns).map((cell) => (cell ? parseProduct(cell) : {}));
    while (products.length < columns - 1) products.push({});
    const thead = document.createElement('thead');
    [
      ['image', 'table-compare-images'],
      ['name', 'table-compare-names'],
      ['info', 'table-compare-info'],
    ].forEach(([part, className]) => {
      if (!products.some((p) => (Array.isArray(p[part]) ? p[part].length : p[part]))) return;
      const tr = document.createElement('tr');
      tr.className = className;
      const corner = buildCell('td', thead.childElementCount ? null : cells[0]);
      corner.className = 'table-compare-corner';
      tr.append(corner);
      products.forEach((p) => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.className = 'table-compare-product';
        const content = p[part];
        if (Array.isArray(content)) th.append(...content);
        else if (content) th.append(content);
        tr.append(th);
      });
      thead.append(tr);
    });
    table.append(thead);
  }

  const tbody = document.createElement('tbody');
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    const cells = [...row.children];
    for (let i = 0; i < columns; i += 1) {
      const cell = buildCell(i === 0 ? 'th' : 'td', cells[i]);
      if (i === 0) {
        cell.scope = 'row';
        cell.className = 'table-compare-label';
      }
      tr.append(cell);
    }
    if (/^colou?rs?$/i.test(tr.firstElementChild.textContent.trim())) {
      tr.classList.add('table-compare-colors');
      const imageRow = table.querySelector('thead .table-compare-images');
      const nameRow = table.querySelector('thead .table-compare-names');
      [...tr.children].slice(1).forEach((cell, i) => {
        buildSwatches(
          cell,
          imageRow?.children[i + 1],
          nameRow?.children[i + 1]?.textContent.trim(),
        );
      });
    }
    tbody.append(tr);
  });
  table.append(tbody);
  table.style.setProperty('--table-compare-columns', Math.max(columns - 1, 1));

  table.querySelectorAll('picture').forEach(optimize);

  // horizontal scroll on narrow screens; focusable so keyboard users can scroll it
  const scroller = document.createElement('div');
  scroller.className = 'table-compare-scroll';
  scroller.tabIndex = 0;
  scroller.setAttribute('role', 'region');
  const label = block.closest('.section')?.querySelector('h1, h2, h3, h4, h5, h6');
  scroller.setAttribute('aria-label', label ? label.textContent.trim() : 'Product comparison');
  scroller.append(table);

  block.replaceChildren(scroller);
}
