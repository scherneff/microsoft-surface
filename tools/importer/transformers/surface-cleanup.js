/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for microsoft.com/en-us/surface product pages.
 * Selectors are taken from migration-work/cleaned.html.
 */

// The 13 authorable section containers (see page-templates.json sections[]).
const SECTION_CONTAINER_IDS = [
  'surface-laptop-product-hero',
  'surface-laptop-scrolling-slide',
  'surface-laptop-screen-sizes-section',
  'surface-laptop-image-description',
  'Surface Laptop Mega Promo camera',
  'surface-laptop-mega-promo',
  'surface-laptop-accordion-feature-animations',
  'surface-laptop-testimonial-spotlight',
  'Surface-laptop-product-comparison-table',
  'surface-laptop-product-card-section',
  'surface-laptop-accordion',
  'surface-laptop-footnotes',
];

function isInsideSection(el) {
  let node = el;
  while (node && node.nodeType === 1) {
    if (node.id && SECTION_CONTAINER_IDS.includes(node.id)) return true;
    node = node.parentElement;
  }
  return false;
}

function removeAll(root, selectors, { keepInSections = true } = {}) {
  selectors.forEach((sel) => {
    let nodes = [];
    try {
      nodes = [...root.querySelectorAll(sel)];
    } catch (e) {
      return;
    }
    nodes.forEach((n) => {
      if (keepInSections && isInsideSection(n)) return;
      n.remove();
    });
  });
}

/**
 * Split-word animation markup:
 *   <h3><span><div class="st-line"><div class="st-word">A</div>...</div></span>
 *       <span class="sr-only">A laptop without limits</span></h3>
 * Keep the sr-only text once, drop the animated duplicate.
 */
function normalizeSplitWordText(root) {
  root.querySelectorAll('span.sr-only').forEach((sr) => {
    const parent = sr.parentElement;
    if (!parent) return;
    const animated = [...parent.children].filter(
      (c) => c !== sr && c.querySelector('.st-line, .st-word'),
    );
    if (!animated.length) return;
    animated.forEach((a) => a.remove());
    const text = sr.textContent.replace(/\s+/g, ' ').trim();
    sr.replaceWith(root.ownerDocument
      ? root.ownerDocument.createTextNode(text)
      : document.createTextNode(text));
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Global chrome: header (incl. skip link + cookie banner), footer.
    removeAll(element, [
      'div.cge-uhf-header',
      'uhf-header',
      'a.uhf-skip-link',
      'uhf-cookie-banner',
      '#msccBannerV2',
      'div.cge-uhf-footer',
      'uhf-footer',
      '#uhf-footer',
    ], { keepInSections: false });

    // Widgets / popups / tracking hooks outside content.
    removeAll(element, [
      'next-route-announcer',
      '#msChatContainer',
      '#storeassistantroot',
      '#ClickTaleDiv',
      // hidden "Customize this device" configurator modal (always in the DOM)
      '#wf-modal-overlay',
      '.wf-modal-overlay',
      '[id*="survey" i]',
      '[class*="survey" i]',
      '[id*="feedback" i]',
    ]);

    // Fixed sticky buy bar (anonymous div between hero and scrolling slides);
    // it duplicates the hero buy bar.
    element.querySelectorAll('div.fixed.z-50').forEach((bar) => {
      if (isInsideSection(bar)) return;
      let wrapper = bar;
      while (
        wrapper.parentElement
        && wrapper.parentElement.tagName !== 'SECTION'
        && wrapper.parentElement.tagName !== 'MAIN'
        && wrapper.parentElement !== element
      ) {
        wrapper = wrapper.parentElement;
      }
      wrapper.remove();
    });

    // Empty SVA div and the trailing empty div after it.
    element.querySelectorAll('[id="Surface Laptop - SVA"]').forEach((sva) => {
      const next = sva.nextElementSibling;
      if (next && next.tagName === 'DIV' && !next.id
        && !next.textContent.trim() && !next.querySelector('img, video, picture, iframe')) {
        next.remove();
      }
      sva.remove();
    });

    // Heading / text split-word animation duplicates.
    normalizeSplitWordText(element);

    // Mega-promo body copy is marked up as an h4 (styled as body copy): author it as a paragraph.
    element.querySelectorAll('[id="surface-laptop-mega-promo"] h4').forEach((h4) => {
      const doc = element.ownerDocument || document;
      const p = doc.createElement('p');
      p.innerHTML = h4.innerHTML;
      h4.replaceWith(p);
    });

    // Non-authorable resources.
    removeAll(element, [
      'script',
      'style',
      'noscript',
      'link',
      'iframe[src*="tracking" i]',
      'img[width="1"][height="1"]',
    ], { keepInSections: false });
  }

  if (hookName === 'afterTransform') {
    // Final cleanup. Do NOT remove HTML comments (field hints).
    removeAll(element, [
      'script',
      'style',
      'noscript',
      'link',
    ], { keepInSections: false });

    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const n = attr.name;
        if (
          n.startsWith('data-bi-')
          || n.startsWith('data-m')
          || n === 'onclick'
          || n === 'con_e357'
          || n === 'wf-e344'
        ) {
          el.removeAttribute(n);
        }
      });
    });
  }
}
