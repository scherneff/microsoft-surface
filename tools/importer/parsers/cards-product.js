/* eslint-disable */
/* global WebImporter */

/**
 * cards-product parser (Surface product pages).
 *
 * Block model (mirrors content/en-us/surface/devices/surface-laptop-ultra.plain.html):
 *   one row per card, 2 cells:
 *     cell 1: product <picture>
 *     cell 2: <h3>name</h3> [<p>description</p>] <p><a>Learn more</a></p>? <p><a>Buy</a></p>
 * (On the Ultra page the card links are plain links; cards-product.js turns every
 * link-only paragraph into the action row.) Carousel arrows / progress are dropped.
 */

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function absUrl(url, document) {
  if (!url) return '';
  try {
    return new URL(url, document.baseURI || 'https://www.microsoft.com/').href;
  } catch (e) {
    return url;
  }
}

export default function parse(element, { document }) {
  const cards = [...element.querySelectorAll('.snap-start')]
    .filter((c) => c.querySelector('img') || c.querySelector('.heading-6'));

  const cells = cards.map((card) => {
    const img = [...card.querySelectorAll('img')]
      .find((im) => !/^data:/.test(im.getAttribute('src') || ''));
    let media = '';
    if (img) {
      const picture = document.createElement('picture');
      const newImg = document.createElement('img');
      newImg.src = absUrl(img.getAttribute('src'), document);
      newImg.alt = img.getAttribute('alt') || '';
      picture.append(newImg);
      media = picture;
    }

    const body = [];
    const name = card.querySelector('.heading-6, h3, h4');
    if (name && clean(name.textContent)) {
      const h3 = document.createElement('h3');
      h3.textContent = clean(name.textContent);
      body.push(h3);
    }
    // optional description copy
    card.querySelectorAll('.rich-text-content p, p:not(.heading-6)').forEach((p) => {
      if (p === name || !clean(p.textContent) || p.closest('a')) return;
      const np = document.createElement('p');
      np.textContent = clean(p.textContent);
      body.push(np);
    });
    // visible CTA links (the overlay link on the image has no text)
    card.querySelectorAll('a[href]').forEach((link) => {
      const text = clean(link.textContent);
      if (!text || link.closest('sup')) return;
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = absUrl(link.getAttribute('href'), document);
      a.textContent = text;
      p.append(a);
      body.push(p);
    });
    return [media, body.length ? body : ''];
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}
