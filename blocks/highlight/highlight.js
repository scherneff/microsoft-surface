/**
 * highlight — page hero: a full-bleed image with an overlaid white card
 * (MWF "highlight" module). Template-slotted decode.
 *
 * Authoring (cells are classified by content, never by position):
 *   - images: one picture, or two for art direction — the first is the wide
 *     crop (>= 1084px), the second the narrow crop (< 1084px)
 *   - the card: a heading (the page h1), body paragraphs, optional CTA
 *     paragraphs (a paragraph holding only a link)
 *
 * @variants block class: (none) — the about archetype's look; `backplate` — no card
 *   surface, light copy straight on the image (MWF highlight on a backplate); `band` — a
 *   mid-page backplate band (h2); `carousel` — every row is one slide (pictures cell + card
 *   cell), MWF highlight carousel: prev / next, slide tabs, autoplay with pause (stops
 *   for reduced motion, hover and focus)
 */

const isCta = (p) => p.tagName === 'P'
  && p.querySelector('a')
  && p.textContent.trim() === p.querySelector('a').textContent.trim();

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function buildOverlay(pictures, heading, paras, eager) {
  const overlay = document.createElement('div');
  overlay.className = 'highlight-overlay';
  const media = document.createElement('div');
  media.className = 'highlight-media';
  if (pictures.length > 1) {
    media.append(wrapNode(pictures[0], 'highlight-media-wide'));
    media.append(wrapNode(pictures[1], 'highlight-media-narrow'));
    pictures.slice(2).forEach((pic) => media.append(pic));
  } else if (pictures.length) {
    media.append(pictures[0]);
  }
  const lcp = media.querySelector('img');
  if (lcp && eager) lcp.loading = 'eager';

  const card = document.createElement('div');
  card.className = 'highlight-card';
  if (heading) card.append(wrapNode(heading, 'highlight-heading'));
  const text = document.createElement('div');
  text.className = 'highlight-text';
  const actions = document.createElement('div');
  actions.className = 'link-group';
  paras.forEach((p) => {
    if (isCta(p)) actions.append(p);
    else text.append(p);
  });
  if (text.children.length) card.append(text);
  if (actions.children.length) card.append(actions);

  const wrap = document.createElement('div');
  wrap.className = 'highlight-wrap';
  wrap.append(card);
  const container = document.createElement('div');
  container.className = 'container';
  container.append(wrap);
  const fg = document.createElement('div');
  fg.className = 'highlight-foreground';
  fg.append(container);

  overlay.append(media, fg);
  return overlay;
}

function flowOf(root) {
  return [...root.querySelectorAll('p, ul, ol')]
    .filter((el) => !el.querySelector('picture') && !el.closest('ul p, ol p'));
}

// live MWF autoplay-carousel: every 5 s; the first advance lands ~6.8 s after navigation start
// (carousel-state probe at 360: 6.8 / 11.9 / 16.6 / 21.9 s), so the rotation keeps that phase
const AUTOPLAY_MS = 5000;
const FIRST_ADVANCE_MS = 6800;
let carouselCount = 0;

function controlButton(className, label) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = className;
  btn.setAttribute('aria-label', label);
  return btn;
}

function buildCarousel(block) {
  carouselCount += 1;
  const id = `highlight-carousel-${carouselCount}`;
  const slides = [...block.children].map((row, i) => {
    const slide = document.createElement('section');
    slide.className = 'highlight-slide';
    slide.id = `${id}-slide-${i + 1}`;
    slide.setAttribute('aria-roledescription', 'slide');
    slide.append(buildOverlay(
      [...row.querySelectorAll('picture')],
      row.querySelector('h1, h2, h3'),
      flowOf(row),
      i === 0,
    ));
    return slide;
  });
  const total = slides.length;
  slides.forEach((s, i) => s.setAttribute('aria-label', `Slide ${i + 1} of ${total}`));

  const track = document.createElement('div');
  track.className = 'highlight-slides';
  track.append(...slides);

  const prev = controlButton('highlight-prev', 'Previous');
  const next = controlButton('highlight-next', 'Next');
  const pause = controlButton('highlight-pause', 'Pause');
  const tabs = document.createElement('div');
  tabs.className = 'highlight-tabs';
  tabs.setAttribute('role', 'tablist');
  const dots = slides.map((s, i) => {
    const dot = controlButton('highlight-dot', `Slide ${i + 1}`);
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-controls', s.id);
    tabs.append(dot);
    return dot;
  });
  const controls = document.createElement('div');
  controls.className = 'highlight-controls';
  controls.append(pause, prev, tabs, next);

  let current = 0;
  const show = (n) => {
    current = (n + total) % total;
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === current);
      s.setAttribute('aria-hidden', i === current ? 'false' : 'true');
      s.inert = i !== current;
    });
    dots.forEach((d, i) => d.setAttribute('aria-selected', i === current ? 'true' : 'false'));
  };

  let timer = null;
  let first = true;
  let paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stop = () => {
    clearTimeout(timer);
    clearInterval(timer);
    timer = null;
  };
  const start = () => {
    stop();
    if (paused || total < 2) return;
    const delay = first ? Math.max(1000, FIRST_ADVANCE_MS - performance.now()) : AUTOPLAY_MS;
    timer = setTimeout(() => {
      first = false;
      show(current + 1);
      timer = setInterval(() => show(current + 1), AUTOPLAY_MS);
    }, delay);
  };
  const setPaused = (value) => {
    paused = value;
    pause.classList.toggle('is-paused', paused);
    pause.setAttribute('aria-label', paused ? 'Play' : 'Pause');
    if (paused) stop();
    else start();
  };
  prev.addEventListener('click', () => {
    show(current - 1);
    start();
  });
  next.addEventListener('click', () => {
    show(current + 1);
    start();
  });
  dots.forEach((d, i) => d.addEventListener('click', () => {
    show(i);
    start();
  }));
  pause.addEventListener('click', () => setPaused(!paused));
  block.addEventListener('mouseenter', stop);
  block.addEventListener('mouseleave', start);
  block.addEventListener('focusin', stop);
  block.addEventListener('focusout', start);

  const stage = document.createElement('div');
  stage.className = 'highlight-stage';
  stage.append(track);
  block.setAttribute('aria-roledescription', 'carousel');
  block.replaceChildren(stage, controls);
  show(0);
  setPaused(paused);
}

export default function decorate(block) {
  if (block.querySelector(':scope > .highlight-overlay, :scope > .highlight-stage')) return;
  if (block.classList.contains('carousel')) {
    buildCarousel(block);
    return;
  }
  const pictures = [...block.querySelectorAll('picture')];
  const heading = block.querySelector('h1, h2, h3');
  const paras = flowOf(block);
  block.replaceChildren(buildOverlay(pictures, heading, paras, true));
}
