import type { VerificationStatus } from "./types";

export interface FacilityTypeOption {
  code: string;
  label: string;
  group: string;
}

export const FACILITY_TYPES: FacilityTypeOption[] = [
  { code: "data_center", label: "Data center", group: "Industrial & Logistics" },
  { code: "warehouse_cold", label: "Cold storage", group: "Industrial & Logistics" },
  { code: "warehouse_dry", label: "Dry warehouse", group: "Industrial & Logistics" },
  { code: "manufacturing", label: "Manufacturing", group: "Industrial & Logistics" },
  { code: "heavy_industrial", label: "Heavy industrial", group: "Industrial & Logistics" },
  { code: "wholesale_bigbox", label: "Wholesale / big-box", group: "Large Commercial" },
  { code: "grocery", label: "Grocery", group: "Large Commercial" },
  { code: "retail_strip", label: "Retail strip", group: "Large Commercial" },
  { code: "restaurant", label: "Restaurant", group: "Food & Hospitality" },
  { code: "hotel", label: "Hotel", group: "Food & Hospitality" },
  { code: "higher_education", label: "Higher education", group: "Institutional" },
  { code: "medical", label: "Medical", group: "Institutional" },
  { code: "institutional", label: "Institutional / civic", group: "Institutional" },
  { code: "office", label: "Office", group: "Office" },
  { code: "other", label: "Other", group: "Other" },
  { code: "unknown", label: "Unknown", group: "Other" },
];

export const FACILITY_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  FACILITY_TYPES.map((f) => [f.code, f.label]),
);

export const VERIFICATION_STATUSES: { code: VerificationStatus; label: string }[] = [
  { code: "verified", label: "Verified" },
  { code: "mismatch", label: "Mismatch" },
  { code: "needs_review", label: "Needs review" },
  { code: "unable_to_verify", label: "Unable to verify" },
];

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> =
  Object.fromEntries(
    VERIFICATION_STATUSES.map((s) => [s.code, s.label]),
  ) as Record<VerificationStatus, string>;
