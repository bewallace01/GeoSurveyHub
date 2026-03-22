// ============================================================
// GeoSurveyHub — Live News Feed  (assets/js/news-feed.js)
// Three-layer news system: RSS feeds → NewsData.io → seed fallback
// ============================================================

const NEWS_CONFIG = {
  rss2jsonKey: 'YOUR_RSS2JSON_KEY',  // free at rss2json.com (30 sec signup)
  newsdataKey: '',                    // free at newsdata.io  (optional)
  articlesPerFeed: 5,
  maxArticles: 30,
  cacheTTL: 4 * 60 * 60 * 1000,     // 4 hours

  feeds: [
    { url: 'https://www.gim-international.com/rss.xml',              name: 'GIM International' },
    { url: 'https://lidarmag.com/feed/',                              name: 'LIDAR Magazine' },
    { url: 'https://www.geoweeknews.com/feed',                        name: 'Geo Week News' },
    { url: 'https://xyht.com/feed/',                                  name: 'xyHt' },
    { url: 'https://www.esri.com/arcgis-blog/feed/',                  name: 'Esri Blog' },
    { url: 'https://news.google.com/rss/search?q=LiDAR+drone+survey&hl=en-US&gl=US&ceid=US:en',              name: 'Google: LiDAR' },
    { url: 'https://news.google.com/rss/search?q=drone+photogrammetry+mapping&hl=en-US&gl=US&ceid=US:en',    name: 'Google: Photogrammetry' },
    { url: 'https://news.google.com/rss/search?q=geospatial+AI+GIS&hl=en-US&gl=US&ceid=US:en',              name: 'Google: GeoAI' },
    { url: 'https://news.google.com/rss/search?q=land+surveying+technology+2026&hl=en-US&gl=US&ceid=US:en', name: 'Google: Surveying' },
  ],

  relevantKeywords: [
    'lidar','photogrammetry','surveying','gnss','rtk','ppk','gis','geospatial',
    'drone mapping','point cloud','uav survey','land survey','laser scan',
    'total station','topographic','remote sensing','digital twin','reality capture',
    'gaussian splatting','riegl','trimble','leica','dji enterprise','velodyne',
    'pix4d','metashape','arcgis','mobile mapping','corridor mapping','bathymetric',
    'geomatics','geodetic','cadastral','slam lidar','geoai',
  ],
};

let _cache = null;
let _cacheTime = 0;

function detectCategory(text) {
  const t = (text || '').toLowerCase();
  if (/(lidar|laser scan|point cloud|terrestrial scan|riegl|faro focus)/.test(t))  return 'LiDAR';
  if (/(drone|uav|uas|matrice|zenmuse|yellowscan|dji enterprise)/.test(t))          return 'Drones';
  if (/(gnss|rtk|ppk|ntrip|gps rover|trimble r1|leica gs|septentrio|emlid)/.test(t)) return 'GNSS';
  if (/(photogrammetry|pix4d|metashape|realitycapture|structure from motion)/.test(t)) return 'Photogrammetry';
  if (/(gis|arcgis|qgis|esri|spatial data|geoparquet|stac copc)/.test(t))           return 'GIS';
  if (/(artificial intelligence|machine learning|deep learning|geoai|mach9|lp360 ai)/.test(t)) return 'AI & ML';
  if (/(mobile mapping|mapping truck|corridor map|road survey)/.test(t))             return 'Mobile Mapping';
  if (/(sensor|camera|payload|multispectral|thermal)/.test(t))                       return 'Sensors';
  if (/(geo week|intergeo|asprs|nsps|ncees|conference|expo)/.test(t))               return 'Events';
  if (/(software|platform|workflow|cloud processing|api)/.test(t))                   return 'Software';
  return 'Industry';
}

function isRelevant(item) {
  const text = ((item.title || '') + ' ' + (item.description || '')).toLowerCase();
  return NEWS_CONFIG.relevantKeywords.some(kw => text.includes(kw));
}

function cleanExcerpt(raw, maxLen = 165) {
  if (!raw) return '';
  const s = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return s.length > maxLen ? s.slice(0, maxLen).replace(/\s\S*$/, '') + '...' : s;
}

function formatDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return d; }
}

async function fetchOneFeed(feed) {
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&api_key=${NEWS_CONFIG.rss2jsonKey}&count=${NEWS_CONFIG.articlesPerFeed}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.status !== 'ok') throw new Error(data.message || 'Bad response');
  return (data.items || []).map(item => ({
    id:            item.guid || item.link,
    title:         item.title || '',
    description:   cleanExcerpt(item.description || item.content),
    link:          item.link || '#',
    pubDate:       item.pubDate,
    formattedDate: formatDate(item.pubDate),
    source:        feed.name,
    category:      detectCategory(item.title + ' ' + item.description),
    relevant:      isRelevant(item),
  }));
}

async function fetchNewsDataIO() {
  if (!NEWS_CONFIG.newsdataKey) return [];
  const queries = ['LiDAR surveying', 'drone photogrammetry', 'GNSS RTK survey', 'geospatial GIS AI'];
  const out = [];
  for (const q of queries) {
    try {
      const res = await fetch(`https://newsdata.io/api/1/news?apikey=${NEWS_CONFIG.newsdataKey}&q=${encodeURIComponent(q)}&language=en`);
      const data = await res.json();
      if (data.status === 'success') {
        (data.results || []).slice(0, 3).forEach(a => {
          out.push({
            id:            a.article_id || a.link,
            title:         a.title || '',
            description:   cleanExcerpt(a.description),
            link:          a.link || '#',
            pubDate:       a.pubDate,
            formattedDate: formatDate(a.pubDate),
            source:        a.source_id || 'NewsData',
            category:      detectCategory(a.title + ' ' + a.description),
            relevant:      true,
          });
        });
      }
    } catch { /* continue */ }
  }
  return out;
}

