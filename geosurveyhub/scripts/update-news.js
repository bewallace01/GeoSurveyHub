#!/usr/bin/env node
// ============================================================
// GeoSurveyHub — AI-Powered Daily News Updater
// scripts/update-news.js
//
// Run: node scripts/update-news.js
// Scheduled: GitHub Actions (.github/workflows/update-news.yml)
//
// What it does:
//   1. Fetches RSS from 5 industry sources
//   2. Sends batch to Claude API for relevance filtering + summarization
//   3. Merges with existing content/news.json (keeps top 30 articles)
//   4. Writes updated news.json
//
// Requires: ANTHROPIC_API_KEY environment variable
// Cost: ~$0.002–0.005 per run (Claude Haiku pricing)
// ============================================================

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const API_KEY    = process.env.ANTHROPIC_API_KEY;
const NEWS_FILE  = path.join(__dirname, '..', 'content', 'news.json');
const MAX_STORED = 40;

if (!API_KEY) {
  console.error('ANTHROPIC_API_KEY not set. Exiting.');
  process.exit(1);
}

// ── RSS SOURCES ───────────────────────────────────────────────
const RSS_FEEDS = [
  'https://www.gim-international.com/rss.xml',
  'https://lidarmag.com/feed/',
  'https://www.geoweeknews.com/feed',
  'https://xyht.com/feed/',
  'https://news.google.com/rss/search?q=LiDAR+drone+geospatial+survey&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=photogrammetry+GNSS+RTK+mapping&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=GIS+geospatial+AI+machine+learning&hl=en-US&gl=US&ceid=US:en',
];

// ── FETCH RSS (simple XML parse, no dependencies) ─────────────
function fetchURL(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : require('http');
    lib.get(url, { headers: { 'User-Agent': 'GeoSurveyHub-NewsBot/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchURL(res.headers.location).then(resolve).catch(reject);
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i'));
      return m ? m[1].trim() : '';
    };
    const title       = get('title');
    const link        = get('link') || get('guid');
    const description = get('description').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 300);
    const pubDate     = get('pubDate') || get('dc:date') || new Date().toISOString();
    if (title && link) items.push({ title, link, description, pubDate });
  }
  return items.slice(0, 6); // max 6 per feed
}

async function fetchAllFeeds() {
  const all = [];
  for (const feedUrl of RSS_FEEDS) {
    try {
      const xml   = await fetchURL(feedUrl);
      const items = parseRSS(xml);
      all.push(...items);
      console.log(`  ✓ ${feedUrl.split('/')[2]} — ${items.length} items`);
    } catch (e) {
      console.warn(`  ✗ ${feedUrl.split('/')[2]} — ${e.message}`);
    }
  }
  return all;
}

// ── LOAD EXISTING NEWS ────────────────────────────────────────
function loadExisting() {
  try {
    if (fs.existsSync(NEWS_FILE)) return JSON.parse(fs.readFileSync(NEWS_FILE, 'utf8'));
  } catch { /* ignore */ }
  return [];
}

// ── CALL CLAUDE API ───────────────────────────────────────────
function callClaude(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages:   [{ role: 'user', content: prompt }],
    });

    const req = https.request({
      hostname: 'api.anthropic.com',
      path:     '/v1/messages',
      method:   'POST',
      headers:  {
        'Content-Type':      'application/json',
        'x-api-key':         API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length':    Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) reject(new Error(parsed.error.message));
          else resolve(parsed.content[0].text);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── AI CURATION ───────────────────────────────────────────────
async function curateWithAI(rawArticles) {
  const articleList = rawArticles.map((a, i) =>
    `${i + 1}. TITLE: ${a.title}\n   EXCERPT: ${a.description}\n   DATE: ${a.pubDate}\n   URL: ${a.link}`
  ).join('\n\n');

  const prompt = `You are a news curator for GeoSurveyHub, a professional education platform for the surveying, GIS, and geospatial industry.

Below are ${rawArticles.length} raw RSS articles. Your job:
1. Filter to ONLY articles relevant to: LiDAR, photogrammetry, GNSS/RTK, GIS software, survey drones, mobile mapping, geospatial AI/ML, or starting a surveying business. Reject anything unrelated.
2. For each relevant article, assign one category: LiDAR | Drones | GNSS | Photogrammetry | GIS | AI & ML | Mobile Mapping | Sensors | Events | Software | Industry
3. Write a clean 1-2 sentence summary in plain English for professionals. Be factual and specific.
4. Return ONLY valid JSON array, no other text, no markdown code fences.

JSON format for each item:
{
  "id": "unique-slug-from-title",
  "title": "original title",
  "excerpt": "your 1-2 sentence summary",
  "date": "YYYY-MM-DD",
  "category": "category",
  "source": "domain name only e.g. gim-international.com",
  "link": "original URL",
  "tags": ["tag1","tag2"]
}

RAW ARTICLES:
${articleList}

Return JSON array only:`;

  const response = await callClaude(prompt);

  // Parse JSON — strip any accidental markdown fences
  const clean = response.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(clean);
  } catch (e) {
    console.error('Claude returned invalid JSON:', clean.slice(0, 200));
    throw e;
  }
}

// ── MERGE & DEDUPLICATE ───────────────────────────────────────
function mergeNews(fresh, existing) {
  const seen = new Set(existing.map(a => a.id));
  const newOnly = fresh.filter(a => !seen.has(a.id));
  console.log(`  + ${newOnly.length} new articles, ${existing.length} existing`);
  return [...newOnly, ...existing]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, MAX_STORED);
}

// ── MAIN ──────────────────────────────────────────────────────
async function main() {
  console.log('\n🗺️  GeoSurveyHub News Updater');
  console.log('==============================');
  console.log(`📅 ${new Date().toISOString()}\n`);

  console.log('1. Fetching RSS feeds...');
  const rawArticles = await fetchAllFeeds();
  console.log(`   → ${rawArticles.length} raw articles collected\n`);

  if (!rawArticles.length) {
    console.log('No articles fetched. Exiting without changes.');
    return;
  }

  console.log('2. Sending to Claude for curation...');
  // Batch in groups of 20 to keep prompt manageable
  const batches = [];
  for (let i = 0; i < rawArticles.length; i += 20) {
    batches.push(rawArticles.slice(i, i + 20));
  }

  const curated = [];
  for (let i = 0; i < batches.length; i++) {
    console.log(`   Batch ${i + 1}/${batches.length} (${batches[i].length} articles)...`);
    try {
      const batch = await curateWithAI(batches[i]);
      curated.push(...batch);
      console.log(`   → ${batch.length} relevant articles kept`);
    } catch (e) {
      console.warn(`   ✗ Batch ${i + 1} failed:`, e.message);
    }
    // Small delay between batches
    if (i < batches.length - 1) await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n3. Merging with existing news...`);
  const existing = loadExisting();
  const merged   = mergeNews(curated, existing);

  console.log(`4. Writing ${merged.length} articles to content/news.json...`);
  fs.mkdirSync(path.dirname(NEWS_FILE), { recursive: true });
  fs.writeFileSync(NEWS_FILE, JSON.stringify(merged, null, 2));

  console.log('\n✅ Done!\n');
  console.log(`   Total articles: ${merged.length}`);
  console.log(`   New today:      ${curated.length}`);
  console.log(`   Categories:     ${[...new Set(merged.map(a => a.category))].join(', ')}\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
