// src/components/dashboard/RecentTransactions.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../shared/Icon';
import { TYPE_C, TYPE_ICON } from '../../lib/constants';
import { OverallRow } from '../../types/finance';
import { GlassPanel } from '../ui/GlassPanel';
import { TrendingUp, TrendingDown, Eye } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: OverallRow[];
  showAllYears: boolean;
  displayYear?: number | null;
  formatValue: (n: number) => string;
  displayRowsLength: number;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ 
  transactions, 
  showAllYears,
  displayYear,
  formatValue,
  displayRowsLength
}) => {
  if (transactions.length === 0) {
    return (
      <GlassPanel variant="elevated">
        <div className="text-center py-12">
          <div className="text-white/10 text-5xl mb-4">🗺️</div>
          <p className="text-white/30 text-sm">
            {displayRowsLength === 0 ? "No logs yet. Set sail by adding data to your tables!" : "No logs in this date range"}
          </p>
        </div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel variant="elevated">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
            Captain's Log
          </h3>
          <p className="text-2xs text-white/30 mt-0.5">
            {showAllYears ? "All recorded voyages" : `Log entries • ${displayYear}`}
          </p>
        </div>
        
        {transactions.length > 0 && (
          <button className="text-2xs text-white/40 hover:text-accent-gold transition-colors flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/5">
            <Eye size={12} />
            View all entries →
          </button>
        )}
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        <AnimatePresence>
          {transactions.map((transaction, idx) => {
            // Format month display
            let monthDisplay = transaction.month || "";
            if (monthDisplay && monthDisplay.length >= 7) {
              const monthNum = parseInt(monthDisplay.slice(5, 7));
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              monthDisplay = `${monthNames[monthNum - 1]} ${monthDisplay.slice(0, 4)}`;
            }
            
            return (
              <motion.div
                key={`${transaction.id || idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.5), duration: 0.3 }}
                whileHover={{ 
                  scale: 1.01,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  transition: { duration: 0.15 }
                }}
                className="flex items-center justify-between p-3 rounded-xl transition-all group cursor-pointer"
              >
                {/* Left section - Icon and details */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 flex-shrink-0"
                    style={{ 
                      background: TYPE_C[transaction.type]?.bg || '#1E293B',
                      border: `1px solid ${TYPE_C[transaction.type]?.border || 'rgba(255,255,255,0.1)'}`
                    }}
                  >
                    <Icon 
                      n={TYPE_ICON[transaction.type] || "ti-minus"} 
                      size={18} 
                      color={TYPE_C[transaction.type]?.text || "#9CA3AF"} 
                    />
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white/90 truncate">
                      {transaction.subcategory || 'Unnamed'}
                    </div>
                    <div className="text-xs text-white/40 flex items-center gap-2 flex-wrap">
                      <span className="truncate">{transaction.category || 'Uncategorized'}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20 flex-shrink-0" />
                      <span className="flex-shrink-0">
                        {monthDisplay && monthDisplay !== "--" ? monthDisplay : '—'}
                      </span>
                      {showAllYears && transaction.year && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-white/20 flex-shrink-0" />
                          <span className="text-accent-gold flex-shrink-0">{transaction.year}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Right section - Amount */}
                <div className={`text-sm font-bold tabular-nums flex items-center gap-1 flex-shrink-0 ml-3 ${
                  transaction.type === "Income" ? "text-accent-emerald" : "text-accent-coral"
                }`}>
                  {transaction.type === "Income" ? (
                    <TrendingUp size={12} className="flex-shrink-0" />
                  ) : (
                    <TrendingDown size={12} className="flex-shrink-0" />
                  )}
                  {formatValue(transaction.type === "Income" ? transaction.amtUSD : transaction.amtUSD)}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer - Show count */}
      {transactions.length > 5 && (
        <div className="mt-3 pt-2 text-center">
          <button className="text-2xs text-white/30 hover:text-accent-gold transition-colors">
            Showing last {Math.min(transactions.length, 10)} of {transactions.length} entries
          </button>
        </div>
      )}
    </GlassPanel>
  );
};