const SVG_NS = 'http://www.w3.org/2000/svg';
const PLUS_PATH = 'M6.33 0c.28 0 .5.22.5.5v5.33h5.34a.5.5 0 0 1 0 1H6.83v5.34a.5.5 0 0 1-1 0V6.83H.5a.5.5 0 0 1 0-1h5.33V.5c0-.28.23-.5.5-.5';
const MINUS_PATH = 'M12.17 0a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1z';

function buildIcon(path, viewBox) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const p = document.createElementNS(SVG_NS, 'path');
  p.setAttribute('fill', 'currentColor');
  p.setAttribute('d', path);
  svg.append(p);
  return svg;
}

function buildControl(label, className, icon, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.append(label, icon);
  button.addEventListener('click', onClick);
  return button;
}

/**
 * The FAQ heading is usually authored as default content right above the block.
 * Move it into the block header so it can sit beside the Expand/Collapse controls.
 */
function adoptPrecedingHeading(block) {
  const wrapper = block.parentElement;
  const prev = wrapper?.previousElementSibling;
  if (!prev?.classList.contains('default-content-wrapper')) return null;
  const heading = prev.lastElementChild;
  if (!heading || !/^H[1-6]$/.test(heading.tagName)) return null;
  const title = document.createElement('div');
  title.className = 'accordion-faq-title';
  title.append(heading);
  if (!prev.children.length && !prev.textContent.trim()) prev.remove();
  return title;
}

export default function decorate(block) {
  const header = document.createElement('div');
  header.className = 'accordion-faq-header';
  const list = document.createElement('div');
  list.className = 'accordion-faq-items';

  [...block.children].forEach((row) => {
    const cells = [...row.children].filter((c) => c.textContent.trim() || c.querySelector('img'));
    if (!cells.length) return;

    // a single-cell heading row is the block title, shown beside the controls
    if (cells.length === 1 && cells[0].querySelector('h1, h2, h3, h4, h5, h6') && !list.children.length) {
      const title = document.createElement('div');
      title.className = 'accordion-faq-title';
      title.append(...cells[0].childNodes);
      header.append(title);
      return;
    }

    const [label, ...bodyCells] = cells;
    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';
    const text = document.createElement('span');
    text.className = 'accordion-faq-item-text';
    text.append(...label.childNodes);
    const icon = document.createElement('span');
    icon.className = 'accordion-faq-item-icon';
    icon.append(buildIcon(PLUS_PATH, '0 0 13 13'));
    summary.append(text, icon);

    const body = document.createElement('div');
    body.className = 'accordion-faq-item-body';
    bodyCells.forEach((cell) => body.append(...cell.childNodes));

    const details = document.createElement('details');
    details.className = 'accordion-faq-item';
    details.append(summary, body);
    list.append(details);
  });

  if (!header.children.length) {
    const title = adoptPrecedingHeading(block);
    if (title) header.append(title);
  }

  const items = () => [...list.querySelectorAll('.accordion-faq-item')];
  const expand = buildControl('Expand all', 'accordion-faq-expand', buildIcon(PLUS_PATH, '0 0 13 13'), () => {
    items().forEach((d) => { d.open = true; });
  });
  const collapse = buildControl('Collapse all', 'accordion-faq-collapse', buildIcon(MINUS_PATH, '0 0 13 1'), () => {
    items().forEach((d) => { d.open = false; });
  });
  const controlledBy = header.querySelector('h1, h2, h3, h4, h5, h6')?.textContent.trim();
  if (controlledBy) {
    expand.setAttribute('aria-label', `Expand all ${controlledBy.toLowerCase()}`);
    collapse.setAttribute('aria-label', `Collapse all ${controlledBy.toLowerCase()}`);
  }

  const controls = document.createElement('div');
  controls.className = 'accordion-faq-controls';
  controls.append(expand, collapse);
  header.append(controls);

  const syncControls = () => {
    const all = items();
    expand.disabled = all.every((d) => d.open);
    collapse.disabled = all.every((d) => !d.open);
  };
  list.addEventListener('toggle', syncControls, true);
  syncControls();

  block.replaceChildren(header, list);
}
