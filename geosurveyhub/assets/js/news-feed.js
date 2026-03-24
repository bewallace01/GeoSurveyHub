// ============================================================
// GeoSurveyHub — Live News Feed  (assets/js/news-feed.js)
// Production: same-origin /api/news/rss and /api/news/newsdata (Worker proxy; keys in env).
// Fallback: direct APIs if news-config.local.js has keys (local static preview without wrangler).
// Load news-config.js before this script (sets window.GSH_NEWS_KEYS).
// ============================================================

const NEWS_DEFAULTS = {
  rss2jsonKey: 'YOUR_RSS2JSON_KEY',
  newsdataKey: '',
  articlesPerFeed: 5,
  maxArticles: 30,
  cacheTTL: 4 * 60 * 60 * 1000,

  feeds: [
    { url: 'https://www.gim-international.com/rss.xml', name: 'GIM International' },
    { url: 'https://lidarmag.com/feed/', name: 'LIDAR Magazine' },
    { url: 'https://www.geoweeknews.com/feed', name: 'Geo Week News' },
    { url: 'https://xyht.com/feed/', name: 'xyHt' },
    { url: 'https://www.esri.com/arcgis-blog/feed/', name: 'Esri Blog' },
    { url: 'https://news.google.com/rss/search?q=LiDAR+drone+survey&hl=en-US&gl=US&ceid=US:en', name: 'Google: LiDAR' },
    { url: 'https://news.google.com/rss/search?q=drone+photogrammetry+mapping&hl=en-US&gl=US&ceid=US:en', name: 'Google: Photogrammetry' },
    { url: 'https://news.google.com/rss/search?q=geospatial+AI+GIS&hl=en-US&gl=US&ceid=US:en', name: 'Google: GeoAI' },
    { url: 'https://news.google.com/rss/search?q=land+surveying+technology&hl=en-US&gl=US&ceid=US:en', name: 'Google: Surveying' },
  ],

  relevantKeywords: [
    'lidar', 'photogrammetry', 'surveying', 'gnss', 'rtk', 'ppk', 'gis', 'geospatial',
    'drone mapping', 'point cloud', 'uav survey', 'land survey', 'laser scan',
    'total station', 'topographic', 'remote sensing', 'digital twin', 'reality capture',
    'gaussian splatting', 'riegl', 'trimble', 'leica', 'dji enterprise', 'velodyne',
    'pix4d', 'metashape', 'arcgis', 'mobile mapping', 'corridor mapping', 'bathymetric',
    'geomatics', 'geodetic', 'cadastral', 'slam lidar', 'geoai',
  ],
};

const NEWS_CONFIG = {
  ...NEWS_DEFAULTS,
  ...(typeof window !== 'undefined' && window.GSH_NEWS_KEYS
    ? {
        rss2jsonKey: window.GSH_NEWS_KEYS.rss2jsonKey ?? NEWS_DEFAULTS.rss2jsonKey,
        newsdataKey: window.GSH_NEWS_KEYS.newsdataKey ?? NEWS_DEFAULTS.newsdataKey,
      }
    : {}),
};

let _cache = null;
let _cacheTime = 0;

function detectCategory(text) {
  const t = (text || '').toLowerCase();
  if (/(lidar|laser scan|point cloud|terrestrial scan|riegl|faro focus)/.test(t)) return 'LiDAR';
  if (/(drone|uav|uas|matrice|zenmuse|yellowscan|dji enterprise)/.test(t)) return 'Drones';
  if (/(gnss|rtk|ppk|ntrip|gps rover|trimble r1|leica gs|septentrio|emlid)/.test(t)) return 'GNSS';
  if (/(photogrammetry|pix4d|metashape|realitycapture|structure from motion)/.test(t)) return 'Photogrammetry';
  if (/(gis|arcgis|qgis|esri|spatial data|geoparquet|stac copc)/.test(t)) return 'GIS';
  if (/(artificial intelligence|machine learning|deep learning|geoai|mach9|lp360 ai)/.test(t)) return 'AI & ML';
  if (/(mobile mapping|mapping truck|corridor map|road survey)/.test(t)) return 'Mobile Mapping';
  if (/(sensor|camera|payload|multispectral|thermal)/.test(t)) return 'Sensors';
  if (/(geo week|intergeo|asprs|nsps|ncees|conference|expo)/.test(t)) return 'Events';
  if (/(software|platform|workflow|cloud processing|api)/.test(t)) return 'Software';
  return 'Industry';
}

