import React from 'react';
import { Icon } from '../../shared/Icon';
import { CellReference } from '../../../types/formula';
import { cn } from '../../../lib/utils';

interface RangeSelectorProps {
  tables: string[];
  onSelect: (reference: CellReference) => void;
  onCancel: () => void;
  onBack: () => void;
}

export const RangeSelector: React.FC<RangeSelectorProps> = ({ tables, onSelect, onCancel, onBack }) => {
  return (
    <div className="space-y-3">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={onBack}
          className="text-accent-cyan hover:text-accent-gold transition-colors flex items-center gap-1"
        >
          <Icon n="ti-chevron-left" size={12} />
          <span>Back</span>
        </button>
        <Icon n="ti-chevron-right" size={10} className="text-white/30" />
        <span className="text-white/80 font-medium">Select Range</span>
      </div>
      
      <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
        Select a table to create range reference
      </div>
      
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {tables.map(table => (
          <button
            key={table}
            onClick={() => onSelect({ 
              tableName: table, 
              isRange: true,
              fieldName: 'All Fields'
            } as CellReference)}
            className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2 group"
          >
            <Icon n="ti-table" size={14} className="text-accent-cyan group-hover:text-accent-gold" />
            <span className="text-sm text-white/80 flex-1">{table}</span>
            <span className="text-2xs px-1.5 py-0.5 rounded-full bg-accent-emerald/20 text-accent-emerald">
              Range
            </span>
            <Icon n="ti-chevron-right" size={12} className="text-white/30 group-hover:text-accent-gold" />
          </button>
        ))}
      </div>
      
      <button
        onClick={onCancel}
        className="w-full text-center px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/60 transition-all mt-2"
      >
        Cancel
      </button>
    </div>
  );
};