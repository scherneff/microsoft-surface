/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroProductParser from './parsers/hero-product.js';
import carouselScrollParser from './parsers/carousel-scroll.js';
import cardsBentoParser from './parsers/cards-bento.js';
import tabsMediaParser from './parsers/tabs-media.js';
import cardsSpecsParser from './parsers/cards-specs.js';
import accordionMediaParser from './parsers/accordion-media.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import cardsProductParser from './parsers/cards-product.js';
import accordionFaqParser from './parsers/accordion-faq.js';

// TRANSFORMER IMPORTS
import surfaceCleanupTransformer from './transformers/surface-cleanup.js';
import surfaceDmImagesTransformer from './transformers/surface-dm-images.js';
import surfaceSectionsTransformer from './transformers/surface-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-product': heroProductParser,
  'carousel-scroll': carouselScrollParser,
  'cards-bento': cardsBentoParser,
  'tabs-media': tabsMediaParser,
  'cards-specs': cardsSpecsParser,
  'accordion-media': accordionMediaParser,
  'cards-feature': cardsFeatureParser,
  'cards-product': cardsProductParser,
  'accordion-faq': accordionFaqParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "devices",
  "urls": [
    "https://www.microsoft.com/en-us/surface/devices/surface-laptop-ultra"
  ],
  "description": "Surface device product marketing page (dark theme): product hero, chaptered feature storytelling, compare tiles, FAQ, footnotes",
  "blocks": [
    {
      "name": "hero-product",
      "instances": [
        "#r-product-hero > section"
      ]
    },
    {
      "name": "carousel-scroll",
      "instances": [
        "[id=\"#performance\"] > section > div.container-fluid"
      ]
    },
    {
      "name": "cards-bento",
      "instances": [
        "[id=\"Feature grid\"] > section > div > ul"
      ]
    },
    {
      "name": "tabs-media",
      "instances": [
        "[id=\"#display\"] > section > div > div:nth-child(2)"
      ]
    },
    {
      "name": "cards-specs",
      "instances": [
        "[id=\"PARA WITH COLUMNS\"] > section > div > ul"
      ]
    },
    {
      "name": "accordion-media",
      "instances": [
        "[id=\"PANEL 6: RUN LOCAL. RUN FREE\"] > section"
      ]
    },
    {
      "name": "cards-feature",
      "instances": [
        ".ms-gc-section.ms-gc-container"
      ]
    },
    {
      "name": "cards-product",
      "instances": [
        "[id=\"#compare\"] > section > div.container-wide > div.grid"
      ]
    },
    {
      "name": "accordion-faq",
      "instances": [
        "[id=\"Surface Laptop Pro FAQs\"] [id$=\"-accordion\"]"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "Product hero",
      "selector": [
        "#r-product-hero"
      ],
      "style": null,
      "blocks": [
        "hero-product"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "Performance - Inner craft",
      "selector": [
        "[id=\"#performance\"]"
      ],
      "style": "dark",
      "blocks": [
        "carousel-scroll"
      ],
      "defaultContent": [
        "[id=\"#performance\"] > section > div.container"
      ]
    },
    {
      "id": "section-3",
      "name": "Feature grid",
      "selector": [
        "[id=\"Feature grid\"]"
      ],
      "style": "dark",
      "blocks": [
        "cards-bento"
      ],
      "defaultContent": []
    },
    {
      "id": "section-4",
      "name": "Display",
      "selector": [
        "[id=\"#display\"]"
      ],
      "style": "dark",
      "blocks": [
        "tabs-media",
        "cards-specs"
      ],
      "defaultContent": [
        "[id=\"#display\"] > section > div > div.container"
      ]
    },
    {
      "id": "section-5",
      "name": "Local AI",
      "selector": [
        "[id=\"ultra-group-panel-7\"]"
      ],
      "style": "dark",
      "blocks": [
        "accordion-media"
      ],
      "defaultContent": [
        "[id=\"ultra-group-panel-7\"]"
      ]
    },
    {
      "id": "section-6",
      "name": "Yours for the long haul",
      "selector": [
        "[id=\"ultra-group-panel-7-accordion-2\"]"
      ],
      "style": "dark, centered",
      "blocks": [],
      "defaultContent": [
        "[id=\"ultra-group-panel-7-accordion-2\"]"
      ]
    },
    {
      "id": "section-7",
      "name": "Security",
      "selector": [
        "[id=\"#security\"]"
      ],
      "style": "dark",
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": [
        "[id=\"#security\"]",
        "[id=\"ultra-security-business\"]"
      ]
    },
    {
      "id": "section-8",
      "name": "Explore every level of Surface",
      "selector": [
        "[id=\"#compare\"]"
      ],
      "style": "dark",
      "blocks": [
        "cards-product"
      ],
      "defaultContent": [
        "[id=\"#compare\"] > section > div.container-wide > div.text-center"
      ]
    },
    {
      "id": "section-9",
      "name": "Tech specs CTA",
      "selector": [
        "[id=\"techspecs\"]"
      ],
      "style": "dark, cta",
      "blocks": [],
      "defaultContent": [
        "[id=\"techspecs\"]"
      ]
    },
    {
      "id": "section-10",
      "name": "FAQ",
      "selector": [
        "[id=\"Surface Laptop Pro FAQs\"]"
      ],
      "style": "light",
      "blocks": [
        "accordion-faq"
      ],
      "defaultContent": [
        "[id=\"Surface Laptop Pro FAQs\"] [id$=\"-heading\"]"
      ]
    },
    {
      "id": "section-11",
      "name": "Footnotes",
      "selector": [
        "#r-page-footnotes"
      ],
      "style": "dark, footnotes",
      "blocks": [],
      "defaultContent": [
        "#r-page-footnotes"
      ]
    }
  ]
};

