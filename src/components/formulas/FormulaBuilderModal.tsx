import React, { useState, useCallback } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Icon } from '../shared/Icon';
import { ReferencePicker } from './ReferencePicker';
import { OperatorButtons } from './OperatorButtons';
import { FunctionDropdown } from './FunctionDropdown';
import { FormulaPreview } from './FormulaPreview';
import { useFormulaEvaluation } from '../../hooks/useFormulaEvaluation';
import { useCellReferences } from '../../hooks/useCellReferences';
import { CellReference } from '../../types/formula';

interface FormulaBuilderModalProps {
  tableId: string;
  fieldName?: string;
  initialFormula?: string;
  onSave: (formula: string) => void;
  onClose: () => void;
}

export const FormulaBuilderModal: React.FC<FormulaBuilderModalProps> = ({
  tableId,
  fieldName,
  initialFormula = '',
  onSave,
  onClose
}) => {
  const [formula, setFormula] = useState(initialFormula || '=');
  const [previewValue, setPreviewValue] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { evaluateFormulaForRow, evaluating } = useFormulaEvaluation();
  const { availableReferences, getReferenceString } = useCellReferences();
  
  const updatePreview = useCallback(async (newFormula: string) => {
    if (newFormula === '=' || newFormula.length <= 1) {
      setPreviewValue(null);
      setError(null);
      return;
    }
    
    try {
      // For preview, we need a dummy row context
      const dummyRow = {};
      const value = await evaluateFormulaForRow(newFormula, dummyRow, tableId);
      if (value !== null && value !== undefined) {
        setPreviewValue(value);
        setError(null);
      } else {
        setPreviewValue(null);
      }
    } catch (err: any) {
      setError(err.message);
      setPreviewValue(null);
    }
  }, [evaluateFormulaForRow, tableId]);
  
  const handleAddReference = (reference: CellReference) => {
    const refString = getReferenceString(reference);
    const newFormula = formula + refString;
    setFormula(newFormula);
    updatePreview(newFormula);
  };
  
  const handleAddOperator = (operator: string) => {
    const newFormula = formula + operator;
    setFormula(newFormula);
    updatePreview(newFormula);
  };
  
  const handleAddFunction = (functionName: string) => {
    const newFormula = formula + functionName + '(';
    setFormula(newFormula);
    updatePreview(newFormula);
  };
  
  const handleClear = () => {
    setFormula('=');
    setPreviewValue(null);
    setError(null);
  };
  
  const handleSave = async () => {
    if (formula === '=' || formula.length <= 1) {
      setError('Please enter a formula');
      return;
    }
    
    onSave(formula);
    onClose();
  };
  
  return (
    <Modal title={`Formula Builder${fieldName ? ` - ${fieldName}` : ''}`} icon="ti-calculator" onClose={onClose} width={800}>
      <div style={{ marginBottom: 20 }}>
        <FormulaPreview
          formula={formula}
          previewValue={previewValue}
          error={error}
          calculating={evaluating}
        />
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
          Build Formula
        </div>
        
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <ReferencePicker
            references={availableReferences}
            onSelect={handleAddReference}
          />
          <FunctionDropdown onSelect={handleAddFunction} />
          <Button variant="default" small onClick={() => handleAddOperator('(')}>(</Button>
          <Button variant="default" small onClick={() => handleAddOperator(')')}>)</Button>
        </div>
        
        <div style={{
          background: 'var(--color-background-secondary)',
          border: '0.5px solid var(--color-border-secondary)',
          borderRadius: 8,
          padding: '10px 12px',
          minHeight: 60,
          fontFamily: 'monospace',
          fontSize: 13,
          marginBottom: 12
        }}>
          {formula}
        </div>
        
        <OperatorButtons onOperatorClick={handleAddOperator} />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <Button variant="ghost" small onClick={handleClear}>
            <Icon n="ti-trash" size={12} /> Clear
          </Button>
        </div>
      </div>
      
      <div style={{
        background: 'var(--color-background-secondary)',
        borderRadius: 8,
        padding: 12,
        maxHeight: 300,
        overflowY: 'auto'
      }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', marginBottom: 8 }}>
          Available References (Click to add)
        </div>
        
        {availableReferences.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-tertiary)' }}>
            No tables with data yet. Create tables and add data first.
          </div>
        ) : (
          Object.entries(
            availableReferences.reduce((groups, ref) => {
              if (!groups[ref.tableName]) groups[ref.tableName] = [];
              groups[ref.tableName].push(ref);
              return groups;
            }, {} as Record<string, typeof availableReferences>)
          ).map(([tableName, refs]) => (
            <div key={tableName} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                📊 {tableName}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {refs.slice(0, 10).map((ref, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAddReference(ref)}
                    style={{
                      padding: '3px 8px',
                      fontSize: 11,
                      background: 'var(--color-background-primary)',
                      border: '0.5px solid var(--color-border-secondary)',
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                  >
                    {ref.fieldName}{ref.rowLabel ? ` (${ref.rowLabel})` : ref.isRange ? ' (All)' : ''}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20, paddingTop: 14, borderTop: '0.5px solid var(--color-border-tertiary)' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="blue" onClick={handleSave} disabled={!!error || formula === '='}>
          <Icon n="ti-check" size={13} /> Save Formula
        </Button>
      </div>
    </Modal>
  );
};