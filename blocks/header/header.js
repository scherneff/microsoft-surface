import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Header — three chrome variants recreated from the gated prototypes
 * (stardust/prototypes: canon.js / bing.js / support.js, header contracts in stardust/chrome/).
 * The nav document (page metadata `nav`, default /nav) supplies every label and link; the
 * variant template is built here and the authored nodes are MOVED into it (EW1).
 * Content model: stardust/runtime-contract.json `chrome.navDocumentModel`.
 *
 * @ew-exempt chrome triggers — menu, search, cancel and sign-in labels move into <button>
 *   hosts (EW7) because the source chrome is button-driven (a11y + prototype parity).
 * @ew-exempt logo labels — the corporate / Bing logo link text becomes the logo <img alt>
 *   (the source shows the logo image only; the label stays authored in the nav document).
 */

const MOBILE_UHF = '(width <= 859px)';

/* ---------- small DOM helpers ---------- */

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

function svg(markup) {
  const tpl = document.createElement('template');
  tpl.innerHTML = markup.trim();
  return tpl.content.firstElementChild;
}

/** strips presentational clones of ids / editor instrumentation (EW4) */
function stripInstrumentation(node) {
  [node, ...node.querySelectorAll('*')].forEach((n) => {
    [...n.attributes].forEach((attr) => {
      if (attr.name === 'id' || attr.name.startsWith('data-aue') || attr.name.startsWith('data-richtext')) {
        n.removeAttribute(attr.name);
      }
    });
  });
  return node;
}

function cloneNodes(nodes) {
  return nodes.map((n) => {
    const c = n.cloneNode(true);
    return c.nodeType === Node.ELEMENT_NODE ? stripInstrumentation(c) : c;
  });
}

/** the inline nodes of a <p> or <li> label (nested lists excluded), whitespace-only skipped */
function labelNodes(container) {
  const nodes = [];
  [...container.childNodes].forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && /^(UL|OL)$/.test(node.tagName)) return;
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'P') {
      nodes.push(...labelNodes(node));
      return;
    }
    if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
    nodes.push(node);
  });
  return nodes;
}

/** inline-block rows keep the source's inter-item whitespace (one space between items) */
function spaceOut(list) {
  [...list.childNodes].forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
  });
  [...list.children].slice(1).forEach((li) => li.before(document.createTextNode(' ')));
  return list;
}

function addClass(node, cls) {
  if (node) node.classList.add(...cls.split(' '));
  return node;
}

/** sections of the nav fragment, classified by content (never by position alone) */
function classifySections(fragment) {
  const sections = [...fragment.querySelectorAll(':scope > .section')]
    .map((s) => s.querySelector('.default-content-wrapper') || s);
  const roles = {};
  const rest = [];
  sections.forEach((s, i) => {
    const tops = [...s.children];
    const uls = tops.filter((c) => c.tagName === 'UL');
    if (i === 0) roles.brand = s;
    else if (s.querySelector('a[href*="search"]') && !roles.tools && uls.length === 0) roles.tools = s;
    else if (uls.length >= 2 && tops[0] && tops[0].tagName === 'P') roles.allms = s;
    else if (uls.length === 1 && tops.length === 1 && !roles.menu) roles.menu = s;
    else rest.push(s);
  });
  [roles.callout] = rest;
  return roles;
}

/** brand section: optional skip link (#…), corporate logo (link or text), optional site link */
function readBrand(brand) {
  const out = { skip: null, corp: null, site: null };
  if (!brand) return out;
  [...brand.children].forEach((p) => {
    const a = p.querySelector('a');
    if (a && (a.getAttribute('href') || '').startsWith('#')) out.skip = a;
    else if (!out.corp) out.corp = a || p;
    else if (a && !out.site) out.site = a;
  });
  return out;
}

/** tools section: search link + plain paragraphs + optional sign-in / cart links */
function readTools(tools) {
  const out = {
    search: null, texts: [], signin: null, cart: null,
  };
  if (!tools) return out;
  [...tools.children].forEach((p) => {
    const a = p.querySelector('a');
    const href = a ? a.getAttribute('href') || '' : '';
    if (a && /search/.test(href) && !out.search) out.search = a;
    else if (a && /cart/.test(href)) out.cart = a;
    else if (a) out.signin = a;
    else out.texts.push(p);
  });
  return out;
}

/** All Microsoft section: label, header links, columns, sitemap link */
function readAllMs(section) {
  const out = {
    label: null, header: [], columns: [], footer: null,
  };
  if (!section) return out;
  let pendingTitle = null;
  [...section.children].forEach((node) => {
    if (node.tagName === 'P' && node.querySelector('a')) out.footer = node.querySelector('a');
    else if (node.tagName === 'P' && !out.label) out.label = node;
    else if (node.tagName === 'P') pendingTitle = node;
    else if (node.tagName === 'UL' && pendingTitle) {
      out.columns.push({ title: pendingTitle, links: [...node.querySelectorAll('a')] });
      pendingTitle = null;
    } else if (node.tagName === 'UL') out.header = [...node.querySelectorAll('a')];
  });
  return out;
}

/** menu section: top-level items as { link } or { label, labelLink, links } */
function readMenu(section) {
  const list = section && section.querySelector('ul');
  if (!list) return [];
  return [...list.children].map((li) => {
    const sub = li.querySelector(':scope > ul');
    const strong = li.querySelector(':scope > strong, :scope > p > strong');
    if (!sub) {
      // decorateButtons() (fragment load) turns a bold link into a.button and drops the <strong>
      const link = li.querySelector('a');
      const cta = !!strong || !!(link && link.classList.contains('button'));
      if (link) link.classList.remove('button', 'primary', 'secondary', 'accent');
      return { link, cta };
    }
    const label = labelNodes(li);
    const labelLink = label.find((n) => n.nodeType === Node.ELEMENT_NODE && n.tagName === 'A');
    return { label, labelLink, links: [...sub.querySelectorAll(':scope > li > a')] };
  });
}

