/**
 * explore — closing link list (heading + inline row of links) with an optional
 * "follow" row of linked social icons (MWF link-list + social-follow modules).
 * Reconstructive decode: rows are classified by content.
 *
 * Authoring rows:
 *   - links: a heading + a list of links
 *   - follow: a label paragraph + a list of linked icon images (image inside the link,
 *     or an image followed by its link)
 *
 * @variants block class: (none); `stacked` — a centred row of icon-over-label links
 *   (accessibility; no label paragraph)
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

let uid = 0;

function buildLinks(row) {
  const nav = document.createElement('nav');
  nav.className = 'explore-links';
  const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    uid += 1;
    if (!heading.id) heading.id = `explore-heading-${uid}`;
    nav.setAttribute('aria-labelledby', heading.id);
    nav.append(heading);
  }
  row.querySelectorAll('ul, ol, p').forEach((el) => {
    if (!el.closest('ul p, ol p')) nav.append(el);
  });
  const outer = wrapNode(wrapNode(nav, 'container'), 'container');
  return outer;
}

function buildFollow(row) {
  const section = document.createElement('section');
  section.className = 'explore-follow';
  const label = [...row.querySelectorAll('p')].find((p) => !p.querySelector('a, picture'));
  if (label) {
    uid += 1;
    const box = wrapNode(label, 'explore-follow-label');
    box.id = `explore-follow-${uid}`;
    section.setAttribute('aria-labelledby', box.id);
    section.append(box);
  }
  let list = row.querySelector('ul');
  if (!list) {
    list = document.createElement('ul');
    [...row.querySelectorAll('a')].forEach((a) => {
      const li = document.createElement('li');
      li.append(a);
      list.append(li);
    });
  }
  // an image authored beside its link (not inside it) moves into the link
  list.querySelectorAll('li').forEach((li) => {
    const a = li.querySelector('a');
    const pic = li.querySelector('picture');
    if (a && pic && !a.contains(pic)) a.prepend(pic);
  });
  section.append(list);
  return wrapNode(section, 'container');
}

export default function decorate(block) {
  if (block.querySelector(':scope > .container')) return;
  const nodes = [];
  [...block.children].forEach((row) => {
    const linkedPics = [...row.querySelectorAll('picture')];
    if (linkedPics.length) nodes.push(buildFollow(row));
    else nodes.push(buildLinks(row));
  });
  block.replaceChildren(...nodes);
}
