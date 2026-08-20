# SiteLens UX Specification

## UX Goal

The interface should optimize a repetitive human verification workflow:

**inspect → decide → next**

The reviewer should rarely need to leave the application.

---

# Primary Layout

Use a three-panel verification workspace.

```text
┌───────────────────────────────────────────────────────────────────────────────┐
│ SiteLens      Dataset.csv       128 / 2,431      ⚠ 37      ↓ Download CSV   │
├────────────────┬──────────────────────────────────────┬───────────────────────┤
│ LOCATION QUEUE │ MAP / VERIFICATION LENS              │ TARGET DETAILS        │
│                │                                      │                       │
│ ✓ 124          │ [All][Industrial][Retail][Medical]  │ 550 Logistics Pkwy    │
│ ✓ 125          │                                      │ Los Angeles, CA       │
│ ⚠ 126          │              250 m                   │                       │
│ ✓ 127          │        ┌──────────────────┐          │ BUSINESS              │
│                │        │       100 m      │          │ ABC Logistics         │
│ → 128          │        │      ┌─────┐     │          │                       │
│                │        │      │  ◎  │     │          │ FACILITY TYPE         │
│ ○ 129          │        │      │TARGET│    │          │ Dry Warehouse ▾       │
│ ○ 130          │        │      └─────┘     │          │                       │
│ ○ 131          │        │   📦      🏥     │          │ STATUS                │
│                │        └──────────────────┘          │ Verified ▾            │
│                │                                      │                       │
│                │ 📦 2  🏭 1  🛒 3  🏥 1             │ NOTES                 │
│                │                                      │ ____________________  │
├────────────────┴────────────────────┬─────────────────┴───────────────────────┤
│ SATELLITE                           │ STREET VIEW                             │
├────────────────────────────────────┴─────────────────────────────────────────┤
│ ‹ Previous        ✕ Mismatch   ✓ Verify   ⚠ Needs Review          Next ›    │
└───────────────────────────────────────────────────────────────────────────────┘
```

Exact styling may change, but the information architecture should remain recognizable.

---

# Global Header

The header should show:

- product name;
- uploaded dataset name;
- review progress;
- flagged/mismatch count when available;
- filters when useful;
- **Download CSV**.

Example:

```text
SiteLens   facilities.csv   128 / 2,431 reviewed   ⚠ 37 flagged   Download CSV
```

The download control must remain easy to find.

---

# Location Queue

## Purpose

Provide:

- dataset orientation;
- direct record selection;
- review progress;
- visual status.

## Record state

Suggested display:

- `○` not reviewed
- `✓` verified
- `⚠` needs review
- `✕` mismatch
- `?` unable to verify

The current record should have an additional selection treatment such as:

- arrow;
- highlighted row;
- bold label;
- border.

Example:

```text
✓ 124  1515 Industrial Rd
✓ 125  8877 Commerce Way
⚠ 126  201 University Ave
✓ 127  4000 Market St
→ 128  550 Logistics Pkwy
○ 129  900 Main St
○ 130  1120 Harbor Blvd
```

## Queue behavior

- Selecting a row saves current edits first.
- Selecting a row updates all target-specific map/details content.
- The current row should scroll into view automatically when navigating sequentially.
- Queue filtering must not mutate dataset order.
- Returning to an already-reviewed row must restore its prior result.

---

# Previous / Next Navigation

This is a core interaction, not a secondary convenience.

Persistent controls:

```text
‹ Previous                                      Next ›
```

Requirements:

- controls remain visible during review;
- disabled state at dataset boundaries;
- navigation saves current verification first;
- navigation updates map, details, and queue selection together;
- navigation should feel instantaneous when cached data exists.

Recommended keyboard shortcuts:

- `←` previous
- `→` next

Arrow shortcuts should be disabled while focus is inside text inputs or textareas.

---

# Verification Action Bar

Suggested persistent actions:

```text
‹ Previous     ✕ Mismatch     ✓ Verify     ⚠ Needs Review     Next ›
```

Possible fourth state:

```text
? Unable to verify
```

Buttons should:

- visibly update the current record status;
- not automatically advance unless explicitly designed/configured;
- remain distinct from facility classification controls.

Recommended behavior for MVP:

1. reviewer sets status;
2. result saves immediately;
3. reviewer presses Next.

An optional future setting may combine **Verify + Next**.

---

# Map / Verification Lens

## Target marker

The target must always have the strongest visual priority.

Requirements:

- unique marker/icon;
- visually distinguishable from nearby facility markers;
- target remains centered or clearly visible when switching records;
- opening facility details must not cause the reviewer to lose the target.

Suggested label:

**TARGET**

---

## Distance rings

P1 should show:

- 100 m
- 250 m

