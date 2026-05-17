import { useQuery } from "@tanstack/react-query";

import {
  getBathingWaterProfile,
  getBathingWaters,
  getPointForecast,
} from "./api";
import { WeatherParameter } from "@/types/SMHI/WeatherParameters";

export const queryKeys = {
  bathingWaters: ["bathingWaters"],
  bathingWaterProfile: (id: string) => ["bathingWaterProfile", id],
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
    queryFn: getBathingWaters,
    staleTime: 1000 * 60 * 60 * 24,
  });
};

export const useBathingWaterProfile = (id: string) => {
  return useQuery({
    queryKey: queryKeys.bathingWaterProfile(id),
    queryFn: () => getBathingWaterProfile(id),
    enabled: !!id,
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
      return getPointForecast(lat, lon, parameters, timeseries);
    },
    enabled: lat !== null && lon !== null,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
