/* eslint-disable */
/* global WebImporter */

import heroProductParser from './parsers/hero-product.js';
import carouselScrollParser from './parsers/carousel-scroll.js';
import tabsMediaParser from './parsers/tabs-media.js';
import cardsBentoParser from './parsers/cards-bento.js';
import scrollVideoParser from './parsers/scroll-video.js';
import accordionMediaParser from './parsers/accordion-media.js';
import quoteSpotlightParser from './parsers/quote-spotlight.js';
import tableCompareParser from './parsers/table-compare.js';
import cardsProductParser from './parsers/cards-product.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import cleanupTransformer from './transformers/surface-cleanup.js';
import sectionsTransformer from './transformers/surface-sections.js';
import specsModalTransformer from './transformers/surface-specs-modal.js';
import expandInteractive from './prepare/surface-expand.js';

const PAGE_TEMPLATE = {
  "name": "surface-product",
  "urls": [
    "https://www.microsoft.com/en-us/surface/devices/surface-laptop"
  ],
  "representativeUrl": "https://www.microsoft.com/en-us/surface/devices/surface-laptop",
  "description": "Surface device product page: video hero, scroll story, media tabs, specs, bento, use-case accordion, feature and compare cards, FAQ, footnotes",
  "blocks": [
    {
      "name": "hero-product",
      "instances": [
        "#surface-laptop-product-hero > section",
        "#surface-laptop-image-description > section"
      ]
    },
    {
      "name": "carousel-scroll",
      "instances": [
        "#surface-laptop-scrolling-slide .container-fluid"
      ]
    },
    {
      "name": "tabs-media",
      "instances": [
        "#surface-laptop-screen-sizes-section div:has(> #laptop-tabs)"
      ]
    },
    {
      "name": "cards-bento",
      "instances": [
        "[id=\"Surface Laptop Mega Promo camera\"] > section > div.container:has(video)",
        "[id=\"surface-laptop-mega-promo\"]:has(video) > section > div.container:has(video)"
      ]
    },
    {
      "name": "scroll-video",
      "instances": [
        "[id=\"surface-laptop-mega-promo\"]:not(:has(video)) div:has(> div.sticky)"
      ]
    },
    {
      "name": "accordion-media",
      "instances": [
        "#surface-laptop-accordion-feature-animations > section"
      ]
    },
    {
      "name": "quote-spotlight",
      "instances": [
        "#surface-laptop-testimonial-spotlight > section"
      ]
    },
    {
      "name": "table-compare",
      "instances": [
        "#Surface-laptop-product-comparison-table table"
      ]
    },
    {
      "name": "cards-product",
      "instances": [
        "#surface-laptop-product-card-section div.pointer-events-auto"
      ]
    },
    {
      "name": "accordion-faq",
      "instances": [
        "#surface-laptop-accordion > section"
      ]
    }
  ],
  "urlPattern": "/en-us/surface/devices/*",
  "sections": [
    {
      "id": "s1",
      "name": "Product hero",
      "selector": [
        "#surface-laptop-product-hero"
      ],
      "style": null,
      "blocks": [
        "hero-product"
      ],
      "defaultContent": []
    },
    {
      "id": "s2",
      "name": "A laptop without limits",
      "selector": [
        "#surface-laptop-scrolling-slide"
      ],
      "style": "light, dune, centered",
      "blocks": [
        "carousel-scroll"
      ],
      "defaultContent": [
        "#surface-laptop-scrolling-slide > section > div.container.text-center"
      ]
    },
    {
      "id": "s3",
      "name": "Good things come in threes",
      "selector": [
        "#surface-laptop-screen-sizes-section"
      ],
      "style": "light, dune, centered",
      "blocks": [
        "tabs-media"
      ],
      "defaultContent": [
        "#surface-laptop-screen-sizes-section > section > div > div.container"
      ]
    },
    {
      "id": "s4",
      "name": "Power through your day",
      "selector": [
        "#surface-laptop-image-description"
      ],
      "style": null,
      "blocks": [
        "hero-product"
      ],
      "defaultContent": []
    },
    {
      "id": "s5",
      "name": "A camera that reads the room",
      "selector": [
        "[id=\"Surface Laptop Mega Promo camera\"]"
      ],
      "style": "light, centered",
      "blocks": [
        "cards-bento"
      ],
      "defaultContent": [
        "[id=\"Surface Laptop Mega Promo camera\"] > section > div:first-child"
      ]
    },
    {
      "id": "s6",
      "name": "The eyes have it",
      "selector": [
        "[id=\"surface-laptop-mega-promo\"]:not(:has(video))"
      ],
      "style": "light, dune, centered",
      "blocks": [
        "scroll-video"
      ],
      "defaultContent": [
        "[id=\"surface-laptop-mega-promo\"]:not(:has(video)) > section > div:first-child",
        "[id=\"surface-laptop-mega-promo\"]:not(:has(video)) > section > div.container"
      ]
    },
    {
      "id": "s7",
      "name": "The ultimate Windows device",
      "selector": [
        "#surface-laptop-accordion-feature-animations"
      ],
      "style": "dark",
      "blocks": [
        "accordion-media"
      ],
      "defaultContent": []
    },
    {
      "id": "s8",
      "name": "Secured from day one",
      "selector": [
        "[id=\"surface-laptop-mega-promo\"]:has(video)"
      ],
      "style": "light, dune, centered",
      "blocks": [
        "cards-bento"
      ],
      "defaultContent": [
        "[id=\"surface-laptop-mega-promo\"]:has(video) > section > div:first-child",
        "[id=\"surface-laptop-mega-promo\"]:has(video) > section > div.container:last-child"
      ]
    },
    {
      "id": "s9",
      "name": "Surface is made for makers",
      "selector": [
        "#surface-laptop-testimonial-spotlight"
      ],
      "style": null,
      "blocks": [
        "quote-spotlight"
      ],
      "defaultContent": []
    },
    {
      "id": "s10",
      "name": "Meet the family",
      "selector": [
        "#Surface-laptop-product-comparison-table"
      ],
      "style": "light",
      "blocks": [
        "table-compare"
      ],
      "defaultContent": [
        "#Surface-laptop-product-comparison-table > section > div.container:first-child",
        "#Surface-laptop-product-comparison-table > section > div.container.text-center"
      ]
    },
    {
      "id": "s11",
      "name": "Explore Surface Laptop accessories",
      "selector": [
        "#surface-laptop-product-card-section"
      ],
      "style": "light",
      "blocks": [
        "cards-product"
      ],
      "defaultContent": [
        "#surface-laptop-product-card-section > section > div > div.container"
      ]
    },
    {
      "id": "s12",
      "name": "Surface Laptop FAQs",
      "selector": [
        "#surface-laptop-accordion"
      ],
      "style": "light, dune",
      "blocks": [
        "accordion-faq"
      ],
      "defaultContent": []
    },
    {
      "id": "s13",
      "name": "Footnotes",
      "selector": [
        "#surface-laptop-footnotes"
      ],
      "style": "light, light-grey, footnotes",
      "blocks": [],
      "defaultContent": [
        "#surface-laptop-footnotes ol"
      ]
    }
  ]
};

