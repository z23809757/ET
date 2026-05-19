import React from 'react';
import { Icon } from '../../shared/Icon';

interface TableSelectorProps {
  tables: string[];
  onSelect: (tableName: string) => void;
  onCancel: () => void;
}

export const TableSelector: React.FC<TableSelectorProps> = ({ tables, onSelect, onCancel }) => {
  if (tables.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>No tables found</div>
        <button 
          onClick={onCancel}
          style={{ marginTop: 12, padding: '4px 12px', fontSize: 11, cursor: 'pointer' }}
        >
          Close
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
        Select Table
      </div>
      {tables.map(table => (
        <div
          key={table}
          onClick={() => onSelect(table)}
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
          <Icon n="ti-table" size={14} color="#185FA5" />
          <span>{table}</span>
        </div>
      ))}
    </div>
  );
};