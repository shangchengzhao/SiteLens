"use client";

import { useAppStore } from "@/lib/store";
import { FACILITY_TYPES, VERIFICATION_STATUSES } from "@/lib/taxonomy";
import type { ColumnMapping, LocationRecord, VerificationStatus } from "@/lib/types";
import styles from "./TargetDetailsPanel.module.css";

const BUSINESS_NAME_COLUMNS = ["business_name", "name"];
const FACILITY_TYPE_COLUMNS = ["facility_type"];

function findSourceValue(record: LocationRecord, candidates: string[]): string | null {
  for (const key of Object.keys(record.source)) {
    if (candidates.includes(key.trim().toLowerCase())) {
      const value = record.source[key];
      if (value && value.trim() !== "") return value;
    }
  }
  return null;
}

const FACILITY_GROUPS = Array.from(new Set(FACILITY_TYPES.map((f) => f.group)));

export function TargetDetailsPanel({
  record,
  columnMapping,
}: {
  record: LocationRecord | null;
  columnMapping: ColumnMapping;
}) {
  const updateVerification = useAppStore((s) => s.updateVerification);

  if (!record) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.empty}>No record selected.</div>
      </div>
    );
  }

  const sourceAddress = columnMapping.addressColumn
    ? record.source[columnMapping.addressColumn]
    : null;
  const sourceBusinessName = findSourceValue(record, BUSINESS_NAME_COLUMNS);
  const sourceFacilityType = findSourceValue(record, FACILITY_TYPE_COLUMNS);

  const { latitude, longitude } = record.resolvedLocation;

  return (
    <div className={styles.wrapper}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Source</h2>
        {sourceAddress && <p className={styles.field}>{sourceAddress}</p>}
        {latitude != null && longitude != null && (
          <p className={styles.fieldMuted}>
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
        )}
        {sourceBusinessName && <p className={styles.field}>{sourceBusinessName}</p>}
        {sourceFacilityType && <p className={styles.fieldMuted}>{sourceFacilityType}</p>}
        {!sourceAddress && latitude == null && (
          <p className={styles.fieldMuted}>No source location available.</p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Verification</h2>

        <label className={styles.label}>
          Status
          <select
            className={styles.control}
            value={record.verification.status ?? ""}
            onChange={(e) =>
              updateVerification(record.internalId, {
                status: e.target.value === "" ? null : (e.target.value as VerificationStatus),
              })
            }
          >
            <option value="">Not reviewed</option>
            {VERIFICATION_STATUSES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.label}>
          Facility type
          <select
            className={styles.control}
            value={record.verification.facilityType ?? ""}
            onChange={(e) =>
              updateVerification(record.internalId, {
                facilityType: e.target.value === "" ? null : e.target.value,
              })
            }
          >
            <option value="">—</option>
            {FACILITY_GROUPS.map((group) => (
              <optgroup key={group} label={group}>
                {FACILITY_TYPES.filter((f) => f.group === group).map((f) => (
                  <option key={f.code} value={f.code}>
                    {f.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <label className={styles.label}>
          Business name
          <input
            className={styles.control}
            type="text"
            value={record.verification.businessName}
            onChange={(e) =>
              updateVerification(record.internalId, { businessName: e.target.value })
            }
          />
        </label>

        <label className={styles.label}>
          Notes
          <textarea
            className={styles.textarea}
            rows={4}
            value={record.verification.notes}
            onChange={(e) => updateVerification(record.internalId, { notes: e.target.value })}
          />
        </label>

        {record.verification.verifiedAt && (
          <p className={styles.verifiedAt}>
            Last updated {new Date(record.verification.verifiedAt).toLocaleString()}
          </p>
        )}
      </section>
    </div>
  );
}
