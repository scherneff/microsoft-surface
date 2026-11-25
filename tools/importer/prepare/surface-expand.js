/* eslint-disable */
/**
 * Surface product pages: reveal content that only mounts on interaction, before the
 * transform runs (called from the import script's async onLoad hook, on the live page).
 *
 * - Screen-size tabs (#laptop-tabs): only the active tab panel is in the DOM. Click every
 *   tab, clone its panel, and leave all panels side by side in a static container so the
 *   tabs-media parser sees one panel per tab (ids are dropped so it maps them by order).
 * - Feature accordion (accordion-media): collapsed items have no copy in the DOM. Click
 *   every item, clone its .rich-text-content, then put the copy back into each item.
 *
 * Does nothing when the elements are absent, so it is safe on other Surface pages.
 */

const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

async function waitFor(test, timeout = 3000, step = 100) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const found = test();
    if (found) return found;
    // eslint-disable-next-line no-await-in-loop
    await sleep(step);
  }
  return test();
}

async function expandTabs(document) {
  const wrap = [...document.querySelectorAll('div')]
    .find((d) => d.querySelector(':scope > #laptop-tabs'));
  if (!wrap) return 0;
  const container = wrap.querySelector(':scope > .container');
  const buttons = [...wrap.querySelectorAll('#laptop-tabs button')];
  if (!container || buttons.length < 2) return 0;

  // The panel node is reused and keeps its id while React swaps its content a moment after
  // the click, so wait until the panel's content differs from the previously captured one.
  const signature = (el) => (el ? `${el.textContent}|${el.querySelector('img')?.getAttribute('src') || ''}` : '');
  const clones = [];
  let previous = null;
  for (const [i, button] of buttons.entries()) {
    button.click();
    // eslint-disable-next-line no-await-in-loop
    const panel = await waitFor(() => {
      const current = container.querySelector(':scope > div');
      if (!current) return null;
      if (i > 0 && signature(current) === previous) return null;
      return current;
    }, 4000);
    // eslint-disable-next-line no-await-in-loop
    await sleep(500); // let the swap finish and lazy images get their src
    if (panel) {
      previous = signature(panel);
      const clone = panel.cloneNode(true);
      clone.removeAttribute('id');
      clone.removeAttribute('hidden');
      clones.push(clone);
    }
  }
  if (clones.length < 2) return clones.length;
  const staticContainer = container.cloneNode(false);
  staticContainer.append(...clones);
  container.replaceWith(staticContainer);
  return clones.length;
}

async function expandFeatureAccordion(document) {
  const section = document.querySelector('#surface-laptop-accordion-feature-animations');
  if (!section) return 0;
  const buttons = [...section.querySelectorAll('h3 button')];
  const copies = new Map();
  for (const button of buttons) {
    const item = button.closest('h3')?.parentElement;
    if (!item) continue;
    if (button.getAttribute('aria-expanded') !== 'true') button.click();
    // eslint-disable-next-line no-await-in-loop
    const rich = await waitFor(() => item.querySelector('.rich-text-content'));
    if (rich) copies.set(item, rich.cloneNode(true));
  }
  let restored = 0;
  copies.forEach((copy, item) => {
    if (!item.querySelector('.rich-text-content')) {
      item.append(copy);
      restored += 1;
    }
  });
  return restored;
}

/**
 * Split-word animation markup (<p><span aria-hidden><div class="st-line"><div class="st-word">…
 * plus <span class="sr-only">full text</span>) puts <div>s inside <p>/<h*>. The importer
 * re-parses the page HTML, which moves those <div>s out and empties the element (e.g. the hero
 * headline "Enjoy the performance"). Flatten it on the live DOM to the sr-only text.
 */
function flattenSplitText(document) {
  let count = 0;
  document.querySelectorAll('span.sr-only').forEach((sr) => {
    const parent = sr.parentElement;
    if (!parent) return;
    const animated = [...parent.children]
      .filter((c) => c !== sr && (c.matches('.st-line, [data-split]') || c.querySelector('.st-line, .st-word')));
    if (!animated.length) return;
    animated.forEach((a) => a.remove());
    sr.replaceWith(document.createTextNode(sr.textContent.replace(/\s+/g, ' ').trim()));
    count += 1;
  });
  return count;
}

/**
 * Scroll-scrubbed display videos (<div class="sticky"><canvas> + poster <picture>) draw frames
 * from .fsv files that only appear in the page's script data. Find the .fsv URLs listed next
 * to each poster and put them on the sticky element for the scroll-video parser.
 */
function annotateScrollVideos(document) {
  const scriptText = [...document.scripts].map((s) => s.textContent).join('\n').replace(/\\"/g, '"');
  const FSV = /https:\/\/downloads\.ctfassets\.net\/[^"\\\s)]+?\.fsv/g;
  let count = 0;
  document.querySelectorAll('div.sticky').forEach((sticky) => {
    if (!sticky.querySelector(':scope > canvas')) return;
    const img = sticky.querySelector('picture img');
    if (!img) return;
    const poster = new URL(img.getAttribute('src'), document.baseURI).pathname.split('/').pop();
    const at = scriptText.indexOf(poster);
    if (at < 0) return;
    const nearby = scriptText.slice(Math.max(0, at - 4000), at + 4000);
    const urls = [...new Set(nearby.match(FSV) || [])];
    const mobile = urls.find((u) => /mobile/i.test(u.split('/').pop()));
    const desktop = urls.find((u) => u !== mobile);
    if (desktop) sticky.dataset.scrollVideoDesktop = desktop;
    if (mobile) sticky.dataset.scrollVideoMobile = mobile;
    if (desktop || mobile) count += 1;
  });
  return count;
}

export default async function expandInteractive({ document }) {
  let scrollVideos = 0;
  try { scrollVideos = annotateScrollVideos(document); } catch (e) { /* keep going */ }
  // eslint-disable-next-line no-console
  console.log(`[surface-expand] scroll videos found: ${scrollVideos}`);
  const tabs = await expandTabs(document).catch(() => 0);
  const accordion = await expandFeatureAccordion(document).catch(() => 0);
  let flattened = 0;
  try { flattened = flattenSplitText(document); } catch (e) { /* keep going */ }
  // eslint-disable-next-line no-console
  console.log(`[surface-expand] tab panels: ${tabs}, accordion copies restored: ${accordion}, split texts flattened: ${flattened}`);
}
