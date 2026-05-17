import React from 'react';

interface MiniBarProps {
  data: Array<{ month: string; income: number; expense: number }>;
}

export const MiniBar: React.FC<MiniBarProps> = ({ data }) => {
  if (!data?.length) return <div style={{ textAlign: "center", color: "var(--color-text-tertiary)", fontSize: 12, padding: "20px 0" }}>No data yet</div>;
  const max = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 82 }}>
            <div style={{ width: 10, borderRadius: "2px 2px 0 0", background: "#378ADD", height: `${(d.income / max) * 80}px`, minHeight: 2 }} />
            <div style={{ width: 10, borderRadius: "2px 2px 0 0", background: "#D85A30", height: `${(d.expense / max) * 80}px`, minHeight: 2 }} />
          </div>
          <div style={{ fontSize: 9, color: "var(--color-text-tertiary)" }}>{d.month.slice(5, 7)}/{d.month.slice(2, 4)}</div>
        </div>
      ))}
    </div>
  );
};