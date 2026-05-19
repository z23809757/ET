import React from 'react';
import { Button } from '../shared/Button';

interface OperatorButtonsProps {
  onOperatorClick: (operator: string) => void;
}

export const OperatorButtons: React.FC<OperatorButtonsProps> = ({ onOperatorClick }) => {
  const operators = ['+', '-', '*', '/', '(', ')', ',', '='];
  
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
      {operators.map(op => (
        <Button key={op} variant="default" small onClick={() => onOperatorClick(op)}>
          {op}
        </Button>
      ))}
    </div>
  );
};