# GeoSurveyHub — Financing Form Specification
# pages/financing.html + assets/js/financing.js

---

## PURPOSE

This form connects users interested in surveying/GIS equipment with financing
partners and educational resources. GeoSurveyHub does NOT sell equipment.
The form is a lead qualification tool, not a purchase flow.

User message to convey clearly on this page:
  "We're an educational resource. We don't sell equipment directly.
   But if you've done your research here and you're ready to move forward,
   we can connect you with financing options. Tell us what you're looking at."

---

## PAGE STRUCTURE

### Breadcrumb
Home › Equipment Financing

### Hero (full viewport, terrain SVG background)
- Kicker: "Take the Next Step"
- H1: "Equipment Financing — Let's Talk"
- Subtext: "We don't sell equipment directly — but after doing your research
   here, if you're ready to move forward, we connect interested buyers with
   financing partners who specialize in geospatial equipment."
- Side text: "Connect with Partners"
- Hero stats (3 boxes below):
    □ "2 business days" — typical response time
    □ "$5K–$500K+" — typical financing range
    □ "Zero commitment" — submitting interest is free

### Trust Signals Band (between hero and form)
Four icons with labels:
  - Lock icon: "Your information is confidential"
  - Handshake icon: "No sales pressure, ever"
  - Education icon: "This is an educational site"
  - Clock icon: "Response within 2 business days"

### Form Section
Header:
  - Section number: 01
  - Kicker: "Your Details"
  - H2: "Tell us about yourself and your project"

The form div has two-column layout on desktop (4-column grid for field labels).

### After-Form Section (below form, always visible)
- H3: "Not sure what you need yet?"
- Link to guide.html quiz
- Link to lidar.html, drones.html, gnss-rtk.html

### Footer (standard site footer)

---

## FORM FIELDS — COMPLETE SPECIFICATION

### GROUP 1: About You
Field: full_name
  Label: Full Name
  Type: text input
  Required: yes
  Placeholder: "Jane Smith"
  Validation: min 2 chars, max 80 chars

Field: email
  Label: Email Address
  Type: email input
  Required: yes
  Placeholder: "jane@company.com"
  Validation: valid email format

Field: phone
  Label: Phone Number
  Type: tel input
  Required: no
  Placeholder: "(555) 000-0000"
  Validation: optional, if provided must be valid US/intl phone

Field: company
  Label: Company / Organization
  Type: text input
  Required: no
  Placeholder: "Smith Engineering LLC"

Field: job_title
  Label: Job Title / Role
  Type: text input
  Required: no
  Placeholder: "Licensed Land Surveyor"

Field: state
  Label: State / Region
  Type: select
  Required: yes
  Options: Alabama, Alaska, Arizona, Arkansas, California, Colorado,
    Connecticut, Delaware, Florida, Georgia, Hawaii, Idaho, Illinois,
    Indiana, Iowa, Kansas, Kentucky, Louisiana, Maine, Maryland,
    Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana,
    Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York,
    North Carolina, North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania,
    Rhode Island, South Carolina, South Dakota, Tennessee, Texas, Utah,
    Vermont, Virginia, Washington, West Virginia, Wisconsin, Wyoming,
    International

### GROUP 2: Your Project
Field: project_type
  Label: Primary Project Type
  Type: select
  Required: yes
  Options:
    "" → "Select a project type..."
    "land-boundary" → "Land / Property Boundary Survey"
    "construction" → "Construction Site Survey"
    "corridor" → "Corridor Mapping (Road / Rail / Pipeline)"
    "forestry" → "Forestry / Vegetation Management"
    "urban" → "Urban / City 3D Mapping"
    "mining" → "Mining / Quarry Survey"
    "environmental" → "Environmental / Flood / Coastal"
    "infrastructure" → "Infrastructure Inspection"
    "underground" → "Underground / Utility Detection"
    "other" → "Other / Multiple Types"

Field: project_scale
  Label: Typical Project Scale
  Type: select
  Required: no
  Options:
    "" → "Select a scale..."
    "under-10" → "Under 10 acres"
    "10-500" → "10 – 500 acres"
    "500-plus" → "500+ acres"
    "corridor" → "Linear corridor (road / pipeline / rail)"
    "regional" → "Regional / multi-county"
    "ongoing" → "Multiple ongoing projects"

Field: timeline
  Label: Purchase Timeline
  Type: select
  Required: no
  Options:
    "" → "Select a timeline..."
    "immediate" → "Immediate — within 30 days"
    "1-3mo" → "1 – 3 months"
    "3-6mo" → "3 – 6 months"
    "6plus" → "6+ months / planning phase"

### GROUP 3: Equipment Interest
Field: equipment_categories
  Label: Equipment Categories of Interest
  Type: multi-checkbox
  Required: yes (at least one)
  Options:
    lidar_systems → "LiDAR Systems (terrestrial, drone, airborne)"
    survey_drones → "Survey Drones & UAV Platforms"
    gnss_rtk → "GNSS / RTK Receivers"
    total_stations → "Total Stations"
    terrestrial_scanners → "Terrestrial Laser Scanners"
    mobile_mapping → "Mobile Mapping Systems"
    field_computers → "Field Computers & Data Collectors"
    sensors_cameras → "Sensors & Camera Payloads"
    software → "GIS / Processing Software"

