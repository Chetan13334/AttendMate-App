// src/services/locationService.ts
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import { officeLocation } from "../config/constants";

const officeLat = officeLocation.latitude;
const officeLng = officeLocation.longitude;
const GEOFENCE_RADIUS = officeLocation.radius;

const toRad = (value: number) => (value * Math.PI) / 180;
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Try to enable/check location permission & get current position.
 * Returns true if we could obtain a position (permissions ok & GPS available).
 * Returns false if we could not obtain position (permission denied or GPS off).
 *
 * NOTE: Per Option 3 we DO NOT open system settings automatically.
 */
export const enableLocation = async (): Promise<boolean> => {
  try {
    const perm = await Geolocation.requestPermissions();
    // Capacitor may return different shapes; be defensive
    // perm could be a string ("granted") or an object like { location: "granted" }
    const granted =
      (typeof perm === "string" && perm === "granted") ||
      (perm && (perm as any).location === "granted");

    if (!granted) return false;

    // Attempt to get a position — if device GPS is off this will throw
    await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    });

    return true;
  } catch (err) {
    console.error("enableLocation failed:", err);
    return false;
  }
};

/**
 * Quickly get coordinates and check distance against office geofence.
 * Returns { success, inside, distance }:
 *  - success: whether we obtained coords
 *  - inside: whether user is inside geofence (only valid if success===true)
 */
export const quickGeoCheck = async (): Promise<{
  success: boolean;
  inside: boolean;
  distance: number;
}> => {
  try {
    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });

    const distance = getDistance(
      officeLat,
      officeLng,
      pos.coords.latitude,
      pos.coords.longitude
    );

    return { success: true, inside: distance <= GEOFENCE_RADIUS, distance };
  } catch (err) {
    console.error("quickGeoCheck error:", err);
    return { success: false, inside: false, distance: 0 };
  }
};
