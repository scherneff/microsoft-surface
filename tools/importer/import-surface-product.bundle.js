/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // tools/importer/import-surface-product.js
  var import_surface_product_exports = {};
  __export(import_surface_product_exports, {
    default: () => import_surface_product_default
  });

  // tools/importer/parsers/hero-product.js
  function cleanText(el) {
    if (!el) return "";
    const sr = el.querySelector(".sr-only");
    const text = sr ? sr.textContent : el.textContent;
    return text.replace(/\s+/g, " ").trim();
  }
  function absUrl(url, document2) {
    if (!url) return "";
    try {
      return new URL(url, document2.baseURI || "https://www.microsoft.com/").href;
    } catch (e) {
      return url;
    }
  }
  function buildPicture(img, document2) {
    const picture2 = document2.createElement("picture");
    const newImg = document2.createElement("img");
    newImg.src = absUrl(img.getAttribute("src") || img.src, document2);
    newImg.alt = img.getAttribute("alt") || "";
    picture2.append(newImg);
    return picture2;
  }
  function videoLink(src, document2) {
    const p = document2.createElement("p");
    const a = document2.createElement("a");
    a.href = src;
    a.textContent = src;
    p.append(a);
    return p;
  }
  function collectVideos(root, document2) {
    const urls = [];
    root.querySelectorAll("video").forEach((video) => {
      const srcs = [...video.querySelectorAll("source[src]")].map((s) => s.getAttribute("src"));
      if (video.getAttribute("src")) srcs.unshift(video.getAttribute("src"));
      srcs.forEach((s) => {
        const u = absUrl(s, document2);
        if (u && /\.(mp4|webm|mov)(\?|#|$)/i.test(u) && !urls.includes(u)) urls.push(u);
      });
    });
    return urls.slice(0, 2);
  }
  function inlineParagraph(el, document2) {
    const p = document2.createElement("p");
    const source = el.querySelector("p") || el;
    [...source.childNodes].forEach((n) => p.append(n.cloneNode(true)));
    return p;
  }
  function textEl(tag, text, document2) {
    const el = document2.createElement(tag);
    el.textContent = text;
    return el;
  }
  function parse(element, { document: document2 }) {
    const mediaCell = [];
    const posterImg = [...element.querySelectorAll("picture img, img")].find((img) => /ctfassets\.net/.test(img.getAttribute("src") || ""));
    if (posterImg) mediaCell.push(buildPicture(posterImg, document2));
    collectVideos(element, document2).forEach((src) => mediaCell.push(videoLink(src, document2)));
    const content = [];
    const buyBar = [...element.querySelectorAll("div.rounded-full")].find((d) => d.querySelector("a[href]") && d.querySelector("p"));
    const promoLink = [...element.querySelectorAll("a[href]")].find((a) => cleanText(a) && !(buyBar && buyBar.contains(a)) && !a.closest(".rich-text-content, sup"));
    if (promoLink) {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = absUrl(promoLink.getAttribute("href"), document2);
      const rich = promoLink.querySelector(".rich-text-content p") || promoLink;
      [...rich.childNodes].forEach((n) => a.append(n.cloneNode(true)));
      p.append(a);
      content.push(p);
    }
    const eyebrow = element.querySelector("h1, h2");
    const headline = element.querySelector(".hero-6");
    const h3 = element.querySelector("h3");
    if (eyebrow && cleanText(eyebrow)) content.push(textEl("h1", cleanText(eyebrow), document2));
    if (headline) {
      let text = cleanText(headline);
      if (!text && headline.parentElement) {
        text = [...headline.parentElement.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim();
      }
      if (text) content.push(textEl("h2", text, document2));
    }
    if (h3 && cleanText(h3)) content.push(textEl("h3", cleanText(h3), document2));
    const leadEl = [...element.querySelectorAll(".rich-text-content")].find((r) => !(promoLink && promoLink.contains(r)) && cleanText(r));
    if (leadEl) content.push(inlineParagraph(leadEl, document2));
    if (buyBar) {
      buyBar.querySelectorAll("p").forEach((p) => {
        const t = cleanText(p);
        if (t) content.push(textEl("p", t, document2));
      });
      const cta = buyBar.querySelector("a[href]");
      if (cta && cleanText(cta)) {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        const a = document2.createElement("a");
        a.href = absUrl(cta.getAttribute("href"), document2);
        a.textContent = cleanText(cta);
        strong.append(a);
        p.append(strong);
        content.push(p);
      }
    }
    const cells = [];
    if (mediaCell.length) cells.push([mediaCell]);
    if (content.length) cells.push([content]);
    const hasSansHeadline = content.some((el) => el.tagName === "H2");
    const name = hasSansHeadline ? "hero-product (sans)" : "hero-product";
    const block = WebImporter.Blocks.createBlock(document2, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-scroll.js
  function cleanText2(el) {
    if (!el) return "";
    const sr = el.querySelector(".sr-only");
    const text = sr ? sr.textContent : el.textContent;
    return text.replace(/\s+/g, " ").trim();
  }
  function absUrl2(url, document2) {
    if (!url) return "";
    try {
      return new URL(url, document2.baseURI || "https://www.microsoft.com/").href;
    } catch (e) {
      return url;
    }
  }
  function buildPicture2(img, document2) {
    const picture2 = document2.createElement("picture");
    const newImg = document2.createElement("img");
    newImg.src = absUrl2(img.getAttribute("src"), document2);
    newImg.alt = img.getAttribute("alt") || "";
    picture2.append(newImg);
    return picture2;
  }
  function videoLink2(src, document2) {
    const p = document2.createElement("p");
    const a = document2.createElement("a");
    a.href = src;
    a.textContent = src;
    p.append(a);
    return p;
  }
  function collectVideos2(root, document2) {
    const urls = [];
    root.querySelectorAll("video").forEach((video) => {
      const srcs = [...video.querySelectorAll("source[src]")].map((s) => s.getAttribute("src"));
      if (video.getAttribute("src")) srcs.unshift(video.getAttribute("src"));
      srcs.forEach((s) => {
        const u = absUrl2(s, document2);
        if (u && /\.(mp4|webm|mov)(\?|#|$)/i.test(u) && !urls.includes(u)) urls.push(u);
      });
    });
    return urls.slice(0, 2);
  }
  function copyRichText(root, document2) {
    const out = [];
    root.querySelectorAll("p, ul, ol").forEach((src) => {
      if (src.parentElement && src.parentElement.closest("p, ul, ol") && root.contains(src.parentElement.closest("p, ul, ol"))) return;
      const clone = src.cloneNode(true);
      clone.querySelectorAll("sup").forEach((sup) => {
        const a = sup.querySelector("a[href]");
        if (!a) return;
        const link = document2.createElement("a");
        link.href = a.getAttribute("href");
        const s = document2.createElement("sup");
        s.textContent = a.textContent.trim();
        link.append(s);
        sup.replaceWith(link);
      });
      [...clone.querySelectorAll("*")].forEach((el) => {
        [...el.attributes].forEach((attr) => {
          if (attr.name !== "href") el.removeAttribute(attr.name);
        });
      });
      [...clone.attributes].forEach((attr) => clone.removeAttribute(attr.name));
      if (clone.textContent.trim()) out.push(clone);
    });
    return out;
  }
  function parse2(element, { document: document2 }) {
    const mediaLayers = [...element.querySelectorAll(".inner-media-fill")].filter((m) => m.querySelector("picture img, video"));
    const textSlides = [...element.querySelectorAll("h3")].map((h) => h.parentElement);
    const count = Math.max(mediaLayers.length, textSlides.length);
    const cells = [];
    for (let i = 0; i < count; i += 1) {
      const media = [];
      const layer = mediaLayers[i];
      if (layer) {
        const img = [...layer.querySelectorAll("picture img")].find((im) => /ctfassets\.net/.test(im.getAttribute("src") || ""));
        if (img) media.push(buildPicture2(img, document2));
        collectVideos2(layer, document2).forEach((src) => media.push(videoLink2(src, document2)));
      }
      const content = [];
      const slide = textSlides[i];
      if (slide) {
        const h3 = slide.querySelector("h3");
        const heading = document2.createElement("h3");
        heading.textContent = cleanText2(h3);
        content.push(heading);
        const rich = slide.querySelector(".rich-text-content");
        if (rich) content.push(...copyRichText(rich, document2));
      }
      cells.push([media, content]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-scroll", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-media.js
  function clean(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function absUrl3(url, document2) {
    if (!url) return "";
    try {
      return new URL(url, document2.baseURI || "https://www.microsoft.com/").href;
    } catch (e) {
      return url;
    }
  }
  function tabLabel(button) {
    const hidden = button.querySelector(".tw-hidden");
    if (hidden && clean(hidden.textContent)) return clean(hidden.textContent).replace(/-\s+/g, "-");
    const direct = [...button.childNodes].filter((n) => !(n.nodeType === 1 && n.classList.contains("tw-hidden"))).map((n) => n.textContent).join("");
    return clean(direct).replace(/-\s+/g, "-");
  }
  function appendInline(target, source, document2) {
    const clone = source.cloneNode(true);
    clone.querySelectorAll("sup").forEach((sup) => {
      const a = sup.querySelector("a[href]");
      if (!a) return;
      const link = document2.createElement("a");
      link.href = a.getAttribute("href");
      const s = document2.createElement("sup");
      s.textContent = clean(a.textContent);
      link.append(s);
      sup.replaceWith(link);
    });
    const p = clone.querySelector("p") || clone;
    [...p.childNodes].forEach((n) => {
      if (n.nodeType === 8) return;
      if (n.nodeType === 1) target.append(n);
      else if (clean(n.textContent)) target.append(document2.createTextNode(clean(n.textContent)));
    });
  }
  function buildPanel(panel, document2) {
    const content = [];
    const pictureFor2 = (img) => {
      const picture2 = document2.createElement("picture");
      const newImg = document2.createElement("img");
      newImg.src = absUrl3(img.getAttribute("src"), document2);
      newImg.alt = img.getAttribute("alt") || "";
      picture2.append(newImg);
      return picture2;
    };
    const shownLine = (text) => {
      const p = document2.createElement("p");
      p.textContent = text;
      return p;
    };
    const images = [...panel.querySelectorAll("img")].filter((im) => !/^data:/.test(im.getAttribute("src") || "") && !im.closest("button, li"));
    const swatches = [...panel.querySelectorAll("button[aria-label]")].filter((b) => /^shown in/i.test(b.getAttribute("aria-label") || ""));
    if (swatches.length > 1 && images.length >= swatches.length) {
      swatches.forEach((swatch, i) => {
        const code = swatch.getAttribute("data-swatch-color");
        content.push(pictureFor2(images[i]));
        content.push(shownLine(`${clean(swatch.getAttribute("aria-label"))}${code ? ` ${code}` : ""}`));
      });
    } else {
      if (images[0]) content.push(pictureFor2(images[0]));
      const shown = [...panel.querySelectorAll("p")].find((p) => /^shown in/i.test(clean(p.textContent)));
      if (shown) content.push(shownLine(clean(shown.textContent)));
    }
    const items = [...panel.querySelectorAll("ul > li")];
    if (items.length) {
      const ul = document2.createElement("ul");
      items.forEach((li) => {
        const label = li.querySelector(":scope > p");
        const value = [...li.querySelectorAll(":scope > div")].find((d) => !d.querySelector(".rich-text-content"));
        const detail = li.querySelector(".rich-text-content");
        const item = document2.createElement("li");
        if (label && clean(label.textContent)) {
          const strong = document2.createElement("strong");
          strong.textContent = clean(label.textContent);
          item.append(strong);
        }
        if (value && clean(value.textContent)) {
          if (item.childNodes.length) item.append(document2.createElement("br"));
          item.append(document2.createTextNode(clean(value.textContent)));
        }
        if (detail && clean(detail.textContent)) {
          if (item.childNodes.length) item.append(document2.createElement("br"));
          appendInline(item, detail, document2);
        }
        if (item.childNodes.length) ul.append(item);
      });
      if (ul.children.length) content.push(ul);
    }
    return content;
  }
  function parse3(element, { document: document2 }) {
    const buttons = [...element.querySelectorAll("#laptop-tabs button")].filter((b) => tabLabel(b));
    let panels = [...element.querySelectorAll('[role="tabpanel"]')];
    if (!panels.length) {
      panels = [...element.querySelectorAll(":scope > .container > div")].filter((d) => d.querySelector("img"));
    }
    const selectedIdx = buttons.findIndex((b) => b.getAttribute("aria-selected") === "true" || b.hasAttribute("data-selected") || b.getAttribute("data-state") === "active");
    const cells = [];
    panels.forEach((panel, i) => {
      let button = panel.id ? buttons.find((b) => b.getAttribute("aria-controls") === panel.id) : null;
      if (!button && panels.length === 1 && selectedIdx > -1) button = buttons[selectedIdx];
      if (!button) button = buttons[i];
      const label = button ? tabLabel(button) : `${i + 1}`;
      const content = buildPanel(panel, document2);
      if (content.length) cells.push([label, content]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-bento.js
  function clean2(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function absUrl4(url, document2) {
    if (!url) return "";
    try {
      return new URL(url, document2.baseURI || "https://www.microsoft.com/").href;
    } catch (e) {
      return url;
    }
  }
  function videoLink3(src, document2) {
    const p = document2.createElement("p");
    const a = document2.createElement("a");
    a.href = src;
    a.textContent = src;
    p.append(a);
    return p;
  }
  function collectVideos3(root, document2) {
    const urls = [];
    root.querySelectorAll("video").forEach((video) => {
      const srcs = [...video.querySelectorAll("source[src]")].map((s) => s.getAttribute("src"));
      if (video.getAttribute("src")) srcs.unshift(video.getAttribute("src"));
      srcs.forEach((s) => {
        const u = absUrl4(s, document2);
        if (u && /\.(mp4|webm|mov)(\?|#|$)/i.test(u) && !urls.includes(u)) urls.push(u);
      });
    });
    return urls.slice(0, 2);
  }
  function buildTile(tile, document2) {
    const media = [];
    const img = [...tile.querySelectorAll("picture img, img")].find((im) => !/^data:/.test(im.getAttribute("src") || ""));
    if (img) {
      const picture2 = document2.createElement("picture");
      const newImg = document2.createElement("img");
      newImg.src = absUrl4(img.getAttribute("src"), document2);
      newImg.alt = img.getAttribute("alt") || "";
      picture2.append(newImg);
      media.push(picture2);
    }
    collectVideos3(tile, document2).forEach((src) => media.push(videoLink3(src, document2)));
    const text = [];
    tile.querySelectorAll("h2, h3, h4, .rich-text-content p").forEach((el) => {
      if (el.closest("button")) return;
      const t = clean2(el.textContent);
      if (!t) return;
      const node = document2.createElement(/^H/.test(el.tagName) ? el.tagName.toLowerCase() : "p");
      node.textContent = t;
      text.push(node);
    });
    return [media, text.length ? text : ""];
  }
  function parse4(element, { document: document2 }) {
    let tiles = [...element.querySelectorAll('[class*="group/dv"]')].filter((t) => t.querySelector("video, picture"));
    if (!tiles.length) tiles = [element];
    const cells = tiles.map((tile) => buildTile(tile, document2));
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-bento", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/scroll-video.js
  function absUrl5(url, document2) {
    if (!url) return "";
    try {
      return new URL(url, document2.baseURI || "https://www.microsoft.com/").href;
    } catch (e) {
      return url;
    }
  }
  function pictureFor(src, alt, document2) {
    const picture2 = document2.createElement("picture");
    const img = document2.createElement("img");
    img.src = absUrl5(src, document2);
    img.alt = alt || "";
    picture2.append(img);
    return picture2;
  }
  function linkFor(href, document2) {
    const p = document2.createElement("p");
    const a = document2.createElement("a");
    a.href = href;
    a.textContent = href;
    p.append(a);
    return p;
  }
  function parse5(element, { document: document2 }) {
    const sticky = element.querySelector("div.sticky") || element;
    const img = sticky.querySelector("picture img");
    const landscape = sticky.querySelector('picture source[media*="landscape"]');
    const media = [];
    const alt = img ? img.getAttribute("alt") : "";
    const desktopPoster = landscape && (landscape.getAttribute("srcset") || "").split(/\s+/)[0];
    const mobilePoster = img && img.getAttribute("src");
    if (desktopPoster) media.push(pictureFor(desktopPoster, alt, document2));
    if (mobilePoster && mobilePoster !== desktopPoster) media.push(pictureFor(mobilePoster, alt, document2));
    const links = [];
    const desktop = sticky.getAttribute("data-scroll-video-desktop");
    const mobile = sticky.getAttribute("data-scroll-video-mobile");
    if (desktop) links.push(linkFor(desktop, document2));
    if (mobile) links.push(linkFor(mobile, document2));
    const cells = [[media.length ? media : "", links.length ? links : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "scroll-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-media.js
  function cleanText3(el) {
    if (!el) return "";
    const sr = el.querySelector(".sr-only");
    const text = sr ? sr.textContent : el.textContent;
    return text.replace(/\s+/g, " ").trim();
  }
  function absUrl6(url, document2) {
    if (!url) return "";
    try {
      return new URL(url, document2.baseURI || "https://www.microsoft.com/").href;
    } catch (e) {
      return url;
    }
  }
  function collectVideos4(root, document2) {
    const urls = [];
    root.querySelectorAll("video").forEach((video) => {
      const srcs = [...video.querySelectorAll("source[src]")].map((s) => s.getAttribute("src"));
      if (video.getAttribute("src")) srcs.unshift(video.getAttribute("src"));
      srcs.forEach((s) => {
        const u = absUrl6(s, document2);
        if (u && /\.(mp4|webm|mov)(\?|#|$)/i.test(u) && !urls.includes(u)) urls.push(u);
      });
    });
    return urls;
  }
  function copyRichText2(root, document2) {
    const out = [];
    root.querySelectorAll(":scope p, :scope ul, :scope ol").forEach((src) => {
      const outer = src.parentElement && src.parentElement.closest("p, ul, ol");
      if (outer && root.contains(outer)) return;
      const clone = src.cloneNode(true);
      clone.querySelectorAll("sup").forEach((sup) => {
        const a = sup.querySelector("a[href]");
        if (!a) {
          sup.replaceWith(document2.createTextNode(sup.textContent));
          return;
        }
        const link = document2.createElement("a");
        link.href = a.getAttribute("href");
        const s = document2.createElement("sup");
        s.textContent = a.textContent.trim();
        link.append(s);
        sup.replaceWith(link);
      });
      [clone, ...clone.querySelectorAll("*")].forEach((el) => {
        [...el.attributes].forEach((attr) => {
          if (attr.name !== "href") el.removeAttribute(attr.name);
        });
      });
      [...clone.childNodes].forEach((n) => {
        if (n.nodeType === 8) n.remove();
      });
      if (clone.textContent.trim()) out.push(clone);
    });
    return out;
  }
  function parse6(element, { document: document2 }) {
    const mediaLayers = [...element.querySelectorAll('[class*="group/dv"]')].filter((m) => m.querySelector("video"));
    const items = [...element.querySelectorAll("h3")].filter((h) => h.querySelector("button")).map((h) => h.parentElement);
    const cells = [];
    items.forEach((item, i) => {
      const label = document2.createElement("p");
      label.textContent = cleanText3(item.querySelector("h3 button span") || item.querySelector("h3"));
      const body = [];
      const layer = mediaLayers[i];
      if (layer) {
        const img = [...layer.querySelectorAll("picture img")].find((im) => !/^data:/.test(im.getAttribute("src") || ""));
        if (img) {
          const picture2 = document2.createElement("picture");
          const newImg = document2.createElement("img");
          newImg.src = absUrl6(img.getAttribute("src"), document2);
          newImg.alt = img.getAttribute("alt") || "";
          picture2.append(newImg);
          body.push(picture2);
        }
      }
      const rich = item.querySelector(".rich-text-content");
      if (rich) body.push(...copyRichText2(rich, document2));
      if (layer) {
        const [desktop] = collectVideos4(layer, document2);
        if (desktop) {
          const p = document2.createElement("p");
          const a = document2.createElement("a");
          a.href = desktop;
          a.textContent = desktop;
          p.append(a);
          body.push(p);
        }
      }
      cells.push([label, body.length ? body : ""]);
    });
    const sectionHeading = [...element.querySelectorAll("h3")].find((h) => !h.querySelector("button"));
    const wallpaper = [...element.querySelectorAll("picture")].find((pic) => !mediaLayers.some((layer) => layer.contains(pic)));
    if (wallpaper || sectionHeading && cleanText3(sectionHeading)) {
      const introMedia = [];
      if (wallpaper) {
        const img = wallpaper.querySelector("img");
        const alt = img ? img.getAttribute("alt") || "" : "";
        const landscape = [...wallpaper.querySelectorAll("source")].find((s) => /landscape|min-width/i.test(s.getAttribute("media") || ""));
        const desktopSrc = landscape && (landscape.getAttribute("srcset") || "").split(/\s+/)[0];
        const mobileSrc = img && img.getAttribute("src");
        [desktopSrc, mobileSrc].filter(Boolean).filter((u, i, a) => a.indexOf(u) === i).forEach((src) => {
          const picture2 = document2.createElement("picture");
          const newImg = document2.createElement("img");
          newImg.src = absUrl6(src, document2);
          newImg.alt = alt;
          picture2.append(newImg);
          introMedia.push(picture2);
        });
      }
      const introText = [];
      if (sectionHeading && cleanText3(sectionHeading)) {
        const h3 = document2.createElement("h3");
        h3.textContent = cleanText3(sectionHeading);
        introText.push(h3);
      }
      cells.unshift([introMedia.length ? introMedia : "", introText.length ? introText : ""]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/quote-spotlight.js
  function clean3(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function cleanText4(el) {
    if (!el) return "";
    const sr = el.querySelector(".sr-only");
    return clean3(sr ? sr.textContent : el.textContent);
  }
  function absUrl7(url, document2) {
    if (!url) return "";
    try {
      return new URL(url, document2.baseURI || "https://www.microsoft.com/").href;
    } catch (e) {
      return url;
    }
  }
  function firstSrcset(source) {
    const set = source.getAttribute("srcset") || source.getAttribute("srcSet") || "";
    return set.split(",")[0].trim().split(/\s+/)[0];
  }
  function picture(src, alt, document2) {
    const pic = document2.createElement("picture");
    const img = document2.createElement("img");
    img.src = absUrl7(src, document2);
    img.alt = alt || "";
    pic.append(img);
    return pic;
  }
  function textEl2(tag, text, document2) {
    const el = document2.createElement(tag);
    el.textContent = text;
    return el;
  }
  function parse7(element, { document: document2 }) {
    const cells = [];
    const bgPicture = [...element.querySelectorAll(".inner-media-fill picture, picture")].find((p) => p.querySelector("img"));
    if (bgPicture) {
      const img = bgPicture.querySelector("img");
      const alt = img.getAttribute("alt") || "";
      const sources = [...bgPicture.querySelectorAll("source")].filter((s) => firstSrcset(s));
      const wide = sources.find((s) => /landscape|min-width/i.test(s.getAttribute("media") || "") && !/not\s*\(/i.test(s.getAttribute("media") || ""));
      const narrow = sources.find((s) => s !== wide);
      const mobileSrc = narrow && firstSrcset(narrow) || img.getAttribute("src");
      const desktopSrc = wide && firstSrcset(wide) || img.getAttribute("src");
      const row = [picture(desktopSrc, alt, document2)];
      row.push(mobileSrc && mobileSrc !== desktopSrc ? picture(mobileSrc, alt, document2) : "");
      cells.push(row);
    }
    const heading = element.querySelector("h1, h2, h3, h4");
    if (heading && cleanText4(heading)) {
      cells.push([textEl2("h3", cleanText4(heading), document2), ""]);
    }
    const attributionEl = element.querySelector("p.body-sm");
    const quoteEl = element.querySelector("p.heading-6-sans-sm");
    if (quoteEl) {
      const attribution = cleanText4(attributionEl);
      let quote = cleanText4(quoteEl);
      if (attribution && quote.endsWith(attribution)) quote = clean3(quote.slice(0, -attribution.length));
      cells.push([
        textEl2("p", quote, document2),
        attribution ? textEl2("p", attribution, document2) : ""
      ]);
    }
    const productLinks = [...element.querySelectorAll("a[href]")].filter((a) => !a.closest("sup") && clean3(a.textContent));
    productLinks.forEach((link) => {
      let card = link.parentElement;
      while (card && card !== element && !card.querySelector("img")) card = card.parentElement;
      if (!card || card === element) card = link.parentElement;
      const thumbImg = card.querySelector("img");
      const thumb = thumbImg ? picture(thumbImg.getAttribute("src"), thumbImg.getAttribute("alt"), document2) : "";
      const info = [];
      const name = card.querySelector("p");
      if (name && cleanText4(name)) info.push(textEl2("p", cleanText4(name), document2));
      const price = [...card.querySelectorAll("div")].find((d) => !d.children.length && /\$|€|£|\d/.test(d.textContent) && clean3(d.textContent));
      if (price) info.push(textEl2("p", clean3(price.textContent), document2));
      const p = document2.createElement("p");
      const strong = document2.createElement("strong");
      const a = document2.createElement("a");
      a.href = absUrl7(link.getAttribute("href"), document2);
      a.textContent = clean3(link.textContent);
      strong.append(a);
      p.append(strong);
      info.push(p);
      cells.push([thumb, info]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "quote-spotlight", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table-compare.js
  function clean4(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function absUrl8(url, document2) {
    if (!url) return "";
    try {
      return new URL(url, document2.baseURI || "https://www.microsoft.com/").href;
    } catch (e) {
      return url;
    }
  }
  function copyRichText3(root, document2) {
    const out = [];
    const sources = [...root.querySelectorAll("p, ul, ol")].filter((el) => !(el.parentElement && el.parentElement.closest("p, ul, ol")));
    (sources.length ? sources : [root]).forEach((src) => {
      const clone = src.cloneNode(true);
      clone.querySelectorAll("sup").forEach((sup) => {
        const a = sup.querySelector("a[href]");
        if (!a) {
          sup.replaceWith(document2.createTextNode(sup.textContent));
          return;
        }
        const link = document2.createElement("a");
        link.href = a.getAttribute("href");
        const s = document2.createElement("sup");
        s.textContent = clean4(a.textContent);
        link.append(s);
        sup.replaceWith(link);
      });
      clone.querySelectorAll("button, svg, img").forEach((el) => el.remove());
      [clone, ...clone.querySelectorAll("*")].forEach((el) => {
        [...el.attributes].forEach((attr) => {
          if (attr.name !== "href") el.removeAttribute(attr.name);
        });
      });
      [...clone.childNodes].forEach((n) => {
        if (n.nodeType === 8) n.remove();
      });
      if (!clean4(clone.textContent)) return;
      if (clone.tagName === "P" || clone.tagName === "UL" || clone.tagName === "OL") {
        out.push(clone);
      } else {
        const p = document2.createElement("p");
        p.append(...clone.childNodes);
        out.push(p);
      }
    });
    return out;
  }
  function parse8(element, { document: document2 }) {
    const table = element.tagName === "TABLE" ? element : element.querySelector("table");
    const headRows = [...table.querySelectorAll("thead tr")];
    const bodyRows = [...table.querySelectorAll("tbody tr")];
    const columnCount = Math.max(0, ...headRows.map((r) => r.children.length)) - 1;
    const products = [];
    for (let c = 1; c <= columnCount; c += 1) {
      const content = [];
      headRows.forEach((row) => {
        const cell = row.children[c];
        if (!cell) return;
        const img = cell.querySelector("img");
        if (img && !/^data:/.test(img.getAttribute("src") || "")) {
          const picture2 = document2.createElement("picture");
          const newImg = document2.createElement("img");
          newImg.src = absUrl8(img.getAttribute("src"), document2);
          newImg.alt = img.getAttribute("alt") || "";
          picture2.append(newImg);
          content.push(picture2);
        }
        const name = cell.querySelector(".heading-6, h3, h4");
        if (name && clean4(name.textContent)) {
          const p = document2.createElement("p");
          p.textContent = clean4(name.textContent);
          content.push(p);
        }
        const price = cell.querySelector(".body-sm");
        if (price && clean4(price.textContent)) {
          const p = document2.createElement("p");
          p.textContent = clean4(price.textContent);
          content.push(p);
        }
        cell.querySelectorAll("a[href]").forEach((link) => {
          if (link.closest("sup") || !clean4(link.textContent)) return;
          const p = document2.createElement("p");
          const strong = document2.createElement("strong");
          const a = document2.createElement("a");
          a.href = absUrl8(link.getAttribute("href"), document2);
          a.textContent = clean4(link.textContent);
          strong.append(a);
          p.append(strong);
          content.push(p);
        });
      });
      products.push(content.length ? content : "");
    }
    const cells = [];
    if (products.length) cells.push(["", ...products]);
    bodyRows.forEach((row) => {
      const label = row.querySelector("th");
      if (!label || !clean4(label.textContent)) return;
      const values = [...row.children].filter((c) => c !== label).map((td) => {
        const dots = [...td.querySelectorAll("button[aria-label], button[title], [title]")].filter((b) => clean4(b.getAttribute("aria-label") || b.getAttribute("title")));
        if (dots.length && !td.querySelector(".rich-text-content")) {
          const name = (b) => clean4(b.getAttribute("aria-label") || b.getAttribute("title"));
          if (dots.some((b) => b.getAttribute("data-colour-src"))) {
            return dots.flatMap((b) => {
              const out = [];
              const src = b.getAttribute("data-colour-src");
              if (src) {
                const picture2 = document2.createElement("picture");
                const img = document2.createElement("img");
                img.src = absUrl8(src, document2);
                img.alt = b.getAttribute("data-colour-alt") || "";
                picture2.append(img);
                out.push(picture2);
              }
              const p2 = document2.createElement("p");
              const code = b.getAttribute("data-swatch-color");
              p2.textContent = code ? `${name(b)} ${code}` : name(b);
              out.push(p2);
              return out;
            });
          }
          const p = document2.createElement("p");
          p.textContent = dots.map(name).join(", ");
          return [p];
        }
        const rich = td.querySelector(".rich-text-content") || td;
        const content = copyRichText3(rich, document2);
        return content.length ? content : "";
      });
      while (values.length < columnCount) values.push("");
      cells.push([clean4(label.textContent), ...values]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "table-compare", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  function clean5(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function absUrl9(url, document2) {
    if (!url) return "";
    try {
      return new URL(url, document2.baseURI || "https://www.microsoft.com/").href;
    } catch (e) {
      return url;
    }
  }
  function parse9(element, { document: document2 }) {
    const cards = [...element.querySelectorAll(".snap-start")].filter((c) => c.querySelector("img") || c.querySelector(".heading-6"));
    const cells = cards.map((card) => {
      const img = [...card.querySelectorAll("img")].find((im) => !/^data:/.test(im.getAttribute("src") || ""));
      let media = "";
      if (img) {
        const picture2 = document2.createElement("picture");
        const newImg = document2.createElement("img");
        newImg.src = absUrl9(img.getAttribute("src"), document2);
        newImg.alt = img.getAttribute("alt") || "";
        picture2.append(newImg);
        media = picture2;
      }
      const body = [];
      const name = card.querySelector(".heading-6, h3, h4");
      if (name && clean5(name.textContent)) {
        const h3 = document2.createElement("h3");
        h3.textContent = clean5(name.textContent);
        body.push(h3);
      }
      card.querySelectorAll(".rich-text-content p, p:not(.heading-6)").forEach((p) => {
        if (p === name || !clean5(p.textContent) || p.closest("a")) return;
        const np = document2.createElement("p");
        np.textContent = clean5(p.textContent);
        body.push(np);
      });
      card.querySelectorAll("a[href]").forEach((link) => {
        const text = clean5(link.textContent);
        if (!text || link.closest("sup")) return;
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = absUrl9(link.getAttribute("href"), document2);
        a.textContent = text;
        p.append(a);
        body.push(p);
      });
      return [media, body.length ? body : ""];
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  function clean6(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function cleanText5(el) {
    if (!el) return "";
    const sr = el.querySelector(".sr-only");
    return clean6(sr ? sr.textContent : el.textContent);
  }
  function absUrl10(url, document2) {
    if (!url) return "";
    if (url.startsWith("#")) return url;
    try {
      return new URL(url, document2.baseURI || "https://www.microsoft.com/").href;
    } catch (e) {
      return url;
    }
  }
  function copyAnswer(rich, document2) {
    const clone = rich.cloneNode(true);
    clone.querySelectorAll("button, svg, script, style").forEach((el) => el.remove());
    clone.querySelectorAll("sup").forEach((sup) => {
      const a = sup.querySelector("a[href]");
      if (!a) {
        sup.replaceWith(document2.createTextNode(sup.textContent));
        return;
      }
      const link = document2.createElement("a");
      link.href = a.getAttribute("href");
      const s = document2.createElement("sup");
      s.textContent = clean6(a.textContent);
      link.append(s);
      sup.replaceWith(link);
    });
    clone.querySelectorAll("br").forEach((br) => br.remove());
    clone.querySelectorAll("li > p").forEach((p) => {
      const li = p.parentElement;
      if (p.previousSibling && li.childNodes.length > 1) p.before(document2.createTextNode(" "));
      p.replaceWith(...p.childNodes);
    });
    clone.querySelectorAll("span, div").forEach((el) => el.replaceWith(...el.childNodes));
    [clone, ...clone.querySelectorAll("*")].forEach((el) => {
      [...el.attributes].forEach((attr) => {
        if (attr.name !== "href") el.removeAttribute(attr.name);
      });
    });
    clone.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", absUrl10(a.getAttribute("href"), document2)));
    const out = [];
    let loose = null;
    [...clone.childNodes].forEach((n) => {
      if (n.nodeType === 8) return;
      if (n.nodeType === 1 && /^(P|UL|OL|H[1-6]|TABLE)$/.test(n.tagName)) {
        loose = null;
        if (clean6(n.textContent)) out.push(n);
        return;
      }
      if (n.nodeType === 3 && !clean6(n.textContent)) return;
      if (!loose) {
        loose = document2.createElement("p");
        out.push(loose);
      }
      loose.append(n);
    });
    return out.filter((el) => clean6(el.textContent));
  }
  function parse10(element, { document: document2 }) {
    const accordion = element.querySelector('[id$="-accordion"]') || element;
    const items = [...accordion.querySelectorAll("h3")].filter((h) => h.querySelector("button")).map((h) => h.parentElement);
    const cells = items.map((item) => {
      const question = document2.createElement("p");
      const button = item.querySelector("h3 button");
      const label = button.querySelector("span") || button;
      question.textContent = cleanText5(label) || cleanText5(button);
      const rich = item.querySelector(".rich-text-content");
      const answer = rich ? copyAnswer(rich, document2) : [];
      return [question, answer.length ? answer : ""];
    });
    const heading = [...element.querySelectorAll("h1, h2, h3")].find((h) => !h.querySelector("button") && !accordion.contains(h));
    if (heading && cleanText5(heading)) {
      const h = document2.createElement(heading.tagName.toLowerCase());
      h.textContent = cleanText5(heading);
      element.before(h);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/surface-cleanup.js
  var SECTION_CONTAINER_IDS = [
    "surface-laptop-product-hero",
    "surface-laptop-scrolling-slide",
    "surface-laptop-screen-sizes-section",
    "surface-laptop-image-description",
    "Surface Laptop Mega Promo camera",
    "surface-laptop-mega-promo",
    "surface-laptop-accordion-feature-animations",
    "surface-laptop-testimonial-spotlight",
    "Surface-laptop-product-comparison-table",
    "surface-laptop-product-card-section",
    "surface-laptop-accordion",
    "surface-laptop-footnotes"
  ];
  function isInsideSection(el) {
    let node = el;
    while (node && node.nodeType === 1) {
      if (node.id && SECTION_CONTAINER_IDS.includes(node.id)) return true;
      node = node.parentElement;
    }
    return false;
  }
  function removeAll(root, selectors, { keepInSections = true } = {}) {
    selectors.forEach((sel) => {
      let nodes = [];
      try {
        nodes = [...root.querySelectorAll(sel)];
      } catch (e) {
        return;
      }
      nodes.forEach((n) => {
        if (keepInSections && isInsideSection(n)) return;
        n.remove();
      });
    });
  }
  function normalizeSplitWordText(root) {
    root.querySelectorAll("span.sr-only").forEach((sr) => {
      const parent = sr.parentElement;
      if (!parent) return;
      const animated = [...parent.children].filter(
        (c) => c !== sr && c.querySelector(".st-line, .st-word")
      );
      if (!animated.length) return;
      animated.forEach((a) => a.remove());
      const text = sr.textContent.replace(/\s+/g, " ").trim();
      sr.replaceWith(root.ownerDocument ? root.ownerDocument.createTextNode(text) : document.createTextNode(text));
    });
  }
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      removeAll(element, [
        "div.cge-uhf-header",
        "uhf-header",
        "a.uhf-skip-link",
        "uhf-cookie-banner",
        "#msccBannerV2",
        "div.cge-uhf-footer",
        "uhf-footer",
        "#uhf-footer"
      ], { keepInSections: false });
      removeAll(element, [
        "next-route-announcer",
        "#msChatContainer",
        "#storeassistantroot",
        "#ClickTaleDiv",
        // hidden "Customize this device" configurator modal (always in the DOM)
        "#wf-modal-overlay",
        ".wf-modal-overlay",
        '[id*="survey" i]',
        '[class*="survey" i]',
        '[id*="feedback" i]'
      ]);
      element.querySelectorAll("div.fixed.z-50").forEach((bar) => {
        if (isInsideSection(bar)) return;
        let wrapper = bar;
        while (wrapper.parentElement && wrapper.parentElement.tagName !== "SECTION" && wrapper.parentElement.tagName !== "MAIN" && wrapper.parentElement !== element) {
          wrapper = wrapper.parentElement;
        }
        wrapper.remove();
      });
      element.querySelectorAll('[id="Surface Laptop - SVA"]').forEach((sva) => {
        const next = sva.nextElementSibling;
        if (next && next.tagName === "DIV" && !next.id && !next.textContent.trim() && !next.querySelector("img, video, picture, iframe")) {
          next.remove();
        }
        sva.remove();
      });
      normalizeSplitWordText(element);
      element.querySelectorAll('[id="surface-laptop-mega-promo"] h4').forEach((h4) => {
        const doc = element.ownerDocument || document;
        const p = doc.createElement("p");
        p.innerHTML = h4.innerHTML;
        h4.replaceWith(p);
      });
      removeAll(element, [
        "script",
        "style",
        "noscript",
        "link",
        'iframe[src*="tracking" i]',
        'img[width="1"][height="1"]'
      ], { keepInSections: false });
    }
    if (hookName === "afterTransform") {
      removeAll(element, [
        "script",
        "style",
        "noscript",
        "link"
      ], { keepInSections: false });
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          const n = attr.name;
          if (n.startsWith("data-bi-") || n.startsWith("data-m") || n === "onclick" || n === "con_e357" || n === "wf-e344") {
            el.removeAttribute(n);
          }
        });
      });
    }
  }

  // tools/importer/transformers/surface-sections.js
  var MARKER = "data-excat-section-id";
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
  function transform2(hookName, element, payload) {
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument || payload.document;
    if (hookName === "beforeTransform") {
      const resolved = sections.map((s) => findSectionElement(element, s));
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const el = resolved[i];
        if (!el || !el.parentNode) continue;
        const isFirst = i === 0;
        if (isFirst && !sections[i].style) continue;
        const hr = doc.createElement("hr");
        hr.setAttribute(MARKER, sections[i].id);
        el.parentNode.insertBefore(hr, el);
        if (!isFirst) {
          el.setAttribute(`${MARKER}-el`, sections[i].id);
        }
      }
    }
    if (hookName === "afterTransform") {
      const markers = [...element.querySelectorAll(`hr[${MARKER}]`)];
      const markerById = {};
      markers.forEach((hr) => {
        markerById[hr.getAttribute(MARKER)] = hr;
      });
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const block = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        let nextMarker = null;
        for (let j = i + 1; j < sections.length; j += 1) {
          if (markerById[sections[j].id]) {
            nextMarker = markerById[sections[j].id];
            break;
          }
        }
        if (nextMarker && nextMarker.parentNode) {
          nextMarker.parentNode.insertBefore(block, nextMarker);
          continue;
        }
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
      const first = sections[0];
      if (first && markerById[first.id] && markerById[first.id].parentNode) {
        markerById[first.id].remove();
      }
      element.querySelectorAll(`[${MARKER}]`).forEach((el) => el.removeAttribute(MARKER));
      element.querySelectorAll(`[${MARKER}-el]`).forEach((el) => el.removeAttribute(`${MARKER}-el`));
    }
  }

  // tools/importer/transformers/surface-specs-modal.js
  function clean7(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function richText(root, document2) {
    const clone = root.cloneNode(true);
    clone.querySelectorAll("sup").forEach((sup) => {
      const a = sup.querySelector("a[href]");
      if (!a) {
        sup.replaceWith(document2.createTextNode(sup.textContent));
        return;
      }
      const link = document2.createElement("a");
      link.href = a.getAttribute("href");
      const s = document2.createElement("sup");
      s.textContent = clean7(a.textContent);
      link.append(s);
      sup.replaceWith(link);
    });
    clone.querySelectorAll("button, svg, img, script, style").forEach((el) => el.remove());
    clone.querySelectorAll("strong, b").forEach((bold) => {
      if (!bold.querySelector("br")) return;
      const parts = [];
      let current = document2.createElement(bold.tagName.toLowerCase());
      [...bold.childNodes].forEach((node) => {
        if (node.nodeName === "BR") {
          parts.push(current, document2.createElement("br"));
          current = document2.createElement(bold.tagName.toLowerCase());
        } else {
          current.append(node);
        }
      });
      parts.push(current);
      bold.replaceWith(...parts.filter((n) => n.nodeName === "BR" || clean7(n.textContent)));
    });
    const walker = document2.createTreeWalker(clone, 4);
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach((t) => {
      const prev = t.previousSibling;
      if (prev && prev.nodeName === "BR") {
        t.textContent = t.textContent.replace(/^\s{2,}/, (m) => "\u2003".repeat(Math.max(1, Math.round(m.replace(/[\r\n]/g, "").length / 4))));
      }
    });
    [clone, ...clone.querySelectorAll("*")].forEach((el) => {
      [...el.attributes].forEach((attr) => {
        if (attr.name !== "href") el.removeAttribute(attr.name);
      });
    });
    const blocks = [...clone.querySelectorAll("p, ul, ol")].filter((el) => !(el.parentElement && el.parentElement.closest("p, ul, ol")));
    if (blocks.length) return blocks.filter((el) => clean7(el.textContent));
    const p = document2.createElement("p");
    p.append(...clone.childNodes);
    return clean7(p.textContent) ? [p] : [];
  }
  function modalPath(originalURL) {
    try {
      const { pathname } = new URL(originalURL);
      const parts = pathname.replace(/\/$/, "").replace(/\.html?$/, "").split("/");
      const slug = parts.pop() || "index";
      return `${parts.join("/")}/modals/${slug}-specs`;
    } catch (e) {
      return null;
    }
  }
  function transform3(hookName, element, payload) {
    if (hookName !== "beforeTransform") return;
    const { document: document2 } = payload;
    const params = payload.params || {};
    const copy = element.querySelector("[data-import-specs]");
    if (!copy) return;
    const button = element.querySelector("[data-import-specs-trigger]");
    const path = modalPath(params.originalURL);
    const dl = copy.querySelector("dl");
    if (path && dl && Array.isArray(params.fragments)) {
      const doc = document2.createElement("div");
      const heading = copy.querySelector("h1, h2, h3, h4");
      if (heading) {
        const h2 = document2.createElement("h2");
        h2.textContent = clean7(heading.textContent);
        doc.append(h2);
      }
      const intro = copy.querySelector(":scope > p");
      if (intro) doc.append(...richText(intro, document2));
      const cells = [];
      [...dl.children].forEach((el) => {
        if (el.tagName === "DT") cells.push([clean7(el.textContent), ""]);
        else if (el.tagName === "DD" && cells.length) cells[cells.length - 1][1] = richText(el, document2);
      });
      if (cells.length) {
        doc.append(WebImporter.Blocks.createBlock(document2, { name: "table-compare (specs)", cells }));
      }
      params.fragments.push({ element: doc, path });
      if (button) {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        const a = document2.createElement("a");
        a.href = path;
        a.textContent = clean7(button.textContent);
        strong.append(a);
        p.append(strong);
        button.replaceWith(p);
      }
    }
    copy.remove();
  }

  // tools/importer/prepare/surface-expand.js
  var sleep = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
  function waitFor(test, timeout = 3e3, step = 100) {
    return __async(this, null, function* () {
      const end = Date.now() + timeout;
      while (Date.now() < end) {
        const found = test();
        if (found) return found;
        yield sleep(step);
      }
      return test();
    });
  }
  function expandTabs(document2) {
    return __async(this, null, function* () {
      const wrap = [...document2.querySelectorAll("div")].find((d) => d.querySelector(":scope > #laptop-tabs"));
      if (!wrap) return 0;
      const container = wrap.querySelector(":scope > .container");
      const buttons = [...wrap.querySelectorAll("#laptop-tabs button")];
      if (!container || buttons.length < 2) return 0;
      const signature = (el) => {
        var _a;
        return el ? `${el.textContent}|${((_a = el.querySelector("img")) == null ? void 0 : _a.getAttribute("src")) || ""}` : "";
      };
      const clones = [];
      let previous = null;
      for (const [i, button] of buttons.entries()) {
        button.click();
        const panel = yield waitFor(() => {
          const current = container.querySelector(":scope > div");
          if (!current) return null;
          if (i > 0 && signature(current) === previous) return null;
          return current;
        }, 4e3);
        yield sleep(500);
        if (panel) {
          previous = signature(panel);
          const view = document2.defaultView;
          panel.querySelectorAll("button.rounded-full[aria-label]").forEach((swatch) => {
            const rgb = (view.getComputedStyle(swatch).backgroundColor.match(/\d+(\.\d+)?/g) || []).slice(0, 3);
            if (rgb.length === 3) {
              swatch.dataset.swatchColor = `#${rgb.map((v) => Math.round(+v).toString(16).padStart(2, "0")).join("")}`;
            }
          });
          const clone = panel.cloneNode(true);
          clone.removeAttribute("id");
          clone.removeAttribute("hidden");
          clones.push(clone);
        }
      }
      if (clones.length < 2) return clones.length;
      const staticContainer = container.cloneNode(false);
      staticContainer.append(...clones);
      container.replaceWith(staticContainer);
      return clones.length;
    });
  }
  function expandFeatureAccordion(document2) {
    return __async(this, null, function* () {
      var _a;
      const section = document2.querySelector("#surface-laptop-accordion-feature-animations");
      if (!section) return 0;
      const buttons = [...section.querySelectorAll("h3 button")];
      const copies = /* @__PURE__ */ new Map();
      for (const button of buttons) {
        const item = (_a = button.closest("h3")) == null ? void 0 : _a.parentElement;
        if (!item) continue;
        if (button.getAttribute("aria-expanded") !== "true") button.click();
        const rich = yield waitFor(() => item.querySelector(".rich-text-content"));
        if (rich) copies.set(item, rich.cloneNode(true));
      }
      let restored = 0;
      copies.forEach((copy, item) => {
        if (!item.querySelector(".rich-text-content")) {
          item.append(copy);
          restored += 1;
        }
      });
      return restored;
    });
  }
  function flattenSplitText(document2) {
    let count = 0;
    document2.querySelectorAll("span.sr-only").forEach((sr) => {
      const parent = sr.parentElement;
      if (!parent) return;
      const animated = [...parent.children].filter((c) => c !== sr && (c.matches(".st-line, [data-split]") || c.querySelector(".st-line, .st-word")));
      if (!animated.length) return;
      animated.forEach((a) => a.remove());
      sr.replaceWith(document2.createTextNode(sr.textContent.replace(/\s+/g, " ").trim()));
      count += 1;
    });
    return count;
  }
  function annotateScrollVideos(document2) {
    const scriptText = [...document2.scripts].map((s) => s.textContent).join("\n").replace(/\\"/g, '"');
    const FSV = /https:\/\/downloads\.ctfassets\.net\/[^"\\\s)]+?\.fsv/g;
    let count = 0;
    document2.querySelectorAll("div.sticky").forEach((sticky) => {
      if (!sticky.querySelector(":scope > canvas")) return;
      const img = sticky.querySelector("picture img");
      if (!img) return;
      const poster = new URL(img.getAttribute("src"), document2.baseURI).pathname.split("/").pop();
      const at = scriptText.indexOf(poster);
      if (at < 0) return;
      const nearby = scriptText.slice(Math.max(0, at - 4e3), at + 4e3);
      const urls = [...new Set(nearby.match(FSV) || [])];
      const mobile = urls.find((u) => /mobile/i.test(u.split("/").pop()));
      const desktop = urls.find((u) => u !== mobile);
      if (desktop) sticky.dataset.scrollVideoDesktop = desktop;
      if (mobile) sticky.dataset.scrollVideoMobile = mobile;
      if (desktop || mobile) count += 1;
    });
    return count;
  }
  function annotateCompareColours(document2) {
    return __async(this, null, function* () {
      var _a;
      const view = document2.defaultView;
      let count = 0;
      for (const table of document2.querySelectorAll("table")) {
        const rows = [...table.querySelectorAll("tr")];
        const colourRow = rows.find((r) => {
          var _a2;
          return /^colou?rs?$/i.test((((_a2 = r.firstElementChild) == null ? void 0 : _a2.textContent) || "").trim());
        });
        const headRow = rows.find((r) => r.querySelector("img"));
        if (!colourRow || !headRow) continue;
        for (let c = 1; c < colourRow.children.length; c += 1) {
          const dots = [...colourRow.children[c].querySelectorAll("button")];
          const headImg = () => {
            var _a2;
            return (_a2 = headRow.children[c]) == null ? void 0 : _a2.querySelector("img");
          };
          for (const dot of dots) {
            const before = (_a = headImg()) == null ? void 0 : _a.getAttribute("src");
            dot.click();
            yield waitFor(() => headImg() && (dot === dots[0] || headImg().getAttribute("src") !== before), 1500);
            const img = headImg();
            if (img) {
              dot.dataset.colourSrc = img.getAttribute("src");
              dot.dataset.colourAlt = img.getAttribute("alt") || "";
            }
            const rgb = (view.getComputedStyle(dot).backgroundColor.match(/\d+(\.\d+)?/g) || []).slice(0, 3);
            if (rgb.length === 3) dot.dataset.swatchColor = `#${rgb.map((v) => Math.round(+v).toString(16).padStart(2, "0")).join("")}`;
            count += 1;
          }
          if (dots[0]) dots[0].click();
        }
      }
      return count;
    });
  }
  function captureSpecsDialog(document2) {
    return __async(this, null, function* () {
      var _a;
      const button = [...document2.querySelectorAll('button[aria-haspopup="dialog"]')].find((b) => /specs/i.test(b.textContent));
      if (!button) return false;
      button.click();
      const dialog = yield waitFor(() => [...document2.querySelectorAll('[role="dialog"], dialog')].find((d) => d.querySelector("dl dt") && d.getBoundingClientRect().width > 0), 4e3);
      if (!dialog) return false;
      const copy = document2.createElement("div");
      copy.setAttribute("data-import-specs", "");
      copy.hidden = true;
      const heading = dialog.querySelector("h1, h2, h3, h4");
      const intro = (_a = heading == null ? void 0 : heading.nextElementSibling) == null ? void 0 : _a.querySelector("p");
      if (heading) copy.append(heading.cloneNode(true));
      if (intro) copy.append(intro.cloneNode(true));
      copy.append(dialog.querySelector("dl").cloneNode(true));
      button.dataset.importSpecsTrigger = "";
      button.after(copy);
      const close = [...dialog.querySelectorAll("button")].find((b) => /close/i.test(b.getAttribute("aria-label") || ""));
      if (close) close.click();
      yield sleep(400);
      return true;
    });
  }
  function expandInteractive(_0) {
    return __async(this, arguments, function* ({ document: document2 }) {
      let specs = false;
      try {
        specs = yield captureSpecsDialog(document2);
      } catch (e) {
      }
      console.log(`[surface-expand] specs dialog captured: ${specs}`);
      let compareColours = 0;
      try {
        compareColours = yield annotateCompareColours(document2);
      } catch (e) {
      }
      console.log(`[surface-expand] comparison colours recorded: ${compareColours}`);
      let scrollVideos = 0;
      try {
        scrollVideos = annotateScrollVideos(document2);
      } catch (e) {
      }
      console.log(`[surface-expand] scroll videos found: ${scrollVideos}`);
      const tabs = yield expandTabs(document2).catch(() => 0);
      const accordion = yield expandFeatureAccordion(document2).catch(() => 0);
      let flattened = 0;
      try {
        flattened = flattenSplitText(document2);
      } catch (e) {
      }
      console.log(`[surface-expand] tab panels: ${tabs}, accordion copies restored: ${accordion}, split texts flattened: ${flattened}`);
    });
  }

  // tools/importer/import-surface-product.js
  var PAGE_TEMPLATE = {
    "name": "surface-product",
    "urls": [
      "https://www.microsoft.com/en-us/surface/devices/surface-laptop"
    ],
    "representativeUrl": "https://www.microsoft.com/en-us/surface/devices/surface-laptop",
    "description": "Surface device product page: video hero, scroll story, media tabs, specs, bento, use-case accordion, feature and compare cards, FAQ, footnotes",
    "blocks": [
      {
        "name": "hero-product",
        "instances": [
          "#surface-laptop-product-hero > section",
          "#surface-laptop-image-description > section"
        ]
      },
      {
        "name": "carousel-scroll",
        "instances": [
          "#surface-laptop-scrolling-slide .container-fluid"
        ]
      },
      {
        "name": "tabs-media",
        "instances": [
          "#surface-laptop-screen-sizes-section div:has(> #laptop-tabs)"
        ]
      },
      {
        "name": "cards-bento",
        "instances": [
          '[id="Surface Laptop Mega Promo camera"] > section > div.container:has(video)',
          '[id="surface-laptop-mega-promo"]:has(video) > section > div.container:has(video)'
        ]
      },
      {
        "name": "scroll-video",
        "instances": [
          '[id="surface-laptop-mega-promo"]:not(:has(video)) div:has(> div.sticky)'
        ]
      },
      {
        "name": "accordion-media",
        "instances": [
          "#surface-laptop-accordion-feature-animations > section"
        ]
      },
      {
        "name": "quote-spotlight",
        "instances": [
          "#surface-laptop-testimonial-spotlight > section"
        ]
      },
      {
        "name": "table-compare",
        "instances": [
          "#Surface-laptop-product-comparison-table table"
        ]
      },
      {
        "name": "cards-product",
        "instances": [
          "#surface-laptop-product-card-section div.pointer-events-auto"
        ]
      },
      {
        "name": "accordion-faq",
        "instances": [
          "#surface-laptop-accordion > section"
        ]
      }
    ],
    "urlPattern": "/en-us/surface/devices/*",
    "sections": [
      {
        "id": "s1",
        "name": "Product hero",
        "selector": [
          "#surface-laptop-product-hero"
        ],
        "style": null,
        "blocks": [
          "hero-product"
        ],
        "defaultContent": []
      },
      {
        "id": "s2",
        "name": "A laptop without limits",
        "selector": [
          "#surface-laptop-scrolling-slide"
        ],
        "style": "light, dune, centered",
        "blocks": [
          "carousel-scroll"
        ],
        "defaultContent": [
          "#surface-laptop-scrolling-slide > section > div.container.text-center"
        ]
      },
      {
        "id": "s3",
        "name": "Good things come in threes",
        "selector": [
          "#surface-laptop-screen-sizes-section"
        ],
        "style": "light, dune, centered",
        "blocks": [
          "tabs-media"
        ],
        "defaultContent": [
          "#surface-laptop-screen-sizes-section > section > div > div.container"
        ]
      },
      {
        "id": "s4",
        "name": "Power through your day",
        "selector": [
          "#surface-laptop-image-description"
        ],
        "style": null,
        "blocks": [
          "hero-product"
        ],
        "defaultContent": []
      },
      {
        "id": "s5",
        "name": "A camera that reads the room",
        "selector": [
          '[id="Surface Laptop Mega Promo camera"]'
        ],
        "style": "light, centered",
        "blocks": [
          "cards-bento"
        ],
        "defaultContent": [
          '[id="Surface Laptop Mega Promo camera"] > section > div:first-child'
        ]
      },
      {
        "id": "s6",
        "name": "The eyes have it",
        "selector": [
          '[id="surface-laptop-mega-promo"]:not(:has(video))'
        ],
        "style": "light, dune, centered",
        "blocks": [
          "scroll-video"
        ],
        "defaultContent": [
          '[id="surface-laptop-mega-promo"]:not(:has(video)) > section > div:first-child',
          '[id="surface-laptop-mega-promo"]:not(:has(video)) > section > div.container'
        ]
      },
      {
        "id": "s7",
        "name": "The ultimate Windows device",
        "selector": [
          "#surface-laptop-accordion-feature-animations"
        ],
        "style": "dark",
        "blocks": [
          "accordion-media"
        ],
        "defaultContent": []
      },
      {
        "id": "s8",
        "name": "Secured from day one",
        "selector": [
          '[id="surface-laptop-mega-promo"]:has(video)'
        ],
        "style": "light, dune, centered",
        "blocks": [
          "cards-bento"
        ],
        "defaultContent": [
          '[id="surface-laptop-mega-promo"]:has(video) > section > div:first-child',
          '[id="surface-laptop-mega-promo"]:has(video) > section > div.container:last-child'
        ]
      },
      {
        "id": "s9",
        "name": "Surface is made for makers",
        "selector": [
          "#surface-laptop-testimonial-spotlight"
        ],
        "style": null,
        "blocks": [
          "quote-spotlight"
        ],
        "defaultContent": []
      },
      {
        "id": "s10",
        "name": "Meet the family",
        "selector": [
          "#Surface-laptop-product-comparison-table"
        ],
        "style": "light",
        "blocks": [
          "table-compare"
        ],
        "defaultContent": [
          "#Surface-laptop-product-comparison-table > section > div.container:first-child",
          "#Surface-laptop-product-comparison-table > section > div.container.text-center"
        ]
      },
      {
        "id": "s11",
        "name": "Explore Surface Laptop accessories",
        "selector": [
          "#surface-laptop-product-card-section"
        ],
        "style": "light",
        "blocks": [
          "cards-product"
        ],
        "defaultContent": [
          "#surface-laptop-product-card-section > section > div > div.container"
        ]
      },
      {
        "id": "s12",
        "name": "Surface Laptop FAQs",
        "selector": [
          "#surface-laptop-accordion"
        ],
        "style": "light, dune",
        "blocks": [
          "accordion-faq"
        ],
        "defaultContent": []
      },
      {
        "id": "s13",
        "name": "Footnotes",
        "selector": [
          "#surface-laptop-footnotes"
        ],
        "style": "light, light-grey, footnotes",
        "blocks": [],
        "defaultContent": [
          "#surface-laptop-footnotes ol"
        ]
      }
    ]
  };
  var EXTRA_METADATA = { nav: "/nav-surface" };
  var parsers = {
    "hero-product": parse,
    "carousel-scroll": parse2,
    "tabs-media": parse3,
    "cards-bento": parse4,
    "scroll-video": parse5,
    "accordion-media": parse6,
    "quote-spotlight": parse7,
    "table-compare": parse8,
    "cards-product": parse9,
    "accordion-faq": parse10
  };
  var sectionTransformers = [transform2];
  var fragmentTransformers = [];
  var lateTransformers = [...sectionTransformers, ...fragmentTransformers];
  var correctionTransformers = [];
  var transformers = [transform, transform3, ...lateTransformers, ...correctionTransformers];
  var earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
  var CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));
  function executeTransformers(hookName, element, payload, list = transformers) {
    var _a, _b;
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: ((_b = (_a = payload.params) == null ? void 0 : _a.targets) == null ? void 0 : _b.template) || PAGE_TEMPLATE });
    list.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template, url) {
    const pageBlocks = [];
    const pageKey = (u) => {
      try {
        const { origin, pathname } = new URL(u);
        return `${origin}${pathname.replace(/\/$/, "")}`;
      } catch (e) {
        return u;
      }
    };
    const key = pageKey(url);
    const claim = (blockDef, selector) => {
      let matches = [];
      try {
        matches = document2.querySelectorAll(selector);
      } catch (e) {
        return;
      }
      matches.forEach((element) => {
        if (pageBlocks.some((b) => b.element === element || b.element.contains(element) || element.contains(b.element))) return;
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    };
    template.blocks.forEach((blockDef) => {
      const entry = Object.entries(blockDef.pageInstances || {}).find(([u]) => pageKey(u) === key);
      (entry ? entry[1] : []).forEach((selector) => claim(blockDef, selector));
    });
    template.blocks.forEach((blockDef) => (blockDef.instances || []).forEach((selector) => claim(blockDef, selector)));
    return pageBlocks;
  }
  function markPageTargets(payload) {
    const { document: document2, params } = payload;
    executeTransformers("beforeTransform", document2.body, payload, earlyTransformers);
    const blocks = findBlocksOnPage(document2, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
      element.setAttribute("data-excat-block", String(i));
      return { name, selector };
    });
    const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
      const target = (section.selector || []).map((s) => {
        try {
          return document2.querySelector(s);
        } catch (e) {
          return null;
        }
      }).find(Boolean);
      if (!target) return section;
      target.setAttribute("data-excat-section", String(i));
      return __spreadProps(__spreadValues({}, section), { selector: [`[data-excat-section="${i}"]`] });
    });
    params.targets = { blocks, template: __spreadProps(__spreadValues({}, PAGE_TEMPLATE), { sections }) };
  }
  var import_surface_product_default = {
    // Live page only: reveal tab panels and accordion copy that mount on interaction.
    onLoad: (_0) => __async(null, [_0], function* ({ document: document2 }) {
      yield expandInteractive({ document: document2 });
    }),
    preprocess: (payload) => {
      if (CATALOG) markPageTargets(payload);
    },
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      params.fragments = [];
      if (!params.targets) markPageTargets(payload);
      const pageBlocks = params.targets.blocks.map((block, i) => __spreadProps(__spreadValues({}, block), { element: document2.querySelector(`[data-excat-block="${i}"]`) })).filter((block) => block.element);
      executeTransformers("beforeTransform", main, __spreadProps(__spreadValues({}, payload), { pageBlocks }), lateTransformers);
      pageBlocks.forEach((block) => {
        if (!main.contains(block.element)) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document: document2, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document2.createElement("hr"));
      const meta = __spreadValues(__spreadValues({}, WebImporter.Blocks.getMetadata(document2)), EXTRA_METADATA);
      main.append(WebImporter.Blocks.getMetadataBlock(document2, meta));
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      params.fragments.forEach(({ element }) => {
        executeTransformers("afterTransform", element, payload, earlyTransformers);
        WebImporter.rules.transformBackgroundImages(element, document2);
        WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
      });
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document2.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }, ...params.fragments];
    }
  };
  return __toCommonJS(import_surface_product_exports);
})();
