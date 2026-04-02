/**
 * One-off: replace primary <nav> in index + all pages/*.html
 * Run: node scripts/inject-nav.cjs
 */
const fs = require('fs');
const path = require('path');

const NAV_ROOT = `    <nav class="nav" aria-label="Primary">
      <a href="/" class="nav-logo">Geo<span>Survey</span>Hub</a>
      <div class="nav-links" id="primary-nav">
        <a href="/">Home</a>
        <div class="nav-dropdown" data-nav-dropdown>
          <button type="button" class="nav-dropdown-btn" aria-expanded="false" aria-controls="nav-panel-learn" id="nav-btn-learn">Learn</button>
          <div class="nav-dropdown-panel" id="nav-panel-learn" role="group" aria-label="Learn">
            <a href="pages/learn.html" class="nav-dd-overview">Overview</a>
            <a href="pages/guide.html">Buyer's guide</a>
            <a href="pages/glossary.html">Topics &amp; glossary</a>
            <a href="pages/news.html">News</a>
            <a href="pages/about.html">About</a>
            <a href="pages/ai-ml.html">AI &amp; machine learning</a>
          </div>
        </div>
        <div class="nav-dropdown" data-nav-dropdown>
          <button type="button" class="nav-dropdown-btn" aria-expanded="false" aria-controls="nav-panel-equipment" id="nav-btn-equipment">Equipment</button>
          <div class="nav-dropdown-panel" id="nav-panel-equipment" role="group" aria-label="Equipment">
            <a href="pages/equipment.html" class="nav-dd-overview">Overview</a>
            <a href="pages/catalog.html">Product catalog</a>
            <a href="pages/lidar.html">LiDAR</a>
            <a href="pages/drones.html">Drones</a>
            <a href="pages/gnss-rtk.html">GNSS / RTK</a>
            <a href="pages/photogrammetry.html">Photogrammetry</a>
            <a href="pages/total-stations.html">Total stations</a>
            <a href="pages/mobile-mapping-slam.html">Mobile mapping &amp; SLAM</a>
            <a href="pages/point-cloud-processing.html">Point cloud processing</a>
            <a href="pages/sensors.html">Sensors</a>
            <a href="pages/computers.html">Field computers</a>
            <a href="pages/trucks.html">Survey trucks</a>
          </div>
        </div>
        <div class="nav-dropdown" data-nav-dropdown>
          <button type="button" class="nav-dropdown-btn" aria-expanded="false" aria-controls="nav-panel-practice" id="nav-btn-practice">Practice</button>
          <div class="nav-dropdown-panel" id="nav-panel-practice" role="group" aria-label="Practice and standards">
            <a href="pages/practice.html" class="nav-dd-overview">Overview</a>
            <a href="pages/ppk-rtk-network.html">PPK vs RTK &amp; networks</a>
            <a href="pages/surveying-accuracy.html">Surveying accuracy</a>
            <a href="pages/surveying-license-us.html">U.S. surveying license</a>
          </div>
        </div>
        <div class="nav-dropdown" data-nav-dropdown>
          <button type="button" class="nav-dropdown-btn" aria-expanded="false" aria-controls="nav-panel-business" id="nav-btn-business">Business</button>
          <div class="nav-dropdown-panel" id="nav-panel-business" role="group" aria-label="Business">
            <a href="pages/business.html" class="nav-dd-overview">Overview</a>
            <a href="pages/financing.html">Equipment financing</a>
            <a href="pages/start-a-surveying-company.html">Start a surveying company</a>
          </div>
        </div>
        <a href="pages/wallace-web-workers.html" class="nav-standalone">Studio</a>
      </div>
      <div class="nav-actions">
        <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="primary-nav" aria-label="Open menu">
          <svg class="nav-toggle-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </nav>`;

