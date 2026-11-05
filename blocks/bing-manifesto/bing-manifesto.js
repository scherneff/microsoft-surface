/**
 * bing-manifesto — explore.microsoft.com manifesto: a centred statement heading over a
 * layered decorative image, inside a rounded inner background. Scroll reveal like live.
 *
 * Cell, by content: picture = layered image; heading (and any other text) = the statement.
 *
 * Decode tier: template-slotted.
 */

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  node.append(...children);
  return node;
}

function reveal(block) {
  block.setAttribute('data-reveal', '');
  if (!('IntersectionObserver' in window)) {
    block.setAttribute('data-reveal', 'true');
    return;
  }
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    block.setAttribute('data-reveal', 'true');
    io.disconnect();
  }, { threshold: 0 });
  io.observe(block);
}

/** Live wraps the statement copy in a p inside the heading; move the heading's own nodes. */
function wrapHeadingCopy(heading) {
  if (heading.querySelector(':scope > p')) return;
  const p = document.createElement('p');
  p.append(...heading.childNodes);
  heading.append(p);
}

export default function decorate(block) {
  if (block.querySelector(':scope > .manifesto-frame')) return;
  const layered = el('div', { class: 'layered-image' });
  const manifesto = el('div', { class: 'manifesto' });
  block.querySelectorAll(':scope > div > div > *').forEach((child) => {
    const pic = child.matches('picture, img') ? child : child.querySelector('picture, img');
    if (pic && !child.textContent.trim()) {
      layered.append(pic.closest('picture') || pic);
    } else {
      if (/^H[1-6]$/.test(child.tagName)) wrapHeadingCopy(child);
      manifesto.append(child);
    }
  });
  const frame = el(
    'div',
    { class: 'manifesto-frame', 'data-reveal-inner': '' },
    el('div', { class: 'manifesto-bg' }, layered),
    el('div', { class: 'manifesto-content' }, manifesto),
  );
  block.replaceChildren(frame);
  reveal(block);
}
