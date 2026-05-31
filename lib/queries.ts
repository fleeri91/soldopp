import { useQuery } from "@tanstack/react-query";

import { BathingWaterResult } from "@/types/BathingWaters/BathingWaterResult";
import { BathingWaters } from "@/types/BathingWaters/BathingWaters";
import { PointForecast } from "@/types/SMHI/PointForecast";
import { WeatherParameter } from "@/types/SMHI/WeatherParameters";

export const queryKeys = {
  bathingWaters: ["bathingWaters"],
  results: (id: string) => ["results", id],
  pointForecast: (
    lat: number | null,
    lon: number | null,
    parameters?: WeatherParameter[],
    timeseries?: number,
  ) => ["smhiForecast", lat, lon, { parameters, timeseries }],
};

export const useBathingWaters = () => {
  return useQuery({
    queryKey: queryKeys.bathingWaters,
    queryFn: async () => {
      const res = await fetch("/api/bathing-waters");
      if (!res.ok) throw new Error("Failed to fetch bathing waters");
      return res.json() as Promise<BathingWaters>;
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
};

export const useResults = (id: string) => {
  return useQuery({
    queryKey: queryKeys.results(id),
    queryFn: async () => {
      const res = await fetch(`/api/bathing-water/${id}/results`);
      if (!res.ok) throw new Error("Failed to fetch results");
      return res.json() as Promise<BathingWaterResult>;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 60 * 6,
  });
};

export const usePointForecast = (
  lat: number | null,
  lon: number | null,
  parameters?: WeatherParameter[],
  timeseries?: number,
) => {
  return useQuery({
    queryKey: queryKeys.pointForecast(lat, lon, parameters, timeseries),
    queryFn: async () => {
      if (lat === null || lon === null) {
        throw new Error("Query function triggered without valid coordinates");
      }
      const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lon),
      });
      if (parameters?.length) params.set("parameters", parameters.join(","));
      if (timeseries !== undefined) params.set("timeseries", String(timeseries));
      const res = await fetch(`/api/forecast?${params}`);
      if (!res.ok) throw new Error("Failed to fetch forecast");
      return res.json() as Promise<PointForecast>;
    },
    enabled: lat !== null && lon !== null,
    staleTime: 1000 * 60 * 30,
  });
};
