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
  // line breaks inside bold text ("<strong>Surface Laptop 13-inch:<br></strong>") are lost on
  // conversion: split the bold run at each break so the breaks sit between bold pieces
  clone.querySelectorAll('strong, b').forEach((bold) => {
    if (!bold.querySelector('br')) return;
    const parts = [];
    let current = document.createElement(bold.tagName.toLowerCase());
    [...bold.childNodes].forEach((node) => {
      if (node.nodeName === 'BR') {
        parts.push(current, document.createElement('br'));
        current = document.createElement(bold.tagName.toLowerCase());
      } else {
        current.append(node);
      }
    });
    parts.push(current);
    bold.replaceWith(...parts.filter((n) => n.nodeName === 'BR' || clean(n.textContent)));
  });
  // indented lines (leading spaces after a break, shown with white-space: pre-wrap on the
  // source) keep their indent as em spaces, about 4 spaces each (plain and non-breaking spaces
  // are collapsed on conversion)
  const walker = document.createTreeWalker(clone, 4);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  texts.forEach((t) => {
    const prev = t.previousSibling;
    if (prev && prev.nodeName === 'BR') {
      t.textContent = t.textContent.replace(/^\s{2,}/, (m) => '\u2003'.repeat(Math.max(1, Math.round(m.replace(/[\r\n]/g, '').length / 4))));
    }
  });
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
