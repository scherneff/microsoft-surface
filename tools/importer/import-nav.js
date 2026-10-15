/* eslint-disable */
/* global WebImporter */

/**
 * Import script for the site header fragment (content/nav.plain.html).
 * Source: Microsoft UHF header (div.cge-uhf-header) on any microsoft.com/en-us/surface page.
 *
 * Output: three (+1 mobile-only) top-level sections (separated by <hr>), flat + semantic:
 *   1. Brand:   Microsoft logo (image link) + site title link ("Discover Surface")
 *   2. Nav:     contextual nav list; dropdown triggers carry a nested <ul>;
 *               the trailing label-only item ("More") is the overflow menu label
 *   3. Tools:   "All Microsoft" megamenu (top links, titled columns, footer link),
 *               Search (link to results page + placeholder/cancel labels),
 *               Sign in (account link + avatar initials)
 *   4. Mobile-only: contextual menu entries the UHF shows only at mobile widths (e.g. Home)
 */

const LOGO_LOCAL_SRC = 'images/microsoft-logo.png';
const SIGN_IN_URL = 'https://account.microsoft.com/account';

function text(el) {
  return (el?.textContent || '').replace(/\s+/g, ' ').trim();
}

function link(document, a) {
  const out = document.createElement('a');
  out.href = a.href;
  out.textContent = text(a);
  return out;
}

function li(document, ...children) {
  const item = document.createElement('li');
  children.forEach((c) => item.append(c));
  return item;
}

function ul(document, items) {
  const list = document.createElement('ul');
  items.forEach((i) => list.append(i));
  return list;
}

/** Visible links of a UHF dropdown body (column titles excluded) */
function dropdownLinks(document, container) {
  return [...container.querySelectorAll('a')]
    .filter((a) => text(a) && !a.closest('.uhf-dropdown-column-title'))
    .map((a) => li(document, link(document, a)));
}

function buildBrand(document, header) {
  const p1 = document.createElement('p');
  const logo = header.querySelector('a.uhf-microsoft-logo');
  const a = document.createElement('a');
  a.href = logo.href;
  const img = document.createElement('img');
  img.src = LOGO_LOCAL_SRC;
  img.alt = logo.getAttribute('aria-label') || text(logo) || 'Microsoft';
  a.append(img);
  p1.append(a);

  const p2 = document.createElement('p');
  p2.append(link(document, header.querySelector('a.uhf-site-logo')));
  return [p1, p2];
}

/** Contextual nav: every item incl. those currently collapsed into the "More" overflow */
function buildNav(document, header) {
  const nav = header.querySelector('nav.uhf-contextual-nav');
  const items = [];
  let overflowLabel = null;
  const seen = new Set();
  nav.querySelectorAll('uhf-dropdown-desktop, uhf-dropdown.overflow-trigger, a.uhf-nav-item, uhf-dropdown').forEach((el) => {
    if (el.matches('uhf-dropdown.overflow-trigger')) {
      overflowLabel = text(el.querySelector('button')) || 'More';
      return;
    }
    if (el.closest('uhf-dropdown.overflow-trigger, uhf-overflow-menu .uhf-overflow-menu-after')) return;
    if (el.matches('a.uhf-nav-item')) {
      if (el.closest('uhf-dropdown-desktop, uhf-dropdown')) return;
      const label = text(el);
      if (!label || seen.has(label)) return;
      seen.add(label);
      items.push(li(document, link(document, el)));
      return;
    }
    const btn = el.querySelector(':scope > button, button.uhf-dropdown-trigger');
    const label = text(btn);
    if (!label || seen.has(label) || el.closest('uhf-dropdown.overflow-trigger')) return;
    seen.add(label);
    const body = el.querySelector('.uhf-dropdown-body') || el;
    items.push(li(document, label, ul(document, dropdownLinks(document, body))));
  });
  const list = ul(document, items);
  if (overflowLabel) list.append(li(document, overflowLabel));
  return [list];
}

