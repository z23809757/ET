import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MONTHS } from '../../lib/constants';
import { FE } from '../../lib/financeEngine';
import { Icon } from '../shared/Icon';
import { TypeBadge } from '../shared/TypeBadge';
import { OverallRow, UserSettings } from '../../types/finance';
import { formatUSD, formatINR } from '../../lib/formatters';
import { GlassPanel } from '../ui/GlassPanel';
import { cn } from '../../lib/utils';

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

  const yearCount = Object.keys(allYearsRows).length;

  return (
    <div className="flex-1 overflow-auto p-5">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 rounded-full bg-gradient-gold-amber" />
          <h1 className="text-xl font-bold text-white/90">All Years Overview</h1>
        </div>
        <p className="text-sm text-white/40 flex items-center gap-2">
          <Icon n="ti-chart-bar" size={14} />
          Combined data from {yearCount} {yearCount === 1 ? 'voyage' : 'voyages'}
        </p>
      </div>

      {/* Yearly Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <GlassPanel variant="elevated" className="overflow-hidden">
          <div className="px-5 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Icon n="ti-chart-line" size={16} className="text-accent-gold" />
              <h3 className="text-sm font-semibold text-white/80">Yearly Comparison</h3>
            </div>
            <p className="text-2xs text-white/30 mt-0.5">Year-over-year category trends</p>
          </div>

          {yearly.rows.length === 0 ? (
            <div className="text-center py-16 text-white/40">
              <Icon n="ti-chart-line" size={40} className="mb-3 opacity-50" />
              <p className="text-sm">No yearly data yet</p>
              <p className="text-xs text-white/25 mt-1">Add multiple years to see comparison</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-4 py-3 text-left text-2xs font-semibold text-white/50 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-2xs font-semibold text-white/50 uppercase tracking-wider">Type</th>
                    {yearly.years.map(y => (
                      <th key={y} className="px-4 py-3 text-right text-2xs font-semibold text-white/50 uppercase tracking-wider">{y}</th>
                    ))}
                    <th className="px-4 py-3 text-center text-2xs font-semibold text-white/50 uppercase tracking-wider">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {yearly.rows.map((r, i) => {
                    const vals = yearly.years.map(y => r.years[y] || 0);
                    const up = vals.length > 1 && vals[vals.length - 1] > vals[vals.length - 2];
                    return (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-white/5 transition-all duration-150"
                      >
                        <td className="px-4 py-3 font-semibold text-white/90 whitespace-nowrap">{r.name}</td>
                        <td className="px-4 py-3"><TypeBadge type={r.type} size="sm" /></td>
                        {yearly.years.map(y => (
                          <td key={y} className="px-4 py-3 text-right text-white/70 tabular-nums">
                            {r.years[y] ? fmt(r.years[y]) : "—"}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center">
                          <div className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                            up ? "bg-emerald-500/20 text-emerald-400" : "bg-coral-500/20 text-coral-400"
                          )}>
                            <Icon n={`ti-trending-${up ? "up" : "down"}`} size={12} />
                            {up ? "Rising" : "Falling"}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </GlassPanel>
      </motion.div>

      {/* Monthly Summary - All Years Combined */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-6"
      >
        <GlassPanel variant="elevated" className="overflow-hidden">
          <div className="px-5 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Icon n="ti-calendar" size={16} className="text-accent-cyan" />
              <h3 className="text-sm font-semibold text-white/80">Monthly Summary</h3>
            </div>
            <p className="text-2xs text-white/30 mt-0.5">All voyages combined by month</p>
          </div>

          {monthly.length === 0 ? (
            <div className="text-center py-16 text-white/40">
              <Icon n="ti-calendar" size={40} className="mb-3 opacity-50" />
              <p className="text-sm">No monthly data yet</p>
              <p className="text-xs text-white/25 mt-1">Add transactions to see monthly breakdown</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    {["Month", "Income", "Expenses", "Savings", "Biggest Category"].map((h, idx) => (
                      <th 
                        key={h} 
                        className={cn(
                          "px-4 py-3 text-left text-2xs font-semibold text-white/50 uppercase tracking-wider",
                          idx >= 1 && "text-right"
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {monthly.map((r, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-white/5 transition-all duration-150"
                    >
                      <td className="px-4 py-3 font-semibold text-white/90">{r.month}</td>
                      <td className="px-4 py-3 text-right text-emerald-400 font-medium tabular-nums">{fmt(r.income)}</td>
                      <td className="px-4 py-3 text-right text-coral-400 font-medium tabular-nums">{fmt(r.expense)}</td>
                      <td className={cn(
                        "px-4 py-3 text-right font-semibold tabular-nums",
                        r.savings >= 0 ? "text-emerald-400" : "text-coral-400"
                      )}>
                        {fmt(r.savings)}
                      </td>
                      <td className="px-4 py-3 text-white/40 text-xs">{r.biggestCat}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassPanel>
      </motion.div>

      {/* Category Summary - All Years Combined */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <GlassPanel variant="elevated" className="overflow-hidden">
          <div className="px-5 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Icon n="ti-category" size={16} className="text-accent-emerald" />
              <h3 className="text-sm font-semibold text-white/80">Category Summary</h3>
            </div>
            <p className="text-2xs text-white/30 mt-0.5">All voyages combined by category</p>
          </div>

          {category.length === 0 ? (
            <div className="text-center py-16 text-white/40">
              <Icon n="ti-category" size={40} className="mb-3 opacity-50" />
              <p className="text-sm">No category data yet</p>
              <p className="text-xs text-white/25 mt-1">Add expenses to see category breakdown</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-4 py-3 text-left text-2xs font-semibold text-white/50 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-2xs font-semibold text-white/50 uppercase tracking-wider">Type</th>
                    {MONTHS.map(m => (
                      <th key={m} className="px-2 py-3 text-right text-2xs font-semibold text-white/50 uppercase tracking-wider">{m}</th>
                    ))}
                    <th className="px-4 py-3 text-right text-2xs font-semibold text-white/50 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {category.map((r, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.01 }}
                      className="hover:bg-white/5 transition-all duration-150"
                    >
                      <td className="px-4 py-3 font-semibold text-white/90 whitespace-nowrap">{r.name}</td>
                      <td className="px-4 py-3"><TypeBadge type={r.type} size="sm" /></td>
                      {MONTHS.map(m => (
                        <td key={m} className="px-2 py-3 text-right text-white/50 text-xs tabular-nums">
                          {r.months[m] ? fmt(r.months[m]) : "—"}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right font-semibold text-white/80 tabular-nums">{fmt(r.total)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassPanel>
      </motion.div>
    </div>
  );
};