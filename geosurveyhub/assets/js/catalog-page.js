/**
 * Equipment catalog — loads content/products.json and renders category sections
 * with linked cards (summary + specs preview → product.html?id=).
 */
(function () {
  function esc(s) {
    if (s == null) return '';
    const d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  function formatSpecKey(k) {
    return String(k)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function formatSpecVal(v) {
    if (Array.isArray(v)) {
      const joined = v.join(', ');
      return joined.length > 72 ? joined.slice(0, 69) + '…' : joined;
    }
    return String(v);
  }

  function previewSpecs(specs, maxLines) {
    if (!specs || typeof specs !== 'object') return [];
    return Object.entries(specs).slice(0, maxLines || 3);
  }

  function summaryLine(desc) {
    if (!desc) return '';
    const t = desc.trim();
    if (t.length <= 140) return t;
    return t.slice(0, 137).trim() + '…';
  }

  function productImageMarkup(p) {
    if (typeof productImageUrl !== 'function') return '';
    const src = productImageUrl(p);
    const fb =
      typeof productImageFallback === 'function' ? productImageFallback(p) : src;
    const alt = esc(p.name) + ' — product';
    return `<div class="catalog-card-media">
      <img class="catalog-card-img" src="${src}" alt="${alt}" width="400" height="250" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${fb}'" />
    </div>`;
  }

  function renderJumpNav(keys, catLabel) {
    if (!keys.length) return '';
    const links = keys
      .map((cat) => {
        const label = esc(catLabel(cat));
        const hash = 'cat-' + esc(cat);
        return `<a class="catalog-jump-link" href="#${hash}">${label}</a>`;
      })
      .join('');
    return `<nav class="catalog-jump-nav" aria-label="Jump to category">
      <span class="catalog-jump-label">Jump to</span>
      <div class="catalog-jump-links">${links}</div>
    </nav>`;
  }

  function renderCatalog(all) {
    const price = (p) =>
      typeof formatPriceRange === 'function' ? formatPriceRange(p) : '—';
    const catLabel = (slug) =>
      typeof formatCategorySlug === 'function' ? formatCategorySlug(slug) : slug;

    const byCat = {};
    all.forEach((p) => {
      const c = p.category || 'other';
      if (!byCat[c]) byCat[c] = [];
      byCat[c].push(p);
    });
    Object.keys(byCat).forEach((c) => {
      byCat[c].sort((a, b) => a.name.localeCompare(b.name));
    });
    const order = [
      'drones',
      'sensors',
      'lidar',
      'gnss-rtk',
      'trucks',
      'computers',
      'total-stations',
      'other',
    ];
    const keys = [...new Set([...order, ...Object.keys(byCat)])].filter((k) => byCat[k]);

    const sections = keys
      .map((cat) => {
        const cards = byCat[cat]
          .map((p) => {
            const specRows = previewSpecs(p.specs, 3);
            const specLis = specRows
              .map(
                ([k, v]) =>
                  `<li><span class="catalog-card-spec-k">${esc(formatSpecKey(k))}</span> <span class="catalog-card-spec-v">${esc(formatSpecVal(v))}</span></li>`
              )
              .join('');
            const badge = p.badge
              ? `<span class="catalog-card-badge">${esc(p.badge)}</span>`
              : '';
            return `
            <a class="catalog-card" href="product.html?id=${encodeURIComponent(p.id)}" id="product-${p.id.replace(/[^a-zA-Z0-9_-]/g, '')}">
              ${productImageMarkup(p)}
              <div class="catalog-card-body">
                <div class="catalog-card-top">
                  ${badge}
                  <h3 class="catalog-card-title">${esc(p.name)}</h3>
                  <p class="catalog-card-brand">${esc(p.brand || '')}</p>
                </div>
                <p class="catalog-card-summary">${esc(summaryLine(p.description))}</p>
                <ul class="catalog-card-specs" aria-label="Key specifications">${specLis}</ul>
                <div class="catalog-card-footer">
                  <span class="catalog-card-price">${esc(price(p))}</span>
                  <span class="catalog-card-cta">Full specs &amp; details</span>
                </div>
              </div>
            </a>`;
          })
          .join('');

        return `
      <section class="catalog-page-block" id="cat-${esc(cat)}" aria-labelledby="heading-${esc(cat)}">
        <h2 class="quiz-catalog-heading" id="heading-${esc(cat)}">${catLabel(cat)}</h2>
        <div class="catalog-grid">
          ${cards}
        </div>
      </section>
    `;
      })
      .join('');

    return renderJumpNav(keys, catLabel) + sections;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const root = document.getElementById('catalog-root');
    if (!root) return;
    try {
      const res = await fetch('../content/products.json');
      if (!res.ok) throw new Error(String(res.status));
      const all = await res.json();
      const countEl = document.getElementById('catalog-count');
      if (countEl) countEl.textContent = String(all.length);
      root.innerHTML = renderCatalog(all);
    } catch (e) {
      console.warn('Catalog load failed:', e);
      root.innerHTML =
        '<p class="catalog-error">Could not load the equipment catalog. If you opened this file directly from disk, use a local web server so <code>products.json</code> can load.</p>';
    }
  });
})();
