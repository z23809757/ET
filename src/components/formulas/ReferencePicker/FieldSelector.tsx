import React from 'react';
import { Icon } from '../../shared/Icon';
import { CellReference } from '../../../types/formula';

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Icon n="ti-chevron-left" size={14} style={{ cursor: 'pointer' }} onClick={onBack} />
          <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Back to Tables</span>
        </div>
        <div style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-tertiary)' }}>
          No fields found in this table
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Icon n="ti-chevron-left" size={14} style={{ cursor: 'pointer' }} onClick={onBack} />
        <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{tableName}</span>
        <Icon n="ti-chevron-right" size={12} color="var(--color-text-tertiary)" />
        <span style={{ fontSize: 11, fontWeight: 500 }}>Select Field</span>
      </div>
      {fields.map(field => (
        <div
          key={field.fieldName}
          onClick={() => onSelect(field.fieldName)}
          style={{
            padding: '8px 10px',
            cursor: 'pointer',
            borderRadius: 6,
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderBottom: '0.5px solid var(--color-border-tertiary)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-background-secondary)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Icon n={field.isRange ? "ti-chart-bar" : "ti-text-fields"} size={12} color={field.isRange ? "#1D9E75" : "#185FA5"} />
          <span>{field.fieldName}</span>
          {field.isRange && <span style={{ fontSize: 9, color: '#1D9E75', marginLeft: 'auto' }}>All rows</span>}
        </div>
      ))}
    </div>
  );
};