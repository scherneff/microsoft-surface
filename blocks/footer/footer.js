/**
 * Fetches the footer fragment (metadata-independent):
 * /content/footer.plain.html (local preview) first, then /footer.plain.html (DA/EDS).
 * @returns {Promise<HTMLElement|null>} wrapper holding the fragment's section divs
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();
  // fragment image paths are relative to the fragment, not to the current page
  wrapper.querySelectorAll('img[src]').forEach((img) => {
    img.setAttribute('src', new URL(img.getAttribute('src'), resp.url).href);
  });
  return wrapper;
}

function createLink(a) {
  const link = document.createElement('a');
  link.href = a.getAttribute('href');
  [...a.childNodes].forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) {
      if (n.textContent.trim()) link.append(document.createTextNode(n.textContent.trim()));
      return;
    }
    const img = n.tagName === 'PICTURE' ? n.querySelector('img') : n;
    if (img && img.tagName === 'IMG') {
      const icon = document.createElement('img');
      icon.src = img.getAttribute('src');
      icon.alt = img.getAttribute('alt') || '';
      icon.className = 'footer-link-img';
      link.append(icon);
    } else {
      link.append(document.createTextNode(n.textContent.trim()));
    }
  });
  return link;
}

/** Section 1: each bold title paragraph + following list = one link column (stacked on mobile) */
function buildColumns(section) {
  const nav = document.createElement('nav');
  nav.className = 'footer-columns';
  nav.setAttribute('aria-label', 'Footer');
  [...section.children].forEach((el) => {
    if (el.tagName !== 'P') return;
    const list = el.nextElementSibling;
    if (!list || list.tagName !== 'UL') return;
    const column = document.createElement('div');
    column.className = 'footer-column';
    const heading = document.createElement('h2');
    heading.className = 'footer-column-title';
    heading.textContent = el.textContent.trim();
    const links = document.createElement('ul');
    links.className = 'footer-column-links';
    [...list.querySelectorAll(':scope > li > a, :scope > li > p > a')].forEach((a) => {
      const li = document.createElement('li');
      li.append(createLink(a));
      links.append(li);
    });
    column.append(heading, links);
    nav.append(column);
  });
  return nav;
}

/** Section 2: paragraph links = legal row (first = locale), list = legal menu (+ copyright) */
function buildBase(section) {
  const base = document.createElement('div');
  base.className = 'footer-base';
  const legal = document.createElement('div');
  legal.className = 'footer-legal';
  [...section.querySelectorAll(':scope > p')].forEach((p, i) => {
    const a = p.querySelector('a');
    if (!a) return;
    const link = createLink(a);
    // first legal link is the locale picker (globe glyph drawn in CSS, like the source icon font)
    if (i === 0) link.classList.add('footer-locale');
    legal.append(link);
  });
  const menu = document.createElement('ul');
  menu.className = 'footer-menu';
  [...section.querySelectorAll(':scope > ul > li')].forEach((li) => {
    const item = document.createElement('li');
    const a = li.querySelector('a');
    if (a) {
      item.append(createLink(a));
    } else {
      item.className = 'footer-copyright';
      item.textContent = li.textContent.trim();
    }
    menu.append(item);
  });
  base.append(legal, menu);
  return base;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;
  const [columnsSection, baseSection] = [...fragment.children].filter((el) => el.tagName === 'DIV');

  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  if (columnsSection) inner.append(buildColumns(columnsSection));
  if (baseSection) inner.append(buildBase(baseSection));
  block.append(inner);
}
