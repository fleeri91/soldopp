"use client";

import { useGeolocationStore } from "@/store/useGeolocation";

export default function GeolocationButton() {
  const { geolocation, loading, error, getCurrentLocation, clearGeolocation } =
    useGeolocationStore();

  const hasLocation = geolocation !== null;

  if (hasLocation) {
    return (
      <button
        onClick={clearGeolocation}
        className="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 transition hover:bg-blue-200"
      >
        <span>📍</span>
        <span>Min plats aktiv</span>
        <span className="text-blue-500">✕</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={getCurrentLocation}
        disabled={loading}
        className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        <span>📍</span>
        <span>{loading ? "Hämtar plats…" : "Hitta min plats"}</span>
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
