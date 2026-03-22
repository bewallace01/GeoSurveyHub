# GeoSurveyHub — Content & Education Guide
# Cursor: use this to write all body copy, section text, and educational content.

---

## HOME PAGE (index.html)

### Hero
- Kicker: "A Surveyor's Guide"
- H1: "Be Prepared for the Field and Beyond."
- Subtext: "Professional LiDAR systems, survey drones, photogrammetry rigs, and ground
  equipment — engineered for precision, built for the field."
- CTA 1: "Shop Equipment" → pages/guide.html
- CTA 2: "View Catalog →" → pages/lidar.html

### Section 01 — Get Started
- Number: 01
- Kicker: "Get Started"
- H2: "What level of *surveyor* are you?"
- Body: "Determining the right equipment starts with understanding your project — not your
  title. Whether you're mapping a backyard boundary or a 50-mile pipeline corridor, the
  technology landscape looks different at every scale. Our guide walks you through it."
- CTA: "Read More →" → pages/guide.html

### Section 02 — Equipment
- Number: 02
- Kicker: "Picking the Right Gear"
- H2: "The right sensor for every *terrain*."
- Body: "There's no universal survey kit. Drone LiDAR excels where GPS works and trees
  block photogrammetry. Total stations win for precise boundary work. Mobile mapping
  trucks cover corridors faster than anything else. The right answer depends on your
  terrain, your timeline, and your deliverable."
- CTA: "Read More →" → pages/lidar.html

### Section 03 — Stay Current
- Number: 03
- Kicker: "The Tech Landscape"
- H2: "Understand your *data & coverage* options."
- Body: "Gaussian Splatting just landed natively in ArcGIS. RIEGL shipped a drone sensor
  that maps land and water in a single pass. AI is classifying point clouds in minutes.
  The geospatial industry is moving fast — stay ahead of it."
- CTA: "Read More →" → pages/news.html

### CTA Band
- H2: "Get Out There & *Map* Your Next Project."
- Subtext: "Browse 2,400+ products across LiDAR, drones, GNSS, sensors, computers, and
  mobile platforms."
- CTA: "Browse All Equipment"

---

## BUYER'S GUIDE (pages/guide.html)

### Hero
- Kicker: "Start Here"
- H1: "What Equipment Do *You* Need?"
- Subtext: "Answer four questions and we'll recommend a tech stack. Or scroll down to
  learn everything about the technology from scratch."

### Quiz Section
Title: "Find Your Setup"
Step labels: Step 1 of 4, Step 2 of 4, etc.
(Full logic in .cursorrules)

### After Quiz — Education Sections

#### Section 1: The 5 Technologies
Title: "The *5 Technologies* Every Surveyor Should Know"
Subsections (one per tech):
1. LiDAR — "The laser that sees through trees"
2. Photogrammetry — "Turning photos into measurements"
3. GNSS/RTK — "GPS that thinks in centimeters"
4. Total Stations — "The original precision instrument"
5. Mobile Mapping — "Surveying at driving speed"

Each subsection: 3–4 sentences plain-English explanation, one "Best for:" line, one
"Not ideal for:" line. Link to category page.

#### Section 2: Platform Tradeoffs
Title: "Drone vs Truck vs Backpack vs *Aircraft*"
Use the comparison table from TECH-RUNDOWN.md.
Add a 2-sentence explanation of when to choose each.

#### Section 3: How to Read a Spec Sheet
Title: "What the *Numbers* Actually Mean"
Cover: accuracy, range, point density, IMU grade, PRR.
Use the glossary from TECH-RUNDOWN.md.
Format: term → plain English → why it matters.

#### Section 4: Software Stack 101
Title: "From Field to *Deliverable*"
Explain the pipeline: Capture → Process → Classify → GIS → Deliver
Map common software to each stage.
Mention Gaussian Splatting and AI classification as 2026 developments.

---

## NEWS PAGE (pages/news.html)

### Hero
- Kicker: "The Field Report"
- H1: "Geospatial & *Surveying* News"
- Subtext: "The latest from Geo Week, INTERGEO, and the manufacturers shaping the industry."

### Filter Categories
All | LiDAR | Drones | GNSS | Software | Industry | Events

### News Card Structure
Each card:
- Date (top-left, Space Mono)
- Category tag (accent color)
- Headline (Playfair, 20px)
- 2-line excerpt (muted body text)
- "Read More →" link

Seed with all 12 articles from docs/NEWS.md.

---

## CATEGORY PAGES

### LiDAR (pages/lidar.html)
- Hero H1: "LiDAR — The *Laser* That Builds the World"
- Intro: Explain what LiDAR is in 3 sentences. Why it matters. What problems it solves.
- "Who needs this?": Forestry crews, engineering firms, corridor mapping teams, as-built surveyors
- Product grid: Terrestrial / Drone / Mobile / Handheld subcategories

### Drones (pages/drones.html)
- Hero H1: "Survey *Drones* — Your Eye in the Sky"
- Intro: Explain drone platforms vs payloads. The drone is a platform; the sensor is the tool.
- "Who needs this?": Anyone mapping 10–5,000 acres who can't afford crewed aircraft
- Product grid: Platforms / LiDAR payloads / Camera payloads

### GNSS/RTK (pages/gnss-rtk.html)
- Hero H1: "GNSS & *RTK* — Centimeter GPS"
- Intro: Explain the difference between GPS and RTK. What corrections mean.
- "Who needs this?": Anyone doing boundary surveys, stakeout, or needing absolute position

### Sensors (pages/sensors.html)
- Hero H1: "Sensors & *Cameras* — What Sees the World"
- Intro: Explain sensor types: RGB, multispectral, thermal, oblique, nadir
- "Who needs this?": Drone operators choosing payloads for specific projects

### Computers (pages/computers.html)
- Hero H1: "Field *Computers* & Software — Process Anywhere"
- Intro: Explain rugged tablets vs data collectors vs office workstations
- "Who needs this?": Any field crew needing to log, verify, or process data on-site

### Trucks (pages/trucks.html)
- Hero H1: "Mobile *Mapping* — Survey at Road Speed"
- Intro: Explain mobile mapping systems. Vehicle-mounted sensors. Coverage rates.
- "Who needs this?": DOT agencies, utility companies, corridor mapping firms

---

## PRODUCT DETAIL (pages/product.html)

### Template content sections:
1. Breadcrumb: Equipment > Drones > [Product Name]
2. Product name (Playfair, large)
3. Brand + category tag
4. Price + "Add to Quote" CTA (sticky sidebar on desktop)
5. Key specs grid (6 specs in 2 columns)
6. Tabs: Overview | Full Specs | Applications | Related Products
7. "Works well with" — 2–3 compatible accessories/sensors
8. "Recommended by GeoSurveyHub" callout if applicable

---

## GLOSSARY TERMS (for guide.html)

Use all terms from TECH-RUNDOWN.md glossary section.
Display as a two-column grid: Term (accent) | Definition (muted body text).
Alphabetical order.
Add a sticky alphabet jump nav on the left.

---

## SEO / META NOTES

Each page needs:
- `<title>`: "[Page Topic] — GeoSurveyHub"
- `<meta name="description">`: 150 chars, include "surveying equipment", "LiDAR", "GIS"
- `<meta property="og:title">` and `og:description`
- H1 on every page (only one per page)
- All images need descriptive `alt` text

Homepage title: "GeoSurveyHub — Professional Surveying & GIS Equipment"
Guide title: "Surveying Equipment Buyer's Guide — GeoSurveyHub"
News title: "The Field Report — Surveying & GIS Industry News | GeoSurveyHub"
