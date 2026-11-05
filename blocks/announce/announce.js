/**
 * announce — store announcement strip (theme night) above the home hero.
 * Template-slotted decode: the message paragraph(s) and the link paragraph are moved as authored;
 * the link's title (the source accessible name) becomes its aria-label.
 *
 * Authoring: one cell — message paragraph, then a paragraph holding only the link.
 */
export default function decorate(block) {
  const paras = [...block.querySelectorAll(':scope > div > div > p')];
  const nodes = paras.map((p) => {
    const a = p.querySelector('a');
    if (a && p.textContent.trim() === a.textContent.trim()) {
      p.className = 'announce-cta';
      a.className = 'announce-link';
      if (a.title) a.setAttribute('aria-label', a.title);
    } else {
      p.className = 'announce-text';
    }
    return p;
  });
  const close = document.createElement('span');
  close.className = 'announce-close';
  close.setAttribute('aria-hidden', 'true');
  block.setAttribute('role', 'alert');
  block.setAttribute('aria-label', 'Announcement banner');
  block.replaceChildren(...nodes, close);
}
