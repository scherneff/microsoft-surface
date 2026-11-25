import { createOptimizedPicture } from '../../scripts/aem.js';

const hasText = (el) => !!el.textContent.trim();
const isHeading = (el) => /^H[1-6]$/.test(el.tagName);

/** a paragraph whose only content is one or more links */
function isLinkOnly(el) {
  const links = [...el.querySelectorAll('a')];
  if (!links.length) return false;
  const squash = (s) => s.replace(/\s+/g, '');
  return squash(el.textContent) === squash(links.map((a) => a.textContent).join(''));
}

/** flattens a row into its meaningful child elements, cell by cell */
function cellNodes(cell) {
  return [...cell.children].filter((el) => hasText(el) || el.querySelector('picture, img, a'));
}

/**
 * Re-optimizes same-origin (media bus) images; external URLs keep their picture.
 * Never optimizes SVGs.
 */
function optimize(picture, widths) {
  const img = picture.querySelector('img');
  if (!img) return picture;
  const url = new URL(img.src, window.location.href);
  const sameOrigin = url.origin === window.location.origin;
  const isSvg = url.pathname.toLowerCase().endsWith('.svg');
  if (sameOrigin && !isSvg) {
    const optimized = createOptimizedPicture(img.src, img.alt, false, widths);
    picture.replaceWith(optimized);
    return optimized;
  }
  img.loading = 'lazy';
  img.decoding = 'async';
  return picture;
}

/** row type: background (pictures only), product (image + text or a link), heading, or quotation */
function classify(row) {
  const pictures = row.querySelectorAll('picture');
  const text = hasText(row);
  if (pictures.length && !text) return 'background';
  const links = [...row.querySelectorAll('a[href]')].filter((a) => !a.closest('sup'));
  if (links.length || (pictures.length && text)) return 'product';
  const nodes = [...row.children].flatMap(cellNodes);
  if (nodes.length && nodes.every(isHeading)) return 'heading';
  return 'quotation';
}

function buildMedia(rows) {
  const media = document.createElement('div');
  media.className = 'quote-spotlight-media';
  const pictures = rows.flatMap((row) => [...row.querySelectorAll('picture')]);
  const [desktop, mobile] = pictures;
  if (desktop) {
    const pic = optimize(desktop, [{ media: '(width >= 1200px)', width: '2000' }, { width: '1200' }]);
    pic.classList.add('quote-spotlight-media-desktop');
    media.append(pic);
  }
  if (mobile) {
    const pic = optimize(mobile, [{ width: '750' }]);
    pic.classList.add('quote-spotlight-media-mobile');
    media.append(pic);
    // both crops are lazy: the hidden (display: none) one is never fetched
    media.classList.add('has-mobile');
  }
  return media;
}

function buildQuote(rows) {
  const figure = document.createElement('figure');
  figure.className = 'quote-spotlight-quote';
  const blockquote = document.createElement('blockquote');
  const caption = document.createElement('figcaption');

  rows.forEach((row) => {
    const cells = [...row.children];
    const authored = row.querySelector('blockquote');
    if (authored) {
      blockquote.append(...authored.childNodes);
      cells.flatMap(cellNodes).filter((el) => el !== authored && !authored.contains(el))
        .forEach((el) => caption.append(el));
      return;
    }
    const nonEmpty = cells.filter(hasText);
    if (nonEmpty.length > 1) {
      // quote | attribution as two cells
      const [quoteCell, ...rest] = nonEmpty;
      blockquote.append(...cellNodes(quoteCell));
      rest.flatMap(cellNodes).forEach((el) => caption.append(el));
      return;
    }
    const nodes = nonEmpty.flatMap(cellNodes);
    if (!nodes.length && nonEmpty.length) {
      // bare text in a cell
      const p = document.createElement('p');
      p.append(...nonEmpty[0].childNodes);
      nodes.push(p);
    }
    // the last of several paragraphs is the attribution
    const attribution = nodes.length > 1 && !caption.childElementCount ? nodes.pop() : null;
    blockquote.append(...nodes);
    if (attribution) caption.append(attribution);
  });

  if (!hasText(blockquote)) return null;
  figure.append(blockquote);
  if (hasText(caption)) figure.append(caption);
  return figure;
}

function buildProduct(row) {
  const product = document.createElement('div');
  product.className = 'quote-spotlight-product';

  const picture = row.querySelector('picture');
  if (picture) {
    const image = document.createElement('div');
    image.className = 'quote-spotlight-product-image';
    image.append(optimize(picture, [{ width: '300' }]));
    product.append(image);
  }

  const nodes = [...row.children].flatMap(cellNodes)
    .filter((el) => hasText(el) || el.querySelector('a'));
  const ctas = nodes.filter(isLinkOnly);
  const info = nodes.filter((el) => !ctas.includes(el));

  const body = document.createElement('div');
  body.className = 'quote-spotlight-product-body';
  if (info.length) {
    const details = document.createElement('div');
    details.className = 'quote-spotlight-product-info';
    const [name, ...rest] = info;
    name.classList.add('quote-spotlight-product-name');
    rest.forEach((el) => el.classList.add('quote-spotlight-product-price'));
    details.append(name, ...rest);
    body.append(details);
  }
  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'quote-spotlight-product-actions';
    ctas.forEach((p) => {
      p.querySelectorAll('a').forEach((a) => {
        // unformatted links still render as the primary pill
        if (!a.classList.contains('secondary')) a.classList.add('button', 'primary');
        actions.append(a);
      });
    });
    body.append(actions);
  }
  product.append(body);
  return product.childElementCount > 1 || hasText(product) ? product : null;
}

export default function decorate(block) {
  const groups = {
    background: [], heading: [], quotation: [], product: [],
  };
  [...block.children].forEach((row) => groups[classify(row)].push(row));

  const media = buildMedia(groups.background);

  const content = document.createElement('div');
  content.className = 'quote-spotlight-content';

  const headings = groups.heading.flatMap((row) => [...row.children].flatMap(cellNodes));
  if (headings.length) {
    const heading = document.createElement('div');
    heading.className = 'quote-spotlight-heading';
    heading.append(...headings);
    content.append(heading);
  }

  const cards = document.createElement('div');
  cards.className = 'quote-spotlight-cards';
  const quote = buildQuote(groups.quotation);
  if (quote) cards.append(quote);
  groups.product.forEach((row) => {
    const product = buildProduct(row);
    if (product) cards.append(product);
  });
  if (cards.childElementCount) content.append(cards);

  if (!media.childElementCount) block.classList.add('no-media');
  block.replaceChildren(...(media.childElementCount ? [media] : []), content);
}