const sameHref = (a, b) => a && b && a.getAttribute('href') === b.getAttribute('href');

/* ======================================================================
   www — Microsoft UHF (canon.css / canon.js)
   ====================================================================== */

function chevron() {
  return el('span', { class: 'uhf-icon uhf-glyph-chevron', 'aria-hidden': 'true' });
}

function buildWww(roles) {
  const brand = readBrand(roles.brand);
  const tools = readTools(roles.tools);
  const allms = readAllMs(roles.allms);
  const menu = readMenu(roles.menu);
  const home = !brand.site;

  const header = el('div', { class: `uhf-header${home ? ' hp-header' : ''}`, id: 'uhf-header' });

  // brand
  const brandBox = el('div', { class: 'uhf-brand' });
  if (brand.corp) {
    const logo = brand.corp.tagName === 'A' ? brand.corp : el('span', {}, ...labelNodes(brand.corp));
    addClass(logo, 'uhf-microsoft-logo');
    const label = logo.textContent.trim();
    logo.textContent = '';
    logo.setAttribute('aria-label', label);
    logo.append(el('img', {
      src: '/icons/RE1Mu3b.png', alt: label, width: 108, height: 23,
    }));
    brandBox.append(logo);
  }
  let siteLabel = [];
  if (brand.site) {
    addClass(brand.site, 'uhf-site-logo');
    siteLabel = [...brand.site.childNodes];
    brand.site.append(el('span', {}, ...siteLabel));
    brandBox.append(el('div', { class: 'uhf-site-logo-container' }, brand.site));
  }

  // contextual nav
  const ctxList = el('ul', { class: 'uhf-contextual-nav', id: 'uhf-ctx-list' });
  menu.forEach((item, i) => {
    if (item.link) {
      addClass(item.link, 'uhf-nav-item uhf-nav-link');
      const isHome = i === 0 && sameHref(item.link, brand.site);
      ctxList.append(el('li', { class: isHome ? 'uhf-ctx-home' : null }, item.link));
      return;
    }
    const id = `uhf-dd-${i}`;
    const trigger = el('button', {
      class: 'uhf-nav-item uhf-nav-button uhf-dropdown-trigger',
      type: 'button',
      'aria-expanded': 'false',
      'aria-controls': id,
    }, ...item.label, chevron());
    item.links.forEach((a) => addClass(a, 'uhf-nav-item uhf-dropdown-link'));
    const panel = el(
      'div',
      { class: 'uhf-dropdown-menu', id, hidden: true },
      el('div', { class: 'uhf-dropdown-body no-columns' }, ...item.links),
    );
    ctxList.append(el('li', { class: 'uhf-dropdown' }, trigger, panel));
  });
  const ctxWrap = el('nav', {
    class: `uhf-contextual-nav-wrap${home ? ' hp-ctx' : ''}`,
    'aria-label': 'Contextual menu',
  });
  if (!home) {
    ctxWrap.append(el('button', {
      class: 'uhf-contextual-trigger',
      type: 'button',
      'aria-expanded': 'false',
      'aria-controls': 'uhf-ctx-list',
    }, ...cloneNodes(siteLabel), chevron()));
  }
  ctxWrap.append(ctxList);

  // All Microsoft
  const globalNav = el('nav', { class: 'uhf-global-nav', 'aria-label': 'All Microsoft menu' });
  if (allms.label) {
    globalNav.append(
      el('button', {
        class: 'uhf-nav-item uhf-nav-button uhf-dropdown-trigger uhf-global-trigger uhf-desktop-only',
        type: 'button',
        'aria-expanded': 'false',
        'aria-controls': 'uhf-allms',
      }, ...labelNodes(allms.label), chevron()),
      el('button', {
        class: 'uhf-nav-item uhf-nav-button uhf-dropdown-trigger uhf-global-trigger uhf-mobile-only',
        type: 'button',
        'aria-expanded': 'false',
        'aria-controls': 'uhf-allms',
        'aria-label': 'All Microsoft expand to see list of Microsoft products and services',
      }, el('span', { class: 'uhf-icon uhf-hamburger-icon', 'aria-hidden': 'true' })),
    );
    const panel = el('div', { class: 'uhf-dropdown-menu uhf-allms', id: 'uhf-allms', hidden: true });
    const headerList = el('ul', { class: 'uhf-dropdown-header' });
    allms.header.forEach((a) => headerList.append(el('li', {}, addClass(a, 'uhf-nav-item uhf-dropdown-link'))));
    const body = el('div', { class: 'uhf-dropdown-body has-columns' });
    allms.columns.forEach((col, i) => {
      const id = `uhf-col-${i}`;
      const title = labelNodes(col.title);
      const list = el('ul', { id });
      col.links.forEach((a) => list.append(el('li', {}, addClass(a, 'uhf-nav-item uhf-dropdown-link'))));
      body.append(el(
        'div',
        { class: 'uhf-dropdown-column' },
        el('div', { class: 'uhf-dropdown-column-title' }, ...title),
        el('button', {
          class: 'uhf-dropdown-column-trigger',
          type: 'button',
          'aria-expanded': 'false',
          'aria-controls': id,
        }, ...cloneNodes(title), chevron()),
        list,
      ));
    });
    panel.append(headerList, body);
    if (allms.footer) {
      panel.append(el(
        'div',
        { class: 'uhf-dropdown-footer' },
        addClass(allms.footer, 'uhf-nav-item uhf-dropdown-link'),
      ));
    }
    globalNav.append(panel);
  }

  // search
  const [placeholderP, cancelP, signinP, meP] = tools.texts;
  const placeholder = placeholderP ? placeholderP.textContent : '';
  const search = el('div', { class: 'uhf-search' });
  if (tools.search) {
    const input = el('input', {
      class: 'uhf-search-input',
      type: 'search',
      name: 'q',
      role: 'combobox',
      'aria-expanded': 'false',
      'aria-autocomplete': 'list',
      'aria-label': placeholder,
      title: placeholder,
      placeholder,
      maxlength: 200,
    });
    const form = el(
      'form',
      {
        class: 'uhf-search-form', role: 'search', action: tools.search.href, method: 'get',
      },
      input,
      el('button', {
        class: 'uhf-search-submit', 'aria-label': 'Search', title: 'Search', type: 'submit',
      }, el('span', { class: 'uhf-icon uhf-glyph-search', 'aria-hidden': 'true' })),
    );
    const container = el(
      'div',
      { class: 'uhf-search-container', id: 'uhf-search-container' },
      el('button', { class: 'uhf-search-back', type: 'button', 'aria-label': 'Back' }, el('span', { class: 'uhf-icon uhf-glyph-back', 'aria-hidden': 'true' })),
      form,
    );
    if (cancelP) {
      container.append(el('button', { class: 'uhf-search-cancel', type: 'button' }, ...labelNodes(cancelP)));
    }
    search.append(container, el(
      'button',
      {
        class: 'uhf-nav-item uhf-nav-button uhf-search-button',
        type: 'button',
        'aria-label': placeholder,
        title: placeholder,
        'aria-expanded': 'false',
        'aria-controls': 'uhf-search-container',
      },
      el('span', { class: 'uhf-search-text' }, ...labelNodes(tools.search)),
      el('span', { class: 'uhf-icon uhf-glyph-search', 'aria-hidden': 'true' }),
    ));
  }

  // me control
  const me = el('div', { class: 'uhf-mecontrol' });
  if (signinP) me.append(el('button', { class: 'uhf-mecontrol-signin-label', type: 'button' }, ...labelNodes(signinP)));
  if (meP) me.append(el('button', { class: 'uhf-mecontrol-avatar', type: 'button' }, el('span', {}, ...labelNodes(meP))));

  const actions = el('div', { class: 'uhf-actions' }, globalNav, search, me);
  if (tools.cart) {
    addClass(tools.cart, 'uhf-nav-item uhf-nav-button uhf-cart');
    tools.cart.setAttribute('aria-label', tools.cart.textContent);
    const cartLabel = el('span', { class: 'uhf-cart-text' }, ...[...tools.cart.childNodes]);
    tools.cart.append(
      cartLabel,
      el('span', { class: 'uhf-icon uhf-glyph-cart', 'aria-hidden': 'true' }),
      el('span', { class: 'uhf-cart-count', hidden: true }, document.createTextNode('0')),
    );
    actions.append(el('div', { class: 'uhf-cart-wrap' }, tools.cart));
  }

  header.append(el(
    'div',
    { class: 'uhf-header-bar' },
    el('div', { class: 'uhf-header-container' }, brandBox, ctxWrap, actions),
  ));

  const skip = brand.skip ? addClass(brand.skip, 'uhf-skip-link') : null;
  return { nodes: [skip, header], skipTarget: skip };
}

