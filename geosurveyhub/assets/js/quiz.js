// quiz.js — Equipment Recommender Quiz
// Multi-step quiz; results merge a primary stack with add-ons from your answers.

const QUIZ_STEPS = [
  {
    id: 'use',
    question: 'What are you mapping?',
    options: [
      { value: 'land', label: 'Land / property / topo' },
      { value: 'construction', label: 'Construction site / earthwork' },
      { value: 'forest', label: 'Forest / vegetation / canopy' },
      { value: 'corridor', label: 'Corridor (road / rail / pipeline)' },
      { value: 'urban', label: 'Urban / city / streetscape' },
      { value: 'underground', label: 'Underground / utilities / GPR' },
      { value: 'mining', label: 'Mining / quarry / stockpiles' },
      { value: 'coastal-hydro', label: 'Coastal / hydro / bathymetry' },
      { value: 'indoor-facility', label: 'Indoor / plant / facility / BIM' },
    ],
  },
  {
    id: 'size',
    question: 'How large is your typical project area?',
    options: [
      { value: 'lot', label: 'Single lot / under ~2 acres' },
      { value: 'under-10', label: '2 – 10 acres' },
      { value: '10-500', label: '10 – 500 acres' },
      { value: '500-10mi', label: '500 acres – 10 sq mi' },
      { value: '10mi+', label: '10+ sq mi' },
    ],
  },
  {
    id: 'budget',
    question: 'What is your equipment budget?',
    options: [
      { value: 'under-10k', label: 'Under $10,000' },
      { value: '10k-50k', label: '$10,000 – $50,000' },
      { value: '50k-200k', label: '$50,000 – $200,000' },
      { value: '200k+', label: '$200,000+' },
    ],
  },
  {
    id: 'veg',
    question: 'Do you need to see through tree canopy to the ground?',
    options: [
      { value: 'yes', label: 'Yes — dense forest or canopy' },
      { value: 'sometimes', label: 'Sometimes — mixed terrain' },
      { value: 'no', label: 'No — open or cleared terrain' },
      { value: 'na', label: 'Not applicable (urban / indoor / no trees)' },
    ],
  },
  {
    id: 'deliverable',
    question: 'What is the main output you care about next?',
    options: [
      { value: 'general', label: 'General mapping / mixed deliverables' },
      { value: 'hydro', label: 'Water depth / bathymetry / hydrographic' },
      { value: 'monitoring', label: 'Monitoring / deformation / repeat surveys' },
      { value: 'spectral', label: 'Crops / vegetation / multispectral' },
      { value: 'indoor-slam', label: 'Indoor / GPS-denied / SLAM scanning' },
      { value: 'geophysics', label: 'GPR / magnetics / gravity' },
      { value: 'gnss-office', label: 'RTK corrections / network / office software' },
    ],
  },
];

