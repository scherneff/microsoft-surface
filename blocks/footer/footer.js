import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Footer — the Microsoft UHF footer in the three chrome variants (www / bing / support),
 * recreated from the gated prototypes. The footer document (page metadata `footer`, default
 * /footer) supplies every heading, label and link; they are MOVED into the variant template.
 * Content model: stardust/runtime-contract.json `chrome.footerDocumentModel`.
 */

const PRIVACY_ICON = '<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 14" height="16" width="43"><title>Your Privacy Choices Opt-Out Icon</title><path d="M7.4 12.8h6.8l3.1-11.6H7.4C4.2 1.2 1.6 3.8 1.6 7s2.6 5.8 5.8 5.8z" fill="#fff" fill-rule="evenodd" clip-rule="evenodd"/><path d="M22.6 0H7.4c-3.9 0-7 3.1-7 7s3.1 7 7 7h15.2c3.9 0 7-3.1 7-7s-3.2-7-7-7zm-21 7c0-3.2 2.6-5.8 5.8-5.8h9.9l-3.1 11.6H7.4c-3.2 0-5.8-2.6-5.8-5.8z" fill="#06f" fill-rule="evenodd" clip-rule="evenodd"/><path d="M24.6 4c.2.2.2.6 0 .8L22.5 7l2.2 2.2c.2.2.2.6 0 .8-.2.2-.6.2-.8 0l-2.2-2.2-2.2 2.2c-.2.2-.6.2-.8 0-.2-.2-.2-.6 0-.8L20.8 7l-2.2-2.2c-.2-.2-.2-.6 0-.8.2-.2.6-.2.8 0l2.2 2.2L23.8 4c.2-.2.6-.2.8 0z" fill="#fff"/><path d="M12.7 4.1c.2.2.3.6.1.8L8.6 9.8c-.1.1-.2.2-.3.2-.2.1-.5.1-.7-.1L5.4 7.7c-.2-.2-.2-.6 0-.8.2-.2.6-.2.8 0L8 8.6l3.8-4.5c.2-.2.6-.2.9 0z" fill="#06f"/></svg>';

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === false || value === null || value === undefined) return;
    if (key === 'class') node.className = value;
    else node.setAttribute(key, value === true ? '' : value);
  });
  children.flat().forEach((child) => {
    if (child) node.append(child);
  });
  return node;
}

function addClass(node, cls) {
  if (node) node.classList.add(...cls.split(' '));
  return node;
}

/** inline-block rows keep the source's inter-item whitespace (one space between items) */
function spaceOut(list) {
  [...list.childNodes].forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
  });
  [...list.children].slice(1).forEach((li) => li.before(document.createTextNode(' ')));
  return list;
}

function privacyIcon() {
  const tpl = document.createElement('template');
  tpl.innerHTML = PRIVACY_ICON;
  return tpl.content.firstElementChild;
}

/** reads the footer document: link groups (h2 + ul) and the base row (locale, privacy, menu) */
function readFooter(fragment) {
  const groups = [];
  const base = {
    locale: null, privacy: null, others: [], menu: null,
  };
  fragment.querySelectorAll('.section .default-content-wrapper').forEach((wrapper) => {
    let heading = null;
    [...wrapper.children].forEach((node) => {
      if (/^H[1-6]$/.test(node.tagName)) heading = node;
      else if (node.tagName === 'UL' && heading) {
        groups.push({ heading, list: node });
        heading = null;
      } else if (node.tagName === 'UL') base.menu = node;
      else if (node.tagName === 'P' && node.querySelector('a')) {
        const a = node.querySelector('a');
        const href = a.getAttribute('href') || '';
        if (/privacychoices/i.test(href)) base.privacy = a;
        else if (!base.locale && !base.others.length && !base.privacy) base.locale = a;
        else base.others.push(a);
      }
    });
  });
  return { groups, base };
}

function rows(items, perRow, rowClass) {
  const out = [];
  for (let i = 0; i < items.length; i += perRow) {
    out.push(el('div', { class: rowClass }, ...items.slice(i, i + perRow)));
  }
  return out;
}

/** privacy link: the opt-out icon before the authored label (label wrapped in a span) */
function privacyLink(a) {
  const label = el('span', {}, ...[...a.childNodes]);
  a.append(privacyIcon(), label);
  return a;
}

