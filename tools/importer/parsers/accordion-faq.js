/* eslint-disable */
/* global WebImporter */

/**
 * accordion-faq parser (Surface product pages).
 *
 * Block model (mirrors content/en-us/surface/devices/surface-laptop-ultra.plain.html):
 *   one row per Q&A, 2 cells:
 *     cell 1: <p>question</p>
 *     cell 2: answer paragraphs / lists (footnote refs as <a href="#footnote-n"><sup>n</sup></a>)
 * The FAQ heading ("Surface Laptop FAQs") is emitted as default content right in front of
 * the block; accordion-faq.js adopts the preceding heading into its header.
 * The Expand all / Collapse all buttons are dropped (the block builds its own).
 */

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function cleanText(el) {
  if (!el) return '';
  const sr = el.querySelector('.sr-only');
  return clean(sr ? sr.textContent : el.textContent);
}

function absUrl(url, document) {
  if (!url) return '';
  if (url.startsWith('#')) return url;
  try {
    return new URL(url, document.baseURI || 'https://www.microsoft.com/').href;
  } catch (e) {
    return url;
  }
}

/** Sanitised copy of a rich-text answer: p / ul / ol with inline markup only. */
function copyAnswer(rich, document) {
  const clone = rich.cloneNode(true);
  clone.querySelectorAll('button, svg, script, style').forEach((el) => el.remove());
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
  clone.querySelectorAll('br').forEach((br) => br.remove());
  // list items: unwrap inner paragraphs
  clone.querySelectorAll('li > p').forEach((p) => {
    const li = p.parentElement;
    if (p.previousSibling && li.childNodes.length > 1) p.before(document.createTextNode(' '));
    p.replaceWith(...p.childNodes);
  });
  // unwrap spans / divs
  clone.querySelectorAll('span, div').forEach((el) => el.replaceWith(...el.childNodes));
  [clone, ...clone.querySelectorAll('*')].forEach((el) => {
    [...el.attributes].forEach((attr) => { if (attr.name !== 'href') el.removeAttribute(attr.name); });
  });
  clone.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', absUrl(a.getAttribute('href'), document)));

  const out = [];
  let loose = null;
  [...clone.childNodes].forEach((n) => {
    if (n.nodeType === 8) return;
    if (n.nodeType === 1 && /^(P|UL|OL|H[1-6]|TABLE)$/.test(n.tagName)) {
      loose = null;
      if (clean(n.textContent)) out.push(n);
      return;
    }
    // loose inline content -> wrap in a paragraph
    if (n.nodeType === 3 && !clean(n.textContent)) return;
    if (!loose) {
      loose = document.createElement('p');
      out.push(loose);
    }
    loose.append(n);
  });
  return out.filter((el) => clean(el.textContent));
}

export default function parse(element, { document }) {
  const accordion = element.querySelector('[id$="-accordion"]') || element;
  const items = [...accordion.querySelectorAll('h3')]
    .filter((h) => h.querySelector('button'))
    .map((h) => h.parentElement);

  const cells = items.map((item) => {
    const question = document.createElement('p');
    const button = item.querySelector('h3 button');
    const label = button.querySelector('span') || button;
    question.textContent = cleanText(label) || cleanText(button);

    const rich = item.querySelector('.rich-text-content');
    const answer = rich ? copyAnswer(rich, document) : [];
    return [question, answer.length ? answer : ''];
  });

  // FAQ heading as default content in front of the block
  const heading = [...element.querySelectorAll('h1, h2, h3')]
    .find((h) => !h.querySelector('button') && !accordion.contains(h));
  if (heading && cleanText(heading)) {
    const h = document.createElement(heading.tagName.toLowerCase());
    h.textContent = cleanText(heading);
    element.before(h);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
