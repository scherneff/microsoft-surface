const PAGE_SIZE = 10;
const VISIBLE = 3;

async function loadIndex() {
  const rows = [];
  for (let off = 0; ; off += 500) {
    // eslint-disable-next-line no-await-in-loop
    const resp = await fetch(`/query-index.json?offset=${off}&limit=500`);
    if (!resp.ok) break;
    // eslint-disable-next-line no-await-in-loop
    const json = await resp.json();
    rows.push(...json.data);
    if (off + 500 >= json.total) break;
  }
  return rows.filter((r) => !/noindex/i.test(r.robots || ''));
}

function search(rows, q) {
  const terms = q.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) return [];
  const hasAll = (s) => terms.every((t) => String(s || '').toLowerCase().includes(t));
  const titleHits = rows.filter((r) => hasAll(r.title));
  const descHits = titleHits.length < VISIBLE
    ? rows.filter((r) => !hasAll(r.title) && hasAll(r.description)) : [];
  const textHits = titleHits.length + descHits.length < VISIBLE
    ? rows.filter((r) => !hasAll(r.title) && !hasAll(r.description) && hasAll(r.text)) : [];
  const seen = new Set();
  return [...titleHits, ...descHits, ...textHits].filter((r) => {
    const key = `${r.title}|${r.description}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function excerpt(row, q) {
  if (row.description) return row.description;
  const text = String(row.text || '').replace(/\s+/g, ' ').trim();
  const body = text.startsWith(row.title) ? text.slice(row.title.length) : text;
  const at = body.toLowerCase().indexOf(q.toLowerCase().split(/\s+/)[0]);
  const start = Math.max(0, at - 80);
  return `${start > 0 ? '…' : ''}${body.slice(start, start + 200).trim()}…`;
}

function render(widget, hits, q, page) {
  const summary = widget.querySelector('.search-summary');
  const list = widget.querySelector('.search-results');
  const pages = widget.querySelector('.search-pages');
  list.textContent = '';
  pages.textContent = '';
  if (!q) {
    summary.textContent = '';
    return;
  }
  summary.textContent = hits.length
    ? `${hits.length} result${hits.length === 1 ? '' : 's'} for "${q}"`
    : `We couldn't find any results for "${q}".`;
  hits.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).forEach((row) => {
    const li = document.createElement('li');
    li.className = 'search-result';
    const h2 = document.createElement('h2');
    const a = document.createElement('a');
    a.href = row.path;
    a.textContent = row.title || row.path;
    h2.append(a);
    const p = document.createElement('p');
    p.textContent = excerpt(row, q);
    li.append(h2, p);
    list.append(li);
  });
  const count = Math.ceil(hits.length / PAGE_SIZE);
  for (let i = 1; count > 1 && i <= count; i += 1) {
    const a = document.createElement('a');
    a.href = `?q=${encodeURIComponent(q)}&page=${i}`;
    a.textContent = i;
    if (i === page) a.setAttribute('aria-current', 'page');
    pages.append(a);
  }
}

export default async function decorate(widget) {
  const params = new URLSearchParams(window.location.search);
  const q = (params.get('q') || params.get('query') || widget.dataset.q || '').trim();
  const page = Math.max(1, parseInt(params.get('page'), 10) || 1);
  const form = widget.querySelector('.search-form');
  form.action = window.location.pathname;
  widget.querySelector('.search-input').value = q;
  const rows = q ? await loadIndex() : [];
  render(widget, search(rows, q), q, page);
}
