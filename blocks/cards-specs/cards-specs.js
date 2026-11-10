import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-specs-item';
    // text-only by design, but tolerate an optional image cell
    [...row.children].forEach((cell) => {
      if (!cell.textContent.trim() && !cell.querySelector('picture')) return;
      const onlyPicture = cell.children.length === 1 && cell.querySelector('picture');
      cell.className = onlyPicture ? 'cards-specs-item-image' : 'cards-specs-item-body';
      li.append(cell);
    });
    if (li.children.length) ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    // keep external (cross-origin) images as authored; optimize same-origin media only
    if (new URL(img.src, window.location.href).origin !== window.location.origin) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  block.replaceChildren(ul);
}
