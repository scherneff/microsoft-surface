/**
 * article-listing — "Do more with Surface" article card filter (reconstructive decode).
 *
 * Rows are classified by content, never by position:
 *   - an image                      → one article card (cell 1 image; cell 2 read time,
 *                                     linked heading, description)
 *   - a heading, no image           → block head (title + optional search label paragraph)
 *   - a paragraph + a list          → category tabs (label, then one item per category;
 *                                     the item without a link is the current category)
 *   - a list of in-page (#) links   → pagination (items without a link are disabled,
 *                                     <strong> marks the current page)
 * Authored nodes are moved into the listing DOM (EW1); the search field, its button and the
 * live region are presentational widgets with no authored copy beyond the label.
 */

const HEADINGS = 'h1, h2, h3, h4, h5, h6';

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function svg(markup) {
  const tpl = document.createElement('template');
  tpl.innerHTML = markup;
  return tpl.content.firstElementChild;
}

const SEARCH_GLYPH = '<svg class="article-listing-glyph-search" width="21" height="20" '
  + 'viewBox="0 0 21 20" aria-hidden="true" focusable="false">'
  + '<circle cx="12.5" cy="8" r="6.25" fill="none" stroke="currentColor" stroke-width="1.5"/>'
  + '<path d="M8 12.5 2 18.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'
  + '</svg>';

function isHashList(row) {
  const links = [...row.querySelectorAll('li a[href]')];
  return links.length > 0 && links.every((a) => a.getAttribute('href').startsWith('#'));
}

function buildHead(row) {
  const head = el('div', 'article-listing-head');
  const heading = row.querySelector(HEADINGS);
  if (heading) {
    heading.classList.add('article-listing-title');
    head.append(heading);
  }
  const labelP = [...row.querySelectorAll('p')].find((p) => p.textContent.trim());
  const search = el('div', 'article-listing-search');
  const form = el('form', 'article-listing-search-form', { role: 'search' });
  const inputId = 'article-listing-search-input';
  const input = el('input', 'article-listing-search-input', { type: 'search', id: inputId });
  const button = el('button', 'article-listing-search-btn', { type: 'submit' });
  if (labelP) {
    // the authored paragraph stays the field's (visually hidden) label (EW1)
    labelP.classList.add('article-listing-search-label');
    labelP.id = `${inputId}-label`;
    input.setAttribute('aria-labelledby', labelP.id);
    button.setAttribute('aria-labelledby', labelP.id);
    form.append(labelP);
  }
  button.append(svg(SEARCH_GLYPH));
  form.append(input, button);
  search.append(form);
  head.append(search);
  button.addEventListener('click', (e) => {
    e.preventDefault();
    search.classList.toggle('active-search');
    input.focus();
  });
  form.addEventListener('submit', (e) => e.preventDefault());
  return head;
}

function buildTabs(row) {
  const tabs = el('div', 'article-listing-tabs');
  const pill = el('div', 'article-listing-tabs-pill');
  const labelP = [...row.querySelectorAll('p')].find((p) => !p.closest('li'));
  if (labelP) {
    labelP.classList.add('article-listing-tabs-label');
    pill.append(labelP);
  }
  const list = row.querySelector('ul');
  list.classList.add('article-listing-tabs-list');
  [...list.children].forEach((li) => {
    // <strong> marks the current category (its link is the listing itself)
    const strong = li.querySelector('strong');
    if (strong) strong.replaceWith(...strong.childNodes);
    const link = li.querySelector('a[href]');
    const tab = link || li;
    tab.classList.add('article-listing-tab');
    tab.setAttribute('role', 'button');
    if (strong) {
      tab.classList.add('is-active');
      tab.setAttribute('aria-current', 'page');
    }
  });
  pill.append(list);
  tabs.append(pill);
  return tabs;
}

