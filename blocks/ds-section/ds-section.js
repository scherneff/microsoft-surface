/**
 * ds-section — a Microsoft "reimagine" design-system band (`section-master`) as used on /ai:
 * optional full-bleed background picture, a block heading (eyebrow, h1/h2, copy, buttons) and
 * a group of items (cards, feature tiles, linked logos) — optionally a scrolling carousel and,
 * for the news band, tab panels. Reconstructive decode: rows are classified by content.
 *
 * Authoring rows:
 *   - background: a row holding only a picture (first row of the block)
 *   - heading: a row with an h1/h2 (eyebrow paragraph before it, copy and CTA paragraphs
 *     after it; a <strong> link is the primary button, an <em> link the secondary one)
 *   - tab label (news): a row with a single short paragraph — the items after it form its panel
 *   - item: a row with a picture cell and/or a copy cell (eyebrow, h2–h4, copy, lists, CTAs);
 *     a picture inside the copy cell, before the heading, is the item's icon
 *   - prompt (ask): a row with a paragraph and a list — the paragraph is the search field
 *     label/placeholder, the list items are suggested questions
 *
 * Section ids come from section metadata `id` (anchor targets of ds-anchor-nav).
 *
 * @variants block class: banner | hero | ask | promo | cards | people | products | features |
 *   industries | news | closing | follow; `carousel` adds prev / next scrolling
 * @ew-exempt ask placeholder — the search field's placeholder mirrors the authored prompt
 *   paragraph (kept in the DOM as the field's visually hidden label)
 */

const isCta = (el) => el.tagName === 'P'
  && el.querySelector('a')
  && !el.querySelector('picture')
  && el.textContent.trim() === el.querySelector('a').textContent.trim();

function div(className, ...children) {
  const d = document.createElement('div');
  d.className = className;
  d.append(...children);
  return d;
}

function classify(row, index) {
  const pics = row.querySelectorAll('picture');
  const text = row.textContent.trim();
  if (pics.length && !text && !row.querySelector('a') && index === 0) return 'bg';
  if (!pics.length && row.querySelector('h1, h2') && !row.querySelector('h3, h4, h5, h6')) return 'head';
  if (!pics.length && !row.querySelector('h1, h2, h3, h4, h5, h6, a, ul, ol')
    && row.querySelectorAll('p').length === 1 && text.length < 40) return 'tab';
  if (!pics.length && row.querySelector('ul, ol') && !row.querySelector('h1, h2, h3, h4, a')) return 'prompt';
  return 'item';
}

/** copy flow (eyebrow / heading / text / CTAs) of one cell group, nodes moved in order */
function buildCopy(nodes, className) {
  const copy = div(className);
  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  let ctas = null;
  nodes.forEach((n) => {
    if (n === heading) {
      copy.append(div('ds-heading', n));
    } else if (n.tagName === 'PICTURE' || (n.tagName === 'P' && n.querySelector('picture') && !n.querySelector('a'))) {
      copy.append(div('ds-icon', n));
    } else if (isCta(n)) {
      if (!ctas) {
        ctas = div('ds-ctas');
        copy.append(ctas);
      }
      ctas.append(n);
    } else if (heading
      && heading.compareDocumentPosition(n) === Node.DOCUMENT_POSITION_PRECEDING) {
      copy.append(div('ds-eyebrow', n));
    } else {
      copy.append(div('ds-text', n));
    }
  });
  return copy;
}

function buildItem(row) {
  const item = div('ds-item');
  const cells = [...row.children];
  const mediaCells = cells.filter((c) => c.querySelector('picture') && !c.textContent.trim()
    && !c.querySelector('a'));
  if (mediaCells.length) {
    const media = div('ds-item-media');
    mediaCells.forEach((c) => media.append(...c.querySelectorAll('picture')));
    item.append(media);
  }
  const rest = cells.filter((c) => !mediaCells.includes(c)).flatMap((c) => [...c.children]);
  if (rest.length) item.append(buildCopy(rest, 'ds-item-body'));
  return item;
}

let uid = 0;

function buildPrompt(row) {
  uid += 1;
  const p = row.querySelector('p');
  const list = row.querySelector('ul, ol');
  const form = document.createElement('form');
  form.className = 'ds-prompt';
  form.action = 'https://www.microsoft.com/en-us/search/explore';
  form.method = 'get';
  form.role = 'search';
  const field = div('ds-prompt-field');
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.id = `ds-prompt-${uid}`;
  if (p) {
    const label = document.createElement('label');
    label.className = 'ds-prompt-label';
    label.htmlFor = input.id;
    label.append(p);
    input.placeholder = p.textContent.trim();
    field.append(label);
  }
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'ds-prompt-submit';
  submit.setAttribute('aria-label', 'Submit');
  field.append(input, submit);
  form.append(field);
  if (list) {
    list.classList.add('ds-prompt-suggestions');
    list.querySelectorAll('li').forEach((li) => {
      li.tabIndex = 0;
      li.setAttribute('role', 'button');
      const pick = () => {
        input.value = li.textContent.trim();
        input.focus();
      };
      li.addEventListener('click', pick);
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          pick();
        }
      });
    });
    form.append(list);
  }
  return form;
}

