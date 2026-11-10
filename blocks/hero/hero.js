/**
 * hero — home hero (store-featured): background picture, h1, Personal/Business tabs; each tab panel
 * holds the chat-on-page prompt, a staggered promo carousel, quick links and a featured banner.
 * Reconstructive decode, rows classified by content (never by index):
 *   - row with an h1: [background picture] [h1]
 *   - row whose first cell is plain text: a tab — [label] [lede] [placeholder, optional input
 *     accessible name] [list of prompt pills]; every following row belongs to that tab's panel
 *   - row whose only content is a list: quick links — <li>[icon picture] <a title?>label</a></li>
 *   - row with a picture before the quick links: promo card — [picture] [optional logo picture,
 *     optional tag paragraph, heading, description, CTA link]
 *   - row with a picture after the quick links: featured banner — [picture] [heading, text, CTA];
 *     a bold run in the heading is the price slot
 * Authored nodes are moved (EW1); a link title becomes its aria-label (source accessible name).
 * Quick links render as role=link hosts (live store-secondary-nav-item custom elements, as the
 * gated prototype): the authored link text is moved in, its href drives click / Enter.
 * @ew-exempt tab labels and prompt pills are hosted by <button> (source controls are buttons);
 *   the placeholder / accessible-name paragraphs become input attributes (attribute-hosted).
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

function chev() {
  return el('span', 'hero-chev', { 'aria-hidden': 'true' });
}

function labelLink(a) {
  if (a.title) a.setAttribute('aria-label', a.title);
  else a.title = a.textContent.trim();
}

/** the authored image: a pipeline <picture>, or a bare <img> (raw authored HTML) */
const pictureOf = (node) => (node ? node.querySelector('picture') || node.querySelector('img') : null);

const linkOnly = (p) => {
  const a = p.querySelector('a');
  return a && !pictureOf(p) && p.textContent.trim() === a.textContent.trim();
};

function ctaFrom(p, variant) {
  p.className = 'hero-cta';
  const a = p.querySelector('a');
  a.className = `hero-btn hero-btn-${variant}`;
  labelLink(a);
  return p;
}

function sendArrow() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('fill', 'none');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', 'M2.7 2.6 17.3 10 2.7 17.4 5.2 10z M5.2 10h6');
  path.setAttribute('stroke', '#8a93a5');
  path.setAttribute('stroke-width', '1.2');
  path.setAttribute('stroke-linejoin', 'round');
  svg.append(path);
  const span = el('span', 'hero-arrow-glyph', { 'aria-hidden': 'true' });
  span.append(svg);
  return span;
}

function buildChat(cells) {
  const [, ledeCell, fieldCell, pillsCell] = cells;
  const chat = el('div', 'hero-chat');
  if (ledeCell) {
    [...ledeCell.children].forEach((p) => {
      p.classList.add('hero-lede');
      chat.append(p);
    });
  }
  chat.append(el('div', 'hero-chat-heading', { 'aria-hidden': 'true' }));
  const field = el('div', 'hero-input');
  const texts = fieldCell
    ? [...fieldCell.querySelectorAll('p')].map((p) => p.textContent.trim())
    : [];
  const [placeholder = '', accessibleName] = texts;
  const input = el('input', 'hero-text', { type: 'text' });
  if (placeholder) input.placeholder = placeholder;
  input.setAttribute('aria-label', accessibleName || placeholder);
  const submit = el('button', 'hero-submit', {
    type: 'button', 'aria-label': 'Send message', title: 'Send message',
  });
  submit.append(sendArrow());
  field.append(input, submit);
  chat.append(field);
  const pills = el('div', 'hero-pills');
  if (pillsCell) {
    pillsCell.querySelectorAll('li').forEach((li) => {
      const b = el('button', 'hero-ask', { type: 'button' });
      b.append(...li.childNodes);
      b.setAttribute('aria-label', `Ask about: ${b.textContent.trim()}`);
      pills.append(b);
    });
  }
  chat.append(pills);
  return chat;
}

