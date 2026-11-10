import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-product-card';
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (!div.textContent.trim() && !div.querySelector('picture')) {
        div.remove();
      } else if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-product-card-image';
      } else {
        div.className = 'cards-product-card-body';
      }
    });

    // group the trailing link paragraphs (Learn more / Buy) into one action row
    const body = li.querySelector('.cards-product-card-body');
    if (body) {
      const squash = (s) => s.replace(/\s+/g, '');
      const linkParas = [...body.children].filter((el) => {
        const links = [...el.querySelectorAll('a')];
        return el.tagName === 'P' && links.length
          && squash(el.textContent) === squash(links.map((x) => x.textContent).join(''));
      });
      if (linkParas.length) {
        const actions = document.createElement('div');
        actions.className = 'cards-product-card-actions';
        linkParas[0].before(actions);
        linkParas.forEach((p) => {
          p.querySelectorAll('a').forEach((a) => {
            a.classList.remove('button');
            a.parentElement.classList.remove('button-container');
            actions.append(a);
          });
          p.remove();
        });
      }
    }

    // text leads, product image sits beneath it
    const image = li.querySelector('.cards-product-card-image');
    if (image) li.append(image);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    // only same-origin (media bus) images can be re-optimized; external URLs keep their picture
    const sameOrigin = new URL(img.src, window.location.href).origin === window.location.origin;
    if (sameOrigin) {
      img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
    } else {
      img.loading = 'lazy';
      img.decoding = 'async';
    }
  });

  block.replaceChildren(ul);
}
