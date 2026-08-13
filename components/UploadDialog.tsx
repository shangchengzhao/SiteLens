"use client";

import { useState } from "react";
import {
  buildDataset,
  detectColumnMapping,
  hasUsableLocationMapping,
  parseCsvFile,
  type ParsedCsv,
} from "@/lib/csv";
import type { ColumnMapping } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import styles from "./UploadDialog.module.css";

const NONE = "__none__";

export function UploadDialog() {
  const loadDataset = useAppStore((s) => s.loadDataset);
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    try {
      const result = await parseCsvFile(file);
      if (result.rows.length === 0) {
        setError("This CSV has no data rows.");
        return;
      }
      const detected = detectColumnMapping(result.columns);
      setParsed(result);

      if (hasUsableLocationMapping(detected)) {
        loadDataset(buildDataset(result.fileName, result.columns, result.rows, detected));
        setParsed(null);
      } else {
        setMapping(detected);
      }
    } catch {
      setError("Could not read this file as CSV.");
    }
  }

  function confirmMapping() {
    if (!parsed || !mapping) return;
    if (!hasUsableLocationMapping(mapping)) {
      setError("Select either latitude + longitude columns, or an address column.");
      return;
    }
    loadDataset(buildDataset(parsed.fileName, parsed.columns, parsed.rows, mapping));
    setParsed(null);
    setMapping(null);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>SiteLens</h1>
        <p className={styles.subtitle}>
          Upload a CSV of locations to begin manual verification.
        </p>

        {!mapping && (
          <label className={styles.dropzone}>
            <input
              type="file"
              accept=".csv"
              className={styles.fileInput}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
            Choose a CSV file
          </label>
        )}

        {error && <p className={styles.error}>{error}</p>}

        {mapping && parsed && (
          <div className={styles.mappingForm}>
            <p className={styles.mappingHint}>
              We couldn&apos;t automatically detect location columns in{" "}
              <strong>{parsed.fileName}</strong>. Select them manually.
            </p>

            <ColumnSelect
              label="Latitude column"
              value={mapping.latitudeColumn}
              columns={parsed.columns}
              onChange={(v) => setMapping({ ...mapping, latitudeColumn: v })}
            />
            <ColumnSelect
              label="Longitude column"
              value={mapping.longitudeColumn}
              columns={parsed.columns}
              onChange={(v) => setMapping({ ...mapping, longitudeColumn: v })}
            />
            <div className={styles.orDivider}>or</div>
            <ColumnSelect
              label="Address column"
              value={mapping.addressColumn}
              columns={parsed.columns}
              onChange={(v) => setMapping({ ...mapping, addressColumn: v })}
            />
            <ColumnSelect
              label="Unique ID column (optional)"
              value={mapping.idColumn}
              columns={parsed.columns}
              onChange={(v) => setMapping({ ...mapping, idColumn: v })}
            />

            <button className={styles.confirmButton} onClick={confirmMapping}>
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ColumnSelect({
  label,
  value,
  columns,
  onChange,
}: {
  label: string;
  value: string | null;
  columns: string[];
  onChange: (value: string | null) => void;
}) {
  return (
    <label className={styles.selectRow}>
      <span>{label}</span>
      <select
        value={value ?? NONE}
        onChange={(e) => onChange(e.target.value === NONE ? null : e.target.value)}
      >
        <option value={NONE}>—</option>
        {columns.map((col) => (
          <option key={col} value={col}>
            {col}
          </option>
        ))}
      </select>
    </label>
  );
}
