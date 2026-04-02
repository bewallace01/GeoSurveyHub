/**
 * Static assets + /api/news/* proxy.
 * RSS: fetches feed XML directly (no third-party API key required).
 * Optional: GSH_RSS2JSON_KEY — fallback to rss2json.com if raw parse yields no items.
 * NewsData: GSH_NEWSDATA_KEY required for /api/news/newsdata.
 */
export interface Env {
  ASSETS: Fetcher;
  /** Optional fallback when raw RSS parse fails */
  GSH_RSS2JSON_KEY?: string;
  GSH_NEWSDATA_KEY?: string;
}

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

function safeRssUrl(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(String(raw).trim());
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.href;
  } catch {
    return null;
  }
}

function rssProxyError(message: string, status = 503): Response {
  return new Response(JSON.stringify({ status: 'error', message }), {
    status,
    headers: JSON_HEADERS,
  });
}

function decodeBasicEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function stripCdata(s: string): string {
  const t = s.trim();
  if (t.startsWith('<![CDATA[')) {
    return t.replace(/^<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '').trim();
  }
  return decodeBasicEntities(t);
}

/** Extract inner XML for a tag (supports content:encoded, title, link, …). */
function extractTagInner(block: string, tag: string): string {
  const name = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i');
  const m = block.match(re);
  if (!m) return '';
  return stripCdata(m[1]);
}

function extractAtomLinkHref(entry: string): string {
  const m = entry.match(/<link[^>]+href\s*=\s*["']([^"']+)["']/i);
  return m ? m[1].trim() : '';
}

/** RSS 2.0 <enclosure url="..."/> */
function extractEnclosure(entry: string): { link?: string } | undefined {
  const m = entry.match(/<enclosure[^>]+url\s*=\s*["']([^"']+)["']/i);
  if (m) return { link: m[1] };
  return undefined;
}

export interface RssJsonItem {
  title: string;
  link: string;
  description: string;
  content: string;
  pubDate: string;
  guid: string;
  enclosure?: { link?: string };
}

function parseRss20Items(xml: string, limit: number): RssJsonItem[] {
  const items: RssJsonItem[] = [];
  const itemRe = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml)) !== null && items.length < limit) {
    const block = m[1];
    const title = extractTagInner(block, 'title');
    let link = extractTagInner(block, 'link');
    const description = extractTagInner(block, 'description');
    const content =
      extractTagInner(block, 'content:encoded') ||
      extractTagInner(block, 'content') ||
      '';
    const pubDate = extractTagInner(block, 'pubDate') || extractTagInner(block, 'dc:date');
    let guid = extractTagInner(block, 'guid');
    if (!guid) {
      const g = block.match(/<guid([^>]*)>([\s\S]*?)<\/guid>/i);
      if (g) guid = stripCdata(g[2]);
    }
    const enclosure = extractEnclosure(block);
    if (!link && enclosure?.link) link = enclosure.link;
    items.push({
      title,
      link,
      description: description || content,
      content: content || description,
      pubDate,
      guid: guid || link || title,
      ...(enclosure && enclosure.link ? { enclosure } : {}),
    });
  }
  return items;
}

/** Atom 1.0 (some publishers) */
function parseAtomEntries(xml: string, limit: number): RssJsonItem[] {
  const items: RssJsonItem[] = [];
  const entryRe = /<entry\b[^>]*>([\s\S]*?)<\/entry>/gi;
  let m: RegExpExecArray | null;
  while ((m = entryRe.exec(xml)) !== null && items.length < limit) {
    const block = m[1];
    const title = extractTagInner(block, 'title');
    const link = extractAtomLinkHref(block) || extractTagInner(block, 'id');
    const summary = extractTagInner(block, 'summary');
    const content = extractTagInner(block, 'content') || summary;
    const pubDate =
      extractTagInner(block, 'published') ||
      extractTagInner(block, 'updated') ||
      '';
    items.push({
      title,
      link,
      description: summary || content,
      content: content || summary,
      pubDate,
      guid: extractTagInner(block, 'id') || link || title,
    });
  }
  return items;
}

async function fetchRssXml(rssUrl: string): Promise<string> {
  const res = await fetch(rssUrl, {
    headers: {
      Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      'User-Agent': 'GeoSurveyHub/1.0 (+https://www.geosurveyhub.com)',
    },
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`RSS fetch HTTP ${res.status}`);
  }
  return res.text();
}

