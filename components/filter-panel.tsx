"use client";

import { RADIUS_OPTIONS, WaterType, useFilterStore } from "@/store/useFilter";

const C = {
  sun: "#F2BC2B",
  navy: "#10243F",
  cream: "#F4ECDA",
  cream2: "#E8DDC2",
  white: "#FBFAF5",
  ink2: "#43526B",
  ink3: "#7F8DA3",
} as const;

type Props = {
  open: boolean;
  onClose: () => void;
};

const WATER_TYPES: { value: WaterType; label: string }[] = [
  { value: "alla", label: "Alla" },
  { value: "sjö", label: "Sjö" },
  { value: "hav", label: "Hav" },
];

export default function FilterPanel({ open, onClose }: Props) {
  const { radius, waterType, setRadius, setWaterType, reset } = useFilterStore();

  return (
    <>
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            background: "rgba(16,36,63,0.45)",
          }}
          onClick={onClose}
        />
      )}

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: C.cream,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: "12px 18px 28px",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 300ms ease",
        }}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{ width: 44, height: 4, borderRadius: 2, background: C.cream2 }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 14,
          }}
        >
          <div>
            <div className="sg-label" style={{ color: C.ink3 }}>JUSTERA</div>
            <div className="sg-display" style={{ fontSize: 26, color: C.navy, marginTop: 2 }}>
              Filter
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Stäng filter"
            style={{
              background: C.white,
              border: `1.5px solid ${C.cream2}`,
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2.4" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Radius */}
        <div style={{ marginTop: 20 }}>
          <div className="sg-label" style={{ color: C.ink2 }}>MAXRADIE</div>
          <div
            style={{
              marginTop: 10,
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 8,
            }}
          >
            {RADIUS_OPTIONS.map((r) => (
              <Chip
                key={r}
                active={radius === r}
                onClick={() => setRadius(r)}
              >
                <span className="sg-display sg-tab" style={{ fontSize: 22, lineHeight: 1 }}>
                  {r}
                </span>
                <span className="sg-mono" style={{ fontSize: 10, opacity: 0.7 }}>km</span>
              </Chip>
            ))}
          </div>
        </div>

        {/* Water type */}
        <div style={{ marginTop: 18 }}>
          <div className="sg-label" style={{ color: C.ink2 }}>VATTENTYP</div>
          <div
            style={{
              marginTop: 10,
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
            }}
          >
            {WATER_TYPES.map(({ value, label }) => (
              <Chip
                key={value}
                active={waterType === value}
                onClick={() => setWaterType(value)}
              >
                <span className="sg-display" style={{ fontSize: 18, lineHeight: 1 }}>
                  {label}
                </span>
              </Chip>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginTop: 22, display: "flex", gap: 8 }}>
          <button
            onClick={reset}
            style={{
              flex: 1,
              background: C.white,
              color: C.navy,
              border: `1.5px solid ${C.cream2}`,
              borderRadius: 999,
              padding: "14px 0",
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Återställ
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 2,
              background: C.navy,
              color: C.sun,
              border: "none",
              borderRadius: 999,
              padding: "14px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            <span>Visa resultat</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? C.navy : C.white,
        color: active ? C.sun : C.navy,
        border: `1.5px solid ${active ? C.navy : C.cream2}`,
        borderRadius: 14,
        padding: "13px 0",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}
