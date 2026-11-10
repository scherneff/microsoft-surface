/* www.microsoft.com replica — UHF header behaviour (canon).
   Implements the open states recorded in stardust/chrome/header-contract.json (chrome-explore, about):
   - desktop (>= 860): click-only dropdowns (no hover open); one open at a time; aria-expanded on the trigger;
     focus stays on the trigger; Escape closes + returns focus; outside click closes; trigger click toggles.
   - All Microsoft: same mechanics; mega menu (header row, 6 columns, View Sitemap).
   - Search: opens the search row (input + Cancel desktop / Back mobile), hides nav; Escape / outside / Cancel close.
   - mobile (< 860): hamburger opens the All Microsoft drawer (focus to first link), columns are accordions;
     the "About" contextual trigger opens the section drawer (Escape does not close it; outside click / toggle do).
   - Sign in / ME: no panel (contract: opened false).
   Width threshold is the source step (UHF --uhf-mobile-breakpoint 860px). */
(function () {
  const header = document.getElementById('uhf-header');
  if (!header) return;
  const mobile = window.matchMedia('(max-width: 859px)');
  const triggers = Array.from(header.querySelectorAll('.uhf-dropdown-trigger'));
  const ctxTrigger = header.querySelector('.uhf-contextual-trigger');
  const ctxList = header.querySelector('#uhf-ctx-list');
  const searchBtn = header.querySelector('.uhf-search-button');
  const searchInput = header.querySelector('.uhf-search-input');

  const panelOf = (t) => document.getElementById(t.getAttribute('aria-controls'));
  const isOpen = (t) => t.getAttribute('aria-expanded') === 'true';
  const firstLink = (el) => el && el.querySelector('a, button');

  function setDropdown(t, open, { focus = false } = {}) {
    const panel = panelOf(t);
    t.setAttribute('aria-expanded', String(open));
    if (panel) panel.hidden = !open;
    if (open && focus) { const f = firstLink(panel); if (f) f.focus(); }
  }
  function closeAllDropdowns(except) {
    triggers.forEach((t) => { if (t !== except && isOpen(t)) setDropdown(t, false); });
  }
  function setCtx(open) {
    if (!ctxTrigger) return;
    ctxTrigger.setAttribute('aria-expanded', String(open));
    header.classList.toggle('ctx-open', open);
    if (open) { const f = firstLink(ctxList); if (f) f.focus(); }
  }
  function setSearch(open, { returnFocus = false } = {}) {
    header.classList.toggle('search-open', open);
    if (searchBtn) searchBtn.setAttribute('aria-expanded', String(open));
    if (open) { closeAllDropdowns(); setCtx(false); if (searchInput) searchInput.focus(); }
    else if (returnFocus && searchBtn) searchBtn.focus();
  }

  triggers.forEach((t) => {
    t.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !isOpen(t);
      const inCtxDrawer = mobile.matches && ctxList && ctxList.contains(t);
      if (!inCtxDrawer) closeAllDropdowns(t);
      if (open && header.classList.contains('search-open')) setSearch(false);
      if (open && mobile.matches && t.classList.contains('uhf-global-trigger')) setCtx(false);
      // mobile drawers move focus into the panel; desktop keeps it on the trigger
      setDropdown(t, open, { focus: open && mobile.matches && !inCtxDrawer });
    });
  });

  header.querySelectorAll('.uhf-dropdown-column-trigger').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const col = b.closest('.uhf-dropdown-column');
      const open = !col.classList.contains('open');
      col.classList.toggle('open', open);
      b.setAttribute('aria-expanded', String(open));
    });
  });

  if (ctxTrigger) {
    ctxTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = ctxTrigger.getAttribute('aria-expanded') !== 'true';
      if (open) { closeAllDropdowns(); if (header.classList.contains('search-open')) setSearch(false); }
      setCtx(open);
    });
  }

  if (searchBtn) searchBtn.addEventListener('click', (e) => { e.stopPropagation(); setSearch(true); });
  const cancel = header.querySelector('.uhf-search-cancel');
  if (cancel) cancel.addEventListener('click', (e) => { e.stopPropagation(); setSearch(false); });
  const back = header.querySelector('.uhf-search-back');
  if (back) back.addEventListener('click', (e) => { e.stopPropagation(); setSearch(false, { returnFocus: true }); });

  // clicks inside an open panel never count as "outside"
  header.querySelectorAll('.uhf-dropdown-menu, #uhf-ctx-list, .uhf-search-container').forEach((p) => {
    p.addEventListener('click', (e) => e.stopPropagation());
  });

  document.addEventListener('click', () => {
    closeAllDropdowns();
    if (header.classList.contains('ctx-open')) setCtx(false);
    if (header.classList.contains('search-open')) setSearch(false, { returnFocus: mobile.matches });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = triggers.find((t) => isOpen(t) && !(mobile.matches && ctxList && ctxList.contains(t)));
    if (open) { setDropdown(open, false); open.focus(); return; }
    if (header.classList.contains('search-open')) { setSearch(false, { returnFocus: mobile.matches }); }
    // contextual drawer: Escape does not close it (contract: escape false)
  });

  mobile.addEventListener('change', () => { closeAllDropdowns(); setCtx(false); setSearch(false); });
})();

/* Page media helpers shared by archetypes: modal video trigger + click-to-play inline video. */
(function () {
  // MWF modal: body.modal-open, .show added after open (opacity .15s, dialog transform .3s — motion-observe)
  document.querySelectorAll('.video-trigger[aria-controls]').forEach((t) => {
    const dlg = document.getElementById(t.getAttribute('aria-controls'));
    if (!dlg || typeof dlg.showModal !== 'function') return;
    const open = (e) => {
      if (e) e.preventDefault();
      document.body.classList.add('modal-open');
      dlg.showModal();
      requestAnimationFrame(() => requestAnimationFrame(() => dlg.classList.add('show')));
    };
    const close = () => {
      const v = dlg.querySelector('video'); if (v) v.pause();
      dlg.classList.remove('show');
      setTimeout(() => { dlg.close(); document.body.classList.remove('modal-open'); t.focus(); }, 150);
    };
    t.addEventListener('click', open);
    t.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') open(e); });
    const btn = dlg.querySelector('.video-dialog__close');
    if (btn) btn.addEventListener('click', close);
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
    dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.classList.contains('video-dialog__inner')) close(); });
  });
})();
