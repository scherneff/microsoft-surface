/* support.js — UHF "Support" header open states recorded in stardust/chrome/header-contract-support.json
   (search open/cancel at 1440 and 390; All Microsoft, Support category menu and their sub-menus at 390),
   plus the desktop dropdown toggles and the sign-in callout dismiss. Search submission is wired later
   (dynamic-features row 2) — the form is rendered statically. */
(() => {
  const header = document.getElementById('uhf-header');
  if (!header) return;
  header.classList.add('js'); // live UHF swaps no-js → js on its header (observed class mutation)
  const q = (s, r = header) => r.querySelector(s);
  const qa = (s, r = header) => [...r.querySelectorAll(s)];

  const setExpanded = (btn, open) => btn && btn.setAttribute('aria-expanded', String(open));
  const closeSubs = (except) => qa('.uhf-nav__toggle, .uhf-allms__toggle').forEach((b) => { if (b !== except) setExpanded(b, false); });
  const closeAll = () => {
    header.classList.remove('is-allms', 'is-cat');
    setExpanded(q('.uhf-header__burger'), false);
    setExpanded(q('.uhf-header__catbtn'), false);
    setExpanded(q('.uhf-allms__btn'), false);
    closeSubs();
  };

  // mobile: All Microsoft (hamburger)
  q('.uhf-header__burger').addEventListener('click', (e) => {
    const open = !header.classList.contains('is-allms');
    closeAll();
    header.classList.toggle('is-allms', open);
    setExpanded(e.currentTarget, open);
  });
  // mobile: Support category menu
  q('.uhf-header__catbtn').addEventListener('click', (e) => {
    const open = !header.classList.contains('is-cat');
    closeAll();
    header.classList.toggle('is-cat', open);
    setExpanded(e.currentTarget, open);
  });
  // desktop: All Microsoft
  q('.uhf-allms__btn').addEventListener('click', (e) => {
    const open = e.currentTarget.getAttribute('aria-expanded') !== 'true';
    closeAll();
    setExpanded(e.currentTarget, open);
  });
  // nested toggles (Products / Devices / Resources; All Microsoft sub-groups)
  qa('.uhf-nav__toggle, .uhf-allms__toggle').forEach((btn) => btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    closeSubs(btn);
    setExpanded(btn, open);
  }));

  // search open / cancel
  const input = q('.uhf-search__input');
  const openSearch = () => { closeAll(); header.classList.add('is-search'); input.focus(); };
  const closeSearch = (refocus) => {
    header.classList.remove('is-search'); input.value = '';
    if (refocus) q('.uhf-search__btn').focus();
  };
  q('.uhf-search__btn').addEventListener('click', (e) => {
    if (!header.classList.contains('is-search')) { e.preventDefault(); openSearch(); }
  });
  q('.uhf-search__cancel').addEventListener('click', () => closeSearch(true));
  q('.uhf-header__back').addEventListener('click', () => closeSearch(true));
  q('#searchForm').addEventListener('submit', (e) => e.preventDefault());

  // Tab from an open hamburger / category trigger moves into its panel (recorded keyboard path)
  const panelFor = (btn) => document.getElementById(btn.getAttribute('aria-controls') || '');
  [q('.uhf-header__burger'), q('.uhf-header__catbtn')].forEach((btn) => btn.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || e.shiftKey || btn.getAttribute('aria-expanded') !== 'true') return;
    const first = [...panelFor(btn).querySelectorAll('a[href], button')].find((el) => el.offsetParent !== null);
    if (first) { e.preventDefault(); first.focus(); }
  }));

  // Escape closes the innermost open menu and returns focus to its trigger
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (header.classList.contains('is-search')) { closeSearch(true); return; }
    const sub = qa('.uhf-nav__toggle[aria-expanded="true"], .uhf-allms__toggle[aria-expanded="true"]')
      .find((b) => b === document.activeElement || (panelFor(b) && panelFor(b).contains(document.activeElement))) || qa('.uhf-nav__toggle[aria-expanded="true"], .uhf-allms__toggle[aria-expanded="true"]')[0];
    if (sub) { setExpanded(sub, false); sub.focus(); return; }
    const top = [q('.uhf-header__burger'), q('.uhf-header__catbtn'), q('.uhf-allms__btn')].find((b) => b.getAttribute('aria-expanded') === 'true');
    closeAll();
    if (top) top.focus();
  });
  // a click outside the header closes menus and the open search
  document.addEventListener('click', (e) => {
    if (header.contains(e.target)) return;
    closeAll();
    if (header.classList.contains('is-search')) closeSearch();
  });

  // me-control: the "Sign in" label exists only on the desktop header (live removes it below 860px)
  const meText = q('.uhf-me__text');
  const meTrigger = q('.uhf-me__trigger');
  const mq = window.matchMedia('(max-width: 859px)');
  const syncMe = () => {
    if (mq.matches && meText.isConnected) meText.remove();
    else if (!mq.matches && !meText.isConnected) meTrigger.insertBefore(meText, q('.uhf-me__pic'));
  };
  syncMe();
  mq.addEventListener('change', syncMe);

  // sign-in teaching callout dismiss
  const callout = document.getElementById('smcTeachingCalloutPopover');
  const dismiss = document.getElementById('teachingCalloutDismiss');
  if (callout && dismiss) dismiss.addEventListener('click', (e) => { e.preventDefault(); callout.classList.add('is-hidden'); });
})();
