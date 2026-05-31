"use client";

import { useMemo, useState } from "react";

import SunBadge from "@/components/sun-badge";
import { MunicipalityName } from "@/constants/municipalities";
import { useBathingWaters, useResults } from "@/lib/queries";
import { useGeolocationStore } from "@/store/useGeolocation";
import { useMapFilterStore } from "@/store/useMapFilter";
import { BathingWater } from "@/types/BathingWaters/BathingWaters";

const C = {
  sun: "#F2BC2B",
  sunDeep: "#D89A0E",
  navy: "#10243F",
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

function WaterItem({ bathingWater }: { bathingWater: BathingWater }) {
  const { data: resultsData } = useResults(bathingWater.id);
  const latest = resultsData?.results[0] ?? null;
  const isUnsuitable = latest?.sampleAssessIdText === "Otjänligt";

  const takenAt = latest?.takenAt
    ? new Date(latest.takenAt).toLocaleDateString("sv-SE", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <li
      style={{
        background: C.white,
        border: `1.5px solid ${C.cream2}`,
        borderRadius: 14,
        padding: "12px 14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          className="sg-display"
          style={{
            fontSize: 17,
            color: C.navy,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {bathingWater.name}
        </div>
        {latest?.waterTemp ? (
          <div className="sg-mono" style={{ fontSize: 11, color: C.ink2, marginTop: 3 }}>
            🏊 {latest.waterTemp}°
            {takenAt && (
              <span style={{ color: C.ink3, marginLeft: 4 }}>({takenAt})</span>
            )}
          </div>
        ) : (
          <div className="sg-mono" style={{ fontSize: 11, color: C.ink3, marginTop: 3 }}>
            Ingen temperaturdata
          </div>
        )}
      </div>
      {isUnsuitable && (
        <span
          style={{
            flexShrink: 0,
            background: C.coralSoft,
            color: C.coral,
            borderRadius: 999,
            padding: "3px 10px",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          Otjänligt
        </span>
      )}
    </li>
  );
}

export default function MunicipalityBrowser() {
  const { municipality, setMunicipality } = useMapFilterStore();
  const { getCurrentLocation, loading: geoLoading } = useGeolocationStore();
  const [search, setSearch] = useState("");
  const { data: bathingWatersData, isLoading } = useBathingWaters();

  const availableMunicipalities = useMemo(() => {
    if (!bathingWatersData) return [];
    const names = new Set(
      bathingWatersData.watersAndAdvisories.map(
        ({ bathingWater }) => bathingWater.municipality.name,
      ),
    );
    return Array.from(names).sort((a, b) => a.localeCompare(b, "sv"));
  }, [bathingWatersData]);

  const filteredMunicipalities = useMemo(() => {
    if (!search.trim()) return availableMunicipalities;
    const q = search.toLowerCase();
    return availableMunicipalities.filter((m) => m.toLowerCase().includes(q));
  }, [availableMunicipalities, search]);

  const watersInMunicipality = useMemo(() => {
    if (!municipality || !bathingWatersData) return [];
    return bathingWatersData.watersAndAdvisories
      .filter(({ bathingWater }) => bathingWater.municipality.name === municipality)
      .map(({ bathingWater }) => bathingWater);
  }, [municipality, bathingWatersData]);

  if (municipality) {
    return (
      <div style={{ background: C.cream, minHeight: "100dvh" }}>
        <div style={{ background: C.navy, padding: "12px 18px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setMunicipality(null)}
              style={{
                background: "transparent",
                border: `1.5px solid ${C.cream}`,
                borderRadius: 999,
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
              aria-label="Tillbaka"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.cream} strokeWidth="2" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div>
              <div className="sg-display" style={{ fontSize: 20, color: C.cream }}>
                {municipality}
              </div>
              <div className="sg-label" style={{ color: C.sun, marginTop: 2 }}>
                {watersInMunicipality.length} BADPLATSER
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: "16px 16px 32px" }}>
          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height: 70, borderRadius: 14, background: C.cream2, opacity: 0.6 }} />
              ))}
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {watersInMunicipality.map((water) => (
                <WaterItem key={water.id} bathingWater={water} />
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.cream, minHeight: "100dvh" }}>
      {/* Marigold header */}
      <div
        style={{
          background: C.sun,
          padding: "20px 18px 28px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <div className="sg-display" style={{ fontSize: 22, color: C.navy }}>
            soldopp
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SunBadge value={100} size={120} color={C.navy} ringColor={C.navy} textColor={C.navy} />
        </div>
        <div
          className="sg-display"
          style={{ fontSize: 30, textAlign: "center", marginTop: 16, color: C.navy, lineHeight: 1.05 }}
        >
          Var söker du?
        </div>
        <div
          style={{
            fontSize: 15,
            lineHeight: 1.45,
            marginTop: 10,
            color: C.navy,
            textAlign: "center",
            opacity: 0.8,
            padding: "0 12px",
          }}
        >
          Välj en kommun för att se badplatser.
        </div>
      </div>

      {/* GPS retry */}
      <div style={{ padding: "20px 16px 0", marginTop: -16 }}>
        <button
          onClick={getCurrentLocation}
          disabled={geoLoading}
          style={{
            width: "100%",
            background: C.navy,
            color: C.sun,
            border: "none",
            borderRadius: 999,
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "inherit",
            fontWeight: 700,
            fontSize: 15,
            cursor: geoLoading ? "default" : "pointer",
            opacity: geoLoading ? 0.7 : 1,
            boxShadow: "0 8px 20px rgba(16,36,63,0.2)",
          }}
        >
          <span>{geoLoading ? "Hämtar plats…" : "Försök med GPS igen"}</span>
          <span>→</span>
        </button>
      </div>

      {/* Divider */}
      <div
        style={{
          padding: "20px 16px 0",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ flex: 1, height: 1.5, background: C.cream2 }} />
        <span className="sg-mono" style={{ fontSize: 10, color: C.ink3, letterSpacing: "0.18em" }}>
          ELLER SÖK KOMMUN
        </span>
        <div style={{ flex: 1, height: 1.5, background: C.cream2 }} />
      </div>

      {/* Search */}
      <div style={{ padding: "16px 16px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: C.white,
            border: `1.5px solid ${C.cream2}`,
            borderRadius: 14,
            padding: "13px 16px",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.ink2} strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="t.ex. Göteborg"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: "inherit",
              fontSize: 16,
              color: C.navy,
            }}
          />
        </div>

        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6, paddingBottom: 32 }}>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ height: 52, borderRadius: 12, background: C.cream2, opacity: 0.6 }} />
              ))
            : filteredMunicipalities.length === 0
            ? (
              <p className="sg-mono" style={{ fontSize: 12, color: C.ink3, textAlign: "center", marginTop: 12 }}>
                Ingen träff.
              </p>
            )
            : filteredMunicipalities.map((name) => (
                <button
                  key={name}
                  onClick={() => setMunicipality(name as MunicipalityName)}
                  style={{
                    background: C.white,
                    border: `1.5px solid ${C.cream2}`,
                    borderRadius: 12,
                    padding: "13px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.sunDeep} strokeWidth="2" strokeLinecap="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="sg-display" style={{ fontSize: 16, color: C.navy, letterSpacing: "-0.02em" }}>
                      {name}
                    </span>
                  </div>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.ink3} strokeWidth="2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
        </div>
      </div>
    </div>
  );
}
