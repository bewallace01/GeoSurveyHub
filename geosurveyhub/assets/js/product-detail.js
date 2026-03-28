/**
 * Product detail — loads ../content/products.json by ?id= and renders specs, highlights, downfalls.
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
    if (Array.isArray(v)) return v.join(', ');
    return String(v);
  }

  function catLabel(slug) {
    return typeof formatCategorySlug === 'function'
      ? formatCategorySlug(slug)
      : slug;
  }

  function priceStr(p) {
    return typeof formatPriceRange === 'function' ? formatPriceRange(p) : '—';
  }

  function categoryHref(cat) {
    const map = {
      drones: 'drones.html',
      sensors: 'sensors.html',
      lidar: 'lidar.html',
      'gnss-rtk': 'gnss-rtk.html',
      trucks: 'trucks.html',
      computers: 'computers.html',
      'total-stations': 'total-stations.html',
      other: 'equipment.html',
    };
    return map[cat] || 'equipment.html';
  }

  function renderSpecsTable(specs) {
    if (!specs || typeof specs !== 'object') return '';
    const rows = Object.entries(specs)
      .map(
        ([k, v]) => `
      <tr>
        <th scope="row">${esc(formatSpecKey(k))}</th>
        <td>${esc(formatSpecVal(v))}</td>
      </tr>`
      )
      .join('');
    return `
      <div class="product-detail-spec-wrap">
        <h2 class="product-detail-section-title" id="specs">Full specifications</h2>
        <table class="product-spec-table" aria-labelledby="specs">
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  function renderList(title, id, items, variant) {
    if (!items || !items.length) return '';
    const lis = items.map((t) => `<li>${esc(t)}</li>`).join('');
    const mod = variant === 'downfalls' ? ' product-bullet-list--caution' : '';
    return `
      <section class="product-detail-block" aria-labelledby="${id}">
        <h2 class="product-detail-section-title" id="${id}">${esc(title)}</h2>
        <ul class="product-bullet-list${mod}">${lis}</ul>
      </section>`;
  }

  function productHeroImage(p) {
    if (typeof productImageUrl !== 'function') return '';
    const src = productImageUrl(p);
    const fb =
      typeof productImageFallback === 'function' ? productImageFallback(p) : src;
    const alt = esc(p.name) + ' — product photo';
    return `<img class="product-detail-photo" src="${src}" alt="${alt}" width="640" height="480" loading="eager" decoding="async" onerror="this.onerror=null;this.src='${fb}'" />`;
  }

  function renderProduct(p) {
    const badge = p.badge
      ? `<span class="panel-badge product-detail-badge">${esc(p.badge)}</span>`
      : '';
    const useCases = (p.use_cases || [])
      .map((u) => esc(u.replace(/-/g, ' ')))
      .join(', ');
    const useBlock = useCases
      ? `<p class="product-detail-use-cases"><strong>Common uses:</strong> ${useCases}</p>`
      : '';

    return `
      <div class="product-detail-hero">
        <div class="product-detail-hero-text">
          <p class="product-category">${esc(catLabel(p.category))}${p.subcategory ? ` · ${esc(p.subcategory.replace(/-/g, ' '))}` : ''}</p>
          <h1>${esc(p.name)}</h1>
          ${p.brand ? `<p class="product-detail-brand">${esc(p.brand)}</p>` : ''}
          <p class="prose product-detail-lead">${esc(p.description || '')}</p>
          ${useBlock}
          <div class="product-footer product-detail-price-row">
            <div>
              <div class="product-price">${esc(priceStr(p))}</div>
              <p class="prose product-detail-price-note">Approximate U.S. retail range; dealer pricing and bundles vary.</p>
            </div>
            <a href="financing.html" class="add-to-quote">Financing options</a>
          </div>
        </div>
        <div class="visual-panel product-detail-visual">
          <div class="visual-panel-inner product-detail-visual-inner">
            ${productHeroImage(p)}
            ${badge}
          </div>
        </div>
      </div>

      ${renderList('Highlights', 'highlights', p.highlights, 'highlights')}
      ${renderList('Limitations & caveats', 'downfalls', p.downfalls, 'downfalls')}
      ${renderSpecsTable(p.specs)}

      <aside class="callout-box product-detail-callout">
        <div class="callout-label">More context</div>
        <p class="product-detail-callout-p">
          <a href="guide.html">Buyer’s guide</a> ·
          <a href="catalog.html">Full catalog</a> ·
          <a href="${categoryHref(p.category)}">${esc(catLabel(p.category))}</a>
        </p>
      </aside>
    `;
  }

  function setHead(p) {
    const title = `${p.name} — GeoSurveyHub`;
    document.title = title;
    const md = document.querySelector('meta[name="description"]');
    if (md) {
      const d = (p.description || '').slice(0, 155);
      md.setAttribute('content', d + (d.length >= 155 ? '…' : ''));
    }
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      const base = canonical.getAttribute('href').split('?')[0];
      canonical.setAttribute('href', `${base}?id=${encodeURIComponent(p.id)}`);
    }
    if (typeof productImageUrl === 'function') {
      const rel = productImageUrl(p);
      const abs = new URL(rel, window.location.href).href;
      let og = document.querySelector('meta[property="og:image"]');
      if (!og) {
        og = document.createElement('meta');
        og.setAttribute('property', 'og:image');
        document.head.appendChild(og);
      }
      og.setAttribute('content', abs);
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const root = document.getElementById('product-detail-root');
    const bc = document.getElementById('product-breadcrumb');
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      root.innerHTML = `
        <p class="catalog-error">No product selected. <a href="catalog.html">Browse the catalog</a> and choose a product.</p>`;
      if (bc) bc.innerHTML = `<a href="../index.html">Home</a><span class="breadcrumb-sep">/</span><a href="catalog.html">Catalog</a><span class="breadcrumb-sep">/</span><span class="breadcrumb-current">Product</span>`;
      return;
    }

    try {
      const res = await fetch('../content/products.json');
      if (!res.ok) throw new Error(String(res.status));
      const all = await res.json();
      const p = all.find((x) => x.id === id);
      if (!p) {
        root.innerHTML = `<p class="catalog-error">Product not found. <a href="catalog.html">Back to catalog</a></p>`;
        return;
      }

      setHead(p);
      root.innerHTML = renderProduct(p);

      if (bc) {
        const catHref = categoryHref(p.category);
        const catName = catLabel(p.category);
        bc.innerHTML = `
          <a href="../index.html">Home</a><span class="breadcrumb-sep">/</span>
          <a href="catalog.html">Catalog</a><span class="breadcrumb-sep">/</span>
          <a href="${catHref}">${esc(catName)}</a><span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">${esc(p.name)}</span>`;
      }
    } catch (e) {
      console.warn('Product detail load failed:', e);
      root.innerHTML =
        '<p class="catalog-error">Could not load product data. Use a local web server so <code>products.json</code> can load, or try again later.</p>';
    }
  });
})();
