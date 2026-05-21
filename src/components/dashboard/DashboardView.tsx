import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, CreditCard, Calendar, X, Sparkles, Compass, Anchor } from 'lucide-react';
import { FE } from '../../lib/financeEngine';
import { Icon } from '../shared/Icon';
import { MiniBar } from '../charts/MiniBar';
import { MiniDonut } from '../charts/MiniDonut';
import { OverallRow, UserSettings } from '../../types/finance';
import { TYPE_C, TYPE_ICON } from '../../lib/constants';
import { formatUSD, formatINR } from '../../lib/formatters';
import { GlassPanel } from '../ui/GlassPanel';
import { PageTransition } from '../ui/PageTransition';
import { RecentTransactions } from './RecentTransactions';
import { COLORS, GRADIENTS } from '../../lib/theme';

interface DashboardViewProps {
  overallRows: OverallRow[];
  allYearsRows?: Record<string, OverallRow[]>;
  settings: UserSettings;
  dashFilter: { from: string; to: string; quick: string };
  onFilterChange: (patch: any) => void;
  onCurrencyChange: (cur: 'USD' | 'INR') => void;
  activeYear?: number | null;
  selectedYearFromSidebar?: number | null;
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
  const [showAllYears, setShowAllYears] = useState(true);
  const [currentSelectedYear, setCurrentSelectedYear] = useState<number | null>(null);

  // Listen to sidebar year selection
  useEffect(() => {
    if (selectedYearFromSidebar) {
      setCurrentSelectedYear(selectedYearFromSidebar);
      setShowAllYears(false);
    }
  }, [selectedYearFromSidebar]);

  const handleAllYearsClick = () => {
    console.log('All Years clicked'); // Debug log
    setShowAllYears(true);
    setCurrentSelectedYear(null);
  };