// TRANSFORMER REGISTRY - section transformer runs last
const transformers = [
  surfaceCleanupTransformer,
  surfaceDmImagesTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [surfaceSectionsTransformer] : []),
];

const FAQ_SECTION_SELECTOR = '[id="Surface Laptop Pro FAQs"]';

/**
 * Find a FAQPage object in parsed JSON-LD (top level, array, or @graph).
 * @param {*} data - Parsed JSON-LD
 * @returns {Object|null} FAQPage object
 */
function findFaqPage(data) {
  const list = (Array.isArray(data) ? data : [data])
    .flatMap((d) => (d && Array.isArray(d['@graph']) ? d['@graph'] : [d]));
  return list.find((d) => d && d['@type'] === 'FAQPage' && Array.isArray(d.mainEntity)) || null;
}

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

const TABS_MEDIA_SELECTOR = '[id="#display"] > section > div > div:nth-child(2)';
const ACCORDION_MEDIA_SELECTOR = '[id="PANEL 6: RUN LOCAL. RUN FREE"] > section';

/**
 * Poll until fn() returns a truthy value (or timeout).
 * @param {Function} fn - Probe function
 * @param {number} [timeout] - Max wait in ms
 * @returns {Promise<*>} Probe result or null
 */
async function waitFor(fn, timeout = 2500) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const res = fn();
    if (res) return res;
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => { setTimeout(r, 100); });
  }
  return null;
}

/**
 * Tabs (base-ui) render only the selected panel. Click each tab, clone its panel, restore the
 * initially selected tab, then stash clones of the panels that are not rendered so the
 * tabs-media parser (which pairs panels to tabs via aria-labelledby) can read all of them.
 * @param {Document} document - Live page document
 */
async function captureTabPanels(document) {
  const root = document.querySelector(TABS_MEDIA_SELECTOR);
  if (!root) return;
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const initial = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
  const captured = new Map();
  for (const tab of tabs) {
    tab.click();
    // eslint-disable-next-line no-await-in-loop
    const panel = await waitFor(() => root.querySelector(`[role="tabpanel"][aria-labelledby="${tab.id}"]`));
    if (panel) captured.set(tab.id, panel.cloneNode(true));
  }
  if (initial) {
    initial.click();
    await waitFor(() => root.querySelector(`[role="tabpanel"][aria-labelledby="${initial.id}"]`));
  }
  const stash = document.createElement('div');
  stash.setAttribute('data-excat-stash', 'tabs-media');
  captured.forEach((clone, tabId) => {
    if (root.querySelector(`[role="tabpanel"][aria-labelledby="${tabId}"]`)) return;
    clone.removeAttribute('id');
    stash.append(clone);
  });
  if (stash.children.length) root.append(stash);
}

/**
 * Accordion items render their body only when expanded. Expand each item, clone its body,
 * restore the initially expanded item, then append clones next to the collapsed items'
 * headings so the accordion-media parser finds them.
 * @param {Document} document - Live page document
 */
async function captureAccordionPanels(document) {
  const root = document.querySelector(ACCORDION_MEDIA_SELECTOR);
  if (!root) return;
  const buttons = [...root.querySelectorAll('h2 > button, h3 > button')];
  const initial = buttons.find((b) => b.getAttribute('aria-expanded') === 'true');
  const captured = new Map();
  for (const btn of buttons) {
    if (btn.getAttribute('aria-expanded') !== 'true') btn.click();
    // eslint-disable-next-line no-await-in-loop
    const panel = await waitFor(() => {
      const id = btn.getAttribute('aria-controls');
      const el = id && document.getElementById(id);
      return el && el.textContent.trim() ? el : null;
    });
    if (panel) captured.set(btn, panel.cloneNode(true));
  }
  if (initial && initial.getAttribute('aria-expanded') !== 'true') {
    initial.click();
    await waitFor(() => initial.getAttribute('aria-expanded') === 'true');
  }
  captured.forEach((clone, btn) => {
    const heading = btn.parentElement;
    const wrapper = heading && heading.parentElement;
    if (!wrapper) return;
    const hasBody = [...wrapper.children].some((c) => c !== heading && c.textContent.trim());
    if (hasBody) return;
    clone.removeAttribute('id');
    clone.removeAttribute('hidden');
    clone.setAttribute('data-excat-stash', 'accordion-media');
    heading.after(clone);
  });
}

export default {
  /**
   * Runs in the live page before conversion: reveal content that the site only renders on
   * interaction (tab panels, collapsed accordion bodies).
   */
  onLoad: async ({ document }) => {
    try {
      await captureTabPanels(document);
    } catch (e) {
      console.error('captureTabPanels failed:', e);
    }
    try {
      await captureAccordionPanels(document);
    } catch (e) {
      console.error('captureAccordionPanels failed:', e);
    }
  },

  /**
   * Runs before the importer strips <script> tags: copy FAQPage JSON-LD into a
   * [data-faq-jsonld] carrier so the accordion-faq parser can read the answers
   * (they are only rendered on expand). The carrier is removed by surface-cleanup.
   */
  preprocess: ({ document }) => {
    document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
      let faq;
      try {
        faq = findFaqPage(JSON.parse(script.textContent));
      } catch (e) {
        return;
      }
      if (!faq) return;
      const carrier = document.createElement('div');
      carrier.setAttribute('data-faq-jsonld', JSON.stringify(faq));
      const host = document.querySelector(FAQ_SECTION_SELECTOR)
        || document.querySelector('main')
        || document.body;
      host.appendChild(carrier);
    });
  },

  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. beforeTransform transformers (cleanup, section breaks)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform transformers (final cleanup, DM images, section metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (root URL maps to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
