"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { getRecordLabel, getStatusIcon } from "@/lib/format";
import type { ColumnMapping, LocationRecord } from "@/lib/types";
import styles from "./LocationQueue.module.css";

export function LocationQueue({
  records,
  columnMapping,
  activeIndex,
}: {
  records: LocationRecord[];
  columnMapping: ColumnMapping;
  activeIndex: number;
}) {
  const selectRecordById = useAppStore((s) => s.selectRecordById);
  const activeRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.heading}>Location queue</div>
      <ul className={styles.list}>
        {records.map((record, index) => {
          const isActive = index === activeIndex;
          return (
            <li
              key={record.internalId}
              ref={isActive ? activeRef : undefined}
              className={`${styles.row} ${isActive ? styles.rowActive : ""}`}
              onClick={() => selectRecordById(record.internalId)}
            >
              <span className={`${styles.icon} ${styles[record.verification.status ?? "not_reviewed"]}`}>
                {isActive ? "→" : getStatusIcon(record.verification.status)}
              </span>
              <span className={styles.label}>{getRecordLabel(record, columnMapping)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
