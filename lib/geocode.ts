import type { ResolvedLocation } from "./types";

const cache = new Map<string, ResolvedLocation>();

function cacheKey(address: string): string {
  return address.trim().toLowerCase();
}

export function getCachedGeocode(address: string): ResolvedLocation | undefined {
  return cache.get(cacheKey(address));
}

export function geocodeAddress(
  geocoder: google.maps.Geocoder,
  address: string,
): Promise<ResolvedLocation> {
  const key = cacheKey(address);
  const cached = cache.get(key);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve) => {
    geocoder.geocode({ address }, (results, status) => {
      let resolved: ResolvedLocation;

      if (status === "OK" && results && results.length > 0) {
        const location = results[0].geometry.location;
        resolved = {
          latitude: location.lat(),
          longitude: location.lng(),
          method: "geocoded",
          error: null,
        };
      } else {
        resolved = {
          latitude: null,
          longitude: null,
          method: "unresolved",
          error: `Location could not be resolved from the uploaded address (${status}).`,
        };
      }

      cache.set(key, resolved);
      resolve(resolved);
    });
  });
}
