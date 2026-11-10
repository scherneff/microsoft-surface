/**
 * bing-panel — explore.microsoft.com "side by side" panel (image or video beside a heading
 * block). One row renders one panel; two or more rows render a slider (pager with
 * prev / next buttons and page dots, live's 1.5 s / 1 s page transitions).
 *
 * Rows: | media (picture, or a link to an .mp4) | text | options (optional) |
 * Text cell, by content: paragraphs before the heading = tag; heading; paragraphs = description;
 * a paragraph holding only a link = CTA (bold link = blue CTA); paragraphs after the CTA =
 * fine print.
 *
 * Decode tier: template-slotted panel (authored nodes moved into empty slots); reconstructive
 * over the rows (one page per row).
 *
 * @variants block: reversed | sixtyforty | gray | lightblue | features | compact
 * @variants options: rounded | rounded-block | yellow
 * @ew-exempt options cell — per-row style keywords (image frame radius, yellow tag), never shown
 * @ew-exempt video source link — the .mp4 link becomes the <video> source (code origin)
 */

const ARROW_PREV = '<svg width="1.33em" height="1.33em" viewBox="0 0 100 100" aria-hidden="true">'
  + '<path d="M19 50c0-1.708.61-3.172 1.83-4.392L64.608 1.83C65.828.61 67.292 0 69 0c.878 0 '
  + '1.696.17 2.452.512a6.618 6.618 0 0 1 1.977 1.355 6.618 6.618 0 0 1 1.354 1.976c.342.757'
  + '.513 1.574.513 2.453 0 1.66-.635 3.123-1.904 4.392L34.081 50l39.311 39.312c.635.634 1.11 '
  + '1.293 1.428 1.976.317.684.476 1.489.476 2.416 0 .879-.171 1.696-.513 2.453a6.618 6.618 0 '
  + '0 1-1.354 1.976 6.618 6.618 0 0 1-1.977 1.355A5.888 5.888 0 0 1 69 100c-1.708 0-3.172-.61'
  + '-4.392-1.83L20.83 54.392C19.61 53.172 19 51.708 19 50Z" fill="currentColor" '
  + 'fill-rule="evenodd"/></svg>';

const ARROW_NEXT = '<svg width="1.33em" height="1.33em" viewBox="0 0 100 100" aria-hidden="true">'
  + '<path d="M25 93.704c0-1.708.61-3.172 1.83-4.392L66.142 50 26.83 10.688C25.61 9.468 25 8.004 '
  + '25 6.296c0-1.708.598-3.185 1.794-4.43C27.989.623 29.466 0 31.223 0c1.708 0 3.172.61 4.392 '
  + '1.83l43.777 43.778c1.22 1.22 1.83 2.684 1.83 4.392 0 1.708-.61 3.172-1.83 4.392L35.615 '
  + '98.17c-1.22 1.22-2.684 1.83-4.392 1.83-1.757 0-3.234-.622-4.43-1.867C25.599 96.89 25 '
  + '95.413 25 93.704Z" fill="currentColor" fill-rule="evenodd"/></svg>';

let sliderCount = 0;

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v !== false && v !== undefined) node.setAttribute(k, v === true ? '' : v);
  });
  node.append(...children);
  return node;
}

/** Live's scroll reveal: [data-reveal] flips to "true" once the block enters the viewport. */
function reveal(block) {
  block.setAttribute('data-reveal', '');
  if (!('IntersectionObserver' in window)) {
    block.setAttribute('data-reveal', 'true');
    return;
  }
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    block.setAttribute('data-reveal', 'true');
    io.disconnect();
  }, { threshold: 0 });
  io.observe(block);
}

/** Live wraps heading copy in div > p; move the heading's own nodes into that wrapper. */
function wrapHeadingCopy(heading) {
  if (heading.querySelector(':scope > .heading-copy')) return;
  const p = document.createElement('p');
  p.append(...heading.childNodes);
  const div = document.createElement('div');
  div.className = 'heading-copy';
  div.append(p);
  heading.append(div);
}

function isLinkOnly(p) {
  const a = p.querySelector('a[href]');
  return !!a && p.textContent.trim() === a.textContent.trim() && !p.querySelector('img');
}

