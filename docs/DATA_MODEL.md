# SiteLens Data Model

## Purpose

This document defines how SiteLens reads uploaded geographic data, stores verification state, and exports enriched CSV files.

The central rule is:

> **Preserve the user's source data and append verification results.**

Do not silently rewrite or delete original values.

---

# Input CSV

## Required Location Information

Each row must contain one of the following location representations.

### Option A — Coordinates

Required:

- latitude
- longitude

Examples of recognizable column names may include:

```text
latitude
lat
y
longitude
lon
lng
long
x
```

Automatic detection may be implemented, but the user must be able to manually select columns if detection fails.

### Option B — Address

A geocodable address field.

Examples:

```text
address
street_address
full_address
location
```

If both coordinates and address exist, prefer valid coordinates as the primary map location unless product requirements later specify otherwise.

The address remains useful as evidence/context.

---

# Optional Source Fields

Common optional columns may include:

```text
id
facility_id
business_name
facility_type
name
city
state
postal_code
country
```

SiteLens must support arbitrary additional user columns.

Unknown columns should be preserved without interpretation.

---

# Internal Record Identity

Each row needs a stable internal ID.

Preferred order:

1. use a user-provided unique ID column if explicitly selected/recognized and unique;
2. otherwise create a SiteLens internal ID based on row position or UUID.

Do not require the internal ID to be exported unless necessary.

Dataset row order should remain stable unless the user explicitly sorts/filters the view.

---

# Source vs Verification Fields

SiteLens should conceptually separate:

```text
source data
    +
Google/map evidence
    +
reviewer verification
```

Google evidence is not automatically equivalent to reviewer verification.

---

# Core Verification Fields

Recommended exported columns:

```text
sitelens_verification_status
sitelens_verified_facility_type
sitelens_verified_business_name
sitelens_reviewer_notes
sitelens_verified_at
```

The `sitelens_` prefix is recommended to reduce collisions with source columns.

---

# Verification Status

Allowed values:

```text
verified
mismatch
needs_review
unable_to_verify
```

Unreviewed rows should generally use blank/null rather than inventing a fifth result unless implementation benefits from:

```text
not_reviewed
```

If `not_reviewed` is used internally, decide explicitly whether it should be written to CSV.

---

# Verified Facility Type

Use a stable machine-readable taxonomy.

## Industrial & Logistics

```text
data_center
warehouse_cold
warehouse_dry
manufacturing
heavy_industrial
```

## Large Commercial

```text
wholesale_bigbox
grocery
retail_strip
```

## Food & Hospitality

```text
restaurant
hotel
```

## Institutional

```text
higher_education
medical
institutional
```

## Office

```text
office
```

Recommended additional values:

```text
other
unknown
```

Do not use Google raw place-type strings directly as verified SiteLens facility types unless they happen to match the SiteLens taxonomy by documented mapping.

---

# Verified Business Name

Column:

```text
sitelens_verified_business_name
```

This field represents the reviewer's accepted/entered business name.

It may be:

- copied from a Google Place result;
- copied from source data;
- manually entered;
- blank if unknown.

---

# Reviewer Notes

Column:

```text
sitelens_reviewer_notes
```

Free text.

Examples:

```text
Google listing appears outdated; satellite imagery shows warehouse use.
```

```text
Multiple tenants at this address; unable to determine primary occupant.
```

---

# Verification Timestamp

Column:

```text
sitelens_verified_at
```

Use ISO 8601.

Example:

```text
2026-08-12T21:30:00-07:00
```

Update policy should be explicit.

Recommended behavior:

- update when verification status or verified fields materially change;
- do not update merely because the record is opened.

---

# Corrected Location Fields

Not required for earliest P0, but recommended if users may correct locations.

Potential fields:

```text
sitelens_corrected_latitude
sitelens_corrected_longitude
sitelens_corrected_address
```

Never overwrite original coordinates/address.

Blank means no correction was recorded.

---

# Google Evidence Fields

These are optional and should not be confused with reviewer verification.

Potential fields:

```text
sitelens_google_place_id
sitelens_google_place_name
sitelens_google_place_types
```

Only export these if useful to the workflow.

Do not unnecessarily expand CSV output with every Google response field.

---

# Nearby Facility Fields

P1 may append concise contextual fields.

Recommended:

```text
sitelens_nearest_relevant_facility_name
sitelens_nearest_relevant_facility_type
sitelens_nearest_relevant_facility_distance_m
```

Optional summaries:

```text
sitelens_facilities_within_100m
sitelens_facilities_within_250m
```

If storing multi-value summaries in CSV, use a documented encoding.

Example:

```text
manufacturing:2|warehouse_dry:1|restaurant:3
```

Do not store large raw API responses inside CSV cells.

---

# Suggested Export Schema

Example input:

```csv
id,address,latitude,longitude,source_type
001,500 Industrial Way,34.123,-118.456,warehouse
```

Example enriched output:

```csv
id,address,latitude,longitude,source_type,sitelens_verification_status,sitelens_verified_facility_type,sitelens_verified_business_name,sitelens_reviewer_notes,sitelens_verified_at
001,500 Industrial Way,34.123,-118.456,warehouse,verified,warehouse_dry,ABC Logistics,,2026-08-12T21:30:00-07:00
```

---

# In-Memory Record Model

A conceptual application object may resemble:

```json
{
  "internalId": "row-001",
  "source": {
    "id": "001",
    "address": "500 Industrial Way",
    "latitude": 34.123,
    "longitude": -118.456,
    "source_type": "warehouse"
  },
  "resolvedLocation": {
    "latitude": 34.123,
    "longitude": -118.456,
    "method": "source_coordinates"
  },
  "verification": {
    "status": "verified",
    "facilityType": "warehouse_dry",
    "businessName": "ABC Logistics",
    "notes": "",
    "verifiedAt": "2026-08-12T21:30:00-07:00"
  }
}
```

Google/Places evidence should preferably be stored separately from reviewer verification.

---

# Persistence

For an MVP/demo:

- preserve current review state in application state;
- persist to browser storage where practical;
- keep the uploaded dataset and verification state associated;
- avoid accidental data loss on refresh.

For production, a server-backed project/session model may replace or supplement local persistence.

---

# CSV Round-Trip Rules

Export must:

1. preserve every source row;
2. preserve every source column;
3. preserve source values exactly where technically feasible;
4. append SiteLens columns;
5. include unreviewed rows;
6. never require Google data to exist;
7. produce a valid CSV;
8. avoid destructive changes to the original file.

Suggested filename:

```text
<source_file_stem>_verified.csv
```

---

# Missing Values

Use blank/null values for unknown optional fields.

Do not use placeholders such as:

```text
N/A
unknown
none
```

unless that value has explicit semantic meaning.

For facility classification, `unknown` may be valid because it is an explicit reviewer determination.

---

# Out of Scope

Do not add fields for:

- building square footage;
- floor area;
- inferred building stories;
- parcel ownership;

unless the product scope is explicitly expanded later.
