import React from 'react';
import { Icon } from '../../shared/Icon';
import { CellReference } from '../../../types/formula';
import { cn } from '../../../lib/utils';

interface RowSelectorProps {
  rows: CellReference[];
  rangeOption: CellReference | null;
  fieldName: string;
  onSelect: (reference: CellReference) => void;
  onBack: () => void;
}

export const RowSelector: React.FC<RowSelectorProps> = ({ rows, rangeOption, fieldName, onSelect, onBack }) => {
  return (
    <div className="space-y-3">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={onBack}
          className="text-accent-cyan hover:text-accent-gold transition-colors flex items-center gap-1"
        >
          <Icon n="ti-chevron-left" size={12} />
          <span>Fields</span>
        </button>
        <Icon n="ti-chevron-right" size={10} className="text-white/30" />
        <span className="text-white/50">{fieldName}</span>
        <Icon n="ti-chevron-right" size={10} className="text-white/30" />
        <span className="text-white/80 font-medium">Select Row</span>
      </div>
      
      {/* Range Option - All Rows */}
      {rangeOption && (
        <button
          onClick={() => onSelect(rangeOption)}
          className="w-full text-left p-3 rounded-xl bg-gradient-emerald-cyan/15 border border-accent-emerald/30 hover:bg-gradient-emerald-cyan/25 transition-all group"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-emerald/20 flex items-center justify-center flex-shrink-0">
              <Icon n="ti-chart-bar" size={16} className="text-accent-emerald" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white/90">All Rows</div>
              <div className="text-2xs text-accent-emerald mt-0.5">SUM of all {fieldName} values</div>
              <p className="text-2xs text-white/40 mt-1">Use this entire column in calculations (SUM, AVERAGE, etc.)</p>
            </div>
            <Icon n="ti-chevron-right" size={14} className="text-accent-emerald/50 group-hover:text-accent-emerald transition-all flex-shrink-0" />
          </div>
        </button>
      )}
      
      {/* Individual Rows Section */}
      <div>
        <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
          Individual Rows
        </div>
        
        {rows.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <Icon n="ti-calendar" size={24} className="mx-auto mb-2 opacity-50" />
            <div className="text-sm">No rows with data yet</div>
            <div className="text-xs mt-1">Add entries to this table first</div>
          </div>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {rows.map(row => (
              <button
                key={row.rowId}
                onClick={() => onSelect(row)}
                className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2 group"
              >
                <Icon n="ti-calendar" size={12} className="text-accent-cyan group-hover:text-accent-gold" />
                <span className="text-sm text-white/80 flex-1">
                  {row.rowLabel || `Row ${row.rowNumber}`}
                </span>
                <span className="text-2xs text-white/30 group-hover:text-accent-gold">
                  Click to add
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};