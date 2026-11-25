/*
 * Modal: links to a /modals/ page open that page in a dialog instead of navigating
 * (wired up in scripts.js). Based on https://www.aem.live/developer/block-collection/modal
 */

// eslint-disable-next-line import/no-cycle
import { loadFragment } from '../fragment/fragment.js';
import { loadCSS } from '../../scripts/aem.js';

const CLOSE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" aria-hidden="true" focusable="false"><path fill="currentColor" d="M10.85.85 10.15.15 5.5 4.79.85.15.15.85 4.79 5.5.15 10.15l.7.7L5.5 6.21l4.65 4.64.7-.7L6.21 5.5z"/></svg>';

/** the local preview serves workspace content under /content/: prefer that copy there */
async function fetchFragment(path) {
  if (window.location.pathname.startsWith('/content/') && !path.startsWith('/content/')) {
    const local = await loadFragment(`/content${path}`);
    if (local) return local;
  }
  return loadFragment(path);
}

export async function createModal(contentNodes) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/modal/modal.css`);
  const dialog = document.createElement('dialog');
  dialog.className = 'modal';

  const content = document.createElement('div');
  content.className = 'modal-content';
  content.append(...contentNodes);
  const heading = content.querySelector('h1, h2, h3');
  if (heading) {
    heading.id = heading.id || 'modal-title';
    dialog.setAttribute('aria-labelledby', heading.id);
  }

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'modal-close';
  close.setAttribute('aria-label', 'Close');
  close.innerHTML = CLOSE_ICON;
  close.addEventListener('click', () => dialog.close());

  // a click on the backdrop (outside the sheet) closes it
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    dialog.remove();
  });
  dialog.append(content, close);

  const showModal = () => {
    document.body.append(dialog);
    dialog.showModal();
    content.scrollTop = 0;
    document.body.classList.add('modal-open');
  };
  return { dialog, showModal };
}

export async function openModal(href) {
  const path = new URL(href, window.location.href).pathname;
  const fragment = await fetchFragment(path);
  if (!fragment) {
    window.location.href = href;
    return;
  }
  const { showModal } = await createModal([...fragment.childNodes]);
  showModal();
}
