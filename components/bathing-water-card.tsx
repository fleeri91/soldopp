import { Result } from "@/types/BathingWaters/BathingWaterResult";
import { BathingWater } from "@/types/BathingWaters/BathingWaters";
import { TimeSeries } from "@/types/SMHI/PointForecast";

type Props = {
  bathingWater: BathingWater;
  score: number;
  weather: TimeSeries;
  latestResult?: Result | null;
};

function scoreColor(score: number) {
  if (score >= 70) return "bg-yellow-400 text-yellow-900";
  if (score >= 40) return "bg-yellow-100 text-yellow-800";
  return "bg-gray-100 text-gray-600";
}

export default function BathingWaterCard({
  bathingWater,
  score,
  weather,
  latestResult,
}: Props) {
  const isUnsuitable = latestResult?.sampleAssessIdText === "Otjänligt";
  const roundedScore = Math.round(score);

  const takenAtFormatted = latestResult?.takenAt
    ? new Date(latestResult.takenAt).toLocaleDateString("sv-SE", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      {isUnsuitable && (
        <div className="mb-3 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white">
          Otjänligt badvattenkvalitet
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-gray-900">
            {bathingWater.name}
          </h2>
          <p className="text-sm text-gray-500">{bathingWater.municipality.name}</p>
        </div>

        <div
          className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-center ${scoreColor(roundedScore)}`}
        >
          <span className="text-lg font-bold leading-none">{roundedScore}</span>
          <span className="block text-xs font-medium">sol</span>
        </div>
      </div>

      <div className="mt-3 flex gap-4 text-sm text-gray-700">
        <span title="Lufttemperatur">
          🌡 {weather.data.air_temperature.toFixed(1)} °C
        </span>
        <span title="Vindhastighet">
          💨 {weather.data.wind_speed.toFixed(1)} m/s
        </span>
        {latestResult?.waterTemp && (
          <span title={takenAtFormatted ? `Provtaget ${takenAtFormatted}` : undefined}>
            🏊 {latestResult.waterTemp} °C
            {takenAtFormatted && (
              <span className="ml-1 text-xs text-gray-400">({takenAtFormatted})</span>
            )}
          </span>
        )}
      </div>
    </article>
  );
}
