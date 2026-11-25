/* eslint-disable */
/* global WebImporter */

/**
 * cards-bento parser (Surface product pages).
 *
 * Block model (mirrors content/en-us/surface/devices/surface-laptop-ultra.plain.html):
 *   one row per tile, 2 cells:
 *     cell 1: poster <picture> + <p><a>desktop.mp4</a></p> [+ <p><a>mobile.mp4</a></p>]
 *     cell 2: tile copy (empty when the tile is media-only)
 * On surface-laptop both instances are single media-only tiles (camera, security).
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

function buildTile(tile, document) {
  const media = [];
  const img = [...tile.querySelectorAll('picture img, img')]
    .find((im) => !/^data:/.test(im.getAttribute('src') || ''));
  if (img) {
    const picture = document.createElement('picture');
    const newImg = document.createElement('img');
    newImg.src = absUrl(img.getAttribute('src'), document);
    newImg.alt = img.getAttribute('alt') || '';
    picture.append(newImg);
    media.push(picture);
  }
  collectVideos(tile, document).forEach((src) => media.push(videoLink(src, document)));

  // optional tile copy (headings / rich text outside the media layer)
  const text = [];
  tile.querySelectorAll('h2, h3, h4, .rich-text-content p').forEach((el) => {
    if (el.closest('button')) return;
    const t = clean(el.textContent);
    if (!t) return;
    const node = document.createElement(/^H/.test(el.tagName) ? el.tagName.toLowerCase() : 'p');
    node.textContent = t;
    text.push(node);
  });
  return [media, text.length ? text : ''];
}

export default function parse(element, { document }) {
  // each tile is a media wrapper (group/dv) with its own video; fall back to the element itself
  let tiles = [...element.querySelectorAll('[class*="group/dv"]')]
    .filter((t) => t.querySelector('video, picture'));
  if (!tiles.length) tiles = [element];

  const cells = tiles.map((tile) => buildTile(tile, document));

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-bento', cells });
  element.replaceWith(block);
}
