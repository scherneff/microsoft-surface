/* eslint-disable */
/* global WebImporter */

/**
 * carousel-scroll parser (Surface product pages).
 *
 * Block model (mirrors content/en-us/surface/devices/surface-laptop-ultra.plain.html):
 *   one row per slide, 2 cells:
 *     cell 1: poster <picture> + <p><a>desktop.mp4</a></p> + <p><a>mobile.mp4</a></p>
 *     cell 2: <h3> + <p> copy (footnote refs as <a href="#footnote-n"><sup>n</sup></a>)
 * Media layers and text slides are separate stacks in the source; paired by document order.
 */

function cleanText(el) {
  if (!el) return '';
  const sr = el.querySelector('.sr-only');
  const text = sr ? sr.textContent : el.textContent;
  return text.replace(/\s+/g, ' ').trim();
}

function absUrl(url, document) {
  if (!url) return '';
  try {
    return new URL(url, document.baseURI || 'https://www.microsoft.com/').href;
  } catch (e) {
    return url;
  }
}

function buildPicture(img, document) {
  const picture = document.createElement('picture');
  const newImg = document.createElement('img');
  newImg.src = absUrl(img.getAttribute('src'), document);
  newImg.alt = img.getAttribute('alt') || '';
  picture.append(newImg);
  return picture;
}

function videoLink(src, document) {
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = src;
  a.textContent = src;
  p.append(a);
  return p;
}

function collectVideos(root, document) {
  const urls = [];
  root.querySelectorAll('video').forEach((video) => {
    const srcs = [...video.querySelectorAll('source[src]')].map((s) => s.getAttribute('src'));
    if (video.getAttribute('src')) srcs.unshift(video.getAttribute('src'));
    srcs.forEach((s) => {
      const u = absUrl(s, document);
      if (u && /\.(mp4|webm|mov)(\?|#|$)/i.test(u) && !urls.includes(u)) urls.push(u);
    });
  });
  return urls.slice(0, 2);
}

/** Copy rich-text paragraphs; footnote refs <sup><a>n</a></sup> become <a><sup>n</sup></a>. */
function copyRichText(root, document) {
  const out = [];
  root.querySelectorAll('p, ul, ol').forEach((src) => {
    if (src.parentElement && src.parentElement.closest('p, ul, ol') && root.contains(src.parentElement.closest('p, ul, ol'))) return;
    const clone = src.cloneNode(true);
    clone.querySelectorAll('sup').forEach((sup) => {
      const a = sup.querySelector('a[href]');
      if (!a) return;
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      const s = document.createElement('sup');
      s.textContent = a.textContent.trim();
      link.append(s);
      sup.replaceWith(link);
    });
    [...clone.querySelectorAll('*')].forEach((el) => {
      [...el.attributes].forEach((attr) => { if (attr.name !== 'href') el.removeAttribute(attr.name); });
    });
    [...clone.attributes].forEach((attr) => clone.removeAttribute(attr.name));
    if (clone.textContent.trim()) out.push(clone);
  });
  return out;
}

export default function parse(element, { document }) {
  const mediaLayers = [...element.querySelectorAll('.inner-media-fill')]
    .filter((m) => m.querySelector('picture img, video'));
  const textSlides = [...element.querySelectorAll('h3')]
    .map((h) => h.parentElement);

  const count = Math.max(mediaLayers.length, textSlides.length);
  const cells = [];
  for (let i = 0; i < count; i += 1) {
    const media = [];
    const layer = mediaLayers[i];
    if (layer) {
      const img = [...layer.querySelectorAll('picture img')]
        .find((im) => /ctfassets\.net/.test(im.getAttribute('src') || ''));
      if (img) media.push(buildPicture(img, document));
      collectVideos(layer, document).forEach((src) => media.push(videoLink(src, document)));
    }

    const content = [];
    const slide = textSlides[i];
    if (slide) {
      const h3 = slide.querySelector('h3');
      const heading = document.createElement('h3');
      heading.textContent = cleanText(h3);
      content.push(heading);
      const rich = slide.querySelector('.rich-text-content');
      if (rich) content.push(...copyRichText(rich, document));
    }
    cells.push([media, content]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-scroll', cells });
  element.replaceWith(block);
}
