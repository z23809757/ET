// src/components/charts/MiniBar.tsx
import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface MiniBarProps {
  data: Array<{ name: string; income: number; expense: number }>;
}

export const MiniBar: React.FC<MiniBarProps> = ({ data }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  // Handle empty or undefined data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white/30 text-sm">
        No transaction data available
      </div>
    );
  }

  // Calculate max value for scaling, with minimum height guarantee
  const maxValue = Math.max(...data.flatMap(d => [d?.income || 0, d?.expense || 0]), 1);
  
  // Minimum bar height percentage (15% of container to ensure visibility)
  const MIN_BAR_HEIGHT_PERCENT = 15;
  const MAX_BAR_HEIGHT_PERCENT = 70;

  return (
    <div ref={ref} className="w-full h-full flex items-end gap-2">
      {data.map((item, idx) => {
        const income = item?.income || 0;
        const expense = item?.expense || 0;
        const name = item?.name || '';
        
        // Calculate bar heights with minimum visibility
        let incomeHeight = (income / maxValue) * MAX_BAR_HEIGHT_PERCENT;
        let expenseHeight = (expense / maxValue) * MAX_BAR_HEIGHT_PERCENT;
        
        // Apply minimum height if there's any value
        if (income > 0 && incomeHeight < MIN_BAR_HEIGHT_PERCENT) {
          incomeHeight = MIN_BAR_HEIGHT_PERCENT;
        }
        if (expense > 0 && expenseHeight < MIN_BAR_HEIGHT_PERCENT) {
          expenseHeight = MIN_BAR_HEIGHT_PERCENT;
        }
        
        // If both are zero, show tiny indicator
        if (income === 0 && expense === 0) {
          incomeHeight = 2;
          expenseHeight = 2;
        }
        
        return (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
            {/* Income Bar (top, positive) */}
            <motion.div
              className="w-full rounded-t-sm bg-gradient-to-t from-accent-emerald to-accent-emerald/70 relative group"
              style={{ 
                height: isInView ? `${incomeHeight}%` : '0%',
                minHeight: income > 0 ? '4px' : '0px',
              }}
              initial={{ height: '0%' }}
              animate={{ height: isInView ? `${incomeHeight}%` : '0%' }}
              transition={{ duration: 0.6, delay: idx * 0.03, ease: 'easeOut' }}
            >
              {/* Tooltip on hover */}
              {income > 0 && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-2xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  ${income.toLocaleString()}
                </div>
              )}
            </motion.div>
            
            {/* Expense Bar (bottom, negative) */}
            <motion.div
              className="w-full rounded-b-sm bg-gradient-to-b from-accent-coral to-accent-coral/70 relative group"
              style={{ 
                height: isInView ? `${expenseHeight}%` : '0%',
                minHeight: expense > 0 ? '4px' : '0px',
              }}
              initial={{ height: '0%' }}
              animate={{ height: isInView ? `${expenseHeight}%` : '0%' }}
              transition={{ duration: 0.6, delay: idx * 0.03 + 0.1, ease: 'easeOut' }}
            >
              {/* Tooltip on hover */}
              {expense > 0 && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-2xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  ${expense.toLocaleString()}
                </div>
              )}
            </motion.div>
            
            {/* Month Label */}
            <span className="text-2xs text-white/40 mt-1 whitespace-nowrap">
              {name.length > 3 ? name.slice(0, 3) : name}
            </span>
          </div>
        );
      })}
    </div>
  );
};