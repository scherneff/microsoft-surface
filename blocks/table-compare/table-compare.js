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

/** "Violet, Platinum, Black" -> swatch list (first finish ringed: the one pictured) */
function buildSwatches(cell) {
  const names = cell.textContent.split(/,|\band\b/).map((n) => n.trim()).filter(Boolean);
  if (!names.length || cell.querySelector('a, img, picture')
    || !names.every((n) => SWATCHES[n.toLowerCase()])) return false;
  const list = document.createElement('ul');
  list.className = 'table-compare-swatches';
  names.forEach((n, i) => {
    const item = document.createElement('li');
    item.className = 'table-compare-swatch';
    if (i === 0) item.classList.add('selected');
    item.style.setProperty('--table-compare-swatch', SWATCHES[n.toLowerCase()]);
    item.title = n;
    const label = document.createElement('span');
    label.className = 'table-compare-swatch-name';
    label.textContent = n;
    item.append(label);
    list.append(item);
  });
  cell.replaceChildren(list);
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
      [...tr.children].slice(1).forEach(buildSwatches);
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
