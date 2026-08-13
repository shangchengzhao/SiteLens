export type VerificationStatus =
  | "verified"
  | "mismatch"
  | "needs_review"
  | "unable_to_verify";

export type ResolutionMethod = "source_coordinates" | "geocoded" | "unresolved";

export interface SourceRow {
  [column: string]: string;
}

export interface ResolvedLocation {
  latitude: number | null;
  longitude: number | null;
  method: ResolutionMethod;
  error: string | null;
}

export interface Verification {
  status: VerificationStatus | null;
  facilityType: string | null;
  businessName: string;
  notes: string;
  verifiedAt: string | null;
}

export interface LocationRecord {
  internalId: string;
  rowIndex: number;
  source: SourceRow;
  resolvedLocation: ResolvedLocation;
  verification: Verification;
}

export interface ColumnMapping {
  latitudeColumn: string | null;
  longitudeColumn: string | null;
  addressColumn: string | null;
  idColumn: string | null;
}

export interface Dataset {
  fileName: string;
  columns: string[];
  columnMapping: ColumnMapping;
  records: LocationRecord[];
}

export function emptyVerification(): Verification {
  return {
    status: null,
    facilityType: null,
    businessName: "",
    notes: "",
    verifiedAt: null,
  };
}