/** behaviour — canon.js (click-only dropdowns, drawers < 860, search row) */
function bindWww(header) {
  const mobile = window.matchMedia(MOBILE_UHF);
  const triggers = [...header.querySelectorAll('.uhf-dropdown-trigger')];
  const ctxTrigger = header.querySelector('.uhf-contextual-trigger');
  const ctxList = header.querySelector('#uhf-ctx-list');
  const searchBtn = header.querySelector('.uhf-search-button');
  const searchInput = header.querySelector('.uhf-search-input');

  const panelOf = (t) => document.getElementById(t.getAttribute('aria-controls'));
  const isOpen = (t) => t.getAttribute('aria-expanded') === 'true';
  const firstLink = (node) => node && node.querySelector('a, button');

  function setDropdown(t, open, { focus = false } = {}) {
    const panel = panelOf(t);
    t.setAttribute('aria-expanded', String(open));
    if (panel) panel.hidden = !open;
    if (open && focus) {
      const f = firstLink(panel);
      if (f) f.focus();
    }
  }
  function closeAllDropdowns(except) {
    triggers.forEach((t) => {
      if (t !== except && isOpen(t)) setDropdown(t, false);
    });
  }
  function setCtx(open) {
    if (!ctxTrigger) return;
    ctxTrigger.setAttribute('aria-expanded', String(open));
    header.classList.toggle('ctx-open', open);
    if (open) {
      const f = firstLink(ctxList);
      if (f) f.focus();
    }
  }
  function setSearch(open, { returnFocus = false } = {}) {
    header.classList.toggle('search-open', open);
    if (searchBtn) searchBtn.setAttribute('aria-expanded', String(open));
    if (open) {
      closeAllDropdowns();
      setCtx(false);
      if (searchInput) searchInput.focus();
    } else if (returnFocus && searchBtn) searchBtn.focus();
  }

  triggers.forEach((t) => {
    t.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !isOpen(t);
      const inCtxDrawer = mobile.matches && ctxList && ctxList.contains(t);
      if (!inCtxDrawer) closeAllDropdowns(t);
      if (open && header.classList.contains('search-open')) setSearch(false);
      if (open && mobile.matches && t.classList.contains('uhf-global-trigger')) setCtx(false);
      // mobile drawers move focus into the panel; desktop keeps it on the trigger
      setDropdown(t, open, { focus: open && mobile.matches && !inCtxDrawer });
    });
  });

  header.querySelectorAll('.uhf-dropdown-column-trigger').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const col = b.closest('.uhf-dropdown-column');
      const open = !col.classList.contains('open');
      col.classList.toggle('open', open);
      b.setAttribute('aria-expanded', String(open));
    });
  });

  if (ctxTrigger) {
    ctxTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = ctxTrigger.getAttribute('aria-expanded') !== 'true';
      if (open) {
        closeAllDropdowns();
        if (header.classList.contains('search-open')) setSearch(false);
      }
      setCtx(open);
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setSearch(true);
    });
  }
  const cancel = header.querySelector('.uhf-search-cancel');
  if (cancel) {
    cancel.addEventListener('click', (e) => {
      e.stopPropagation();
      setSearch(false);
    });
  }
  const back = header.querySelector('.uhf-search-back');
  if (back) {
    back.addEventListener('click', (e) => {
      e.stopPropagation();
      setSearch(false, { returnFocus: true });
    });
  }

  // clicks inside an open panel never count as "outside"
  header.querySelectorAll('.uhf-dropdown-menu, #uhf-ctx-list, .uhf-search-container').forEach((p) => {
    p.addEventListener('click', (e) => e.stopPropagation());
  });

  document.addEventListener('click', () => {
    closeAllDropdowns();
    if (header.classList.contains('ctx-open')) setCtx(false);
    if (header.classList.contains('search-open')) setSearch(false, { returnFocus: mobile.matches });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const inDrawer = (t) => mobile.matches && ctxList && ctxList.contains(t);
    const open = triggers.find((t) => isOpen(t) && !inDrawer(t));
    if (open) {
      setDropdown(open, false);
      open.focus();
      return;
    }
    if (header.classList.contains('search-open')) setSearch(false, { returnFocus: mobile.matches });
    // contextual drawer: Escape does not close it (contract: escape false)
  });

  mobile.addEventListener('change', () => {
    closeAllDropdowns();
    setCtx(false);
    setSearch(false);
  });
}

