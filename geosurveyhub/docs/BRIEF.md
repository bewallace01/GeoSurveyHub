# GeoSurveyHub — Project Brief

## What We're Building
A static website that is simultaneously:
- An **equipment commerce site** (B2B + B2C, quote-based)
- A **beginner's guide** to surveying technology
- An **industry news hub** for geospatial professionals
- An **equipment recommender** that helps anyone figure out what gear they need

The closest analog is MNTN — a cinematic, dark, editorial landing page — but repurposed
from hiking into the world of professional geospatial equipment.

---

## Target Audiences

### Beginner
- Has a project that needs surveying/mapping but doesn't know where to start
- Doesn't know the difference between LiDAR and photogrammetry
- Needs hand-holding through the decision: "What do I actually buy?"
- Entry point: Buyer's Guide quiz

### Professional
- Licensed surveyor, GIS analyst, drone operator, photogrammetrist
- Knows the tech — wants specs, prices, and news fast
- Comparing products or staying current on releases
- Entry point: Category pages or News

### Enterprise / Government
- Engineering firms, DOT agencies, utilities, mining companies
- Needs fleet pricing, bulk quotes, service/calibration
- Entry point: Fleet pricing CTA or "Get a Quote"

---

## Site Architecture

```
Home → What kind of surveyor are you? → Guide Quiz → Recommendation → Category Page → Product Detail → Add to Quote
Home → News → Article
Home → Category (LiDAR / Drones / GNSS...) → Product Grid → Product Detail
```

---

## Tone & Voice
- Senior surveyor who teaches
- Precise, confident, never arrogant
- Accessible to outsiders without being patronizing
- Technical claims must be accurate (see TECH-RUNDOWN.md)
- Short sentences. Active voice. Present tense where possible.

---

## Visual Identity
Based on the MNTN Figma community template by Kryston Schwarze.
Full color/type/layout specs are in `.cursorrules`.

The single most important design rule: everything on this site should feel like
you are looking at a precision instrument — dark, calibrated, purposeful.

---

## Key Differentiators vs Competitors
- Most surveying equipment sites are ugly, outdated, overwhelming
- We combine education + commerce on every page
- The quiz removes the paralysis of choice for beginners
- News keeps professionals coming back
- The design builds trust before a single spec is read

---

## Tech Stack
- HTML5 / CSS3 / Vanilla JS
- No frameworks, no build tools, no dependencies
- Google Fonts CDN
- Deployable as pure static files
- Future: could add a headless CMS (Contentful/Sanity) for news + products

---

## What "Done" Looks Like
- [ ] index.html matches MNTN template with survey content
- [ ] pages/guide.html has working quiz + educational content
- [ ] pages/news.html has seeded news cards with category filter
- [ ] All 6 category pages built (lidar, drones, gnss-rtk, sensors, computers, trucks)
- [ ] pages/product.html template working with sample product
- [ ] assets/css/global.css contains full design system
- [ ] content/products.json seeded with 15+ products
- [ ] content/news.json seeded with 10+ articles from NEWS.md
- [ ] Mobile responsive (breakpoint at 768px)
- [ ] Nav works, footer works, all internal links resolve
