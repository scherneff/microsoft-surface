/**
 * showcase — product showcase band: background image, logo + heading card with CTAs,
 * an autoplaying (muted) video, a sub-heading, story cards and a closing CTA strip
 * (about "Microsoft Copilot" band). Reconstructive decode: rows are classified by
 * content, never by index; every part is optional.
 *
 * Authoring rows:
 *   - background: a row holding only an image (before the heading row)
 *   - intro: logo image + h2 + tagline paragraphs + CTA paragraphs
 *     (primary CTA = bold link → .button.primary)
 *   - video: a link to the video file (+ optional poster image)
 *   - sub-heading: a row holding only a heading (h3)
 *   - story card: image + heading + copy + CTA paragraph (one row per card)
 *   - closing strip: a row holding only CTA paragraphs
 *
 * @ew-exempt <p> video source link (video row) — consumed as the <video> src, its text
 *   becomes the player's accessible name
 */

const VIDEO_RE = /\.(mp4|webm)(\?|#|$)|\/is\/content\//i;

const isCta = (el) => {
  const a = el.tagName === 'P' && el.querySelector('a');
  return !!a && el.textContent.trim() === a.textContent.trim() && !el.querySelector('picture');
};

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

const flowOf = (row) => [...row.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol')]
  .filter((el) => !el.querySelector('picture') && !el.closest('ul p, ol p'));

function linkGroup(ctas) {
  const group = document.createElement('div');
  group.className = 'link-group';
  ctas.forEach((p, i) => {
    group.append(p);
    if (i < ctas.length - 1) group.append(' ');
  });
  return group;
}

function videoLink(row) {
  return [...row.querySelectorAll('a[href]')]
    .find((a) => VIDEO_RE.test(a.getAttribute('href')));
}

function buildVideo(row, link) {
  const box = document.createElement('div');
  box.className = 'showcase-video';
  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', link.textContent);
  const video = document.createElement('video');
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.playsInline = true;
  video.controls = true;
  video.preload = 'auto';
  video.setAttribute('muted', '');
  video.setAttribute('autoplay', '');
  video.setAttribute('playsinline', '');
  const pic = row.querySelector('picture');
  if (pic) {
    const img = pic.querySelector('img');
    if (img) video.poster = img.src.replace(/width=\d+/, 'width=2000');
    box.append(wrapNode(pic, 'showcase-poster'));
  }
  video.src = link.href;
  (link.closest('p') || link).remove();
  box.append(video);
  const play = () => {
    const p = video.play();
    if (p && p.catch) p.catch(() => {});
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        play();
        io.disconnect();
      }
    }, { threshold: 0.25 });
    io.observe(box);
  } else {
    play();
  }
  return box;
}

function buildIntro(row) {
  const card = document.createElement('div');
  card.className = 'showcase-card';
  const logo = row.querySelector('picture');
  if (logo) card.append(wrapNode(logo, 'showcase-logo'));
  const body = document.createElement('div');
  body.className = 'showcase-body';
  const inner = document.createElement('div');
  inner.className = 'showcase-body-inner card-body';
  const tagline = document.createElement('div');
  tagline.className = 'showcase-tagline';
  const ctas = [];
  flowOf(row).forEach((el) => {
    if (/^H[1-6]$/.test(el.tagName)) inner.append(wrapNode(el, 'showcase-heading'));
    else if (isCta(el)) ctas.push(el);
    else tagline.append(el);
  });
  if (tagline.children.length) inner.append(tagline);
  if (ctas.length) inner.append(linkGroup(ctas));
  body.append(inner);
  card.append(body);
  return card;
}

function buildStory(row) {
  const col = document.createElement('div');
  col.className = 'showcase-story-col';
  const card = document.createElement('div');
  card.className = 'card showcase-story';
  const pic = row.querySelector('picture');
  if (pic) card.append(wrapNode(pic, 'showcase-story-media'));
  const body = document.createElement('div');
  body.className = 'showcase-story-body card-body';
  const ctas = [];
  flowOf(row).forEach((el) => {
    if (isCta(el)) ctas.push(el);
    else body.append(el);
  });
  if (ctas.length) body.append(linkGroup(ctas));
  card.append(body);
  col.append(card);
  return col;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .container')) return;
  const rows = [...block.children];
  const container = document.createElement('div');
  container.className = 'container';
  let bg = null;
  let stories = null;
  let seenIntro = false;
  rows.forEach((row) => {
    const flow = flowOf(row);
    const pics = row.querySelectorAll('picture');
    const vlink = videoLink(row);
    const headings = flow.filter((el) => /^H[1-6]$/.test(el.tagName));
    if (vlink) {
      container.append(buildVideo(row, vlink));
    } else if (!seenIntro && !bg && pics.length === 1 && !flow.length) {
      bg = wrapNode(pics[0], 'showcase-bg');
    } else if (!seenIntro && row.querySelector('h1, h2')) {
      seenIntro = true;
      container.append(buildIntro(row));
    } else if (pics.length && headings.length) {
      if (!stories) {
        stories = document.createElement('div');
        stories.className = 'showcase-stories';
        const grid = document.createElement('div');
        grid.className = 'showcase-stories-row';
        stories.append(grid);
        container.append(stories);
      }
      stories.firstElementChild.append(buildStory(row));
    } else if (headings.length && flow.every((el) => headings.includes(el))) {
      const ask = document.createElement('div');
      ask.className = 'showcase-ask';
      headings.forEach((h) => ask.append(h));
      container.append(ask);
    } else if (flow.length && flow.every(isCta)) {
      const strip = document.createElement('div');
      strip.className = 'showcase-strip';
      flow.forEach((p) => strip.append(p));
      container.append(strip);
    } else {
      const extra = document.createElement('div');
      extra.className = 'showcase-extra';
      [...row.children].forEach((cell) => extra.append(...cell.childNodes));
      container.append(extra);
    }
  });
  block.replaceChildren(...(bg ? [bg, container] : [container]));
}
