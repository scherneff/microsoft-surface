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

/**
 * Optional intro row (first row, first cell holds the wallpaper picture(s), no video link):
 * a full-screen wallpaper with the section heading, shown first and faded out once the
 * reader has scrolled a quarter of the way through the pinned block.
 */
function buildIntro(row) {
  const [mediaCell] = row.children;
  if (!mediaCell || !mediaCell.querySelector('picture')) return null;
  if ([...row.querySelectorAll('a[href]')].some(isVideoLink)) return null;

  const intro = document.createElement('div');
  intro.className = 'accordion-media-intro';
  const [landscape, portrait] = [...row.querySelectorAll('picture')];
  const picture = landscape.cloneNode(true);
  const portraitImg = portrait && portrait.querySelector('img');
  if (portraitImg) {
    const source = document.createElement('source');
    source.media = '(orientation: portrait)';
    source.srcset = portraitImg.src;
    picture.prepend(source);
  }
  const img = picture.querySelector('img');
  if (img) img.loading = 'lazy';
  intro.append(picture);

  const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
  const text = [...row.children].slice(1).map((c) => c.textContent.trim()).join(' ').trim();
  if (heading || text) {
    const title = heading ? heading.cloneNode(true) : document.createElement('h3');
    if (!heading) title.textContent = text;
    title.className = 'accordion-media-intro-title';
    intro.append(title);
  }
  row.remove();
  return intro;
}

export default function decorate(block) {
  const stage = document.createElement('div');
  stage.className = 'accordion-media-stage';
  const list = document.createElement('div');
  list.className = 'accordion-media-items';

  const intro = block.firstElementChild ? buildIntro(block.firstElementChild) : null;

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

  // the progress line is a linear CSS animation as long as the item's video (smooth, every
  // frame); it only runs while that video plays and re-syncs to the video's time on resume
  const restartProgress = (details, at = 0) => {
    const bar = details.querySelector('.accordion-media-item-progress');
    if (!bar) return;
    bar.classList.add('is-restarting');
    // eslint-disable-next-line no-unused-expressions
    bar.offsetWidth; // restart the animation, then offset it to the video's time
    bar.style.setProperty('--accordion-media-delay', `${-at}s`);
    bar.classList.remove('is-restarting');
  };

  const activate = (index) => {
    activeIndex = index;
    items.forEach(({ details, video }, i) => {
      details.open = i === index;
      details.classList.remove('is-playing');
      if (i === index && video) video.currentTime = 0;
    });
    if (items[index]) restartProgress(items[index].details);
    sync();
  };

  items.forEach(({ details, video }, i) => {
    // exclusive open: opening one closes the others and switches the background
    details.querySelector('summary').addEventListener('click', (e) => {
      e.preventDefault();
      if (i !== activeIndex || !details.open) activate(i);
    });
    if (!video) return;
    const bar = details.querySelector('.accordion-media-item-progress');
    const setDuration = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        bar.style.setProperty('--accordion-media-duration', `${video.duration}s`);
      }
    };
    video.addEventListener('loadedmetadata', setDuration);
    video.addEventListener('durationchange', setDuration);
    video.addEventListener('playing', () => {
      if (i !== activeIndex) return;
      setDuration();
      // restart with a negative delay so the line sits exactly at the video's current time
      restartProgress(details, video.currentTime);
      details.classList.add('is-playing');
    });
    ['pause', 'waiting', 'seeking'].forEach((type) => video.addEventListener(type, () => {
      details.classList.remove('is-playing');
    }));
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

  // labels authored in sentence case get the sans label style;
  // all-caps labels (e.g. "BUILD.") keep the mono display style
  const labels = items.map(({ details }) => details.querySelector('.accordion-media-item-title').textContent);
  if (labels.some((label) => label !== label.toUpperCase())) block.classList.add('sentence-labels');

  block.replaceChildren(stage, list);

  let inView = false;
  let revealed = !intro;
  const updateVisible = () => {
    visible = inView && revealed;
    sync();
  };

  if (intro) {
    block.classList.add('has-intro');
    block.append(intro);
    // the wrapper is the scroll track the pinned block travels through (see CSS)
    const track = block.parentElement;
    let focused = false;
    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = track.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      const progress = range > 0 ? -rect.top / range : 1;
      const next = focused || progress >= 0.25;
      if (next !== revealed) {
        revealed = next;
        block.classList.toggle('is-revealed', revealed);
        updateVisible();
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };
    // keyboard users reaching the items get them straight away
    list.addEventListener('focusin', () => { focused = true; update(); });
    list.addEventListener('focusout', (e) => {
      if (!list.contains(e.relatedTarget)) { focused = false; update(); }
    });
    new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        window.addEventListener('scroll', onScroll, { passive: true });
        update();
      } else {
        window.removeEventListener('scroll', onScroll);
      }
    }, { rootMargin: '50% 0px' }).observe(track);
  }

  const observer = new IntersectionObserver((entries) => {
    inView = entries.some((e) => e.isIntersecting);
    updateVisible();
  }, { threshold: 0.3 });
  observer.observe(block);

  if (items.length) activate(0);
}
