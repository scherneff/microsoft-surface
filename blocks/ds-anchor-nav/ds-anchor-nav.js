/**
 * ds-anchor-nav — sticky in-page section navigation (Microsoft "reimagine" secondary sticky nav):
 * a horizontal list of anchor links to the page's sections, the current one marked while
 * scrolling, a scroll button when the list overflows. Template-slotted decode.
 *
 * Authoring: one cell holding a list of links to `#<section id>` (section metadata `id`).
 *
 * @variants block class: (none)
 */

export default function decorate(block) {
  if (block.querySelector(':scope > nav')) return;
  const list = block.querySelector('ul, ol');
  if (!list) return;
  const nav = document.createElement('nav');
  nav.className = 'ds-anchor-nav-bar';
  nav.setAttribute('aria-label', 'Page sections');
  const scroller = document.createElement('div');
  scroller.className = 'ds-anchor-nav-scroller';
  scroller.append(list);
  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'ds-anchor-nav-more';
  more.setAttribute('aria-label', 'Scroll section links');
  more.addEventListener('click', () => scroller.scrollBy({ left: scroller.clientWidth / 2, behavior: 'smooth' }));
  nav.append(scroller, more);
  block.replaceChildren(nav);

  const links = [...list.querySelectorAll('a[href^="#"]')];
  if (links[0]) links[0].setAttribute('aria-current', 'true');
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => {
        if (a.getAttribute('href') === `#${e.target.id}`) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  const watch = () => links.forEach((a) => {
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (target) io.observe(target);
  });
  // sections take their ids when their blocks decorate (lazy) — observe once the page settled
  window.setTimeout(watch, 3000);
}
