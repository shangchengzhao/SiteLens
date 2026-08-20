"use client";

import { downloadCsv } from "@/lib/csv";
import { isFlagged } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import type { Dataset } from "@/lib/types";
import styles from "./Header.module.css";

export function Header({ dataset, activeIndex }: { dataset: Dataset; activeIndex: number }) {
  const clearDataset = useAppStore((s) => s.clearDataset);
  const reviewedCount = dataset.records.filter((r) => r.verification.status !== null).length;
  const flaggedCount = dataset.records.filter((r) => isFlagged(r.verification.status)).length;

  function handleNewUpload() {
    const confirmed = window.confirm(
      reviewedCount > 0
        ? `Start a new upload? This discards "${dataset.fileName}" and its ${reviewedCount} reviewed record${reviewedCount === 1 ? "" : "s"} from this session. Download a CSV first if you want to keep them.`
        : `Start a new upload? This discards "${dataset.fileName}" from this session.`,
    );
    if (confirmed) clearDataset();
  }

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
        <button className={styles.newUploadButton} onClick={handleNewUpload}>
          New upload
        </button>
        <button className={styles.downloadButton} onClick={() => downloadCsv(dataset)}>
          ↓ Download CSV
        </button>
      </div>
    </header>
  );
}
