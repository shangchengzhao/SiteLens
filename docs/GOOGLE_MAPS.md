# SiteLens Google Maps Integration

## Purpose

This document defines how SiteLens should use Google Maps Platform services.

The objective is to support human geographic verification while:

- minimizing redundant requests;
- keeping API costs predictable;
- handling incomplete data gracefully;
- maintaining a clean distinction between Google evidence and SiteLens verification.

---

# Google Services

SiteLens may use the following Google Maps Platform capabilities.

## Maps JavaScript API

Purpose:

- interactive map;
- target marker;
- surrounding facility markers;
- distance rings;
- map/satellite switching;
- map interaction.

---

## Geocoding

Purpose:

- convert uploaded addresses into coordinates when valid coordinates are not supplied.

Rules:

- do not geocode rows that already contain valid coordinates unless explicitly needed;
- cache geocoding results during the session;
- failed geocoding must not block review of the rest of the dataset.

---

## Places API

Purpose:

- discover businesses/facilities near the target;
- retrieve business/place names;
- retrieve Google Place Types;
- retrieve selected place metadata needed for verification.

Important:

> Google Places does not provide SiteLens's exact facility taxonomy.

Returned Place Types and metadata are evidence that SiteLens may map into its own categories.

---

## Street View

Purpose:

- visually inspect target sites;
- inspect surrounding buildings/businesses;
- reduce the need to open external Google Maps tabs.

Missing Street View is expected and should not be treated as a fatal error.

---

# API Key Handling

Never commit API keys.

Use environment variables.

Example:

```text
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

Exact variable naming depends on the stack.

For production:

- restrict the API key by allowed website/domain;
- restrict the key to required Google APIs;
- configure quotas and budget alerts;
- avoid exposing server-only keys to the browser.

---

# Development and Demo

Google currently offers development/demo mechanisms and per-SKU free monthly usage allowances.

The implementation should still assume API usage has a cost.

Engineering rules:

- avoid unnecessary repeated calls;
- cache results where allowed/practical;
- reuse existing results when changing UI filters;
- avoid requests that scale with every SiteLens facility label.

---

# Target Location Resolution

## If coordinates exist

Use source coordinates when they are valid.

Suggested validation:

```text
-90 <= latitude <= 90
-180 <= longitude <= 180
```

## If coordinates do not exist

Geocode the configured address field.

Store the resolved coordinate separately from source data.

Conceptual model:

```text
source address
      ↓
Google geocoding
      ↓
resolved target coordinate
```

Do not overwrite the uploaded address.

---

# Map Behavior

When the active record changes:

1. resolve target coordinate;
2. center/fit map around target;
3. display target marker;
4. render configured radius rings;
5. load/reuse nearby facility results;
6. update Street View if available.

Remember the user's preferred base map mode where practical:

- roadmap;
- satellite.

Do not reset satellite preference on every record.

---

# Target Marker

The target marker must be visually dominant.

Never reuse the same style for:

- target;
- nearby facility;
- selected nearby facility.

The user should always know which location belongs to the uploaded row.

---

# Verification Lens Radius

Initial P1 radii:

```text
100 m
250 m
```

Nearby Search may use an implementation radius suitable for capturing facilities required by the UI.

If API retrieval radius differs from the displayed ring radius, document the distinction.

Example:

```text
Search API radius: 300 m
Displayed verification rings: 100 m and 250 m
```

---

# Nearby Places Strategy

Do **not** make one Places request for every SiteLens category.

Bad:

```text
request data centers
request cold storage
request warehouses
request grocery
request restaurant
request hotel
...
```

Preferred:

```text
one/few efficient Nearby Search requests
        ↓
Google Places results
        ↓
filter/classify locally
        ↓
SiteLens facility families/subtypes
```

Google Nearby Search supports multiple place-type filters depending on the API endpoint/version. Use the most efficient supported grouping.

---

# SiteLens Facility Classification

The pipeline is conceptually:

```text
Google result
    ↓
place name
Google Place Types
available place metadata
    ↓
SiteLens mapping/classification logic
    ↓
