import type { ColumnMapping, LocationRecord } from "./types";

export interface EffectiveLocationFields {
  sourceAddress: string | null;
  addressLocked: boolean;
  effectiveAddress: string | null;
  coordinatesLocked: boolean;
  effectiveLatitude: number | null;
  effectiveLongitude: number | null;
}

/**
 * Determines which of address/coordinates was used to place the pin (and is
 * therefore locked/read-only) versus which is open for reviewer correction.
 * Whichever field actually determined the resolved location is protected;
 * the other is editable so a conflicting or missing value can be fixed.
 */
export function getEffectiveLocationFields(
  record: LocationRecord,
  mapping: ColumnMapping,
): EffectiveLocationFields {
  const sourceAddress = mapping.addressColumn
    ? record.source[mapping.addressColumn]?.trim() || null
    : null;
  const { method, latitude, longitude } = record.resolvedLocation;
  const { verifiedAddress, verifiedLatitude, verifiedLongitude } = record.verification;

  if (method === "source_coordinates") {
    return {
      sourceAddress,
      addressLocked: false,
      effectiveAddress: verifiedAddress ?? sourceAddress,
      coordinatesLocked: true,
      effectiveLatitude: latitude,
      effectiveLongitude: longitude,
    };
  }

  if (method === "geocoded") {
    return {
      sourceAddress,
      addressLocked: true,
      effectiveAddress: sourceAddress,
      coordinatesLocked: false,
      effectiveLatitude: verifiedLatitude ?? latitude,
      effectiveLongitude: verifiedLongitude ?? longitude,
    };
  }

  return {
    sourceAddress,
    addressLocked: false,
    effectiveAddress: verifiedAddress ?? sourceAddress,
    coordinatesLocked: false,
    effectiveLatitude: verifiedLatitude,
    effectiveLongitude: verifiedLongitude,
  };
}
