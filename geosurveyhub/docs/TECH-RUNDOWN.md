# GeoSurveyHub — Technology & Equipment Rundown
# The factual backbone for all educational content on the site.
# All specifications sourced from manufacturer docs and industry publications (March 2026).
# Cursor: use this as the source of truth when writing product descriptions and guide content.

---

## THE 5 CORE TECHNOLOGIES

### 1. LiDAR (Light Detection and Ranging)
**What it is:** Laser pulses fired at a surface. The time it takes for each pulse to return
is measured (Time-of-Flight), combined with GPS/GNSS and IMU data to produce a 3D point cloud.

**Key specs to understand:**
- **Pulse Repetition Rate (PRR):** How many laser pulses per second (kHz or MHz). Higher = denser data.
- **Range:** Max distance the sensor can detect returns. Depends on surface reflectivity.
- **Accuracy:** Typically expressed as vertical RMS error (e.g., ±2cm at 100m).
- **Returns per pulse:** Single-return vs. multi-return vs. full-waveform. Multi-return sensors can
  detect multiple surfaces per pulse — critical for mapping under vegetation.
- **Field of View (FOV):** The angular sweep of the scanner per rotation.
- **Point density:** Points per square meter at a given altitude and speed.

**Types:**
- **Terrestrial Laser Scanner (TLS):** Tripod-mounted, millimeter-level accuracy, 360° scan.
  Use for: as-built documentation, structural inspection, BIM input. Range: 1m to 6km.
- **Mobile LiDAR (MLS):** Mounted on vehicle, backpack, or handheld. Scans while moving.
  Use for: corridor mapping, road surveys, urban 3D. Accuracy: 2–5cm typical.
- **Airborne LiDAR (ALS):** Mounted on drone, helicopter, or fixed-wing aircraft. High coverage rate.
  Use for: DTM, DSM, forestry, flood modeling. Accuracy: 5–15cm depending on platform and altitude.
- **SLAM LiDAR:** No GPS required. Builds a map as it moves by matching geometry.
  Use for: GPS-denied environments (tunnels, mines, indoors).

**Leading manufacturers:** RIEGL, Leica, Trimble, Velodyne/Ouster, Livox (DJI), Hesai, YellowScan

**Current top drone LiDAR systems (2026):**
- DJI Zenmuse L2 on Matrice 350 RTK: 240k pts/sec, 450m range, integrated 4/3" camera, ~$30–60K complete system
- RIEGL VUX-10025: 1.3M pts/sec, 1,500 kHz PRR, 160° FOV, 2.2kg — professional grade
- RIEGL VUX-820-G: Topo + bathymetric combo, 5.7kg, embedded GNSS/IMU, new 2025
- YellowScan Mapper+: Integrated system, popular with commercial operators, ~$60K
- Emesent GX1 (2026): SLAM + RTK + 360° imagery, GPS-denied capable

**Current top terrestrial scanners:**
- Leica RTC360: 2M pts/sec, 130m range, onboard HDR imaging
- RIEGL VZ-1200i: Up to 1,200m range, waveform processing
- RIEGL VZ-6000i-26: 6,000m range, extreme range applications
- Trimble X9: Fast, integrated, designed for BIM workflows
- Faro Focus Premium: 350m range, popular for as-built and construction

---

### 2. Photogrammetry
**What it is:** Deriving 3D measurements from overlapping 2D photographs. Software computes
the position of every pixel using a technique called Structure from Motion (SfM).

**Key concepts:**
- **Ground Control Points (GCPs):** Known coordinate targets placed in the scene to georeference the model.
- **PPK/RTK:** Post-Processed Kinematic / Real-Time Kinematic. GPS correction methods that
  can achieve survey-grade accuracy without GCPs (or with fewer).