async function loadFallback() {
  for (const path of ['../content/news.json', './content/news.json', '/content/news.json']) {
    try {
      const res = await fetch(path);
      if (res.ok) {
        const data = await res.json();
        return data.map(a => ({
          id:            a.id,
          title:         a.title,
          description:   a.excerpt || '',
          link:          '#',
          pubDate:       a.date,
          formattedDate: formatDate(a.date),
          source:        a.source || 'GeoSurveyHub',
          category:      a.category || 'Industry',
          relevant:      true,
          isSeed:        true,
        }));
      }
    } catch { /* try next */ }
  }
  return [];
}

async function getLatestNews(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && _cache && now - _cacheTime < NEWS_CONFIG.cacheTTL) return _cache;

  const all = [];
  let liveOk = false;

  // RSS layer
  if (NEWS_CONFIG.rss2jsonKey !== 'YOUR_RSS2JSON_KEY') {
    const results = await Promise.all(
      NEWS_CONFIG.feeds.map(f => fetchOneFeed(f).catch(e => { console.warn(f.name, e.message); return []; }))
    );
    results.forEach(r => all.push(...r));
    if (all.length) liveOk = true;
  }

  // NewsData.io layer
  const ndItems = await fetchNewsDataIO();
  if (ndItems.length) { all.push(...ndItems); liveOk = true; }

  // Fallback layer
  if (!liveOk || !all.length) {
    const fallback = await loadFallback();
    _cache = fallback;
    _cacheTime = now;
    return fallback;
  }

  // Filter → deduplicate → sort
  const seen = new Set();
  const final = all
    .filter(a => a.relevant && a.title)
    .filter(a => {
      const key = a.title.toLowerCase().slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, NEWS_CONFIG.maxArticles);

  _cache = final;
  _cacheTime = now;
  return final;
}

// ── RENDER ────────────────────────────────────────────────────
function renderCard(article) {
  return `
    <article class="news-card reveal" role="article">
      <div class="news-meta">
        <span class="news-date">${article.formattedDate}</span>
        <span class="news-tag">${article.category}</span>
        ${!article.isSeed ? '<span style="font-family:var(--font-mono);font-size:9px;color:var(--accent);letter-spacing:1px;opacity:0.7">LIVE</span>' : ''}
      </div>
      <h3 class="news-title">
        <a href="${article.link}" target="_blank" rel="noopener noreferrer">${article.title}</a>
      </h3>
      <p class="news-excerpt">${article.description}</p>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;padding-top:14px;">
        <a class="read-more" href="${article.link}" target="_blank" rel="noopener noreferrer">Read More</a>
        <span style="font-family:var(--font-mono);font-size:9px;color:var(--muted);letter-spacing:1px;">${article.source}</span>
      </div>
    </article>
  `;
}

function buildFilterBar(articles, barId) {
  const bar = document.getElementById(barId);
  if (!bar) return;
  const cats = ['All', ...new Set(articles.map(a => a.category))].sort();
  bar.innerHTML = cats.map(c =>
    `<button class="filter-btn ${c === 'All' ? 'active' : ''}" data-cat="${c}">${c}</button>`
  ).join('');
  bar.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const chosen = btn.dataset.cat;
      document.querySelectorAll('#news-grid .news-card, #news-preview .news-card').forEach(card => {
        const cardCat = card.querySelector('.news-tag')?.textContent;
        card.style.display = (chosen === 'All' || cardCat === chosen) ? '' : 'none';
      });
    });
  });
}

async function initNewsFeed({ gridId = 'news-grid', filterBarId = 'news-filter', limit = null } = {}) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  grid.innerHTML = `<p style="color:var(--muted);font-family:var(--font-mono);font-size:11px;letter-spacing:2px;padding:20px 0;">FETCHING LIVE FEED...</p>`;

  try {
    let articles = await getLatestNews();
    if (limit) articles = articles.slice(0, limit);

    if (filterBarId && !limit) buildFilterBar(articles, filterBarId);

    grid.innerHTML = articles.length
      ? articles.map(renderCard).join('')
      : `<p style="color:var(--muted)">No articles found. Check back soon.</p>`;

    // Hook into scroll-reveal observer if available
    if (window.__gshRevealObserver) {
      grid.querySelectorAll('.reveal').forEach(el => window.__gshRevealObserver.observe(el));
    }

    // Update live count
    const badge = document.getElementById('news-live-count');
    if (badge) {
      const n = articles.filter(a => !a.isSeed).length;
      badge.textContent = n > 0 ? `${n} live` : 'Curated';
    }

  } catch (err) {
    console.error('News feed crashed:', err);
    const fb = await loadFallback();
    grid.innerHTML = fb.length
      ? fb.map(renderCard).join('')
      : `<p style="color:var(--muted)">News temporarily unavailable.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('news-grid'))    initNewsFeed({ gridId: 'news-grid', filterBarId: 'news-filter' });
  if (document.getElementById('news-preview')) initNewsFeed({ gridId: 'news-preview', limit: 3 });
});