// Page metadata added to what the importer reads from the page (title, description, image).
const EXTRA_METADATA = { nav: '/nav-surface' };

const parsers = {
  'hero-product': heroProductParser,
  'carousel-scroll': carouselScrollParser,
  'tabs-media': tabsMediaParser,
  'cards-bento': cardsBentoParser,
  'scroll-video': scrollVideoParser,
  'accordion-media': accordionMediaParser,
  'quote-spotlight': quoteSpotlightParser,
  'table-compare': tableCompareParser,
  'cards-product': cardsProductParser,
  'accordion-faq': accordionFaqParser,
};
// Late transformers change the DOM (section <hr> markers, shared fragments), so their beforeTransform
// runs after block discovery.
const sectionTransformers = [sectionsTransformer];
const fragmentTransformers = [];
const lateTransformers = [...sectionTransformers, ...fragmentTransformers];
// Page corrections (surface-page-corrections.js, when it exists) run last.
const correctionTransformers = [];
const transformers = [cleanupTransformer, specsModalTransformer, ...lateTransformers, ...correctionTransformers];
const earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
// Catalog selectors (pageInstances, pageCleanup) count the <script> and <hr> elements the importer
// removes before transform, so a catalog template finds its targets in preprocess.
const CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));

function executeTransformers(hookName, element, payload, list = transformers) {
  const enhancedPayload = { ...payload, template: payload.params?.targets?.template || PAGE_TEMPLATE };
  list.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template, url) {
  const pageBlocks = [];
  const pageKey = (u) => {
    try { const { origin, pathname } = new URL(u); return `${origin}${pathname.replace(/\/$/, '')}`; }
    catch { return u; }
  };
  const key = pageKey(url);
  const claim = (blockDef, selector) => {
    let matches = [];
    try { matches = document.querySelectorAll(selector); } catch { return; }
    matches.forEach((element) => {
      if (pageBlocks.some((b) => b.element === element || b.element.contains(element) || element.contains(b.element))) return;
      pageBlocks.push({ name: blockDef.name, selector, element });
    });
  };
  template.blocks.forEach((blockDef) => {
    const entry = Object.entries(blockDef.pageInstances || {}).find(([u]) => pageKey(u) === key);
    (entry ? entry[1] : []).forEach((selector) => claim(blockDef, selector));
  });
  template.blocks.forEach((blockDef) => (blockDef.instances || []).forEach((selector) => claim(blockDef, selector)));
  return pageBlocks;
}

