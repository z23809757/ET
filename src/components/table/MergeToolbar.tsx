import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../shared/Button';
import { Icon } from '../shared/Icon';
import { cn } from '../../lib/utils';

interface MergeToolbarProps {
  selectionMode: 'none' | 'merge' | 'unmerge';
  onMergeModeToggle: () => void;
  onUnmergeModeToggle: () => void;
  onClearAllMerges: () => void;
  hasSelection: boolean;
  onApplyMerge: () => void;
  onCancelSelection: () => void;
}

export const MergeToolbar: React.FC<MergeToolbarProps> = ({
  selectionMode,
  onMergeModeToggle,
  onUnmergeModeToggle,
  onClearAllMerges,
  hasSelection,
  onApplyMerge,
  onCancelSelection
}) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border-b border-white/10 flex-wrap">
      {/* Label */}
      <div className="flex items-center gap-1.5 mr-1">
        <Icon n="ti-table" size={12} className="text-accent-gold" />
        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          Cell Merge
        </span>
      </div>

      {/* Merge Button */}
      <button
        onClick={onMergeModeToggle}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200",
          selectionMode === 'merge'
            ? "bg-gradient-gold-amber text-navy-900 shadow-glow-gold"
            : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white/90"
        )}
      >
        <Icon n="ti-merge-cells" size={12} />
        Merge
      </button>

      {/* Unmerge Button */}
      <button
        onClick={onUnmergeModeToggle}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200",
          selectionMode === 'unmerge'
            ? "bg-gradient-gold-amber text-navy-900 shadow-glow-gold"
            : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white/90"
        )}
      >
        <Icon n="ti-split-cells" size={12} />
        Unmerge
      </button>

      {/* Clear All Merges Button */}
      <button
        onClick={onClearAllMerges}
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-white/5 hover:bg-coral-500/20 text-white/70 hover:text-coral-400 transition-all duration-200"
      >
        <Icon n="ti-trash" size={12} />
        Clear All Merges
      </button>

      {/* Selection Controls - Animated */}
      <AnimatePresence>
        {selectionMode !== 'none' && hasSelection && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2 ml-auto pl-3 border-l border-white/10"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">
                <Icon n="ti-check" size={10} className="inline mr-1" />
                Cells selected
              </span>
            </div>
            
            <button
              onClick={onApplyMerge}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-gradient-emerald-cyan text-white shadow-glow-emerald hover:scale-105 transition-all duration-200"
            >
              <Icon n="ti-check" size={12} />
              Apply {selectionMode === 'merge' ? 'Merge' : 'Unmerge'}
            </button>
            
            <button
              onClick={onCancelSelection}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-white/70 hover:text-white/90 transition-all duration-200"
            >
              <Icon n="ti-x" size={12} />
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};