/* eslint-disable */
/* global WebImporter */

/**
 * Surface product pages: the "See more <product> specs" button opens a full-screen dialog of
 * tech specs. The import's prepare step (prepare/surface-expand.js) leaves a hidden copy of that
 * dialog ([data-import-specs]: heading, intro, <dl>) next to the button.
 *
 * beforeTransform:
 *   - builds a separate document for the dialog at <page folder>/modals/<page>-specs
 *     (heading + intro + a `table-compare (specs)` block, one row per <dt>/<dd>) and adds it to
 *     payload.params.fragments, so it is imported alongside the page;
 *   - replaces the button with a bold link to that document (the site opens /modals/ links in a
 *     dialog);
 *   - removes the hidden copy.
 * Does nothing on pages without a captured dialog.
 */

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

/** Copy rich text; footnote refs <sup><a>n</a></sup> become <a><sup>n</sup></a>; attributes dropped. */
function richText(root, document) {
  const clone = root.cloneNode(true);
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
  clone.querySelectorAll('button, svg, img, script, style').forEach((el) => el.remove());
  [clone, ...clone.querySelectorAll('*')].forEach((el) => {
    [...el.attributes].forEach((attr) => { if (attr.name !== 'href') el.removeAttribute(attr.name); });
  });
  const blocks = [...clone.querySelectorAll('p, ul, ol')]
    .filter((el) => !(el.parentElement && el.parentElement.closest('p, ul, ol')));
  if (blocks.length) return blocks.filter((el) => clean(el.textContent));
  const p = document.createElement('p');
  p.append(...clone.childNodes);
  return clean(p.textContent) ? [p] : [];
}

function modalPath(originalURL) {
  try {
    const { pathname } = new URL(originalURL);
    const parts = pathname.replace(/\/$/, '').replace(/\.html?$/, '').split('/');
    const slug = parts.pop() || 'index';
    return `${parts.join('/')}/modals/${slug}-specs`;
  } catch (e) {
    return null;
  }
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;
  const { document } = payload;
  const params = payload.params || {};
  const copy = element.querySelector('[data-import-specs]');
  if (!copy) return;
  const button = element.querySelector('[data-import-specs-trigger]');
  const path = modalPath(params.originalURL);
  const dl = copy.querySelector('dl');

  if (path && dl && Array.isArray(params.fragments)) {
    const doc = document.createElement('div');
    const heading = copy.querySelector('h1, h2, h3, h4');
    if (heading) {
      const h2 = document.createElement('h2');
      h2.textContent = clean(heading.textContent);
      doc.append(h2);
    }
    const intro = copy.querySelector(':scope > p');
    if (intro) doc.append(...richText(intro, document));

    const cells = [];
    [...dl.children].forEach((el) => {
      if (el.tagName === 'DT') cells.push([clean(el.textContent), '']);
      else if (el.tagName === 'DD' && cells.length) cells[cells.length - 1][1] = richText(el, document);
    });
    if (cells.length) {
      doc.append(WebImporter.Blocks.createBlock(document, { name: 'table-compare (specs)', cells }));
    }
    params.fragments.push({ element: doc, path });

    if (button) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      const a = document.createElement('a');
      a.href = path;
      a.textContent = clean(button.textContent);
      strong.append(a);
      p.append(strong);
      button.replaceWith(p);
    }
  }
  copy.remove();
}
