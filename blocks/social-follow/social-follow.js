/**
 * social-follow — "Follow us:" subscription row + the page's back-to-top band
 * (reconstructive decode).
 *
 * Rows are classified by content:
 *   - a heading                 → the row title ("Follow us:")
 *   - an image (+ a link cell)  → one follow item: the image becomes the link's icon and the
 *                                 authored link text stays as its visually hidden label
 *   - an in-page link (#…) only → back-to-top band (MWF fixed-sticky: `.stuck` while its slot
 *                                 is below the fold on viewports > 540px, 1 s opacity fade)
 * Authored nodes are moved (EW1); the up glyph is presentational.
 */

const HEADINGS = 'h1, h2, h3, h4, h5, h6';
// px scrolled before the stuck bar fades in (live: hidden at 30, shown at 189)
const SHOW_AFTER = 100;

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function buildItem(row) {
  const li = el('li');
  const picture = row.querySelector('picture') || row.querySelector('img');
  const link = row.querySelector('a[href]');
  const holder = link && (link.closest('p') || link);
  if (!link) {
    if (picture) li.append(picture);
    return li;
  }
  // the authored link (and its paragraph) is kept; the image becomes its icon and the
  // link text its visually hidden label
  const img = picture && (picture.matches('img') ? picture : picture.querySelector('img'));
  const label = link.textContent.trim() || (img && img.alt) || '';
  const text = el('span', 'social-follow-label');
  text.append(...link.childNodes);
  link.classList.add('social-follow-link');
  link.removeAttribute('title');
  if (label) link.setAttribute('aria-label', label);
  if (picture) link.append(picture);
  link.append(text);
  if (holder !== link) holder.classList.add('social-follow-item');
  li.append(holder);
  return li;
}

function stick(band) {
  const bar = band.querySelector('.social-follow-top-bar');
  const update = () => {
    const below = band.getBoundingClientRect().top + bar.offsetHeight > window.innerHeight;
    const stuck = below && window.innerWidth > 540;
    bar.classList.toggle('stuck', stuck);
    bar.style.opacity = !stuck || window.scrollY > SHOW_AFTER ? '1' : '0';
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  // the section is still hidden while it decorates: re-evaluate once the page lays out / grows
  if (window.ResizeObserver) new ResizeObserver(update).observe(document.body);
  const link = bar.querySelector('a');
  if (link) {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const skip = document.querySelector('.uhf-skip-link, header a[href^="#"]');
      if (skip) skip.focus({ preventScroll: true });
    });
  }
}

function buildTop(row) {
  const band = el('div', 'social-follow-top');
  const bar = el('div', 'social-follow-top-bar');
  const link = row.querySelector('a[href]');
  const holder = link.closest('p') || link;
  link.classList.add('social-follow-top-btn');
  link.removeAttribute('title');
  const text = el('span');
  text.append(...link.childNodes);
  link.append(el('span', 'social-follow-glyph-up', { 'aria-hidden': 'true' }), text);
  if (holder !== link) holder.classList.add('social-follow-top-holder');
  bar.append(holder);
  band.append(bar);
  return band;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .container')) return;
  const container = el('div', 'container');
  const social = el('section', 'social-follow-row');
  const list = el('ul', 'social-follow-list');
  let title = null;
  let top = null;

  [...block.children].forEach((row) => {
    const heading = row.querySelector(HEADINGS);
    const hasImage = row.querySelector('picture, img');
    const links = [...row.querySelectorAll('a[href]')];
    if (heading && !hasImage) {
      heading.classList.add('social-follow-title');
      title = heading;
    } else if (hasImage) {
      list.append(buildItem(row));
    } else if (links.length === 1 && links[0].getAttribute('href').startsWith('#')) {
      top = buildTop(row);
    } else {
      [...row.children].forEach((cell) => social.append(...cell.childNodes));
    }
    row.remove();
  });

  if (title) {
    social.setAttribute('aria-label', list.querySelector('[aria-label]')?.getAttribute('aria-label')
      || title.textContent.trim());
    social.prepend(title);
  }
  if (list.children.length) social.append(list);
  container.append(social);
  block.append(container);
  if (top) {
    block.append(top);
    stick(top);
  }
}