const NAV_PAGES = `    <nav class="nav" aria-label="Primary">
      <a href="/" class="nav-logo">Geo<span>Survey</span>Hub</a>
      <div class="nav-links" id="primary-nav">
        <a href="/">Home</a>
        <div class="nav-dropdown" data-nav-dropdown>
          <button type="button" class="nav-dropdown-btn" aria-expanded="false" aria-controls="nav-panel-learn" id="nav-btn-learn">Learn</button>
          <div class="nav-dropdown-panel" id="nav-panel-learn" role="group" aria-label="Learn">
            <a href="learn.html" class="nav-dd-overview">Overview</a>
            <a href="guide.html">Buyer's guide</a>
            <a href="glossary.html">Topics &amp; glossary</a>
            <a href="news.html">News</a>
            <a href="about.html">About</a>
            <a href="ai-ml.html">AI &amp; machine learning</a>
          </div>
        </div>
        <div class="nav-dropdown" data-nav-dropdown>
          <button type="button" class="nav-dropdown-btn" aria-expanded="false" aria-controls="nav-panel-equipment" id="nav-btn-equipment">Equipment</button>
          <div class="nav-dropdown-panel" id="nav-panel-equipment" role="group" aria-label="Equipment">
            <a href="equipment.html" class="nav-dd-overview">Overview</a>
            <a href="catalog.html">Product catalog</a>
            <a href="lidar.html">LiDAR</a>
            <a href="drones.html">Drones</a>
            <a href="gnss-rtk.html">GNSS / RTK</a>
            <a href="photogrammetry.html">Photogrammetry</a>
            <a href="total-stations.html">Total stations</a>
            <a href="mobile-mapping-slam.html">Mobile mapping &amp; SLAM</a>
            <a href="point-cloud-processing.html">Point cloud processing</a>
            <a href="sensors.html">Sensors</a>
            <a href="computers.html">Field computers</a>
            <a href="trucks.html">Survey trucks</a>
          </div>
        </div>
        <div class="nav-dropdown" data-nav-dropdown>
          <button type="button" class="nav-dropdown-btn" aria-expanded="false" aria-controls="nav-panel-practice" id="nav-btn-practice">Practice</button>
          <div class="nav-dropdown-panel" id="nav-panel-practice" role="group" aria-label="Practice and standards">
            <a href="practice.html" class="nav-dd-overview">Overview</a>
            <a href="ppk-rtk-network.html">PPK vs RTK &amp; networks</a>
            <a href="surveying-accuracy.html">Surveying accuracy</a>
            <a href="surveying-license-us.html">U.S. surveying license</a>
          </div>
        </div>
        <div class="nav-dropdown" data-nav-dropdown>
          <button type="button" class="nav-dropdown-btn" aria-expanded="false" aria-controls="nav-panel-business" id="nav-btn-business">Business</button>
          <div class="nav-dropdown-panel" id="nav-panel-business" role="group" aria-label="Business">
            <a href="business.html" class="nav-dd-overview">Overview</a>
            <a href="financing.html">Equipment financing</a>
            <a href="start-a-surveying-company.html">Start a surveying company</a>
          </div>
        </div>
        <a href="wallace-web-workers.html" class="nav-standalone">Studio</a>
      </div>
      <div class="nav-actions">
        <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="primary-nav" aria-label="Open menu">
          <svg class="nav-toggle-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </nav>`;

const root = path.join(__dirname, '..');
const navRe = /<nav class="nav"[^>]*>[\s\S]*?<\/nav>/;

function patchIndex() {
  const p = path.join(root, 'index.html');
  let s = fs.readFileSync(p, 'utf8');
  if (!navRe.test(s)) throw new Error('index.html: nav not found');
  s = s.replace(navRe, NAV_ROOT);
  fs.writeFileSync(p, s);
  console.log('patched index.html');
}

function patchPages() {
  const dir = path.join(root, 'pages');
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.html')) continue;
    const p = path.join(dir, f);
    let s = fs.readFileSync(p, 'utf8');
    if (!navRe.test(s)) {
      console.warn('skip (no nav):', f);
      continue;
    }
    s = s.replace(navRe, NAV_PAGES);
    fs.writeFileSync(p, s);
    console.log('patched pages/' + f);
  }
}

patchIndex();
patchPages();
