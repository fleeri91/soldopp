"use client";

import { useEffect, useMemo, useState } from "react";

import FilterPanel from "@/components/filter-panel";
import MunicipalityBrowser from "@/components/municipality-browser";
import SunBadge from "@/components/sun-badge";
import { useBathingWaters, usePointForecast, useResults } from "@/lib/queries";
import { nearestTimeSeries, solScore } from "@/lib/score";
import { useFilterStore, WATER_TYPE_IDS } from "@/store/useFilter";
import { useGeolocationStore } from "@/store/useGeolocation";
import { BathingWater } from "@/types/BathingWaters/BathingWaters";

const MAX_RESULTS = 10;

const C = {
  sun: "#F2BC2B",
  sunDeep: "#D89A0E",
  navy: "#10243F",
  navy2: "#1C3759",
  cream: "#F4ECDA",
  cream2: "#E8DDC2",
  white: "#FBFAF5",
  ink2: "#43526B",
  ink3: "#7F8DA3",
  coral: "#DA4D2E",
  coralSoft: "#F6CFC2",
  green: "#226B49",
  greenSoft: "#C4DCC9",
  amber: "#9B6308",
  amberSoft: "#F2DBA3",
} as const;

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function mapsUrl(lat: string, lon: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}

function Tjanlighet({ status, large = false }: { status: string; large?: boolean }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    Tjänligt: { bg: C.greenSoft, fg: C.green, label: "Tjänligt" },
    "Tjänligt m. anm.": { bg: C.amberSoft, fg: C.amber, label: "M. anmärkning" },
    Otjänligt: { bg: C.coralSoft, fg: C.coral, label: "Otjänligt" },
  };
  const s = map[status] ?? map["Tjänligt"];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: large ? 8 : 5,
        background: s.bg,
        color: s.fg,
        padding: large ? "7px 14px" : "4px 10px 4px 8px",
        borderRadius: 999,
        fontSize: large ? 13 : 11.5,
        fontWeight: 700,
      }}
    >
      <span
        style={{
          width: large ? 7 : 5,
          height: large ? 7 : 5,
          borderRadius: "50%",
          background: s.fg,
          flexShrink: 0,
        }}
      />
      {s.label}
    </span>
  );
}

type EntryProps = { bathingWater: BathingWater & { distance: number } };

