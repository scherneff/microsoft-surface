/**
 * support-cards — support.microsoft.com home card groups (reconstructive decode).
 *
 * Variants: `products` (inline logo cards), `features` (image cards), `groups`
 * (banner card with a heading and a list of section links).
 * Rows are classified by content, never by position:
 *   - no image + a heading  → block head (h1 / h2, moved above the grid)
 *   - no image, no heading  → block foot (e.g. "More Microsoft products" link)
 *   - an image              → one card (cell 1 image, cell 2 text)
 * Card-as-link: the heading's anchor is read for its href and unwrapped (EW6);
 * all authored nodes are moved, never rebuilt (EW1).
 */

const HEADINGS = 'h1, h2, h3, h4, h5, h6';

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

/** Unwraps the first anchor inside `node` and returns its href ('' when none). */
function unwrapLink(node) {
  const a = node.querySelector('a[href]');
  if (!a) return '';
  const { href } = a;
  a.replaceWith(...a.childNodes);
  return href;
}

function cardLink(href, className, label) {
  const a = el('a', className);
  if (href) a.href = href;
  if (label) a.setAttribute('aria-label', label);
  return a;
}

/** Moves every remaining element child of `cell` into `target`. */
function moveRest(cell, target) {
  [...cell.children].forEach((child) => {
    if (child.matches('p') && !child.textContent.trim() && !child.querySelector('img')) return;
    target.append(child);
  });
}

function buildProduct(media, body) {
  const heading = body.querySelector(HEADINGS);
  const href = heading ? unwrapLink(heading) : unwrapLink(body);
  const label = heading ? heading.textContent : '';
  const card = cardLink(href, 'support-cards-card support-cards-inline', label);
  const row = el('div', 'support-cards-row');
  const icon = el('div', 'support-cards-icon');
  const textBox = el('div', 'support-cards-text');
  const picture = media && media.querySelector('picture, img');
  if (picture) icon.append(picture);
  moveRest(body, textBox);
  row.append(icon, textBox);
  card.append(row);
  return card;
}

function buildFeature(media, body) {
  const heading = body.querySelector(HEADINGS);
  const href = heading ? unwrapLink(heading) : unwrapLink(body);
  const label = heading ? heading.textContent : '';
  const card = cardLink(href, 'support-cards-card support-cards-feature', label);
  const mediaBox = el('div', 'support-cards-media');
  const picture = media && media.querySelector('picture, img');
  if (picture) mediaBox.append(picture);
  card.append(mediaBox);
  moveRest(body, card);
  return card;
}

function buildGroup(media, body) {
  const card = el('div', 'support-cards-card support-cards-group');
  card.setAttribute('role', 'group');
  const banner = el('div', 'support-cards-banner');
  const picture = media && media.querySelector('picture, img');
  if (picture) banner.append(picture);
  card.append(banner);

  let pendingIcon = null;
  let first = true;
  [...body.children].forEach((child) => {
    const isIcon = child.matches('p') && child.querySelector('picture, img')
      && !child.textContent.trim();
    if (isIcon) {
      pendingIcon = child.querySelector('picture, img');
      return;
    }
    const link = child.querySelector('a[href]');
    if (first && child.matches(HEADINGS) && !link) {
      const head = el('div', 'support-cards-heading');
      head.append(child);
      card.append(head);
      first = false;
      return;
    }
    first = false;
    if (link) {
      const a = cardLink(unwrapLink(child), 'support-cards-link');
      const row = el('div', 'support-cards-row');
      const icon = el('div', 'support-cards-icon');
      const textBox = el('div', 'support-cards-text');
      if (pendingIcon) icon.append(pendingIcon);
      pendingIcon = null;
      textBox.append(child);
      row.append(icon, textBox);
      a.append(row);
      card.append(a);
      return;
    }
    card.append(child);
  });
  return card;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .support-cards-grid')) return;
  let variant = 'groups';
  if (block.classList.contains('products')) variant = 'products';
  else if (block.classList.contains('features')) variant = 'features';
  if (variant === 'groups') block.classList.add('groups');

  const head = el('div', 'support-cards-head');
  const grid = el('div', 'support-cards-grid');
  const foot = el('div', 'support-cards-foot');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const hasImage = row.querySelector('picture, img');
    if (!hasImage) {
      const target = row.querySelector(HEADINGS) ? head : foot;
      cells.forEach((cell) => moveRest(cell, target));
      row.remove();
      return;
    }
    const media = cells.find((cell) => cell.querySelector('picture, img')
      && !cell.querySelector(HEADINGS)) || cells[0];
    const body = cells.find((cell) => cell !== media) || el('div');
    let card;
    if (variant === 'products') card = buildProduct(media, body);
    else if (variant === 'features') card = buildFeature(media, body);
    else card = buildGroup(media, body);
    // leftovers: anything still authored in the cells stays visible in the card
    cells.forEach((cell) => moveRest(cell, card));
    const col = el('div', 'support-cards-col');
    col.append(card);
    grid.append(col);
    row.remove();
  });

  if (grid.children.length === 3) grid.classList.add('support-cards-three');
  if (head.children.length) block.append(head);
  block.append(grid);
  if (foot.children.length) block.append(foot);
}
