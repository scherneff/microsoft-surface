// media query match that indicates desktop width
const isDesktop = window.matchMedia('(width >= 900px)');

const SEARCH_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M9.5 1a5.5 5.5 0 1 1-3.55 9.7l-4.1 4.15a.5.5 0 0 1-.7-.7l4.1-4.15A5.5 5.5 0 0 1 9.5 1Zm0 1a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"/></svg>';

/**
 * Fetches the nav fragment (metadata-independent):
 * /content/nav.plain.html (local preview) first, then /nav.plain.html (DA/EDS).
 * @returns {Promise<HTMLElement|null>} wrapper holding the fragment's section divs
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();
  // fragment image paths are relative to the fragment, not to the current page
  wrapper.querySelectorAll('img[src]').forEach((img) => {
    img.setAttribute('src', new URL(img.getAttribute('src'), resp.url).href);
  });
  return wrapper;
}

/** First direct text/label of a list item (text in a <p>, a link, or a bare text node) */
function itemLabelNode(li) {
  const first = [...li.childNodes].find((n) => (
    n.nodeType === Node.ELEMENT_NODE ? n.tagName !== 'UL' : n.textContent.trim()
  ));
  if (!first) return null;
  if (first.nodeType === Node.TEXT_NODE) return first;
  return first.tagName === 'P' ? (first.querySelector('a') || first) : first;
}

function itemLink(li) {
  const node = itemLabelNode(li);
  return node && node.tagName === 'A' ? node : null;
}

function itemText(li) {
  const node = itemLabelNode(li);
  return node ? node.textContent.trim() : '';
}

function subList(li) {
  return li.querySelector(':scope > ul');
}

function chevron() {
  const span = document.createElement('span');
  span.className = 'nav-chevron';
  span.setAttribute('aria-hidden', 'true');
  return span;
}

function createLink(a, className) {
  const link = document.createElement('a');
  link.href = a.getAttribute('href');
  link.textContent = a.textContent.trim();
  if (className) link.className = className;
  return link;
}

/** Plain link list built from a fragment <ul> */
function buildLinkList(sourceUl, className) {
  const list = document.createElement('ul');
  list.className = className;
  [...sourceUl.children].forEach((li) => {
    const a = itemLink(li);
    if (!a) return;
    const item = document.createElement('li');
    item.append(createLink(a));
    list.append(item);
  });
  return list;
}

/* ---------- dropdown open/close ---------- */

function closeAllDropdowns(nav, except = null) {
  nav.querySelectorAll('.nav-drop-trigger[aria-expanded="true"]').forEach((btn) => {
    if (btn === except) return;
    btn.setAttribute('aria-expanded', 'false');
    btn.closest('.nav-drop').classList.remove('is-open');
  });
}

function setContextualOpen(nav, open) {
  nav.classList.toggle('ctx-open', open);
  const toggle = nav.querySelector('.nav-ctx-toggle');
  if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function toggleDropdown(nav, btn) {
  const open = btn.getAttribute('aria-expanded') !== 'true';
  const item = btn.closest('.nav-drop');
  if (isDesktop.matches) {
    closeAllDropdowns(nav, btn);
  } else if (item.classList.contains('nav-mega')) {
    // mobile: the hamburger (All Microsoft) and the contextual menu are mutually exclusive
    setContextualOpen(nav, false);
  }
  // mobile accordions (contextual items) expand independently, like the source
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  item.classList.toggle('is-open', open);
}

/** A dropdown item: trigger button + panel */
function buildDrop(label, panel, extraClass) {
  const item = document.createElement('li');
  item.className = `nav-drop ${extraClass || ''}`.trim();
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-item nav-drop-trigger';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-haspopup', 'true');
  const text = document.createElement('span');
  text.className = 'nav-drop-label';
  text.textContent = label;
  btn.append(text, chevron());
  panel.classList.add('nav-panel');
  item.append(btn, panel);
  return item;
}

/* ---------- sections ---------- */

function buildBrand(section) {
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  const links = [...section.querySelectorAll('a')];
  links.forEach((a, i) => {
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    const img = a.querySelector('img');
    if (img) {
      const logo = document.createElement('img');
      logo.src = img.getAttribute('src');
      logo.alt = img.getAttribute('alt') || '';
      logo.width = 108;
      logo.height = 23;
      link.append(logo);
      link.className = 'nav-logo';
    } else {
      link.textContent = a.textContent.trim();
      link.className = i === links.length - 1 ? 'nav-site-title' : 'nav-link';
    }
    brand.append(link);
  });
  return brand;
}

/**
 * Contextual nav. Items with a nested list become dropdowns, link items become links,
 * a trailing label-only item becomes the priority+ overflow ("More") menu.
 */