- **GSD (Ground Sampling Distance):** The size of one pixel on the ground. Lower GSD = higher detail.
- **Overlap:** Typically 80% frontal / 60% side. More overlap = better accuracy.
- **Oblique vs nadir:** Nadir = straight down. Oblique = angled. Oblique capture is
  essential for building facade reconstruction.

**LiDAR vs Photogrammetry — when to use which:**
| Factor | LiDAR | Photogrammetry |
|---|---|---|
| Cost | $30K–$150K+ | $5K–$40K |
| Vegetation penetration | Yes (multi-return) | No |
| Accuracy | Consistent, high | Good in open terrain |
| Lighting required | No | Yes |
| Color/texture | Requires separate camera | Built-in |
| Processing speed | Faster | Slower (SfM compute-heavy) |
| Best for | Forestry, DTM, corridors | Large open areas, construction |

**Top photogrammetry cameras for drones (2026):**
- DJI Zenmuse P1: 45MP full-frame, mechanical shutter, 3-axis stabilization
- Phase One iXM-100: 100MP medium format, SimActive integration (new 2026)
- Sony ILX-LR1: 61MP, popular for fixed-wing integration
- Micasense RedEdge-P: Multispectral for agriculture/vegetation analysis

**Top photogrammetry software:**
- Pix4D Mapper / Pix4Dmatic: Industry standard, now integrates with ArcGIS
- Agisoft Metashape: Popular, flexible, good for all project types
- DJI Terra: Tightly integrated with DJI hardware
- RealityCapture (Epic/now Capturing Reality): Fastest processing, popular for large datasets
- OpenDroneMap: Free, open source

---

### 3. GNSS / RTK (Global Navigation Satellite System / Real-Time Kinematic)
**What it is:** GPS on steroids. Uses multiple satellite constellations (GPS, GLONASS,
Galileo, BeiDou) plus correction signals to achieve centimeter-level positioning.

**Key specs:**
- **RTK accuracy:** Horizontal ~8mm + 1ppm. Vertical ~15mm + 1ppm (typical high-end receivers)
- **Constellations:** More is better. Look for L1/L2/L5 multi-frequency support.
- **Initialization time:** Time to fix RTK. Fast fix = productive in the field.
- **Data link:** Radio, cellular (NTRIP), or satellite correction.
- **Tilt compensation:** IMU-based. Allows accurate measurements without leveling the rod.

**GNSS system types:**
- **Rover + Base station:** Base set up over known point, rover reads corrections via radio.
- **Network RTK (NTRIP):** Connects to VRS (Virtual Reference Station) network via cellular.
  No base required if network coverage exists.
- **PPK (Post-Processed Kinematic):** Log raw data in field, apply corrections in office.
  Useful where real-time corrections aren't available (remote areas, airspace).

**Leading products (2026):**
- Trimble R12i: Tilt compensation, ProPoint GNSS, ~$25K
- Leica GS18 I: IMU tilt compensation, up to 60° tilt, ~$22K
- Topcon HiPer HR: Dual-constellation, rugged, strong RTK network support
- Emlid Reach RS3: Affordable entry (~$3K), good for budget-conscious operations
- Septentrio AsteRx SBi3 Pro: High-end, anti-jamming/anti-spoofing, used in demanding environments

---

### 4. Total Stations (Electronic Distance Measurement)
**What it is:** Optical instrument combining theodolite (angle measurement) and EDM
(electronic distance measurement) into one unit. The original precision survey tool.

**Types:**
- **Conventional Total Station:** Manual target acquisition, operator aims at prism
- **Robotic Total Station:** Motorized, tracks a reflector autonomously. One-person operation.
- **Scanning Total Station:** Can capture thousands of points without a reflector (like a terrestrial LiDAR)
- **Video Total Station:** Integrated camera for remote field view

