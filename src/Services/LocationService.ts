// src/services/locationService.ts
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { AppLauncher } from '@capacitor/app-launcher';
import { officeLocation } from '../config/constants';

const officeLat = officeLocation.latitude;
const officeLng = officeLocation.longitude;
const GEOFENCE_RADIUS = officeLocation.radius

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

// Opens device location settings (Android/iOS)
export const openLocationSettings = async () => {
  const platform = Capacitor.getPlatform();
  try {
    if (platform === 'android') {
      await AppLauncher.openUrl({
        url: 'intent:#Intent;action=android.settings.LOCATION_SOURCE_SETTINGS;end',
      });
    } else if (platform === 'ios') {
      await AppLauncher.openUrl({ url: 'app-settings:' });
    }
  } catch (err) {
    console.error('Error opening location settings:', err);
  }
};

// Forces user to enable location
export const enableLocation = async (): Promise<boolean> => {
  try {
    const perm = await Geolocation.requestPermissions();
    if (perm.location !== 'granted') return false;

    await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    });
    return true;
  } catch (err: any) {
    console.error('enableLocation error:', err);
    if (err.message?.includes('Location services') || err.code === 2) {
      await openLocationSettings();
    }
    return false;
  }
};

// Quick check for user location within radius
export const quickGeoCheck = async () => {
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
    console.error('Geo check error:', err);
    return { success: false, inside: false, distance: 0 };
  }
};
