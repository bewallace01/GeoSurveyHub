# GeoSurveyHub — SEO, GEO & AI Optimization Guide
# Cursor: apply every rule here to every page you build.

---

## OVERVIEW

Three optimization layers are required on every page:
  1. Traditional SEO — for Google/Bing/search engine indexing
  2. GEO (Generative Engine Optimization) — for AI search (ChatGPT, Perplexity, Gemini)
  3. Local/Geo metadata — for location-based search signals

---

## 1. TRADITIONAL SEO

### Title Tags
- Format: [Primary Keyword Phrase] — [Secondary Phrase] | GeoSurveyHub
- Length: 50–60 characters
- Each page MUST have a unique title
- Primary keyword first

### Meta Descriptions
- Length: 140–155 characters
- Include primary keyword naturally in first sentence
- End with a subtle action signal ("Learn more", "Find your setup", etc.)
- No keyword stuffing

### URL Structure
- All lowercase, hyphens not underscores
- Short and descriptive
- pages/ai-ml.html → geosurveyhub.com/ai-ml
- pages/lidar.html → geosurveyhub.com/lidar

### H1–H4 Hierarchy
- One H1 per page (hero headline)
- H2s divide major content areas (3–6 per page)
- H3s subdivide H2 content
- H4s for cards, spec labels, glossary terms
- Primary keyword must appear in H1
- Related/secondary keywords in H2s naturally

### Keyword Targets by Page
index.html:
  Primary: surveying equipment guide
  Secondary: LiDAR systems, drone surveying, geospatial technology

guide.html:
  Primary: surveying equipment buyer's guide
  Secondary: what LiDAR do I need, drone survey equipment, RTK GNSS

lidar.html:
  Primary: LiDAR systems guide
  Secondary: terrestrial LiDAR scanner, drone LiDAR, point cloud surveying

drones.html:
  Primary: survey drone guide
  Secondary: UAV LiDAR, drone photogrammetry, DJI Matrice 350 RTK

gnss-rtk.html:
  Primary: RTK GNSS guide
  Secondary: survey GPS, RTK accuracy, PPK workflow

ai-ml.html:
  Primary: AI LiDAR processing, machine learning GIS
  Secondary: automated point cloud classification, GeoAI, photogrammetry automation

news.html:
  Primary: geospatial news 2026
  Secondary: LiDAR news, surveying industry updates

financing.html:
  Primary: surveying equipment financing
  Secondary: LiDAR financing, drone equipment loan

### Image SEO
- All images: descriptive alt text required
- Format: alt="[description] — [keyword context]"
- Example: alt="Drone LiDAR survey over forested terrain — RIEGL VUX sensor"
- SVG illustrations: aria-label on container div

### Internal Linking Matrix
index → guide, lidar, drones, news, financing
guide → lidar, drones, gnss-rtk, sensors, trucks, computers, ai-ml, financing
lidar → guide, drones, ai-ml, financing
drones → guide, lidar, sensors, financing
gnss-rtk → guide, drones, financing
ai-ml → guide, lidar, drones, news, financing
news → guide, lidar, drones, gnss-rtk
financing → guide, lidar, drones

### Canonical Tags
Every page: <link rel="canonical" href="https://www.geosurveyhub.com/[path]">
For pages/ subdirectory: include full path in canonical

### Sitemap (create sitemap.xml in root)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.geosurveyhub.com/</loc><priority>1.0</priority></url>
  <url><loc>https://www.geosurveyhub.com/pages/guide.html</loc><priority>0.9</priority></url>
  <url><loc>https://www.geosurveyhub.com/pages/lidar.html</loc><priority>0.8</priority></url>
  <url><loc>https://www.geosurveyhub.com/pages/drones.html</loc><priority>0.8</priority></url>
  <url><loc>https://www.geosurveyhub.com/pages/gnss-rtk.html</loc><priority>0.8</priority></url>
  <url><loc>https://www.geosurveyhub.com/pages/sensors.html</loc><priority>0.7</priority></url>
  <url><loc>https://www.geosurveyhub.com/pages/trucks.html</loc><priority>0.7</priority></url>
  <url><loc>https://www.geosurveyhub.com/pages/computers.html</loc><priority>0.7</priority></url>
  <url><loc>https://www.geosurveyhub.com/pages/ai-ml.html</loc><priority>0.9</priority></url>
  <url><loc>https://www.geosurveyhub.com/pages/news.html</loc><priority>0.8</priority></url>
  <url><loc>https://www.geosurveyhub.com/pages/financing.html</loc><priority>0.7</priority></url>
