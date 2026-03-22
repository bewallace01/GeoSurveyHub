# GeoSurveyHub — News System Quick Setup
# Get live daily news running in 15 minutes

---

## OPTION A: RSS Only (Free, 5 minutes)

The simplest path. Works on any host including Netlify, GitHub Pages, Vercel.

**Step 1 — Get a free RSS2JSON key**
1. Go to https://rss2json.com
2. Click "Sign up for free"
3. Copy your API key from the dashboard

**Step 2 — Add the key to news-config.js**
Open `assets/js/news-config.js` and replace `YOUR_RSS2JSON_KEY` with your actual key:
```javascript
window.GSH_NEWS_KEYS = {
  rss2jsonKey: 'paste_key_here',
  newsdataKey: '',
};
```

**Step 3 — Scripts (already wired)**
`index.html` and `pages/news.html` load `news-config.js` then `news-feed.js` (live RSS + optional NewsData.io, with `content/news.json` as fallback).

**Step 4 — Test it**
Open `pages/news.html` in a browser. You should see live articles within 3-5 seconds.
If you see "Fetching live feed..." stuck, open browser DevTools → Console to see errors.

**That's it.** Articles update automatically every time someone visits the page.
The 4-hour cache means the same visitor won't trigger re-fetches within one session.

---

## OPTION B: NewsData.io (Free, 10 minutes)

Adds keyword-based news search on top of RSS. Finds articles from 10,000+ sources.

**Step 1 — Get a free NewsData.io key**
1. Go to https://newsdata.io
2. Click "Get API Key Free"
3. Verify your email
4. Copy your API key from the dashboard

**Step 2 — Add the key to news-feed.js**
Open `assets/js/news-feed.js` and find line 12:
```javascript
newsdataKey: '',
```
Add your key:
```javascript
newsdataKey: 'YOUR_NEWSDATA_KEY',
```

**Step 3 — Done.** Both RSS and NewsData.io will run in parallel.
If one fails, the other still delivers news.

---

## OPTION C: AI-Powered Daily Updates (Best, 15 minutes)

This is the recommended long-term setup. Fresh, curated, categorized news
every morning — fully automated, no manual work ever.

**What you need:**
- GitHub account (free)
- Anthropic API key (get at console.anthropic.com — pay-as-you-go, ~$2-5/month)
- Your site hosted on Netlify or Vercel (both have free tiers)

**Step 1 — Push the project to GitHub**
```bash
cd geosurveyhub
git init
git add .
git commit -m "Initial GeoSurveyHub setup"
git remote add origin https://github.com/YOUR_USERNAME/geosurveyhub.git
git push -u origin main
```

**Step 2 — Add your Anthropic API key to GitHub Secrets**
1. Go to your GitHub repo
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `ANTHROPIC_API_KEY`
5. Value: your Anthropic API key (starts with `sk-ant-...`)
6. Click "Add secret"

**Step 3 — (Optional) Connect to Netlify for auto-deploy**
If your site is on Netlify:
1. Go to Netlify → User settings → Applications → Personal access tokens
2. Create a new token and copy it
3. Find your Netlify Site ID (Site settings → General → Site details)
4. Add two more GitHub secrets:
   - `NETLIFY_AUTH_TOKEN` = your Netlify token
   - `NETLIFY_SITE_ID` = your site ID
5. Now after every news update, your live site automatically redeploys

**Step 4 — Enable GitHub Actions**
The workflow file is already in `.github/workflows/update-news.yml`.
Once pushed to GitHub, it runs automatically every day at 6:30 AM UTC.

**Test it manually:**
1. Go to your GitHub repo → Actions tab
2. Click "Daily News Update" in the left sidebar
3. Click "Run workflow" → "Run workflow"
4. Watch it run in real time
5. Check `content/news.json` — it will have new articles

**Step 5 — Replace old news.js with news-feed.js (same as Option A Step 3)**

---

## TROUBLESHOOTING

**"Fetching live feed..." never resolves**
→ Your RSS2JSON key is wrong or the free tier is rate-limited
→ Open DevTools Console and look for the error message
→ Try a different feed URL manually in the browser

**GitHub Action fails with "ANTHROPIC_API_KEY not set"**
→ Check Secrets in GitHub repo settings — the name must be exactly `ANTHROPIC_API_KEY`

**News articles aren't updating on the live site**
→ If on Netlify: set up the `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` secrets
→ Or: manually trigger a Netlify deploy after each GitHub Actions run
→ Or: switch from static HTML to a CDN that serves from GitHub directly

**Articles are irrelevant or off-topic**
→ Edit the `relevantKeywords` array in `news-feed.js` to tighten the filter
→ For Option C (AI), the Claude prompt in `scripts/update-news.js` can be adjusted

**RSS2JSON free tier limits**
→ Free tier: 1 req/second, 1,000 req/day
→ With 9 feeds and a 4-hour cache, you use ~9 API calls per page load
→ 1,000 / 9 = ~111 page loads/day before hitting limits
→ For higher traffic: upgrade to paid RSS2JSON ($7/month) or use Option C

---

## COST SUMMARY

| Option | Monthly Cost | Setup Time | News Quality |
|--------|-------------|------------|--------------|
| A: RSS only | Free | 5 min | Good |
| B: RSS + NewsData | Free | 10 min | Better |
| C: AI-powered | ~$2–5/mo | 15 min | Best |

All three options fall back to `content/news.json` (seeded articles)
if the live feed fails — so the site always has content.