function HeroEntry({ bathingWater }: EntryProps) {
  const lat = parseFloat(bathingWater.samplingPointPosition.latitude);
  const lon = parseFloat(bathingWater.samplingPointPosition.longitude);
  const { data: forecast } = usePointForecast(lat, lon);
  const { data: resultsData } = useResults(bathingWater.id);

  const weather = forecast ? nearestTimeSeries(forecast) : null;
  const score = weather
    ? solScore(weather.data.cloud_area_fraction, weather.data.wind_speed)
    : 0;
  const latest = resultsData?.results[0] ?? null;
  const tjanlighet = latest?.sampleAssessIdText ?? "Tjänligt";
  const roundedScore = Math.round(score);

  const takenAt = latest?.takenAt
    ? new Date(latest.takenAt).toLocaleDateString("sv-SE", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <div style={{ background: C.sun, padding: "20px 18px 22px" }}>
      <div className="sg-label" style={{ color: C.navy, opacity: 0.7 }}>
        BÄSTA VALET · #1
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: 8,
          gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="sg-display"
            style={{ fontSize: 30, lineHeight: 1.05, color: C.navy }}
          >
            {bathingWater.name}
          </div>
          <div
            className="sg-mono"
            style={{ fontSize: 11, marginTop: 5, color: C.navy, opacity: 0.7 }}
          >
            {bathingWater.municipality.name.toUpperCase()} ·{" "}
            {bathingWater.waterTypeIdText.toUpperCase()}
          </div>
          <div style={{ marginTop: 10 }}>
            <Tjanlighet status={tjanlighet} />
          </div>
        </div>
        <SunBadge
          value={roundedScore}
          size={110}
          color={C.navy}
          ringColor={C.navy}
          textColor={C.navy}
        />
      </div>

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 6,
        }}
      >
        {[
          { l: "LUFT", v: weather ? `${weather.data.air_temperature.toFixed(0)}°` : "—" },
          { l: "VIND", v: weather ? `${weather.data.wind_speed.toFixed(0)} m/s` : "—" },
          { l: "MOLN", v: weather ? `${Math.round(weather.data.cloud_area_fraction * 12.5)}%` : "—" },
          {
            l: "VATTEN",
            v: latest?.waterTemp ? `${latest.waterTemp}°` : "—",
            sub: takenAt ? takenAt : undefined,
          },
        ].map((m) => (
          <div
            key={m.l}
            style={{ borderTop: `2px solid ${C.navy}`, paddingTop: 6 }}
          >
            <div
              className="sg-label"
              style={{ color: C.navy, opacity: 0.7, fontSize: 9 }}
            >
              {m.l}
            </div>
            <div
              className="sg-display sg-tab"
              style={{ fontSize: 18, color: C.navy, lineHeight: 1, marginTop: 3 }}
            >
              {m.v}
            </div>
            {"sub" in m && m.sub && (
              <div className="sg-mono" style={{ fontSize: 9, color: C.navy, opacity: 0.6, marginTop: 1 }}>
                {m.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="sg-mono" style={{ fontSize: 11, color: C.navy }}>
          {bathingWater.distance.toFixed(1)} km
        </div>
        <a
          href={mapsUrl(
            bathingWater.samplingPointPosition.latitude,
            bathingWater.samplingPointPosition.longitude,
          )}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: C.navy,
            color: C.sun,
            padding: "8px 14px",
            borderRadius: 999,
            textDecoration: "none",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Åk hit →
        </a>
      </div>
    </div>
  );
}

function RowEntry({ bathingWater, rank }: EntryProps & { rank: number }) {
  const lat = parseFloat(bathingWater.samplingPointPosition.latitude);
  const lon = parseFloat(bathingWater.samplingPointPosition.longitude);
  const { data: forecast } = usePointForecast(lat, lon);
  const { data: resultsData } = useResults(bathingWater.id);

  const weather = forecast ? nearestTimeSeries(forecast) : null;
  const score = weather
    ? solScore(weather.data.cloud_area_fraction, weather.data.wind_speed)
    : 0;
  const latest = resultsData?.results[0] ?? null;
  const tjanlighet = latest?.sampleAssessIdText ?? "Tjänligt";
  const roundedScore = Math.round(score);

  return (
    <div
      style={{
        background: C.white,
        border: `1.5px solid ${C.cream2}`,
        borderRadius: 16,
        padding: "12px 14px",
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <SunBadge
          value={roundedScore}
          size={56}
          color={C.sunDeep}
          ringColor={C.navy}
          textColor={C.navy}
        />
        <div className="sg-label" style={{ fontSize: 9, color: C.ink3 }}>#{rank}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            alignItems: "baseline",
          }}
        >
          <div
            className="sg-display"
            style={{
              fontSize: 17,
              color: C.navy,
              lineHeight: 1.1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {bathingWater.name}
          </div>
          <div
            className="sg-mono sg-tab"
            style={{ fontSize: 11, color: C.ink2, flexShrink: 0 }}
          >
            {bathingWater.distance.toFixed(1)} km
          </div>
        </div>
        <div className="sg-mono" style={{ fontSize: 10, color: C.ink3, marginTop: 2 }}>
          {bathingWater.municipality.name.toUpperCase()} ·{" "}
          {bathingWater.waterTypeIdText.toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginTop: 8,
            flexWrap: "wrap",
          }}
        >
          <Tjanlighet status={tjanlighet} />
          {weather && (
            <span className="sg-mono" style={{ fontSize: 11, color: C.ink2 }}>
              {weather.data.air_temperature.toFixed(0)}° ·{" "}
              {weather.data.wind_speed.toFixed(0)} m/s ·{" "}
              {Math.round(weather.data.cloud_area_fraction * 12.5)}% moln
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RecommendationList() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [geoRequested, setGeoRequested] = useState(false);

  const { geolocation, loading: geoLoading, getCurrentLocation } =
    useGeolocationStore();
  const { radius, waterType } = useFilterStore();
  const isFilterModified = radius !== 20 || waterType !== "alla";

  const lat = geolocation?.coords.latitude ?? null;
  const lon = geolocation?.coords.longitude ?? null;

  useEffect(() => {
    if (!geolocation) {
      setGeoRequested(true);
      getCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: bathingWatersData, isLoading: watersLoading } =
    useBathingWaters();

  const nearbyWaters = useMemo(() => {
    if (!geolocation || !bathingWatersData) return [];
    const userLat = geolocation.coords.latitude;
    const userLon = geolocation.coords.longitude;
    const allowedTypes = WATER_TYPE_IDS[waterType];

    return bathingWatersData.watersAndAdvisories
      .map(({ bathingWater }) => ({
        ...bathingWater,
        distance: haversineKm(
          userLat,
          userLon,
          parseFloat(bathingWater.samplingPointPosition.latitude),
          parseFloat(bathingWater.samplingPointPosition.longitude),
        ),
      }))
      .filter(
        (w) =>
          w.distance <= radius &&
          (allowedTypes === null || allowedTypes.includes(w.waterTypeId)),
      )
      .sort((a, b) => a.distance - b.distance)
      .slice(0, MAX_RESULTS);
  }, [geolocation, bathingWatersData, radius, waterType]);

  if (!geolocation) {
    if (!geoRequested || geoLoading) {
      return (
        <div style={{ background: C.cream, minHeight: "100dvh" }}>
          <div style={{ background: C.navy, padding: "14px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="sg-display" style={{ fontSize: 22, color: C.cream }}>
                soldopp
              </div>
            </div>
          </div>
          <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 88,
                  borderRadius: 16,
                  background: C.cream2,
                  opacity: 0.6,
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ))}
          </div>
        </div>
      );
    }
    return <MunicipalityBrowser />;
  }

  const [hero, ...rest] = nearbyWaters;

  return (
    <div style={{ background: C.cream, minHeight: "100dvh" }}>
      {/* Header */}
      <div style={{ background: C.navy, padding: "12px 18px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="sg-display" style={{ fontSize: 22, letterSpacing: "-0.04em", color: C.cream }}>
            soldopp
          </div>
          <button
            onClick={() => setFilterOpen(true)}
            aria-label="Öppna filter"
            style={{
              background: "transparent",
              border: `1.5px solid ${C.cream}`,
              borderRadius: 999,
              padding: "7px 14px 7px 12px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: C.cream,
              cursor: "pointer",
              fontFamily: "inherit",
              position: "relative",
            }}
          >
            <FilterIcon color={C.cream} />
            <span className="sg-mono" style={{ fontSize: 12, letterSpacing: "0.02em" }}>
              Filter
            </span>
            {isFilterModified && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: C.sun,
                  border: `1.5px solid ${C.navy}`,
                }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {watersLoading ? (
        <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{ height: 88, borderRadius: 16, background: C.cream2, opacity: 0.6 }}
            />
          ))}
        </div>
      ) : !hero ? (
        <div style={{ padding: "40px 20px", textAlign: "center" }}>
          <div className="sg-display" style={{ fontSize: 22, color: C.navy }}>
            Inga badplatser inom {radius} km
          </div>
          <p className="sg-mono" style={{ fontSize: 12, color: C.ink3, marginTop: 8 }}>
            Prova att öka radien i filter.
          </p>
        </div>
      ) : (
        <>
          <HeroEntry bathingWater={hero} />

          {rest.length > 0 && (
            <>
              <div
                style={{
                  padding: "18px 16px 8px",
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
                <div className="sg-display" style={{ fontSize: 22, color: C.navy }}>
                  Fler nära dig
                </div>
                <div className="sg-mono" style={{ fontSize: 11, color: C.ink3 }}>
                  {rest.length} platser
                </div>
              </div>
              <div
                style={{
                  padding: "0 16px 32px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {rest.map((water, i) => (
                  <RowEntry key={water.id} bathingWater={water} rank={i + 2} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <FilterPanel open={filterOpen} onClose={() => setFilterOpen(false)} />
    </div>
  );
}

function FilterIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  );
}
