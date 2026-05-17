import { BathingWaterProfile } from "@/types/BathingWaters/BathingWaterProfile";
import { BathingWaters } from "@/types/BathingWaters/BathingWaters";
import { PointForecast } from "@/types/SMHI/PointForecast";
import { WeatherParameter } from "@/types/SMHI/WeatherParameters";

const SMHI_BASE =
  "https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point";

const HAVVATTEN_BASE =
  "https://gw.havochvatten.se/external-public/bathing-waters/v2";

export const getPointForecast = async (
  lat: number,
  lon: number,
  parameters?: WeatherParameter[],
  timeseries?: number,
): Promise<PointForecast> => {
  const queryParams = new URLSearchParams();

  if (timeseries !== undefined) {
    queryParams.append("timeseries", timeseries.toString());
  }

  if (parameters && parameters.length > 0) {
    queryParams.append("parameters", parameters.join(","));
  }

  const queryString = queryParams.toString();
  const url = `${SMHI_BASE}/lon/${lon.toFixed(6)}/lat/${lat.toFixed(6)}/data.json${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`SMHI response was not ok: ${response.statusText}`);
  }

  const data: PointForecast = await response.json();
  return data;
};

export const getBathingWaters = async (): Promise<BathingWaters> => {
  const response = await fetch(`${HAVVATTEN_BASE}/bathing-waters`);

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.statusText}`);
  }

  const data: BathingWaters = await response.json();
  return data;
};

export const getBathingWaterProfile = async (
  id: string,
): Promise<BathingWaterProfile> => {
  const response = await fetch(
    `${HAVVATTEN_BASE}/bathing-waters/${id}/profiles`,
  );

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.statusText}`);
  }

  const data: BathingWaterProfile = await response.json();
  return data;
};
