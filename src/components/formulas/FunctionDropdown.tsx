import React, { useState } from 'react';
import { Button } from '../shared/Button';
import { Icon } from '../shared/Icon';
import { FORMULA_FUNCTIONS } from '../../lib/formulaEngine';

interface FunctionDropdownProps {
  onSelect: (functionName: string) => void;
}

export const FunctionDropdown: React.FC<FunctionDropdownProps> = ({ onSelect }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Button variant="default" small onClick={() => setShowDropdown(!showDropdown)}>
        <Icon n="ti-function" size={12} /> Functions ▼
      </Button>
      
      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: 4,
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 8,
          padding: 8,
          minWidth: 180,
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {FORMULA_FUNCTIONS.map(func => (
            <div
              key={func.name}
              onClick={() => {
                onSelect(func.name);
                setShowDropdown(false);
              }}
              style={{
                padding: '6px 10px',
                cursor: 'pointer',
                borderRadius: 4,
                fontSize: 12
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-background-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontWeight: 500 }}>{func.name}</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>{func.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};