</urlset>
```

### robots.txt (create in root)
```
User-agent: *
Allow: /
Sitemap: https://www.geosurveyhub.com/sitemap.xml
```

---

## 2. SCHEMA.ORG MARKUP (REQUIRED)

### Organization — every page footer
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "GeoSurveyHub",
  "url": "https://www.geosurveyhub.com",
  "description": "Free educational platform for surveying, GIS, and geospatial professionals. Guides, news, and financing connections for LiDAR, drone, GNSS, and photogrammetry equipment.",
  "foundingDate": "2024",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Charlotte",
    "addressRegion": "NC",
    "postalCode": "28201",
    "addressCountry": "US"
  },
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "knowsAbout": [
    "LiDAR Systems",
    "Photogrammetry",
    "GNSS RTK",
    "GIS Software",
    "Drone Surveying",
    "Geospatial Technology",
    "Machine Learning Geospatial",
    "Point Cloud Processing"
  ]
}
```

### WebSite — index.html only
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "GeoSurveyHub",
  "url": "https://www.geosurveyhub.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.geosurveyhub.com/pages/guide.html?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

### TechArticle — all category and AI-ML pages
```json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "[Page H1]",
  "description": "[Meta description]",
  "author": {
    "@type": "Organization",
    "name": "GeoSurveyHub"
  },
  "publisher": {
    "@type": "Organization",
    "name": "GeoSurveyHub",
    "url": "https://www.geosurveyhub.com"
  },
  "datePublished": "2026-01-01",
  "dateModified": "2026-03-22",
  "about": ["[primary topic]", "[secondary topic]"],
  "educationalLevel": "Beginner to Professional",
  "learningResourceType": "Guide"
}
```

### FAQPage — guide.html and ai-ml.html
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Question text]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Answer text — 2-3 sentences, direct and factual]"
      }
    }
  ]
}
```

### BreadcrumbList — all pages except index
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.geosurveyhub.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "[Page Name]",
      "item": "https://www.geosurveyhub.com/pages/[page].html"
    }
  ]
}
```

### HowTo — ai-ml.html (for the workflow section)
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Automate LiDAR Point Cloud Classification with AI",
  "description": "Step-by-step workflow for automating LiDAR point cloud classification using machine learning tools.",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Upload raw point cloud",
      "text": "Upload your .LAS or .LAZ file to an AI processing platform such as Lidarvisor or LP360."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Run automated ground classification",
      "text": "The pre-trained deep learning model runs a ground separation pass, distinguishing ground returns from vegetation, buildings, and other objects."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Extract additional classes",
      "text": "Secondary models extract vegetation height classes, buildings, powerlines, water, and noise points automatically."
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Human QA review",
      "text": "A qualified professional reviews the automated output, focusing on edge cases and complex areas. Typical review: 30 minutes vs 3 days manual."
    },
    {
      "@type": "HowToStep",
      "position": 5,
      "name": "Export classified deliverable",
      "text": "Export the classified point cloud to your GIS or CAD platform for DTM generation, feature extraction, or final deliverable production."
    }
  ]
}
```

---

## 3. GEO (GENERATIVE ENGINE OPTIMIZATION)
# For ChatGPT, Perplexity, Claude, Gemini, and other AI-powered search

### The core principle
AI assistants surface content that directly answers the user's question.
Structure every educational section to open with the direct answer first,
then provide supporting explanation. This is the opposite of traditional
long-form content that buries the answer.

### Recommended content patterns

PATTERN 1: Direct Answer Opening
Bad:  "LiDAR has been used in surveying for many years and has evolved
       significantly with the advent of drone technology..."
Good: "LiDAR is a laser-based technology that measures distances to create
       3D point clouds. For vegetation-covered terrain, it's the only
       sensor that can map the ground beneath trees."

PATTERN 2: Explicit Q&A Format
Use h3 headings phrased as questions on educational pages:
  "What is LiDAR and how does it work?"
  "When should I use LiDAR instead of photogrammetry?"
  "How accurate is drone LiDAR?"
  "What equipment do I need for a 500-acre topographic survey?"
AI assistants preferentially surface content structured this way.

PATTERN 3: Definitions at first use
When introducing a term: "RTK (Real-Time Kinematic) — a GPS correction
method that achieves centimeter-level accuracy by comparing satellite
signals against a stationary base station."
AI assistants use definitions to answer "what is" queries.

PATTERN 4: Comparison tables
Tables with clear headers and factual comparisons are heavily weighted
by AI search systems. Include comparison tables on every category page.

PATTERN 5: Named entities
Reference specific products, brands, tools, and standards by name.
"The DJI Matrice 350 RTK paired with the Zenmuse L2 achieves 4cm
vertical accuracy" is far more useful to AI search than "modern drone
systems can achieve centimeter accuracy."

### FAQ schema is critical for GEO
FAQ content with FAQPage schema is surfaced directly by AI assistants
answering user queries. Every major page should have 4-6 FAQ items.
Write answers as if responding directly to a user question — concise,
factual, authoritative. 2-4 sentences per answer.

### Content freshness signals
- Include current year references (2026) in page content naturally
- Reference recent events: "At Geo Week 2026 in Denver..."
- Date-stamp news articles and how-to guides
- Include "last updated" timestamp in footer of educational pages

### Authority signals
- Cite specific organizations: ASPRS, USGS 3DEP, Geo Week, INTERGEO
- Reference established standards: LAS/LAZ format, ASPRS accuracy classes
- Use precise technical language accurately — AI systems penalize vague claims
- Include specific numerical figures: "95%+ accuracy", "2-3cm positional accuracy"

---

## 4. GEO (GEOGRAPHIC) METADATA

Add to every page head:
```html
<meta name="geo.region" content="US-NC">
<meta name="geo.placename" content="Charlotte, North Carolina, United States">
<meta name="geo.position" content="35.2271;-80.0936">
<meta name="ICBM" content="35.2271, -80.0936">
```

LocalBusiness schema (add to index.html if appropriate):
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "GeoSurveyHub",
  "url": "https://www.geosurveyhub.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Charlotte",
    "addressRegion": "NC",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 35.2271,
    "longitude": -80.0936
  },
  "areaServed": "United States"
}
```

