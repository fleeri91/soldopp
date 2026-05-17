import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GeoPosition = {
  latitude: number;
  longitude: number;
};

export type LocationObject = {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
};

interface GeolocationState {
  geolocation: LocationObject | null;
  loading: boolean;
  error: string | null;
}

interface GeolocationActions {
  setGeolocation: (location: LocationObject) => void;
  clearGeolocation: () => void;
  getCurrentLocation: () => Promise<GeoPosition | null>;
}

type GeolocationStore = GeolocationState & GeolocationActions;

const initialState: GeolocationState = {
  geolocation: null,
  loading: false,
  error: null,
};

export const useGeolocationStore = create<GeolocationStore>()(
  persist(
    (set) => ({
      ...initialState,

      setGeolocation: (location: LocationObject) =>
        set({ geolocation: location, error: null }),

      clearGeolocation: () => set({ geolocation: null, error: null }),

      getCurrentLocation: async (): Promise<GeoPosition | null> => {
        set({ loading: true, error: null });
        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) =>
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10_000,
                maximumAge: 60_000,
              }),
          );

          const locationObject: LocationObject = {
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude,
              accuracy: position.coords.accuracy,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed,
            },
            timestamp: position.timestamp,
          };

          set({ geolocation: locationObject, loading: false });

          return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        } catch (err) {
          const message =
            err instanceof GeolocationPositionError
              ? err.message
              : "Failed to get location";
          set({ error: message, loading: false });
          return null;
        }
      },
    }),
    {
      name: "geolocation-store",
      // Only persist the last known location, not transient state
      partialize: (state) => ({ geolocation: state.geolocation }),
    },
  ),
);