function buildPromo(row) {
  const [mediaCell, bodyCell] = [...row.children];
  const li = el('li', 'hero-promo');
  const media = el('div', 'hero-promo-media');
  const pic = pictureOf(mediaCell);
  if (pic) media.append(pic);
  const body = el('div', 'hero-promo-body');
  const head = el('div', 'hero-promo-head');
  let seenHeading = false;
  [...(bodyCell || mediaCell).children].forEach((node) => {
    if (/^H[1-6]$/.test(node.tagName)) {
      seenHeading = true;
      // live renders card titles as role=heading hosts (store-carousel-item shadow DOM)
      const title = el('div', 'hero-promo-title', {
        role: 'heading', 'aria-level': node.tagName.slice(1),
      });
      title.append(...node.childNodes);
      const more = el('button', 'hero-readmore', { type: 'button', 'aria-expanded': 'false' });
      more.append(
        Object.assign(el('span', 'hero-readmore-more'), { textContent: 'Read more' }),
        Object.assign(el('span', 'hero-readmore-less'), { textContent: 'Read less' }),
        chev(),
      );
      more.addEventListener('click', () => {
        const open = more.getAttribute('aria-expanded') !== 'true';
        more.setAttribute('aria-expanded', String(open));
        li.classList.toggle('is-open', open);
      });
      head.append(title, more);
      body.append(head);
    } else if (pictureOf(node) && !seenHeading) {
      node.className = 'hero-promo-logo';
      body.append(node);
    } else if (node.tagName === 'P' && linkOnly(node)) {
      body.append(ctaFrom(node, 'light'));
    } else if (!seenHeading) {
      node.className = 'hero-tag';
      body.append(node);
    } else {
      node.classList.add('hero-promo-desc');
      body.append(node);
    }
  });
  li.append(media, body);
  return li;
}

function buildBanner(row) {
  const [mediaCell, bodyCell] = [...row.children];
  const wrap = el('div', 'hero-featured');
  const article = el('article', 'hero-banner');
  const media = el('div', 'hero-banner-media');
  const pic = pictureOf(mediaCell);
  if (pic) media.append(pic);
  const body = el('div', 'hero-banner-body');
  const text = el('div', 'hero-banner-text');
  const ctas = [];
  [...(bodyCell || mediaCell).children].forEach((node) => {
    if (node.tagName === 'P' && linkOnly(node)) {
      ctas.push(ctaFrom(node, 'primary'));
      return;
    }
    // a bold run inside the heading is the live price slot (store-price), weight inherited
    node.querySelectorAll(':scope:is(h1, h2, h3, h4) > strong').forEach((b) => {
      b.classList.add('hero-price');
    });
    text.append(node);
  });
  body.append(text, ...ctas);
  article.append(media, body);
  wrap.append(article);
  return wrap;
}

function buildQuicklinks(row) {
  const nav = el('nav', 'hero-quicklinks', { 'aria-label': 'product categories' });
  nav.append(Object.assign(el('span', 'sr-only'), { textContent: 'Secondary Nav' }));
  row.querySelectorAll('li').forEach((li) => {
    const a = li.querySelector('a');
    if (!a) return;
    const { href } = a;
    const item = el('div', 'hero-quicklink', {
      role: 'link',
      tabindex: '0',
      'aria-label': a.title || a.textContent.trim(),
      'data-href': href,
    });
    const icon = el('span', 'hero-quicklink-icon', { role: 'presentation', 'aria-hidden': 'true' });
    const pic = pictureOf(li);
    if (pic) icon.append(pic);
    const label = el('span', 'hero-quicklink-label');
    label.append(...a.childNodes);
    item.append(icon, label);
    const go = () => {
      window.location.href = href;
    };
    item.addEventListener('click', go);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') go();
    });
    nav.append(item);
  });
  return nav;
}

function wireCarousel(carousel) {
  const track = carousel.querySelector('.hero-track');
  const items = [...track.children];
  const prev = carousel.querySelector('.hero-arrow-prev');
  const next = carousel.querySelector('.hero-arrow-next');
  let idx = 0;
  const step = () => (items.length < 2 ? 0 : items[1].offsetLeft - items[0].offsetLeft);
  const go = (i) => {
    idx = Math.max(0, Math.min(i, items.length - 1));
    track.style.transform = `translateX(${-idx * step()}px)`;
    prev.disabled = idx === 0;
    next.disabled = idx >= items.length - 1;
  };
  prev.addEventListener('click', () => go(idx - 1));
  next.addEventListener('click', () => go(idx + 1));
  next.disabled = items.length < 2;
}

function buildCarousel(promos) {
  const carousel = el('div', 'hero-carousel', { 'data-autoplay': '7000' });
  const viewport = el('div', 'hero-viewport');
  const track = el('ul', 'hero-track', { role: 'list' });
  track.append(...promos);
  viewport.append(track);
  const controls = el('div', 'hero-controls');
  const prev = el('button', 'hero-arrow hero-arrow-prev', { type: 'button', 'aria-label': 'Previous' });
  prev.disabled = true;
  const next = el('button', 'hero-arrow hero-arrow-next', { type: 'button', 'aria-label': 'Next' });
  controls.append(prev, next);
  carousel.append(viewport, controls);
  wireCarousel(carousel);
  return carousel;
}

