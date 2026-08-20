import { FACILITY_TYPES } from "./taxonomy";
import type { SourceRow } from "./types";

const BUSINESS_NAME_COLUMNS = ["business_name", "name"];
const EUI_CATEGORY_COLUMNS = ["eui_category", "facility_type"];

export function findSourceValue(row: SourceRow, candidates: string[]): string | null {
  for (const key of Object.keys(row)) {
    if (candidates.includes(key.trim().toLowerCase())) {
      const value = row[key];
      if (value && value.trim() !== "") return value;
    }
  }
  return null;
}

export function getSourceBusinessName(row: SourceRow): string | null {
  return findSourceValue(row, BUSINESS_NAME_COLUMNS);
}

export function getSourceEuiCategory(row: SourceRow): string | null {
  return findSourceValue(row, EUI_CATEGORY_COLUMNS);
}

export function matchFacilityTypeCode(rawValue: string): string | null {
  const normalized = rawValue.trim().toLowerCase();
  const match = FACILITY_TYPES.find(
    (f) => f.code.toLowerCase() === normalized || f.label.toLowerCase() === normalized,
  );
  return match ? match.code : null;
}