/* www + bing share the canon footer DOM; bing differs in the locale and legal-link wrappers */
function buildUhfFooter({ groups, base }, variant) {
  const bing = variant === 'bing';
  const linkClass = bing ? 'uhf-footer-link' : null;
  const tagLinks = (scope) => {
    if (linkClass) scope.querySelectorAll('a').forEach((a) => addClass(a, linkClass));
    return scope;
  };
  const groupNodes = groups.map(({ heading, list }) => el(
    'div',
    { class: 'uhf-footer-nav-group' },
    addClass(heading, 'uhf-footer-nav-group-heading'),
    tagLinks(addClass(list, 'uhf-footer-nav-group-links')),
  ));
  const nav = el(
    'nav',
    { class: 'uhf-footer-nav', 'aria-label': 'Footer Resource links' },
    ...rows(groupNodes, 3, 'uhf-footer-nav-row'),
  );

  const legal = el('div', { class: 'uhf-footer-legal-links' });
  if (base.locale) {
    if (bing) {
      legal.append(el(
        'div',
        { class: 'uhf-footer-locale-picker-container' },
        el('i', { class: 'uhf-footer-locale-icon', 'aria-hidden': 'true' }),
        addClass(base.locale, 'uhf-footer-link'),
      ));
    } else {
      legal.append(el(
        'div',
        { class: 'uhf-footer-locale' },
        el('span', { class: 'uhf-icon uhf-glyph-globe', 'aria-hidden': 'true' }),
        base.locale,
      ));
    }
  }
  if (base.privacy) {
    const a = privacyLink(base.privacy);
    if (bing) legal.append(addClass(a, 'uhf-footer-link uhf-footer-privacy'));
    else legal.append(el('div', { class: 'uhf-footer-privacy' }, a));
  }
  base.others.forEach((a) => legal.append(linkClass ? addClass(a, linkClass) : a));

  const footer = el(
    'div',
    { class: 'uhf-footer', id: 'uhf-footer' },
    nav,
    el(
      'div',
      { class: 'uhf-footer-base' },
      legal,
      base.menu ? el('nav', { class: 'uhf-footer-menu', 'aria-label': 'Microsoft corporate links' }, tagLinks(base.menu)) : null,
    ),
  );
  return footer;
}

/* support.microsoft.com footer (float layout) */
function buildSupportFooter({ groups, base }) {
  const groupNodes = groups.map(({ heading, list }) => {
    list.querySelectorAll('a').forEach((a) => addClass(a, 'uhf-footer-link'));
    return el(
      'div',
      { class: 'uhf-footer-group' },
      addClass(heading, 'uhf-footer-heading'),
      addClass(list, 'uhf-footer-list'),
    );
  });
  const nav = el(
    'nav',
    { class: 'uhf-footer-nav', 'aria-label': 'Footer Resource links' },
    ...rows(groupNodes, 3, 'uhf-footer-row'),
  );
  const baseRow = el('div', { class: 'uhf-footer-base' });
  if (base.locale) baseRow.append(addClass(base.locale, 'uhf-footer-link uhf-footer-locale'));
  if (base.privacy) baseRow.append(addClass(privacyLink(base.privacy), 'uhf-footer-link uhf-footer-ccpa'));
  base.others.forEach((a) => {
    const label = el('span', {}, ...[...a.childNodes]);
    a.append(label);
    baseRow.append(addClass(a, 'uhf-footer-link uhf-footer-consumer'));
  });
  if (base.menu) {
    base.menu.querySelectorAll('a').forEach((a) => addClass(a, 'uhf-footer-link'));
    baseRow.append(el(
      'nav',
      { 'aria-label': 'Microsoft corporate links' },
      spaceOut(addClass(base.menu, 'uhf-footer-corp')),
    ));
  }
  return el('div', { class: 'uhf-footer', id: 'uhf-footer' }, nav, baseRow);
}

function chromeVariant() {
  const cls = document.documentElement.classList;
  if (cls.contains('chrome-bing')) return 'bing';
  if (cls.contains('chrome-support')) return 'support';
  return 'www';
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  if (block.querySelector('#uhf-footer')) return; // re-entrant (EW9)
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;

  const variant = chromeVariant();
  const model = readFooter(fragment);
  const footer = variant === 'support' ? buildSupportFooter(model) : buildUhfFooter(model, variant);
  block.textContent = '';
  block.append(footer);
}
