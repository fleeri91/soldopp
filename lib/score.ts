import { PointForecast, TimeSeries } from "@/types/SMHI/PointForecast";

export function solScore(cloudAreaFraction: number, windSpeed: number): number {
  return Math.max(
    0,
    100 - cloudAreaFraction * 12.5 - Math.max(0, (windSpeed - 5) * 3),
  );
}

export function nearestTimeSeries(forecast: PointForecast): TimeSeries {
  const now = Date.now();
  return forecast.timeSeries.reduce((nearest, entry) => {
    const d = Math.abs(new Date(entry.time).getTime() - now);
    const dNearest = Math.abs(new Date(nearest.time).getTime() - now);
    return d < dNearest ? entry : nearest;
  });
}

export function solScoreFromForecast(forecast: PointForecast): number {
  const entry = nearestTimeSeries(forecast);
  return solScore(entry.data.cloud_area_fraction, entry.data.wind_speed);
}
