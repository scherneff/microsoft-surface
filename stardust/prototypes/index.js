/* index (home) — tabs, Read more/Read less toggles, carousel prev/next (+ play/pause). */
(() => {
  const main = document.getElementById('primaryArea');
  if (!main) return;

  // Tabs (Personal / Business)
  const tabs = [...main.querySelectorAll('.hp-pill[role="tab"]')];
  const selectLabel = main.querySelector('.hp-tabs__select-label');
  let current = null;
  const activate = (tab) => {
    if (tab === current) return;
    current = tab;
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) {
        panel.hidden = !on;
        if (on) { panel.classList.remove('is-entering'); void panel.offsetWidth; panel.classList.add('is-entering'); }
      }
    });
    if (selectLabel) selectLabel.dataset.label = tab.textContent;
  };
  current = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || null;
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => activate(t));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      activate(n); n.focus();
    });
  });
  const sel = main.querySelector('.hp-tabs__select');
  if (sel) sel.addEventListener('click', () => {
    const cur = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    activate(tabs[(cur + 1) % tabs.length]);
  });

  // Read more / Read less
  main.querySelectorAll('.hp-readmore').forEach((b) => {
    b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(open));
      b.closest('.hp-promo').classList.toggle('is-open', open);
    });
  });

  // Carousels
  main.querySelectorAll('.hp-carousel').forEach((c) => {
    const track = c.querySelector('.hp-carousel__track');
    const items = [...track.children];
    const prev = c.querySelector('.hp-arrow--prev');
    const next = c.querySelector('.hp-arrow--next');
    const pp = c.querySelector('.hp-playpause');
    let idx = 0;
    const step = () => {
      if (items.length < 2) return 0;
      return items[1].offsetLeft - items[0].offsetLeft;
    };
    const maxIdx = () => {
      const vw = c.closest('section, .hp-panel').getBoundingClientRect().width;
      const s = step() || 1;
      return Math.max(0, Math.ceil((items.length * s - vw) / s));
    };
    const go = (i) => {
      idx = Math.max(0, Math.min(i, items.length - 1));
      track.style.transform = `translateX(${-idx * step()}px)`;
      prev.disabled = idx === 0;
      next.disabled = idx >= items.length - 1;
    };
    prev.addEventListener('click', () => go(idx - 1));
    next.addEventListener('click', () => go(idx + 1));
    if (pp) {
      let timer = null;
      const interval = +c.dataset.autoplay || 7000;
      const play = () => { timer = setInterval(() => go(idx >= items.length - 1 ? 0 : idx + 1), interval); pp.setAttribute('aria-label', 'Pause'); };
      const pause = () => { clearInterval(timer); timer = null; pp.setAttribute('aria-label', 'Play'); };
      pp.addEventListener('click', () => (timer ? pause() : play()));
      c.dataset.autoplayEnabled = 'false'; // enabled after interaction parity check (motion-observe)
    }
    void maxIdx;
  });
})();

/* Quick links (live: store-secondary-nav-item custom elements carrying href) */
document.querySelectorAll('.hp-quicklink[data-href]').forEach((q) => {
  const go = () => { window.location.href = q.dataset.href; };
  q.addEventListener('click', go);
  q.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
});
document.querySelectorAll('.hp-back-to-top__btn').forEach((b) => b.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' })));
