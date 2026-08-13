import Papa from "papaparse";
import type { ColumnMapping, Dataset, LocationRecord, SourceRow } from "./types";
import { emptyVerification } from "./types";

const LAT_NAMES = ["latitude", "lat", "y"];
const LNG_NAMES = ["longitude", "lon", "lng", "long", "x"];
const ADDRESS_NAMES = ["address", "street_address", "full_address", "location"];
const ID_NAMES = ["id", "facility_id"];

function normalize(name: string): string {
  return name.trim().toLowerCase();
}

function findColumn(columns: string[], candidates: string[]): string | null {
  const normalizedColumns = columns.map(normalize);
  for (const candidate of candidates) {
    const idx = normalizedColumns.indexOf(candidate);
    if (idx !== -1) return columns[idx];
  }
  return null;
}

export interface ParsedCsv {
  fileName: string;
  columns: string[];
  rows: SourceRow[];
}

export function parseCsvFile(file: File): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse<SourceRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const columns = results.meta.fields ?? [];
        resolve({ fileName: file.name, columns, rows: results.data });
      },
      error: (error) => reject(error),
    });
  });
}

export function detectColumnMapping(columns: string[]): ColumnMapping {
  return {
    latitudeColumn: findColumn(columns, LAT_NAMES),
    longitudeColumn: findColumn(columns, LNG_NAMES),
    addressColumn: findColumn(columns, ADDRESS_NAMES),
    idColumn: findColumn(columns, ID_NAMES),
  };
}

export function hasUsableLocationMapping(mapping: ColumnMapping): boolean {
  const hasCoords = Boolean(mapping.latitudeColumn && mapping.longitudeColumn);
  const hasAddress = Boolean(mapping.addressColumn);
  return hasCoords || hasAddress;
}

function isUniqueNonEmpty(values: string[]): boolean {
  const nonEmpty = values.filter((v) => v && v.trim().length > 0);
  if (nonEmpty.length !== values.length) return false;
  return new Set(nonEmpty).size === nonEmpty.length;
}

function parseCoordinate(value: string | undefined): number | null {
  if (value === undefined || value.trim() === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function isValidLatLng(lat: number | null, lng: number | null): boolean {
  return (
    lat !== null &&
    lng !== null &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function buildDataset(
  fileName: string,
  columns: string[],
  rows: SourceRow[],
  mapping: ColumnMapping,
): Dataset {
  const idValues = mapping.idColumn
    ? rows.map((row) => row[mapping.idColumn as string] ?? "")
    : [];
  const useSourceId = mapping.idColumn !== null && isUniqueNonEmpty(idValues);

  const records: LocationRecord[] = rows.map((row, index) => {
    const internalId = useSourceId
      ? row[mapping.idColumn as string]
      : `row-${String(index + 1).padStart(4, "0")}`;

    const lat = mapping.latitudeColumn
      ? parseCoordinate(row[mapping.latitudeColumn])
      : null;
    const lng = mapping.longitudeColumn
      ? parseCoordinate(row[mapping.longitudeColumn])
      : null;

    const hasValidSourceCoords = isValidLatLng(lat, lng);

    return {
      internalId,
      rowIndex: index,
      source: row,
      resolvedLocation: hasValidSourceCoords
        ? { latitude: lat, longitude: lng, method: "source_coordinates", error: null }
        : { latitude: null, longitude: null, method: "unresolved", error: null },
      verification: emptyVerification(),
    };
  });

  return { fileName, columns, columnMapping: mapping, records };
}

const EXPORT_COLUMNS = [
  "sitelens_verification_status",
  "sitelens_verified_facility_type",
  "sitelens_verified_business_name",
  "sitelens_reviewer_notes",
  "sitelens_verified_at",
] as const;

export function exportDatasetToCsv(dataset: Dataset): string {
  const rows = dataset.records.map((record) => {
    const row: SourceRow = { ...record.source };
    row["sitelens_verification_status"] = record.verification.status ?? "";
    row["sitelens_verified_facility_type"] = record.verification.facilityType ?? "";
    row["sitelens_verified_business_name"] = record.verification.businessName ?? "";
    row["sitelens_reviewer_notes"] = record.verification.notes ?? "";
    row["sitelens_verified_at"] = record.verification.verifiedAt ?? "";
    return row;
  });

  const fields = [...dataset.columns, ...EXPORT_COLUMNS];
  return Papa.unparse({ fields, data: rows });
}

export function downloadCsv(dataset: Dataset): void {
  const csv = exportDatasetToCsv(dataset);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stem = dataset.fileName.replace(/\.csv$/i, "");
  link.href = url;
  link.download = `${stem}_verified.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
