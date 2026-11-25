/* eslint-disable */
/* global WebImporter */

/**
 * scroll-video parser (Surface product pages).
 *
 * Source: <div style="height:400lvh"><div class="sticky"><canvas/><div><picture>
 *           <source srcset="desktop poster" media="(orientation: landscape)"><img src="mobile poster">
 *         </picture></div></div></div>
 * The .fsv frame-sequence URLs are not in the markup: the import's prepare step
 * (prepare/surface-expand.js) copies them from the page's script data onto the sticky element
 * as data-scroll-video-desktop / data-scroll-video-mobile.
 *
 * Block model (one row, 2 cells):
 *   cell 1: desktop poster <picture>, mobile poster <picture>
 *   cell 2: <p><a>desktop.fsv</a></p> <p><a>mobile.fsv</a></p>
 */

function absUrl(url, document) {
  if (!url) return '';
  try {
    return new URL(url, document.baseURI || 'https://www.microsoft.com/').href;
  } catch (e) {
    return url;
  }
}

function pictureFor(src, alt, document) {
  const picture = document.createElement('picture');
  const img = document.createElement('img');
  img.src = absUrl(src, document);
  img.alt = alt || '';
  picture.append(img);
  return picture;
}

function linkFor(href, document) {
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = href;
  a.textContent = href;
  p.append(a);
  return p;
}

export default function parse(element, { document }) {
  const sticky = element.querySelector('div.sticky') || element;
  const img = sticky.querySelector('picture img');
  const landscape = sticky.querySelector('picture source[media*="landscape"]');

  const media = [];
  const alt = img ? img.getAttribute('alt') : '';
  const desktopPoster = landscape && (landscape.getAttribute('srcset') || '').split(/\s+/)[0];
  const mobilePoster = img && img.getAttribute('src');
  if (desktopPoster) media.push(pictureFor(desktopPoster, alt, document));
  if (mobilePoster && mobilePoster !== desktopPoster) media.push(pictureFor(mobilePoster, alt, document));

  const links = [];
  const desktop = sticky.getAttribute('data-scroll-video-desktop');
  const mobile = sticky.getAttribute('data-scroll-video-mobile');
  if (desktop) links.push(linkFor(desktop, document));
  if (mobile) links.push(linkFor(mobile, document));

  const cells = [[media.length ? media : '', links.length ? links : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'scroll-video', cells });
  element.replaceWith(block);
}
