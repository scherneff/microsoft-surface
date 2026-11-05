/**
 * follow — "Follow Microsoft" social row (store-logo-footer).
 * Reconstructive decode: the heading row is moved as authored; every linked icon (a link wrapping
 * a picture, in a list or paragraphs) becomes one social link, moved. A link title becomes its
 * aria-label (source accessible name); social links open in a new tab like live.
 */
export default function decorate(block) {
  if (block.querySelector(':scope > .follow-links')) return;
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  const links = document.createElement('div');
  links.className = 'follow-links';
  block.querySelectorAll('a').forEach((a) => {
    if (!a.querySelector('picture, img')) return;
    if (a.title) a.setAttribute('aria-label', a.title);
    a.target = '_blank';
    a.rel = 'noopener';
    links.append(a);
  });
  block.setAttribute('role', 'region');
  block.setAttribute('aria-label', 'follow us on social media');
  block.replaceChildren(...(heading ? [heading] : []), links);
}
