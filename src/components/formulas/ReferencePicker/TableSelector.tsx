import React from 'react';
import { Icon } from '../../shared/Icon';
import { cn } from '../../../lib/utils';

interface TableSelectorProps {
  tables: string[];
  onSelect: (tableName: string) => void;
  onCancel: () => void;
}

export const TableSelector: React.FC<TableSelectorProps> = ({ tables, onSelect, onCancel }) => {
  if (tables.length === 0) {
    return (
      <div className="text-center py-8">
        <Icon n="ti-table-off" size={32} className="mx-auto mb-2 opacity-50" />
        <div className="text-sm text-white/40">No tables found</div>
        <button 
          onClick={onCancel}
          className="mt-3 px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 transition-all"
        >
          Close
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
        Select Table
      </div>
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {tables.map(table => (
          <button
            key={table}
            onClick={() => onSelect(table)}
            className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2 group"
          >
            <Icon n="ti-table" size={14} className="text-accent-cyan group-hover:text-accent-gold" />
            <span className="text-sm text-white/80 flex-1">{table}</span>
            <Icon n="ti-chevron-right" size={12} className="text-white/30 group-hover:text-accent-gold transition-all" />
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