import React, { useMemo } from 'react';
import { S } from '../../lib/constants';
import { FE } from '../../lib/financeEngine';
import { Icon } from '../shared/Icon';
import { MiniBar } from '../charts/MiniBar';
import { MiniDonut } from '../charts/MiniDonut';
import { OverallRow, UserSettings } from '../../types/finance';
import { TYPE_C, TYPE_ICON } from '../../lib/constants';
import { formatUSD, formatINR } from '../../lib/formatters';

interface DashboardViewProps {
  overallRows: OverallRow[];
  settings: UserSettings;
  dashFilter: { from: string; to: string; quick: string };
  onFilterChange: (patch: any) => void;
  onCurrencyChange: (cur: 'USD' | 'INR') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  overallRows,
  settings,
  dashFilter,
  onFilterChange,
  onCurrencyChange,
}) => {
  const applyQuick = (q: string) => {
    const yr = new Date().getFullYear();
    const ranges: Record<string, [string, string]> = {
      q1: [`${yr}-01`, `${yr}-03`],
      q2: [`${yr}-04`, `${yr}-06`],
      q3: [`${yr}-07`, `${yr}-09`],
      q4: [`${yr}-10`, `${yr}-12`],
      all: ['', ''],
    };
    const [f, t] = ranges[q] || ['', ''];
    onFilterChange({ quick: q, from: f, to: t });
  };

  const filtered = useMemo(() => FE.filterByDate(overallRows, dashFilter.from, dashFilter.to), [overallRows, dashFilter.from, dashFilter.to]);
  const metrics = useMemo(() => FE.dashboardMetrics(filtered, settings.displayCurrency, settings.exchangeRate), [filtered, settings.displayCurrency, settings.exchangeRate]);
  const charts = useMemo(() => FE.chartData(filtered), [filtered]);
  const recent = filtered.slice(0, 10);
  const hasData = overallRows.length > 0;

  const fmt = (n: number) => settings.displayCurrency === 'INR' ? formatINR(n * settings.exchangeRate) : formatUSD(n);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "7px 16px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", display: "flex", alignItems: "center", gap: 3 }}><Icon n="ti-filter" size={12} />Range:</span>
        {[["all", "All year"], ["q1", "Q1"], ["q2", "Q2"], ["q3", "Q3"], ["q4", "Q4"]].map(([v, l]) => (
          <div
            key={v}
            onClick={() => applyQuick(v)}
            style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, cursor: "pointer", fontWeight: dashFilter.quick === v ? 500 : 400, background: dashFilter.quick === v ? "var(--color-background-primary)" : "transparent", color: dashFilter.quick === v ? "#0C447C" : "var(--color-text-secondary)", border: dashFilter.quick === v ? "0.5px solid #B5D4F4" : "0.5px solid transparent" }}
          >
            {l}
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 6, fontSize: 11, background: "var(--color-background-primary)" }}>
          <Icon n="ti-calendar" size={12} color="var(--color-text-tertiary)" />
          <input
            type="month"
            value={dashFilter.from}
            onChange={e => onFilterChange({ from: e.target.value, quick: "custom" })}
            style={{ border: "none", background: "transparent", fontSize: 11, color: "var(--color-text-secondary)", outline: "none", width: 110 }}
          />
          <span style={{ color: "var(--color-text-tertiary)" }}>→</span>
          <input
            type="month"
            value={dashFilter.to}
            onChange={e => onFilterChange({ to: e.target.value, quick: "custom" })}
            style={{ border: "none", background: "transparent", fontSize: 11, color: "var(--color-text-secondary)", outline: "none", width: 110 }}
          />
        </div>
        <div style={{ marginLeft: "auto", display: "flex", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, overflow: "hidden" }}>
          {["USD", "INR"].map(c => (
            <div
              key={c}
              onClick={() => onCurrencyChange(c as 'USD' | 'INR')}
              style={{ padding: "4px 10px", fontSize: 11, cursor: "pointer", fontWeight: settings.displayCurrency === c ? 500 : 400, background: settings.displayCurrency === c ? "#E6F1FB" : "var(--color-background-primary)", color: settings.displayCurrency === c ? "#0C447C" : "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 3 }}
            >
              <Icon n={`ti-currency-${c === "USD" ? "dollar" : "rupee"}`} size={12} />{c}
            </div>
          ))}
        </div>
      </div>

      <div style={S.content}>
        <div style={S.metricsGrid}>
          {[
            { label: "Total income", value: metrics.income, sub: "From Overall → income rows", color: "#27500A" },
            { label: "Total expenses", value: metrics.expense, sub: "From Overall → expense rows", color: "#712B13" },
            { label: "Net savings", value: metrics.savings, sub: "Income − expenses (auto)", color: "#185FA5" },
            { label: "Loan repaid", value: metrics.loan, sub: "From Overall → loan rows", color: "#633806" },
          ].map(m => (
            <div key={m.label} style={S.metricCard}>
              <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginBottom: 3 }}>{m.label}</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 9, color: "var(--color-text-tertiary)", marginTop: 3 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        <div style={S.chartsGrid}>
          <div style={S.card}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 10 }}>Income vs expenses — monthly</div>
            <MiniBar data={charts.bar} />
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              {[["#378ADD", "Income"], ["#D85A30", "Expenses"]].map(([c, l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--color-text-secondary)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c as string }} />{l}
                </div>
              ))}
            </div>
          </div>
          <div style={S.card}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 10 }}>Expense breakdown</div>
            <MiniDonut data={charts.donut} />
          </div>
        </div>

        <div style={S.card}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 10 }}>Recent transactions</div>
          {recent.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", textAlign: "center", padding: "12px 0" }}>No transactions in this range</div>
          ) : (
            recent.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: i < recent.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: TYPE_C[r.type]?.bg || "#F1EFE8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon n={TYPE_ICON[r.type] || "ti-minus"} size={13} color={TYPE_C[r.type]?.text || "#5F5E5A"} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)" }}>{r.subcategory}</div>
                    <div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>{r.category} · {r.month}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: r.type === "Income" ? "#27500A" : "#712B13" }}>
                  {r.type === "Income" ? "+" : "-"}{settings.displayCurrency === "INR" ? formatINR(r.amtINR) : formatUSD(r.amtUSD)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};