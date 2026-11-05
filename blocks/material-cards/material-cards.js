/**
 * material-cards — area heading + a row of image cards on white material
 * (MWF content-card / material-card, 1 / 2 / 4 up). Reconstructive decode.
 *
 * Authoring:
 *   - section head: heading, intro copy and CTA paragraphs authored as default content
 *     right before the block (reabsorbed, EW8) — or a first row with no image
 *   - one row per card: image + heading + copy (+ optional CTA paragraphs)
 *
 * @variants block class: peach (peach band background) — default white
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

function buildCard(row) {
  const col = document.createElement('div');
  col.className = 'material-cards-col';
  const card = document.createElement('div');
  card.className = 'card material-card';
  const pic = row.querySelector('picture');
  if (pic) card.append(wrapNode(pic, 'material-cards-media'));
  const body = document.createElement('div');
  body.className = 'card-body';
  const footer = document.createElement('div');
  footer.className = 'card-footer';
  [...row.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol')]
    .filter((el) => !el.querySelector('picture') && !el.closest('ul p, ol p'))
    .forEach((el) => {
      if (isCta(el)) footer.append(el);
      else body.append(el);
    });
  card.append(body, footer);
  col.append(card);
  return col;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .material-cards-cards')) return;
  const headNodes = [];
  const prev = block.parentElement && block.parentElement.previousElementSibling;
  if (prev && prev.classList.contains('default-content-wrapper')) {
    headNodes.push(...prev.children);
    prev.remove();
  }
  const grid = document.createElement('div');
  grid.className = 'material-cards-row';
  [...block.children].forEach((row) => {
    if (row.querySelector('picture')) grid.append(buildCard(row));
    else [...row.children].forEach((cell) => headNodes.push(...cell.children));
  });

  const nodes = [];
  if (headNodes.length) {
    const intro = document.createElement('div');
    intro.className = 'container material-cards-intro';
    intro.append(buildHead(headNodes));
    nodes.push(intro);
  }
  const cards = document.createElement('div');
  cards.className = 'container material-cards-cards';
  cards.append(grid);
  nodes.push(cards);
  block.replaceChildren(...nodes);
}
