import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';

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
  video.setAttribute('preload', 'none');
  video.setAttribute('aria-hidden', 'true');
  const source = document.createElement('source');
  source.src = src;
  source.type = `video/${src.split('?')[0].split('.').pop()}`;
  video.append(source);
  return video;
}

let tabsMediaId = 0;

export default function decorate(block) {
  tabsMediaId += 1;
  const uid = `tabs-media-${tabsMediaId}`;

  const tablist = document.createElement('div');
  tablist.className = 'tabs-media-list';
  tablist.setAttribute('role', 'tablist');

  const stage = document.createElement('div');
  stage.className = 'tabs-media-panels';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'tabs-media-toggle';
  let userPaused = reducedMotion.matches;
  let visible = false;

  const activePanel = () => stage.querySelector('.tabs-media-panel[aria-hidden="false"]');
  const syncVideos = () => {
    stage.querySelectorAll('.tabs-media-panel').forEach((panel) => {
      const video = panel.querySelector('video');
      if (!video) return;
      if (panel === activePanel() && visible && !userPaused) video.play().catch(() => {});
      else video.pause();
    });
    toggle.dataset.state = userPaused ? 'paused' : 'playing';
    toggle.setAttribute('aria-label', userPaused ? 'Play video' : 'Pause video');
    toggle.hidden = !activePanel()?.querySelector('video');
  };

  const buttons = [];
  [...block.children].forEach((row, i) => {
    const [labelCell, ...contentCells] = [...row.children];
    const label = labelCell ? labelCell.textContent.trim() : `${i + 1}`;
    const id = `${uid}-${toClassName(label) || i}`;

    const panel = document.createElement('div');
    panel.className = 'tabs-media-panel';
    panel.id = `${id}-panel`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `${id}-tab`);
    panel.setAttribute('aria-hidden', i !== 0);

    const media = document.createElement('div');
    media.className = 'tabs-media-panel-media';
    const picture = row.querySelector('picture');
    if (picture) {
      const img = picture.querySelector('img');
      // only same-origin (media bus) images can be re-optimized; external URLs keep their picture
      const sameOrigin = new URL(img.src, window.location.href).origin === window.location.origin;
      if (sameOrigin) {
        media.append(createOptimizedPicture(img.src, img.alt, false, [
          { media: '(min-width: 900px)', width: '2000' },
          { width: '900' },
        ]));
        picture.remove();
      } else {
        img.loading = 'lazy';
        img.decoding = 'async';
        const p = picture.parentElement;
        media.append(picture);
        if (p && p.tagName === 'P' && !p.textContent.trim() && !p.children.length) p.remove();
      }
    }
    const link = [...row.querySelectorAll('a[href]')].find(isVideoLink);
    if (link) {
      media.append(buildVideo(link.href));
      removeLink(link);
    }
    panel.append(media);

    // any remaining authored text (caption) is kept under the media
    const caption = document.createElement('div');
    caption.className = 'tabs-media-panel-caption';
    contentCells.forEach((cell) => {
      if (cell.textContent.trim()) caption.append(...cell.childNodes);
    });
    if (caption.childNodes.length) panel.append(caption);
    stage.append(panel);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-media-tab';
    button.id = `${id}-tab`;
    button.textContent = label;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panel.id);
    button.setAttribute('aria-selected', i === 0);
    button.tabIndex = i === 0 ? 0 : -1;
    button.addEventListener('click', () => {
      buttons.forEach((b) => {
        const selected = b === button;
        b.setAttribute('aria-selected', selected);
        b.tabIndex = selected ? 0 : -1;
      });
      stage.querySelectorAll('.tabs-media-panel').forEach((p) => {
        p.setAttribute('aria-hidden', p !== panel);
      });
      const video = panel.querySelector('video');
      if (video) video.currentTime = 0;
      syncVideos();
    });
    buttons.push(button);
    tablist.append(button);
  });

  // arrow-key navigation within the tablist
  tablist.addEventListener('keydown', (e) => {
    const current = buttons.indexOf(document.activeElement);
    if (current < 0) return;
    let next = -1;
    if (e.key === 'ArrowRight') next = (current + 1) % buttons.length;
    if (e.key === 'ArrowLeft') next = (current - 1 + buttons.length) % buttons.length;
    if (next < 0) return;
    e.preventDefault();
    buttons[next].focus();
    buttons[next].click();
  });

  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    syncVideos();
  });
  stage.append(toggle);

  block.replaceChildren(tablist, stage);

  const observer = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    syncVideos();
  }, { threshold: 0.3 });
  observer.observe(stage);
  syncVideos();
}
