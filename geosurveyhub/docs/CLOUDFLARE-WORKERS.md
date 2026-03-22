# Deploy GeoSurveyHub with Cloudflare Workers (`npx wrangler deploy`)

This repo is configured for **Workers + static assets** (see `wrangler.toml` and `src/worker.ts`). Use this path when Cloudflare shows **Deploy command: `npx wrangler deploy`**.

## 1. Project settings (dashboard or CI)

`package.json` and `package-lock.json` live **only under `geosurveyhub/`**. If Cloudflare’s **Root directory** is left blank, the build runs at the **repository root** and plain `npm ci` fails (no lockfile there).

**Recommended:** set **Root directory** to `geosurveyhub`, then:

| Setting | Value |
|--------|--------|
| **Root directory** | `geosurveyhub` |
| **Build command** (optional) | `npm ci && node scripts/inject-news-config.mjs` |
| **Deploy command** | `npx wrangler deploy` |

**If you must keep Root directory at the repo root** (or Cloudflare won’t let you change it), use:

| Setting | Value |
|--------|--------|
| **Root directory** | `/` or empty |
| **Build command** | `npm ci --prefix geosurveyhub && node geosurveyhub/scripts/inject-news-config.mjs` |
| **Deploy command** | `cd geosurveyhub && npx wrangler deploy` |

- Run the **inject** step in CI so `assets/js/news-config.local.js` is generated from `RSS2JSON_KEY` / `NEWSDATA_KEY` before deploy (same as [CLOUDFLARE-PAGES.md](./CLOUDFLARE-PAGES.md)).
- The Worker name in `wrangler.toml` is **`geosurvey-hub`** (Wrangler requires a lowercase slug). That does not have to match the dashboard display name.

## 2. Local deploy

From `geosurveyhub`:

```bash
npm install
node scripts/inject-news-config.mjs   # optional: needs env vars for news keys
npx wrangler login                     # once per machine
npx wrangler deploy
```

## 3. Preview

```bash
npx wrangler dev
```

## 4. Environment variables in CI

Set `RSS2JSON_KEY` and optionally `NEWSDATA_KEY` as **encrypted** variables in your CI or Cloudflare Workers build settings so the inject script can run before `wrangler deploy`.