Field: budget_range
  Label: Estimated Budget Range
  Type: select
  Required: yes
  Options:
    "" → "Select a range..."
    "under-10k" → "Under $10,000"
    "10k-50k" → "$10,000 – $50,000"
    "50k-200k" → "$50,000 – $200,000"
    "200k-500k" → "$200,000 – $500,000"
    "500k-plus" → "$500,000+"
    "unsure" → "Not sure yet"

Field: specific_equipment
  Label: Specific Equipment in Mind (optional)
  Type: textarea
  Required: no
  Placeholder: "e.g. DJI Matrice 350 RTK + Zenmuse L2, or RIEGL VUX-10025 system"
  Rows: 3

Field: notes
  Label: Additional Notes
  Type: textarea
  Required: no
  Placeholder: "Anything else you'd like us to know about your project or requirements"
  Rows: 4

### GROUP 4: Consent
Field: consent_contact
  Label: I agree to be contacted by GeoSurveyHub and financing partner referrals
         regarding my equipment interest.
  Type: checkbox
  Required: yes

Field: consent_educational
  Label: I understand GeoSurveyHub is an educational resource, not a direct
         equipment retailer or financing provider.
  Type: checkbox
  Required: yes

---

## SUBMIT BUTTON
Text: "Submit My Interest"
Style: btn btn-primary full width
State: disabled until both consent boxes are checked
Loading state: "Submitting..." with spinner

---

## VALIDATION RULES (financing.js)

Required fields: full_name, email, state, project_type, equipment_categories
  (at least 1), budget_range, consent_contact, consent_educational

On invalid submit:
  - Scroll to first invalid field
  - Add class 'field-error' to field wrapper (applies border-color: var(--accent))
  - Show inline error message below field in accent color
  - Focus first invalid field

On valid submit:
  - Show loading state on button
  - POST to FORM_ENDPOINT (Formspree or Netlify Forms)
  - On success: animate form out, show success panel in same container
  - On network error: show error message, keep form filled

Success message:
```html
<div class="success-panel">
  <div class="success-icon"><!-- checkmark SVG --></div>
  <h2>Thank you, <span id="success-name">[Name]</span>.</h2>
  <p>We've received your interest in [equipment categories].
     Our team will be in touch within 2 business days to discuss
     your options and connect you with the right financing partners.</p>
  <div class="success-actions">
    <a href="guide.html" class="read-more">Continue exploring the guide →</a>
    <a href="index.html" class="read-more">Back to home →</a>
  </div>
</div>
```

---

## STYLING SPEC

Form container:
  background: var(--surface)
  border: 1px solid var(--border)
  border-radius: 4px
  padding: 48px 56px
  max-width: 900px
  margin: 0 auto

Form layout:
  Two-column grid on desktop: grid-template-columns: 1fr 1fr; gap: 24px
  Full-width fields: specific_equipment, notes, equipment_categories, consent boxes
  Single column on mobile

Field wrapper (.field-group):
  display: flex
  flex-direction: column
  gap: 8px
  margin-bottom: 4px

Labels:
  font-family: Barlow Condensed
  font-size: 11px
  font-weight: 600
  letter-spacing: 3px
  text-transform: uppercase
  color: var(--muted)

Required asterisk:
  color: var(--accent)
  margin-left: 4px

Input / Select / Textarea:
  background: var(--surface2)
  border: 1px solid var(--border)
  color: var(--white)
  font-family: Barlow, sans-serif
  font-size: 15px
  font-weight: 300
  padding: 14px 18px
  border-radius: 2px
  width: 100%
  transition: border-color 0.2s

Input:focus / Select:focus / Textarea:focus:
  border-color: var(--accent)
  outline: none

Input.field-error / etc:
  border-color: var(--accent)

Select:
  appearance: none
  background-image: url("data:image/svg+xml,...") (chevron down in --muted)
  background-repeat: no-repeat
  background-position: right 16px center

Checkboxes (custom styled):
  Hide native input, use custom div
  Unchecked: 18px square, border 1px solid var(--border-mid), bg var(--surface2)
  Checked: border var(--accent), bg var(--accent-glow), checkmark SVG in accent
  Label: Barlow 14px weight 300, color var(--muted), cursor pointer

Section dividers within form:
  padding-top: 32px
  border-top: 1px solid var(--border)
  margin-top: 32px

Section group labels (GROUP 1/2/3/4 headers):
  font-family: Barlow Condensed
  font-size: 10px
  letter-spacing: 4px
  text-transform: uppercase
  color: var(--accent)
  margin-bottom: 20px

---

## FORMSPREE SETUP (for static deployment)

1. Create free account at formspree.io
2. Create new form, get endpoint URL
3. Replace in financing.js:
   const FORM_ENDPOINT = 'https://formspree.io/f/YOUR_ID_HERE';

Formspree will:
- Receive form submissions
- Send email notification to configured address
- Provide submission dashboard
- Handle spam filtering

For Netlify deployment, use Netlify Forms instead:
  Add netlify attribute to div.financing-form: data-netlify="true"
  (Financing.js has a Netlify detection flag)

---

## ACCESSIBILITY

- All inputs associated with labels via for/id pairs
- Required fields have aria-required="true"
- Error messages have role="alert" and aria-live="polite"
- Submit button has aria-disabled when disabled
- Focus management: on error, focus moves to first invalid field
- On success, focus moves to success panel h2
- Keyboard navigation through all fields and checkboxes
