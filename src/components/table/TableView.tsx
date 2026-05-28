import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../shared/Icon';
import { Button } from '../shared/Button';
import { Table, Row, UserSettings } from '../../types/finance';
import { formatField } from '../../lib/formatters';
import { FormulaBuilderModal } from '../formulas/FormulaBuilderModal';
import { useFinanceStore } from '../../hooks/useFinanceStore';
import { formulaStorageService } from '../../services/formulaStorageService';
import { useMergeCells } from '../../hooks/useMergeCells';
import { useFormulaEvaluation } from '../../hooks/useFormulaEvaluation';
import { MergeToolbar } from './MergeToolbar';
import { cn } from '../../lib/utils';
import { diffMinutes, formatHM, computePay, parseTimeToMinutes, computeRowMinutes } from '../../lib/timeMath';

// Convert "h:mm AM/PM" (stored) <-> "HH:MM" (native <input type=time>)
const to24h = (v: string): string => {
  const min = parseTimeToMinutes(v);
  if (min === null) return '';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};
const to12h = (hhmm: string): string => {
  if (!hhmm) return '';
  const [hStr, mStr] = hhmm.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return '';
  const ap = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m.toString().padStart(2, '0')} ${ap}`;
};

interface TableViewProps {
  table: Table;
  rows: Row[];
  settings: UserSettings;
  onAddRow: (data: any) => void;
  onEditRow: (id: string, data: any) => void;
  onDeleteRow: (id: string) => void;
  onRateChange?: (rate: number) => void;
}

const ROW_H = 44; // Increased for better touch targets on mobile
const VISIBLE = 25;

export const TableView: React.FC<TableViewProps> = ({ table, rows, settings, onAddRow, onEditRow, onDeleteRow, onRateChange }) => {
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState<string | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [showFormulaBuilder, setShowFormulaBuilder] = useState<{ field: any; rowId: string; currentFormula?: string } | null>(null);
  const [formulaValues, setFormulaValues] = useState<Record<string, Record<string, any>>>({});
  const [rowFormulas, setRowFormulas] = useState<Record<string, Record<string, string>>>({});
  const [isLoadingFormulas, setIsLoadingFormulas] = useState(true);
  const [mergedFormulaValues, setMergedFormulaValues] = useState<Record<string, any>>({});
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { state } = useFinanceStore();

  const { 
    merges, 
    selectionMode,
    setSelectionMode,
    selectedRange,
    setSelectedRange,
    isCellMerged,
    isCellHidden,
    mergeCells,
    unmergeCells,
    clearAllMerges,
    updateMergedValue,
  } = useMergeCells(table.id);

  const { evaluateFormulaForRow, evaluating } = useFormulaEvaluation(merges, state);

  const [selectionStart, setSelectionStart] = useState<{ rowId: string; colId: string } | null>(null);

  useEffect(() => {
    const loadFormulas = async () => {
      setIsLoadingFormulas(true);
      const formulas = await formulaStorageService.getFormulasForTable(table.id);
      setRowFormulas(formulas);
      setIsLoadingFormulas(false);
    };
    loadFormulas();
  }, [table.id]);

  // DEPENDENCY-AWARE MERGED FORMULA EVALUATION
  useEffect(() => {
    const newValues: Record<string, any> = {};

    const baseMerges = merges.filter(m => {
      const raw = m.merged_value || '';
      return !raw.startsWith('=') || !raw.includes('MERGE_');
    });
    const dependentMerges = merges.filter(m => {
      const raw = m.merged_value || '';
      return raw.startsWith('=') && raw.includes('MERGE_');
    });

    for (const merge of baseMerges) {
      const rawValue = merge.merged_value || '';
      if (rawValue.startsWith('=')) {
        const firstRow = rows.find(r => r.id === merge.start_row_id);
        if (firstRow) {
          const result = evaluateFormulaForRow(rawValue, firstRow, table.id);
          newValues[merge.id] = result;
        }
      } else {
        const num = parseFloat(rawValue);
        newValues[merge.id] = isNaN(num) ? 0 : num;
      }
    }

    let unresolved = [...dependentMerges];
    const MAX_PASSES = 20;
    let pass = 0;

    while (unresolved.length > 0 && pass < MAX_PASSES) {
      const stillUnresolved = [];
      let madeProgress = false;

      for (const merge of unresolved) {
        let formula = merge.merged_value.substring(1);

        const hasLegacyRefs = formula.includes('!');
        const hasMergeRefs = formula.includes('MERGE_');

        if (hasLegacyRefs && !hasMergeRefs) {
          const firstRow = rows.find(r => r.id === merge.start_row_id);
          if (firstRow) {
            const result = evaluateFormulaForRow(merge.merged_value, firstRow, table.id);
            newValues[merge.id] = result;
            madeProgress = true;
          }
          continue;
        }

        const neededRefs = formula.match(/MERGE_([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/g) || [];
        const allResolved = neededRefs.every(ref => {
          const refId = ref.replace('MERGE_', '');
          return newValues[refId] !== undefined;
        });

        if (!allResolved) {
          stillUnresolved.push(merge);
          continue;
        }

        for (const [mergeId, resolvedVal] of Object.entries(newValues)) {
          formula = formula.split(`MERGE_${mergeId}`).join(String(resolvedVal));
        }

        formula = formula.replace(
          /ROW_([a-f0-9-]+)_([a-f0-9-]+)/g,
          (_, rowId, fieldId) => {
            const row = rows.find(r => r.id === rowId);
            if (!row) return '0';
            
            const mergeRef = merges.find(m =>
              m.start_row_id === rowId &&
              m.start_col_id === fieldId
            );
            if (mergeRef) {
              return String(newValues[mergeRef.id] || 0);
            }
            
            const val = parseFloat(row[fieldId]);
            return isNaN(val) ? '0' : String(val);
          }
        );

        try {
          const result = Function('"use strict"; return (' + formula + ')')();
          newValues[merge.id] = typeof result === 'number' && !isNaN(result) ? result : 0;
          madeProgress = true;
        } catch {
          newValues[merge.id] = 0;
          madeProgress = true;
        }
      }

      unresolved = stillUnresolved;

      if (!madeProgress) {
        for (const merge of unresolved) {
          console.warn('Circular reference detected for merge:', merge.id);
          newValues[merge.id] = 0;
        }
        break;
      }

      pass++;
    }

    setMergedFormulaValues(newValues);
  }, [merges, rows, table.id, evaluateFormulaForRow]);

  const evaluateAllFormulas = useCallback(() => {
    const formulaFields = table.fields.filter(f => f.type === 'Formula');
    if (formulaFields.length === 0) return;

    const newFormulaValues: Record<string, Record<string, any>> = {};

    for (const row of rows) {
      newFormulaValues[row.id] = {};
      for (const field of formulaFields) {
        const formula = rowFormulas[row.id]?.[field.id];
        if (formula) {
          const result = evaluateFormulaForRow(formula, row, table.id);
          newFormulaValues[row.id][field.id] = result;
        } else {
          newFormulaValues[row.id][field.id] = null;
        }
      }
    }

    setFormulaValues(newFormulaValues);
  }, [rows, table.fields, rowFormulas, evaluateFormulaForRow, table.id]);

  useEffect(() => {
    if (!isLoadingFormulas) {
      evaluateAllFormulas();
    }
  }, [rows, rowFormulas, evaluateAllFormulas, isLoadingFormulas]);

  const startEdit = (row: Row) => {
    setEditId(row.id);
    const f: any = {};
    table.fields.forEach(fld => {
      if (fld.type !== 'Formula') {
        const merge = isCellMerged(row.id, fld.id);
        if (merge) {
          f[fld.id] = merge.merged_value || '';
        } else {
          f[fld.id] = row[fld.id] || '';
        }
      }
    });
    setForm(f);
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({});
  };

  const submit = () => {
    if (editId) {
      const updatePromises = Object.entries(form).map(async ([fieldId, value]) => {
        const merge = isCellMerged(editId, fieldId);
        if (merge) {
          const stringValue = String(value);
          await updateMergedValue(merge.id, stringValue);
        }
      });
      
      Promise.all(updatePromises).then(() => {
        onEditRow(editId, form);
        evaluateAllFormulas();
      });
    } else {
      onAddRow(form);
    }
    setForm({});
    setEditId(null);
  };

  const handleCellClick = (rowId: string, colId: string, e: React.MouseEvent) => {
    if (selectionMode === 'merge' || selectionMode === 'unmerge') {
      e.preventDefault();
      e.stopPropagation();

      if (selectionStart) {
        setSelectedRange({
          startRowId: selectionStart.rowId,
          endRowId: rowId,
          startColId: selectionStart.colId,
          endColId: colId
        });
      } else {
        setSelectionStart({ rowId, colId });
        setSelectedRange({
          startRowId: rowId,
          endRowId: rowId,
          startColId: colId,
          endColId: colId
        });
      }
      return;
    }
  };

  const handleApplyMerge = async () => {
    if (!selectedRange) return;

    if (selectionMode === 'merge') {
      const firstRow = rows.find(r => r.id === selectedRange.startRowId);
      const firstField = table.fields.find(f => f.id === selectedRange.startColId);
      const mergedValue = firstRow?.[firstField?.id || ''] || '';

      await mergeCells(
        selectedRange.startRowId,
        selectedRange.endRowId,
        selectedRange.startColId,
        selectedRange.endColId,
        String(mergedValue)
      );
    } else if (selectionMode === 'unmerge') {
      const mergeToRemove = merges.find(m =>
        m.start_row_id === selectedRange.startRowId &&
        m.start_col_id === selectedRange.startColId
      );
      if (mergeToRemove) {
        await unmergeCells(mergeToRemove.id);
      }
    }

    setSelectionMode('none');
    setSelectedRange(null);
    setSelectionStart(null);
  };

  const handleCancelSelection = () => {
    setSelectionMode('none');
    setSelectedRange(null);
    setSelectionStart(null);
  };

  const getRowSpan = (mergedCell: any, allRows: Row[]) => {
    const startIndex = allRows.findIndex(r => r.id === mergedCell.start_row_id);
    const endIndex = allRows.findIndex(r => r.id === mergedCell.end_row_id);
    if (startIndex === -1 || endIndex === -1) return 1;
    return endIndex - startIndex + 1;
  };

  const getColSpan = (mergedCell: any, fields: any[]) => {
    const startIndex = fields.findIndex(f => f.id === mergedCell.start_col_id);
    const endIndex = fields.findIndex(f => f.id === mergedCell.end_col_id);
    if (startIndex === -1 || endIndex === -1) return 1;
    return endIndex - startIndex + 1;
  };

  const isCellSelected = (rowId: string, colId: string) => {
    if (!selectedRange) return false;

    const rowIds = rows.map(r => r.id);
    const fieldIds = table.fields.map(f => f.id);

    const startRowIdx = rowIds.indexOf(selectedRange.startRowId);
    const endRowIdx = rowIds.indexOf(selectedRange.endRowId);
    const currentRowIdx = rowIds.indexOf(rowId);

    const startColIdx = fieldIds.indexOf(selectedRange.startColId);
    const endColIdx = fieldIds.indexOf(selectedRange.endColId);
    const currentColIdx = fieldIds.indexOf(colId);

    const minRow = Math.min(startRowIdx, endRowIdx);
    const maxRow = Math.max(startRowIdx, endRowIdx);
    const minCol = Math.min(startColIdx, endColIdx);
    const maxCol = Math.max(startColIdx, endColIdx);

    return currentRowIdx >= minRow && currentRowIdx <= maxRow &&
           currentColIdx >= minCol && currentColIdx <= maxCol;
  };

  // Per-table hourly rate. Seeded from the table's stored value (once the
  // migration adds the column); editable live via the rate bar at the top.
  const [rateInput, setRateInput] = useState<string>(
    String(Number((table as any).hourly_rate) || '')
  );
  const hourlyRate = Number(rateInput) || 0;

  // Compute the auto value for a Total Hours / Estimated Pay field from the
  // current form's Start/End Time fields.
  const computeAutoValue = (f: any, formData: Record<string, any>): string => {
    const startField = table.fields.find((x: any) => x.type === 'Start Time');
    const endField = table.fields.find((x: any) => x.type === 'End Time');
    if (!startField || !endField) return '';
    const min = diffMinutes(formData[startField.id], formData[endField.id]);
    if (min === null) return '';
    if (f.type === 'Total Hours') return formatHM(min);
    // Estimated Pay
    const pay = computePay(min, hourlyRate);
    return pay.toFixed(2);
  };

  const getEntryFieldWidth = (fieldType: string) => {
    if (fieldType === 'Date' || fieldType === 'Month' || fieldType === 'Start Time' || fieldType === 'End Time') {
      return 'w-36';
    }
    if (fieldType === 'Formula' || fieldType === 'Total Hours' || fieldType === 'Estimated Pay') {
      return 'w-40';
    }
    return 'w-44';
  };

  const renderInput = (f: any) => {
    if (f.type === 'Formula') {
      return (
        <div className="w-full" key={f.id}>
          <div className="px-2 py-1.5 text-xs bg-white/5 rounded-lg text-white/40 text-center flex items-center justify-center gap-1.5">
            <Icon n="ti-calculator" size={12} />
            Auto-calculated
          </div>
        </div>
      );
    }

    const v = form[f.id] || '';
    const set = (val: any) => setForm((p: any) => ({ ...p, [f.id]: val }));
    const baseInputClass = "w-full px-2 py-2 md:py-1.5 text-xs border border-white/10 rounded-lg bg-white/5 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30 transition-all";

    if (f.type === 'Dropdown') {
      return (
        <select key={f.id} value={v} onChange={(e: any) => set(e.target.value)} className={baseInputClass}>
          <option value="">Select…</option>
          {(f.dropdownOptions || []).map((o: any) => (
            <option key={o.id} value={o.label}>{o.label}</option>
          ))}
        </select>
      );
    }
    if (f.type === 'Date') return <input key={f.id} type="date" value={v} onChange={(e: any) => set(e.target.value)} className={baseInputClass} />;
    if (f.type === 'Month') return <input key={f.id} type="month" value={v} onChange={(e: any) => set(e.target.value)} className={baseInputClass} />;
    if (f.type === 'Number') return <input key={f.id} type="number" value={v} onChange={(e: any) => set(e.target.value)} placeholder={f.name} className={cn(baseInputClass, "text-right")} />;

    // Start/End Time: a native time input, displayed/stored as 12-hour AM/PM.
    if (f.type === 'Start Time' || f.type === 'End Time') {
      return (
        <input
          key={f.id}
          type="time"
          value={to24h(v)}
          onChange={(e: any) => set(to12h(e.target.value))}
          placeholder={f.name}
          className={baseInputClass}
        />
      );
    }

    // Total Hours / Estimated Pay: auto-computed, but user may override by typing.
    if (f.type === 'Total Hours' || f.type === 'Estimated Pay') {
      const auto = computeAutoValue(f, form);
      const isOverridden = v !== '' && v != null;
      return (
        <input
          key={f.id}
          type="text"
          value={isOverridden ? v : auto}
          onChange={(e: any) => set(e.target.value)}
          placeholder={auto || (f.type === 'Total Hours' ? 'auto' : 'auto')}
          className={cn(baseInputClass, "text-right", !isOverridden && "text-white/50 italic")}
          title={isOverridden ? 'Overridden — clear to auto-calculate' : 'Auto-calculated from Start/End Time'}
        />
      );
    }

    return <input key={f.id} type="text" value={v} onChange={(e: any) => set(e.target.value)} placeholder={f.name} className={baseInputClass} />;
  };

  const fmtCell = (row: Row, f: any): React.ReactNode | null => {
    const hidden = isCellHidden(row.id, f.id, rows, table.fields);
    if (hidden) return null;

    const mergedCell = isCellMerged(row.id, f.id);
    if (mergedCell) {
      const rawValue = mergedCell.merged_value || '';
      let displayValue: string = rawValue;
      
      if (rawValue.startsWith('=') && mergedFormulaValues[mergedCell.id] !== undefined) {
        const calculatedValue = mergedFormulaValues[mergedCell.id];
        if (typeof calculatedValue === 'number') {
          displayValue = formatField(calculatedValue, f.currency || 'USD', settings.displayCurrency, settings.exchangeRate);
        } else {
          displayValue = String(calculatedValue);
        }
      } else if (f.type === 'Number' && rawValue && !rawValue.startsWith('=')) {
        const numValue = parseFloat(rawValue);
        if (!isNaN(numValue)) {
          displayValue = formatField(numValue, f.currency, settings.displayCurrency, settings.exchangeRate);
        }
      }

      return (
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="text-center font-medium text-white/90 px-2 py-1 flex-1 rounded text-xs md:text-sm">
            {displayValue}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFormulaBuilder({ 
                field: f, 
                rowId: mergedCell.start_row_id, 
                currentFormula: mergedCell.merged_value 
              });
            }}
            className="bg-transparent border-none cursor-pointer text-xs text-accent-cyan hover:text-accent-gold transition-colors px-1 py-0.5 rounded flex items-center gap-1 touch-manipulation"
          >
            <Icon n="ti-edit" size={isMobile ? 14 : 12} />
            <span className="hidden sm:inline">Edit</span>
          </button>
        </div>
      );
    }

    if (f.type === 'Formula') {
      const formula = rowFormulas[row.id]?.[f.id];
      const calculatedValue = formulaValues[row.id]?.[f.id];

      if (isLoadingFormulas) {
        return <span className="text-white/40 text-xs">Loading...</span>;
      }

      if (!formula) {
        return (
          <button
            onClick={() => setShowFormulaBuilder({ field: f, rowId: row.id })}
            className="bg-transparent border border-dashed border-white/20 rounded px-2 py-1 text-xs cursor-pointer text-accent-cyan hover:text-accent-gold hover:border-accent-cyan/50 transition-all flex items-center gap-1.5 touch-manipulation"
          >
            <Icon n="ti-calculator" size={12} />
            <span className="hidden sm:inline">Set Formula</span>
          </button>
        );
      }

      if (calculatedValue !== undefined && calculatedValue !== null) {
        const displayValue = formatField(calculatedValue, f.currency || 'USD', settings.displayCurrency, settings.exchangeRate);
        return (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs md:text-sm">{displayValue}</span>
            <button
              onClick={() => setShowFormulaBuilder({ field: f, rowId: row.id, currentFormula: formula })}
              className="bg-transparent border-none cursor-pointer text-xs text-accent-cyan hover:text-accent-gold transition-colors px-1 py-0.5 rounded touch-manipulation"
            >
              <Icon n="ti-edit" size={isMobile ? 14 : 12} />
              <span className="hidden sm:inline">Edit</span>
            </button>
          </div>
        );
      }

      return <span className="text-white/40 text-xs">No value</span>;
    }

    const v = row[f.id];

    // Time fields: show the stored "h:mm AM/PM" as-is.
    if (f.type === 'Start Time' || f.type === 'End Time') {
      return <span className="text-xs md:text-sm">{v || ''}</span>;
    }
    // Total Hours / Estimated Pay: use stored override if present, else compute from the row.
    if (f.type === 'Total Hours' || f.type === 'Estimated Pay') {
      if (v != null && v !== '') {
        // overridden / stored value
        if (f.type === 'Estimated Pay') {
          return formatField(parseFloat(v) || 0, f.currency || 'USD', settings.displayCurrency, settings.exchangeRate);
        }
        return <span className="text-xs md:text-sm">{v}</span>;
      }
      const min = computeRowMinutes(table.fields, row);
      if (min === null) return <span className="text-white/30 text-xs">—</span>;
      if (f.type === 'Total Hours') return <span className="text-xs md:text-sm">{formatHM(min)}</span>;
      const pay = computePay(min, hourlyRate);
      return formatField(pay, f.currency || 'USD', settings.displayCurrency, settings.exchangeRate);
    }

    if (f.type === 'Number' && v != null && v !== '') {
      return formatField(parseFloat(v) || 0, f.currency, settings.displayCurrency, settings.exchangeRate);
    }
    return <span className="text-xs md:text-sm break-words">{v || ''}</span>;
  };

  const total = rows.length;
  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_H) - 5);
  const endIdx = Math.min(total, startIdx + VISIBLE + 10);
  const visible = rows.slice(startIdx, endIdx);

  const handleFormulaSave = async (formula: string) => {
    if (!showFormulaBuilder) return;
    const { field, rowId } = showFormulaBuilder;
    
    const merge = isCellMerged(rowId, field.id);
    if (merge) {
      await updateMergedValue(merge.id, formula);
      
      const firstRow = rows.find(r => r.id === merge.start_row_id);
      if (firstRow && formula.startsWith('=')) {
        const result = evaluateFormulaForRow(formula, firstRow, table.id);
        setMergedFormulaValues(prev => ({ ...prev, [merge.id]: result }));
      } else {
        const num = parseFloat(formula);
        setMergedFormulaValues(prev => ({ ...prev, [merge.id]: isNaN(num) ? 0 : num }));
      }
    } else {
      await formulaStorageService.saveFormula(table.id, rowId, field.id, formula);
      setRowFormulas(prev => ({
        ...prev,
        [rowId]: { ...prev[rowId], [field.id]: formula }
      }));
      evaluateAllFormulas();
    }
    
    setShowFormulaBuilder(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <MergeToolbar
        selectionMode={selectionMode}
        onMergeModeToggle={() => setSelectionMode(selectionMode === 'merge' ? 'none' : 'merge')}
        onUnmergeModeToggle={() => setSelectionMode(selectionMode === 'unmerge' ? 'none' : 'unmerge')}
        onClearAllMerges={clearAllMerges}
        hasSelection={!!selectedRange}
        onApplyMerge={handleApplyMerge}
        onCancelSelection={handleCancelSelection}
      />

      {table.fields.some((f: any) => f.type === 'Estimated Pay') && (
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/10 bg-white/5">
          <Icon n="ti-cash" size={16} />
          <label className="text-xs text-white/70">Hourly rate</label>
          <div className="flex items-center gap-1">
            <span className="text-xs text-white/50">$</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value)}
              onBlur={() => onRateChange?.(Number(rateInput) || 0)}
              placeholder="0.00"
              className="w-24 px-2 py-1 text-xs rounded-lg bg-white/10 border border-white/10 text-white/90 focus:outline-none focus:border-accent-cyan/50"
            />
            <span className="text-xs text-white/50">/ hour</span>
          </div>
          <span className="text-2xs text-white/30 ml-auto">Estimated Pay = total hours × rate</span>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 text-white/40">
          <Icon n="ti-table-off" size={40} />
          <div className="mt-3 text-sm">No entries yet</div>
          <div className="text-xs text-white/30 mt-1">Click "Add" below to create your first entry</div>
        </div>
      ) : (
        <div 
          onScroll={(e: React.UIEvent<HTMLDivElement>) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
          className="flex-1 overflow-auto relative"
        >
          {/* Horizontal scroll wrapper for mobile */}
          <div className="overflow-x-auto">
            <table
              className="w-full border-collapse text-xs"
              style={{ minWidth: Math.max(720, table.fields.length * 150 + 96) }}
            >
              <thead className="sticky top-0 z-10 bg-navy-800/95 backdrop-blur-sm">
                <tr className="border-b border-white/10">
                  {table.fields.map(f => (
                    <th key={f.id} className="px-2 py-2.5 text-left text-2xs font-semibold text-white/50 uppercase tracking-wider whitespace-nowrap">
                      {f.name}
                      {f.type === 'Formula' && <span className="ml-1 text-[9px] text-accent-emerald">🔢</span>}
                    </th>
                  ))}
                  <th className="px-2 py-2.5 text-left text-2xs font-semibold text-white/50 uppercase tracking-wider w-20 whitespace-nowrap">Actions</th>
                </tr>
              </thead>

              <tbody>
                {startIdx > 0 && (
                  <tr style={{ height: startIdx * ROW_H }}>
                    <td colSpan={table.fields.length + 1} />
                  </tr>
                )}

                {visible.map((row) => {
                  const isDel = delId === row.id;

                  return (
                    <tr 
                      key={row.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-all duration-150 group"
                      style={{ height: ROW_H }}
                    >
                      {table.fields.map((f) => {
                        const cellContent = fmtCell(row, f);
                        if (cellContent === null) return null;
                        
                        const mergedCell = isCellMerged(row.id, f.id);
                        const isSelected = isCellSelected(row.id, f.id);
                        const isInMergeMode = selectionMode !== 'none';
                        
                        const rowSpan = mergedCell ? getRowSpan(mergedCell, rows) : 1;
                        const colSpan = mergedCell ? getColSpan(mergedCell, table.fields) : 1;

                        return (
                          <td
                            key={`${row.id}_${f.id}`}
                            onClick={(e: React.MouseEvent) => handleCellClick(row.id, f.id, e)}
                            rowSpan={rowSpan}
                            colSpan={colSpan}
                            className={cn(
                              "px-2 py-2 md:py-1.5 text-white/80 transition-all align-middle",
                              isInMergeMode && "cursor-crosshair",
                              isInMergeMode && isSelected && "bg-accent-cyan/10 border border-accent-cyan/50"
                            )}
                          >
                            {cellContent}
                          </td>
                        );
                      })}

                      <td className="px-2 py-2 md:py-1.5 align-middle">
                        {isDel ? (
                          <div className="flex items-center gap-1 text-xs flex-wrap">
                            <span className="text-coral-400">Delete?</span>
                            <button 
                              onClick={() => { onDeleteRow(row.id); setDelId(null); }}
                              className="text-coral-400 hover:text-coral-300 font-medium touch-manipulation"
                            >
                              Yes
                            </button>
                            <span className="text-white/30">·</span>
                            <button 
                              onClick={() => setDelId(null)}
                              className="text-white/40 hover:text-white/60 touch-manipulation"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <Icon n="ti-edit" size={isMobile ? 18 : 14} color="#06B6D4" className="cursor-pointer hover:scale-110 transition-transform touch-manipulation" onClick={() => startEdit(row)} />
                            <Icon n="ti-trash" size={isMobile ? 18 : 14} color="#F43F5E" className="cursor-pointer hover:scale-110 transition-transform touch-manipulation" onClick={() => setDelId(row.id)} />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {endIdx < total && (
                  <tr style={{ height: (total - endIdx) * ROW_H }}>
                    <td colSpan={table.fields.length + 1} />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Entry Bar - Responsive */}
      <div className="border-t border-white/10 p-2 md:p-3 bg-white/5 backdrop-blur-sm">
        <div className="text-2xs font-semibold text-white/40 uppercase tracking-wider mb-2">
          {editId ? 'EDIT ROW' : 'ADD NEW ROW'}
        </div>
        <div className="overflow-x-auto pb-1 custom-scroll">
          <div className="flex items-end gap-2 min-w-max">
            {table.fields.map(f => (
              <div key={f.id} className={cn("shrink-0", getEntryFieldWidth(f.type))}>
                <div className="text-[10px] leading-3 text-white/35 truncate mb-1 px-1" title={f.name}>
                  {f.name}
                </div>
                {renderInput(f)}
              </div>
            ))}
            <div className="flex items-center gap-2 shrink-0">
              <Button variant={editId ? 'green' : 'blue'} onClick={submit} size="sm" className="h-9 px-4">
                <Icon n={editId ? 'ti-check' : 'ti-plus'} size={12} />
                {editId ? 'Save' : 'Add'}
              </Button>
              {editId && (
                <button
                  onClick={cancelEdit}
                  className="h-9 text-xs text-white/40 hover:text-white/60 transition-colors px-2 touch-manipulation"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showFormulaBuilder && (
        <FormulaBuilderModal
          tableId={table.id}
          fieldName={showFormulaBuilder.field.name}
          initialFormula={showFormulaBuilder.currentFormula}
          merges={merges}
          onSave={handleFormulaSave}
          onClose={() => setShowFormulaBuilder(null)}
        />
      )}
    </div>
  );
};