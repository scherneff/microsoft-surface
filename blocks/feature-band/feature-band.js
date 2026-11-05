/**
 * feature-band — media + copy feature card(s) (MWF content card / feature band).
 * Reconstructive decode: rows are classified by content, never by index.
 *
 * Authoring:
 *   - optional head row (no image): a section heading and intro copy; a default-content
 *     head authored right before the block in the same section is reabsorbed (EW8)
 *   - one row per feature: image(s) + heading, body copy, CTA paragraphs.
 *     Two images = art direction: first the wide crop (>= 860px), second the narrow crop.
 *   - a CTA linking to a video file (.mp4 / Dynamic Media /is/content/) becomes a
 *     "watch" trigger that opens the video in a modal player (MWF modal timings)
 *
 * @variants block class: (none) single horizontal card (about); `grid` 3-column card grid
 *   (index); static siblings: `surface` (dark rounded card), `reversed` (copy first),
 *   `alternate` (every other item reversed, the first one copy-first), `pair` (2-up square
 *   image cards) — variants live in this block's CSS. A paragraph authored before the
 *   heading is the item's eyebrow (badge).
 */

const VIDEO_RE = /\.(mp4|webm)(\?|#|$)|\/is\/content\//i;
const SVG_NS = 'http://www.w3.org/2000/svg';

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function svg(viewBox, paths, className) {
  const el = document.createElementNS(SVG_NS, 'svg');
  el.setAttribute('viewBox', viewBox);
  el.setAttribute('aria-hidden', 'true');
  el.setAttribute('focusable', 'false');
  if (className) el.setAttribute('class', className);
  paths.forEach(([tag, attrs]) => {
    const p = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([k, v]) => p.setAttribute(k, v));
    el.append(p);
  });
  return el;
}

const linkOnly = (p) => {
  const a = p.querySelector('a');
  return a && p.textContent.trim() === a.textContent.trim() && !p.querySelector('picture');
};

let dialogCount = 0;

function buildDialog(src, labelledBy) {
  dialogCount += 1;
  const dlg = document.createElement('dialog');
  dlg.className = 'feature-band-dialog';
  dlg.id = `feature-band-dialog-${dialogCount}`;
  if (labelledBy) dlg.setAttribute('aria-labelledby', labelledBy);
  dlg.innerHTML = `<div class="feature-band-dialog-inner">
    <div class="feature-band-dialog-content">
      <div class="feature-band-dialog-header">
        <button class="feature-band-dialog-close" type="button"></button>
      </div>
      <div class="feature-band-dialog-body"><video controls playsinline preload="none"></video></div>
    </div></div>`;
  dlg.querySelector('button').setAttribute('aria-label', 'Close dialog window');
  dlg.querySelector('video').src = src;
  return dlg;
}

function wireDialog(trigger, dlg) {
  const open = (e) => {
    if (e) e.preventDefault();
    if (typeof dlg.showModal !== 'function') return;
    document.body.classList.add('modal-open');
    dlg.showModal();
    requestAnimationFrame(() => requestAnimationFrame(() => dlg.classList.add('show')));
  };
  const close = () => {
    const v = dlg.querySelector('video');
    if (v) v.pause();
    dlg.classList.remove('show');
    setTimeout(() => {
      dlg.close();
      document.body.classList.remove('modal-open');
      trigger.focus();
    }, 150);
  };
  trigger.addEventListener('click', open);
  trigger.addEventListener('keydown', (e) => {
    if (e.key === ' ') open(e);
  });
  dlg.querySelector('.feature-band-dialog-close').addEventListener('click', close);
  dlg.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || e.target.classList.contains('feature-band-dialog-inner')) close();
  });
}

