import React, { useMemo } from 'react';
import { S, MONTHS } from '../../lib/constants';
import { FE } from '../../lib/financeEngine';
import { Icon } from '../shared/Icon';
import { TypeBadge } from '../shared/TypeBadge';
import { OverallRow, UserSettings } from '../../types/finance';
import { formatUSD, formatINR } from '../../lib/formatters';

interface OverallViewProps {
  overallRows: OverallRow[];
  allYearsRows: Record<string, OverallRow[]>;
  settings: UserSettings;
  subView: string;
  onSubViewChange: (sub: string) => void;
}

export const OverallView: React.FC<OverallViewProps> = ({
  overallRows,
  allYearsRows,
  settings,
  subView,
  onSubViewChange,
}) => {
  const monthly = useMemo(() => FE.monthlySummary(overallRows), [overallRows]);
  const category = useMemo(() => FE.categorySummary(overallRows), [overallRows]);
  const yearly = useMemo(() => FE.yearlyComparison(allYearsRows), [allYearsRows]);
  const fmt = (n: number) => settings.displayCurrency === 'INR' ? formatINR(n * settings.exchangeRate) : formatUSD(n);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 16, padding: 4, background: "var(--color-background-secondary)", borderRadius: 8, width: "fit-content" }}>
        {[["monthly", "Monthly summary"], ["category", "Category summary"], ["yearly", "Yearly comparison"]].map(([v, l]) => (
          <div
            key={v}
            onClick={() => onSubViewChange(v)}
            style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: subView === v ? 500 : 400, background: subView === v ? "var(--color-background-primary)" : "transparent", color: subView === v ? "var(--color-text-primary)" : "var(--color-text-secondary)", border: subView === v ? "0.5px solid var(--color-border-secondary)" : "none" }}
          >
            {l}
          </div>
        ))}
      </div>

      {subView === "monthly" && (
        monthly.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--color-text-tertiary)" }}>No data yet</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr>{["Month", "Income", "Expenses", "Savings", "Biggest category"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {monthly.map((r, i) => (
                <tr key={i} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                  <td style={S.td}><strong>{r.month}</strong></td>
                  <td style={{ ...S.td, color: "#27500A" }}>{fmt(r.income)}</td>
                  <td style={{ ...S.td, color: "#712B13" }}>{fmt(r.expense)}</td>
                  <td style={{ ...S.td, color: r.savings >= 0 ? "#27500A" : "#712B13", fontWeight: 500 }}>{fmt(r.savings)}</td>
                  <td style={S.tdMuted}>{r.biggestCat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {subView === "category" && (
        category.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--color-text-tertiary)" }}>No data yet</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={S.th}>Category</th>
                  <th style={S.th}>Type</th>
                  {MONTHS.map(m => <th key={m} style={{ ...S.th, textAlign: "right" }}>{m}</th>)}
                  <th style={{ ...S.th, textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {category.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                    <td style={S.td}><strong>{r.name}</strong></td>
                    <td style={S.td}><TypeBadge type={r.type} /></td>
                    {MONTHS.map(m => <td key={m} style={{ ...S.td, textAlign: "right", color: "var(--color-text-secondary)" }}>{r.months[m] ? fmt(r.months[m]) : "—"}</td>)}
                    <td style={{ ...S.td, textAlign: "right", fontWeight: 500 }}>{fmt(r.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {subView === "yearly" && (
        yearly.rows.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--color-text-tertiary)" }}>No data yet</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                <th style={S.th}>Category</th>
                <th style={S.th}>Type</th>
                {yearly.years.map(y => <th key={y} style={{ ...S.th, textAlign: "right" }}>{y}</th>)}
                <th style={{ ...S.th, textAlign: "center" }}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {yearly.rows.map((r, i) => {
                const vals = yearly.years.map(y => r.years[y] || 0);
                const up = vals.length > 1 && vals[vals.length - 1] > vals[vals.length - 2];
                return (
                  <tr key={i} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                    <td style={S.td}><strong>{r.name}</strong></td>
                    <td style={S.td}><TypeBadge type={r.type} /></td>
                    {yearly.years.map(y => <td key={y} style={{ ...S.td, textAlign: "right" }}>{r.years[y] ? fmt(r.years[y]) : "—"}</td>)}
                    <td style={{ ...S.td, textAlign: "center" }}><Icon n={`ti-trending-${up ? "up" : "down"}`} size={14} color={up ? "#1D9E75" : "#D85A30"} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )
      )}
    </div>
  );
};