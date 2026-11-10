import { createOptimizedPicture } from '../../scripts/aem.js';

const VIDEO_RE = /\.(mp4|webm|mov)(\?|#|$)/i;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const desktopMQ = window.matchMedia('(min-width: 900px)');

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
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', 'none');
  video.setAttribute('aria-hidden', 'true');
  const source = document.createElement('source');
  source.src = src;
  source.type = `video/${src.split('?')[0].split('.').pop()}`;
  video.append(source);
  return video;
}

function buildSlide(row, index) {
  const slide = document.createElement('li');
  slide.className = 'carousel-scroll-slide';
  slide.dataset.slideIndex = index;

  const cells = [...row.children];
  const mediaCell = cells.find((c) => c.querySelector('picture, a[href]') && !c.querySelector('h1, h2, h3, h4, h5, h6'))
    || (cells.length > 1 ? cells[0] : null);
  const contentCell = cells.find((c) => c !== mediaCell) || document.createElement('div');

  const media = document.createElement('div');
  media.className = 'carousel-scroll-slide-media';
  const picture = row.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    // only same-origin (media bus) images can be re-optimized; external URLs keep their picture
    const sameOrigin = new URL(img.src, window.location.href).origin === window.location.origin;
    if (sameOrigin) {
      media.append(createOptimizedPicture(img.src, img.alt, index === 0, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ]));
      picture.remove();
    } else {
      if (index > 0) img.loading = 'lazy';
      media.append(picture);
    }
  }
  const links = [...row.querySelectorAll('a[href]')].filter(isVideoLink);
  if (links.length) {
    const [desktop, mobile] = links.map((a) => a.href);
    links.forEach(removeLink);
    media.append(buildVideo(!desktopMQ.matches && mobile ? mobile : desktop));
  }

  contentCell.className = 'carousel-scroll-slide-content';
  slide.append(media, contentCell);
  return slide;
}

function setActive(block, index) {
  if (block.dataset.activeSlide === String(index)) return;
  block.dataset.activeSlide = index;
  block.querySelectorAll('.carousel-scroll-slide').forEach((slide, i) => {
    const active = i === index;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', !active);
    const video = slide.querySelector('video');
    if (!video) return;
    if (active && !reducedMotion.matches && block.dataset.paused !== 'true') {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}

function buildToggle(block) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'carousel-scroll-toggle';
  const sync = () => {
    const paused = block.dataset.paused === 'true';
    button.dataset.state = paused ? 'paused' : 'playing';
    button.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
  };
  button.addEventListener('click', () => {
    const paused = block.dataset.paused !== 'true';
    block.dataset.paused = paused;
    const video = block.querySelector('.carousel-scroll-slide.is-active video');
    if (video) {
      if (paused) video.pause();
      else video.play().catch(() => {});
    }
    sync();
  });
  block.dataset.paused = reducedMotion.matches;
  sync();
  return button;
}

export default function decorate(block) {
  const rows = [...block.children];
  const slides = document.createElement('ol');
  slides.className = 'carousel-scroll-slides';
  rows.forEach((row, i) => slides.append(buildSlide(row, i)));

  // the frame is the rounded media box (vertically centred inside the sticky stage)
  const frame = document.createElement('div');
  frame.className = 'carousel-scroll-frame';
  frame.append(slides);

  const stage = document.createElement('div');
  stage.className = 'carousel-scroll-stage';
  stage.append(frame);

  // each slide carries its own progress row (slide i marks dash i active)
  if (rows.length > 1) {
    slides.querySelectorAll('.carousel-scroll-slide').forEach((slide, current) => {
      const indicators = document.createElement('div');
      indicators.className = 'carousel-scroll-indicators';
      indicators.setAttribute('aria-hidden', 'true');
      rows.forEach((_, i) => {
        const ind = document.createElement('span');
        ind.className = 'carousel-scroll-indicator';
        if (i === current) ind.classList.add('is-active');
        else if (i < current) ind.classList.add('is-past');
        indicators.append(ind);
      });
      slide.querySelector('.carousel-scroll-slide-content').prepend(indicators);
    });
  }
  if (frame.querySelector('video')) frame.append(buildToggle(block));

  // the track is a tall scroll area; the stage sticks while the track scrolls past
  const track = document.createElement('div');
  track.className = 'carousel-scroll-track';
  track.style.setProperty('--slide-count', rows.length);
  track.append(stage);
  block.replaceChildren(track);

  const update = () => {
    const rect = track.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(Math.max(-rect.top / scrollable, 0), 0.9999) : 0;
    const position = progress * rows.length;
    // fill of the active progress dash (0..1 within the current slide)
    block.style.setProperty('--slide-progress', (position % 1).toFixed(3));
    setActive(block, Math.floor(position));
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      update();
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        window.addEventListener('scroll', onScroll, { passive: true });
        update();
      } else {
        window.removeEventListener('scroll', onScroll);
        block.querySelectorAll('video').forEach((v) => v.pause());
        delete block.dataset.activeSlide;
      }
    });
  });
  observer.observe(track);
  setActive(block, 0);
}
