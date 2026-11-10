/**
 * panes — area heading + two ruled panes of text/image pairs (MWF "panes" module:
 * one lead pair on the left, the remaining pairs stacked on the right).
 * Reconstructive decode.
 *
 * Authoring:
 *   - section head: a heading (and optional intro copy / CTA paragraphs) authored as
 *     default content right before the block (reabsorbed, EW8) — or a first row with
 *     no image
 *   - one row per pair: heading + copy + CTA paragraph, and an image
 *
 * @variants block class: (none)
 */

const isCta = (el) => {
  const a = el.tagName === 'P' && el.querySelector('a');
  return !!a && el.textContent.trim() === a.textContent.trim() && !el.querySelector('picture');
};

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function buildHead(nodes) {
  const head = document.createElement('div');
  head.className = 'area-heading';
  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  if (heading) head.append(wrapNode(heading, 'area-heading-title'));
  const body = document.createElement('div');
  body.className = 'area-heading-body';
  const lede = document.createElement('div');
  lede.className = 'area-heading-lede';
  const actions = document.createElement('div');
  actions.className = 'link-group';
  nodes.filter((n) => n !== heading && n.nodeType === 1).forEach((n) => {
    if (isCta(n)) actions.append(n);
    else lede.append(n);
  });
  if (lede.children.length) body.append(lede);
  if (actions.children.length) {
    body.append(actions);
    body.classList.add('has-actions');
  }
  if (body.children.length) head.append(body);
  else head.classList.add('title-only');
  return head;
}

function buildPair(row) {
  const pair = document.createElement('div');
  pair.className = 'panes-pair';
  const textBox = document.createElement('div');
  textBox.className = 'panes-text';
  const cta = document.createElement('div');
  cta.className = 'panes-cta';
  [...row.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol')]
    .filter((el) => !el.querySelector('picture') && !el.closest('ul p, ol p'))
    .forEach((el) => {
      if (isCta(el)) cta.append(el);
      else textBox.append(el);
    });
  if (cta.children.length) textBox.append(cta);
  pair.append(textBox);
  const pic = row.querySelector('picture');
  if (pic) pair.append(wrapNode(pic, 'panes-media'));
  return pair;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .container')) return;
  const headNodes = [];
  const prev = block.parentElement && block.parentElement.previousElementSibling;
  if (prev && prev.classList.contains('default-content-wrapper')) {
    headNodes.push(...prev.children);
    prev.remove();
  }
  const pairs = [];
  [...block.children].forEach((row) => {
    if (row.querySelector('picture')) pairs.push(buildPair(row));
    else [...row.children].forEach((cell) => headNodes.push(...cell.children));
  });

  const grid = document.createElement('div');
  grid.className = 'panes-row';
  const colA = document.createElement('div');
  colA.className = 'panes-col panes-col-a';
  const sep = document.createElement('div');
  sep.className = 'panes-col panes-col-sep';
  sep.innerHTML = '<div class="panes-rule-h"></div><div class="panes-rule-v"></div>';
  const colB = document.createElement('div');
  colB.className = 'panes-col panes-col-b';
  if (pairs.length) colA.append(wrapNode(pairs.shift(), 'panes-item'));
  pairs.forEach((pair, i) => {
    if (i < pairs.length - 1) {
      const item = wrapNode(pair, 'panes-item');
      item.classList.add('panes-item-ruled');
      colB.append(item);
    } else {
      colB.append(pair);
    }
  });
  grid.append(colA);
  if (colB.children.length) grid.append(sep, colB);

  const inner = document.createElement('div');
  inner.className = 'container';
  if (headNodes.length) inner.append(buildHead(headNodes));
  inner.append(grid);
  const outer = document.createElement('div');
  outer.className = 'container';
  outer.append(inner);
  block.replaceChildren(outer);
}
