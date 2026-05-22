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
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen to sidebar year selection
  useEffect(() => {
    if (selectedYearFromSidebar) {
      setCurrentSelectedYear(selectedYearFromSidebar);
      setShowAllYears(false);
    }
  }, [selectedYearFromSidebar]);

  const handleAllYearsClick = () => {
    setShowAllYears(true);
    setCurrentSelectedYear(null);
  };

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
        if (allYearsRows[year] && Array.isArray(allYearsRows[year])) {
          combined.push(...allYearsRows[year]);
        }
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

  const metrics = useMemo(() => {
    return FE.dashboardMetrics(filtered, settings.displayCurrency, settings.exchangeRate);
  }, [filtered, settings.displayCurrency, settings.exchangeRate]);
  
  const charts = useMemo(() => FE.chartData(filtered), [filtered]);
  const recent = filtered.slice(0, 10);

  const fmt = (n: number) => {
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
      treasure: false,
      trend: "up" as const,
    },
    {
      label: "Total Expenses",
      value: typeof metrics.expense === 'string' ? parseFloat(metrics.expense.replace(/[^0-9.-]/g, '')) || 0 : metrics.expense,
      icon: TrendingDown,
      accent: COLORS.accent.coral,
      gradient: GRADIENTS.coralRose,
      treasure: false,
      trend: "down" as const,
    },
    {
      label: "Net Savings",
      value: typeof metrics.savings === 'string' ? parseFloat(metrics.savings.replace(/[^0-9.-]/g, '')) || 0 : metrics.savings,
      icon: Wallet,
      accent: COLORS.accent.cyan,
      gradient: GRADIENTS.cyanBlue,
      treasure: false,
    },
    {
      label: "Loan Repaid",
      value: typeof metrics.loan === 'string' ? parseFloat(metrics.loan.replace(/[^0-9.-]/g, '')) || 0 : metrics.loan,
      icon: CreditCard,
      accent: COLORS.accent.gold,
      gradient: GRADIENTS.goldAmber,
      treasure: true,
    },
  ];

  return (
    <PageTransition style="fadeUp">
      <div className="flex-1 overflow-auto">
        {/* Cinematic Header - Responsive */}
        <div className="relative overflow-hidden mb-3 md:mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-800/50 to-transparent" />
          <div className="relative px-4 md:px-6 py-3 md:py-5">
            <div className="flex items-center gap-1 md:gap-2 mb-1">
              <Compass size={isMobile ? 14 : 18} className="text-accent-gold" />
              <span className="text-2xs tracking-widest text-accent-gold uppercase">Grand Line</span>
              <Anchor size={isMobile ? 10 : 14} className="text-accent-cyan ml-1" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white/90 tracking-tight">
              Financial Log
              <span className="text-accent-gold text-xl md:text-2xl ml-2">⚓</span>
            </h1>
            <p className="text-xs md:text-sm text-white/40 mt-1">
              {showAllYears ? "Charting all Years" : `Logbook • Year ${displayYear}`}
            </p>
          </div>
        </div>

        {/* Filter Bar - Responsive */}
        <GlassPanel variant="elevated" className="mx-3 md:mx-4 mt-2 mb-4 md:mb-5">
          <div className="flex flex-wrap items-center gap-2 md:gap-3 p-2 md:p-0">
            <div className="flex items-center gap-1 md:gap-2">
              <Sparkles size={isMobile ? 12 : 14} className="text-accent-gold" />
              <span className="text-xs md:text-sm text-white/40">Navigate:</span>
            </div>
            
            <input
              type="month"
              value={dashFilter.from}
              onChange={e => onFilterChange({ from: e.target.value, to: dashFilter.to, quick: 'custom' })}
              className="glass-input text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5 w-28 md:w-36"
              placeholder="From"
            />
            
            <span className="text-white/20 text-xs md:text-sm">→</span>
            
            <input
              type="month"
              value={dashFilter.to}
              onChange={e => onFilterChange({ from: dashFilter.from, to: e.target.value, quick: 'custom' })}
              className="glass-input text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5 w-28 md:w-36"
              placeholder="To"
            />

            {(dashFilter.from || dashFilter.to) && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg text-xs text-white/40 hover:text-accent-gold transition-all"
              >
                <X size={isMobile ? 10 : 12} /> Clear
              </button>
            )}

            <div className="ml-auto flex rounded-lg overflow-hidden border border-white/10">
              {["USD", "INR"].map(c => (
                <button
                  key={c}
                  onClick={() => onCurrencyChange(c as 'USD' | 'INR')}
                  className={`px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm transition-all duration-300 ${
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

        <div className="px-3 md:px-4 pb-4 md:pb-6">
          {/* Metric Cards - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            {metricConfigs.map((metric, idx) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                whileHover={{ scale: isMobile ? 1 : 1.02 }}
              >
                <div className="relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-3 md:p-4 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-start justify-between mb-2 md:mb-3">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <div
                        className="w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${metric.accent}18`, border: `1px solid ${metric.accent}28` }}
                      >
                        <metric.icon size={isMobile ? 14 : 16} style={{ color: metric.accent }} />
                      </div>
                      <span className="text-2xs font-semibold uppercase tracking-wider text-white/40">
                        {metric.label}
                      </span>
                    </div>
                    {metric.trend && (
                      <span className={`text-2xs md:text-xs px-1.5 md:px-2 py-0.5 rounded-full ${
                        metric.trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-coral-500/20 text-coral-400'
                      }`}>
                        {metric.trend === 'up' ? '↑' : '↓'}
                        <span className="hidden sm:inline"> vs last month</span>
                      </span>
                    )}
                  </div>

                  <div className="text-xl md:text-2xl font-bold text-white tabular-nums tracking-tighter">
                    {fmt(metric.value)}
                  </div>

                  {metric.treasure && (
                    <div className="mt-1 md:mt-2 flex items-center gap-1">
                      <span className="text-2xs text-accent-gold/60">Treasure</span>
                      <span className="text-accent-gold text-xs md:text-sm">⚜️</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Year Voyage Toggle - Responsive */}
          <div className="flex justify-end mb-4 md:mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-gradient-gold-amber opacity-20 blur-md" />
              <div className="relative flex glass rounded-lg p-1 gap-1">
                <button
                  onClick={handleYearClick}
                  disabled={!activeYear}
                  className={`px-3 md:px-5 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium transition-all duration-300 ${
                    !showAllYears && activeYear
                      ? 'bg-gradient-gold-amber text-navy-900 shadow-lg' 
                      : 'text-white/50 hover:text-white/80'
                  } ${!activeYear ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Calendar size={isMobile ? 12 : 14} className="inline mr-1 md:mr-1.5" />
                  {isMobile ? (displayYear ? `${displayYear}` : 'Year') : (displayYear ? `Year ${displayYear}` : 'Select Year')}
                </button>
                <button
                  onClick={handleAllYearsClick}
                  className={`px-3 md:px-5 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium transition-all duration-300 ${
                    showAllYears 
                      ? 'bg-gradient-gold-amber text-navy-900 shadow-lg' 
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <Anchor size={isMobile ? 12 : 14} className="inline mr-1 md:mr-1.5" />
                  {isMobile ? `All (${yearCount})` : `All Years (${yearCount})`}
                </button>
              </div>
            </div>
          </div>

          {/* Charts - Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mb-4 md:mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-3 md:p-5"
            >
              <div className="mb-3 md:mb-4">
                <h3 className="text-xs md:text-sm font-semibold text-white/80 flex items-center gap-1 md:gap-2">
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-accent-emerald" />
                  {showAllYears ? "Tides of Time" : `Winds of ${displayYear}`}
                </h3>
                <p className="text-2xs text-white/30 mt-0.5 hidden sm:block">Income vs Expenses by moon cycle</p>
              </div>
              <div className="h-32 sm:h-40 md:h-48">
                <MiniBar data={charts.bar || []} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-3 md:p-5"
            >
              <div className="mb-3 md:mb-4">
                <h3 className="text-xs md:text-sm font-semibold text-white/80 flex items-center gap-1 md:gap-2">
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-accent-gold" />
                  {showAllYears ? "Treasure Map" : `Bounty of ${displayYear}`}
                </h3>
                <p className="text-2xs text-white/30 mt-0.5 hidden sm:block">Where the doubloons went</p>
              </div>
              <div className="h-32 sm:h-40 md:h-48">
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