async function fetchViaRss2Json(rssUrl: string, count: number, apiKey: string): Promise<Response> {
  const upstream = new URL('https://api.rss2json.com/v1/api.json');
  upstream.searchParams.set('rss_url', rssUrl);
  upstream.searchParams.set('api_key', apiKey);
  upstream.searchParams.set('count', String(count));
  const res = await fetch(upstream.toString(), {
    headers: { Accept: 'application/json' },
  });
  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: JSON_HEADERS,
  });
}

async function handleRssProxy(url: URL, env: Env): Promise<Response> {
  const rssUrl = safeRssUrl(url.searchParams.get('rss_url'));
  if (!rssUrl) {
    return rssProxyError('Invalid or missing rss_url', 400);
  }
  const count = Math.min(100, Math.max(1, parseInt(url.searchParams.get('count') || '5', 10) || 5));

  try {
    const xml = await fetchRssXml(rssUrl);
    let items = parseRss20Items(xml, count);
    if (!items.length) {
      items = parseAtomEntries(xml, count);
    }

    if (items.length > 0) {
      return new Response(JSON.stringify({ status: 'ok', items }), {
        status: 200,
        headers: JSON_HEADERS,
      });
    }

    const key = env.GSH_RSS2JSON_KEY;
    if (key) {
      return fetchViaRss2Json(rssUrl, count, key);
    }

    return rssProxyError('Could not parse RSS feed (no items found)', 502);
  } catch (e) {
    const key = env.GSH_RSS2JSON_KEY;
    if (key) {
      try {
        return await fetchViaRss2Json(rssUrl, count, key);
      } catch {
        /* fall through */
      }
    }
    const msg = e instanceof Error ? e.message : String(e);
    return rssProxyError(`RSS fetch/parse failed: ${msg}`, 502);
  }
}

async function handleNewsDataProxy(url: URL, env: Env): Promise<Response> {
  const q = url.searchParams.get('q');
  if (!q || !q.trim()) {
    return rssProxyError('Missing q parameter', 400);
  }
  const key = env.GSH_NEWSDATA_KEY;
  if (!key) {
    return new Response(JSON.stringify({ status: 'error', message: 'NewsData proxy not configured' }), {
      status: 503,
      headers: JSON_HEADERS,
    });
  }
  const lang = url.searchParams.get('language') || 'en';
  const upstream = new URL('https://newsdata.io/api/1/news');
  upstream.searchParams.set('apikey', key);
  upstream.searchParams.set('q', q.trim());
  upstream.searchParams.set('language', lang);

  const res = await fetch(upstream.toString(), {
    headers: { Accept: 'application/json' },
  });
  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: JSON_HEADERS,
  });
}

/** /pages/foo → pages/foo.html (clean URLs for local dev + Workers) */
function extensionlessPagesHtml(pathname: string): string | null {
  if (!pathname.startsWith('/pages/') || pathname.length <= '/pages/'.length) return null;
  const rest = pathname.slice('/pages/'.length);
  if (rest.includes('/') || rest.includes('.')) return null;
  return `/pages/${rest}.html`;
}

/**
 * Single canonical URL for SEO: https + www + .html for extensionless /pages/*.
 * 301 so Google indexes one URL (matches <link rel="canonical"> on each page).
 */
function canonicalizeRequestUrl(url: URL): URL {
  const u = new URL(url.href);
  if (u.hostname === 'geosurveyhub.com') {
    u.hostname = 'www.geosurveyhub.com';
  }
  if (u.protocol === 'http:') {
    u.protocol = 'https:';
  }
  if (u.pathname.length > 1 && u.pathname.endsWith('/')) {
    u.pathname = u.pathname.slice(0, -1);
  }
  const htmlPath = extensionlessPagesHtml(u.pathname);
  if (htmlPath) {
    u.pathname = htmlPath;
  }
  return u;
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'GET' || request.method === 'HEAD') {
      const canonical = canonicalizeRequestUrl(url);
      if (canonical.href !== url.href) {
        return Response.redirect(canonical.toString(), 301);
      }
    }
    if (request.method === 'GET' && url.pathname === '/api/news/rss') {
      return handleRssProxy(url, env);
    }
    if (request.method === 'GET' && url.pathname === '/api/news/newsdata') {
      return handleNewsDataProxy(url, env);
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
