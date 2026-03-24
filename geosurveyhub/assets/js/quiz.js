// quiz.js — Equipment Recommender Quiz
// Multi-step quiz that recommends a tech stack based on 4 answers.
// No page reload. State is a plain JS object.

const QUIZ_STEPS = [
  {
    id: 'use',
    question: 'What are you mapping?',
    options: [
      { value: 'land', label: 'Land / Property' },
      { value: 'construction', label: 'Construction Site' },
      { value: 'forest', label: 'Forest / Vegetation' },
      { value: 'corridor', label: 'Corridor (Road / Rail / Pipeline)' },
      { value: 'urban', label: 'Urban / City' },
      { value: 'underground', label: 'Underground / Utility' },
    ]
  },
  {
    id: 'size',
    question: 'How large is your typical project area?',
    options: [
      { value: 'under-10', label: 'Under 10 acres' },
      { value: '10-500', label: '10 – 500 acres' },
      { value: '500-10mi', label: '500 acres – 10 sq mi' },
      { value: '10mi+', label: '10+ sq mi' },
    ]
  },
  {
    id: 'budget',
    question: 'What is your equipment budget?',
    options: [
      { value: 'under-10k', label: 'Under $10,000' },
      { value: '10k-50k', label: '$10,000 – $50,000' },
      { value: '50k-200k', label: '$50,000 – $200,000' },
      { value: '200k+', label: '$200,000+' },
    ]
  },
  {
    id: 'veg',
    question: 'Do you need to see through tree canopy to the ground?',
    options: [
      { value: 'yes', label: 'Yes, always (dense forest or canopy)' },
      { value: 'sometimes', label: 'Sometimes (mixed terrain)' },
      { value: 'no', label: 'No — open or cleared terrain' },
    ]
  }
];

const RECOMMENDATIONS = {
  'airborne-lidar': {
    title: 'Airborne LiDAR System',
    description: 'For large forested areas or regional mapping, an airborne LiDAR system — either helicopter or fixed-wing — gives you the coverage rate and canopy penetration you need.',
    products: ['riegl-vux-10025', 'leica-multimapper'],
    category: 'lidar',
    categoryLabel: 'Explore LiDAR Systems →'
  },
  'drone-lidar': {
    title: 'Drone LiDAR Kit',
    description: 'A drone LiDAR setup maps forested terrain at centimeter accuracy. The DJI Matrice 350 RTK paired with a Zenmuse L2 is the most accessible professional system available.',
    products: ['dji-matrice-350-rtk', 'dji-zenmuse-l2'],
    category: 'drones',
    categoryLabel: 'Explore Drone Systems →'
  },
  'drone-photogrammetry': {
    title: 'Drone Photogrammetry Kit',
    description: 'For open terrain mapping, drone photogrammetry delivers excellent results at a fraction of LiDAR cost. The Matrice 350 RTK + Zenmuse P1 is the benchmark system.',
    products: ['dji-matrice-350-rtk', 'dji-zenmuse-p1'],
    category: 'drones',
    categoryLabel: 'Explore Drones →'
  },
  'fixed-wing-photogrammetry': {
    title: 'Fixed-Wing Drone + Photogrammetry',
    description: 'For very large open areas, a fixed-wing drone dramatically increases coverage per flight. Pair with a high-res camera and Pix4D or RealityCapture for efficient large-area mapping.',
    products: ['sensefly-ebee-x', 'dji-zenmuse-p1'],
    category: 'drones',
    categoryLabel: 'Explore Sensors →'
  },
  'rtk-photogrammetry': {
    title: 'RTK GNSS Rover + Entry Drone',
    description: 'For budget-conscious operations on open terrain, a quality RTK rover for ground control points combined with a drone and photogrammetry software delivers survey-grade results.',
    products: ['emlid-reach-rs3', 'dji-zenmuse-p1'],
    category: 'gnss-rtk',
    categoryLabel: 'Explore GNSS/RTK →'
  },
  'gpr-total-station': {
    title: 'GPR + Total Station + SLAM Scanner',
    description: 'Underground utility mapping uses Ground Penetrating Radar with precise surface control from a total station or GNSS. For GPS-denied interior spaces, a SLAM scanner like the Emesent GX1 is purpose-built.',
    products: ['gssi-utilityscan-gpr', 'emesent-gx1', 'leica-ts16'],
    category: 'sensors',
    categoryLabel: 'Explore Sensors →'
  },
  'mobile-mapping-truck': {
    title: 'Mobile Mapping System',
    description: 'Urban 3D or corridor mapping is most efficiently done from a vehicle. A mobile mapping system captures roads, infrastructure, and buildings at driving speed.',
    products: ['trimble-mx9', 'mosaic-51-camera-system'],
    category: 'trucks',
    categoryLabel: 'Explore Mobile Mapping →'
  },
  'rtk-drone-lidar': {
    title: 'RTK GNSS + Drone LiDAR',
    description: 'A versatile professional kit: RTK rover for control and boundary work, drone LiDAR for area mapping. Covers the broadest range of project types.',
    products: ['trimble-r12i', 'dji-matrice-350-rtk', 'dji-zenmuse-l2'],
    category: 'gnss-rtk',
    categoryLabel: 'Explore All Equipment →'
  }
};

