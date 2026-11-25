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

  // like the source, the sheet slides up on open and back down on close
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let closing = false;
  const closeModal = () => {
    if (closing || !dialog.open) return;
    if (reducedMotion.matches) {
      dialog.close();
      return;
    }
    closing = true;
    dialog.classList.remove('is-open');
    const done = (e) => {
      if (e && (e.target !== dialog || !/transform|translate/.test(e.propertyName))) return;
      dialog.removeEventListener('transitionend', done);
      if (dialog.open) dialog.close();
    };
    dialog.addEventListener('transitionend', done);
    setTimeout(() => done(), 450);
  };
  close.addEventListener('click', closeModal);
  // Escape: animate out instead of the instant native close
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeModal();
  });
  // a click on the backdrop (outside the sheet) closes it
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) closeModal();
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
    // let the off-screen state render first so the slide-up runs
    requestAnimationFrame(() => requestAnimationFrame(() => dialog.classList.add('is-open')));
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
