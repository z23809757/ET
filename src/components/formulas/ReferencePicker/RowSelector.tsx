import React from 'react';
import { Icon } from '../../shared/Icon';
import { CellReference } from '../../../types/formula';

interface RowSelectorProps {
  rows: CellReference[];
  rangeOption: CellReference | null;
  fieldName: string;
  onSelect: (reference: CellReference) => void;
  onBack: () => void;
}

export const RowSelector: React.FC<RowSelectorProps> = ({ rows, rangeOption, fieldName, onSelect, onBack }) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Icon n="ti-chevron-left" size={14} style={{ cursor: 'pointer' }} onClick={onBack} />
        <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{fieldName}</span>
        <Icon n="ti-chevron-right" size={12} color="var(--color-text-tertiary)" />
        <span style={{ fontSize: 11, fontWeight: 500 }}>Select Row</span>
      </div>
      
      {rangeOption && (
        <div
          onClick={() => onSelect(rangeOption)}
          style={{
            padding: '8px 10px',
            cursor: 'pointer',
            borderRadius: 6,
            marginBottom: 8,
            background: '#EAF3DE',
            border: '0.5px solid #C0DD97'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#D4E8C4'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#EAF3DE'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon n="ti-chart-bar" size={14} color="#1D9E75" />
            <div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>All Rows</div>
              <div style={{ fontSize: 10, color: '#1D9E75' }}>SUM of all {fieldName} values</div>
            </div>
          </div>
        </div>
      )}
      
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', margin: '8px 0 4px' }}>
        Individual Rows
      </div>
      
      {rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-tertiary)' }}>
          No rows with data yet
        </div>
      ) : (
        rows.map(row => (
          <div
            key={row.rowId}
            onClick={() => onSelect(row)}
            style={{
              padding: '6px 10px',
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
            <Icon n="ti-calendar" size={12} />
            <span>{row.rowLabel || `Row ${row.rowNumber}`}</span>
          </div>
        ))
      )}
    </div>
  );
};