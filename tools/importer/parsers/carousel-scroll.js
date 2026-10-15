/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-scroll. Base: carousel.
 * Source: https://www.microsoft.com/en-us/surface/devices/surface-laptop-ultra
 * Selector (page-templates.json): [id="#performance"] > section > div.container-fluid
 *
 * Output (carousel convention, 2 columns, one row per slide):
 *   cell 1 = poster image + video links (desktop, mobile)
 *   cell 2 = H3 heading + paragraph(s)
 *
 * Source structure: media layers (.inner-media-fill, one per slide) and text panels
 * (div.col-start-1.row-start-1, one per slide) live in separate containers and are paired by index.
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const para = (child) => {
    const el = document.createElement('p');
    el.append(child);
    return el;
  };
  const link = (href) => {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = href;
    return a;
  };

  // ---- media layers (one per slide) ----
  const mediaLayers = [...element.querySelectorAll('.inner-media-fill')];
  const media = mediaLayers.map((layer) => {
    const cell = [];
    const poster = layer.querySelector('picture img[src]:not([src^="data:"])');
    const video = layer.querySelector('video');
    if (poster) {
      const img = document.createElement('img');
      img.src = poster.getAttribute('src');
      img.alt = poster.getAttribute('alt') || '';
      cell.push(img);
    } else if (video && video.getAttribute('poster')) {
      const img = document.createElement('img');
      img.src = video.getAttribute('poster');
      cell.push(img);
    }
    if (video) {
      const srcs = [...video.querySelectorAll('source[src]')].map((s) => s.getAttribute('src'));
      if (!srcs.length && video.getAttribute('src')) srcs.push(video.getAttribute('src'));
      [...new Set(srcs)].slice(0, 2).forEach((src) => cell.push(para(link(src))));
    }
    return cell;
  });

  // ---- text panels (one per slide) ----
  let panels = [...element.querySelectorAll('div.grid > div.col-start-1')];
  if (!panels.length) {
    panels = [...element.querySelectorAll('h2, h3')].map((h) => h.parentElement);
  }
  const texts = panels.map((panel) => {
    const cell = [];
    const h = panel.querySelector('h2, h3, h4');
    if (h) {
      const sr = h.querySelector('.sr-only');
      const text = sr ? clean(sr.textContent) : clean(h.textContent);
      const h3 = document.createElement('h3');
      h3.textContent = text;
      cell.push(h3);
    }
    panel.querySelectorAll('.rich-text-content p, .rich-text-content ul, .rich-text-content ol').forEach((el) => {
      if (clean(el.textContent)) cell.push(el);
    });
    if (!panel.querySelector('.rich-text-content')) {
      panel.querySelectorAll(':scope > p').forEach((el) => {
        if (clean(el.textContent)) cell.push(el);
      });
    }
    return cell;
  });

  const count = Math.max(media.length, texts.length);
  if (!count) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  for (let i = 0; i < count; i += 1) {
    const m = media[i] && media[i].length ? media[i] : '';
    const t = texts[i] && texts[i].length ? texts[i] : '';
    cells.push([m, t]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-scroll', cells });
  element.replaceWith(block);
}
