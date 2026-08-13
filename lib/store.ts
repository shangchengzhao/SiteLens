import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Dataset,
  LocationRecord,
  ResolvedLocation,
  Verification,
} from "./types";

type MapType = "roadmap" | "satellite";

interface AppState {
  dataset: Dataset | null;
  activeIndex: number;
  mapTypePreference: MapType;

  loadDataset: (dataset: Dataset) => void;
  clearDataset: () => void;

  setActiveIndex: (index: number) => void;
  selectRecordById: (internalId: string) => void;
  goToPrevious: () => void;
  goToNext: () => void;

  updateVerification: (internalId: string, patch: Partial<Verification>) => void;
  updateResolvedLocation: (internalId: string, resolved: ResolvedLocation) => void;

  setMapTypePreference: (mapType: MapType) => void;
}

const VERIFICATION_FIELDS: (keyof Verification)[] = [
  "status",
  "facilityType",
  "businessName",
  "notes",
];

function patchChangesVerificationContent(
  current: Verification,
  patch: Partial<Verification>,
): boolean {
  return VERIFICATION_FIELDS.some(
    (field) => field in patch && patch[field] !== current[field],
  );
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      dataset: null,
      activeIndex: 0,
      mapTypePreference: "roadmap",

      loadDataset: (dataset) => set({ dataset, activeIndex: 0 }),

      clearDataset: () => set({ dataset: null, activeIndex: 0 }),

      setActiveIndex: (index) => {
        const dataset = get().dataset;
        if (!dataset) return;
        const clamped = Math.max(0, Math.min(index, dataset.records.length - 1));
        set({ activeIndex: clamped });
      },

      selectRecordById: (internalId) => {
        const dataset = get().dataset;
        if (!dataset) return;
        const index = dataset.records.findIndex((r) => r.internalId === internalId);
        if (index === -1) return;
        set({ activeIndex: index });
      },

      goToPrevious: () => {
        const { activeIndex } = get();
        if (activeIndex > 0) set({ activeIndex: activeIndex - 1 });
      },

      goToNext: () => {
        const { dataset, activeIndex } = get();
        if (!dataset) return;
        if (activeIndex < dataset.records.length - 1) {
          set({ activeIndex: activeIndex + 1 });
        }
      },

      updateVerification: (internalId, patch) => {
        const dataset = get().dataset;
        if (!dataset) return;

        const records: LocationRecord[] = dataset.records.map((record) => {
          if (record.internalId !== internalId) return record;

          const materiallyChanged = patchChangesVerificationContent(
            record.verification,
            patch,
          );

          return {
            ...record,
            verification: {
              ...record.verification,
              ...patch,
              verifiedAt: materiallyChanged
                ? new Date().toISOString()
                : record.verification.verifiedAt,
            },
          };
        });

        set({ dataset: { ...dataset, records } });
      },

      updateResolvedLocation: (internalId, resolved) => {
        const dataset = get().dataset;
        if (!dataset) return;

        const records = dataset.records.map((record) =>
          record.internalId === internalId
            ? { ...record, resolvedLocation: resolved }
            : record,
        );

        set({ dataset: { ...dataset, records } });
      },

      setMapTypePreference: (mapType) => set({ mapTypePreference: mapType }),
    }),
    {
      name: "sitelens-session",
    },
  ),
);

export function getActiveRecord(state: AppState): LocationRecord | null {
  if (!state.dataset) return null;
  return state.dataset.records[state.activeIndex] ?? null;
}
