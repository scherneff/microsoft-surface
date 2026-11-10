/**
 * ds-stories — customer stories carousel (Microsoft "reimagine" case-study carousel): one story
 * card at a time (logo, title, summary, products, CTA beside the header image) and a strip of
 * customer logos that selects the story. Reconstructive decode.
 *
 * Authoring rows:
 *   - heading: a row with an h2 and an optional CTA paragraph
 *   - story: three cells — header image, customer logo image (alt = customer name), copy
 *     (h4 title, summary paragraph, "Products" label paragraph, a list of product icon + link
 *     items, CTA paragraph)
 *
 * @variants block class: (none)
 */

function div(className, ...children) {
  const d = document.createElement('div');
  d.className = className;
  d.append(...children);
  return d;
}

const isCta = (el) => el.tagName === 'P' && el.querySelector('a')
  && el.textContent.trim() === el.querySelector('a').textContent.trim();

let uid = 0;

/** live parity: reimagine `animation` blocks fade in when they scroll into view */
function reveal(els) {
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

export default function decorate(block) {
  if (block.querySelector(':scope > .ds-stories-inner')) return;
  const section = block.closest('.section');
  if (section && section.dataset.id && !section.id) section.id = section.dataset.id;
  const head = div('ds-stories-head');
  const stage = div('ds-stories-stage');
  const strip = div('ds-stories-strip');
  strip.setAttribute('role', 'tablist');
  const stories = [];
  const thumbs = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 3) {
      [...row.querySelectorAll(':scope > div > *')].forEach((n) => {
        if (isCta(n)) head.append(div('ds-stories-cta', n));
        else head.append(div('ds-stories-title', n));
      });
      return;
    }
    uid += 1;
    const [imgCell, logoCell, copyCell] = cells;
    const copy = div('ds-story-copy');
    const logo = logoCell.querySelector('picture');
    const logoClone = logo ? logo.cloneNode(true) : null;
    if (logo) copy.append(div('ds-story-logo', logo));
    [...copyCell.children].forEach((n) => {
      if (isCta(n)) copy.append(div('ds-story-cta', n));
      else if (n.matches('ul, ol')) copy.append(div('ds-story-products', n));
      else if (/^H[1-6]$/.test(n.tagName)) copy.append(div('ds-story-title', n));
      else copy.append(div('ds-story-text', n));
    });
    const story = div('ds-story', copy, div('ds-story-media', ...imgCell.querySelectorAll('picture')));
    story.id = `ds-story-${uid}`;
    story.setAttribute('role', 'tabpanel');
    stories.push(story);
    stage.append(story);
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = 'ds-stories-thumb';
    thumb.setAttribute('role', 'tab');
    thumb.setAttribute('aria-controls', story.id);
    const logoImg = logoClone && logoClone.querySelector('img');
    thumb.setAttribute('aria-label', logoImg ? logoImg.alt : `Story ${stories.length}`);
    if (logoClone) {
      logoClone.querySelectorAll('img').forEach((im) => {
        im.alt = '';
      });
      thumb.append(logoClone);
    }
    thumbs.push(thumb);
    strip.append(thumb);
  });

  let current = 0;
  const show = (n) => {
    current = (n + stories.length) % stories.length;
    stories.forEach((s, i) => {
      s.hidden = i !== current;
    });
    thumbs.forEach((t, i) => t.setAttribute('aria-selected', i === current ? 'true' : 'false'));
  };
  thumbs.forEach((t, i) => t.addEventListener('click', () => show(i)));
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'ds-prev';
  prev.setAttribute('aria-label', 'Previous Slide');
  prev.addEventListener('click', () => show(current - 1));
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'ds-next';
  next.setAttribute('aria-label', 'Next Slide');
  next.addEventListener('click', () => show(current + 1));
  show(0);

  const nav = div('ds-stories-nav', prev, strip, next);
  const body = div('ds-stories-body', stage, nav);
  block.replaceChildren(div('ds-stories-inner', head, body));
  block.querySelectorAll('a[title]').forEach((a) => {
    if (a.title.trim() !== a.textContent.trim()) a.setAttribute('aria-label', a.title);
  });
  reveal([...head.querySelectorAll('.ds-stories-title')]);
}
