"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  AdvancedMarker,
  Map,
  Pin,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
  APILoadingStatus,
} from "@vis.gl/react-google-maps";
import { useAppStore } from "@/lib/store";
import { geocodeAddress } from "@/lib/geocode";
import { isMapsAuthFailed, subscribeMapsAuthFailure } from "@/lib/mapsAuthFailure";
import { ADDRESS_CONFLICT_THRESHOLD_METERS, haversineDistanceMeters } from "@/lib/geo";
import type { LocationRecord } from "@/lib/types";
import styles from "./MapPanel.module.css";

const DEFAULT_CENTER = { lat: 39.5, lng: -98.35 };

export function MapPanel({
  record,
  addressColumn,
}: {
  record: LocationRecord | null;
  addressColumn: string | null;
}) {
  const updateResolvedLocation = useAppStore((s) => s.updateResolvedLocation);
  const setAddressConflict = useAppStore((s) => s.setAddressConflict);
  const geocodingLibrary = useMapsLibrary("geocoding");
  const map = useMap("sitelens-map");
  const apiStatus = useApiLoadingStatus();
  const authFailed = useSyncExternalStore(
    subscribeMapsAuthFailure,
    isMapsAuthFailed,
    () => false,
  );
  const apiFailed =
    apiStatus === APILoadingStatus.FAILED ||
    apiStatus === APILoadingStatus.AUTH_FAILURE ||
    authFailed;

  const resolved = record?.resolvedLocation ?? null;
  const address = record && addressColumn ? record.source[addressColumn] : null;
  const needsGeocoding = Boolean(
    !apiFailed &&
      resolved &&
      resolved.method === "unresolved" &&
      !resolved.error &&
      address &&
      address.trim() !== "",
  );

  useEffect(() => {
    if (!record || !geocodingLibrary || !needsGeocoding || !address) return;

    const geocoder = new geocodingLibrary.Geocoder();
    geocodeAddress(geocoder, address).then((result) => {
      updateResolvedLocation(record.internalId, result);
    });
  }, [record, geocodingLibrary, needsGeocoding, address, updateResolvedLocation]);

  const needsConflictCheck = Boolean(
    !apiFailed &&
      record &&
      resolved?.method === "source_coordinates" &&
      record.addressConflict === null &&
      address &&
      address.trim() !== "",
  );

  useEffect(() => {
    if (!record || !resolved || !geocodingLibrary || !needsConflictCheck || !address) return;
    if (resolved.latitude == null || resolved.longitude == null) return;

    const geocoder = new geocodingLibrary.Geocoder();
    geocodeAddress(geocoder, address).then((result) => {
      if (result.latitude == null || result.longitude == null) {
        setAddressConflict(record.internalId, false);
        return;
      }
      const distance = haversineDistanceMeters(
        resolved.latitude as number,
        resolved.longitude as number,
        result.latitude,
        result.longitude,
      );
      setAddressConflict(record.internalId, distance > ADDRESS_CONFLICT_THRESHOLD_METERS);
    });
  }, [record, resolved, geocodingLibrary, needsConflictCheck, address, setAddressConflict]);

  useEffect(() => {
    if (!map || !resolved || resolved.latitude == null || resolved.longitude == null) return;
    map.panTo({ lat: resolved.latitude, lng: resolved.longitude });
    map.setZoom(17);
  }, [map, resolved]);

  const hasNoLocationSource = record && !address && resolved?.method === "unresolved";

  return (
    <div className={styles.wrapper}>
      <Map
        id="sitelens-map"
        // Advanced markers require a Map ID; DEMO_MAP_ID is Google's public
        // testing ID for unstyled maps and is fine outside production.
        mapId="DEMO_MAP_ID"
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={4}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapTypeControl
        streetViewControl={false}
        className={styles.map}
      >
        {resolved && resolved.latitude != null && resolved.longitude != null && (
          <AdvancedMarker position={{ lat: resolved.latitude, lng: resolved.longitude }}>
            <Pin background="#dc2626" borderColor="#7f1d1d" glyphColor="#ffffff" scale={1.3} />
          </AdvancedMarker>
        )}
      </Map>

      {!record && <div className={styles.overlay}>Upload a CSV to begin.</div>}

      {record && apiFailed && (
        <div className={styles.overlayBanner}>
          Google Maps failed to load. Check the API key configuration (see browser console for
          details).
        </div>
      )}

      {record && !apiFailed && needsGeocoding && (
        <div className={styles.overlayBanner}>Resolving location…</div>
      )}

      {record && !apiFailed && !needsGeocoding && resolved?.error && (
        <div className={styles.overlayBanner}>{resolved.error}</div>
      )}

      {record && !apiFailed && hasNoLocationSource && (
        <div className={styles.overlayBanner}>
          No coordinates or address available for this record.
        </div>
      )}
    </div>
  );
}