function isRelevant(item) {
  const text = ((item.title || '') + ' ' + (item.description || '')).toLowerCase();
  return (NEWS_CONFIG.relevantKeywords || NEWS_DEFAULTS.relevantKeywords).some(kw => text.includes(kw));
}

function cleanExcerpt(raw, maxLen = 220) {
  if (!raw) return '';
  const s = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return s.length > maxLen ? s.slice(0, maxLen).replace(/\s\S*$/, '') + '...' : s;
}

function formatDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return d;
  }
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeHtmlAttr(s) {
  return escapeHtml(s).replace(/'/g, '&#39;');
}

/**
 * RSS/XML often leaves numeric entities (e.g. &#038;) in link text. The # would
 * otherwise start a URL fragment in new URL() and break query strings.
 */
function decodeHtmlEntitiesInUrl(s) {
  let t = String(s);
  t = t.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
  t = t.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
  t = t.replace(/&amp;/gi, '&');
  return t;
}

/** Safe for href="..." — avoids mangling &#038;-style sequences before & becomes &amp;. */
function escapeHrefAttr(url) {
  if (url == null || url === '') return '';
  return String(url)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Accepts http(s) URLs, protocol-relative //..., and paths relative to feed origin. */
function normalizeExternalUrl(raw, baseFeedUrl) {
  if (raw == null || raw === '') return '';
  let s = String(raw).trim().replace(/<[^>]+>/g, '').trim();
  if (!s) return '';
  s = decodeHtmlEntitiesInUrl(s);
  if (s.startsWith('//')) s = 'https:' + s;
  try {
    const u = new URL(s);
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.href;
  } catch {
    if (baseFeedUrl) {
      try {
        const base = new URL(baseFeedUrl);
        const u = new URL(s, base.origin);
        if (u.protocol === 'http:' || u.protocol === 'https:') return u.href;
      } catch { /* ignore */ }
    }
  }
  return '';
}

function safeHttpUrl(raw) {
  const u = normalizeExternalUrl(raw, null);
  return u || null;
}

/** First http(s) href in HTML (description/content) when <link> is empty or bad. */
function extractHttpUrlFromHtml(html) {
  if (!html || typeof html !== 'string') return '';
  const m = html.match(/href\s*=\s*["'](https?:\/\/[^"'>\s]+)/i);
  if (!m) return '';
  return normalizeExternalUrl(m[1], null);
}

/** RSS feeds often put the article URL in link, guid, or enclosure when link is empty. */
function resolveRssItemLink(item, feedUrl) {
  const candidates = [];
  if (item.link) candidates.push(item.link);
  if (item.enclosure) {
    if (typeof item.enclosure === 'string') candidates.push(item.enclosure);
    else if (item.enclosure.link) candidates.push(item.enclosure.link);
  }
  if (item.guid) {
    const g = String(item.guid).replace(/<[^>]+>/g, '').trim();
    const looksLikeUrl =
      /^https?:\/\//i.test(g) || g.startsWith('//') || (g.startsWith('/') && g.length > 1);
    if (looksLikeUrl) candidates.push(g);
  }
  const htmlBlob = [item.description, item.content, item.contentSnippet].filter(Boolean).join('\n');
  if (htmlBlob) {
    const fromHtml = extractHttpUrlFromHtml(htmlBlob);
    if (fromHtml) candidates.push(fromHtml);
  }
  for (const raw of candidates) {
    const u = normalizeExternalUrl(raw, feedUrl);
    if (u) return u;
  }
  return '';
}

function resolveNewsDataLink(a) {
  const raw = a.link || a.url || a.source_url;
  return normalizeExternalUrl(raw, null);
}

function newsPageHref(anchorId) {
  const { protocol, hostname, pathname } = window.location;
  if (hostname && (protocol === 'http:' || protocol === 'https:')) {
    return `/pages/news.html#${anchorId}`;
  }
  const inPagesFolder = /\/pages\//.test(pathname);
  return `${inPagesFolder ? '' : 'pages/'}news.html#${anchorId}`;
}

function stableCardId(article) {
  const raw = String(article.link || article.id || article.title || 'x');
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = ((h << 5) - h) + raw.charCodeAt(i) | 0;
  return 'live-' + Math.abs(h).toString(36);
}

/** Fetch RSS via Worker proxy; optional direct rss2json if proxy missing (e.g. python -m http.server). */
async function fetchRssJson(rssUrl, count) {
  const proxyUrl = `/api/news/rss?rss_url=${encodeURIComponent(rssUrl)}&count=${count}`;
  let res = await fetch(proxyUrl);
  let data = await res.json().catch(() => ({}));
  if (res.ok && data.status === 'ok') return data;

  if (NEWS_CONFIG.rss2jsonKey && NEWS_CONFIG.rss2jsonKey !== 'YOUR_RSS2JSON_KEY') {
    const direct = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&api_key=${NEWS_CONFIG.rss2jsonKey}&count=${count}`;
    res = await fetch(direct);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
    if (data.status !== 'ok') throw new Error(data.message || 'Bad response');
    return data;
  }
  throw new Error(data.message || `RSS unavailable (${res.status})`);
}

async function fetchOneFeed(feed) {
  const data = await fetchRssJson(feed.url, NEWS_CONFIG.articlesPerFeed);
  return (data.items || []).map(item => ({
    id: item.guid || item.link || item.title,
    title: item.title || '',
    description: cleanExcerpt(item.description || item.content),
    link: resolveRssItemLink(item, feed.url),
    pubDate: item.pubDate,
    formattedDate: formatDate(item.pubDate),
    source: feed.name,
    category: detectCategory(item.title + ' ' + item.description),
    relevant: isRelevant(item),
  }));
}

async function fetchNewsDataSingle(query) {
  const proxyUrl = `/api/news/newsdata?q=${encodeURIComponent(query)}&language=en`;
  let res = await fetch(proxyUrl);
  let data = await res.json().catch(() => ({}));
  if (res.ok && data.status === 'success') return data.results || [];

  if (NEWS_CONFIG.newsdataKey) {
    res = await fetch(
      `https://newsdata.io/api/1/news?apikey=${NEWS_CONFIG.newsdataKey}&q=${encodeURIComponent(query)}&language=en`
    );
    if (!res.ok) return [];
    data = await res.json();
    if (data.status === 'success') return data.results || [];
  }
  return [];
}

async function fetchNewsDataIO() {
  const queries = ['LiDAR surveying', 'drone photogrammetry', 'GNSS RTK survey', 'geospatial GIS AI'];
  const out = [];
  for (const q of queries) {
    try {
      const results = await fetchNewsDataSingle(q);
      results.slice(0, 3).forEach(a => {
        out.push({
          id: a.article_id || a.link,
          title: a.title || '',
          description: cleanExcerpt(a.description),
          link: resolveNewsDataLink(a) || '',
          pubDate: a.pubDate,
          formattedDate: formatDate(a.pubDate),
          source: a.source_id || 'NewsData',
          category: detectCategory(a.title + ' ' + a.description),
          relevant: true,
        });
      });
    } catch {
      /* continue */
    }
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
          id: a.id,
          title: a.title,
          description: a.excerpt || '',
          link: normalizeExternalUrl(a.sourceUrl || a.url || a.link, null) || '',
          pubDate: a.date,
          formattedDate: formatDate(a.date),
          source: a.source || 'GeoSurveyHub',
          category: a.category || 'Industry',
          relevant: true,
          isSeed: true,
        }));
      }
    } catch {
      /* try next */
    }
  }
  return [];
}