SiteLens facility category
```

Classification may use:

- direct type mapping;
- business-name keywords;
- rules;
- later ML/LLM assistance.

The resulting category should be treated as:

- `mapped`;
- `suggested`;
- or `candidate`;

until a reviewer verifies the target.

Do not represent automated mapping as final ground truth.

---

# Facility Families

## Industrial & Logistics

Target SiteLens labels:

```text
data_center
warehouse_cold
warehouse_dry
manufacturing
heavy_industrial
```

Potential evidence may include:

- manufacturer-type places;
- logistics/supplier-related businesses;
- business names containing warehouse/distribution/cold storage/data center terminology;
- other relevant Google metadata.

Some of these categories may not have a direct Google Place Type.

---

## Large Commercial

Target labels:

```text
wholesale_bigbox
grocery
retail_strip
```

Potential Google evidence may include:

- supermarket;
- grocery store;
- wholesaler;
- shopping-related place types;
- business-name patterns.

---

## Food & Hospitality

Target labels:

```text
restaurant
hotel
```

These generally have stronger direct correspondence to Google place categories.

---

## Institutional

Target labels:

```text
higher_education
medical
institutional
```

Potential Google evidence may include:

- university;
- college;
- hospital;
- medical facility;
- government/civic/institutional places.

---

## Office

Target label:

```text
office
```

Office classification may require broader business/place evidence because a generic office building may not correspond to one clean Google Place Type.

---

# Nearby Facility Distance

Compute direct distance between target coordinate and facility coordinate.

For short verification radii, a standard geographic distance calculation is sufficient.

Export/display in meters by default.

Example:

```text
ABC Manufacturing
manufacturing
83 m from target
```

Distance describes point-to-point map coordinates, not walking/driving distance.

---

# Place Details

Only request Place Details fields that the UI actually uses.

Possible useful fields:

- place ID;
- display name;
- formatted address;
- location;
- types;
- business status;
- website/phone when later required.

Avoid requesting richer/more expensive fields without a product need.

Do not retrieve user-generated reviews/photos simply because they are available.

---

# Street View Behavior

For each target:

1. try to identify a usable panorama near the target;
2. display it in the Street View panel;
3. preserve map functionality if none exists.

Do not repeatedly request new panorama information if a cached result is already available for the record.

When selecting a nearby facility, the application may update the panorama toward that facility.

---

# Error Handling

## Geocoding failure

UI should show:

```text
Location could not be resolved from the uploaded address.
```

Allow:

- manual review;
- location correction later;
- `needs_review`;
- `unable_to_verify`;
- Next navigation.

## Places failure

UI should show:

```text
Nearby facility data is temporarily unavailable.
```

The user should still be able to:

- inspect map;
- inspect satellite view;
- record verification;
- continue.

## Quota/rate limit

Surface a distinct message.

Do not retry aggressively in a tight loop.

Implement backoff/retry only where appropriate.

---

# Caching and Request Reuse

Within a session, cache by stable inputs.

Examples:

```text
geocode(address)
nearby(latitude, longitude, radius, search-config)
streetview(latitude, longitude)
placeDetails(placeId, fieldSet)
```

Changing UI category filters should normally filter already-returned results rather than repeat Nearby Search.

Navigating Previous → Next → Previous should reuse the previous record's data when possible.

---

# Pricing-Aware Design

The product should be designed around efficient API usage.

Likely major cost drivers include:

- Places Nearby Search;
- Place Details;
- Street View;
- map loads at scale.

Engineering guidance:

- avoid multiple duplicate search calls per target;
- request only required fields;
- reuse results;
- debounce user-triggered requests where appropriate;
- distinguish initial result retrieval from client-side filtering;
- set Google Cloud quotas during demos to prevent accidental runaway cost.

---

# Data Storage Considerations

Before permanently storing or redistributing Google Maps/Places-derived fields, check current Google Maps Platform terms and caching/storage restrictions.

The product should prefer storing:

- reviewer verification;
- user-entered values;
- source data;

and treat Google results as external evidence.

If Google-derived fields are persisted/exported, verify that the intended storage/export behavior complies with current Google Maps Platform terms.

---

# Explicitly Out of Scope

Current Google integration should not attempt to provide:

- building floor area;
- building square footage;
- parcel data;
- ownership information.

These are intentionally excluded from the current SiteLens scope.
