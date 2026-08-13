"use client";

import { downloadCsv } from "@/lib/csv";
import { isFlagged } from "@/lib/format";
import type { Dataset } from "@/lib/types";
import styles from "./Header.module.css";

export function Header({ dataset, activeIndex }: { dataset: Dataset; activeIndex: number }) {
  const reviewedCount = dataset.records.filter((r) => r.verification.status !== null).length;
  const flaggedCount = dataset.records.filter((r) => isFlagged(r.verification.status)).length;

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.brand}>SiteLens</span>
        <span className={styles.fileName}>{dataset.fileName}</span>
      </div>
      <div className={styles.right}>
        <span className={styles.stat}>
          {activeIndex + 1} / {dataset.records.length}
        </span>
        <span className={styles.stat}>
          {reviewedCount} / {dataset.records.length} reviewed
        </span>
        {flaggedCount > 0 && <span className={styles.flagged}>⚠ {flaggedCount} flagged</span>}
        <button className={styles.downloadButton} onClick={() => downloadCsv(dataset)}>
          ↓ Download CSV
        </button>
      </div>
    </header>
  );
}
