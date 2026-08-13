import type { ColumnMapping, LocationRecord, VerificationStatus } from "./types";

export function getRecordLabel(record: LocationRecord, mapping: ColumnMapping): string {
  if (mapping.addressColumn) {
    const address = record.source[mapping.addressColumn];
    if (address && address.trim() !== "") return address;
  }
  const { latitude, longitude } = record.resolvedLocation;
  if (latitude != null && longitude != null) {
    return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  }
  return record.internalId;
}

export const STATUS_ICONS: Record<VerificationStatus | "not_reviewed", string> = {
  not_reviewed: "○",
  verified: "✓",
  needs_review: "⚠",
  mismatch: "✕",
  unable_to_verify: "?",
};

export function getStatusIcon(status: VerificationStatus | null): string {
  return STATUS_ICONS[status ?? "not_reviewed"];
}

export function isFlagged(status: VerificationStatus | null): boolean {
  return status === "mismatch" || status === "needs_review";
}
