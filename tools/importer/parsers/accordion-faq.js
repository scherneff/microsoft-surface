/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base: accordion.
 * Source: https://www.microsoft.com/en-us/surface/devices/surface-laptop-ultra
 * Selector (page-templates.json): [id="Surface Laptop Pro FAQs"] [id$="-accordion"]
 *
 * Output (accordion convention, 2 columns, one row per Q&A):
 *   cell 1 = question
 *   cell 2 = answer
 *
 * Items: block-level div wrappers (one per question) holding h2 > button > span (question).
 * Collapsed answers are not rendered in the DOM (base-ui only mounts the open panel). Answer
 * sources, in priority order - all are real page content, nothing is invented:
 *   1. a rendered panel inside the item (aria-controls target / sibling of the heading)
 *   2. the section's FAQPage JSON-LD (<script type="application/ld+json">, acceptedAnswer.text)
 *   3. a carrier element [data-faq-jsonld] holding the same JSON. helix-importer strips
 *      <script> in preProcess before transformers/parsers run, so the import script's
 *      `preprocess` hook should copy the FAQPage JSON into such an element.
 * Answers are matched to questions by normalized question text, then by index.
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const norm = (t) => clean(t).toLowerCase().replace(/[^a-z0-9+]+/g, ' ').trim();

  // ---- FAQPage structured data ----
  const scope = element.closest('[id="Surface Laptop Pro FAQs"]') || element.parentElement || document;
  const jsonSources = [
    ...scope.querySelectorAll('script[type="application/ld+json"], [data-faq-jsonld]'),
    ...document.querySelectorAll('script[type="application/ld+json"], [data-faq-jsonld]'),
  ];
  let faqEntries = [];
  for (const node of jsonSources) {
    try {
      const raw = node.getAttribute('data-faq-jsonld') || node.textContent;
      const data = JSON.parse(raw);
      const list = (Array.isArray(data) ? data : [data]).flatMap((d) => (d['@graph'] || [d]));
      const faq = list.find((d) => d && d['@type'] === 'FAQPage' && Array.isArray(d.mainEntity));
      if (faq) {
        faqEntries = faq.mainEntity.map((q) => ({
          name: q.name || '',
          html: (q.acceptedAnswer && q.acceptedAnswer.text) || '',
        }));
        break;
      }
    } catch (e) { /* not JSON / not FAQ */ }
  }
  const answerFromLd = (question, index, total) => {
    let entry = faqEntries.find((e) => norm(e.name) === norm(question));
    if (!entry && faqEntries.length === total) entry = faqEntries[index];
    if (!entry || !entry.html) return [];
    const holder = document.createElement('div');
    holder.innerHTML = entry.html;
    const nodes = [...holder.children].filter((el) => clean(el.textContent) || el.querySelector('img, a'));
    if (!nodes.length && clean(holder.textContent)) {
      const p = document.createElement('p');
      p.textContent = clean(holder.textContent);
      return [p];
    }
    return nodes;
  };

  // ---- items ----
  let items = [...element.querySelectorAll(':scope > div')].filter((d) => d.querySelector('h2, h3, button'));
  if (!items.length) items = [...element.querySelectorAll('h2, h3')].map((h) => h.parentElement);

  const questions = items.map((item) => {
    const btn = item.querySelector('h2 button, h3 button, button');
    const span = btn && btn.querySelector('span');
    const heading = item.querySelector('h2, h3');
    return clean((span || btn || heading || item).textContent);
  });

  const cells = [];
  items.forEach((item, i) => {
    const question = questions[i];
    if (!question) return;

    // 1. rendered panel
    let answer = [];
    const btn = item.querySelector('button[aria-controls]');
    const ctrl = btn && btn.getAttribute('aria-controls');
    const heading = item.querySelector('h2, h3');
    const panel = (ctrl && item.querySelector(`[id="${ctrl}"]`))
      || [...item.children].find((c) => c !== heading && clean(c.textContent));
    if (panel) {
      const parts = [...panel.querySelectorAll('.rich-text-content > *')];
      answer = (parts.length ? parts : [...panel.querySelectorAll('p, ul, ol')])
        .filter((el) => clean(el.textContent) || el.querySelector('img'));
    }
    // 2/3. structured data
    if (!answer.length) answer = answerFromLd(question, i, items.length);

    cells.push([question, answer.length ? answer : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