async function getLatestNews(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && _cache && now - _cacheTime < NEWS_CONFIG.cacheTTL) return _cache;

  const all = [];
  let liveOk = false;

  const rssResults = await Promise.all(
    NEWS_CONFIG.feeds.map(f => fetchOneFeed(f).catch(e => { console.warn('[news]', f.name, e.message); return []; }))
  );
  rssResults.forEach(r => all.push(...r));
  if (rssResults.some(r => r.length > 0)) liveOk = true;

  const ndItems = await fetchNewsDataIO();
  if (ndItems.length) {
    all.push(...ndItems);
    liveOk = true;
  }

  if (!liveOk || !all.length) {
    const fallback = await loadFallback();
    _cache = fallback;
    _cacheTime = now;
    return fallback;
  }

  const seen = new Set();

  function dedupeSort(list) {
    const s = new Set();
    return list
      .filter(a => a.title)
      .filter(a => {
        const key = a.title.toLowerCase().slice(0, 60);
        if (s.has(key)) return false;
        s.add(key);
        return true;
      })
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, NEWS_CONFIG.maxArticles);
  }

  let final = dedupeSort(all.filter(a => a.relevant && a.title));
  /* Keyword filter can drop everything; still show recent items from the feeds */
  if (!final.length) {
    final = dedupeSort(all);
  }

  _cache = final;
  _cacheTime = now;
  return final;
}

