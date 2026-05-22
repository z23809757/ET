import React from 'react';
import { Icon } from '../../shared/Icon';
import { CellReference } from '../../../types/formula';
import { cn } from '../../../lib/utils';

interface FieldSelectorProps {
  fields: CellReference[];
  tableName: string;
  onSelect: (fieldName: string) => void;
  onBack: () => void;
}

export const FieldSelector: React.FC<FieldSelectorProps> = ({ fields, tableName, onSelect, onBack }) => {
  if (fields.length === 0) {
    return (
      <div>
        <button
          onClick={onBack}
          className="text-xs text-accent-cyan hover:text-accent-gold mb-4 flex items-center gap-1"
        >
          <Icon n="ti-chevron-left" size={12} /> Back to tables
        </button>
        <div className="text-center py-8 text-white/40">
          <Icon n="ti-chart-bar" size={32} className="mx-auto mb-2 opacity-50" />
          <div className="text-sm">No fields found</div>
          <div className="text-xs mt-1">This table has no editable fields</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={onBack}
          className="text-accent-cyan hover:text-accent-gold transition-colors flex items-center gap-1"
        >
          <Icon n="ti-chevron-left" size={12} />
          <span>Tables</span>
        </button>
        <Icon n="ti-chevron-right" size={10} className="text-white/30" />
        <span className="text-white/50">{tableName}</span>
        <Icon n="ti-chevron-right" size={10} className="text-white/30" />
        <span className="text-white/80 font-medium">Select Field</span>
      </div>
      
      <div className="text-xs font-semibold text-white/50 uppercase tracking-wider">
        Available Fields
      </div>
      
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {fields.map(field => (
          <button
            key={field.fieldName}
            onClick={() => onSelect(field.fieldName)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2 group",
              field.isRange 
                ? "bg-gradient-emerald-cyan/10 hover:bg-gradient-emerald-cyan/20 border border-accent-emerald/20" 
                : "bg-white/5 hover:bg-white/10"
            )}
          >
            <Icon 
              n={field.isRange ? "ti-chart-bar" : "ti-text-fields"} 
              size={14} 
              className={field.isRange ? "text-accent-emerald" : "text-accent-cyan group-hover:text-accent-gold"} 
            />
            <span className="text-sm text-white/80 flex-1">{field.fieldName}</span>
            <span className="text-2xs text-white/30 mr-2">
              ({field.fieldType || 'Text'})
            </span>
            {field.isRange && (
              <span className="text-2xs px-1.5 py-0.5 rounded-full bg-accent-emerald/20 text-accent-emerald">
                All rows
              </span>
            )}
            <Icon n="ti-chevron-right" size={12} className="text-white/30 group-hover:text-accent-gold transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
};