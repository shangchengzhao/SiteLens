"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import "@/lib/mapsAuthFailure";
import { useAppStore } from "@/lib/store";
import { UploadDialog } from "@/components/UploadDialog";
import { Header } from "@/components/Header";
import { LocationQueue } from "@/components/LocationQueue";
import { MapPanel } from "@/components/MapPanel";
import { TargetDetailsPanel } from "@/components/TargetDetailsPanel";
import { VerificationActionBar } from "@/components/VerificationActionBar";
import styles from "./page.module.css";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function Home() {
  const dataset = useAppStore((s) => s.dataset);
  const activeIndex = useAppStore((s) => s.activeIndex);

  if (!API_KEY) {
    return (
      <main className={styles.missingKey}>
        <p>
          Missing <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>. Add it to{" "}
          <code>.env.local</code> and restart the dev server.
        </p>
      </main>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
      {!dataset ? (
        <UploadDialog />
      ) : (
        <main className={styles.workspace}>
          <Header dataset={dataset} activeIndex={activeIndex} />
          <div className={styles.body}>
            <div className={styles.queueColumn}>
              <LocationQueue
                records={dataset.records}
                columnMapping={dataset.columnMapping}
                activeIndex={activeIndex}
              />
            </div>
            <MapPanel
              record={dataset.records[activeIndex] ?? null}
              addressColumn={dataset.columnMapping.addressColumn}
            />
            <div className={styles.detailsColumn}>
              <TargetDetailsPanel
                record={dataset.records[activeIndex] ?? null}
                columnMapping={dataset.columnMapping}
              />
            </div>
          </div>
          <VerificationActionBar
            record={dataset.records[activeIndex] ?? null}
            activeIndex={activeIndex}
            total={dataset.records.length}
          />
        </main>
      )}
    </APIProvider>
  );
}
