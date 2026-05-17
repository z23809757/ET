import React, { useMemo } from 'react';
import { S, MONTHS } from '../../lib/constants';
import { FE } from '../../lib/financeEngine';
import { Icon } from '../shared/Icon';
import { TypeBadge } from '../shared/TypeBadge';
import { OverallRow, UserSettings } from '../../types/finance';
import { formatUSD, formatINR } from '../../lib/formatters';

interface AllYearsOverviewProps {
  allYearsRows: Record<string, OverallRow[]>;
  settings: UserSettings;
}

export const AllYearsOverview: React.FC<AllYearsOverviewProps> = ({ allYearsRows, settings }) => {
  // Combine all rows from all years
  const allRows = useMemo(() => {
    const combined: OverallRow[] = [];
    for (const year in allYearsRows) {
      combined.push(...allYearsRows[year]);
    }
    return combined;
  }, [allYearsRows]);

  const monthly = useMemo(() => FE.monthlySummary(allRows), [allRows]);
  const category = useMemo(() => FE.categorySummary(allRows), [allRows]);
  const yearly = useMemo(() => FE.yearlyComparison(allYearsRows), [allYearsRows]);
  
  const fmt = (n: number) => settings.displayCurrency === 'INR' ? formatINR(n * settings.exchangeRate) : formatUSD(n);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 8 }}>
          All Years Overview
        </h2>
        <p style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
          Combined data from {Object.keys(allYearsRows).length} years
        </p>
      </div>

      {/* Yearly Comparison Table */}
      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 12 }}>
          Yearly Comparison
        </div>
        {yearly.rows.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--color-text-tertiary)" }}>No data yet</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
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
                      {yearly.years.map(y => <td key={y} style={{ ...S.td, textAlign: "right" }}>{r.years[y] ? fmt(r.years[y]) : "-- ----"}</td>)}
                      <td style={{ ...S.td, textAlign: "center" }}>
                        <Icon n={`ti-trending-${up ? "up" : "down"}`} size={14} color={up ? "#1D9E75" : "#D85A30"} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Monthly Summary - All Years Combined */}
      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 12 }}>
          Monthly Summary (All Years Combined)
        </div>
        {monthly.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--color-text-tertiary)" }}>No data yet</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  {["Month", "Income", "Expenses", "Savings", "Biggest Category"].map(h => <th key={h} style={S.th}>{h}</th>)}
                </tr>
              </thead>
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
          </div>
        )}
      </div>

      {/* Category Summary - All Years Combined */}
      <div style={S.card}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 12 }}>
          Category Summary (All Years Combined)
        </div>
        {category.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--color-text-tertiary)" }}>No data yet</div>
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
                    {MONTHS.map(m => <td key={m} style={{ ...S.td, textAlign: "right", color: "var(--color-text-secondary)" }}>{r.months[m] ? fmt(r.months[m]) : "-- ----"}</td>)}
                    <td style={{ ...S.td, textAlign: "right", fontWeight: 500 }}>{fmt(r.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};