function ensureSummary(article) {
  let s = (article.description || '').trim();
  if (!s) {
    s = 'Summary not included in the feed — use the link below to read the full piece at the source.';
  }
  return s;
}

function linkHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function renderCard(article) {
  const href = normalizeExternalUrl(article.link, null) || '#';
  const external = href !== '#';
  const cardId = stableCardId(article);
  const title = escapeHtml(article.title);
  const excerpt = escapeHtml(ensureSummary(article));
  const source = escapeHtml(article.source);
  const date = escapeHtml(article.formattedDate);
  const cat = escapeHtml(article.category);
  const liveBadge = !article.isSeed
    ? '<span class="news-live-pill">Live</span>'
    : '';

  const host = external ? escapeHtml(linkHost(href)) : '';

  const footer = external
    ? `<footer class="news-card-footer">
        <a class="news-read-full" href="${escapeHrefAttr(href)}" target="_blank" rel="noopener noreferrer"
           aria-label="${escapeHtmlAttr(`Read full article — ${article.title}`)}">Read full article</a>
        ${host ? `<span class="news-link-host" title="Opens in a new tab">${host}</span>` : ''}
      </footer>`
    : `<footer class="news-card-footer">
        <a class="news-read-full news-read-full--internal" href="${escapeHrefAttr(newsPageHref(cardId))}">View on this page</a>
      </footer>`;

  return `
    <article class="news-card" id="${cardId}" role="article" data-category="${cat}">
      <div class="news-meta">
        <span class="news-date">${date}</span>
        <span class="news-tag">${cat}</span>
        ${liveBadge}
      </div>
      <span class="news-source">${source}</span>
      <h3 class="news-title">${title}</h3>
      <p class="news-summary">${excerpt}</p>
      ${footer}
    </article>
  `;
}

function buildFilterBar(articles, barId) {
  const bar = document.getElementById(barId);
  if (!bar) return;
  const cats = ['All', ...new Set(articles.map(a => a.category))].sort();
  bar.innerHTML = cats.map(c =>
    `<button type="button" class="filter-btn ${c === 'All' ? 'active' : ''}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`
  ).join('');
  bar.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const chosen = btn.dataset.cat;
      document.querySelectorAll('#news-grid .news-card, #news-preview .news-card').forEach(card => {
        const cardCat = card.getAttribute('data-category');
        card.style.display = (chosen === 'All' || cardCat === chosen) ? '' : 'none';
      });
    });
  });
}

async function initNewsFeed({ gridId = 'news-grid', filterBarId = 'news-filter', limit = null } = {}) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  grid.innerHTML = '<p style="color:var(--muted);font-family:var(--font-mono);font-size:11px;letter-spacing:2px;padding:20px 0;">FETCHING LIVE FEED…</p>';

  try {
    let articles = await getLatestNews();
    if (limit) articles = articles.slice(0, limit);

    if (filterBarId && !limit) buildFilterBar(articles, filterBarId);

    grid.innerHTML = articles.length
      ? articles.map(renderCard).join('')
      : '<p style="color:var(--muted)">No articles matched the filter. Try again later.</p>';

    const badge = document.getElementById('news-live-count');
    if (badge) {
      const n = articles.filter(a => !a.isSeed).length;
      badge.textContent = n > 0 ? `${n} live` : 'Curated';
    }
  } catch (err) {
    console.error('News feed:', err);
    const fb = await loadFallback();
    grid.innerHTML = fb.length
      ? fb.map(renderCard).join('')
      : '<p style="color:var(--muted)">News temporarily unavailable.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('news-grid')) initNewsFeed({ gridId: 'news-grid', filterBarId: 'news-filter' });
  if (document.getElementById('news-preview')) initNewsFeed({ gridId: 'news-preview', limit: 3 });
});