function wireTabs(tabs, panels, select) {
  const selectLabel = select.querySelector('.hero-select-label');
  let current = tabs[0];
  const activate = (tab) => {
    if (tab === current) return;
    current = tab;
    tabs.forEach((t, i) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
      if (on) {
        panels[i].classList.remove('is-entering');
        // restart the entrance animation
        panels[i].getBoundingClientRect();
        panels[i].classList.add('is-entering');
      }
    });
    selectLabel.dataset.label = tab.textContent;
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => activate(t));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      activate(n);
      n.focus();
    });
  });
  select.addEventListener('click', () => {
    activate(tabs[(tabs.indexOf(current) + 1) % tabs.length]);
  });
}

export default function decorate(block) {
  if (block.querySelector(':scope > .hero-inner')) return;
  const rows = [...block.children];
  const media = el('div', 'hero-media');
  const inner = el('div', 'hero-inner');
  const tabsEl = el('div', 'hero-tabs');
  const tablist = el('div', 'hero-tablist', { role: 'tablist' });
  const select = el('button', 'hero-select', { type: 'button', 'aria-hidden': 'true', tabindex: '-1' });
  select.append(el('span', 'hero-select-label'), chev());
  const tabs = [];
  const panels = [];
  let panel = null;
  let promos = [];
  let afterLinks = false;

  const flushPromos = () => {
    if (panel && promos.length) {
      const before = panel.querySelector('.hero-quicklinks, .hero-featured');
      panel.insertBefore(buildCarousel(promos), before);
    }
    promos = [];
  };
  const openPanel = (labelCell) => {
    flushPromos();
    const label = labelCell ? labelCell.textContent.trim() : 'Personal';
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const first = !tabs.length;
    const wrap = el('div', 'hero-tab', { 'aria-label': `${key}-tab` });
    const tab = el('button', 'hero-pill', {
      role: 'tab',
      id: `hero-tab-${key}`,
      'aria-selected': String(first),
      'aria-controls': `${key}-tab`,
    });
    if (labelCell) tab.append(...(labelCell.querySelector('p') || labelCell).childNodes);
    else tab.textContent = label;
    if (!first) tab.tabIndex = -1;
    wrap.append(tab);
    tablist.append(wrap);
    tabs.push(tab);
    panel = el('div', 'hero-panel', {
      role: 'tabpanel', id: `${key}-tab`, 'aria-labelledby': `hero-tab-${key}`,
    });
    panel.hidden = !first;
    panels.push(panel);
    afterLinks = false;
  };

  rows.forEach((row) => {
    const cells = [...row.children];
    const h1 = row.querySelector('h1');
    const firstCell = cells[0];
    if (h1) {
      const pic = pictureOf(row);
      if (pic) {
        const img = pic.tagName === 'IMG' ? pic : pic.querySelector('img');
        if (img) {
          img.loading = 'eager';
          img.setAttribute('fetchpriority', 'high');
        }
        media.append(pic);
      }
      h1.classList.add('hero-title');
      inner.prepend(h1);
      return;
    }
    // a tab label: plain text, bare or in one paragraph (DA wraps bare cell text in <p>)
    const plainFirst = firstCell && firstCell.children.length <= 1
      && !firstCell.querySelector('picture, img, a, h1, h2, h3, h4, h5, h6, ul, ol')
      && firstCell.textContent.trim();
    if (cells.length > 1 && plainFirst) {
      openPanel(firstCell);
      panel.append(buildChat(cells));
      return;
    }
    if (!panel) openPanel(null);
    const single = cells.length === 1 && firstCell.children.length === 1;
    const only = single ? firstCell.firstElementChild : null;
    if (only && /^[UO]L$/.test(only.tagName)) {
      flushPromos();
      panel.append(buildQuicklinks(row));
      afterLinks = true;
      return;
    }
    if (!pictureOf(row)) return;
    if (afterLinks) panel.append(buildBanner(row));
    else promos.push(buildPromo(row));
  });
  flushPromos();

  if (tabs.length) select.querySelector('.hero-select-label').dataset.label = tabs[0].textContent;
  tabsEl.append(tablist, select, ...panels);
  inner.append(tabsEl);
  if (tabs.length) wireTabs(tabs, panels, select);
  block.replaceChildren(media, inner);
}
