import React from 'react';
import { DONUT_COLORS } from '../../lib/constants';

interface MiniDonutProps {
  data: Array<{ name: string; value: number }>;
}

export const MiniDonut: React.FC<MiniDonutProps> = ({ data }) => {
  if (!data?.length) return <div style={{ textAlign: "center", color: "var(--color-text-tertiary)", fontSize: 12, padding: "20px 0" }}>No data yet</div>;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;
  const r = 28, circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <svg width="76" height="76" viewBox="0 0 76 76">
        {data.map((d, i) => {
          const dash = (d.value / total) * circ;
          const el = (
            <circle
              key={i}
              cx="38"
              cy="38"
              r={r}
              fill="none"
              stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
              strokeWidth="13"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              style={{ transform: "rotate(-90deg)", transformOrigin: "38px 38px" }}
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--color-text-secondary)" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: DONUT_COLORS[i % DONUT_COLORS.length] }} />{d.name} — {Math.round(d.value / total * 100)}%
          </div>
        ))}
      </div>
    </div>
  );
};