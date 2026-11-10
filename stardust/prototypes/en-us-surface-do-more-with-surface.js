/* en-us-surface-do-more-with-surface — page behaviours observed on live (motion-observe):
   1. MWF fixed-sticky back-to-top: while its in-flow slot is below the fold (and the viewport is > 540 px),
      the bar is `.stuck` (position fixed, bottom 0, full width) and fades in with opacity 1s cubic-bezier(.19,1,.22,1)
      once the page has scrolled; at <= 540 px `.stuck` stays static (live back-to-top sheet).
   2. Article search button toggles `activeSearch` on the search group and focuses the field. */
(() => {
  const wrap = document.querySelector('.dm-back-to-top');
  const bar = wrap && wrap.querySelector('.dm-back-to-top__bar');
  if (bar) {
    const SHOW_AFTER = 100; // px scrolled before the stuck bar fades in (live: hidden at 30, shown at 189)
    const update = () => {
      const below = wrap.getBoundingClientRect().top + bar.offsetHeight > window.innerHeight;
      const stuck = below && window.innerWidth > 540;
      bar.classList.toggle('stuck', stuck);
      bar.style.opacity = !stuck || window.scrollY > SHOW_AFTER ? '1' : '0';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    bar.querySelector('a').addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const skip = document.querySelector('.uhf-skip-link');
      if (skip) skip.focus({ preventScroll: true });
    });
  }
  const group = document.querySelector('.dm-search');
  if (group) {
    group.querySelector('.dm-search__btn').addEventListener('click', (e) => {
      e.preventDefault();
      group.classList.toggle('activeSearch');
      group.querySelector('.dm-search__input').focus();
    });
  }
})();
