export interface PointForecast {
  createdTime: string;
  referenceTime: string;
  geometry: Geometry;
  timeSeries: TimeSeries[];
}

export interface Geometry {
  type: string;
  coordinates: number[];
}

export interface TimeSeries {
  time: string;
  intervalParametersStartTime: string;
  data: Data;
}

export interface Data {
  air_temperature: number;
  wind_speed: number;
  wind_speed_of_gust: number;
  thunderstorm_probability: number;
  cloud_area_fraction: number;
  probability_of_precipitation: number;
}
