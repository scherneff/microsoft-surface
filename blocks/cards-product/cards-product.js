import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-product-card';
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (!div.textContent.trim() && !div.querySelector('picture')) {
        div.remove();
      } else if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-product-card-image';
      } else {
        div.className = 'cards-product-card-body';
      }
    });

    // group the trailing link paragraphs (Learn more / Buy) into one action row
    const body = li.querySelector('.cards-product-card-body');
    if (body) {
      const squash = (s) => s.replace(/\s+/g, '');
      const linkParas = [...body.children].filter((el) => {
        const links = [...el.querySelectorAll('a')];
        return el.tagName === 'P' && links.length
          && squash(el.textContent) === squash(links.map((x) => x.textContent).join(''));
      });
      if (linkParas.length) {
        const actions = document.createElement('div');
        actions.className = 'cards-product-card-actions';
        linkParas[0].before(actions);
        linkParas.forEach((p) => {
          p.querySelectorAll('a').forEach((a) => {
            a.classList.remove('button');
            a.parentElement.classList.remove('button-container');
            actions.append(a);
          });
          p.remove();
        });
      }
    }

    // text leads, product image sits beneath it
    const image = li.querySelector('.cards-product-card-image');
    if (image) li.append(image);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    // only same-origin (media bus) images can be re-optimized; external URLs keep their picture
    const sameOrigin = new URL(img.src, window.location.href).origin === window.location.origin;
    if (sameOrigin) {
      img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
    } else {
      img.loading = 'lazy';
      img.decoding = 'async';
    }
  });

  block.replaceChildren(ul);
  // eslint-disable-next-line no-use-before-define
  addCarouselControls(block, ul);
}

const CHEVRON = '<svg xmlns="http://www.w3.org/2000/svg" width="9" height="13" viewBox="0 0 9 13" fill="none" aria-hidden="true" focusable="false"><path fill="currentColor" d="m8.64 5.9.36.35-.36.35-5.94 5.9-.35-.35-.35-.36 5.58-5.54L2 .7l.7-.7z"/></svg>';

/**
 * When the cards overflow their row (a swipeable carousel), show previous / next buttons and a
 * progress line under it, like the source: each click glides to the next card's snap point.
 * Rows that fit (e.g. a grid) get no controls.
 */
function addCarouselControls(block, ul) {
  const controls = document.createElement('div');
  controls.className = 'cards-product-controls';
  controls.hidden = true;
  const button = (dir) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `cards-product-${dir}`;
    b.setAttribute('aria-label', dir === 'prev' ? 'Previous item' : 'Next item');
    b.innerHTML = CHEVRON;
    return b;
  };
  const prev = button('prev');
  const next = button('next');
  const track = document.createElement('div');
  track.className = 'cards-product-progress';
  track.setAttribute('aria-hidden', 'true');
  const fill = document.createElement('div');
  fill.className = 'cards-product-progress-fill';
  track.append(fill);
  controls.append(prev, track, next);
  block.append(controls);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const maxScroll = () => ul.scrollWidth - ul.clientWidth;
  const pad = () => parseFloat(getComputedStyle(ul).scrollPaddingLeft) || 0;
  const cardStart = (li) => li.offsetLeft - ul.offsetLeft - pad();
  // like the source, a click moves by a "page": as many cards as are fully visible
  const pageSize = () => {
    const x = ul.scrollLeft;
    const visible = [...ul.children].filter((li) => {
      const start = li.offsetLeft - ul.offsetLeft - x;
      return start >= -1 && start + li.offsetWidth <= ul.clientWidth + 1;
    }).length;
    return Math.max(1, visible);
  };
  // stops: the start of every page-th card, clamped to the scroll range
  const stops = () => {
    const max = maxScroll();
    const step = pageSize();
    const points = [...ul.children]
      .filter((_, i) => i % step === 0)
      .map((li) => Math.min(max, Math.max(0, cardStart(li))));
    points.push(max);
    return [...new Set(points.map(Math.round))].sort((a, b) => a - b);
  };

  const update = () => {
    const overflow = maxScroll() > 1;
    controls.hidden = !overflow;
    if (!overflow) return;
    const step = pageSize();
    prev.setAttribute('aria-label', step > 1 ? `Previous ${step} items` : 'Previous item');
    next.setAttribute('aria-label', step > 1 ? `Next ${step} items` : 'Next item');
    const points = stops();
    const x = ul.scrollLeft;
    let index = 0;
    points.forEach((p, i) => { if (Math.abs(p - x) < Math.abs(points[index] - x)) index = i; });
    prev.disabled = x <= 1;
    next.disabled = x >= maxScroll() - 1;
    fill.style.setProperty('--cards-product-progress', (index + 1) / points.length);
  };

  const go = (dir) => {
    const x = ul.scrollLeft;
    const points = stops();
    const target = dir > 0
      ? points.find((p) => p > x + 1) ?? maxScroll()
      : [...points].reverse().find((p) => p < x - 1) ?? 0;
    ul.scrollTo({ left: target, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  };
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));

  // full-bleed rows line their first card up with the content column; measured (not 100vw) so a
  // scrollbar never makes a row that fits overflow
  const measureBleed = () => {
    const { left } = block.getBoundingClientRect();
    block.style.setProperty('--cards-product-bleed', `${Math.max(0, Math.round(left))}px`);
  };

  let ticking = false;
  ul.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; update(); });
  }, { passive: true });
  new ResizeObserver(() => { measureBleed(); update(); }).observe(block);
  measureBleed();
  update();
}