function buildItem(row) {
  const pictures = [...row.querySelectorAll('picture')];
  const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
  const all = [...row.querySelectorAll('p, ul, ol')]
    .filter((el) => !el.querySelector('picture') && !el.closest('ul p, ol p'));
  // copy authored before the heading is its eyebrow (badge), kept in authored order
  const before = (el) => heading
    && el.compareDocumentPosition(heading) === Node.DOCUMENT_POSITION_FOLLOWING;
  const eyebrow = all.filter((el) => before(el) && !linkOnly(el));
  const flow = all.filter((el) => !eyebrow.includes(el));

  const item = document.createElement('div');
  item.className = 'feature-band-item card';
  const media = document.createElement('div');
  media.className = 'feature-band-media';
  if (pictures.length > 1) {
    media.append(wrapNode(pictures[0], 'feature-band-media-wide'));
    media.append(wrapNode(pictures[1], 'feature-band-media-narrow'));
    pictures.slice(2).forEach((pic) => media.append(pic));
  } else if (pictures.length) {
    media.append(pictures[0]);
  }

  const body = document.createElement('div');
  body.className = 'feature-band-body card-body';
  if (eyebrow.length) {
    const badge = document.createElement('div');
    badge.className = 'feature-band-eyebrow';
    badge.append(...eyebrow);
    body.append(badge);
  }
  if (heading) body.append(wrapNode(heading, 'feature-band-heading'));
  const text = document.createElement('div');
  text.className = 'feature-band-text';
  const actions = document.createElement('div');
  actions.className = 'link-group';
  let dialog = null;
  flow.forEach((el) => {
    if (el.tagName === 'P' && linkOnly(el)) {
      const a = el.querySelector('a');
      if (!dialog && VIDEO_RE.test(a.getAttribute('href') || '')) {
        if (heading && !heading.id) heading.id = `feature-band-heading-${dialogCount + 1}`;
        dialog = buildDialog(a.href, heading ? heading.id : '');
        const cta = document.createElement('div');
        cta.className = 'feature-band-video-cta';
        cta.append(svg('0 0 16 16', [['path', {
          d: 'M4.5 2.5v11L13 8z',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1.2',
          'stroke-linejoin': 'round',
        }]], 'feature-band-glyph'), el);
        a.setAttribute('role', 'button');
        a.setAttribute('aria-haspopup', 'dialog');
        a.setAttribute('aria-controls', dialog.id);
        actions.append(cta);
        cta.addEventListener('click', (e) => {
          if (e.target === cta || e.target.closest('svg')) a.click();
        });
        wireDialog(a, dialog);
      } else {
        actions.append(el);
      }
    } else {
      text.append(el);
    }
  });
  if (text.children.length) body.append(text);
  if (actions.children.length) body.append(actions);

  if (dialog) {
    const play = document.createElement('span');
    play.className = 'feature-band-play';
    play.append(svg('0 0 16 16', [
      ['circle', {
        cx: '8', cy: '8', r: '8', fill: 'currentColor',
      }],
      ['path', { d: 'M6.3 4.8v6.4L11 8z', fill: '#fff' }],
    ]));
    media.append(play);
  }

  const bodyCol = document.createElement('div');
  bodyCol.className = 'feature-band-body-col';
  bodyCol.append(body);
  if (media.children.length) item.append(media);
  item.append(bodyCol);
  if (dialog) item.append(dialog);
  return item;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .container')) return;
  const rows = [...block.children];
  const container = document.createElement('div');
  container.className = 'container';

  const head = document.createElement('div');
  head.className = 'feature-band-head';
  const prev = block.parentElement && block.parentElement.previousElementSibling;
  if (prev && prev.classList.contains('default-content-wrapper')) {
    head.append(...prev.childNodes);
    prev.remove();
  }
  const items = document.createElement('div');
  items.className = 'feature-band-items';
  rows.forEach((row) => {
    if (row.querySelector('picture')) {
      items.append(buildItem(row));
    } else {
      [...row.children].forEach((cell) => head.append(...cell.childNodes));
    }
  });
  if (head.children.length) container.append(head);
  container.append(items);
  block.dataset.items = items.children.length;
  block.replaceChildren(container);
}
