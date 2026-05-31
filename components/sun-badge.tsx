type Props = {
  value: number;
  size?: number;
  color?: string;
  ringColor?: string;
  textColor?: string;
};

export default function SunBadge({
  value,
  size = 96,
  color = "#F2BC2B",
  ringColor = "#10243F",
  textColor = "#10243F",
}: Props) {
  const ticks = 20;
  const filled = Math.round((value / 100) * ticks);
  const cx = size / 2;
  const cy = size / 2;
  const rTick1 = size * 0.4;
  const rTick2 = size * 0.48;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        {Array.from({ length: ticks }).map((_, i) => {
          const a = (i / ticks) * Math.PI * 2 - Math.PI / 2;
          const on = i < filled;
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * rTick1}
              y1={cy + Math.sin(a) * rTick1}
              x2={cx + Math.cos(a) * rTick2}
              y2={cy + Math.sin(a) * rTick2}
              stroke={on ? color : ringColor}
              strokeWidth={Math.max(1.5, size * 0.04)}
              strokeLinecap="round"
              opacity={on ? 1 : 0.18}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          className="sg-display"
          style={{
            fontSize: size * 0.38,
            color: textColor,
            lineHeight: 1,
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