**Key specs:**
- Angular accuracy: expressed in arc seconds (e.g., 1", 2", 5")
- EDM range: With prism = 3,000–6,000m. Reflectorless = 50–1,000m
- Automation: ATR (Automatic Target Recognition) locks onto prism automatically

**Leading products:**
- Leica TS16: Auto-target recognition, 1" accuracy, industry benchmark
- Trimble SX12: Scanning + conventional total station in one
- Topcon GT-1003: Robotic, 0.5" accuracy, long-range EDM

---

### 5. Mobile Mapping Systems (MMS / Trucks)
**What it is:** A vehicle-mounted platform integrating multiple sensors — typically
LiDAR + cameras + GNSS/IMU — that captures 3D data while driving at normal road speeds.

**System components:**
- LiDAR scanners (typically 2–4 units for 360° coverage)
- 360° cameras or forward-facing cameras
- GNSS receiver (often dual-antenna for heading)
- IMU (high-grade tactical or navigation grade)
- Odometer / wheel encoder
- Onboard processing computer

**Applications:**
- Road condition surveys (pavement, signage, markings)
- Corridor mapping (highways, railways, pipelines)
- Urban 3D modeling
- Asset inventory (streetlights, poles, signs)
- Infrastructure inspection

**Accuracy:** 2–5cm absolute in open sky. Degrades in urban canyons or under bridges.

**Leading systems:**
- Leica Pegasus: Full mobile mapping platform
- Trimble MX9: Modular, fits various vehicle types
- RIEGL VMX-2HA: High-accuracy, used for highway mapping
- Velodyne/Ouster multi-LiDAR configurations on survey trucks

---

## PLATFORM COMPARISON

### Drone vs Truck vs Backpack vs Aircraft

| Platform | Coverage | Accuracy | Veg. Penetration | Cost/Day | Best For |
|---|---|---|---|---|---|
| Drone (multirotor) | 50–300 acres/day | 2–5cm | Yes (LiDAR) | $500–$2K | Small-mid topographic, construction |
| Drone (fixed-wing) | 500–2,000 acres/day | 3–8cm | Moderate | $1K–$4K | Large area photogrammetry |
| Mobile mapping truck | 50–200 mi corridor/day | 2–5cm | No | $3K–$10K | Roads, corridors, urban |
| Backpack SLAM | 1–5 acres/hour | 2–5cm | No | $200–$500 | Indoor, GPS-denied, complex structures |
| Helicopter LiDAR | 50–200 sq mi/day | 5–15cm | Yes | $10K–$30K | Large forested areas, regional DTM |
| Fixed-wing aircraft | 200+ sq mi/day | 5–20cm | Yes | $20K–$80K | Statewide/national mapping, utility corridor |

---

## SOFTWARE STACK

### Data Capture
- DJI Pilot 2 (DJI drones)
- Pix4Dcapture (flight planning, photogrammetry)
- DroneDeploy (commercial flight management)
- UgCS (multi-platform mission planning)

### LiDAR Processing
- RIEGL RiPROCESS (RIEGL hardware)
- DJI Terra (DJI L-series sensors)
- LP360 (GeoCue) — production LiDAR QA/QC and classification
- TerraSolid (TerraScan, TerraModeler) — airborne LiDAR standard
- CloudCompare — free, open source, powerful for analysis
- LAStools — command-line LiDAR processing, widely used

### Photogrammetry Processing
- Pix4D Mapper / Pix4Dmatic
- Agisoft Metashape
- RealityCapture (fastest, subscription)
- OpenDroneMap (free/open source)

### GIS & Deliverables
- Esri ArcGIS Pro — industry standard GIS platform
- QGIS — free, open source GIS
- Global Mapper — versatile for LiDAR + GIS combined
- AutoCAD Civil 3D — for engineering deliverables
- Bentley MicroStation / OpenRoads — transport/infrastructure

### Emerging / 2026 Trends
- Gaussian Splatting: Natively in ArcGIS, Pix4D (photorealistic 3D from images)
- AI classification: LP360, TerraSolid auto-classify ground/vegetation/buildings
- Cloud-native workflows: COG, COPC, GeoParquet, STAC for large dataset access
- Digital Surveyor (Mach9): AI-assisted CAD/GIS extraction from point clouds

---

## BUYING GUIDE DECISION TREE

### By Use Case
- **Land/boundary survey:** RTK GNSS rover + total station
- **Construction stakeout:** RTK GNSS + total station
- **Topographic mapping (open terrain):** Drone + photogrammetry or LiDAR
- **Topographic mapping (forested):** Drone LiDAR (DJI L2 or RIEGL VUX)
- **Corridor (road/rail/pipeline):** Mobile mapping truck or fixed-wing LiDAR
- **Urban 3D / city model:** Mobile mapping truck + oblique photogrammetry
- **As-built documentation:** Terrestrial LiDAR scanner (Leica RTC360, Faro Focus)
- **Underground/GPS-denied:** SLAM LiDAR (Emesent GX1, GeoSLAM)
- **Coastal/riverine:** Topo-bathy LiDAR drone (RIEGL VUX-820-G)
- **Agriculture/vegetation:** Multispectral + photogrammetry drone

### By Budget
- **Under $10K:** Emlid Reach RS3 (GNSS rover), DJI Mini + Pix4D (photogrammetry only)
- **$10K–$50K:** DJI M350 RTK + Zenmuse P1, mid-range total station, entry RTK system
- **$50K–$200K:** Full drone LiDAR system (DJI L2 complete), terrestrial scanner, mid-range MMS
- **$200K+:** Professional airborne LiDAR, RIEGL VUX-series, full mobile mapping vehicle

---

## ACCURACY REFERENCE (QUICK GUIDE)

| Technology | Typical Accuracy | Notes |
|---|---|---|
| Total Station | 1–5mm | Best absolute accuracy |
| RTK GNSS | 8mm H / 15mm V | Depends on constellation, multipath |
| PPK GNSS | 10–20mm | Good for drone georeferencing |
| Terrestrial LiDAR | 2–6mm | At close range |
| Drone LiDAR | 2–5cm | PPK/RTK processed |
| Drone Photogrammetry + GCPs | 2–5cm | Depends on GSD and GCP layout |
| Mobile LiDAR (truck) | 2–5cm | Absolute, open sky |
| Airborne LiDAR | 5–15cm | Altitude/speed dependent |
| SLAM LiDAR | 2–5cm | Relative; no absolute georeference |

---

## GLOSSARY (for the guide page)

| Term | Plain English |
|---|---|
| Point Cloud | A 3D dataset of millions of points, each with X/Y/Z coordinates |
| DTM | Digital Terrain Model — bare-earth surface (no vegetation/buildings) |
| DSM | Digital Surface Model — everything including trees and buildings |
| GCP | Ground Control Point — a marked target with known coordinates |
| RTK | Real-Time Kinematic — GPS correction applied in real time |
| PPK | Post-Processed Kinematic — GPS correction applied after collection |
| IMU | Inertial Measurement Unit — measures orientation and motion |
| GNSS | All satellite positioning systems (GPS, GLONASS, Galileo, BeiDou) |
| SLAM | Simultaneous Localization and Mapping — maps while moving, no GPS |
| FOV | Field of View — the angular range a sensor can capture |
| PRR | Pulse Repetition Rate — how many laser pulses per second |
| GSD | Ground Sampling Distance — pixel size on the ground |
| SfM | Structure from Motion — 3D reconstruction from overlapping photos |
| LAS / LAZ | Standard file formats for LiDAR point cloud data |
| NTRIP | Network correction protocol for RTK via internet |
| MLS | Mobile Laser Scanning — LiDAR mounted on a moving vehicle |
| ALS | Airborne Laser Scanning — LiDAR from aircraft or drone |
| TLS | Terrestrial Laser Scanning — tripod-mounted ground scanner |
