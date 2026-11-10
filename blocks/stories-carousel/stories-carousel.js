/**
 * stories-carousel — home "featured products and announcements" slideshow (carousel-cardgrid of
 * store-card-banner slides) with previous / next and a play/pause control.
 * Reconstructive decode: one slide per row — [picture] [heading, text, CTA link paragraph].
 * Authored nodes are moved (EW1); a CTA link title becomes its aria-label.
 * Motion: auto-advances every 7 s (live carousel rotation), looping; the play/pause button stops
 * and restarts it; hover / focus inside pauses it; prefers-reduced-motion starts paused.
 */

const INTERVAL = 7000;

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

/** the authored image: a pipeline <picture>, or a bare <img> (raw authored HTML) */
const pictureOf = (node) => node.querySelector('picture') || node.querySelector('img');

const linkOnly = (p) => {
  const a = p.querySelector('a');
  return a && !pictureOf(p) && p.textContent.trim() === a.textContent.trim();
};

function buildSlide(row) {
  const cells = [...row.children];
  const pic = pictureOf(row);
  const bodyCell = cells.find((c) => !pictureOf(c)) || cells[cells.length - 1];
  const li = el('li', 'stories-carousel-item');
  const article = el('article', 'stories-carousel-banner');
  const media = el('div', 'stories-carousel-media');
  if (pic) media.append(pic);
  const body = el('div', 'stories-carousel-body');
  const text = el('div', 'stories-carousel-text');
  const ctas = [];
  [...bodyCell.children].forEach((node) => {
    if (node.tagName === 'P' && linkOnly(node)) {
      node.className = 'stories-carousel-cta';
      const a = node.querySelector('a');
      a.className = 'stories-carousel-btn';
      if (a.title) a.setAttribute('aria-label', a.title);
      else a.title = a.textContent.trim();
      ctas.push(node);
    } else if (!pictureOf(node)) {
      text.append(node);
    }
  });
  body.append(text, ...ctas);
  article.append(media, body);
  li.append(article);
  return li;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .stories-carousel-frame')) return;
  const slides = [...block.children].filter((r) => r.querySelector('picture, img, h1, h2, h3, p'))
    .map(buildSlide);
  const frame = el('div', 'stories-carousel-frame', { role: 'group' });
  const viewport = el('div', 'stories-carousel-viewport');
  const track = el('ul', 'stories-carousel-track', { role: 'list' });
  track.append(...slides);
  viewport.append(track);
  const controls = el('div', 'stories-carousel-controls');
  const prev = el('button', 'stories-carousel-arrow stories-carousel-prev', {
    type: 'button', 'aria-label': 'Previous Slide',
  });
  const next = el('button', 'stories-carousel-arrow stories-carousel-next', {
    type: 'button', 'aria-label': 'Next Slide',
  });
  const pp = el('button', 'stories-carousel-playpause', { type: 'button', 'aria-label': 'Pause' });
  pp.append(Object.assign(el('span', 'sr-only'), { textContent: 'Play/Pause' }));
  controls.append(prev, next);
  if (slides.length > 1) controls.append(pp);
  frame.append(viewport, controls);
  block.setAttribute('role', 'region');
  block.setAttribute(
    'aria-label',
    'featured products and announcements slideshow: navigate using the previous and next: navigate using the slide tabs',
  );
  block.replaceChildren(frame);

  let idx = 0;
  const step = () => (slides.length < 2 ? 0 : slides[1].offsetLeft - slides[0].offsetLeft);
  const go = (i) => {
    idx = Math.max(0, Math.min(i, slides.length - 1));
    track.style.transform = idx ? `translateX(${-idx * step()}px)` : '';
    prev.disabled = idx === 0;
    next.disabled = idx >= slides.length - 1;
  };
  go(0);

  let timer = null;
  let playing = false;
  let held = false;
  const stopTimer = () => {
    clearInterval(timer);
    timer = null;
  };
  const startTimer = () => {
    stopTimer();
    if (!playing || held || slides.length < 2) return;
    timer = setInterval(() => go(idx >= slides.length - 1 ? 0 : idx + 1), INTERVAL);
  };
  const setPlaying = (on) => {
    playing = on;
    pp.setAttribute('aria-label', on ? 'Pause' : 'Play');
    startTimer();
  };
  prev.addEventListener('click', () => {
    go(idx - 1);
    startTimer();
  });
  next.addEventListener('click', () => {
    go(idx + 1);
    startTimer();
  });
  pp.addEventListener('click', () => setPlaying(!playing));
  const hold = (on) => {
    held = on;
    startTimer();
  };
  viewport.addEventListener('mouseenter', () => hold(true));
  viewport.addEventListener('mouseleave', () => hold(false));
  viewport.addEventListener('focusin', () => hold(true));
  viewport.addEventListener('focusout', () => hold(false));
  // Approved prototype (archetype-index motion): live showed no idle auto-advance, so the slideshow
  // starts at the first slide and rotates only after Play is pressed (live label kept).
  window.addEventListener('resize', () => go(idx));
}