Distance rings should be subtle enough not to obscure satellite/map details.

They provide visual context, not survey-grade measurement.

---

## Nearby facility markers

Nearby markers should encode broad facility family.

Recommended broad groups:

- Industrial & Logistics
- Large Commercial
- Food & Hospitality
- Institutional
- Office
- Other

Do not attempt to assign a unique highly saturated visual style to every subtype.

Detailed subtype appears in marker details.

Example marker card:

```text
ABC Distribution Center
Dry warehouse
75 m from target
Google Places result
```

---

# Facility Filters

Suggested chip row:

```text
All | Industrial | Logistics | Retail | Food | Hotel | Medical | Education | Institutional | Office
```

Behavior:

- `All` is default;
- filters affect surrounding facility markers only;
- filters must never hide the target;
- multiple selection may be added later if useful;
- filtering must not trigger unnecessary duplicate API calls when existing results can be filtered client-side.

---

# Nearby Facility Summary

Show a concise summary such as:

```text
Within 250 m
Industrial/Logistics: 3
Retail: 2
Institutional: 1
Other: 4
```

Or compact:

```text
250 m · 🏭 3 · 🛒 2 · 🏥 1 · Other 4
```

Do not represent the summary as formal land-use classification.

Preferred wording:

**Nearby facilities**

or

**Nearby facility composition**

---

# Target Details Panel

This panel answers:

**What is this target site?**

It should be visually and conceptually separate from the nearby facility layer.

**Implementation note:** source and verification fields are merged into a single editable panel
rather than two separate read-only/editable sections. Address and coordinates are pre-filled
from source and shown editable or locked depending on which one determined the resolved
location (see `DATA_MODEL.md` → "Verified Address & Coordinates"); business name and EUI
category are pre-filled from source when available and always editable.

Recommended fields:

- address (editable unless it determined the resolved location; flagged if it conflicts with
  the source coordinate);
- latitude/longitude (editable unless they determined the resolved location);
- business name, pre-filled from source if present, editable;
- EUI category (formerly "facility type"), pre-filled from source if it matches a known
  category, editable;
- verification status;
- reviewer notes.

## Evidence

Optional Google evidence:

- candidate Google place/business;
- Google Place Types;
- distance between source coordinate and candidate;
- Street View availability.

Do not automatically overwrite verification fields with Google evidence.

---

# Facility Type Selector

Recommended SiteLens categories:

## Industrial & Logistics

- Data center
- Cold storage
- Dry warehouse
- Manufacturing
- Heavy industrial

## Large Commercial

- Wholesale / big-box
- Grocery
- Retail strip

## Food & Hospitality

- Restaurant
- Hotel

## Institutional

- Higher education
- Medical
- Institutional / civic

## Office

- Office

Optional:

- Other
- Unknown

Use human-readable labels in the UI and stable machine-readable codes in exported data.

---

# Satellite View

Satellite imagery should be one click away.

Preferred behavior:

- allow switching map type between standard and satellite;
- remember user preference across records during a session.

Do not reset to standard map every time the user presses Next.

---

# Street View

Street View should appear adjacent to or below the primary map when space allows.

Behavior:

- try to load relevant panorama for target;
- selecting a nearby facility may update panorama focus;
- display a clear unavailable state if no panorama exists;
- do not treat missing Street View as an error.

Example unavailable state:

```text
Street View is not available near this location.
Continue verification using map and satellite imagery.
```

---

# Loading and Error States

## Geocoding

If an address cannot be geocoded:

- retain the row in the queue;
- show a clear target-resolution error;
- allow `needs_review` or `unable_to_verify`;
- allow user to continue to Next.

## Places

If Nearby Search fails:

- keep target map usable;
- display nearby facilities as unavailable;
- provide retry;
- do not block verification.

## Street View

If unavailable:

- hide/disable panorama content gracefully;
- do not show a fatal error.

---

# Saving Behavior

The user should never wonder whether results were saved.

Recommended behavior:

- save verification field changes immediately to application state;
- persist locally after changes;
- show subtle saved state where useful;
- always save before record navigation.

Avoid modal confirmation dialogs for normal Previous/Next navigation.

---

# Download Behavior

The **Download CSV** action should:

- export the entire dataset;
- preserve original rows and columns;
- append SiteLens fields;
- include both reviewed and unreviewed rows;
- avoid replacing the original upload.

Suggested output:

`facilities_verified.csv`

---

# Responsive Behavior

Desktop is the primary target for manual verification.

Optimize first for:

- laptop;
- desktop;
- large monitor.

On narrower screens:

- queue may collapse into a drawer;
- details may collapse into a side sheet;
- map remains primary.

Do not compromise the desktop verification workflow in order to optimize mobile use prematurely.
