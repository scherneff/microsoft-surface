/* eslint-disable */
/* global WebImporter */

/**
 * quote-spotlight parser (Surface product pages).
 *
 * Block model (blocks/quote-spotlight/README.md), 2 columns:
 *   Background | desktop <picture>         | mobile <picture>
 *   Heading    | <h3>                      | (empty)
 *   Quote      | <p>quotation</p>          | <p>attribution</p>
 *   Product    | thumbnail <picture>       | <p>name</p><p>price</p><p><strong><a>Buy</a></strong></p>
 */

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function cleanText(el) {
  if (!el) return '';
  const sr = el.querySelector('.sr-only');
  return clean(sr ? sr.textContent : el.textContent);
}

function absUrl(url, document) {
  if (!url) return '';
  try {
    return new URL(url, document.baseURI || 'https://www.microsoft.com/').href;
  } catch (e) {
    return url;
  }
}

function firstSrcset(source) {
  const set = source.getAttribute('srcset') || source.getAttribute('srcSet') || '';
  return set.split(',')[0].trim().split(/\s+/)[0];
}

function picture(src, alt, document) {
  const pic = document.createElement('picture');
  const img = document.createElement('img');
  img.src = absUrl(src, document);
  img.alt = alt || '';
  pic.append(img);
  return pic;
}

function textEl(tag, text, document) {
  const el = document.createElement(tag);
  el.textContent = text;
  return el;
}

export default function parse(element, { document }) {
  const cells = [];

  // ---- background: desktop (landscape / wide source) + mobile (img / portrait source)
  const bgPicture = [...element.querySelectorAll('.inner-media-fill picture, picture')]
    .find((p) => p.querySelector('img'));
  if (bgPicture) {
    const img = bgPicture.querySelector('img');
    const alt = img.getAttribute('alt') || '';
    const sources = [...bgPicture.querySelectorAll('source')].filter((s) => firstSrcset(s));
    const wide = sources.find((s) => /landscape|min-width/i.test(s.getAttribute('media') || '')
      && !/not\s*\(/i.test(s.getAttribute('media') || ''));
    const narrow = sources.find((s) => s !== wide);
    const mobileSrc = (narrow && firstSrcset(narrow)) || img.getAttribute('src');
    const desktopSrc = (wide && firstSrcset(wide)) || img.getAttribute('src');
    const row = [picture(desktopSrc, alt, document)];
    row.push(mobileSrc && mobileSrc !== desktopSrc ? picture(mobileSrc, alt, document) : '');
    cells.push(row);
  }

  // ---- heading
  const heading = element.querySelector('h1, h2, h3, h4');
  if (heading && cleanText(heading)) {
    cells.push([textEl('h3', cleanText(heading), document), '']);
  }

  // ---- quotation + attribution
  const attributionEl = element.querySelector('p.body-sm');
  const quoteEl = element.querySelector('p.heading-6-sans-sm');
  if (quoteEl) {
    const attribution = cleanText(attributionEl);
    let quote = cleanText(quoteEl);
    if (attribution && quote.endsWith(attribution)) quote = clean(quote.slice(0, -attribution.length));
    cells.push([
      textEl('p', quote, document),
      attribution ? textEl('p', attribution, document) : '',
    ]);
  }

  // ---- product card(s): thumbnail + name, price, bold Buy link
  const productLinks = [...element.querySelectorAll('a[href]')]
    .filter((a) => !a.closest('sup') && clean(a.textContent));
  productLinks.forEach((link) => {
    // card = nearest ancestor that also holds the thumbnail image
    let card = link.parentElement;
    while (card && card !== element && !card.querySelector('img')) card = card.parentElement;
    if (!card || card === element) card = link.parentElement;

    const thumbImg = card.querySelector('img');
    const thumb = thumbImg ? picture(thumbImg.getAttribute('src'), thumbImg.getAttribute('alt'), document) : '';

    const info = [];
    const name = card.querySelector('p');
    if (name && cleanText(name)) info.push(textEl('p', cleanText(name), document));
    const price = [...card.querySelectorAll('div')]
      .find((d) => !d.children.length && /\$|€|£|\d/.test(d.textContent) && clean(d.textContent));
    if (price) info.push(textEl('p', clean(price.textContent), document));
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    const a = document.createElement('a');
    a.href = absUrl(link.getAttribute('href'), document);
    a.textContent = clean(link.textContent);
    strong.append(a);
    p.append(strong);
    info.push(p);
    cells.push([thumb, info]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote-spotlight', cells });
  element.replaceWith(block);
}