/* ======================================================================
   bing — explore.microsoft.com common-nav (bing.css / bing.js)
   ====================================================================== */

const BING_CHEVRON = '<svg class="common-nav-item-menu-icon" width="0.6em" height="0.6em" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.221 5a1.6 1.6 0 0 1 .672.144 1.933 1.933 0 0 1 .963.963 1.6 1.6 0 0 1 .144.672c0 .492-.177.913-.53 1.266l-10.22 10.22c-.168.168-.36.298-.58.391a1.736 1.736 0 0 1-.686.139c-.482 0-.898-.177-1.25-.53L.514 8.046A1.72 1.72 0 0 1 0 6.779a1.79 1.79 0 0 1 1.092-1.64C1.31 5.046 1.54 5 1.78 5a1.848 1.848 0 0 1 1.25.529l8.955 8.972 8.971-8.972c.353-.352.774-.529 1.266-.529Z" fill="currentColor" fill-rule="evenodd"/></svg>';
const BING_SEARCH = '<svg width="1em" height="1em" viewBox="0 0 18 18" aria-hidden="true"><path d="M10.717 0c-2.01 0-3.834.819-5.155 2.14a7.272 7.272 0 0 0-.722 9.467l.077.103L.31 16.317a.979.979 0 0 0 1.337 1.43l4.654-4.653a7.272 7.272 0 0 0 9.57-.645 7.272 7.272 0 0 0 2.14-5.155 7.27 7.27 0 0 0-2.14-5.154A7.272 7.272 0 0 0 11.022.006L10.717 0Zm-.08 2a5.362 5.362 0 0 1 5.374 5.375 5.362 5.362 0 0 1-5.375 5.375 5.353 5.353 0 0 1-3.71-1.486.99.99 0 0 0-.178-.177 5.353 5.353 0 0 1-1.487-3.712A5.362 5.362 0 0 1 10.636 2Z" fill="currentColor" fill-rule="nonzero"/></svg>';
const BING_MENU = '<svg width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></g></svg>';
const BING_CLOSE = '<svg width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></g></svg>';
const BING_CLOSE_CIRCLE = '<svg width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></g></svg>';

function bingLink(a) {
  // the label sits in a span inside the authored link (hover underline lives on the span)
  a.append(el('span', {}, ...[...a.childNodes]));
  return a;
}