const RECOMMENDATIONS = {
  'airborne-lidar': {
    title: 'Airborne LiDAR System',
    description:
      'For large forested areas or regional mapping, an airborne LiDAR system — helicopter or fixed-wing — gives you the coverage rate and canopy penetration you need.',
    products: ['riegl-vux-10025', 'leica-multimapper', 'yellowscan-mapper-plus', 'riegl-vux-820g'],
    category: 'lidar',
    categoryLabel: 'Explore LiDAR Systems →',
  },
  'drone-lidar': {
    title: 'Drone LiDAR Kit',
    description:
      'A drone LiDAR setup maps forested terrain at centimeter accuracy. The DJI Matrice 350 RTK paired with a Zenmuse L2 is the most accessible professional system available.',
    products: ['dji-matrice-350-rtk', 'dji-zenmuse-l2', 'yellowscan-mapper-plus', 'riegl-vux-10025'],
    category: 'drones',
    categoryLabel: 'Explore Drone Systems →',
  },
  'drone-photogrammetry': {
    title: 'Drone Photogrammetry Kit',
    description:
      'For open terrain mapping, drone photogrammetry delivers excellent results at a fraction of LiDAR cost. The Matrice 350 RTK + Zenmuse P1 is a common benchmark.',
    products: ['dji-matrice-350-rtk', 'dji-zenmuse-p1', 'dji-mavic-3-enterprise-rtk', 'dji-phantom-4-rtk'],
    category: 'drones',
    categoryLabel: 'Explore Drones →',
  },
  'fixed-wing-photogrammetry': {
    title: 'Fixed-Wing Drone + Photogrammetry',
    description:
      'For very large open areas, a fixed-wing drone dramatically increases coverage per flight. Pair with a high-res camera and Pix4D or RealityCapture for efficient large-area mapping.',
    products: ['sensefly-ebee-x', 'dji-zenmuse-p1', 'dji-matrice-350-rtk', 'dji-phantom-4-rtk'],
    category: 'drones',
    categoryLabel: 'Explore Sensors →',
  },
  'rtk-photogrammetry': {
    title: 'RTK GNSS Rover + Entry Drone',
    description:
      'For budget-conscious operations on open terrain, a quality RTK rover for ground control points combined with a drone and photogrammetry software delivers survey-grade results.',
    products: ['emlid-reach-rs3', 'dji-zenmuse-p1', 'dji-phantom-4-rtk', 'spectra-sp85'],
    category: 'gnss-rtk',
    categoryLabel: 'Explore GNSS/RTK →',
  },
  'gpr-total-station': {
    title: 'GPR + Total Station + SLAM Scanner',
    description:
      'Underground utility mapping uses Ground Penetrating Radar with precise surface control from a total station or GNSS. For GPS-denied interior spaces, a SLAM scanner like the Emesent GX1 is purpose-built.',
    products: ['gssi-utilityscan-gpr', 'emesent-gx1', 'leica-ts16', 'trimble-r12i', 'geoslam-zeb-horizon'],
    category: 'sensors',
    categoryLabel: 'Explore Sensors →',
  },
  'mobile-mapping-truck': {
    title: 'Mobile Mapping System',
    description:
      'Urban 3D or corridor mapping is most efficiently done from a vehicle. A mobile mapping system captures roads, infrastructure, and buildings at driving speed.',
    products: ['trimble-mx9', 'mosaic-51-camera-system', 'trimble-r12i', 'rugged-tablet-fc7'],
    category: 'trucks',
    categoryLabel: 'Explore Mobile Mapping →',
  },
  'rtk-drone-lidar': {
    title: 'RTK GNSS + Drone LiDAR',
    description:
      'A versatile professional kit: RTK rover for control and boundary work, drone LiDAR for area mapping. Covers a broad range of project types.',
    products: ['trimble-r12i', 'dji-matrice-350-rtk', 'dji-zenmuse-l2', 'trimble-r750-base', 'leica-ts16'],
    category: 'gnss-rtk',
    categoryLabel: 'Explore All Equipment →',
  },
  'indoor-mapping': {
    title: 'Indoor & Facility Reality Capture',
    description:
      'Indoor mapping, plants, and BIM workflows favor SLAM scanners, compact TLS, and wearable mappers — often combined with total station control at doorways.',
    products: ['navvis-vlx-3', 'geoslam-zeb-horizon', 'leica-blk360-g2', 'emesent-gx1', 'leica-ts16'],
    category: 'lidar',
    categoryLabel: 'Explore LiDAR & Scanning →',
  },
  'precision-hydro': {
    title: 'Hydrographic & Topo-Bathy Stack',
    description:
      'For water bodies and coastal corridors you combine echo sounders, multibeam where justified, topo-bathy LiDAR, and RTK GNSS for waterline elevation — often with a USV or small boat.',
    products: [
      'teledyne-multibeam-kit',
      'hydrolite-plus-echosounder',
      'riegl-vux-820g',
      'oceanscience-zboat-1800',
      'trimble-r12i',
    ],
    category: 'sensors',
    categoryLabel: 'Explore Sensors →',
  },
  'mining-production': {
    title: 'Mining & Production Survey',
    description:
      'Quarries and open pits use drone LiDAR or photogrammetry for volumes, machine control for earthmoving, and GNSS rovers for control and compliance.',
    products: [
      'yellowscan-mapper-plus',
      'dji-matrice-350-rtk',
      'dji-zenmuse-l2',
      'machine-control-base-rover-kit',
      'trimble-r12i',
    ],
    category: 'drones',
    categoryLabel: 'Explore Drone Systems →',
  },
};

function canopyBlocks(veg) {
  return veg === 'yes' || veg === 'sometimes';
}

function recommend(answers) {
  const { use, size, budget, veg } = answers;
  const vegKey = veg === 'na' ? 'no' : veg;

  if (use === 'underground') return 'gpr-total-station';
  if (use === 'indoor-facility') return 'indoor-mapping';
  if (use === 'coastal-hydro') return 'precision-hydro';
  if (use === 'mining') return 'mining-production';

  if (vegKey === 'yes' && budget === '200k+') return 'airborne-lidar';
  if (vegKey === 'yes' && (budget === '50k-200k' || budget === '10k-50k')) return 'drone-lidar';
  if (vegKey === 'yes' && budget === 'under-10k') return 'rtk-photogrammetry';
  if ((use === 'urban' || use === 'corridor') && (budget === '50k-200k' || budget === '200k+')) return 'mobile-mapping-truck';
  if ((size === 'lot' || size === 'under-10') && budget === 'under-10k') return 'rtk-photogrammetry';
  if ((size === '10-500' || size === 'under-10' || size === 'lot') && !canopyBlocks(vegKey)) return 'drone-photogrammetry';
  if ((size === '500-10mi' || size === '10mi+') && !canopyBlocks(vegKey)) return 'fixed-wing-photogrammetry';
  return 'rtk-drone-lidar';
}

