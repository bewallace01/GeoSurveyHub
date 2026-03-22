# GeoSurveyHub — News Automation Guide
# How to pull in fresh geospatial news automatically every day
# Three approaches: RSS (free), News API (free tier), AI-powered (best)

---

## THE THREE OPTIONS

### Option A — RSS Feeds (Free, No API Key, Works Today)
Pull directly from industry RSS feeds using a free proxy or Netlify function.
No cost. No signup. Works on any static host.
Freshness: Updates whenever the source publishes (typically same day).
Limitation: You get what the RSS feed gives you — title, date, excerpt, link.

### Option B — NewsData.io API (Free Tier: 200 credits/day)
A news aggregator API that lets you search by keyword ("LiDAR", "surveying", "GIS").
200 free API calls/day is plenty for a static site that fetches once on page load.
Freshness: Real-time — articles appear within hours of publication.
Limitation: General news sources, not just geospatial specialists.
Sign up: https://newsdata.io (free tier, no credit card required)

### Option C — AI-Powered Claude API Curation (Best Quality, ~$2–5/month)
Use the Anthropic API to fetch RSS feeds AND intelligently filter, summarize,
and categorize articles. Claude reads each article, decides if it's relevant
to geospatial/surveying professionals, and writes a clean 2-sentence summary.
Freshness: Run on a daily schedule (GitHub Actions, cron, or Netlify scheduled function).
Cost: ~$0.05–0.15 per daily run at current Claude pricing = ~$2–5/month.
This is the recommended approach for GeoSurveyHub.

---

## PRIORITY RSS FEED SOURCES

These are the highest-quality, most reliable geospatial industry RSS feeds.
All are free and publicly accessible.

### Tier 1 — Must Have (highest quality, most relevant)
```
GIM International (news):
  https://www.gim-international.com/rss.xml

GeoConnexion (news):
  https://www.geoconnexion.com/news/feed.rss

Geo Week News:
  https://www.geoweeknews.com/feed

LIDAR Magazine:
  https://lidarmag.com/feed/

xyHt Magazine (surveying & geospatial):
  https://xyht.com/feed/
```

### Tier 2 — Strong Supporting Sources
```
Esri ArcGIS Blog:
  https://www.esri.com/arcgis-blog/feed/

ROCK Robotic (drone LiDAR blog):
  https://rockrobotic.com/blog-feed.xml

The American Surveyor:
  https://www.amerisurv.com/feed/

Spatial Source (AU):
  https://spatialsource.com.au/feed/

My Coordinates (GIS/GNSS):
  https://mycoordinates.org/category/news/feed/
```

### Tier 3 — Supplementary
```
Canadian GIS & Geomatics:
  https://canadiangis.com/feed/

GEO Business (events):
  https://www.geobusiness.org/feed/

Directions Magazine:
  https://www.directionsmag.com/rss.xml
```

### Keyword Search Feeds (Google News RSS — free, no API key)
These search Google News for specific terms and return RSS:
```
LiDAR surveying:
  https://news.google.com/rss/search?q=LiDAR+surveying&hl=en-US&gl=US&ceid=US:en

Drone photogrammetry:
  https://news.google.com/rss/search?q=drone+photogrammetry&hl=en-US&gl=US&ceid=US:en

GNSS RTK survey:
  https://news.google.com/rss/search?q=GNSS+RTK+survey&hl=en-US&gl=US&ceid=US:en

Geospatial AI:
  https://news.google.com/rss/search?q=geospatial+AI&hl=en-US&gl=US&ceid=US:en

Land surveying equipment:
  https://news.google.com/rss/search?q=land+surveying+equipment&hl=en-US&gl=US&ceid=US:en
```

---

## OPTION A — RSS FEED IMPLEMENTATION (No API Key)

### The CORS Problem
RSS feeds can't be fetched directly from a browser due to CORS restrictions.
Two solutions:
  1. Use a free RSS-to-JSON proxy (rss2json.com, rssTojson.com)
  2. Use a Netlify/Vercel serverless function as a proxy (recommended)

### Implementation: RSS2JSON Proxy (simplest)
Add to `assets/js/news-feed.js`:

```javascript
// RSS2JSON — free tier: 1 request/sec, 1000 requests/day
// Get your free API key at: https://rss2json.com
const RSS2JSON_KEY = 'YOUR_KEY_HERE'; // free at rss2json.com

const RSS_FEEDS = [
  'https://www.gim-international.com/rss.xml',
  'https://www.geoconnexion.com/news/feed.rss',
  'https://www.geoweeknews.com/feed',
  'https://lidarmag.com/feed/',
  'https://news.google.com/rss/search?q=LiDAR+drone+surveying&hl=en-US&gl=US&ceid=US:en',
];

async function fetchRSSFeed(feedUrl) {
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&api_key=${RSS2JSON_KEY}&count=5`;
  const res = await fetch(apiUrl);
  const data = await res.json();
  return data.items || [];
}

async function loadAllFeeds() {
  const allItems = [];
  for (const feed of RSS_FEEDS) {
    try {
      const items = await fetchRSSFeed(feed);
      allItems.push(...items);
    } catch (e) {
      console.warn(`Feed failed: ${feed}`, e);
    }
  }
  // Sort by pubDate, newest first
  allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  // Deduplicate by title
  const seen = new Set();
  return allItems.filter(item => {
    if (seen.has(item.title)) return false;
    seen.add(item.title);
    return true;
  });
}
```

---

## OPTION B — NEWSDATA.IO API IMPLEMENTATION

Sign up free at https://newsdata.io — 200 credits/day, no credit card.
Search by keyword: "LiDAR", "surveying", "geospatial", "drone mapping", "GIS".

```javascript
// assets/js/news-api.js
const NEWSDATA_KEY = 'YOUR_NEWSDATA_KEY'; // free at newsdata.io

