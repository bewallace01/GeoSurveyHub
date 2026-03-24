/**
 * Standalone equipment catalog — loads content/products.json and renders
 * grouped lists with formatPriceRange (product-price.js).
 */
(function () {
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

    return keys
      .map(
        (cat) => `
      <section class="quiz-catalog-block catalog-page-block" id="cat-${cat}">
        <h2 class="quiz-catalog-heading">${catLabel(cat)}</h2>
        <ul class="quiz-catalog-list">
          ${byCat[cat]
            .map(
              (p) => `
            <li class="quiz-catalog-item">
              <span class="quiz-catalog-name">${p.name}${p.brand ? ` <span class="quiz-catalog-brand">(${p.brand})</span>` : ''}</span>
              <span class="quiz-catalog-price">${price(p)}</span>
            </li>
          `
            )
            .join('')}
        </ul>
      </section>
    `
      )
      .join('');
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
