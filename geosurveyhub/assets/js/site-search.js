/**
 * Site-wide search: static index + products + news. Magnifying-glass control in nav.
 */
(function () {
  const DEBOUNCE_MS = 180;
  let index = [];
  let debounceTimer = null;
  let lastFocus = null;

  function contentBase() {
    return /\/pages\//.test(window.location.pathname) ? '../content/' : 'content/';
  }

  function resolveHref(path) {
    const inPages = /\/pages\//.test(window.location.pathname);
    if (path === 'index.html') {
      return '/';
    }
    if (path.startsWith('pages/')) {
      const rest = path.slice('pages/'.length);
      return inPages ? rest : path;
    }
    return path;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function scoreEntry(hayTitle, hayText, q) {
    const title = hayTitle.toLowerCase();
    const text = (hayTitle + ' ' + hayText).toLowerCase();
    const qNorm = q.trim().toLowerCase();
    if (!qNorm) return 0;
    let s = 0;
    if (title.includes(qNorm)) s += 120;
    if (text.includes(qNorm)) s += 40;
    const words = qNorm.split(/\s+/).filter((w) => w.length > 1);
    words.forEach((w) => {
      if (title.includes(w)) s += 25;
      if (text.includes(w)) s += 4;
    });
    return s;
  }

  async function loadAll() {
    const base = contentBase();
    const out = [];

    const [rStatic, rProducts, rNews] = await Promise.allSettled([
      fetch(base + 'search-index.json').then((r) => (r.ok ? r.json() : [])),
      fetch(base + 'products.json').then((r) => (r.ok ? r.json() : [])),
      fetch(base + 'news.json').then((r) => (r.ok ? r.json() : [])),
    ]);

    if (rStatic.status === 'fulfilled' && Array.isArray(rStatic.value)) {
      rStatic.value.forEach((item) => {
        out.push({
          title: item.title,
          href: resolveHref(item.path),
          text: item.text || '',
          kind: 'page',
        });
      });
    }

    if (rProducts.status === 'fulfilled' && Array.isArray(rProducts.value)) {
      rProducts.value.forEach((p) => {
        const desc = (p.description || '') + ' ' + (p.brand || '') + ' ' + (p.category || '');
        const hl = Array.isArray(p.highlights) ? p.highlights.join(' ') : '';
        const df = Array.isArray(p.downfalls) ? p.downfalls.join(' ') : '';
        out.push({
          title: p.name,
          href: resolveHref('pages/product.html') + '?id=' + encodeURIComponent(p.id),
          text: [desc, hl, df].filter(Boolean).join(' '),
          kind: 'equipment',
        });
      });
    }

    if (rNews.status === 'fulfilled' && Array.isArray(rNews.value)) {
      rNews.value.forEach((a) => {
        const blob = [a.title, a.excerpt || '', (a.tags || []).join(' '), a.category || ''].join(' ');
        out.push({
          title: a.title,
          href: resolveHref('pages/news.html') + '#' + encodeURIComponent(a.id),
          text: blob,
          kind: 'news',
        });
      });
    }

    return out;
  }

  function search(query) {
    if (!query.trim()) return [];
    const scored = index
      .map((e) => ({ e, s: scoreEntry(e.title, e.text, query) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 24)
      .map((x) => x.e);
    return scored;
  }

  function kindLabel(kind) {
    if (kind === 'equipment') return 'Equipment';
    if (kind === 'news') return 'News';
    return 'Guide';
  }

  function renderResults(container, query, results) {
    if (!query.trim()) {
      container.innerHTML =
        '<p class="site-search-hint">Search guides, the equipment catalog, and news headlines. Press <kbd>Ctrl</kbd>+<kbd>K</kbd> or <kbd>⌘</kbd>+<kbd>K</kbd> to open.</p>';
      return;
    }
    if (!results.length) {
      container.innerHTML =
        '<p class="site-search-empty">No results. Try different words or browse the <a href="' +
        escapeHtml(resolveHref('pages/catalog.html')) +
        '">catalog</a>.</p>';
      return;
    }
    container.innerHTML =
      '<ul class="site-search-list">' +
      results
        .map((r) => {
          return (
            '<li class="site-search-hit">' +
            '<a class="site-search-hit-link" href="' +
            escapeHtml(r.href) +
            '">' +
            '<span class="site-search-hit-title">' +
            escapeHtml(r.title) +
            '</span>' +
            '<span class="site-search-hit-meta">' +
            kindLabel(r.kind) +
            '</span>' +
            '</a></li>'
          );
        })
        .join('') +
      '</ul>';
  }

  function openModal(root, input, resultsEl, triggerBtn) {
    lastFocus = document.activeElement;
    root.hidden = false;
    document.body.classList.add('site-search-open');
    triggerBtn?.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => {
      input.focus();
      input.select();
    });
  }

  function closeModal(root, triggerBtn) {
    root.hidden = true;
    document.body.classList.remove('site-search-open');
    triggerBtn?.setAttribute('aria-expanded', 'false');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function buildModal() {
    const wrap = document.createElement('div');
    wrap.id = 'site-search-root';
    wrap.className = 'site-search';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'site-search-heading');
    wrap.hidden = true;
    wrap.innerHTML =
      '<div class="site-search-backdrop" tabindex="-1"></div>' +
      '<div class="site-search-panel">' +
      '<label id="site-search-heading" class="visually-hidden" for="site-search-input">Search this site</label>' +
      '<div class="site-search-row">' +
      '<svg class="site-search-mag" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
      '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>' +
      '<input type="search" id="site-search-input" class="site-search-input" placeholder="Search guides, equipment, news…" autocomplete="off" autocorrect="off" spellcheck="false" />' +
      '<button type="button" class="site-search-close" aria-label="Close search">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button></div>' +
      '<div id="site-search-results" class="site-search-results"></div>' +
      '</div>';

    document.body.appendChild(wrap);
    return wrap;
  }

  function buildNavButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-search-btn';
    btn.setAttribute('aria-label', 'Search site');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.innerHTML =
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
      '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>';
    return btn;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const nav = document.querySelector('.nav');
    if (!nav || document.getElementById('site-search-root')) return;

    const triggerBtn = buildNavButton();
    const actions = nav.querySelector('.nav-actions');
    if (actions) {
      actions.appendChild(triggerBtn);
    } else {
      nav.appendChild(triggerBtn);
    }

    const modal = buildModal();
    const input = modal.querySelector('#site-search-input');
    const resultsEl = modal.querySelector('#site-search-results');
    const backdrop = modal.querySelector('.site-search-backdrop');
    const closeBtn = modal.querySelector('.site-search-close');

    try {
      index = await loadAll();
    } catch (e) {
      console.warn('Site search index load failed:', e);
      index = [];
    }

    function runSearch() {
      const q = input.value;
      const res = search(q);
      renderResults(resultsEl, q, res);
    }

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(runSearch, DEBOUNCE_MS);
    });

    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        closeModal(modal, triggerBtn);
      }
    });

    triggerBtn.addEventListener('click', () => openModal(modal, input, resultsEl, triggerBtn));
    closeBtn.addEventListener('click', () => closeModal(modal, triggerBtn));
    backdrop.addEventListener('click', () => closeModal(modal, triggerBtn));

    document.addEventListener('keydown', (ev) => {
      if ((ev.metaKey || ev.ctrlKey) && ev.key === 'k') {
        ev.preventDefault();
        openModal(modal, input, resultsEl, triggerBtn);
      }
    });

    renderResults(resultsEl, '', []);
  });
})();