  const handleYearClick = () => {
    console.log('Year clicked:', activeYear); // Debug log
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
        if (allYearsRows[year] && Array.isArray(allYearsRows[year])) {
          combined.push(...allYearsRows[year]);
        }
      }
      console.log('Combined rows for All Years:', combined.length); // Debug log
      return combined;
    }
    console.log('Rows for current year:', overallRows.length); // Debug log
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

  const metrics = useMemo(() => {
    const result = FE.dashboardMetrics(filtered, settings.displayCurrency, settings.exchangeRate);
    console.log('Metrics computed:', result); // Debug log
    return result;
  }, [filtered, settings.displayCurrency, settings.exchangeRate]);
  
  const charts = useMemo(() => FE.chartData(filtered), [filtered]);
  const recent = filtered.slice(0, 10);

  const fmt = (n: number) => {
    // Handle NaN, undefined, null
    let safeValue = 0;
    if (typeof n === 'number' && !isNaN(n)) {
      safeValue = n;
    } else if (typeof n === 'string') {
      safeValue = parseFloat(n) || 0;
    }
    
    const safeRate = (settings.exchangeRate && !isNaN(settings.exchangeRate)) ? settings.exchangeRate : 85.4;
    
    if (settings.displayCurrency === 'INR') {
      return formatINR(safeValue * safeRate);
    }
    return formatUSD(safeValue);
  };

  const handleClearFilters = () => {
    onFilterChange({ from: '', to: '', quick: 'all' });
  };

  const displayYear = currentSelectedYear || activeYear;

  // Grand Line inspired metric configs
  const metricConfigs = [
    {
      label: "Total Income",
      value: typeof metrics.income === 'string' ? parseFloat(metrics.income.replace(/[^0-9.-]/g, '')) || 0 : metrics.income,
      icon: TrendingUp,
      accent: COLORS.accent.emerald,
      gradient: GRADIENTS.emeraldCyan,
      glow: COLORS.accent.emeraldGlow,
      treasure: false,
      trend: "up" as const,
    },
    {
      label: "Total Expenses",
      value: typeof metrics.expense === 'string' ? parseFloat(metrics.expense.replace(/[^0-9.-]/g, '')) || 0 : metrics.expense,
      icon: TrendingDown,
      accent: COLORS.accent.coral,
      gradient: GRADIENTS.coralRose,
      glow: COLORS.accent.coralGlow,
      treasure: false,
      trend: "down" as const,
    },
    {
      label: "Net Savings",
      value: typeof metrics.savings === 'string' ? parseFloat(metrics.savings.replace(/[^0-9.-]/g, '')) || 0 : metrics.savings,
      icon: Wallet,
      accent: COLORS.accent.cyan,
      gradient: GRADIENTS.cyanBlue,
      glow: COLORS.accent.cyanGlow,
      treasure: false,
    },
    {
      label: "Loan Repaid",
      value: typeof metrics.loan === 'string' ? parseFloat(metrics.loan.replace(/[^0-9.-]/g, '')) || 0 : metrics.loan,
      icon: CreditCard,
      accent: COLORS.accent.gold,
      gradient: GRADIENTS.goldAmber,
      glow: COLORS.accent.goldGlow,
      treasure: true,
    },
  ];

  return (
    <PageTransition style="fadeUp">
      <div className="flex-1 overflow-auto">
        {/* Cinematic Header */}
        <div className="relative overflow-hidden mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-800/50 to-transparent" />
          <div className="relative px-6 py-5">
            <div className="flex items-center gap-2 mb-1">
              <Compass size={18} className="text-accent-gold" />
              <span className="text-2xs tracking-widest text-accent-gold uppercase">Grand Line</span>
              <Anchor size={14} className="text-accent-cyan ml-1" />
            </div>
            <h1 className="text-2xl font-bold text-white/90 tracking-tight">
              Financial Log
              <span className="text-accent-gold text-2xl ml-2">⚓</span>
            </h1>
            <p className="text-white/40 text-sm mt-1">
              {showAllYears ? "Charting all voyages" : `Logbook • Year ${displayYear}`}
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <GlassPanel variant="elevated" className="mx-4 mt-2 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-accent-gold" />
              <span className="text-sm text-white/40">Navigate by date:</span>
            </div>
            
            <input
              type="month"
              value={dashFilter.from}
              onChange={e => onFilterChange({ from: e.target.value, to: dashFilter.to, quick: 'custom' })}
              className="glass-input text-sm px-3 py-1.5 w-36"
              placeholder="From"
            />
            
            <span className="text-white/20">→</span>
            
            <input
              type="month"
              value={dashFilter.to}
              onChange={e => onFilterChange({ from: dashFilter.from, to: e.target.value, quick: 'custom' })}
              className="glass-input text-sm px-3 py-1.5 w-36"
              placeholder="To"
            />

            {(dashFilter.from || dashFilter.to) && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-accent-gold transition-all"
              >
                <X size={12} /> Clear course
              </button>
            )}

            <div className="ml-auto flex rounded-lg overflow-hidden border border-white/10">
              {["USD", "INR"].map(c => (
                <button
                  key={c}
                  onClick={() => onCurrencyChange(c as 'USD' | 'INR')}
                  className={`px-4 py-1.5 text-sm transition-all duration-300 ${
                    settings.displayCurrency === c 
                      ? 'bg-gradient-gold-amber text-navy-900 font-medium' 
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </GlassPanel>

        <div className="px-4 pb-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metricConfigs.map((metric, idx) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <div className="relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-4 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${metric.accent}18`, border: `1px solid ${metric.accent}28` }}
                      >
                        <metric.icon size={16} style={{ color: metric.accent }} />
                      </div>
                      <span className="text-2xs font-semibold uppercase tracking-wider text-white/40">
                        {metric.label}
                      </span>
                    </div>
                    {metric.trend && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        metric.trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-coral-500/20 text-coral-400'
                      }`}>
                        {metric.trend === 'up' ? '↑' : '↓'} vs last month
                      </span>
                    )}
                  </div>

                  <div className="text-2xl font-bold text-white tabular-nums tracking-tighter">
                    {fmt(metric.value)}
                  </div>

                  {metric.treasure && (
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-2xs text-accent-gold/60">Treasure collected</span>
                      <span className="text-accent-gold">⚜️</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Year Voyage Toggle - Fix: Make sure buttons work */}
          <div className="flex justify-end mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-gradient-gold-amber opacity-20 blur-md" />
              <div className="relative flex glass rounded-lg p-1 gap-1">
                <button
                  onClick={handleYearClick}
                  disabled={!activeYear}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    !showAllYears && activeYear
                      ? 'bg-gradient-gold-amber text-navy-900 shadow-lg' 
                      : 'text-white/50 hover:text-white/80'
                  } ${!activeYear ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Calendar size={14} className="inline mr-1.5" />
                  {displayYear ? `Year ${displayYear}` : 'Select Year'}
                </button>
                <button
                  onClick={handleAllYearsClick}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    showAllYears 
                      ? 'bg-gradient-gold-amber text-navy-900 shadow-lg' 
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <Anchor size={14} className="inline mr-1.5" />
                  All Voyages ({yearCount})
                </button>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-emerald" />
                    {showAllYears ? "Tides of Time" : `Winds of ${displayYear}`}
                  </h3>
                  <p className="text-2xs text-white/30 mt-0.5">Income vs Expenses by moon cycle</p>
                </div>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-accent-emerald" />
                  <span className="text-2xs text-white/40 ml-1">Income</span>
                  <span className="w-2 h-2 rounded-full bg-accent-coral ml-2" />
                  <span className="text-2xs text-white/40 ml-1">Expense</span>
                </div>
              </div>
              <div className="h-48">
                <MiniBar data={charts.bar || []} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-5"
            >
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-gold" />
                  {showAllYears ? "Treasure Map" : `Bounty of ${displayYear}`}
                </h3>
                <p className="text-2xs text-white/30 mt-0.5">Where the doubloons went</p>
              </div>
              <div className="h-48">
                <MiniDonut data={charts.donut || []} />
              </div>
            </motion.div>
          </div>

          {/* Recent Transactions */}
          <RecentTransactions 
            transactions={recent}
            showAllYears={showAllYears}
            displayYear={displayYear}
            formatValue={fmt}
            displayRowsLength={displayRows.length}
          />
        </div>
      </div>
    </PageTransition>
  );
};