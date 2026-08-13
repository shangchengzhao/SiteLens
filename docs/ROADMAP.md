# SiteLens Roadmap

## Overview

Development is divided into four phases.

- **P0 — Functional verification loop**
- **P1 — Verification Lens**
- **P2 — Assisted verification**
- **P3 — Intelligent prioritization**

Each phase should have a usable end state.

Do not implement later-phase functionality simply because it may eventually be useful. Prefer completing the current verification workflow before adding intelligence or analytics.

---

# P0 — Functional Verification Loop

## Goal

Allow a user to complete an end-to-end manual review session from CSV upload to enriched CSV download.

## Required Features

### CSV import

- Upload `.csv`.
- Parse headers and rows.
- Support:
  - latitude + longitude; or
  - address.
- Allow column selection if names are not recognized automatically.
- Preserve all source columns.
- Assign or derive a stable internal record ID.

### Map

- Embed Google Maps.
- Center map on currently selected record.
- Display a visually prominent target marker.
- Geocode addresses when coordinates are not available.
- Display an actionable error state when a location cannot be resolved.

### Location queue

- Show dataset records in a persistent queue/list.
- Highlight the active record.
- Indicate review status visually.
- Allow direct selection of a record.

Suggested state indicators:

- `○` not reviewed
- `✓` verified
- `⚠` needs review
- `✕` mismatch

### Sequential navigation

Persistent controls:

- `< Previous`
- `Next >`

Requirements:

- Previous moves to the preceding reviewable row.
- Next moves to the following reviewable row.
- Current edits are saved before navigation.
- Navigation never silently discards user changes.
- First/last record states are handled cleanly.

### Verification panel

Minimum fields:

- verification status;
- verified facility type;
- verified business name;
- reviewer notes.

Suggested verification statuses:

- `verified`
- `mismatch`
- `needs_review`
- `unable_to_verify`

### Persistence

At minimum, verification state must survive normal UI navigation.

Preferred demo implementation:

- application state;
- browser persistence such as IndexedDB/localStorage, if appropriate.

A refresh should not destroy substantial completed work when technically feasible.

### CSV export

Provide a clear **Download CSV** action.

Export must contain:

- every original source column;
- every original source row;
- appended SiteLens verification fields.

Do not overwrite the user's original file.

Suggested output filename:

`<original_name>_verified.csv`

---

## P0 Definition of Done

P0 is complete when a user can:

1. upload a CSV containing 100+ locations;
2. select any row;
3. see the location on Google Maps;
4. move through records using `<` and `>`;
5. assign verification status, facility type, business name, and notes;
6. navigate away and return without losing results;
7. download an enriched CSV containing all original data and SiteLens verification fields.

No nearby-facility intelligence is required for P0.

---

# P1 — Verification Lens

## Goal

Give the reviewer immediate visual context around the target site and reduce the need to manually search for nearby relevant facilities.

## Required Features

### Nearby facility search

Use Google Places Nearby Search or an equivalent Google Places workflow to retrieve relevant locations surrounding the target.

Avoid one API request per SiteLens facility label.

Prefer combining supported Google Place Types into efficient requests and classify results after retrieval.

### Distance rings

Display configurable visual rings around the target.

Initial defaults:

- 100 m
- 250 m

Optional future radius:

- 50 m
- 500 m

### Facility taxonomy

SiteLens should maintain its own taxonomy.

#### Industrial & Logistics

- `data_center`
- `warehouse_cold`
- `warehouse_dry`
- `manufacturing`
- `heavy_industrial`

#### Large Commercial

- `wholesale_bigbox`
- `grocery`
- `retail_strip`

#### Food & Hospitality

- `restaurant`
- `hotel`

#### Institutional

- `higher_education`
- `medical`
- `institutional`

#### Office

- `office`

Google Place Types do not need to correspond one-to-one with these labels.

### Facility markers

Nearby facilities should:

- be visually distinct from the target;
- use category-level visual encoding;
- show distance from target;
- show business/place name when available;
- show SiteLens category/subtype.

### Filter chips

Suggested controls:

