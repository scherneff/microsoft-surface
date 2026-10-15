/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Microsoft Surface site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html
 * (source: https://www.microsoft.com/en-us/surface/devices/surface-laptop-ultra).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

/**
 * Animated split-text headings render the text twice:
 *   <h2><span><div class="st-line"><div class="st-word">INNER</div>...</div></span>
 *       <span class="sr-only"> INNER CRAFT. OUTER BEAUTY.</span></h2>
 * Keep a single plain-text copy (from span.sr-only) and drop the animated span.
 *
 * When the split text sat inside a <p>, the HTML parser closes the <p> before the <div>
 * lines, leaving an empty <p> followed by sibling div.st-line + span.sr-only
 * (e.g. the hero display line "THE NEW SHAPE OF POWER."). The text is moved back into
 * that empty <p> so it isn't left as a stray text node.
 */
function collapseSplitText(element) {
  element.querySelectorAll('span.sr-only').forEach((srOnly) => {
    const parent = srOnly.parentElement;
    if (!parent) return;
    const animated = [...parent.children].filter(
      (child) => child !== srOnly
        && (child.classList.contains('st-line') || child.hasAttribute('data-split')
          || child.querySelector('.st-line, .st-word')),
    );
    if (!animated.length) return;
    const isTextContainer = (el) => /^(p|h[1-6]|li)$/i.test(el.tagName);
    // a text container (e.g. the hero's <p class="hero-6">) that holds the animated words
    // keeps its element; only the animated words inside it are dropped
    let target = animated.find(isTextContainer) || null;
    if (!target) {
      target = [...parent.children]
        .slice(0, [...parent.children].indexOf(animated[0]))
        .reverse()
        .find((child) => child.tagName.toLowerCase() === 'p' && !child.textContent.trim()) || null;
    }
    animated.forEach((el) => {
      if (isTextContainer(el)) {
        el.querySelectorAll('[data-split], .st-line').forEach((split) => split.remove());
      } else {
        el.remove();
      }
    });
    const text = srOnly.textContent.replace(/\s+/g, ' ').trim();
    if (target) {
      target.textContent = text;
      srOnly.remove();
    } else if (isTextContainer(parent) || /^(a|span|strong|em)$/i.test(parent.tagName)) {
      srOnly.replaceWith(element.ownerDocument.createTextNode(text));
    } else {
      // the importer drops the emptied <p>; re-wrap so the text isn't a stray node
      const p = element.ownerDocument.createElement('p');
      p.className = 'split-text';
      p.textContent = text;
      srOnly.replaceWith(p);
    }
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie consent banner: <div id="msccBannerV2"> (top of body and inside <uhf-cookie-banner>)
    WebImporter.DOMUtils.remove(element, ['#msccBannerV2', 'uhf-cookie-banner']);

    // Sticky chapter navigator (Performance / Display / Local AI / Security / Tech specs):
    // <div id="chapter-module"><section><div class="pointer-events-none sticky ..."> (anchor links only)
    WebImporter.DOMUtils.remove(element, ['[id="chapter-module"] > section > div.sticky']);

    // Sticky bottom buy bar: last <div> child of <main id="primaryArea">
    // (product name + price + Pre-order link, duplicate of the hero buy bar).
    const buyBar = element.querySelector('main#primaryArea > div:last-child');
    if (buyBar && buyBar.id !== 'r-page-footnotes' && !buyBar.querySelector('#r-page-footnotes, section')) {
      buyBar.remove();
    }

    // Duplicated split-text headings (span.sr-only + .st-line animated copy)
    collapseSplitText(element);

    // FAQ "Expand all" / "Collapse all" controls (UI only; the accordion-faq block renders its own)
    WebImporter.DOMUtils.remove(element, ['button[aria-controls$="-accordion"]']);
  }

  if (hookName === TransformHook.afterTransform) {
    // Global header / footer chrome (outside authorable content)
    WebImporter.DOMUtils.remove(element, [
      'div.cge-uhf-header',
      'div.cge-uhf-footer',
      '#uhf-footer',
      'a.uhf-skip-link',
    ]);

    // Tracking iframe (doubleclick floodlight), stylesheet links, noscript
    WebImporter.DOMUtils.remove(element, ['iframe', 'link', 'noscript']);

    // Tracking pixels injected at the end of the page (Bing UET)
    WebImporter.DOMUtils.remove(element, ['img[src*="bat.bing.com"]']);

    // FAQPage JSON-LD carrier added by the import script's preprocess hook
    // (consumed by the accordion-faq parser; not authorable content)
    WebImporter.DOMUtils.remove(element, ['[data-faq-jsonld]']);
  }
}
