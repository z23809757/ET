import React from 'react';
import { Icon } from '../shared/Icon';

interface FormulaPreviewProps {
  formula: string;
  previewValue: any;
  error: string | null;
  calculating: boolean;
}

export const FormulaPreview: React.FC<FormulaPreviewProps> = ({
  formula,
  previewValue,
  error,
  calculating
}) => {
  return (
    <div style={{
      background: 'var(--color-background-secondary)',
      borderRadius: 8,
      padding: 12
    }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
        Formula Preview
      </div>
      <div style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-secondary)',
        borderRadius: 6,
        padding: '8px 12px',
        fontFamily: 'monospace',
        fontSize: 13,
        marginBottom: 8
      }}>
        {formula}
      </div>
      
      {calculating ? (
        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
          Calculating...
        </div>
      ) : error ? (
        <div style={{ fontSize: 12, color: '#D85A30' }}>
          <Icon n="ti-alert-triangle" size={12} /> {error}
        </div>
      ) : previewValue !== null && previewValue !== undefined ? (
        <div style={{ fontSize: 12, color: '#1D9E75' }}>
          <Icon n="ti-check" size={12} /> Result: {typeof previewValue === 'number' ? previewValue.toFixed(2) : previewValue}
        </div>
      ) : null}
    </div>
  );
};