function buildCard(row) {
  const cells = [...row.children];
  const media = cells.find((c) => c.querySelector('picture, img')) || cells[0];
  const body = cells.find((c) => c !== media) || el('div');
  const item = el('li', 'article-listing-item');
  const card = el('div', 'article-listing-card');
  const picture = media.querySelector('picture') || media.querySelector('img');
  if (picture) card.append(picture);
  const wrap = el('div', 'article-listing-card-wrap');
  const inner = el('div', 'article-listing-card-body');
  const heading = body.querySelector(HEADINGS);
  let seenHeading = false;
  const desc = el('div', 'article-listing-card-desc');
  [...body.children].forEach((child) => {
    if (child === heading) {
      seenHeading = true;
      heading.classList.add('article-listing-card-title');
      const link = heading.querySelector('a[href]');
      if (link) {
        // card link wraps the heading like live (EW6: the authored anchor is reused)
        link.classList.add('article-listing-card-link');
        link.remove();
        heading.append(...link.childNodes);
        link.append(heading);
        inner.append(link);
      } else {
        inner.append(heading);
      }
      return;
    }
    if (!seenHeading) {
      child.classList.add('article-listing-card-read');
      inner.append(child);
      return;
    }
    desc.append(child);
  });
  if (desc.children.length) inner.append(desc);
  wrap.append(inner, el('div', 'article-listing-card-footer'));
  card.append(wrap);
  item.append(card);
  return item;
}

function buildPagination(row) {
  const nav = el('nav', 'article-listing-pagination', { 'aria-label': 'Search all articles' });
  const list = row.querySelector('ul');
  list.className = 'article-listing-pages';
  const items = [...list.children];
  let afterEllipsis = 0;
  items.forEach((li, i) => {
    li.classList.add('article-listing-page');
    const link = li.querySelector('a[href]');
    const strong = li.querySelector('strong');
    if (strong) {
      strong.replaceWith(...strong.childNodes);
      li.classList.add('is-active');
    }
    const first = i === 0;
    const last = i === items.length - 1;
    if (first) li.classList.add('article-listing-page-prev');
    else if (last) li.classList.add('article-listing-page-next');
    else li.classList.add('article-listing-page-num');
    if (link) {
      link.classList.add('article-listing-page-link');
      if (last) link.classList.add('article-listing-page-next-link');
      if (li.classList.contains('is-active')) link.setAttribute('aria-current', 'page');
    } else {
      li.classList.add('is-disabled');
      const span = el('span', 'article-listing-page-link');
      span.append(...li.childNodes);
      li.append(span);
      if (!first && !last) afterEllipsis = 1;
    }
    if (link && !first && !last && afterEllipsis) {
      // the number after the ellipsis is the last page; a second one is the xs last page
      li.classList.add(afterEllipsis === 1 ? 'article-listing-page-last' : 'article-listing-page-last-xs');
      afterEllipsis += 1;
    }
  });
  nav.append(list);
  return nav;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .article-listing-inner')) return;
  const section = el('section', 'article-listing-inner', { 'aria-label': 'Do more with Surface articles' });
  section.id = 'articlescards';
  const container = el('div', 'container');
  const cards = el('ul', 'article-listing-cards');
  let head = null;
  let tabs = null;
  let pagination = null;

  [...block.children].forEach((row) => {
    if (row.querySelector('picture, img')) {
      cards.append(buildCard(row));
    } else if (row.querySelector(HEADINGS)) {
      head = buildHead(row);
    } else if (row.querySelector('ul') && isHashList(row)) {
      pagination = buildPagination(row);
    } else if (row.querySelector('ul')) {
      tabs = buildTabs(row);
    } else {
      // unknown authored row: keep it visible inside the listing
      container.append(...[...row.children].flatMap((cell) => [...cell.childNodes]));
    }
    row.remove();
  });

  const heading = head && head.querySelector(HEADINGS);
  if (heading) section.setAttribute('aria-label', `${heading.textContent.trim()} articles`);
  [head, tabs, cards.children.length ? cards : null, pagination]
    .filter(Boolean)
    .forEach((part) => container.append(part));
  container.append(el('div', 'article-listing-announce', { role: 'status' }));
  section.append(container);
  block.append(section);
}
