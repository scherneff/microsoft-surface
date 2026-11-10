import { createOptimizedPicture } from '../../scripts/aem.js';

const VIDEO_RE = /\.(mp4|webm|mov)(\?|#|$)/i;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function isVideoLink(a) {
  return VIDEO_RE.test(a.href) || VIDEO_RE.test(a.textContent.trim());
}

function removeLink(a) {
  const parent = a.parentElement;
  a.remove();
  if (parent && parent.tagName === 'P' && !parent.textContent.trim() && !parent.children.length) {
    parent.remove();
  }
}

function buildVideo(src) {
  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', 'metadata');
  video.setAttribute('aria-hidden', 'true');
  const source = document.createElement('source');
  source.src = src;
  source.type = `video/${src.split('?')[0].split('.').pop()}`;
  video.append(source);
  return video;
}

function buildToggle(video) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'hero-product-toggle';
  const sync = () => {
    const { paused } = video;
    button.setAttribute('aria-label', paused ? 'Play background video' : 'Pause background video');
    button.dataset.state = paused ? 'paused' : 'playing';
  };
  button.addEventListener('click', () => {
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  });
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  sync();
  return button;
}

/**
 * Builds the media layer: poster picture with an optional muted background video.
 * Two video links are treated as desktop + mobile sources.
 */
function buildMedia(block) {
  const media = document.createElement('div');
  media.className = 'hero-product-media';

  const picture = block.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    // only same-origin (media bus) images can be re-optimized; external URLs keep their picture
    const sameOrigin = new URL(img.src, window.location.href).origin === window.location.origin;
    const optimized = sameOrigin
      ? createOptimizedPicture(img.src, img.alt, true, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ])
      : picture;
    if (sameOrigin) picture.replaceWith(optimized);
    else img.loading = 'eager';
    media.append(optimized);
  }

  const links = [...block.querySelectorAll('a[href]')].filter(isVideoLink);
  if (!links.length) return media;

  const [desktop, mobile] = links.map((a) => a.href);
  links.forEach(removeLink);
  const isDesktop = window.matchMedia('(min-width: 900px)').matches;
  const video = buildVideo(!isDesktop && mobile ? mobile : desktop);
  media.append(video, buildToggle(video));

  if (!reducedMotion.matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      });
    });
    observer.observe(block);
  }
  return media;
}

function buildContent(block) {
  const content = document.createElement('div');
  content.className = 'hero-product-content';
  const nodes = [...block.querySelectorAll(':scope > div > div')]
    .flatMap((cell) => [...cell.children])
    .filter((el) => el.textContent.trim() || el.querySelector('img, a'));
  content.append(...nodes);

  const children = [...content.children];
  const firstHeading = children.findIndex((el) => /^H[1-6]$/.test(el.tagName));

  // promo pill: a link-only paragraph before the first heading
  if (firstHeading > 0) {
    const promo = children.slice(0, firstHeading)
      .find((el) => el.tagName === 'P' && el.querySelector('a') && el.textContent.trim() === el.querySelector('a').textContent.trim());
    if (promo) {
      // the promo is a pill, not a CTA: drop the global button decoration
      promo.classList.remove('button-container');
      promo.querySelectorAll('a.button').forEach((a) => a.classList.remove('button'));
      promo.classList.add('hero-product-promo');
    }
  }

  // headings group: everything from the first heading to the last heading
  let lastHeading = -1;
  children.forEach((el, i) => { if (/^H[1-6]$/.test(el.tagName)) lastHeading = i; });
  if (firstHeading > -1) {
    const heading = document.createElement('div');
    heading.className = 'hero-product-heading';
    children[firstHeading].before(heading);
    heading.append(...children.slice(firstHeading, lastHeading + 1));
  }

  // after the headings: first plain paragraph is the lead; the rest form the buy bar
  const rest = children.slice(lastHeading + 1)
    .filter((el) => !el.classList.contains('hero-product-promo'));
  if (rest.length) {
    const body = document.createElement('div');
    body.className = 'hero-product-body';
    const [lead, ...buy] = rest;
    if (lead.querySelector('a') && buy.length === 0) {
      buy.push(lead);
    } else {
      lead.classList.add('hero-product-lead');
      body.append(lead);
    }
    if (buy.length) {
      const bar = document.createElement('div');
      bar.className = 'hero-product-buybar';
      buy.forEach((el) => {
        if (el.querySelector('a')) el.classList.add('hero-product-cta');
        bar.append(el);
      });
      body.append(bar);
    }
    content.append(body);
  }
  return content;
}

export default function decorate(block) {
  const media = buildMedia(block);
  const content = buildContent(block);
  block.replaceChildren(media, content);
}
