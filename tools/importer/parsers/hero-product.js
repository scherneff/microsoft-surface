/* eslint-disable */
/* global WebImporter */

/**
 * hero-product parser (Surface product pages).
 *
 * Block model (mirrors content/en-us/surface/devices/surface-laptop-ultra.plain.html):
 *   row 1 (media):   poster <picture> + <p><a>desktop.mp4</a></p> + <p><a>mobile.mp4</a></p>
 *   row 2 (content): [promo <p><a>] [h1 product] [h2 headline] [p lead] [p name] [p price]
 *                    [<p><strong><a>CTA</a></strong></p>]
 * Every part of row 2 is optional (instance 2 only has an h3 + copy).
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
  newImg.src = absUrl(img.getAttribute('src') || img.src, document);
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

function inlineParagraph(el, document) {
  // keep text + inline markup (sup/strong/em/a) of a paragraph-like source node
  const p = document.createElement('p');
  const source = el.querySelector('p') || el;
  [...source.childNodes].forEach((n) => p.append(n.cloneNode(true)));
  return p;
}

function textEl(tag, text, document) {
  const el = document.createElement(tag);
  el.textContent = text;
  return el;
}

export default function parse(element, { document }) {
  // ---- media row
  const mediaCell = [];
  const posterImg = [...element.querySelectorAll('picture img, img')]
    .find((img) => /ctfassets\.net/.test(img.getAttribute('src') || ''));
  if (posterImg) mediaCell.push(buildPicture(posterImg, document));
  collectVideos(element, document).forEach((src) => mediaCell.push(videoLink(src, document)));

  // ---- content row
  const content = [];

  // buy bar: product name, price, bold CTA (pill holding <p>s and the store link)
  const buyBar = [...element.querySelectorAll('div.rounded-full')]
    .find((d) => d.querySelector('a[href]') && d.querySelector('p'));

  // promo pill: offer link outside the buy bar and outside rich-text copy (footnote refs)
  const promoLink = [...element.querySelectorAll('a[href]')]
    .find((a) => cleanText(a) && !(buyBar && buyBar.contains(a)) && !a.closest('.rich-text-content, sup'));
  if (promoLink) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = absUrl(promoLink.getAttribute('href'), document);
    const rich = promoLink.querySelector('.rich-text-content p') || promoLink;
    [...rich.childNodes].forEach((n) => a.append(n.cloneNode(true)));
    p.append(a);
    content.push(p);
  }

  // headings: product eyebrow (h1/h2) -> h1, big headline (.hero-6) -> h2, section h3 kept as h3
  const eyebrow = element.querySelector('h1, h2');
  const headline = element.querySelector('.hero-6');
  const h3 = element.querySelector('h3');
  if (eyebrow && cleanText(eyebrow)) content.push(textEl('h1', cleanText(eyebrow), document));
  if (headline) {
    let text = cleanText(headline);
    if (!text && headline.parentElement) {
      // split-word markup collapsed by the cleanup transformer: text sits next to the empty <p>
      text = [...headline.parentElement.childNodes]
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent).join(' ').replace(/\s+/g, ' ').trim();
    }
    if (text) content.push(textEl('h2', text, document));
  }
  if (h3 && cleanText(h3)) content.push(textEl('h3', cleanText(h3), document));

  // lead copy (first rich-text block that is not inside the promo pill)
  const leadEl = [...element.querySelectorAll('.rich-text-content')]
    .find((r) => !(promoLink && promoLink.contains(r)) && cleanText(r));
  if (leadEl) content.push(inlineParagraph(leadEl, document));

  if (buyBar) {
    buyBar.querySelectorAll('p').forEach((p) => {
      const t = cleanText(p);
      if (t) content.push(textEl('p', t, document));
    });
    const cta = buyBar.querySelector('a[href]');
    if (cta && cleanText(cta)) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      const a = document.createElement('a');
      a.href = absUrl(cta.getAttribute('href'), document);
      a.textContent = cleanText(cta);
      strong.append(a);
      p.append(strong);
      content.push(p);
    }
  }

  const cells = [];
  if (mediaCell.length) cells.push([mediaCell]);
  if (content.length) cells.push([content]);

  // The product hero's display headline is set in Segoe Sans on this source (Ultra's is the
  // mono display face): mark it with the `sans` option so the block can tell them apart.
  const hasSansHeadline = content.some((el) => el.tagName === 'H2');
  const name = hasSansHeadline ? 'hero-product (sans)' : 'hero-product';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