/** Merge primary recommendation IDs with extra picks from deliverable / use. */
function mergeExtraProductIds(key, answers) {
  const { deliverable, use } = answers;
  const extras = [];

  if (deliverable === 'hydro') {
    extras.push('hydrolite-plus-echosounder', 'oceanscience-zboat-1800', 'teledyne-multibeam-kit');
  }
  if (deliverable === 'monitoring') {
    extras.push('leica-geomos-monitoring', 'trimble-4d-control-saas', 'ids-mymo', 'senceive-wireless-monitoring-network');
  }
  if (deliverable === 'spectral') {
    extras.push('micasense-altum-pt', 'micasense-rededge-p', 'headwall-nano-hp');
  }
  if (deliverable === 'indoor-slam') {
    extras.push('geoslam-zeb-horizon', 'leica-blk360-g2', 'navvis-vlx-3');
  }
  if (deliverable === 'geophysics') {
    extras.push('gssi-utilityscan-gpr', 'geometrics-magarrow-uav', 'bartington-gradiometer-system', 'scintrex-cg6-gravimeter');
  }
  if (deliverable === 'gnss-office') {
    extras.push('cors-network-subscription', 'hexagon-smartnet-annual', 'trimble-vrsnow-annual', 'trimble-business-center-annual', 'panasonic-toughbook-40');
  }

  if (use === 'coastal-hydro') {
    extras.push('seafloor-hydrus-auv', 'seafloor-trident-usv');
  }
  if (use === 'mining') {
    extras.push('machine-control-base-rover-kit', 'yellowscan-mapper-plus');
  }
  if (use === 'corridor' || use === 'urban') {
    extras.push('mosaic-51-camera-system');
  }

  const base = RECOMMENDATIONS[key].products;
  const seen = new Set();
  const out = [];
  [...base, ...extras].forEach((id) => {
    if (id && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  });
  return out;
}

// ── QUIZ RENDERER ──
class EquipmentQuiz {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.state = { step: 0, answers: {} };
    this.render();
  }

  render() {
    if (this.state.step >= QUIZ_STEPS.length) {
      this.renderResult();
      return;
    }
    const step = QUIZ_STEPS[this.state.step];
    const gridClass = step.options.length >= 6 ? ' quiz-options--grid' : '';
    this.container.innerHTML = `
      <div class="quiz-step">
        <div class="quiz-progress">
          <span class="kicker-mono">Step ${this.state.step + 1} of ${QUIZ_STEPS.length}</span>
          <div class="quiz-bar">
            <div class="quiz-bar-fill" style="width: ${((this.state.step) / QUIZ_STEPS.length) * 100}%"></div>
          </div>
        </div>
        <h3 class="quiz-question">${step.question}</h3>
        <div class="quiz-options${gridClass}">
          ${step.options
            .map(
              (opt) => `
            <button type="button" class="quiz-option" data-value="${opt.value}">${opt.label}</button>
          `
            )
            .join('')}
        </div>
      </div>
    `;
    this.container.querySelectorAll('.quiz-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.state.answers[step.id] = btn.dataset.value;
        this.state.step++;
        this.render();
      });
    });
  }

  renderResult() {
    const key = recommend(this.state.answers);
    const rec = RECOMMENDATIONS[key];
    if (!rec) {
      this.container.innerHTML =
        '<p class="quiz-result">No recommendation matched. <button type="button" class="btn btn-ghost" onclick="location.reload()">Start over</button></p>';
      return;
    }
    this.container.innerHTML = `
      <div class="quiz-result">
        <div class="kicker">Our Recommendation</div>
        <h2>Your Setup: <em>${rec.title}</em></h2>
        <p>${rec.description}</p>
        <p class="quiz-rec-note" style="margin-top: 12px; font-size: 0.9rem; color: var(--muted); max-width: 640px;">Below: a broader stack of picks (plus add-ons from your deliverable choice). Open the catalog for full specs.</p>
        <div class="quiz-result-products" id="quiz-products">
          <p style="color: var(--muted); font-size: 13px;">Loading recommended products...</p>
        </div>
        <details class="quiz-catalog-details">
          <summary>Browse full equipment catalog (approximate price ranges)</summary>
          <div id="quiz-catalog-full" class="quiz-catalog-full" aria-live="polite">
            <p class="quiz-catalog-loading">Loading catalog…</p>
          </div>
        </details>
        <div style="display: flex; gap: 20px; margin-top: 32px; flex-wrap: wrap;">
          <a href="${rec.category}.html" class="btn btn-primary">${rec.categoryLabel}</a>
          <button class="btn btn-ghost" onclick="location.reload()">← Start Over</button>
        </div>
      </div>
    `;
    this.loadResultContent();
  }

  async loadResultContent() {
    let all;
    try {
      const res = await fetch('../content/products.json');
      all = await res.json();
    } catch (e) {
      console.warn('Could not load products:', e);
      const el = document.getElementById('quiz-products');
      if (el) el.innerHTML = '<p style="color: var(--muted);">Could not load product data.</p>';
      const full = document.getElementById('quiz-catalog-full');
      if (full) full.innerHTML = '';
      return;
    }

    const key = recommend(this.state.answers);
    const mergedIds = mergeExtraProductIds(key, this.state.answers);
    this.renderRecommendedProducts(mergedIds, all);
    this.renderFullCatalog(all);
  }

  renderRecommendedProducts(ids, all) {
    const products = ids.map((id) => all.find((p) => p.id === id)).filter(Boolean);
    const el = document.getElementById('quiz-products');
    if (!el || !products.length) {
      if (el) el.innerHTML = '<p style="color: var(--muted);">No matching products in catalog.</p>';
      return;
    }
    const price = (p) => (typeof formatPriceRange === 'function' ? formatPriceRange(p) : 'See catalog');
    const cat = (p) => (typeof formatCategorySlug === 'function' ? formatCategorySlug(p.category) : p.category);
    const imgFor = (p) => {
      if (typeof productImageUrl !== 'function') {
        return '<div class="product-card-img product-card-img--empty" aria-hidden="true"></div>';
      }
      const src = productImageUrl(p);
      const fb =
        typeof productImageFallback === 'function' ? productImageFallback(p) : src;
      const alt = String(p.name).replace(/"/g, '&quot;') + ' — product';
      return `<div class="product-card-img">
              <img src="${src}" alt="${alt}" width="400" height="300" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${fb}'" />
              ${p.badge ? `<span class="panel-badge">${p.badge}</span>` : ''}
            </div>`;
    };
    el.innerHTML = `
      <div class="grid-3 quiz-rec-grid" style="margin-top: 24px;">
        ${products
          .map(
            (p) => `
          <a class="product-card product-card--link" href="product.html?id=${encodeURIComponent(p.id)}" aria-label="Full specifications: ${String(p.name).replace(/"/g, '&quot;')}">
            ${imgFor(p)}
            <div class="product-card-body">
              <div class="product-category">${cat(p)}</div>
              <div class="product-name">${p.name}</div>
              <div class="product-desc">${p.description.substring(0, 100)}...</div>
              <div class="product-footer">
                <div class="product-price">${price(p)}</div>
                <span class="add-to-quote">Full specs</span>
              </div>
            </div>
          </a>
        `
          )
          .join('')}
      </div>
    `;
  }

  renderFullCatalog(all) {
    const el = document.getElementById('quiz-catalog-full');
    if (!el) return;
    const price = (p) => (typeof formatPriceRange === 'function' ? formatPriceRange(p) : 'See catalog');
    const catLabel = (slug) => (typeof formatCategorySlug === 'function' ? formatCategorySlug(slug) : slug);
    const byCat = {};
    all.forEach((p) => {
      const c = p.category || 'other';
      if (!byCat[c]) byCat[c] = [];
      byCat[c].push(p);
    });
    Object.keys(byCat).forEach((c) => {
      byCat[c].sort((a, b) => a.name.localeCompare(b.name));
    });
    const order = ['drones', 'sensors', 'lidar', 'gnss-rtk', 'trucks', 'computers', 'total-stations', 'other'];
    const keys = [...new Set([...order, ...Object.keys(byCat)])].filter((k) => byCat[k]);

    el.innerHTML = keys
      .map(
        (cat) => `
      <section class="quiz-catalog-block">
        <h3 class="quiz-catalog-heading">${catLabel(cat)}</h3>
        <ul class="quiz-catalog-list">
          ${byCat[cat]
            .map(
              (p) => `
            <li class="quiz-catalog-item">
              <a class="quiz-catalog-name" href="product.html?id=${encodeURIComponent(p.id)}">${p.name}</a>
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
}

document.addEventListener('DOMContentLoaded', () => {
  new EquipmentQuiz('equipment-quiz');
});