function buildTools(document, header) {
  const items = [];

  // All Microsoft megamenu
  const global = header.querySelector('nav.uhf-global-nav uhf-dropdown, nav.uhf-global-nav uhf-dropdown-desktop');
  if (global) {
    const label = text(global.querySelector('button'));
    const sub = [];
    global.querySelectorAll('.uhf-dropdown-header a').forEach((a) => sub.push(li(document, link(document, a))));
    global.querySelectorAll('uhf-dropdown-column, .uhf-dropdown-column').forEach((col) => {
      const title = text(col.querySelector('.uhf-dropdown-column-title'));
      sub.push(li(document, title, ul(document, dropdownLinks(document, col))));
    });
    global.querySelectorAll('uhf-dropdown-footer a, .uhf-dropdown-footer a').forEach((a) => sub.push(li(document, link(document, a))));
    items.push(li(document, label, ul(document, sub)));
  }

  // Search: results page link + UI labels
  const search = header.querySelector('uhf-search');
  if (search) {
    const input = search.querySelector('input');
    const a = document.createElement('a');
    a.href = 'https://www.microsoft.com/en-us/search/explore';
    a.textContent = text(header.querySelector('.uhf-search-text')) || 'Search';
    const labels = [input?.getAttribute('placeholder') || input?.getAttribute('aria-label'), text(search.querySelector('.uhf-search-cancel'))]
      .filter(Boolean).map((t) => li(document, t));
    items.push(li(document, a, ul(document, labels)));
  }

  // Sign in (MeControl renders client-side; link to Microsoft account)
  const me = header.querySelector('uhf-mecontrol');
  if (me) {
    const a = document.createElement('a');
    a.href = SIGN_IN_URL;
    a.textContent = text(me.querySelector('.uhf-mecontrol-signin-label')) || 'Sign in';
    const initials = text(me.querySelector('button')).replace(/sign in/i, '').trim();
    items.push(initials ? li(document, a, ul(document, [li(document, initials)])) : li(document, a));
  }
  return [ul(document, items)];
}

const HEADER_CARRIER_ATTR = 'data-excat-uhf-header';
const MOBILE_LINKS_ATTR = 'data-excat-uhf-mobile-links';

/** Section 4: mobile-only contextual menu entries (links not present in the desktop nav) */
function buildMobileOnly(document, mobileLinks, header) {
  const desktop = new Set([...header.querySelectorAll('nav.uhf-contextual-nav a')].map((a) => text(a)));
  const extra = mobileLinks.filter((l) => !desktop.has(l.text));
  if (!extra.length) return null;
  return [ul(document, extra.map((l) => {
    const a = document.createElement('a');
    a.href = l.href;
    a.textContent = l.text;
    return li(document, a);
  }))];
}

export default {
  /**
   * Runs on the live page before the importer's own cleanup (which drops <header>/<nav>):
   * stash the rendered UHF header markup so transform can parse it.
   */
  onLoad: async ({ document }) => {
    const header = document.querySelector('div.cge-uhf-header header') || document.querySelector('header');
    if (header) document.body.setAttribute(HEADER_CARRIER_ATTR, header.outerHTML);

    // The UHF renders mobile-only menu entries (e.g. "Home") only at mobile widths.
    // Load the same page in a 375px frame and capture the mobile contextual menu links.
    try {
      const frame = document.createElement('iframe');
      frame.style.cssText = 'position:absolute;left:-9999px;top:0;width:375px;height:812px;border:0';
      frame.src = window.location.href;
      document.body.append(frame);
      const links = await new Promise((resolve) => {
        const started = Date.now();
        const poll = () => {
          const doc = frame.contentDocument;
          const nav = doc && doc.querySelector('uhf-contextual-nav-mobile, nav.uhf-contextual-nav');
          const found = nav ? [...nav.querySelectorAll('a')].map((a) => ({ text: text(a), href: a.href })).filter((l) => l.text) : [];
          if (found.length || Date.now() - started > 20000) resolve(found);
          else setTimeout(poll, 300);
        };
        frame.addEventListener('load', poll);
        setTimeout(poll, 1000);
      });
      frame.remove();
      document.body.setAttribute(MOBILE_LINKS_ATTR, JSON.stringify(links));
    } catch (e) {
      // mobile capture is best-effort; desktop content is still imported
    }
  },

  transform: ({ document }) => {
    const tpl = document.createElement('template');
    tpl.innerHTML = document.body.getAttribute(HEADER_CARRIER_ATTR) || '';
    document.body.removeAttribute(HEADER_CARRIER_ATTR);
    const header = tpl.content.querySelector('header') || document.querySelector('div.cge-uhf-header header');
    const main = document.createElement('div');
    let mobileLinks = [];
    try {
      mobileLinks = JSON.parse(document.body.getAttribute(MOBILE_LINKS_ATTR) || '[]');
    } catch (e) {
      mobileLinks = [];
    }
    document.body.removeAttribute(MOBILE_LINKS_ATTR);
    const sections = [buildBrand(document, header), buildNav(document, header), buildTools(document, header)];
    const mobileOnly = buildMobileOnly(document, mobileLinks, header);
    if (mobileOnly) sections.push(mobileOnly);
    sections.forEach((nodes, i) => {
      if (i > 0) main.append(document.createElement('hr'));
      nodes.forEach((n) => main.append(n));
    });
    return [{ element: main, path: '/nav', report: { title: 'nav' } }];
  },
};
