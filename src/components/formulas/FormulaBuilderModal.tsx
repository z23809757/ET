import React, { useState, useCallback } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Icon } from '../shared/Icon';
import { ReferencePicker } from './ReferencePicker';
import { OperatorButtons } from './OperatorButtons';
import { FunctionDropdown } from './FunctionDropdown';
import { useFinanceStore } from '../../hooks/useFinanceStore';
import { useCellReferences } from '../../hooks/useCellReferences';
import { CellReference } from '../../types/formula';
import { formatField } from '../../lib/formatters';

interface MergedCell {
  id: string;
  table_id: string;
  start_row_id: string;
  end_row_id: string;
  start_col_id: string;
  end_col_id: string;
  merged_value: string;
  created_at: string;
}

interface FormulaBuilderModalProps {
  tableId: string;
  fieldName?: string;
  initialFormula?: string;
  merges?: MergedCell[];
  onSave: (formula: string) => void;
  onClose: () => void;
}

export const FormulaBuilderModal: React.FC<FormulaBuilderModalProps> = ({
  tableId,
  fieldName,
  initialFormula = '',
  merges = [],
  onSave,
  onClose
}) => {
  const [formula, setFormula] = useState(initialFormula || '=');
  const [previewValue, setPreviewValue] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);
  
  const { state } = useFinanceStore();
  const { availableReferences, getReferenceString } = useCellReferences();

  // Resolve a merged cell value for preview — handles nested ROW_/MERGE_ formulas
  const resolveMergedValue = useCallback((merge: MergedCell): number => {
    const raw = merge.merged_value || '';
    if (!raw) return 0;

    // Plain number — fast path
    if (!raw.startsWith('=')) {
      const num = parseFloat(raw);
      return isNaN(num) ? 0 : num;
    }

    let expr = raw.substring(1);

    // Resolve nested MERGE_ refs (avoid infinite recursion)
    for (const m of merges) {
      const placeholder = `MERGE_${m.id}`;
      if (expr.includes(placeholder) && m.id !== merge.id) {
        const nestedVal = resolveMergedValue(m);
        expr = expr.split(placeholder).join(String(nestedVal));
      }
    }

    // Resolve ROW_ references using live state
    expr = expr.replace(
      /ROW_([a-f0-9-]+)_([a-f0-9-]+)/g,
      (_: string, rowId: string, fieldId: string) => {
        for (const year of state.years) {
          const tabs = state.tabsByYear[year.id] || [];
          for (const tab of tabs) {
            for (const table of tab.tables) {
              const rows = state.rowsByTable[table.id] || [];
              const row = rows.find((r: any) => r.id === rowId);
              if (!row) continue;
              const val = parseFloat(row[fieldId]);
              return isNaN(val) ? '0' : String(val);
            }
          }
        }
        return '0';
      }
    );

    const clean = expr.replace(/[^0-9+\-*/().]/g, '').replace(/[+\-*/]+$/, '');
    if (!clean) return 0;
    try {
      const result = Function('"use strict"; return (' + clean + ')')();
      return typeof result === 'number' && !isNaN(result) ? result : 0;
    } catch {
      return 0;
    }
  }, [merges, state]);

  const updatePreview = useCallback(async (newFormula: string) => {
    if (newFormula === '=' || newFormula.length <= 1) {
      setPreviewValue(null);
      setError(null);
      return;
    }
    
    setCalculating(true);
    
    try {
      let expression = newFormula.startsWith('=') ? newFormula.substring(1) : newFormula;

      // Resolve MERGE_ references — use resolveMergedValue(merge) so nested
      // formulas inside merged cells (e.g. =ROW_...) are evaluated correctly
      for (const merge of merges) {
        const placeholder = `MERGE_${merge.id}`;
        if (expression.includes(placeholder)) {
          const val = resolveMergedValue(merge);
          expression = expression.split(placeholder).join(String(val));
        }
      }

      // Resolve ROW_ references
      expression = expression.replace(
        /ROW_([a-f0-9-]+)_([a-f0-9-]+)/g,
        (match, rowId, fieldId) => {
          for (const year of state.years) {
            const tabs = state.tabsByYear[year.id] || [];
            for (const tab of tabs) {
              for (const table of tab.tables) {
                const rows = state.rowsByTable[table.id] || [];
                const row = rows.find((r: any) => r.id === rowId);
                if (!row) continue;
                const val = row[fieldId];
                const num = parseFloat(val);
                return isNaN(num) ? '0' : String(num);
              }
            }
          }
          return '0';
        }
      );

      // Clean and evaluate
      const cleanExpr = expression.replace(/\s/g, '');
      
      if (cleanExpr && /^[0-9+\-*/().]+$/.test(cleanExpr)) {
        const result = new Function('return (' + cleanExpr + ')')();
        setPreviewValue(result);
        setError(null);
      } else {
        setPreviewValue(null);
        setError('Invalid expression');
      }
    } catch (err: any) {
      setError(err.message);
      setPreviewValue(null);
    } finally {
      setCalculating(false);
    }
  }, [merges, state, resolveMergedValue]);

  const handleAddReference = useCallback(async (reference: CellReference) => {
    // Check if this is a merged cell
    const merge = merges.find(m =>
      m.table_id === reference.tableId &&
      m.start_row_id === reference.rowId &&
      m.start_col_id === reference.fieldId
    );

    let newFormula = formula;
    if (merge) {
      // Merged cell reference
      newFormula = formula + `MERGE_${merge.id}`;
    } else {
      // Regular cell reference
      newFormula = formula + `ROW_${reference.rowId}_${reference.fieldId}`;
    }
    
    setFormula(newFormula);
    await updatePreview(newFormula);
  }, [formula, merges, updatePreview]);

  const handleAddNumber = useCallback((num: string) => {
    const newFormula = formula + num;
    setFormula(newFormula);
    updatePreview(newFormula);
  }, [formula, updatePreview]);

  const handleAddOperator = useCallback((operator: string) => {
    const newFormula = formula + operator;
    setFormula(newFormula);
    updatePreview(newFormula);
  }, [formula, updatePreview]);

  const handleAddFunction = useCallback((functionName: string) => {
    const newFormula = formula + functionName + '(';
    setFormula(newFormula);
    updatePreview(newFormula);
  }, [formula, updatePreview]);

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

  const formattedPreview = previewValue !== null && typeof previewValue === 'number' 
    ? formatField(previewValue, 'USD', state.settings?.displayCurrency || 'USD', state.settings?.exchangeRate || 85.40)
    : previewValue;

  return (
    <Modal title={`Formula Builder${fieldName ? ` - ${fieldName}` : ''}`} icon="ti-calculator" onClose={onClose} width={700}>
      <div style={{ marginBottom: 20, background: 'var(--color-background-secondary)', borderRadius: 8, padding: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
          Formula Preview
        </div>
        <div style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-secondary)',
          borderRadius: 6,
          padding: '10px 12px',
          fontFamily: 'monospace',
          fontSize: 13,
          marginBottom: 8,
          wordBreak: 'break-all'
        }}>
          {formula}
        </div>
        {calculating ? (
          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Calculating...</div>
        ) : error ? (
          <div style={{ fontSize: 12, color: '#D85A30' }}>
            <Icon n="ti-alert-triangle" size={12} /> {error}
          </div>
        ) : previewValue !== null ? (
          <div style={{ fontSize: 12, color: '#1D9E75' }}>
            <Icon n="ti-check" size={12} /> Result: {formattedPreview}
          </div>
        ) : null}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
          Build Formula
        </div>
        
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <ReferencePicker references={availableReferences} onSelect={handleAddReference} />
          <FunctionDropdown onSelect={handleAddFunction} />
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.'].map(num => (
              <Button key={num} variant="default" small onClick={() => handleAddNumber(num)}>{num}</Button>
            ))}
          </div>
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
        maxHeight: 250,
        overflowY: 'auto'
      }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', marginBottom: 8 }}>
          Available References (Click to add)
        </div>
        
        {availableReferences.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-tertiary)' }}>
            No tables with data yet.
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
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 6 }}>
                📊 {tableName}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {refs.slice(0, 20).map((ref, idx) => {
                  const isMerged = merges.some(m =>
                    m.table_id === ref.tableId &&
                    m.start_row_id === ref.rowId &&
                    m.start_col_id === ref.fieldId
                  );
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAddReference(ref)}
                      style={{
                        padding: '4px 10px',
                        fontSize: 11,
                        background: 'var(--color-background-primary)',
                        border: '0.5px solid var(--color-border-secondary)',
                        borderRadius: 4,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        transition: 'all 0.15s',
                        backgroundColor: isMerged ? '#EAF3DE' : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-background-secondary)';
                        e.currentTarget.style.borderColor = '#185FA5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isMerged ? '#EAF3DE' : 'var(--color-background-primary)';
                        e.currentTarget.style.border = '0.5px solid var(--color-border-secondary)';
                      }}
                    >
                      <Icon n={isMerged ? "ti-merge-cells" : "ti-chart-bar"} size={10} color={isMerged ? "#1D9E75" : "#185FA5"} />
                      <span>{ref.fieldName}</span>
                      {ref.rowLabel && <span style={{ fontSize: 9, color: 'var(--color-text-tertiary)' }}>({ref.rowLabel})</span>}
                      {isMerged && <span style={{ fontSize: 8, color: '#1D9E75' }}> merged</span>}
                    </button>
                  );
                })}
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