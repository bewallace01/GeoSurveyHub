#!/usr/bin/env node
/**
 * Build step for Cloudflare Pages (and similar): write news-config.local.js
 * from environment variables so API keys never live in git.
 *
 * Env vars (set in Cloudflare Pages → Settings → Environment variables):
 *   RSS2JSON_KEY   — from https://rss2json.com (required for live RSS)
 *   NEWSDATA_KEY   — optional, from https://newsdata.io
 *
 * If RSS2JSON_KEY is unset, this script does nothing (site uses content/news.json).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.join(__dirname, '..');
const outFile = path.join(siteRoot, 'assets', 'js', 'news-config.local.js');

const rss = process.env.RSS2JSON_KEY?.trim() || '';
const nd = process.env.NEWSDATA_KEY?.trim() || '';

if (!rss) {
  console.log('[inject-news-config] RSS2JSON_KEY not set — skipping (news will use JSON fallback).');
  process.exit(0);
}

const body = `/**
 * Generated at deploy — do not commit. Source: Cloudflare Pages build + RSS2JSON_KEY secret.
 */
window.GSH_NEWS_KEYS = {
  rss2jsonKey: ${JSON.stringify(rss)},
  newsdataKey: ${JSON.stringify(nd)},
};
`;

fs.writeFileSync(outFile, body, 'utf8');
console.log('[inject-news-config] Wrote', path.relative(siteRoot, outFile));
