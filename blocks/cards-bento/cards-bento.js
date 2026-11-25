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

function buildSource(src, media) {
  const source = document.createElement('source');
  source.src = src;
  source.type = `video/${src.split('?')[0].split('.').pop().toLowerCase()}`;
  if (media) source.media = media;
  return source;
}

/* one link: a single video; two links: landscape (desktop) then portrait (mobile) rendition */
function buildVideo([landscape, portrait]) {
  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', 'none');
  video.setAttribute('aria-hidden', 'true');
  if (portrait) {
    video.append(
      buildSource(landscape, '(orientation: landscape)'),
      buildSource(portrait, 'not (orientation: landscape)'),
    );
  } else {
    video.append(buildSource(landscape));
  }
  return video;
}

/* expose intrinsic ratios so a single media tile can size itself like the source */
function trackRatio(card, el, prop) {
  const set = (w, h) => { if (w && h) card.style.setProperty(prop, `${w} / ${h}`); };
  if (el.tagName === 'VIDEO') {
    el.addEventListener('loadedmetadata', () => set(el.videoWidth, el.videoHeight));
  } else if (el.complete && el.naturalWidth) {
    set(el.naturalWidth, el.naturalHeight);
  } else {
    el.addEventListener('load', () => set(el.naturalWidth, el.naturalHeight), { once: true });
  }
}

function buildToggle(video) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'cards-bento-toggle';
  const sync = () => {
    const { paused } = video;
    button.dataset.state = paused ? 'paused' : 'playing';
    button.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
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

function buildMedia(li) {
  const media = document.createElement('div');
  media.className = 'cards-bento-card-media';

  const picture = li.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    const parent = picture.parentElement;
    // only same-origin (media bus) images can be re-optimized; external URLs keep their picture
    const sameOrigin = new URL(img.src, window.location.href).origin === window.location.origin;
    media.append(sameOrigin
      ? createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])
      : picture);
    if (sameOrigin) picture.remove();
    if (parent && parent.tagName === 'P' && !parent.textContent.trim()) parent.remove();
  }

  const poster = media.querySelector('img');
  if (poster) trackRatio(li, poster, '--cards-bento-poster-ratio');

  const links = [...li.querySelectorAll('a[href]')].filter(isVideoLink);
  if (links.length) {
    const video = buildVideo(links.slice(0, 2).map((a) => a.href));
    links.forEach(removeLink);
    trackRatio(li, video, '--cards-bento-video-ratio');
    media.append(video, buildToggle(video));
    media.classList.add('has-video');
    if (!reducedMotion.matches) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) video.play().catch(() => {});
          else video.pause();
        });
      }, { threshold: 0.4 });
      observer.observe(media);
    }
  }
  return media.children.length ? media : null;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-bento-card';
    while (row.firstElementChild) li.append(row.firstElementChild);

    const media = buildMedia(li);

    // remaining non-empty cells form the text body, which sits above the media
    const body = document.createElement('div');
    body.className = 'cards-bento-card-body';
    [...li.children].forEach((cell) => {
      if (cell.textContent.trim() || cell.querySelector('img')) body.append(...cell.childNodes);
      cell.remove();
    });

    if (body.childNodes.length) li.append(body);
    if (media) li.append(media);
    ul.append(li);
  });
  // a lone tile with no text is a full-width media feature, not a bento grid
  if (ul.children.length === 1 && !ul.querySelector('.cards-bento-card-body') && ul.querySelector('.cards-bento-card-media')) {
    ul.firstElementChild.classList.add('is-media-only');
  }
  block.replaceChildren(ul);
}
