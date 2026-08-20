# AGENTS.md

## Purpose

This repository contains **SiteLens**, a map-based workspace for manually verifying geographic and facility data.

The product is designed for workflows where a reviewer receives a dataset of locations and needs to quickly determine:

- whether the location is correct;
- what business or facility occupies the target site;
- what relevant facilities are located on or near the target site;
- whether the record should be verified, flagged as a mismatch, or reviewed further.

The primary interaction pattern is:

**Upload CSV → select location → inspect target and surroundings → record verification result → move to Previous/Next location → download enriched CSV.**

SiteLens assists human verification. It does **not** attempt to automatically determine ground truth.

---

## Read These Documents Before Making Major Changes

Read the following documents in this order:

1. [`docs/PRODUCT.md`](docs/PRODUCT.md) — product goals, users, workflow, and product principles.
2. [`docs/ROADMAP.md`](docs/ROADMAP.md) — P0–P3 scope and definitions of done.
3. [`docs/UX_SPEC.md`](docs/UX_SPEC.md) — required layout and interaction behavior.
4. [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — CSV input/output contract and verification fields.
5. [`docs/GOOGLE_MAPS.md`](docs/GOOGLE_MAPS.md) — Google Maps, Places, Geocoding, and Street View integration rules.

When these documents conflict, use the following priority:

1. explicit user instruction;
2. `ROADMAP.md` for implementation scope;
3. `UX_SPEC.md` for interaction behavior;
4. `DATA_MODEL.md` for data contracts;
5. `GOOGLE_MAPS.md` for Google integration behavior;
6. `PRODUCT.md` for general product intent.

---

## Implementation Priority

Development is organized into four phases:

- **P0 — Functional verification loop**
- **P1 — Verification Lens**
- **P2 — Assisted verification**
- **P3 — Intelligent prioritization**

Implement only the currently requested phase unless explicitly instructed otherwise.

Do not introduce P2 or P3 systems while working on P0/P1 unless the change is necessary to avoid a major architectural dead end.

---

## Core Product Constraints

The following behaviors are non-negotiable unless explicitly changed:

- The user must be able to upload a CSV containing either:
  - latitude + longitude, or
  - an address.
- Original uploaded columns must be preserved.
- Verification fields must be appended rather than replacing user data.
- Each uploaded row is treated as one reviewable location record.
- The target location must remain visually distinct from surrounding facilities.
- A visible **Previous `<`** and **Next `>`** control must allow sequential review.
- Moving to another record must not silently discard verification work.
- Verification results must persist during the session.
- The user must be able to download an enriched CSV containing original data plus verification results.
- Floor-area or building-square-footage estimation is **out of scope for the current product**.
- SiteLens facility categories are not required to match Google Place Types one-to-one.
- Google Places data should be treated as evidence for human review, not as unquestionable ground truth.

---

## Facility Categories

SiteLens focuses on the following broad facility families:

### Industrial & Logistics

- data center
- cold storage
- dry warehouse
- manufacturing
- heavy industrial

### Large Commercial

- wholesale / big-box
- grocery
- retail strip

### Food & Hospitality

- restaurant
- hotel

### Institutional

- higher education
- medical
- institutional / civic

### Office

- office

The internal labels may differ from the user's original source labels as long as the mapping is documented and consistent.

---

## Engineering Expectations

When implementing features:

- prefer simple, inspectable logic over unnecessary abstraction;
- keep map state and verification state clearly separated;
- avoid destructive mutation of uploaded source data;
- preserve stable record IDs whenever possible;
- make asynchronous API states visible to the user;
- handle missing Google data gracefully;
- do not assume every address geocodes successfully;
- do not assume every place has Street View;
- do not assume Google Places returns the exact facility classification needed by SiteLens;
- cache or reuse API results where practical to reduce cost and redundant requests.

---

## Before Completing a Task

Confirm that:

- the requested roadmap phase remains in scope;
- the app still supports sequential Previous/Next review;
- verification changes persist;
- CSV export preserves source columns;
- map/API errors have a recoverable UI state;
- no API keys or secrets are committed;
- API calls do not unnecessarily multiply per facility category;
- new verification fields are documented in `DATA_MODEL.md`.

If you introduce a significant product or data-model decision, update the relevant specification document in the same change.

## Bottom line
- Don't delete any files
- If you are not clear about the plan, verify with the user