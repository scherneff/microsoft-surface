/**
 * bing-footnotes — explore.microsoft.com footnotes and disclaimers band (dark).
 * A list item that starts with a superscript number is a footnote and gets the id
 * `footnote-<n>` that in-page references (#footnote-<n>) point to.
 *
 * Decode tier: template-slotted (the authored list is moved whole).
 */
export default function decorate(block) {
  if (block.querySelector(':scope > .footnotes-list')) return;
  const list = document.createElement('div');
  list.className = 'footnotes-list';
  block.querySelectorAll(':scope > div > div > *').forEach((child) => list.append(child));
  list.querySelectorAll('li').forEach((li) => {
    const sup = li.querySelector('sup');
    const n = sup ? sup.textContent.trim() : '';
    if (/^\d+$/.test(n) && !li.id) li.id = `footnote-${n}`;
  });
  block.setAttribute('role', 'region');
  block.setAttribute('aria-label', 'Footnotes and disclaimers');
  block.replaceChildren(list);
}
