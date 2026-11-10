/* bing.js — behaviour for the Bing program page (explore.microsoft.com variant).
   Header: Features / More dropdowns, search expand, mobile drawer, scrolled shadow.
   Main: slider pagers (prev / next / dots). Implements only behaviours observed on live. */
(() => {
  const nav = document.getElementById('nav');

  /* ---------- scrolled shadow on the sticky nav ---------- */
  const onScroll = () => nav.classList.toggle('common-nav--scrolled', window.scrollY > 0);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- dropdown menus (Features, More) ---------- */
  const toggles = [...nav.querySelectorAll('.common-nav__items .common-nav-item__toggle')];
  const panelOf = (t) => document.getElementById(t.getAttribute('aria-controls'));
  const closeMenu = (t, focus) => {
    if (t.getAttribute('aria-expanded') !== 'true') return;
    t.setAttribute('aria-expanded', 'false');
    const panel = panelOf(t);
    panel.classList.remove('is-open');
    panel.hidden = true;
    document.documentElement.style.overflow = '';
    if (focus) t.focus();
  };
  const closeAll = (except) => toggles.forEach((t) => t !== except && closeMenu(t));
  toggles.forEach((t) => {
    t.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = t.getAttribute('aria-expanded') === 'true';
      closeAll(t);
      if (open) { closeMenu(t); return; }
      t.setAttribute('aria-expanded', 'true');
      const panel = panelOf(t);
      const item = t.closest('.common-nav-item');
      panel.style.setProperty('--float-top', `${nav.getBoundingClientRect().bottom - 6}px`);
      panel.style.setProperty('--panel-left', `${item.getBoundingClientRect().left - 12}px`);
      panel.hidden = false;
      void panel.offsetWidth; // start the opacity transition from 0
      panel.classList.add('is-open');
      document.documentElement.style.overflow = 'hidden';
      const first = panel.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    });
  });
  document.addEventListener('click', (e) => {
    toggles.forEach((t) => {
      const panel = panelOf(t);
      const inside = t.contains(e.target) || panel.querySelector('ul').contains(e.target);
      if (!inside) closeMenu(t);
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = toggles.find((t) => t.getAttribute('aria-expanded') === 'true');
    if (open) closeMenu(open, true);
    if (!drawer.hidden) closeDrawer();
  });

  /* ---------- header search (expands; Blog/Support fold into "More") ---------- */
  const searchToggle = nav.querySelector('.common-nav__search-toggle');
  const searchForm = document.getElementById('header-search-form');
  const searchClose = nav.querySelector('.common-nav__search-close');
  const moreItem = nav.querySelector('.common-nav__more-item');
  const setSearch = (open) => {
    nav.classList.toggle('common-nav--search-open', open);
    searchToggle.hidden = open;
    searchToggle.setAttribute('aria-expanded', String(open));
    searchForm.hidden = !open;
    searchClose.hidden = !open;
    moreItem.hidden = !open;
    if (!open) closeAll();
  };
  searchToggle.addEventListener('click', () => { setSearch(true); searchForm.querySelector('input').focus(); });
  searchClose.addEventListener('click', () => { setSearch(false); searchToggle.focus(); });

  /* ---------- mobile drawer ---------- */
  const drawer = document.getElementById('nav-drawer');
  const drawerToggle = nav.querySelector('.common-nav__mobile-toggle');
  const openDrawer = () => {
    drawer.hidden = false;
    drawerToggle.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
    drawer.querySelector('.nav-drawer__close-button').focus();
  };
  function closeDrawer() {
    drawer.hidden = true;
    drawerToggle.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    drawerToggle.focus();
  }
  drawerToggle.addEventListener('click', () => (drawer.hidden ? openDrawer() : closeDrawer()));
  drawer.querySelector('.nav-drawer__close-button').addEventListener('click', closeDrawer);
  drawer.querySelector('.nav-drawer__overlay').addEventListener('click', closeDrawer);
  drawer.querySelectorAll('.nav-drawer__sub-toggle').forEach((b) => {
    b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', String(!open));
      document.getElementById(b.getAttribute('aria-controls')).hidden = open;
    });
  });

  /* ---------- scroll reveal (live: [data-reveal] flips to "true" on entering the viewport, once) ---------- */
  const revealables = [...document.querySelectorAll('[data-reveal]:not([data-reveal-ignore])')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.setAttribute('data-reveal', 'true');
        io.unobserve(e.target);
      });
    }, { threshold: 0 });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.setAttribute('data-reveal', 'true'));
  }

  /* ---------- sliders ---------- */
  document.querySelectorAll('[data-slider]').forEach((slider) => {
    const container = slider.closest('.block-slider__outer-container');
    const pages = [...slider.querySelectorAll('.common-pager__page')];
    const dots = [...container.querySelectorAll('.block-slider__selector')];
    let index = 0;
    const go = (i) => {
      index = (i + pages.length) % pages.length;
      pages.forEach((p, n) => {
        p.classList.toggle('common-pager__page--active', n === index);
        p.classList.toggle('common-pager__page--before', n < index);
        p.classList.toggle('common-pager__page--after', n > index);
      });
      dots.forEach((d, n) => (n === index ? d.setAttribute('aria-selected', 'true') : d.removeAttribute('aria-selected')));
    };
    slider.querySelector('.common-pager__button--prev').addEventListener('click', () => go(index - 1));
    slider.querySelector('.common-pager__button--next').addEventListener('click', () => go(index + 1));
    dots.forEach((d, n) => d.addEventListener('click', () => go(n)));
  });
})();