function buildSections(section) {
  const wrap = document.createElement('div');
  wrap.className = 'nav-sections';
  const list = document.createElement('ul');
  list.className = 'nav-list';
  const source = section.querySelector('ul');
  [...source.children].forEach((li) => {
    const sub = subList(li);
    const a = itemLink(li);
    if (sub) {
      list.append(buildDrop(itemText(li), buildLinkList(sub, 'nav-dropdown')));
    } else if (a) {
      const item = document.createElement('li');
      item.className = 'nav-entry';
      item.append(createLink(a, 'nav-item nav-link'));
      list.append(item);
    } else if (itemText(li)) {
      const menu = Object.assign(document.createElement('ul'), { className: 'nav-dropdown' });
      const overflow = buildDrop(itemText(li), menu, 'nav-overflow');
      overflow.hidden = true;
      list.append(overflow);
    }
  });
  wrap.append(list);
  return wrap;
}

/** Megamenu panel: leading links = top row, titled lists = columns, trailing links = footer */
function buildMegamenu(sub) {
  const panel = document.createElement('div');
  panel.className = 'nav-megamenu';
  const top = document.createElement('ul');
  top.className = 'nav-mega-top';
  const cols = document.createElement('div');
  cols.className = 'nav-mega-columns';
  const footer = document.createElement('div');
  footer.className = 'nav-mega-bottom';
  let seenColumn = false;
  [...sub.children].forEach((li) => {
    const nested = subList(li);
    if (nested) {
      seenColumn = true;
      const col = document.createElement('div');
      col.className = 'nav-mega-column';
      // a button so the column works as an accordion on mobile; styled as a title on desktop
      const title = document.createElement('button');
      title.type = 'button';
      title.className = 'nav-mega-title';
      title.setAttribute('aria-expanded', 'false');
      const label = document.createElement('span');
      label.textContent = itemText(li);
      title.append(label, chevron());
      title.addEventListener('click', () => {
        if (isDesktop.matches) return;
        const open = title.getAttribute('aria-expanded') !== 'true';
        title.setAttribute('aria-expanded', open ? 'true' : 'false');
        col.classList.toggle('is-open', open);
      });
      col.append(title, buildLinkList(nested, 'nav-mega-links'));
      cols.append(col);
      return;
    }
    const a = itemLink(li);
    if (!a) return;
    if (seenColumn) {
      footer.append(createLink(a));
    } else {
      const item = document.createElement('li');
      item.append(createLink(a));
      top.append(item);
    }
  });
  if (top.children.length) panel.append(top);
  panel.append(cols);
  if (footer.children.length) panel.append(footer);
  return panel;
}

function buildSearch(li, nav) {
  const a = itemLink(li);
  const labels = [...(subList(li)?.children || [])].map((x) => x.textContent.trim());
  const [placeholder, cancelLabel] = labels;
  const item = document.createElement('li');
  item.className = 'nav-search';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-item nav-search-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', placeholder || a.textContent.trim());
  toggle.innerHTML = `<span class="nav-search-label"></span>${SEARCH_ICON}`;
  toggle.querySelector('.nav-search-label').textContent = a.textContent.trim();

  const form = document.createElement('form');
  form.className = 'nav-search-form';
  form.action = a.getAttribute('href');
  form.method = 'get';
  form.setAttribute('role', 'search');
  const label = document.createElement('label');
  label.className = 'nav-search-sr';
  label.textContent = placeholder || a.textContent.trim();
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = placeholder || '';
  input.autocomplete = 'off';
  const id = 'nav-search-input';
  input.id = id;
  label.htmlFor = id;
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'nav-search-submit';
  submit.setAttribute('aria-label', a.textContent.trim());
  submit.innerHTML = SEARCH_ICON;
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'nav-search-cancel';
  cancel.setAttribute('aria-label', cancelLabel || 'Cancel');
  // visible text on desktop; a back arrow (CSS) on mobile
  const cancelText = document.createElement('span');
  cancelText.className = 'nav-search-cancel-label';
  cancelText.textContent = cancelLabel || 'Cancel';
  cancel.append(cancelText);
  form.append(label, input, submit, cancel);

  const setOpen = (open) => {
    nav.classList.toggle('search-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      closeAllDropdowns(nav);
      input.focus();
    } else {
      toggle.focus();
    }
  };
  toggle.addEventListener('click', () => setOpen(true));
  cancel.addEventListener('click', () => setOpen(false));
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  item.append(toggle);
  nav.append(form);
  return item;
}

function buildAccount(li) {
  const a = itemLink(li);
  const initials = subList(li)?.textContent.trim();
  const item = document.createElement('li');
  item.className = 'nav-account';
  const link = createLink(a, 'nav-item nav-account-link');
  link.textContent = '';
  const label = document.createElement('span');
  label.className = 'nav-account-label';
  label.textContent = a.textContent.trim();
  link.append(label);
  if (initials) {
    const avatar = document.createElement('span');
    avatar.className = 'nav-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = initials;
    link.append(avatar);
  }
  item.append(link);
  return item;
}

/** Tools: megamenu (item with titled sub-lists), search (link + labels), account (link) */
function buildTools(section, nav) {
  const wrap = document.createElement('div');
  wrap.className = 'nav-tools';
  const list = document.createElement('ul');
  list.className = 'nav-tools-list';
  const items = [...section.querySelector('ul').children];
  items.forEach((li, i) => {
    const sub = subList(li);
    if (sub && sub.querySelector(':scope > li > ul')) {
      // the megamenu item doubles as the mobile hamburger
      list.append(buildDrop(itemText(li), buildMegamenu(sub), 'nav-mega nav-hamburger'));
    } else if (sub && itemLink(li) && i < items.length - 1) {
      list.append(buildSearch(li, nav));
    } else if (itemLink(li)) {
      list.append(buildAccount(li));
    }
  });
  wrap.append(list);
  return wrap;
}

