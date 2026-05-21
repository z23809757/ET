import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MONTHS } from '../../lib/constants';
import { FE } from '../../lib/financeEngine';
import { Icon } from '../shared/Icon';
import { TypeBadge } from '../shared/TypeBadge';
import { OverallRow, UserSettings } from '../../types/finance';
import { formatUSD, formatINR } from '../../lib/formatters';
import { GlassPanel } from '../ui/GlassPanel';
import { cn } from '../../lib/utils';

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
    <div className="flex-1 overflow-auto p-4">
      {/* Sub-view Tabs */}
      <div className="flex gap-1 mb-5 p-1 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 w-fit">
        {[
          { id: "monthly", label: "Monthly summary", icon: "ti-calendar" },
          { id: "category", label: "Category summary", icon: "ti-category" },
          { id: "yearly", label: "Yearly comparison", icon: "ti-chart-line" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSubViewChange(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
              subView === tab.id
                ? "bg-gradient-gold-amber text-navy-900 shadow-md"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            )}
          >
            <Icon n={tab.icon} size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Monthly Summary View */}
        {subView === "monthly" && (
          <motion.div
            key="monthly"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <GlassPanel variant="elevated" className="overflow-hidden">
              {monthly.length === 0 ? (
                <div className="text-center py-16 text-white/40">
                  <Icon n="ti-chart-bar" size={40} className="mb-3 opacity-50" />
                  <p className="text-sm">No transaction data yet</p>
                  <p className="text-xs text-white/25 mt-1">Add entries to see monthly breakdown</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        {["Month", "Income", "Expenses", "Savings", "Biggest category"].map((h, idx) => (
                          <th 
                            key={idx} 
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
                          transition={{ delay: i * 0.03 }}
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
        )}

        {/* Category Summary View */}
        {subView === "category" && (
          <motion.div
            key="category"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <GlassPanel variant="elevated" className="overflow-hidden">
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
                      <tr className="border-b border-white/10">
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
                          transition={{ delay: i * 0.02 }}
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
        )}

        {/* Yearly Comparison View */}
        {subView === "yearly" && (
          <motion.div
            key="yearly"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <GlassPanel variant="elevated" className="overflow-hidden">
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
                      <tr className="border-b border-white/10">
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
        )}
      </AnimatePresence>
    </div>
  );
};