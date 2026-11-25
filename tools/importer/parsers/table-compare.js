/* eslint-disable */
/* global WebImporter */

/**
 * table-compare parser (Surface product pages).
 *
 * Block model (blocks/table-compare/README.md):
 *   header row: (empty) | product cell x N  (picture, <p>name</p>, <p>price</p>, <p><strong><a>Buy</a></strong></p>)
 *   spec rows:  label   | value x N         (Colors row: colour names as text, from swatch titles)
 * The source splits the header into three <thead> rows (images / names / price+buy);
 * they are merged column by column. Divider rows (single empty td) are skipped.
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

/** Copy rich-text paragraphs; footnote refs <sup><a>n</a></sup> become <a><sup>n</sup></a>. */
function copyRichText(root, document) {
  const out = [];
  const sources = [...root.querySelectorAll('p, ul, ol')]
    .filter((el) => !(el.parentElement && el.parentElement.closest('p, ul, ol')));
  (sources.length ? sources : [root]).forEach((src) => {
    const clone = src.cloneNode(true);
    clone.querySelectorAll('sup').forEach((sup) => {
      const a = sup.querySelector('a[href]');
      if (!a) {
        sup.replaceWith(document.createTextNode(sup.textContent));
        return;
      }
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      const s = document.createElement('sup');
      s.textContent = clean(a.textContent);
      link.append(s);
      sup.replaceWith(link);
    });
    clone.querySelectorAll('button, svg, img').forEach((el) => el.remove());
    [clone, ...clone.querySelectorAll('*')].forEach((el) => {
      [...el.attributes].forEach((attr) => { if (attr.name !== 'href') el.removeAttribute(attr.name); });
    });
    [...clone.childNodes].forEach((n) => { if (n.nodeType === 8) n.remove(); });
    if (!clean(clone.textContent)) return;
    if (clone.tagName === 'P' || clone.tagName === 'UL' || clone.tagName === 'OL') {
      out.push(clone);
    } else {
      const p = document.createElement('p');
      p.append(...clone.childNodes);
      out.push(p);
    }
  });
  return out;
}

export default function parse(element, { document }) {
  const table = element.tagName === 'TABLE' ? element : element.querySelector('table');
  const headRows = [...table.querySelectorAll('thead tr')];
  const bodyRows = [...table.querySelectorAll('tbody tr')];

  // ---- product header (merge thead rows per column; column 0 is the label column)
  const columnCount = Math.max(0, ...headRows.map((r) => r.children.length)) - 1;
  const products = [];
  for (let c = 1; c <= columnCount; c += 1) {
    const content = [];
    headRows.forEach((row) => {
      const cell = row.children[c];
      if (!cell) return;
      const img = cell.querySelector('img');
      if (img && !/^data:/.test(img.getAttribute('src') || '')) {
        const picture = document.createElement('picture');
        const newImg = document.createElement('img');
        newImg.src = absUrl(img.getAttribute('src'), document);
        newImg.alt = img.getAttribute('alt') || '';
        picture.append(newImg);
        content.push(picture);
      }
      const name = cell.querySelector('.heading-6, h3, h4');
      if (name && clean(name.textContent)) {
        const p = document.createElement('p');
        p.textContent = clean(name.textContent);
        content.push(p);
      }
      const price = cell.querySelector('.body-sm');
      if (price && clean(price.textContent)) {
        const p = document.createElement('p');
        p.textContent = clean(price.textContent);
        content.push(p);
      }
      cell.querySelectorAll('a[href]').forEach((link) => {
        if (link.closest('sup') || !clean(link.textContent)) return;
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        const a = document.createElement('a');
        a.href = absUrl(link.getAttribute('href'), document);
        a.textContent = clean(link.textContent);
        strong.append(a);
        p.append(strong);
        content.push(p);
      });
    });
    products.push(content.length ? content : '');
  }

  const cells = [];
  if (products.length) cells.push(['', ...products]);

  // ---- spec rows
  bodyRows.forEach((row) => {
    const label = row.querySelector('th');
    if (!label || !clean(label.textContent)) return; // divider rows
    const values = [...row.children].filter((c) => c !== label).map((td) => {
      const swatches = [...td.querySelectorAll('button[title], [title]')]
        .map((b) => clean(b.getAttribute('title'))).filter(Boolean);
      if (swatches.length && !td.querySelector('.rich-text-content')) {
        const p = document.createElement('p');
        p.textContent = swatches.join(', ');
        return [p];
      }
      const rich = td.querySelector('.rich-text-content') || td;
      const content = copyRichText(rich, document);
      return content.length ? content : '';
    });
    while (values.length < columnCount) values.push('');
    cells.push([clean(label.textContent), ...values]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'table-compare', cells });
  element.replaceWith(block);
}
