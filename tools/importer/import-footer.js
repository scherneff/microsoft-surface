/* eslint-disable */
/* global WebImporter */

/**
 * Import script for the site footer fragment (content/footer.plain.html).
 * Source: Microsoft UHF footer (#uhf-footer) on any microsoft.com/en-us/surface page.
 *
 * Output: two top-level sections (separated by <hr>), flat + semantic:
 *   1. Link columns: one bold title paragraph + <ul> of links per column
 *   2. Base strip:   locale link, privacy links (opt-out icon as image),
 *                    legal menu list ending with the copyright text
 */

const FOOTER_CARRIER_ATTR = 'data-excat-uhf-footer';
// inline SVG opt-out icon saved from the source as an image asset
const PRIVACY_ICON_SRC = 'images/privacy-choices.svg';

function text(el) {
  return (el?.textContent || '').replace(/\s+/g, ' ').trim();
}

const HIDDEN_ATTR = 'data-excat-hidden';

function visible(el) {
  return !el.closest(`[${HIDDEN_ATTR}]`);
}

function link(document, a, label) {
  const out = document.createElement('a');
  // the stashed markup has no base URL: resolve against the source page
  out.href = new URL(a.getAttribute('href'), document.location.href).href;
  out.textContent = label ?? text(a);
  return out;
}

function buildColumns(document, footer) {
  const nodes = [];
  footer.querySelectorAll('.uhf-footer-nav-group').forEach((group) => {
    // column title as bold paragraph (headings get auto ids, which plain fragments must not carry);
    // footer.js renders it as a heading
    const h2 = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = text(group.querySelector('.uhf-footer-nav-group-heading'));
    h2.append(strong);
    const ul = document.createElement('ul');
    group.querySelectorAll('.uhf-footer-nav-group-links a').forEach((a) => {
      if (!visible(a)) return;
      const li = document.createElement('li');
      li.append(link(document, a));
      ul.append(li);
    });
    nodes.push(h2, ul);
  });
  return nodes;
}

function buildBase(document, footer) {
  const nodes = [];
  const seen = new Set();
  footer.querySelectorAll('.uhf-footer-legal-links a').forEach((a) => {
    if (!visible(a)) return;
    // the UHF renders some legal links twice (responsive variants): keep one per href + label
    const key = `${a.getAttribute('href')}|${text(a)}`;
    if (seen.has(key)) return;
    seen.add(key);
    const p = document.createElement('p');
    const svg = a.querySelector('svg');
    if (svg) {
      // label without the SVG <title> text
      const label = text(a.querySelector('span')) || text(a).replace(text(svg.querySelector('title')), '').trim();
      const out = link(document, a, '');
      const img = document.createElement('img');
      img.src = PRIVACY_ICON_SRC;
      img.alt = text(svg.querySelector('title'));
      out.append(img, document.createTextNode(` ${label}`));
      p.append(out);
    } else {
      p.append(link(document, a));
    }
    nodes.push(p);
  });
  const ul = document.createElement('ul');
  footer.querySelectorAll('uhf-footer-menu li, .uhf-footer-menu li').forEach((li) => {
    if (!visible(li)) return;
    const item = document.createElement('li');
    const a = li.querySelector('a');
    if (a) item.append(link(document, a));
    else item.textContent = text(li);
    if (text(item)) ul.append(item);
  });
  nodes.push(ul);
  return nodes;
}

export default {
  /** stash the rendered UHF footer before the importer's cleanup drops <footer> */
  onLoad: async ({ document }) => {
    const footer = document.querySelector('#uhf-footer') || document.querySelector('footer');
    if (!footer) return;
    // mark entries the source does not display (hidden responsive copies, consent-only links)
    footer.querySelectorAll('a, li').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) el.setAttribute(HIDDEN_ATTR, '');
    });
    document.body.setAttribute(FOOTER_CARRIER_ATTR, footer.outerHTML);
  },

  transform: ({ document }) => {
    const tpl = document.createElement('template');
    tpl.innerHTML = document.body.getAttribute(FOOTER_CARRIER_ATTR) || '';
    document.body.removeAttribute(FOOTER_CARRIER_ATTR);
    const footer = tpl.content.querySelector('footer') || tpl.content.firstElementChild;
    const main = document.createElement('div');
    buildColumns(document, footer).forEach((n) => main.append(n));
    main.append(document.createElement('hr'));
    buildBase(document, footer).forEach((n) => main.append(n));
    return [{ element: main, path: '/footer', report: { title: 'footer' } }];
  },
};