function buildBing(roles) {
  const brand = readBrand(roles.brand);
  const tools = readTools(roles.tools);
  const menu = readMenu(roles.menu);
  const [placeholderP, ctaP] = tools.texts;

  const nav = el('div', { class: 'common-nav common-nav-sticky', id: 'nav' });
  const items = el('ul', { class: 'common-nav-items' });
  const drawerItems = el('ul', { class: 'nav-drawer-items' });

  // logos
  const logoItem = el('div', { class: 'common-nav-logo-item' }, el('img', {
    class: 'common-nav-logo common-nav-logo-ms',
    src: '/icons/microsoft-wordmark.svg',
    alt: brand.corp ? brand.corp.textContent.trim() : '',
    width: 120,
    height: 26,
  }));
  if (brand.site) {
    const label = brand.site.textContent.trim();
    brand.site.textContent = '';
    brand.site.append(el('img', {
      class: 'common-nav-logo common-nav-logo-bing',
      src: '/icons/bing-logo.avif',
      width: 261,
      height: 129,
      alt: label,
    }));
    items.append(el('li', { class: 'common-nav-item common-nav-title-item' }, el('div', {}, brand.site)));
    drawerItems.append(el('li', { class: 'nav-drawer-item nav-drawer-item-logo' }, stripInstrumentation(brand.site.cloneNode(true))));
  }

  // menu items; a dropdown labelled without a link is the "More" overflow group
  let more = null;
  menu.forEach((item, i) => {
    if (item.link) {
      items.append(el(
        'li',
        { class: 'common-nav-item common-nav-menu-item' },
        el('div', {}, bingLink(item.link)),
      ));
      drawerItems.append(el('li', { class: 'nav-drawer-item' }, stripInstrumentation(item.link.cloneNode(true))));
      return;
    }
    if (!item.labelLink) {
      more = item;
      return;
    }
    const id = `nav-menu-${i}`;
    const label = item.labelLink.textContent;
    const popup = el('div', { class: 'common-nav-item-popup', id, hidden: true }, el('ul', {}, ...item.links.map((a) => el('li', {}, a))));
    items.append(el(
      'li',
      { class: 'common-nav-item common-nav-menu-item common-nav-item-has-menu' },
      el(
        'div',
        {},
        bingLink(item.labelLink),
        el('button', {
          type: 'button',
          class: 'common-nav-item-toggle',
          'aria-label': label,
          'aria-expanded': 'false',
          'aria-controls': id,
        }, svg(BING_CHEVRON)),
      ),
      popup,
    ));
    const subId = `drawer-menu-${i}`;
    const row = el(
      'div',
      { class: 'nav-drawer-row' },
      stripInstrumentation(item.labelLink.cloneNode(true)),
      el('button', {
        type: 'button',
        class: 'nav-drawer-sub-toggle',
        'aria-label': label,
        'aria-expanded': 'false',
        'aria-controls': subId,
      }, svg(BING_CHEVRON)),
    );
    const sub = el('ul', { class: 'nav-drawer-sub', id: subId, hidden: true }, ...item.links.map((a) => el('li', {}, stripInstrumentation(a.cloneNode(true)))));
    drawerItems.append(el('li', { class: 'nav-drawer-item' }, row, sub));
  });

  if (more) {
    // overflow links show inline until search opens, then fold into "More"
    const popupLinks = [];
    more.links.forEach((a) => {
      popupLinks.push(el('li', {}, stripInstrumentation(a.cloneNode(true))));
      drawerItems.append(el('li', { class: 'nav-drawer-item' }, stripInstrumentation(a.cloneNode(true))));
      items.append(el(
        'li',
        { class: 'common-nav-item common-nav-menu-item common-nav-menu-item-overflow' },
        el('div', {}, bingLink(a)),
      ));
    });
    items.append(el(
      'li',
      { class: 'common-nav-item common-nav-more-item', hidden: true },
      el('div', {}, el('button', {
        type: 'button',
        class: 'common-nav-item-toggle common-nav-item-more',
        'aria-expanded': 'false',
        'aria-controls': 'nav-more-menu',
      }, el('span', {}, ...more.label), svg(BING_CHEVRON))),
      el('div', { class: 'common-nav-item-popup', id: 'nav-more-menu', hidden: true }, el('ul', {}, ...popupLinks)),
    ));
  }

  const menuBox = el(
    'div',
    { class: 'common-nav-menu' },
    el('div', { class: 'common-nav-fit' }, logoItem, el('nav', { class: 'common-nav-nav', 'aria-label': 'Bing' }, items)),
  );

  const end = el('section', { class: 'common-nav-end', 'aria-label': 'header actions' });
  if (tools.search) {
    const placeholder = placeholderP ? placeholderP.textContent : '';
    end.append(el(
      'div',
      { class: 'common-nav-search', id: 'header-search-box' },
      el('button', {
        type: 'button', class: 'common-nav-search-toggle', 'aria-expanded': 'false', 'aria-controls': 'header-search-form',
      }, el('span', {}, ...labelNodes(tools.search)), svg(BING_SEARCH)),
      el(
        'form',
        {
          class: 'common-nav-search-form', id: 'header-search-form', role: 'search', action: tools.search.href, target: '_blank', hidden: true,
        },
        el('input', {
          class: 'common-nav-search-input', type: 'search', name: 'q', placeholder, 'aria-label': placeholder,
        }),
        el('button', { type: 'submit', class: 'common-nav-search-submit', 'aria-label': 'Search' }, svg(BING_SEARCH)),
      ),
      el('button', {
        type: 'button', class: 'common-nav-search-close', 'aria-label': 'Close search', hidden: true,
      }, svg(BING_CLOSE)),
    ));
  }
  if (ctaP) {
    end.append(el('div', { class: 'common-nav-actions' }, el('button', { type: 'button', class: 'common-nav-cta' }, el('span', {}, ...labelNodes(ctaP)))));
  }
  menuBox.append(end, el('div', { class: 'common-nav-mobile' }, el('button', {
    type: 'button', class: 'common-nav-mobile-toggle', 'aria-label': 'Menu', 'aria-expanded': 'false', 'aria-controls': 'nav-drawer',
  }, svg(BING_MENU))));

  const drawer = el(
    'div',
    { class: 'nav-drawer', id: 'nav-drawer', hidden: true },
    el('div', { class: 'nav-drawer-overlay' }),
    el(
      'div',
      {
        class: 'nav-drawer-panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Menu',
      },
      el('div', { class: 'nav-drawer-close' }, el('button', { type: 'button', class: 'nav-drawer-close-button', 'aria-label': 'Close' }, svg(BING_CLOSE_CIRCLE))),
      drawerItems,
    ),
  );
  nav.append(menuBox, drawer);
  return { nodes: [nav] };
}

