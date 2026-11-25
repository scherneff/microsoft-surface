/* eslint-disable */
/* global WebImporter */

/**
 * accordion-media parser (Surface product pages).
 *
 * Block model (mirrors content/en-us/surface/devices/surface-laptop-ultra.plain.html):
 *   one row per item, 2 cells:
 *     cell 1: <p>label</p>
 *     cell 2: [poster <picture>] + copy <p>s (footnote refs as <a><sup>n</sup></a>)
 *             + <p><a>desktop.mp4</a></p>
 * accordion-media.js plays only the first video link of a row, so (as on the Ultra page)
 * only the desktop video is authored; the poster stands in on small screens.
 *
 * The section heading (h3 "The ultimate Windows device") is section default content:
 * it is emitted in front of the block, not inside it. The wallpaper image is dropped.
 * Collapsed items have no copy in the static DOM; label + media are still emitted.
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
  return urls;
}

/** Copy rich-text paragraphs; footnote refs <sup><a>n</a></sup> become <a><sup>n</sup></a>. */
function copyRichText(root, document) {
  const out = [];
  root.querySelectorAll(':scope p, :scope ul, :scope ol').forEach((src) => {
    const outer = src.parentElement && src.parentElement.closest('p, ul, ol');
    if (outer && root.contains(outer)) return;
    const clone = src.cloneNode(true);
    clone.querySelectorAll('sup').forEach((sup) => {
      const a = sup.querySelector('a[href]');
      if (!a) {
        // separator sups such as "," between two refs
        sup.replaceWith(document.createTextNode(sup.textContent));
        return;
      }
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      const s = document.createElement('sup');
      s.textContent = a.textContent.trim();
      link.append(s);
      sup.replaceWith(link);
    });
    [clone, ...clone.querySelectorAll('*')].forEach((el) => {
      [...el.attributes].forEach((attr) => { if (attr.name !== 'href') el.removeAttribute(attr.name); });
    });
    // drop empty comment nodes and normalise whitespace
    [...clone.childNodes].forEach((n) => { if (n.nodeType === 8) n.remove(); });
    if (clone.textContent.trim()) out.push(clone);
  });
  return out;
}

export default function parse(element, { document }) {
  // media layers (one per item), excluding the wallpaper (no video)
  const mediaLayers = [...element.querySelectorAll('[class*="group/dv"]')]
    .filter((m) => m.querySelector('video'));

  // accordion items: each h3 that wraps a toggle button
  const items = [...element.querySelectorAll('h3')]
    .filter((h) => h.querySelector('button'))
    .map((h) => h.parentElement);

  const cells = [];
  items.forEach((item, i) => {
    const label = document.createElement('p');
    label.textContent = cleanText(item.querySelector('h3 button span') || item.querySelector('h3'));

    const body = [];
    const layer = mediaLayers[i];
    if (layer) {
      const img = [...layer.querySelectorAll('picture img')]
        .find((im) => !/^data:/.test(im.getAttribute('src') || ''));
      if (img) {
        const picture = document.createElement('picture');
        const newImg = document.createElement('img');
        newImg.src = absUrl(img.getAttribute('src'), document);
        newImg.alt = img.getAttribute('alt') || '';
        picture.append(newImg);
        body.push(picture);
      }
    }
    const rich = item.querySelector('.rich-text-content');
    if (rich) body.push(...copyRichText(rich, document));
    if (layer) {
      const [desktop] = collectVideos(layer, document);
      if (desktop) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = desktop;
        a.textContent = desktop;
        p.append(a);
        body.push(p);
      }
    }
    cells.push([label, body.length ? body : '']);
  });

  // intro row: the wallpaper (desktop + mobile crops) with the section heading over it,
  // shown first and faded out on scroll by the block
  const sectionHeading = [...element.querySelectorAll('h3')].find((h) => !h.querySelector('button'));
  const wallpaper = [...element.querySelectorAll('picture')]
    .find((pic) => !mediaLayers.some((layer) => layer.contains(pic)));
  if (wallpaper || (sectionHeading && cleanText(sectionHeading))) {
    const introMedia = [];
    if (wallpaper) {
      const img = wallpaper.querySelector('img');
      const alt = img ? img.getAttribute('alt') || '' : '';
      const landscape = [...wallpaper.querySelectorAll('source')]
        .find((s) => /landscape|min-width/i.test(s.getAttribute('media') || ''));
      const desktopSrc = landscape && (landscape.getAttribute('srcset') || '').split(/\s+/)[0];
      const mobileSrc = img && img.getAttribute('src');
      [desktopSrc, mobileSrc].filter(Boolean).filter((u, i, a) => a.indexOf(u) === i).forEach((src) => {
        const picture = document.createElement('picture');
        const newImg = document.createElement('img');
        newImg.src = absUrl(src, document);
        newImg.alt = alt;
        picture.append(newImg);
        introMedia.push(picture);
      });
    }
    const introText = [];
    if (sectionHeading && cleanText(sectionHeading)) {
      const h3 = document.createElement('h3');
      h3.textContent = cleanText(sectionHeading);
      introText.push(h3);
    }
    cells.unshift([introMedia.length ? introMedia : '', introText.length ? introText : '']);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-media', cells });
  element.replaceWith(block);
}