function buildMedia(cell, options, eager) {
  const media = el('div', { class: 'side-media', 'data-reveal-stagger': '0' });
  const video = [...cell.querySelectorAll('a[href]')].find((a) => /\.mp4(\?|#|$)/i.test(a.href));
  if (video) {
    const v = el('video', {
      class: 'media-video-player',
      muted: true,
      loop: true,
      autoplay: true,
      playsinline: true,
      preload: 'metadata',
      'aria-hidden': 'true',
      disablepictureinpicture: true,
    }, el('source', { src: video.getAttribute('href'), type: 'video/mp4' }));
    v.muted = true;
    v.defaultMuted = true;
    media.append(el('div', { class: 'media-video' }, v));
    return media;
  }
  const frameClass = ['media-frame'];
  if (options.has('rounded-block')) frameClass.push('rounded-block');
  else if (options.has('rounded')) frameClass.push('rounded');
  const frame = el('div', { class: frameClass.join(' ') });
  cell.querySelectorAll('picture, img').forEach((pic) => {
    if (pic.tagName === 'IMG' && pic.closest('picture')) return;
    frame.append(pic);
  });
  if (eager) frame.querySelectorAll('img').forEach((img) => img.setAttribute('loading', 'eager'));
  media.append(frame);
  return media;
}

function buildHeading(cell, options) {
  const wrap = el('div', { class: 'side-heading' });
  const tag = el('div', { class: options.has('yellow') ? 'tag yellow' : 'tag' });
  const heading = el('div', { class: 'heading' });
  const title = el('div', { class: 'title' });
  const description = el('div', { class: 'description' });
  const actions = el('div', { class: 'actions' });
  const fineprint = el('div', { class: 'fineprint' });
  let seenHeading = false;
  let seenCta = false;
  [...cell.children].forEach((child) => {
    if (/^H[1-6]$/.test(child.tagName)) {
      seenHeading = true;
      wrapHeadingCopy(child);
      title.append(child);
    } else if (!seenHeading) {
      tag.append(child);
    } else if (child.tagName === 'P' && isLinkOnly(child)) {
      seenCta = true;
      const a = child.querySelector('a');
      if (a.closest('strong') || a.classList.contains('primary')) actions.classList.add('blue');
      a.classList.remove('button', 'primary', 'secondary', 'accent');
      child.classList.remove('button-wrapper');
      actions.append(child);
    } else if (seenCta) {
      fineprint.append(child);
    } else {
      description.append(child);
    }
  });
  if (tag.childElementCount) wrap.append(tag);
  heading.append(title);
  if (description.childElementCount) heading.append(description);
  wrap.append(heading);
  if (actions.childElementCount) wrap.append(actions);
  if (fineprint.childElementCount) wrap.append(fineprint);
  return wrap;
}

function buildPanel(row, classes, eager) {
  const [mediaCell, textCell, optCell] = [...row.children];
  const options = new Set((optCell ? optCell.textContent : '').toLowerCase().split(/[\s,]+/));
  const side = el('div', { class: ['block-side-by-side', ...classes].join(' ') });
  side.append(buildMedia(mediaCell, options, eager));
  if (textCell) side.append(buildHeading(textCell, options));
  return side;
}

function wireSlider(frame, pages, dots) {
  let index = 0;
  const go = (i) => {
    index = (i + pages.length) % pages.length;
    pages.forEach((p, n) => {
      // live: the next page waits on the right, every other page on the left
      const d = (n - index + pages.length) % pages.length;
      p.classList.toggle('active', d === 0);
      p.classList.toggle('after', d === 1);
      p.classList.toggle('before', d > 1);
      p.setAttribute('aria-hidden', String(n !== index));
    });
    dots.forEach((d, n) => {
      if (n === index) d.setAttribute('aria-selected', 'true');
      else d.removeAttribute('aria-selected');
    });
  };
  frame.querySelector('.pager-prev').addEventListener('click', () => go(index - 1));
  frame.querySelector('.pager-next').addEventListener('click', () => go(index + 1));
  dots.forEach((d, n) => d.addEventListener('click', () => go(n)));
  go(0);
}

export default function decorate(block) {
  if (block.querySelector(':scope > .panel-frame')) return;
  const rows = [...block.children];
  const classes = ['reversed', 'sixtyforty'].filter((c) => block.classList.contains(c));
  const inner = block.classList.contains('gray') || block.classList.contains('lightblue');
  const features = block.classList.contains('features');
  const slider = rows.length > 1;

  const frameClass = ['panel-frame'];
  if (inner && !features) frameClass.push('padded');
  if (slider) frameClass.push('slider-outer');
  const frame = el('div', { class: frameClass.join(' '), 'data-reveal-inner': true });
  if (inner) frame.append(el('div', { class: 'panel-bg' }));
  const content = el('div', { class: 'panel-content' });
  frame.append(content);

  if (!slider) {
    if (rows[0]) content.append(buildPanel(rows[0], classes, false));
  } else {
    sliderCount += 1;
    const id = `bing-slider-${sliderCount}`;
    const pagesEl = el('div', { class: 'pages' });
    const pages = rows.map((row, n) => {
      const page = el('div', {
        class: 'page',
        id: `${id}-p${n + 1}`,
        role: 'tabpanel',
        'aria-roledescription': 'slide',
      }, buildPanel(row, classes, true));
      pagesEl.append(page);
      return page;
    });
    const prev = el('button', { type: 'button', class: 'pager-button pager-prev', 'aria-label': 'Previous' });
    prev.innerHTML = `<span class="arrow-button">${ARROW_PREV}</span>`;
    const next = el('button', { type: 'button', class: 'pager-button pager-next', 'aria-label': 'Next' });
    next.innerHTML = `<span class="arrow-button">${ARROW_NEXT}</span>`;
    content.append(el('div', { class: 'slider' }, el('div', { class: 'pager' }, pagesEl, prev, next)));
    const dots = pages.map((p, n) => el('button', {
      type: 'button',
      class: 'selector',
      role: 'tab',
      'aria-label': `Page ${n + 1}`,
      'aria-controls': p.id,
    }));
    frame.append(el('div', { class: 'selectors', role: 'tablist' }, ...dots));
    wireSlider(frame, pages, dots);
  }

  block.replaceChildren(frame);
  reveal(block);
}
