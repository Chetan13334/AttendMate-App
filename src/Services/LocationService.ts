
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import { officeLocation } from "../config/constants";

const officeLat = officeLocation.latitude;
const officeLng = officeLocation.longitude;
const GEOFENCE_RADIUS = officeLocation.radius;

const toRad = (value: number) => (value * Math.PI) / 180;
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};


export const enableLocation = async (): Promise<boolean> => {
  try {
    const perm = await Geolocation.requestPermissions();




    const granted =
      (typeof perm === "string" && perm === "granted") ||
      (perm && ["granted", "prompt"].includes((perm as any).location));


    if (!granted) return false;


    await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    });

    return true;
  } catch (err) {

    return false;
  }
};


export const quickGeoCheck = async (): Promise<{
  success: boolean;
  inside: boolean;
  distance: number;
  status?: string;
}> => {
  try {
    // 1. Check & Request Permissions
    let perm = await Geolocation.checkPermissions();

    if (perm.location === "prompt" || perm.location === "prompt-with-rationale") {
      perm = await Geolocation.requestPermissions();
    }

    if (perm.location === "denied") {
      return { success: false, inside: false, distance: 0, status: "denied" };
    }

    // 2. Try High Accuracy
    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });

      const distance = getDistance(
        officeLat,
        officeLng,
        pos.coords.latitude,
        pos.coords.longitude
      );

      return { success: true, inside: distance <= GEOFENCE_RADIUS, distance };
    } catch (highAccuracyError) {
      console.warn("High accuracy location failed, trying low accuracy...", highAccuracyError);

      // 3. Fallback to Low Accuracy
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 10000,
      });

      const distance = getDistance(
        officeLat,
        officeLng,
        pos.coords.latitude,
        pos.coords.longitude
      );

      return { success: true, inside: distance <= GEOFENCE_RADIUS, distance };
    }
  } catch (err: any) {
    console.error("Location check failed:", err);
    return { success: false, inside: false, distance: 0, status: err.message };
  }
};
