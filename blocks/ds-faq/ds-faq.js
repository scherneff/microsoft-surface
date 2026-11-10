/**
 * ds-faq — numbered FAQ accordion (Microsoft "reimagine" ocr-faq) with Expand all / Collapse all.
 * Reconstructive decode.
 *
 * Authoring rows:
 *   - heading: a row with only an h2
 *   - question: three cells — the number label paragraph ("01/"), the question heading (h3),
 *     the answer (paragraphs, lists, links)
 *
 * @variants block class: (none)
 * @ew-exempt "Expand all" / "Collapse all" — accordion control labels (live UI strings, no
 *   authored source); each question's toggle is an icon button labelled by its heading
 */

function div(className, ...children) {
  const d = document.createElement('div');
  d.className = className;
  d.append(...children);
  return d;
}

let uid = 0;

export default function decorate(block) {
  if (block.querySelector(':scope > .ds-faq-inner')) return;
  const inner = div('ds-faq-inner');
  const head = div('ds-faq-head');
  const list = div('ds-faq-list');
  const items = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 3) {
      head.prepend(div('ds-faq-title', ...row.querySelectorAll('h1, h2, h3')));
      return;
    }
    uid += 1;
    const [labelCell, qCell, aCell] = cells;
    const label = div('ds-faq-label', ...labelCell.children);
    label.id = `ds-faq-n-${uid}`;
    const heading = qCell.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading && !heading.id) heading.id = `ds-faq-q-${uid}`;
    const body = div('ds-faq-body', ...aCell.children);
    body.id = `ds-faq-a-${uid}`;
    body.hidden = true;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'ds-faq-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', body.id);
    if (heading) toggle.setAttribute('aria-labelledby', `${label.id} ${heading.id}`);
    const question = div('ds-faq-question', ...qCell.children);
    const header = div('ds-faq-header', label, question, toggle);
    const item = div('ds-faq-item', header, body);
    const set = (open) => {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      body.hidden = !open;
      item.classList.toggle('open', open);
    };
    header.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      set(body.hidden);
    });
    items.push(set);
    list.append(item);
  });

  const expand = document.createElement('button');
  expand.type = 'button';
  expand.className = 'ds-faq-all';
  expand.textContent = 'Expand all';
  const collapse = document.createElement('button');
  collapse.type = 'button';
  collapse.className = 'ds-faq-all';
  collapse.textContent = 'Collapse all';
  collapse.disabled = true;
  expand.addEventListener('click', () => {
    items.forEach((set) => set(true));
    expand.disabled = true;
    collapse.disabled = false;
  });
  collapse.addEventListener('click', () => {
    items.forEach((set) => set(false));
    collapse.disabled = true;
    expand.disabled = false;
  });
  head.append(div('ds-faq-actions', expand, collapse));
  inner.append(head, list);
  block.replaceChildren(inner);
  const section = block.closest('.section');
  if (section && section.dataset.id && !section.id) section.id = section.dataset.id;
}
