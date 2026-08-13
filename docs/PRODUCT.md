# SiteLens Product Specification

## Product Summary

**SiteLens** is a map-based workspace for efficiently verifying geographic and facility data.

Users upload a CSV containing addresses or geographic coordinates. SiteLens locates each record on an interactive Google Map, highlights the target site, shows relevant surrounding facilities, and provides satellite imagery, Street View, nearby business information, and structured verification controls.

Reviewers move sequentially through records, determine what occupies the target site and what facilities are nearby, record a verification result, add business or facility information when useful, and download an enriched version of the original CSV.

---

## Problem

Manual geographic verification is repetitive and fragmented.

A reviewer often needs to:

1. copy an address or coordinate from a dataset;
2. search for the location in Google Maps;
3. switch to satellite imagery;
4. inspect Street View;
5. inspect nearby businesses or facilities;
6. determine whether the target record is correct;
7. record the result somewhere else;
8. return to the dataset;
9. repeat for the next location.

This workflow creates unnecessary context switching and makes large-scale verification slow and error-prone.

SiteLens consolidates these actions into one review interface.

---

## Primary User

The primary user is a reviewer processing a structured geographic dataset who needs to manually verify locations and facility context.

Typical tasks include:

- confirming that a coordinate or address points to the intended site;
- determining what business occupies the target location;
- classifying the target facility;
- identifying relevant industrial, commercial, institutional, or office facilities nearby;
- flagging a mismatch between source data and visible evidence;
- preserving a repeatable record of the verification decision.

---

## Core Workflow

```text
Upload CSV
    ↓
Parse locations
    ↓
Select a record
    ↓
Locate target on Google Maps
    ↓
Inspect target site
    ↓
Inspect nearby relevant facilities
    ↓
Use map / satellite / Street View / place data as evidence
    ↓
Record verification result
    ↓
Previous / Next
    ↓
Repeat
    ↓
Download enriched CSV
```

---

## Core Questions SiteLens Should Help Answer

For each target record:

1. **Is this the correct location?**
2. **What business or facility appears to occupy the target site?**
3. **What type of facility is it?**
4. **What relevant facilities are located nearby?**
5. **Does visible/map-based evidence agree with the source record?**
6. **Should the record be verified, flagged, or reviewed further?**

---

## Product Principles

### 1. Human verification first

SiteLens is a decision-support tool.

Google Maps, Places, Street View, automated facility mapping, and future classification systems provide evidence. The human reviewer remains responsible for the verification decision.

---

### 2. Minimize clicks per record

The product should optimize the repeated workflow:

**inspect → decide → next**

Previous/Next controls, keyboard shortcuts, persistent map context, and automatic saving should reduce navigation overhead.

---

### 3. Distinguish target evidence from surrounding context

The interface must clearly separate:

- **What is this target site?**
- **What is near this target site?**

The target facility classification belongs in the verification panel.

Nearby facilities belong in the Verification Lens / map context.

---

### 4. Preserve source data

The uploaded CSV is the source table.

SiteLens should:

- preserve all original columns;
- preserve row identity/order where possible;
- append verification fields;
- avoid silently changing source values.

Corrections should be written to explicit new fields.

---

### 5. Visual evidence should dominate the workflow

The interface should prioritize:

- exact target location;
- nearby facility markers;
- satellite imagery;
- Street View;
- distances;
- concise business/facility metadata.

The product should not become a form-heavy data-entry application.

---

### 6. Missing evidence is expected

Google data will sometimes be incomplete.

A valid product state includes:

- no Street View;
- no matching Place;
- ambiguous businesses;
- failed geocoding;
- unclear facility type;
- multiple businesses at one site.

The reviewer must be able to mark such records as requiring further review.

---

## Facility Scope

SiteLens is particularly interested in the following facility families.

### Industrial & Logistics

Examples:

- data center
- cold storage
- dry warehouse
- manufacturing
- heavy industrial

### Large Commercial

Examples:

- wholesale / big-box
- grocery
- retail strip

### Food & Hospitality

Examples:

- restaurant
- hotel

### Institutional

Examples:

- higher education
- medical
- institutional / civic

### Office

Examples:

- office

The product may display other nearby businesses, but these categories receive priority in the Verification Lens.

---

## Explicitly Out of Scope for Current MVP

The current product should not attempt to provide:

- authoritative building floor area;
- building square-footage estimation;
- parcel ownership;
- automated final ground-truth determination;
- fully autonomous facility classification;
- complex geospatial analytics unrelated to verification;
- route planning;
- consumer local-search recommendations.

These can be reconsidered later.

---

## Success Criteria

A successful SiteLens workflow should allow a user to:

- upload a geographic dataset;
- review locations sequentially without leaving the application;
- understand the exact target and its immediate facility context;
- record a structured verification decision;
- resume review without losing progress;
- download the original dataset with verification results appended.

The key measure of product value is not map complexity. It is **how much faster and more consistent manual geographic verification becomes**.
