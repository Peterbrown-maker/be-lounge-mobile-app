import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

export type LocationStatus = 'idle' | 'locating' | 'ready' | 'denied' | 'error';

export interface CurrentLocation {
  latitude: number;
  longitude: number;
  /** Short label for chips, e.g. "Block L, Soshanguve". */
  label: string;
  /** Full human-readable address used for orders. */
  address: string;
}

interface State {
  status: LocationStatus;
  location: CurrentLocation | null;
}

// Shared across screens so Home and Checkout show the same fix without re-asking.
let state: State = { status: 'idle', location: null };
let inflight: Promise<void> | null = null;
const listeners = new Set<(s: State) => void>();

const setState = (next: State) => {
  state = next;
  listeners.forEach((l) => l(state));
};

const describe = (place: Location.LocationGeocodedAddress | undefined, lat: number, lng: number) => {
  const coords = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  if (!place) return { label: 'Current location', address: coords };
  const street = [place.streetNumber, place.street].filter(Boolean).join(' ');
  const area = place.district || place.subregion || place.city || '';
  const label = [street || place.name, area].filter(Boolean).join(', ') || 'Current location';
  const address =
    [street || place.name, place.district, place.city, place.postalCode].filter(Boolean).join(', ') || coords;
  return { label, address };
};

const locate = async () => {
  setState({ ...state, status: 'locating' });
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setState({ status: 'denied', location: null });
      return;
    }
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const { latitude, longitude } = pos.coords;
    let place: Location.LocationGeocodedAddress | undefined;
    try {
      // Uses the phone's built-in geocoder — no API key or backend.
      [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
    } catch {}
    setState({ status: 'ready', location: { latitude, longitude, ...describe(place, latitude, longitude) } });
  } catch (e) {
    console.warn('Could not get current location:', e);
    setState({ status: 'error', location: state.location });
  }
};

const refreshLocation = () => {
  if (!inflight) inflight = locate().finally(() => (inflight = null));
  return inflight;
};

/** Current device location (asks permission on first use). */
export function useCurrentLocation() {
  const [snapshot, setSnapshot] = useState<State>(state);

  useEffect(() => {
    listeners.add(setSnapshot);
    if (state.status === 'idle') refreshLocation();
    return () => {
      listeners.delete(setSnapshot);
    };
  }, []);

  const refresh = useCallback(() => refreshLocation(), []);
  return { ...snapshot, refresh };
}