/* ---------- mobile ---------- */

/** Mobile-only entries (fragment section 4) go first in the contextual menu, hidden on desktop */
function prependMobileOnly(navSections, section) {
  const list = navSections.querySelector('.nav-list');
  [...section.querySelectorAll('a')].reverse().forEach((a) => {
    const item = document.createElement('li');
    item.className = 'nav-entry nav-mobile-only';
    item.append(createLink(a, 'nav-item nav-link'));
    list.prepend(item);
  });
}

/** Mobile row 2: the site title becomes the toggle for the contextual menu */
function buildContextualToggle(nav) {
  const title = nav.querySelector('.nav-site-title');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-ctx-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'nav-sections');
  const label = document.createElement('span');
  label.textContent = title ? title.textContent : '';
  toggle.append(label, chevron());
  nav.querySelector('.nav-sections').id = 'nav-sections';
  toggle.addEventListener('click', () => {
    const open = !nav.classList.contains('ctx-open');
    closeAllDropdowns(nav);
    setContextualOpen(nav, open);
  });
  return toggle;
}

/* ---------- priority+ overflow ---------- */

function updateOverflow(nav) {
  const list = nav.querySelector('.nav-list');
  const overflow = list?.querySelector('.nav-overflow');
  if (!overflow) return;
  const menu = overflow.querySelector('.nav-dropdown');
  // restore every item to the bar
  [...menu.querySelectorAll(':scope > li[data-overflow-origin]')].forEach((li) => {
    const origin = list.querySelector(`:scope > li[data-overflow-slot="${li.dataset.overflowOrigin}"]`);
    if (origin) origin.replaceWith(li);
  });
  [...list.querySelectorAll(':scope > li')].forEach((li) => {
    li.hidden = li === overflow;
    delete li.dataset.overflowOrigin;
  });
  if (!isDesktop.matches) return;

  const sections = nav.querySelector('.nav-sections');
  // the list is laid out at its natural (max-content) width, so compare it to the space available
  const fits = () => list.getBoundingClientRect().width
    <= sections.getBoundingClientRect().width + 1;
  const movable = [...list.querySelectorAll(':scope > li')]
    .filter((li) => li !== overflow && !li.classList.contains('nav-mobile-only'));
  // like the source (UHF), everything stays in the bar only if it fits together with the
  // overflow trigger; otherwise items move into the overflow menu from the end
  overflow.hidden = false;
  if (fits()) {
    overflow.hidden = true;
    return;
  }
  for (let i = movable.length - 1; i >= 0 && !fits(); i -= 1) {
    const li = movable[i];
    const slot = document.createElement('li');
    slot.hidden = true;
    slot.dataset.overflowSlot = String(i);
    li.dataset.overflowOrigin = String(i);
    li.replaceWith(slot);
    menu.prepend(li);
  }
}

/* ---------- block ---------- */

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;
  const sections = [...fragment.children].filter((el) => el.tagName === 'DIV');
  const [brandSection, navSection, toolsSection, mobileOnlySection] = sections;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');
  if (brandSection) nav.append(buildBrand(brandSection));
  if (navSection) {
    const navSections = buildSections(navSection);
    if (mobileOnlySection) prependMobileOnly(navSections, mobileOnlySection);
    nav.append(navSections);
    nav.append(buildContextualToggle(nav));
  }
  if (toolsSection) nav.append(buildTools(toolsSection, nav));

  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-drop-trigger');
    if (btn) toggleDropdown(nav, btn);
  });
  document.addEventListener('click', (e) => {
    if (nav.contains(e.target)) return;
    closeAllDropdowns(nav);
    setContextualOpen(nav, false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = nav.querySelector('.nav-drop-trigger[aria-expanded="true"]');
    if (open) {
      closeAllDropdowns(nav);
      open.focus();
    } else if (nav.classList.contains('ctx-open')) {
      setContextualOpen(nav, false);
      nav.querySelector('.nav-ctx-toggle').focus();
    }
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  // crossing the breakpoint: close every menu, reset mobile state, re-run desktop overflow
  const relayout = () => {
    closeAllDropdowns(nav);
    setContextualOpen(nav, false);
    nav.querySelectorAll('.nav-mega-column.is-open').forEach((col) => {
      col.classList.remove('is-open');
      col.querySelector('.nav-mega-title').setAttribute('aria-expanded', 'false');
    });
    nav.classList.remove('search-open');
    nav.querySelector('.nav-search-toggle')?.setAttribute('aria-expanded', 'false');
    updateOverflow(nav);
  };
  isDesktop.addEventListener('change', relayout);
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => updateOverflow(nav), 100);
  });
  requestAnimationFrame(() => updateOverflow(nav));
  document.fonts?.ready.then(() => updateOverflow(nav));
}
