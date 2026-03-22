# Deploy GeoSurveyHub with Cloudflare Workers (`npx wrangler deploy`)

This repo is configured for **Workers + static assets** (see `wrangler.toml` and `src/worker.ts`). Use this path when Cloudflare shows **Deploy command: `npx wrangler deploy`**.

## 1. Project settings (dashboard or CI)

`package.json` and `package-lock.json` live **only under `geosurveyhub/`**.

### Do not mix Root directory and paths

Cloudflare’s **Root directory** changes what the build sees as the current folder:

- **Root directory = `geosurveyhub`** — the clone **has no** `geosurveyhub/` subfolder. Files like `package.json` are at the **top level** of the build workspace. Use **`npm ci`** and paths like **`scripts/inject-news-config.mjs`** (no `geosurveyhub/` prefix). Using `npm ci --prefix geosurveyhub` fails with **ENOENT** on `package.json` because that nested folder does not exist in this layout.
- **Root directory = empty** (repository root) — the **`geosurveyhub/`** folder exists. Use **`npm ci --prefix geosurveyhub`** and **`node geosurveyhub/scripts/inject-news-config.mjs`**.

Pick **one** row and use it exactly:

| Root directory | Build command | Deploy command |
|----------------|----------------|----------------|
| `geosurveyhub` | `npm ci && node scripts/inject-news-config.mjs` | `npx wrangler deploy` |
| Empty (repo root) | `npm ci --prefix geosurveyhub && node geosurveyhub/scripts/inject-news-config.mjs` | `cd geosurveyhub && npx wrangler deploy` |

### Optional: one script for either layout

From **repo root** (Root directory empty):

```bash
bash geosurveyhub/scripts/cloudflare-ci-build.sh
```

With **Root directory = `geosurveyhub`**:

```bash
bash scripts/cloudflare-ci-build.sh
```

Deploy: same pattern with `cloudflare-ci-deploy.sh` instead of hand-written `npx wrangler deploy`.

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