const SEARCH_QUERIES = [
  'LiDAR surveying',
  'drone photogrammetry',
  'GNSS RTK',
  'geospatial GIS',
  'drone mapping',
];

async function fetchNewsDataIO(query) {
  const url = `https://newsdata.io/api/1/news?apikey=${NEWSDATA_KEY}&q=${encodeURIComponent(query)}&language=en&category=technology,science`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.results || []).map(article => ({
    title: article.title,
    description: article.description,
    link: article.link,
    pubDate: article.pubDate,
    source: article.source_id,
    category: detectCategory(article.title + ' ' + article.description),
  }));
}
```

---

## OPTION C — AI-POWERED CURATION (RECOMMENDED)

This is the most powerful approach. A daily automated script:
1. Fetches RSS feeds from all Tier 1 + Tier 2 sources
2. Sends article titles + excerpts to Claude API
3. Claude filters for geospatial relevance, assigns categories, writes 2-sentence summaries
4. Output is saved to `content/news.json` (which the site already reads)
5. This runs automatically every day via GitHub Actions (free)

### The daily update script: `scripts/update-news.js`
See the file `scripts/update-news.js` in this project.

### GitHub Actions workflow: `.github/workflows/update-news.yml`
See the file `.github/workflows/update-news.yml` in this project.

### Cost estimate
- 5 RSS feeds × 5 articles each = 25 articles/day
- Each batch API call to Claude: ~500 tokens input + 800 tokens output
- Claude Haiku pricing: ~$0.001 per 1K tokens
- Daily cost: ~$0.002–0.005/day = less than $2/month
- Set `ANTHROPIC_API_KEY` as a GitHub Actions secret — it never touches your codebase

---

## CATEGORY AUTO-DETECTION

Both Option A and B need client-side category detection (Option C uses Claude).

```javascript
// Shared utility — add to news-feed.js
function detectCategory(text) {
  const t = text.toLowerCase();
  if (/(lidar|laser scan|point cloud|terrestrial scan)/.test(t)) return 'LiDAR';
  if (/(drone|uav|uas|unmanned|matrice|phantom|zenmuse)/.test(t)) return 'Drones';
  if (/(gnss|rtk|ppk|gps|glonass|galileo|beidou|ntrip)/.test(t)) return 'GNSS';
  if (/(photogrammetry|pix4d|metashape|sfm|structure from motion)/.test(t)) return 'Photogrammetry';
  if (/(gis|arcgis|qgis|esri|geospatial|spatial data|mapping)/.test(t)) return 'GIS';
  if (/(ai|machine learning|deep learning|neural|automation|geoai)/.test(t)) return 'AI & ML';
  if (/(survey.*compan|land survey business|firm|licensed survey)/.test(t)) return 'Industry';
  if (/(geo week|intergeo|asprs|nsps|ncees|conference|event)/.test(t)) return 'Events';
  if (/(software|platform|workflow|processing|cloud|api)/.test(t)) return 'Software';
  return 'Industry';
}
```

---

## RELEVANCE FILTERING

Filter out articles not relevant to geospatial professionals:

```javascript
const RELEVANT_KEYWORDS = [
  'lidar', 'photogrammetry', 'surveying', 'gnss', 'rtk', 'gis', 'geospatial',
  'drone mapping', 'point cloud', 'uav survey', 'land survey', 'laser scan',
  'total station', 'topographic', 'bathymetric', 'corridor mapping',
  'remote sensing', 'digital twin', 'reality capture', 'gaussian splat',
];

function isRelevant(article) {
  const text = (article.title + ' ' + (article.description || '')).toLowerCase();
  return RELEVANT_KEYWORDS.some(kw => text.includes(kw));
}
```

---

## CACHING STRATEGY

Don't re-fetch on every page load. Cache in sessionStorage (within a session)
or localStorage-equivalent (use a timestamp flag in memory):

```javascript
// Cache for 4 hours
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours in ms
let newsCache = null;
let cacheTime = 0;

async function getNews(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && newsCache && (now - cacheTime < CACHE_TTL)) {
    return newsCache;
  }
  const fresh = await loadAllFeeds();
  newsCache = fresh;
  cacheTime = now;
  return fresh;
}
```

---

## MANUAL OVERRIDE

The site's existing `content/news.json` acts as a curated fallback.
When the live feed fails, the static seed articles still display.
When running the AI automation (Option C), this file is updated daily.

Priority order in `news.js`:
  1. Try live RSS/API feed
  2. On failure: load `content/news.json` (curated seed)
  3. On total failure: show "Check back soon" message

---

## SETUP CHECKLIST

Option A (RSS, free today):
  [ ] Get free RSS2JSON API key at rss2json.com
  [ ] Replace YOUR_KEY_HERE in news-feed.js
  [ ] Add news-feed.js to news.html
  [ ] Test with browser devtools open

Option B (NewsData.io, free tier):
  [ ] Sign up at newsdata.io (free, no credit card)
  [ ] Copy API key to news-api.js
  [ ] Test keyword queries in their dashboard first
  [ ] Add news-api.js to news.html

Option C (AI automation, recommended):
  [ ] Get Anthropic API key at console.anthropic.com
  [ ] Fork/clone geosurveyhub to a GitHub repo
  [ ] Add ANTHROPIC_API_KEY to GitHub repository secrets
  [ ] Push .github/workflows/update-news.yml
  [ ] GitHub Actions runs automatically every day at 6am UTC
  [ ] Monitor runs in GitHub Actions tab
  [ ] content/news.json updates automatically and deploys to Netlify/Vercel
