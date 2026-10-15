/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-product. Base: hero.
 * Source: https://www.microsoft.com/en-us/surface/devices/surface-laptop-ultra
 * Selector (page-templates.json): #r-product-hero > section
 *
 * Output (hero convention, 1 column):
 *   Row 1: poster image + background video links (desktop, mobile)
 *   Row 2: promo link, H1 product name, H2 display headline, lead paragraph,
 *          buy bar (product name, price, Pre-order link)
 *
 * Selectors validated against migration-work/block-context/hero-product/source.html.
 */
export default function parse(element, { document }) {
  const p = (content) => {
    const el = document.createElement('p');
    if (typeof content === 'string') el.textContent = content;
    else if (content) el.append(content);
    return el;
  };
  const link = (href, text) => {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text || href;
    return a;
  };
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

  // ---- Media row: poster image + video sources ----
  const mediaCell = [];
  const poster = element.querySelector('picture img[src]:not([src^="data:"]), img[src*="ctfassets"]');
  const video = element.querySelector('video');
  if (poster) {
    const img = document.createElement('img');
    img.src = poster.getAttribute('src');
    img.alt = poster.getAttribute('alt') || '';
    mediaCell.push(img);
  } else if (video && video.getAttribute('poster')) {
    const img = document.createElement('img');
    img.src = video.getAttribute('poster');
    mediaCell.push(img);
  }
  if (video) {
    const srcs = [...video.querySelectorAll('source[src]')].map((s) => s.getAttribute('src'));
    if (!srcs.length && video.getAttribute('src')) srcs.push(video.getAttribute('src'));
    // first two sources = desktop + mobile (hero-product decorator convention)
    [...new Set(srcs)].slice(0, 2).forEach((src) => mediaCell.push(p(link(src))));
  }

  // ---- Content row ----
  const contentCell = [];

  // Promo pill link at the top of the hero
  const promo = element.querySelector(':scope > div.top-0 a[href], :scope > div[class*="top-0"] a[href]');
  if (promo && clean(promo.textContent)) contentCell.push(p(link(promo.href, clean(promo.textContent))));

  // Product name heading
  const h1 = element.querySelector('h1');
  if (h1) {
    const h = document.createElement('h1');
    h.textContent = clean(h1.textContent);
    contentCell.push(h);
  }

  // Animated display headline: prefer the sr-only plain copy; fall back to joined .st-word
  // text, or the plain text left behind by the surface-cleanup transformer.
  let display = '';
  const headingWrap = h1 ? h1.parentElement : element;
  const sr = headingWrap.querySelector('.sr-only');
  if (sr) display = clean(sr.textContent);
  if (!display) {
    const words = [...headingWrap.querySelectorAll('.st-word')].map((w) => clean(w.textContent));
    if (words.length) display = words.join(' ');
  }
  if (!display) {
    const displayP = headingWrap.querySelector('p[class*="hero-"], p.split-text');
    if (displayP) display = clean(displayP.textContent);
  }
  if (display) {
    const h2 = document.createElement('h2');
    h2.textContent = display;
    contentCell.push(h2);
  }

  // Lead paragraph (rich text)
  const lead = element.querySelector('.rich-text-content p');
  const leadNode = [...element.querySelectorAll('.rich-text-content')]
    .find((rt) => !rt.closest('a') && clean(rt.textContent));
  if (leadNode) {
    leadNode.querySelectorAll('p').forEach((para) => {
      if (clean(para.textContent)) contentCell.push(para);
    });
  } else if (lead && !lead.closest('a')) {
    contentCell.push(lead);
  }

  // Buy bar: product name, price, CTA
  const buyBar = element.querySelector('div.rounded-full');
  if (buyBar) {
    [...buyBar.querySelectorAll('p')].forEach((para) => {
      const t = clean(para.textContent);
      if (t) contentCell.push(p(t));
    });
    const cta = buyBar.querySelector('a[href]');
    if (cta) {
      const strong = document.createElement('strong');
      strong.append(link(cta.href, clean(cta.textContent)));
      contentCell.push(p(strong));
    }
  }

  if (!mediaCell.length && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (mediaCell.length) cells.push([mediaCell]);
  cells.push([contentCell]);
  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-product', cells });
  element.replaceWith(block);
}
