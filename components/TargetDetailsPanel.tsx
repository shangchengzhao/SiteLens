"use client";

import { useAppStore } from "@/lib/store";
import { FACILITY_TYPES, VERIFICATION_STATUSES } from "@/lib/taxonomy";
import { getSourceEuiCategory, matchFacilityTypeCode } from "@/lib/sourceFields";
import { getEffectiveLocationFields } from "@/lib/verifiedFields";
import type { ColumnMapping, LocationRecord, VerificationStatus } from "@/lib/types";
import styles from "./TargetDetailsPanel.module.css";

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

  const effective = getEffectiveLocationFields(record, columnMapping);
  const sourceEuiCategory = getSourceEuiCategory(record.source);
  const euiMatched = sourceEuiCategory ? matchFacilityTypeCode(sourceEuiCategory) : null;
  const showEuiHint = Boolean(sourceEuiCategory && !euiMatched);
  const showAddressConflict =
    record.addressConflict === true && effective.effectiveAddress === effective.sourceAddress;

  return (
    <div className={styles.wrapper}>
      <div className={styles.heading}>Details</div>

      <label className={styles.label}>
        Address
        {effective.addressLocked ? (
          <p className={styles.lockedValue}>
            {effective.effectiveAddress ?? "No address available."}
          </p>
        ) : (
          <input
            className={`${styles.control} ${showAddressConflict ? styles.conflict : ""}`}
            type="text"
            value={effective.effectiveAddress ?? ""}
            placeholder="No address available"
            onChange={(e) =>
              updateVerification(record.internalId, { verifiedAddress: e.target.value })
            }
          />
        )}
        {showAddressConflict && (
          <span className={styles.conflictHint}>
            This address doesn&apos;t match the source coordinate. Correct it if needed.
          </span>
        )}
      </label>

      <div className={styles.coordRow}>
        <label className={styles.label}>
          Latitude
          {effective.coordinatesLocked ? (
            <p className={styles.lockedValue}>
              {effective.effectiveLatitude != null
                ? effective.effectiveLatitude.toFixed(6)
                : "—"}
            </p>
          ) : (
            <input
              className={styles.control}
              type="number"
              step="any"
              value={effective.effectiveLatitude ?? ""}
              onChange={(e) =>
                updateVerification(record.internalId, {
                  verifiedLatitude: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          )}
        </label>
        <label className={styles.label}>
          Longitude
          {effective.coordinatesLocked ? (
            <p className={styles.lockedValue}>
              {effective.effectiveLongitude != null
                ? effective.effectiveLongitude.toFixed(6)
                : "—"}
            </p>
          ) : (
            <input
              className={styles.control}
              type="number"
              step="any"
              value={effective.effectiveLongitude ?? ""}
              onChange={(e) =>
                updateVerification(record.internalId, {
                  verifiedLongitude: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          )}
        </label>
      </div>

      <label className={styles.label}>
        Business name
        <input
          className={styles.control}
          type="text"
          value={record.verification.businessName}
          onChange={(e) => updateVerification(record.internalId, { businessName: e.target.value })}
        />
      </label>

      <label className={styles.label}>
        EUI category
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
        {showEuiHint && (
          <span className={styles.hint}>
            Source value &quot;{sourceEuiCategory}&quot; doesn&apos;t match a category.
          </span>
        )}
      </label>

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
    </div>
  );
}
