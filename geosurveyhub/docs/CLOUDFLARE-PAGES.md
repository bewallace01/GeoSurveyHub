# Deploy GeoSurveyHub on Cloudflare Pages

## 1. Create a Pages project

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Select the **GeoSurveyHub** GitHub repository.
3. Configure the build:

| Setting | Value |
|--------|--------|
| **Production branch** | `main` (or your default branch) |
| **Root directory** | `geosurveyhub` |
| **Build command** | `node scripts/inject-news-config.mjs` |
| **Build output directory** | `.` (deploy the `geosurveyhub` folder as-is after the script runs; if the UI lets you leave this blank for “same folder”, that’s fine too) |

Cloudflare Pages treats the **root directory** as the site root. With root = `geosurveyhub`, `index.html` is at the top level of the deploy — correct.

## 2. Environment variables (live news API)

In **Pages project → Settings → Environment variables** (Production):

| Variable name | Value | Secret? |
|---------------|--------|---------|
| `RSS2JSON_KEY` | Your key from [rss2json.com](https://rss2json.com) | **Yes** (encrypt) |
| `NEWSDATA_KEY` | Optional — [newsdata.io](https://newsdata.io) | **Yes** |

Redeploy after saving variables so `scripts/inject-news-config.mjs` runs with them.

If you **omit** `RSS2JSON_KEY`, the build skips writing `news-config.local.js` and the site uses **`content/news.json`** only (still works).

## 3. Custom domain (optional)

**Pages project → Custom domains** → add your domain and follow DNS instructions.

## 4. Local preview (Wrangler)

Install [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), then from the `geosurveyhub` folder:

```bash
npx wrangler pages dev .
```

Use your real `news-config.local.js` locally; Wrangler does not run the inject script unless you run it first.

## 5. Troubleshooting

- **Blank news on production:** Confirm `RSS2JSON_KEY` is set, **Save**, then **Deployments → Retry deployment** or push a new commit.
- **Build fails:** Ensure **Root directory** is `geosurveyhub` so `node scripts/inject-news-config.mjs` runs from the folder that contains `scripts/`.
- **Keys in client bundle:** rss2json keys are always visible in the browser; that’s normal for this static approach. For stronger protection you’d add a small Worker proxy (advanced).
