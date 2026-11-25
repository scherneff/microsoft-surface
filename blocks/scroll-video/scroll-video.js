/* global VideoDecoder, EncodedVideoChunk */

/**
 * scroll-video: a full-screen video that plays forward and backward with the page scroll.
 *
 * Content model (one row; cells are optional and order-tolerant):
 *   pictures: poster (first = landscape/desktop, second = portrait/mobile crop)
 *   links:    video sources (first = landscape/desktop, second = portrait/mobile)
 *
 * Sources can be `.fsv` frame sequences (H.264 chunks + JSON frame index, decoded on demand
 * with WebCodecs and drawn to a canvas) or regular `.mp4`/`.webm` files (scrubbed through
 * `currentTime`). The poster stays visible until the first frame is drawn, and is all that is
 * shown when the browser can't decode the source or the reader prefers reduced motion.
 */

const VIDEO_LINK = /\.(fsv|mp4|webm)(\?|#|$)/i;

function clamp(v, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v));
}

/** Parses an .fsv file: [u32 0][u32le headerLength][JSON header][frame data]. */
function parseFsv(buffer) {
  const view = new DataView(buffer);
  const headerLength = view.getUint32(4, true);
  const header = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 8, headerLength)));
  const dataStart = 8 + headerLength;
  const frames = [];
  for (let i = 0; i < header.frames.length; i += 4) {
    const [offset, size, timestamp, key] = header.frames.slice(i, i + 4);
    frames.push({
      offset: dataStart + offset, size, timestamp, key: key === 1,
    });
  }
  const config = {
    ...header.config,
    description: new Uint8Array(header.config.description || []),
  };
  return {
    config, frames, width: header.width, height: header.height, buffer,
  };
}

/** Draws arbitrary frames of an .fsv sequence, decoding from the nearest keyframe. */
async function createFsvPlayer(url, canvas) {
  if (!('VideoDecoder' in window) || !('EncodedVideoChunk' in window)) return null;
  const response = await fetch(url);
  if (!response.ok) return null;
  const fsv = parseFsv(await response.arrayBuffer());
  const { supported } = await VideoDecoder.isConfigSupported(fsv.config);
  if (!supported) return null;

  canvas.width = fsv.width;
  canvas.height = fsv.height;
  const ctx = canvas.getContext('2d');
  let wanted = -1;
  const decoder = new VideoDecoder({
    output: (frame) => {
      if (frame.timestamp === wanted) ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
      frame.close();
    },
    error: () => {},
  });

  let busy = false;
  let pending = null;
  let shown = -1;

  async function show(index) {
    if (index === shown) return;
    let key = index;
    while (key > 0 && !fsv.frames[key].key) key -= 1;
    wanted = fsv.frames[index].timestamp;
    decoder.reset();
    decoder.configure(fsv.config);
    for (let i = key; i <= index; i += 1) {
      const f = fsv.frames[i];
      decoder.decode(new EncodedVideoChunk({
        type: f.key ? 'key' : 'delta',
        timestamp: f.timestamp,
        data: new Uint8Array(fsv.buffer, f.offset, f.size),
      }));
    }
    await decoder.flush();
    shown = index;
  }

  async function seek(progress) {
    pending = Math.round(clamp(progress) * (fsv.frames.length - 1));
    if (busy) return;
    busy = true;
    try {
      while (pending !== null) {
        const next = pending;
        pending = null;
        // eslint-disable-next-line no-await-in-loop
        await show(next);
      }
    } catch (e) {
      // a decode error leaves the last good frame on screen
    } finally {
      busy = false;
    }
  }

  return { seek };
}

/** Scrubs a regular video file through currentTime. */
function createVideoPlayer(url, stage) {
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.src = url;
  stage.append(video);
  return new Promise((resolve) => {
    video.addEventListener('loadedmetadata', () => resolve({
      seek: (progress) => {
        if (Number.isFinite(video.duration)) video.currentTime = clamp(progress) * video.duration;
      },
    }), { once: true });
    video.addEventListener('error', () => resolve(null), { once: true });
  });
}

function buildPoster(pictures) {
  const [landscape, portrait] = pictures;
  if (!landscape) return null;
  const picture = landscape.cloneNode(true);
  const img = picture.querySelector('img');
  if (img) img.loading = 'lazy';
  if (portrait) {
    const portraitImg = portrait.querySelector('img');
    if (portraitImg) {
      // portrait crop first so it wins in portrait viewports
      const source = document.createElement('source');
      source.media = '(orientation: portrait)';
      source.srcset = portraitImg.currentSrc || portraitImg.src;
      picture.prepend(source);
    }
  }
  picture.classList.add('scroll-video-poster');
  return picture;
}

export default function decorate(block) {
  const pictures = [...block.querySelectorAll('picture')];
  const sources = [...block.querySelectorAll('a[href]')]
    .map((a) => a.href)
    .filter((href) => VIDEO_LINK.test(href));

  const track = document.createElement('div');
  track.className = 'scroll-video-track';
  const stage = document.createElement('div');
  stage.className = 'scroll-video-stage';
  track.append(stage);

  const poster = buildPoster(pictures);
  if (poster) stage.append(poster);
  block.replaceChildren(track);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!sources.length || reduceMotion) {
    block.classList.add('is-static');
    return;
  }

  const portrait = window.matchMedia('(orientation: portrait)').matches;
  const src = (portrait && sources[1]) || sources[0];

  let player = null;
  let ticking = false;

  const progress = () => {
    const rect = track.getBoundingClientRect();
    const range = rect.height - window.innerHeight;
    return range > 0 ? clamp(-rect.top / range) : 0;
  };

  const update = () => {
    ticking = false;
    if (player) player.seek(progress());
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  };

  const start = async () => {
    try {
      if (/\.fsv(\?|#|$)/i.test(src)) {
        const canvas = document.createElement('canvas');
        canvas.setAttribute('aria-hidden', 'true');
        stage.append(canvas);
        player = await createFsvPlayer(src, canvas);
        if (!player) canvas.remove();
      } else {
        player = await createVideoPlayer(src, stage);
      }
    } catch (e) {
      player = null;
    }
    if (!player) {
      block.classList.add('is-static');
      return;
    }
    await player.seek(progress());
    block.classList.add('is-ready');
  };

  // load the source well before the block arrives; only listen to scroll while it's near
  let started = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (!started) {
          started = true;
          start();
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
      } else {
        window.removeEventListener('scroll', onScroll);
      }
    });
  }, { rootMargin: '150% 0px' });
  observer.observe(track);
}