/** behaviour — bing.js (popups, search expand, drawer, scrolled shadow) */
function bindBing(nav) {
  const onScroll = () => nav.classList.toggle('common-nav-scrolled', window.scrollY > 0);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const drawer = nav.querySelector('.nav-drawer');
  const drawerToggle = nav.querySelector('.common-nav-mobile-toggle');
  const toggles = [...nav.querySelectorAll('.common-nav-items .common-nav-item-toggle')];
  const panelOf = (t) => document.getElementById(t.getAttribute('aria-controls'));
  const closeMenu = (t, focus) => {
    if (t.getAttribute('aria-expanded') !== 'true') return;
    t.setAttribute('aria-expanded', 'false');
    const panel = panelOf(t);
    panel.classList.remove('is-open');
    panel.hidden = true;
    document.documentElement.style.overflow = '';
    if (focus) t.focus();
  };
  const closeAll = (except) => toggles.forEach((t) => t !== except && closeMenu(t));
  toggles.forEach((t) => {
    t.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = t.getAttribute('aria-expanded') === 'true';
      closeAll(t);
      if (open) {
        closeMenu(t);
        return;
      }
      t.setAttribute('aria-expanded', 'true');
      const panel = panelOf(t);
      const item = t.closest('.common-nav-item');
      panel.style.setProperty('--float-top', `${nav.getBoundingClientRect().bottom - 6}px`);
      panel.style.setProperty('--panel-left', `${item.getBoundingClientRect().left - 12}px`);
      panel.hidden = false;
      panel.getBoundingClientRect(); // start the opacity transition from 0
      panel.classList.add('is-open');
      document.documentElement.style.overflow = 'hidden';
      const first = panel.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    });
  });
  document.addEventListener('click', (e) => {
    toggles.forEach((t) => {
      const panel = panelOf(t);
      const inside = t.contains(e.target) || panel.querySelector('ul').contains(e.target);
      if (!inside) closeMenu(t);
    });
  });

  function openDrawer() {
    drawer.hidden = false;
    drawerToggle.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
    drawer.querySelector('.nav-drawer-close-button').focus();
  }
  function closeDrawer() {
    drawer.hidden = true;
    drawerToggle.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    drawerToggle.focus();
  }
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = toggles.find((t) => t.getAttribute('aria-expanded') === 'true');
    if (open) closeMenu(open, true);
    if (!drawer.hidden) closeDrawer();
  });

  const searchToggle = nav.querySelector('.common-nav-search-toggle');
  const searchForm = nav.querySelector('#header-search-form');
  const searchClose = nav.querySelector('.common-nav-search-close');
  const moreItem = nav.querySelector('.common-nav-more-item');
  const setSearch = (open) => {
    nav.classList.toggle('common-nav-search-open', open);
    searchToggle.hidden = open;
    searchToggle.setAttribute('aria-expanded', String(open));
    searchForm.hidden = !open;
    searchClose.hidden = !open;
    if (moreItem) moreItem.hidden = !open;
    if (!open) closeAll();
  };
  if (searchToggle) {
    searchToggle.addEventListener('click', () => {
      setSearch(true);
      searchForm.querySelector('input').focus();
    });
    searchClose.addEventListener('click', () => {
      setSearch(false);
      searchToggle.focus();
    });
  }

  drawerToggle.addEventListener('click', () => (drawer.hidden ? openDrawer() : closeDrawer()));
  drawer.querySelector('.nav-drawer-close-button').addEventListener('click', closeDrawer);
  drawer.querySelector('.nav-drawer-overlay').addEventListener('click', closeDrawer);
  drawer.querySelectorAll('.nav-drawer-sub-toggle').forEach((b) => {
    b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', String(!open));
      document.getElementById(b.getAttribute('aria-controls')).hidden = open;
    });
  });
}

/* ======================================================================
   support — support.microsoft.com UHF category header (support.css / support.js)
   ====================================================================== */

