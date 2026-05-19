import React, { useMemo, useState, useEffect } from 'react';
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
  allYearsRows?: Record<string, OverallRow[]>;
  settings: UserSettings;
  dashFilter: { from: string; to: string; quick: string };
  onFilterChange: (patch: any) => void;
  onCurrencyChange: (cur: 'USD' | 'INR') => void;
  activeYear?: number | null;
  selectedYearFromSidebar?: number | null;  // NEW PROP
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  overallRows,
  allYearsRows,
  settings,
  dashFilter,
  onFilterChange,
  onCurrencyChange,
  activeYear,
  selectedYearFromSidebar,
}) => {
  // Track if we're showing all years or a specific year
  const [showAllYears, setShowAllYears] = useState(true);
  // Track the currently selected year (from sidebar)
  const [currentSelectedYear, setCurrentSelectedYear] = useState<number | null>(null);

  // Listen to sidebar year selection
  useEffect(() => {
    if (selectedYearFromSidebar) {
      setCurrentSelectedYear(selectedYearFromSidebar);
      setShowAllYears(false);  // Auto switch to year view when sidebar year is clicked
    }
  }, [selectedYearFromSidebar]);

  // When user manually clicks "All Years" button
  const handleAllYearsClick = () => {
    setShowAllYears(true);
    setCurrentSelectedYear(null);
  };

  // When user manually clicks year button
  const handleYearClick = () => {
    if (activeYear) {
      setCurrentSelectedYear(activeYear);
      setShowAllYears(false);
    }
  };

  // Get data based on selection
  const displayRows = useMemo(() => {
    if (showAllYears && allYearsRows) {
      const combined: OverallRow[] = [];
      for (const year in allYearsRows) {
        combined.push(...allYearsRows[year]);
      }
      return combined;
    }
    return overallRows;
  }, [showAllYears, overallRows, allYearsRows]);

  const yearCount = useMemo(() => {
    if (allYearsRows) {
      return Object.keys(allYearsRows).length;
    }
    return 1;
  }, [allYearsRows]);

  // Apply date filter
  const filtered = useMemo(() => {
    if (!dashFilter.from && !dashFilter.to) return displayRows;
    return FE.filterByDate(displayRows, dashFilter.from, dashFilter.to);
  }, [displayRows, dashFilter.from, dashFilter.to]);

  const metrics = useMemo(() => FE.dashboardMetrics(filtered, settings.displayCurrency, settings.exchangeRate), [filtered, settings.displayCurrency, settings.exchangeRate]);
  const charts = useMemo(() => FE.chartData(filtered), [filtered]);
  const recent = filtered.slice(0, 10);

  const fmt = (n: number) => settings.displayCurrency === 'INR' ? formatINR(n * settings.exchangeRate) : formatUSD(n);

  const handleClearFilters = () => {
    onFilterChange({ from: '', to: '', quick: 'all' });
  };

  // Determine which year to display in the button
  const displayYear = currentSelectedYear || activeYear;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Filter Bar */}
      <div style={{ padding: "10px 16px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          <Icon n="ti-calendar" size={14} style={{ marginRight: 4 }} />Date Range:
        </span>
        
        <input
          type="month"
          value={dashFilter.from}
          onChange={e => onFilterChange({ from: e.target.value, to: dashFilter.to, quick: 'custom' })}
          placeholder="From"
          style={{ 
            padding: "5px 10px", 
            border: "0.5px solid var(--color-border-secondary)", 
            borderRadius: 6, 
            fontSize: 12, 
            background: "var(--color-background-primary)",
            color: "var(--color-text-primary)",
            outline: "none"
          }}
        />
        
        <span style={{ color: "var(--color-text-tertiary)" }}>→</span>
        
        <input
          type="month"
          value={dashFilter.to}
          onChange={e => onFilterChange({ from: dashFilter.from, to: e.target.value, quick: 'custom' })}
          placeholder="To"
          style={{ 
            padding: "5px 10px", 
            border: "0.5px solid var(--color-border-secondary)", 
            borderRadius: 6, 
            fontSize: 12, 
            background: "var(--color-background-primary)",
            color: "var(--color-text-primary)",
            outline: "none"
          }}
        />

        {(dashFilter.from || dashFilter.to) && (
          <button
            onClick={handleClearFilters}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: 11,
              background: "transparent",
              border: "0.5px solid var(--color-border-secondary)",
              cursor: "pointer",
              color: "#D85A30",
              display: "flex",
              alignItems: "center",
              gap: 4
            }}
          >
            <Icon n="ti-x" size={12} /> Clear
          </button>
        )}

        {/* Currency Toggle */}
        <div style={{ marginLeft: "auto", display: "flex", border: "0.5px solid var(--color-border-secondary)", borderRadius: 6, overflow: "hidden" }}>
          {["USD", "INR"].map(c => (
            <div
              key={c}
              onClick={() => onCurrencyChange(c as 'USD' | 'INR')}
              style={{ 
                padding: "4px 12px", 
                fontSize: 12, 
                cursor: "pointer", 
                fontWeight: settings.displayCurrency === c ? 500 : 400, 
                background: settings.displayCurrency === c ? "#E6F1FB" : "var(--color-background-primary)", 
                color: settings.displayCurrency === c ? "#0C447C" : "var(--color-text-secondary)"
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>

      <div style={S.content}>
        {/* Metric Cards */}
        <div style={S.metricsGrid}>
          {[
            { label: "Total income", value: metrics.income, sub: "Income from all tables", color: "#27500A" },
            { label: "Total expenses", value: metrics.expense, sub: "Expenses from all tables", color: "#712B13" },
            { label: "Net savings", value: metrics.savings, sub: "Income − expenses", color: "#185FA5" },
            { label: "Loan repaid", value: metrics.loan, sub: "Loan repayments", color: "#633806" },
          ].map(m => (
            <div key={m.label} style={S.metricCard}>
              <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 9, color: "var(--color-text-tertiary)", marginTop: 4 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Year Toggle - Below metric cards */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
          <div style={{ 
            display: "flex", 
            background: "var(--color-background-secondary)", 
            borderRadius: 8, 
            padding: 3,
            gap: 2
          }}>
            <button
              onClick={handleYearClick}
              style={{
                padding: "5px 14px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                background: !showAllYears ? "#185FA5" : "transparent",
                color: !showAllYears ? "white" : "var(--color-text-secondary)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              <Icon n="ti-calendar" size={12} style={{ marginRight: 4 }} />
              {displayYear ? `Year ${displayYear}` : 'Select Year'}
            </button>
            <button
              onClick={handleAllYearsClick}
              style={{
                padding: "5px 14px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                background: showAllYears ? "#1D9E75" : "transparent",
                color: showAllYears ? "white" : "var(--color-text-secondary)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              <Icon n="ti-chart-bar" size={12} style={{ marginRight: 4 }} />
              All Years ({yearCount})
            </button>
          </div>
        </div>

        {/* Charts */}
        <div style={S.chartsGrid}>
          <div style={S.card}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 12 }}>
              {showAllYears ? "Monthly trend (All Years Combined)" : `Monthly trend (${displayYear})`}
            </div>
            <MiniBar data={charts.bar} />
          </div>
          <div style={S.card}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 12 }}>
              {showAllYears ? "Expense breakdown (All Years)" : `Expense breakdown (${displayYear})`}
            </div>
            <MiniDonut data={charts.donut} />
          </div>
        </div>

        {/* Recent Transactions */}
        <div style={S.card}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 12 }}>
            Recent transactions {showAllYears ? "(All Years)" : `(${displayYear})`}
          </div>
          {recent.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", textAlign: "center", padding: "20px 0" }}>
              {displayRows.length === 0 ? "No transactions yet. Add data to your tables!" : "No transactions in selected date range"}
            </div>
          ) : (
            recent.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < recent.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: TYPE_C[r.type]?.bg || "#F1EFE8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon n={TYPE_ICON[r.type] || "ti-minus"} size={16} color={TYPE_C[r.type]?.text || "#5F5E5A"} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{r.subcategory}</div>
                    <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
                      {r.category} · {r.month || ""}
                      {showAllYears && <span style={{ marginLeft: 6, color: "#1D9E75" }}>({r.year})</span>}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: r.type === "Income" ? "#27500A" : "#712B13" }}>
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