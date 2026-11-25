/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer for the surface-product template.
 * beforeTransform: insert <hr> section breaks (marked with data-excat-section-id)
 *   while the original section containers still exist.
 * afterTransform: add Section Metadata (style) for styled sections, then drop markers.
 */

const MARKER = 'data-excat-section-id';

// Fallback for engines without :has() support.
function manualHas(root, selector) {
  let m = selector.match(/^(.*):not\(:has\((.+)\)\)$/);
  if (m) {
    return [...root.querySelectorAll(m[1])].filter((el) => !el.querySelector(m[2]));
  }
  m = selector.match(/^(.*):has\((.+)\)$/);
  if (m) {
    return [...root.querySelectorAll(m[1])].filter((el) => el.querySelector(m[2]));
  }
  return [];
}

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    let el = null;
    try {
      el = root.querySelector(sel);
    } catch (e) {
      [el] = manualHas(root, sel);
    }
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const template = payload && payload.template;
  const sections = template && Array.isArray(template.sections) ? template.sections : [];
  if (sections.length < 2) return;
  const doc = element.ownerDocument || payload.document;

  if (hookName === 'beforeTransform') {
    // Resolve all elements first so duplicate ids (mega-promo) map correctly.
    const resolved = sections.map((s) => findSectionElement(element, s));

    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const el = resolved[i];
      if (!el || !el.parentNode) continue;
      const isFirst = i === 0;
      // First section gets no real break; only a temporary marker when styled.
      if (isFirst && !sections[i].style) continue;
      const hr = doc.createElement('hr');
      hr.setAttribute(MARKER, sections[i].id);
      el.parentNode.insertBefore(hr, el);
      if (!isFirst) {
        el.setAttribute(`${MARKER}-el`, sections[i].id);
      }
    }
  }

  if (hookName === 'afterTransform') {
    const markers = [...element.querySelectorAll(`hr[${MARKER}]`)];
    const markerById = {};
    markers.forEach((hr) => { markerById[hr.getAttribute(MARKER)] = hr; });

    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;
      const block = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });

      // Place metadata at the end of the section: right before the next section's break.
      let nextMarker = null;
      for (let j = i + 1; j < sections.length; j += 1) {
        if (markerById[sections[j].id]) { nextMarker = markerById[sections[j].id]; break; }
      }
      if (nextMarker && nextMarker.parentNode) {
        nextMarker.parentNode.insertBefore(block, nextMarker);
        continue;
      }

      // Last section: after the surviving section element, else after the marker's last sibling.
      const surviving = element.querySelector(`[${MARKER}-el="${section.id}"]`);
      const own = markerById[section.id];
      if (surviving && surviving.parentNode) {
        surviving.after(block);
      } else if (own && own.parentNode) {
        own.parentNode.appendChild(block);
      } else {
        element.appendChild(block);
      }
    }

    // Remove the first section's temporary marker <hr>; strip marker attributes.
    const first = sections[0];
    if (first && markerById[first.id] && markerById[first.id].parentNode) {
      markerById[first.id].remove();
    }
    element.querySelectorAll(`[${MARKER}]`).forEach((el) => el.removeAttribute(MARKER));
    element.querySelectorAll(`[${MARKER}-el]`).forEach((el) => el.removeAttribute(`${MARKER}-el`));
  }
}
