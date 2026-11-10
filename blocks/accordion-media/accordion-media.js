import { createOptimizedPicture } from '../../scripts/aem.js';

const VIDEO_RE = /\.(mp4|webm|mov)(\?|#|$)/i;
const PLUS_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 13" focusable="false"><path fill="currentColor" d="M6.33 0c.28 0 .5.22.5.5v5.33h5.34a.5.5 0 0 1 0 1H6.83v5.34a.5.5 0 0 1-1 0V6.83H.5a.5.5 0 0 1 0-1h5.33V.5c0-.28.23-.5.5-.5"/></svg>';
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

export default function decorate(block) {
  const stage = document.createElement('div');
  stage.className = 'accordion-media-stage';
  const list = document.createElement('div');
  list.className = 'accordion-media-items';

  const items = [];
  [...block.children].forEach((row) => {
    const [labelCell, ...bodyCells] = [...row.children];
    if (!labelCell) return;

    // media for this item (poster picture and/or video link) lives in the stage
    const media = document.createElement('div');
    media.className = 'accordion-media-stage-item';
    const picture = row.querySelector('picture');
    if (picture) {
      const img = picture.querySelector('img');
      const parent = picture.parentElement;
      // createOptimizedPicture only works for same-origin media; keep external images as authored
      const sameOrigin = new URL(img.src, window.location.href).origin === window.location.origin;
      media.append(sameOrigin ? createOptimizedPicture(img.src, img.alt, false, [
        { media: '(min-width: 1024px)', width: '2000' },
        { width: '900' },
      ]) : picture);
      if (sameOrigin) picture.remove();
      if (parent && parent.tagName === 'P' && !parent.textContent.trim()) parent.remove();
    }
    const link = [...row.querySelectorAll('a[href]')].find(isVideoLink);
    let video = null;
    if (link) {
      video = buildVideo(link.href);
      // no authored poster: load metadata so the first frame stands in for one
      if (!picture) video.setAttribute('preload', 'metadata');
      removeLink(link);
      media.append(video);
    }
    stage.append(media);

    const summary = document.createElement('summary');
    summary.className = 'accordion-media-item-label';
    const title = document.createElement('span');
    title.className = 'accordion-media-item-title';
    title.textContent = labelCell.textContent.trim();
    const icon = document.createElement('span');
    icon.className = 'accordion-media-item-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = PLUS_ICON;
    summary.append(title, icon);

    const body = document.createElement('div');
    body.className = 'accordion-media-item-body';
    bodyCells.forEach((cell) => body.append(...cell.childNodes));

    const progress = document.createElement('div');
    progress.className = 'accordion-media-item-progress';
    progress.setAttribute('aria-hidden', 'true');

    const details = document.createElement('details');
    details.className = 'accordion-media-item';
    details.append(summary, body, progress);
    list.append(details);
    items.push({ details, media, video });
    row.remove();
  });

  let paused = reducedMotion.matches;
  let visible = false;
  let activeIndex = 0;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'accordion-media-toggle';

  const sync = () => {
    items.forEach(({ details, media, video }, i) => {
      const active = i === activeIndex;
      media.classList.toggle('is-active', active);
      details.classList.toggle('is-active', active);
      if (!video) return;
      if (active && visible && !paused) video.play().catch(() => {});
      else video.pause();
    });
    toggle.dataset.state = paused ? 'paused' : 'playing';
    toggle.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
    toggle.hidden = !items[activeIndex]?.video;
  };

  const activate = (index) => {
    activeIndex = index;
    items.forEach(({ details, video }, i) => {
      details.open = i === index;
      if (i === index && video) video.currentTime = 0;
    });
    block.style.setProperty('--accordion-media-progress', 0);
    sync();
  };

  items.forEach(({ details, video }, i) => {
    // exclusive open: opening one closes the others and switches the background
    details.querySelector('summary').addEventListener('click', (e) => {
      e.preventDefault();
      if (i !== activeIndex || !details.open) activate(i);
    });
    if (!video) return;
    video.addEventListener('timeupdate', () => {
      if (i !== activeIndex || !video.duration) return;
      block.style.setProperty('--accordion-media-progress', video.currentTime / video.duration);
    });
    // when an item's video ends, advance to the next item
    video.addEventListener('ended', () => {
      if (i === activeIndex) activate((i + 1) % items.length);
    });
  });

  toggle.addEventListener('click', () => {
    paused = !paused;
    sync();
  });
  stage.append(toggle);

  block.replaceChildren(stage, list);

  const observer = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    sync();
  }, { threshold: 0.3 });
  observer.observe(block);

  if (items.length) activate(0);
}
