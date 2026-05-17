import { getPointForecast } from "@/lib/api";
import { WeatherParameter } from "@/types/SMHI/WeatherParameters";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lon = parseFloat(searchParams.get("lon") ?? "");

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json(
      { error: "Missing or invalid lat/lon query parameters" },
      { status: 400 },
    );
  }

  const parametersRaw = searchParams.get("parameters");
  const parameters = parametersRaw
    ? (parametersRaw.split(",") as WeatherParameter[])
    : undefined;

  const timeseriesRaw = searchParams.get("timeseries");
  const timeseries =
    timeseriesRaw !== null ? parseInt(timeseriesRaw, 10) : undefined;

  const data = await getPointForecast(lat, lon, parameters, timeseries);
  return NextResponse.json(data);
}