function recommend(answers) {
  const { use, size, budget, veg } = answers;

  if (use === 'underground') return 'gpr-total-station';
  if (veg === 'yes' && budget === '200k+') return 'airborne-lidar';
  if (veg === 'yes' && (budget === '50k-200k' || budget === '10k-50k')) return 'drone-lidar';
  if (veg === 'yes' && budget === 'under-10k') return 'rtk-photogrammetry';
  if ((use === 'urban' || use === 'corridor') && (budget === '50k-200k' || budget === '200k+')) return 'mobile-mapping-truck';
  if (size === 'under-10' && budget === 'under-10k') return 'rtk-photogrammetry';
  if ((size === '10-500' || size === 'under-10') && veg !== 'yes') return 'drone-photogrammetry';
  if ((size === '500-10mi' || size === '10mi+') && veg !== 'yes') return 'fixed-wing-photogrammetry';
  return 'rtk-drone-lidar';
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
    this.container.innerHTML = `
      <div class="quiz-step">
        <div class="quiz-progress">
          <span class="kicker-mono">Step ${this.state.step + 1} of ${QUIZ_STEPS.length}</span>
          <div class="quiz-bar">
            <div class="quiz-bar-fill" style="width: ${((this.state.step) / QUIZ_STEPS.length) * 100}%"></div>
          </div>
        </div>
        <h3 class="quiz-question">${step.question}</h3>
        <div class="quiz-options">
          ${step.options.map(opt => `
            <button class="quiz-option" data-value="${opt.value}">${opt.label}</button>
          `).join('')}
        </div>
      </div>
    `;
    this.container.querySelectorAll('.quiz-option').forEach(btn => {
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
      this.container.innerHTML = '<p class="quiz-result">No recommendation matched. <button type="button" class="btn btn-ghost" onclick="location.reload()">Start over</button></p>';
      return;
    }
    this.container.innerHTML = `
      <div class="quiz-result">
        <div class="kicker">Our Recommendation</div>
        <h2>Your Setup: <em>${rec.title}</em></h2>
        <p>${rec.description}</p>
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
    this.loadResultContent(rec);
  }

  async loadResultContent(rec) {
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

    this.renderRecommendedProducts(rec.products, all);
    this.renderFullCatalog(all);
  }

  renderRecommendedProducts(ids, all) {
    const products = all.filter(p => ids.includes(p.id));
    const el = document.getElementById('quiz-products');
    if (!el || !products.length) {
      if (el) el.innerHTML = '<p style="color: var(--muted);">No matching products in catalog.</p>';
      return;
    }
    const price = (p) => (typeof formatPriceRange === 'function' ? formatPriceRange(p) : 'See catalog');
    const cat = (p) => (typeof formatCategorySlug === 'function' ? formatCategorySlug(p.category) : p.category);
    el.innerHTML = `
      <div class="grid-3 quiz-rec-grid" style="margin-top: 24px;">
        ${products.map(p => `
          <div class="product-card">
            <div class="product-card-img">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#FBD784" stroke-width="1" opacity="0.5">
                <circle cx="32" cy="32" r="20"/><circle cx="32" cy="32" r="8"/>
                <line x1="12" y1="32" x2="4" y2="32"/><line x1="52" y1="32" x2="60" y2="32"/>
                <line x1="32" y1="12" x2="32" y2="4"/><line x1="32" y1="52" x2="32" y2="60"/>
              </svg>
              ${p.badge ? `<span class="panel-badge">${p.badge}</span>` : ''}
            </div>
            <div class="product-card-body">
              <div class="product-category">${cat(p)}</div>
              <div class="product-name">${p.name}</div>
              <div class="product-desc">${p.description.substring(0, 100)}...</div>
              <div class="product-footer">
                <div class="product-price">${price(p)}</div>
                <button class="add-to-quote">Add to Quote</button>
              </div>
            </div>
          </div>
        `).join('')}
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

    el.innerHTML = keys.map((cat) => `
      <section class="quiz-catalog-block">
        <h3 class="quiz-catalog-heading">${catLabel(cat)}</h3>
        <ul class="quiz-catalog-list">
          ${byCat[cat].map((p) => `
            <li class="quiz-catalog-item">
              <span class="quiz-catalog-name">${p.name}</span>
              <span class="quiz-catalog-price">${price(p)}</span>
            </li>
          `).join('')}
        </ul>
      </section>
    `).join('');
  }
}

// Init on page load
document.addEventListener('DOMContentLoaded', () => {
  new EquipmentQuiz('equipment-quiz');
});