// Runs the early transformers, then marks each block and section target with an attribute: the
// importer re-creates the body before transform, so only attributes survive, not element references.
function markPageTargets(payload) {
  const { document, params } = payload;
  executeTransformers('beforeTransform', document.body, payload, earlyTransformers);
  const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
    element.setAttribute('data-excat-block', String(i));
    return { name, selector };
  });
  const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
    const target = (section.selector || []).map((s) => { try { return document.querySelector(s); } catch { return null; } }).find(Boolean);
    if (!target) return section;
    target.setAttribute('data-excat-section', String(i));
    return { ...section, selector: [`[data-excat-section="${i}"]`] };
  });
  params.targets = { blocks, template: { ...PAGE_TEMPLATE, sections } };
}

export default {
  // Live page only: reveal tab panels and accordion copy that mount on interaction.
  onLoad: async ({ document }) => {
    await expandInteractive({ document });
  },
  preprocess: (payload) => {
    if (CATALOG) markPageTargets(payload);
  },
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    params.fragments = [];

    if (!params.targets) markPageTargets(payload);
    const pageBlocks = params.targets.blocks
      .map((block, i) => ({ ...block, element: document.querySelector(`[data-excat-block="${i}"]`) }))
      .filter((block) => block.element);
    executeTransformers('beforeTransform', main, { ...payload, pageBlocks }, lateTransformers);

    pageBlocks.forEach((block) => {
      if (!main.contains(block.element)) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    const meta = { ...WebImporter.Blocks.getMetadata(document), ...EXTRA_METADATA };
    main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // Fragment nodes left main before afterTransform: finalize them the same way, without the
    // page-only section breaks and metadata.
    params.fragments.forEach(({ element }) => {
      executeTransformers('afterTransform', element, payload, earlyTransformers);
      WebImporter.rules.transformBackgroundImages(element, document);
      WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
    });

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }, ...params.fragments];
  },
};
