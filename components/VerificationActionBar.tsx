"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { VERIFICATION_STATUSES } from "@/lib/taxonomy";
import type { LocationRecord, VerificationStatus } from "@/lib/types";
import styles from "./VerificationActionBar.module.css";

const SHORTCUT_STATUS: Record<string, VerificationStatus> = {
  "1": "verified",
  "2": "needs_review",
  "3": "mismatch",
  "4": "unable_to_verify",
};

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export function VerificationActionBar({
  record,
  activeIndex,
  total,
}: {
  record: LocationRecord | null;
  activeIndex: number;
  total: number;
}) {
  const goToPrevious = useAppStore((s) => s.goToPrevious);
  const goToNext = useAppStore((s) => s.goToNext);
  const updateVerification = useAppStore((s) => s.updateVerification);

  const isFirst = activeIndex <= 0;
  const isLast = activeIndex >= total - 1;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      } else if (record && SHORTCUT_STATUS[e.key]) {
        e.preventDefault();
        updateVerification(record.internalId, { status: SHORTCUT_STATUS[e.key] });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevious, goToNext, updateVerification, record]);

  return (
    <div className={styles.wrapper}>
      <button className={styles.navButton} disabled={isFirst} onClick={goToPrevious}>
        ‹ Previous
      </button>

      <div className={styles.statusButtons}>
        {VERIFICATION_STATUSES.map((s) => {
          const isActive = record?.verification.status === s.code;
          return (
            <button
              key={s.code}
              className={`${styles.statusButton} ${styles[s.code]} ${
                isActive ? styles.statusButtonActive : ""
              }`}
              disabled={!record}
              onClick={() => record && updateVerification(record.internalId, { status: s.code })}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <button className={styles.navButton} disabled={isLast} onClick={goToNext}>
        Next ›
      </button>
    </div>
  );
}