function arrow(className, label) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = className;
  b.setAttribute('aria-label', label);
  return b;
}

function wireCarousel(track) {
  const prev = arrow('ds-prev', 'Previous Slide');
  const next = arrow('ds-next', 'Next Slide');
  const step = (dir) => {
    const card = track.querySelector('.ds-item');
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const w = card ? card.getBoundingClientRect().width + gap : track.clientWidth;
    track.scrollBy({ left: dir * w, behavior: 'smooth' });
  };
  const sync = () => {
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  };
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  track.addEventListener('scroll', sync, { passive: true });
  requestAnimationFrame(sync);
  return div('ds-controls', prev, next);
}

/** live parity: reimagine `animation` blocks fade in (opacity 1.2s ease-in-out, 0.05s delay) when
 * they scroll into view */
function reveal(els) {
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach((el) => {
    el.classList.add('ds-reveal');
    io.observe(el);
  });
}

const REVEAL = ['promo', 'cards', 'products', 'features', 'industries', 'news', 'closing'];

export default function decorate(block) {
  if (block.querySelector(':scope > .ds-inner')) return;
  const section = block.closest('.section');
  if (section && section.dataset.id && !section.id) section.id = section.dataset.id;

  const inner = div('ds-inner');
  let bg = null;
  let track = null;
  let tabs = null;
  let panel = null;
  const tracks = [];
  [...block.children].forEach((row, i) => {
    const kind = classify(row, i);
    if (kind === 'bg') {
      bg = div('ds-bg', ...row.querySelectorAll('picture'));
      return;
    }
    if (kind === 'tab') {
      if (!tabs) {
        tabs = div('ds-tabs');
        tabs.setAttribute('role', 'tablist');
        inner.append(tabs);
      }
      const tab = div('ds-tab', row.querySelector('p'));
      tab.setAttribute('role', 'tab');
      tab.tabIndex = 0;
      tabs.append(tab);
      panel = div('ds-panel');
      panel.setAttribute('role', 'tabpanel');
      inner.append(panel);
      track = null;
      return;
    }
    if (kind === 'item') {
      if (!track) {
        track = div('ds-items');
        tracks.push(track);
        (panel || inner).append(track);
      }
      track.append(buildItem(row));
      return;
    }
    track = null;
    if (kind === 'head') inner.append(buildCopy([...row.querySelectorAll(':scope > div > *')], 'ds-head'));
    else if (kind === 'prompt') inner.append(buildPrompt(row));
  });

  if (block.classList.contains('carousel')) {
    tracks.forEach((t) => {
      const wrap = div('ds-carousel');
      t.replaceWith(wrap);
      wrap.append(t, wireCarousel(t));
    });
  }

  if (tabs) {
    const tabEls = [...tabs.children];
    const panels = [...inner.querySelectorAll(':scope > .ds-panel')];
    const select = (n) => {
      tabEls.forEach((t, i) => {
        t.setAttribute('aria-selected', i === n ? 'true' : 'false');
        t.classList.toggle('active', i === n);
      });
      panels.forEach((p, i) => {
        p.hidden = i !== n;
      });
    };
    tabEls.forEach((t, i) => {
      uid += 1;
      t.id = `ds-tab-${uid}`;
      panels[i].setAttribute('aria-labelledby', t.id);
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          select(i);
        }
      });
    });
    select(0);
  }

  block.replaceChildren(...(bg ? [bg] : []), inner);
  // live CTAs carry a descriptive accessible name — authored as the link title
  block.querySelectorAll('a[title]').forEach((a) => {
    if (a.title.trim() !== a.textContent.trim()) a.setAttribute('aria-label', a.title);
  });

  const variant = REVEAL.find((v) => block.classList.contains(v));
  if (variant) {
    const els = [...inner.querySelectorAll(':scope > .ds-head, :scope > .ds-carousel, :scope > .ds-items, :scope > .ds-panel')];
    if (variant === 'closing') {
      els.length = 0;
      els.push(...inner.querySelectorAll(':scope > .ds-head, .ds-item-body, .ds-item + .ds-item .ds-item-media'));
    }
    reveal(els);
  }
}
