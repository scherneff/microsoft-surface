/**
 * backdrop — a section background image (MWF grid-image layout container: the image covers
 * the whole section, the section's other blocks and default content sit on top of it).
 * Template-slotted decode: the authored picture stays in its cell; CSS lifts the block
 * wrapper behind the section content.
 *
 * Authoring: one row, one cell, one decorative image (empty alt). Put the block first in
 * the section whose background it is.
 *
 * Page theme: a page whose metadata carries `Theme | dark` gets the dark MWF page tokens
 * (black page, dark UHF header and footer) — page-scoped overrides shipped here while the
 * foundation is frozen (stardust/rollout/foundation-requests.md).
 *
 * @variants block class: (none)
 */
export default function decorate(block) {
  const section = block.closest('.section');
  if (section) section.classList.add('has-backdrop');
  block.querySelectorAll('img').forEach((img) => {
    img.setAttribute('loading', 'lazy');
  });
}
