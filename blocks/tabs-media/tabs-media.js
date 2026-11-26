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

/**
 * Caption spec lists (`li` = <strong>label</strong><br>value<br>detail) become stat tiles:
 * each `<br>`-separated line is wrapped so it can be styled.
 * Lists without line breaks are left as-is.
 */
function decorateStats(caption) {
  caption.querySelectorAll(':scope > ul').forEach((ul) => {
    const items = [...ul.children].filter((li) => li.querySelector(':scope > br'));
    if (!items.length) return;
    ul.classList.add('tabs-media-stats');
    items.forEach((li) => {
      const lines = [[]];
      [...li.childNodes].forEach((node) => {
        if (node.nodeName === 'BR') lines.push([]);
        else lines[lines.length - 1].push(node);
      });
      const parts = lines.filter((nodes) => nodes.some((n) => n.textContent.trim()));
      li.classList.add('tabs-media-stat');
      li.replaceChildren(...parts.map((nodes, i) => {
        const span = document.createElement('span');
        if (i === 0) span.className = 'tabs-media-stat-label';
        else if (i === 1) span.className = 'tabs-media-stat-value';
        else span.className = 'tabs-media-stat-detail';
        nodes.forEach((n) => {
          // footnote refs sit flush against the text, as on the source
          if (n.nodeType === Node.TEXT_NODE && n.nextSibling?.querySelector?.('sup')) {
            n.textContent = n.textContent.trimEnd();
          }
        });
        span.append(...nodes);
        return span;
      }));
    });
  });
}

/* fallback swatch colours when a "Shown in <colour>" line has no colour code */
const SWATCH_COLORS = {
  black: '#515356',
  dune: '#d3a68c',
  jade: '#9baa8f',
  platinum: '#e2e4e4',
  violet: '#a19dc4',
  sapphire: '#3a4b75',
  ocean: '#6c8ea8',
  sage: '#a9b5a0',
};
const SHOWN_IN = /^shown in\s+(.+?)(?:\s+(#[0-9a-f]{3,8}))?\s*$/i;

/** "Shown in Black #000000" -> { name: 'Black', color: '#000000' } (code is optional) */
function parseShownIn(p) {
  const match = p.textContent.trim().match(SHOWN_IN);
  if (!match) return null;
  const [, name, code] = match;
  return { name, color: code || SWATCH_COLORS[name.toLowerCase()] || '#d2d2d7' };
}

function mediaPicture(picture) {
  const img = picture.querySelector('img');
  // only same-origin (media bus) images can be re-optimized; external URLs keep their picture
  const sameOrigin = new URL(img.src, window.location.href).origin === window.location.origin;
  if (sameOrigin) {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [
      { media: '(min-width: 900px)', width: '2000' },
      { width: '900' },
    ]);
    picture.remove();
    return optimized;
  }
  img.loading = 'lazy';
  img.decoding = 'async';
  const p = picture.parentElement;
  if (p && p.tagName === 'P' && !p.textContent.trim() && !p.children.length) {
    p.replaceWith(picture);
  }
  return picture;
}

/**
 * Colour variants: several pictures, each followed by a "Shown in <colour> [#code]" line.
 * The pictures stack in the media box; a pill of swatches switches the picture and the caption.
 * Returns the swatch pill + caption to place under the media, or null for a single picture.
 */
function buildColours(row, media) {
  const pairs = [];
  [...row.querySelectorAll('picture')].forEach((picture) => {
    const holder = picture.closest('p') || picture;
    let next = holder.nextElementSibling;
    while (next && !next.textContent.trim() && !next.querySelector('picture')) next = next.nextElementSibling;
    const colour = next && next.tagName === 'P' && !next.querySelector('picture') ? parseShownIn(next) : null;
    if (colour) pairs.push({ picture, line: next, ...colour });
  });
  if (pairs.length < 2) return null;

  const swatches = document.createElement('div');
  swatches.className = 'tabs-media-swatches';
  swatches.setAttribute('role', 'group');
  swatches.setAttribute('aria-label', 'Colour');
  const shown = document.createElement('p');
  shown.className = 'tabs-media-shown';
  shown.setAttribute('aria-live', 'polite');

  const layers = pairs.map(({ picture }) => {
    const layer = mediaPicture(picture);
    layer.classList.add('tabs-media-colour');
    media.append(layer);
    return layer;
  });
  const buttons = pairs.map(({ name, color, line }) => {
    line.remove();
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-media-swatch';
    button.style.setProperty('--swatch-color', color);
    button.setAttribute('aria-label', `Shown in ${name}`);
    swatches.append(button);
    return button;
  });
  const select = (index) => {
    layers.forEach((layer, i) => layer.classList.toggle('is-active', i === index));
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', i === index));
    shown.textContent = `Shown in ${pairs[index].name}`;
  };
  buttons.forEach((b, i) => b.addEventListener('click', () => select(i)));
  select(0);
  media.classList.add('has-colours');
  return [swatches, shown];
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
    const colourControls = buildColours(row, media);
    const picture = !colourControls && row.querySelector('picture');
    if (picture) media.append(mediaPicture(picture));
    // a single "Shown in <colour> #code" line: hide the colour code
    if (!colourControls) {
      row.querySelectorAll('p').forEach((p) => {
        const colour = parseShownIn(p);
        if (colour) p.textContent = `Shown in ${colour.name}`;
      });
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
    if (colourControls) caption.append(...colourControls);
    contentCells.forEach((cell) => {
      if (cell.textContent.trim()) caption.append(...cell.childNodes);
    });
    if (caption.childNodes.length) {
      decorateStats(caption);
      panel.append(caption);
    }
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
      const changed = button.getAttribute('aria-selected') !== 'true';
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
      // eslint-disable-next-line no-use-before-define
      placeIndicator();
      // eslint-disable-next-line no-use-before-define
      if (changed) revealPanel(panel);
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

  // sliding "selected" pill under the tabs (shown in light sections, like the source):
  // it takes the selected tab's box and glides there when another tab is picked
  const indicator = document.createElement('span');
  indicator.className = 'tabs-media-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  tablist.prepend(indicator);
  function placeIndicator() {
    const selected = buttons.find((b) => b.getAttribute('aria-selected') === 'true');
    if (!selected) return;
    tablist.style.setProperty('--tabs-media-tab-left', `${selected.offsetLeft}px`);
    tablist.style.setProperty('--tabs-media-tab-top', `${selected.offsetTop}px`);
    tablist.style.setProperty('--tabs-media-tab-width', `${selected.offsetWidth}px`);
    tablist.style.setProperty('--tabs-media-tab-height', `${selected.offsetHeight}px`);
  }
  new ResizeObserver(placeIndicator).observe(tablist);
  placeIndicator();
  tablist.classList.add('has-indicator');
  // first placement doesn't animate
  requestAnimationFrame(() => requestAnimationFrame(() => tablist.classList.add('is-indicator-ready')));

  // the active panel's image, swatches, caption and stat tiles rise in (replayed on every switch)
  function revealPanel(panel) {
    panel.classList.remove('is-revealed');
    // eslint-disable-next-line no-unused-expressions
    panel.offsetWidth; // restart the transitions
    panel.classList.add('is-revealed');
  }

  let revealedOnce = false;
  const observer = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    if (visible && !revealedOnce && activePanel()) {
      revealedOnce = true;
      revealPanel(activePanel());
    }
    syncVideos();
  }, { threshold: 0.3 });
  observer.observe(stage);
  syncVideos();
}