function buildSupport(roles) {
  const brand = readBrand(roles.brand);
  const tools = readTools(roles.tools);
  const allms = readAllMs(roles.allms);
  const menu = readMenu(roles.menu);
  const [placeholderP, cancelP] = tools.texts;
  const placeholder = placeholderP ? placeholderP.textContent : '';

  const header = el('div', { class: 'uhf-header uhf-header-category', id: 'uhf-header' });
  const bar = el(
    'div',
    { class: 'uhf-header-bar' },
    el('button', {
      class: 'uhf-header-burger',
      type: 'button',
      'aria-expanded': 'false',
      'aria-controls': 'uhf-allms-panel',
      'aria-label': 'All Microsoft expand to see list of Microsoft products and services',
    }),
    el('button', { class: 'uhf-header-back', type: 'button', 'aria-label': 'Close search' }),
  );

  if (brand.corp) {
    const logo = brand.corp.tagName === 'A' ? brand.corp : el('span', {}, ...labelNodes(brand.corp));
    addClass(logo, 'uhf-header-logo');
    const text = el('span', { class: 'uhf-sr' }, ...[...logo.childNodes]);
    logo.append(el('img', {
      src: '/icons/RE1Mu3b.png', alt: '', width: 108, height: 23,
    }), text);
    bar.append(logo);
  }
  let siteLabel = [];
  if (brand.site) {
    addClass(brand.site, 'uhf-header-cat');
    siteLabel = [...brand.site.childNodes];
    brand.site.append(el('span', {}, ...siteLabel));
    bar.append(
      el('div', { class: 'uhf-header-pipe' }, brand.site),
      el('div', { class: 'uhf-header-catwrap' }, el('button', {
        class: 'uhf-header-catbtn',
        type: 'button',
        'aria-expanded': 'false',
        'aria-controls': 'uhf-g-nav',
        'aria-label': brand.site.textContent,
      }, ...cloneNodes(siteLabel), document.createTextNode(' '))),
    );
  }

  const list = el('ul', { class: 'uhf-nav-list' });
  menu.forEach((item, i) => {
    if (item.link && item.cta) {
      addClass(item.link, 'uhf-nav-link uhf-nav-cta');
      list.append(el('li', { class: 'uhf-nav-item uhf-nav-item-cta' }, item.link));
    } else if (item.link) {
      addClass(item.link, 'uhf-nav-link');
      const isHome = i === 0 && sameHref(item.link, brand.site);
      list.append(el('li', { class: `uhf-nav-item${isHome ? ' uhf-nav-item-mobile' : ''}` }, item.link));
    } else {
      const id = `uhf-sub-${i}`;
      item.links.forEach((a) => addClass(a, 'uhf-nav-sublink'));
      list.append(el(
        'li',
        { class: 'uhf-nav-item uhf-nav-item-menu' },
        el('button', {
          class: 'uhf-nav-toggle', type: 'button', 'aria-expanded': 'false', 'aria-controls': id,
        }, ...item.label),
        el('ul', { class: 'uhf-nav-sub', id }, ...item.links.map((a) => el('li', {}, a))),
      ));
    }
  });
  spaceOut(list);
  bar.append(el('nav', { class: 'uhf-nav', id: 'uhf-g-nav', 'aria-label': 'Contextual menu' }, list));

  const actions = el('div', { class: 'uhf-header-actions' });
  if (allms.label) {
    const cols = el('ul', { class: 'uhf-allms-cols' });
    const global = el('ul', { class: 'uhf-allms-global' }, ...allms.header.map((a) => el('li', {}, addClass(a, 'uhf-allms-link'))));
    cols.append(el(
      'li',
      { class: 'uhf-allms-col uhf-allms-col-global' },
      el('h2', { class: 'uhf-sr' }, document.createTextNode('Global')),
      global,
    ));
    allms.columns.forEach((col, i) => {
      const id = `uhf-allms-sub-${i}`;
      const title = labelNodes(col.title);
      cols.append(el(
        'li',
        { class: 'uhf-allms-col' },
        el('span', { class: 'uhf-allms-head' }, ...title),
        el('button', {
          class: 'uhf-allms-toggle', type: 'button', 'aria-expanded': 'false', 'aria-controls': id,
        }, ...cloneNodes(title)),
        el('ul', { class: 'uhf-allms-sub', id }, ...col.links.map((a) => el('li', {}, addClass(a, 'uhf-allms-link')))),
      ));
    });
    if (allms.footer) cols.append(el('li', { class: 'uhf-allms-info' }, addClass(allms.footer, 'uhf-allms-sitemap')));
    actions.append(el(
      'nav',
      { class: 'uhf-allms', 'aria-label': 'All Microsoft menu' },
      el('button', {
        class: 'uhf-allms-btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'uhf-allms-panel',
      }, el('span', {}, ...labelNodes(allms.label))),
      el('div', { class: 'uhf-allms-panel', id: 'uhf-allms-panel' }, cols),
    ));
  }
  if (tools.search) {
    actions.append(el(
      'form',
      {
        class: 'uhf-search', id: 'searchForm', role: 'search', action: tools.search.href, method: 'get',
      },
      el('input', {
        class: 'uhf-search-input',
        id: 'cli_shellHeaderSearchInput',
        name: 'query',
        type: 'search',
        placeholder,
        'aria-label': 'Search Expanded',
        title: placeholder,
        autocomplete: 'off',
      }),
      el('button', {
        class: 'uhf-search-btn', id: 'search', type: 'button', 'aria-label': placeholder,
      }, el('span', {}, ...labelNodes(tools.search))),
    ));
  }
  if (cancelP) {
    actions.append(el('button', { class: 'uhf-search-cancel', type: 'button', 'aria-label': 'Cancel Search' }, el('span', {}, ...labelNodes(cancelP))));
  }
  if (tools.signin) {
    const a = addClass(tools.signin, 'uhf-me-trigger');
    a.setAttribute('aria-label', 'Sign in to your account');
    const text = el('span', { class: 'uhf-me-text' }, ...[...a.childNodes]);
    a.append(
      el('span', { class: 'uhf-sr' }, document.createTextNode('Sign in to your account')),
      text,
      el('span', { class: 'uhf-me-pic', role: 'presentation' }),
    );
    actions.append(el('div', { class: 'uhf-me' }, a));
  }
  bar.append(actions);
  header.append(bar);

  const nodes = [];
  if (brand.skip) nodes.push(addClass(brand.skip, 'uhf-skip'));
  nodes.push(header);

  const callout = roles.callout ? [...roles.callout.children].filter((c) => c.tagName === 'P') : [];
  if (callout.length) {
    const [heading, text] = callout;
    nodes.push(el(
      'div',
      {
        class: 'uhf-callout', id: 'smcTeachingCalloutPopover', role: 'dialog', 'aria-label': heading.textContent,
      },
      el('span', { class: 'uhf-callout-caret' }),
      el(
        'div',
        { class: 'uhf-callout-body' },
        el('div', { class: 'uhf-callout-dismiss' }, el('a', {
          href: '#', id: 'teachingCalloutDismiss', role: 'button', 'aria-label': 'Close',
        }, el('span', { class: 'uhf-callout-x', 'aria-hidden': 'true' }))),
        el(
          'div',
          { class: 'uhf-callout-msg' },
          el('div', { class: 'uhf-callout-heading' }, ...labelNodes(heading)),
          text ? el('div', { class: 'uhf-callout-text' }, ...labelNodes(text)) : null,
        ),
      ),
    ));
  }
  return { nodes, skipTarget: brand.skip };
}

