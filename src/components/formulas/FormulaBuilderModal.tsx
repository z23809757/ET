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
import { cn } from '../../lib/utils';

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
  const [showReferencePicker, setShowReferencePicker] = useState(false);
  const [showFunctions, setShowFunctions] = useState(false);
  
  const { state } = useFinanceStore();
  const { availableReferences=[], getReferenceString } = useCellReferences();

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
    setShowReferencePicker(false);
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
    setShowFunctions(false);
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
    <Modal title={`Formula Builder${fieldName ? ` - ${fieldName}` : ''}`} icon="ti-calculator" onClose={onClose} width={750}>
      <div className="space-y-5">
        {/* Formula Preview Section */}
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Formula Preview
            </label>
            {calculating && (
              <span className="text-2xs text-white/30">Calculating...</span>
            )}
          </div>
          <div className="bg-navy-800/50 border border-white/10 rounded-lg p-3 font-mono text-sm text-white/90 break-all min-h-[60px]">
            {formula}
          </div>
          {error ? (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-coral-400">
              <Icon n="ti-alert-triangle" size={12} />
              <span>{error}</span>
            </div>
          ) : previewValue !== null ? (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
              <Icon n="ti-check" size={12} />
              <span>Result: {formattedPreview}</span>
            </div>
          ) : null}
        </div>

        {/* Build Formula Section */}
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
            Build Formula
          </label>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setShowReferencePicker(!showReferencePicker)}
              className="px-3 py-1.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 text-white/70 hover:text-white/90 transition-all flex items-center gap-1.5"
            >
              <Icon n="ti-plus" size={12} />
              Add Reference
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowFunctions(!showFunctions)}
                className="px-3 py-1.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 text-white/70 hover:text-white/90 transition-all flex items-center gap-1.5"
              >
                <Icon n="ti-function" size={12} />
                Functions ▼
              </button>
              {showFunctions && (
                <div className="absolute top-full left-0 mt-1 z-20">
                  <FunctionDropdown onSelect={handleAddFunction} onClose={() => setShowFunctions(false)} />
                </div>
              )}
            </div>
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map(btn => (
              <button
                key={btn}
                onClick={() => btn === '=' ? handleSave() : (btn === '+' || btn === '-' || btn === '*' || btn === '/') ? handleAddOperator(btn) : handleAddNumber(btn)}
                className={cn(
                  "py-2 rounded-lg text-sm font-medium transition-all",
                  btn === '=' 
                    ? "bg-gradient-emerald-cyan text-white col-span-2" 
                    : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white/90"
                )}
              >
                {btn}
              </button>
            ))}
          </div>

          {/* Parentheses and Clear */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handleAddNumber('(')}
              className="flex-1 py-2 rounded-lg text-sm bg-white/5 hover:bg-white/10 text-white/70 transition-all"
            >
              ( )
            </button>
            <button
              onClick={() => handleAddNumber(')')}
              className="flex-1 py-2 rounded-lg text-sm bg-white/5 hover:bg-white/10 text-white/70 transition-all"
            >
              ) (
            </button>
            <button
              onClick={handleClear}
              className="flex-1 py-2 rounded-lg text-sm bg-coral-500/20 hover:bg-coral-500/30 text-coral-400 transition-all"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Reference Picker - Collapsible */}
        {showReferencePicker && (
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                Select Reference
              </label>
              <button
                onClick={() => setShowReferencePicker(false)}
                className="text-white/40 hover:text-white/60"
              >
                <Icon n="ti-x" size={14} />
              </button>
            </div>
            <ReferencePicker 
            references={availableReferences || []}
              tableId={tableId}
              merges={merges}
              onSelect={handleAddReference}
              onCancel={() => setShowReferencePicker(false)}
            />
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="blue" 
          onClick={handleSave}
          disabled={!!error || formula === '='}
          icon={<Icon n="ti-check" size={13} />}
        >
          Save Formula
        </Button>
      </div>
    </Modal>
  );
};