- All
- Industrial
- Logistics
- Retail
- Food
- Hotel
- Medical
- Education
- Institutional
- Office

### Nearby summary

Show a concise summary such as:

> Within 250 m · 3 industrial/logistics · 2 retail · 1 institutional

### Satellite imagery

Provide easy access to satellite mode.

The reviewer should not need to navigate away from SiteLens to inspect the target.

### Street View

Integrate Street View where available.

Expected behavior:

- selecting a target should attempt to show nearby Street View;
- selecting a nearby facility may update Street View to that facility;
- absence of Street View should produce a normal empty/unavailable state.

### Keyboard navigation

Suggested shortcuts:

- `←` previous
- `→` next

Optional status shortcuts:

- `1` verified
- `2` needs review
- `3` mismatch
- `4` unable to verify

Do not use shortcuts that interfere with typing in notes or form controls.

---

## P1 Definition of Done

P1 is complete when a reviewer can:

1. select a target record;
2. immediately see nearby relevant facilities on the same map;
3. understand facility categories and distances;
4. filter facility families;
5. inspect satellite imagery;
6. inspect Street View where available;
7. record a verification decision and move to the next location without leaving the application.

---

# P2 — Assisted Verification

## Goal

Help reviewers detect disagreement and focus attention without replacing human judgment.

## Candidate Features

### Mismatch detection

Compare:

- source facility/business information;
- Google business/place information;
- SiteLens mapped facility category;
- reviewer-confirmed result.

Highlight likely disagreement.

Example:

```text
Possible mismatch

Source:
XYZ Restaurant

Nearby/target evidence:
ABC Manufacturing
SiteLens category: manufacturing
```

### Suggested facility classification

Use:

- Google Place Types;
- business name;
- available place metadata;
- keyword/rule logic;
- potentially an ML/LLM classifier later.

Always label this as a suggestion, not verified truth.

### Evidence summary

Create a compact evidence card including:

- target address;
- target coordinate;
- candidate business name;
- candidate facility type;
- nearby facility summary;
- relevant distances;
- Street View availability;
- reviewer result.

### Flagged-record workflow

Add filters such as:

- all;
- unreviewed;
- verified;
- mismatch;
- needs review;
- unable to verify.

Provide a dedicated pass for flagged records.

### Surrounding composition

Optionally summarize nearby relevant facilities by broad family.

Avoid presenting this as authoritative land-use classification.

Use wording such as:

**Nearby facility composition**

---

## P2 Definition of Done

P2 is complete when the application can surface likely inconsistencies and suggested classifications in a way that demonstrably reduces manual review effort while keeping the reviewer in control.

---

# P3 — Intelligent Prioritization

## Goal

Help users decide **which records should be reviewed first**.

## Candidate Features

### Verification priority score

Rank records using signals such as:

- low-confidence geocoding;
- no matching Google Place;
- conflicting business names;
- conflicting facility categories;
- unusually dense or ambiguous nearby facilities;
- multiple plausible target businesses;
- previous reviewer flags.

### Anomaly queue

Allow sorting by:

- highest likely mismatch;
- lowest confidence;
- unreviewed;
- flagged;
- dataset order.

### Semi-automated classification

Potentially suggest classifications at scale before human review.

Requirements:

- predictions must include confidence/evidence;
- reviewer can override;
- raw model output must not overwrite source data.

### Review analytics

Possible dashboard metrics:

- total reviewed;
- verified;
- mismatch;
- needs review;
- unable to verify;
- average review progress;
- facility-category counts.

Analytics are secondary to the verification workflow.

---

## P3 Definition of Done

P3 is complete when SiteLens can meaningfully reduce the number of records that require equal manual attention by ranking uncertainty or likely mismatch while preserving transparent human verification.

---

# Cross-Phase Rules

Across all phases:

- preserve original input data;
- maintain stable record identity;
- keep Previous/Next navigation prominent;
- save before changing records;
- distinguish target from nearby facilities;
- make API errors recoverable;
- do not add building-floor-area functionality unless explicitly reintroduced;
- avoid redundant Google API calls;
- document any new output fields in `DATA_MODEL.md`.