---

## 5. TECHNICAL SEO CHECKLIST

Performance:
  [ ] All CSS in <head>, all JS in <body> bottom or defer attribute
  [ ] Google Fonts loaded with display=swap parameter
  [ ] All images have explicit width and height attributes
  [ ] SVG illustrations inline (no external image requests)
  [ ] Preload hero font: <link rel="preload" as="font" crossorigin>
  [ ] No render-blocking resources in <head>

Crawlability:
  [ ] robots.txt in root
  [ ] sitemap.xml in root
  [ ] Canonical tags on every page
  [ ] No broken internal links (test all hrefs)
  [ ] All pages reachable from index.html within 2 clicks

Semantic HTML:
  [ ] <main> wraps primary content
  [ ] <nav> for navigation
  [ ] <article> for standalone content (news items, guide sections)
  [ ] <section> for page sections
  [ ] <aside> for callout boxes and related content
  [ ] <header> / <footer> used correctly
  [ ] Breadcrumb nav on all non-index pages
  [ ] Skip to content link for accessibility/crawlers

Mobile:
  [ ] Viewport meta tag present
  [ ] All content readable at 320px viewport width
  [ ] Touch targets minimum 44x44px
  [ ] No horizontal scroll on mobile
  [ ] Font size minimum 14px on mobile

Schema validation:
  [ ] All JSON-LD validates at schema.org/validator
  [ ] No duplicate schema types per page (except Organization)
  [ ] FAQ items have both question and acceptedAnswer

---

## pages/start-a-company.html SEO SPEC

Title: How to Start a Land Surveying Company — Licenses, Costs & Revenue | GeoSurveyHub
Description: Complete guide to starting a surveying company. Learn the PS license path, NCEES exam requirements, realistic startup costs from $45K, revenue potential, and a year-one roadmap.
Keywords: how to start a land surveying company, surveying business startup, professional land surveyor license, PS exam requirements, land survey startup costs, surveying company revenue
Schema: HowTo (license path steps) + FAQPage (6 FAQ items)

HowTo schema steps:
  1. Complete ABET-accredited surveying education (4-year degree)
  2. Pass the NCEES Fundamentals of Surveying (FS) exam
  3. Complete 4 years supervised experience under a licensed PS
  4. Pass the NCEES Principles and Practice of Surveying (PS) exam
  5. Pass your state-specific surveying exam
  6. Apply for and receive your Professional Surveyor (PS) license
  7. Form your business entity (LLC/PLLC) and obtain required insurance
  8. Register with state boards and obtain business licenses

Target long-tail keywords (use in H3 headings and FAQ questions):
- "do I need a degree to become a licensed land surveyor"
- "how long does it take to pass the PS exam"
- "surveying E&O insurance cost for new firm"
- "how to find first clients as a new surveying company"
- "how much does a solo surveying firm make per year"
- "can I hire someone with a PS license to run my surveying company"

Internal linking from this page:
- Link "drone survey equipment" → pages/drones.html
- Link "LiDAR systems" → pages/lidar.html
- Link "GNSS and RTK receivers" → pages/gnss-rtk.html
- Link "equipment financing" → pages/financing.html
- Link "what equipment do I need" → pages/guide.html

This page is the HIGHEST OPPORTUNITY on the site for organic search.
No major competitor has a well-structured, current guide on this exact topic.
Build it well, update it annually, and it will rank for dozens of long-tail terms.