/** behaviour — support.js (menus, search open/cancel, me-control label, callout dismiss) */
function bindSupport(header) {
  header.classList.add('js');
  const q = (s) => header.querySelector(s);
  const qa = (s) => [...header.querySelectorAll(s)];
  const setExpanded = (btn, open) => btn && btn.setAttribute('aria-expanded', String(open));
  const closeSubs = (except) => qa('.uhf-nav-toggle, .uhf-allms-toggle').forEach((b) => {
    if (b !== except) setExpanded(b, false);
  });
  const closeAll = () => {
    header.classList.remove('is-allms', 'is-cat');
    setExpanded(q('.uhf-header-burger'), false);
    setExpanded(q('.uhf-header-catbtn'), false);
    setExpanded(q('.uhf-allms-btn'), false);
    closeSubs();
  };
  const on = (sel, evt, fn) => {
    const node = q(sel);
    if (node) node.addEventListener(evt, fn);
  };

  on('.uhf-header-burger', 'click', (e) => {
    const open = !header.classList.contains('is-allms');
    closeAll();
    header.classList.toggle('is-allms', open);
    setExpanded(e.currentTarget, open);
  });
  on('.uhf-header-catbtn', 'click', (e) => {
    const open = !header.classList.contains('is-cat');
    closeAll();
    header.classList.toggle('is-cat', open);
    setExpanded(e.currentTarget, open);
  });
  on('.uhf-allms-btn', 'click', (e) => {
    const open = e.currentTarget.getAttribute('aria-expanded') !== 'true';
    closeAll();
    setExpanded(e.currentTarget, open);
  });
  qa('.uhf-nav-toggle, .uhf-allms-toggle').forEach((btn) => btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    closeSubs(btn);
    setExpanded(btn, open);
  }));

  const input = q('.uhf-search-input');
  const openSearch = () => {
    closeAll();
    header.classList.add('is-search');
    if (input) input.focus();
  };
  const closeSearch = (refocus) => {
    header.classList.remove('is-search');
    if (input) input.value = '';
    if (refocus && q('.uhf-search-btn')) q('.uhf-search-btn').focus();
  };
  on('.uhf-search-btn', 'click', (e) => {
    if (!header.classList.contains('is-search')) {
      e.preventDefault();
      openSearch();
    }
  });
  on('.uhf-search-cancel', 'click', () => closeSearch(true));
  on('.uhf-header-back', 'click', () => closeSearch(true));

  const panelFor = (btn) => document.getElementById(btn.getAttribute('aria-controls') || '');
  [q('.uhf-header-burger'), q('.uhf-header-catbtn')].filter(Boolean).forEach((btn) => btn.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || e.shiftKey || btn.getAttribute('aria-expanded') !== 'true') return;
    const first = [...panelFor(btn).querySelectorAll('a[href], button')].find((n) => n.offsetParent !== null);
    if (first) {
      e.preventDefault();
      first.focus();
    }
  }));

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (header.classList.contains('is-search')) {
      closeSearch(true);
      return;
    }
    const openSubs = qa('.uhf-nav-toggle[aria-expanded="true"], .uhf-allms-toggle[aria-expanded="true"]');
    const sub = openSubs.find((b) => b === document.activeElement
      || (panelFor(b) && panelFor(b).contains(document.activeElement))) || openSubs[0];
    if (sub) {
      setExpanded(sub, false);
      sub.focus();
      return;
    }
    const top = [q('.uhf-header-burger'), q('.uhf-header-catbtn'), q('.uhf-allms-btn')]
      .find((b) => b && b.getAttribute('aria-expanded') === 'true');
    closeAll();
    if (top) top.focus();
  });
  document.addEventListener('click', (e) => {
    if (header.contains(e.target)) return;
    closeAll();
    if (header.classList.contains('is-search')) closeSearch();
  });

  // me-control: the "Sign in" label exists only on the desktop header (live removes it < 860)
  const meText = q('.uhf-me-text');
  const meTrigger = q('.uhf-me-trigger');
  if (meText && meTrigger) {
    const mq = window.matchMedia(MOBILE_UHF);
    const syncMe = () => {
      if (mq.matches && meText.isConnected) meText.remove();
      else if (!mq.matches && !meText.isConnected) meTrigger.insertBefore(meText, meTrigger.querySelector('.uhf-me-pic'));
    };
    syncMe();
    mq.addEventListener('change', syncMe);
  }

  const callout = document.getElementById('smcTeachingCalloutPopover');
  const dismiss = document.getElementById('teachingCalloutDismiss');
  if (callout && dismiss) {
    dismiss.addEventListener('click', (e) => {
      e.preventDefault();
      callout.classList.add('is-hidden');
    });
  }
}

/* ====================================================================== */

function chromeVariant() {
  const cls = document.documentElement.classList;
  if (cls.contains('chrome-bing')) return 'bing';
  if (cls.contains('chrome-support')) return 'support';
  return 'www';
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  if (block.querySelector('#uhf-header, #nav')) return; // re-entrant (EW9)
  const variant = chromeVariant();
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  const roles = classifySections(fragment);
  const builders = { www: buildWww, bing: buildBing, support: buildSupport };
  const { nodes, skipTarget } = builders[variant](roles);

  block.textContent = '';
  nodes.filter(Boolean).forEach((n) => block.append(n));
  // the skip link sits before the <header> landmark, as on the source
  const landmark = block.closest('header');
  if (skipTarget && landmark) landmark.before(skipTarget);

  // the skip link targets main: give main the authored id when it has none
  const main = document.querySelector('main');
  if (skipTarget && main && !main.id) {
    const target = (skipTarget.getAttribute('href') || '').slice(1);
    if (target) {
      main.id = target;
      main.tabIndex = -1;
    }
  }

  if (variant === 'bing') bindBing(block.querySelector('.common-nav'));
  else if (variant === 'support') bindSupport(block.querySelector('.uhf-header'));
  else bindWww(block.querySelector('.uhf-header'));
}
