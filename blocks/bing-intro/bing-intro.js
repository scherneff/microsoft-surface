/**
 * bing-intro — explore.microsoft.com intro: the Bing image of the day behind a centred
 * Bing search box (the form submits to the authored search link in a new tab).
 *
 * Cell, by content: picture = background image; paragraph holding a link = search action
 * (href = form action, text = button label); other paragraph = input placeholder.
 *
 * Decode tier: template-slotted.
 *
 * @ew-exempt search link — its href becomes the form action and its text the button aria-label
 * @ew-exempt placeholder paragraph — becomes the input placeholder attribute
 */

const SEARCH_ICON = '<svg width="1em" height="1em" viewBox="0 0 18 18" fill="none" aria-hidden="true">'
  + '<path d="M7.294 0c2.01 0 3.834.819 5.155 2.14a7.272 7.272 0 0 1 .722 9.467l-.077.103 4.607 '
  + '4.607a.978.978 0 0 1-1.337 1.43l-.047-.046-4.607-4.607a7.272 7.272 0 0 1-9.57-.645A7.272 '
  + '7.272 0 0 1 0 7.294c0-2.01.819-3.833 2.14-5.154A7.272 7.272 0 0 1 7.294 0Zm.081 2c-1.488 '
  + '0-2.832.6-3.804 1.571A5.358 5.358 0 0 0 2 7.375c0 1.488.6 2.832 1.571 3.804a5.358 5.358 0 '
  + '0 0 3.804 1.571 5.353 5.353 0 0 0 3.71-1.486.99.99 0 0 1 .178-.177 5.353 5.353 0 0 0 '
  + '1.487-3.712c0-1.488-.6-2.832-1.571-3.804A5.358 5.358 0 0 0 7.375 2Z" fill="currentColor"/>'
  + '</svg>';

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  node.append(...children);
  return node;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .intro-frame')) return;
  const bg = el('div', { class: 'intro-bg' });
  let action = 'https://www.bing.com/search';
  let label = 'Search';
  let placeholder = '';
  const kept = [];
  block.querySelectorAll(':scope > div > div > *').forEach((child) => {
    const pic = child.matches('picture, img') ? child : child.querySelector('picture, img');
    const link = child.querySelector('a[href]');
    if (pic) {
      bg.append(pic.closest('picture') || pic);
    } else if (link) {
      action = link.href;
      label = link.textContent.trim();
    } else if (child.textContent.trim()) {
      placeholder = child.textContent.trim();
    } else {
      kept.push(child);
    }
  });
  bg.querySelectorAll('img').forEach((img) => {
    img.setAttribute('loading', 'eager');
    img.setAttribute('fetchpriority', 'high');
  });

  const input = el('input', {
    class: 'search-input', type: 'search', name: 'q', placeholder, 'aria-label': placeholder || label,
  });
  const button = el('button', { class: 'search-button', type: 'submit', 'aria-label': label });
  button.innerHTML = SEARCH_ICON;
  const form = el('form', {
    class: 'search-form', role: 'search', action, target: '_blank',
  }, input, button);
  const intro = el(
    'div',
    { class: 'intro' },
    el('div', { class: 'intro-spacer' }),
    el('div', { class: 'search' }, form),
    el('div', { class: 'intro-spacer' }),
    ...kept,
  );
  block.replaceChildren(bg, el('div', { class: 'intro-frame' }, intro));
}
