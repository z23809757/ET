import React, { useState, useEffect, useCallback } from 'react';
import { S } from '../../lib/constants';
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

interface TableViewProps {
  table: Table;
  rows: Row[];
  settings: UserSettings;
  onAddRow: (data: any) => void;
  onEditRow: (id: string, data: any) => void;
  onDeleteRow: (id: string) => void;
}

const ROW_H = 37;
const VISIBLE = 25;

export const TableView: React.FC<TableViewProps> = ({ table, rows, settings, onAddRow, onEditRow, onDeleteRow }) => {
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState<string | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [showFormulaBuilder, setShowFormulaBuilder] = useState<{ field: any; rowId: string; currentFormula?: string } | null>(null);
  const [formulaValues, setFormulaValues] = useState<Record<string, Record<string, any>>>({});
  const [rowFormulas, setRowFormulas] = useState<Record<string, Record<string, string>>>({});
  const [isLoadingFormulas, setIsLoadingFormulas] = useState(true);
  const [mergedFormulaValues, setMergedFormulaValues] = useState<Record<string, any>>({});

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

  // ✅ DEPENDENCY-AWARE MERGED FORMULA EVALUATION
  useEffect(() => {
    const newValues: Record<string, any> = {};

    // Separate base merges (no MERGE_ dependencies) from dependent ones
    const baseMerges = merges.filter(m => {
      const raw = m.merged_value || '';
      return !raw.startsWith('=') || !raw.includes('MERGE_');
    });
    const dependentMerges = merges.filter(m => {
      const raw = m.merged_value || '';
      return raw.startsWith('=') && raw.includes('MERGE_');
    });

    // Pass 1: resolve base merges first
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

    // Pass 2+: resolve dependent merges in a loop
    let unresolved = [...dependentMerges];
    const MAX_PASSES = 20;
    let pass = 0;

    while (unresolved.length > 0 && pass < MAX_PASSES) {
      const stillUnresolved = [];
      let madeProgress = false;

      for (const merge of unresolved) {
        let formula = merge.merged_value.substring(1);

        // Check if this formula contains legacy ! references (no MERGE_)
        const hasLegacyRefs = formula.includes('!');
        const hasMergeRefs = formula.includes('MERGE_');

        if (hasLegacyRefs && !hasMergeRefs) {
          // Legacy format — resolve directly via evaluateFormulaForRow
          const firstRow = rows.find(r => r.id === merge.start_row_id);
          if (firstRow) {
            const result = evaluateFormulaForRow(merge.merged_value, firstRow, table.id);
            newValues[merge.id] = result;
            madeProgress = true;
          }
          continue;
        }

        // Check if all MERGE_ refs this formula needs are already resolved
        // Use exact UUID pattern (8-4-4-4-12) so "-10" after a MERGE_ UUID
        // is NOT treated as part of the ID (fixes "MERGE_<uuid>-10" bug).
        const neededRefs = formula.match(/MERGE_([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/g) || [];
        const allResolved = neededRefs.every(ref => {
          const refId = ref.replace('MERGE_', '');
          return newValues[refId] !== undefined;
        });

        if (!allResolved) {
          stillUnresolved.push(merge);
          continue;
        }

        // All dependencies resolved — substitute and evaluate
        for (const [mergeId, resolvedVal] of Object.entries(newValues)) {
          formula = formula.split(`MERGE_${mergeId}`).join(String(resolvedVal));
        }

        // Also resolve ROW_ references
        formula = formula.replace(
          /ROW_([a-f0-9-]+)_([a-f0-9-]+)/g,
          (_, rowId, fieldId) => {
            const row = rows.find(r => r.id === rowId);
            if (!row) return '0';
            
            // Check if this is a merged cell
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

  // ✅ Regular formula evaluation
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

  const renderInput = (f: any) => {
    if (f.type === 'Formula') {
      return React.createElement('div', { style: { flex: 1, minWidth: 80 }, key: f.id },
        React.createElement('div', {
          style: {
            padding: '6px 8px', fontSize: 12,
            background: 'var(--color-background-secondary)',
            borderRadius: 6, color: 'var(--color-text-tertiary)', textAlign: 'center'
          }
        },
          React.createElement(Icon, { n: 'ti-calculator', size: 12 }), ' Auto-calculated'
        )
      );
    }

    const v = form[f.id] || '';
    const set = (val: any) => setForm((p: any) => ({ ...p, [f.id]: val }));
    const base = {
      flex: 1, padding: '6px 8px', fontSize: 12,
      border: '0.5px solid var(--color-border-secondary)',
      borderRadius: 6, background: 'var(--color-background-secondary)',
      color: 'var(--color-text-primary)', outline: 'none', minWidth: 0
    };

    if (f.type === 'Dropdown') {
      return React.createElement('select', { key: f.id, value: v, onChange: (e: any) => set(e.target.value), style: base },
        React.createElement('option', { value: '' }, 'Select…'),
        (f.dropdownOptions || []).map((o: any) =>
          React.createElement('option', { key: o.id, value: o.label }, o.label)
        )
      );
    }
    if (f.type === 'Date')   return React.createElement('input', { key: f.id, type: 'date',   value: v, onChange: (e: any) => set(e.target.value), style: base });
    if (f.type === 'Month')  return React.createElement('input', { key: f.id, type: 'month',  value: v, onChange: (e: any) => set(e.target.value), style: base });
    if (f.type === 'Number') return React.createElement('input', { key: f.id, type: 'number', value: v, onChange: (e: any) => set(e.target.value), placeholder: f.name, style: { ...base, textAlign: 'right' } });
    return React.createElement('input', { key: f.id, type: 'text', value: v, onChange: (e: any) => set(e.target.value), placeholder: f.name, style: base });
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

      return React.createElement('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          width: '100%'
        }
      },
        React.createElement('div', {
          style: {
            textAlign: 'center',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            padding: '4px 8px',
            flex: 1,
            borderRadius: '4px'
          }
        }, displayValue),
        React.createElement('button', {
          onClick: (e) => {
            e.stopPropagation();
            setShowFormulaBuilder({ 
              field: f, 
              rowId: mergedCell.start_row_id, 
              currentFormula: mergedCell.merged_value 
            });
          },
          style: {
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 10,
            color: '#185FA5',
            padding: '2px 4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }
        },
          React.createElement(Icon, { n: 'ti-edit', size: 12 }),
          ' Edit'
        )
      );
    }

    if (f.type === 'Formula') {
      const formula = rowFormulas[row.id]?.[f.id];
      const calculatedValue = formulaValues[row.id]?.[f.id];

      if (isLoadingFormulas) {
        return React.createElement('span', { style: { color: 'var(--color-text-tertiary)', fontSize: 11 } }, 'Loading...');
      }

      if (!formula) {
        return React.createElement('button', {
          onClick: () => setShowFormulaBuilder({ field: f, rowId: row.id }),
          style: {
            background: 'transparent', border: '0.5px dashed var(--color-border-secondary)',
            borderRadius: 4, padding: '4px 8px', fontSize: 11, cursor: 'pointer',
            color: '#185FA5', display: 'flex', alignItems: 'center', gap: 4
          }
        },
          React.createElement(Icon, { n: 'ti-calculator', size: 12 }), ' Set Formula'
        );
      }

      if (calculatedValue !== undefined && calculatedValue !== null) {
        const displayValue = formatField(calculatedValue, f.currency || 'USD', settings.displayCurrency, settings.exchangeRate);
        return React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 } },
          React.createElement('span', null, displayValue),
          React.createElement('button', {
            onClick: () => setShowFormulaBuilder({ field: f, rowId: row.id, currentFormula: formula }),
            style: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 10, color: '#185FA5', padding: '2px 4px' }
          },
            React.createElement(Icon, { n: 'ti-edit', size: 12 }), ' Edit'
          )
        );
      }

      return React.createElement('span', { style: { color: 'var(--color-text-tertiary)', fontSize: 11 } }, 'No value');
    }

    const v = row[f.id];
    if (f.type === 'Number' && v != null && v !== '') {
      return formatField(parseFloat(v) || 0, f.currency, settings.displayCurrency, settings.exchangeRate);
    }
    return v || '';
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

  return React.createElement('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' } },

    React.createElement(MergeToolbar, {
      selectionMode,
      onMergeModeToggle:   () => setSelectionMode(selectionMode === 'merge'   ? 'none' : 'merge'),
      onUnmergeModeToggle: () => setSelectionMode(selectionMode === 'unmerge' ? 'none' : 'unmerge'),
      onClearAllMerges:    clearAllMerges,
      hasSelection:        !!selectedRange,
      onApplyMerge:        handleApplyMerge,
      onCancelSelection:   handleCancelSelection
    }),

    rows.length === 0
      ? React.createElement('div', { style: { textAlign: 'center', padding: 60, color: 'var(--color-text-tertiary)' } },
          React.createElement(Icon, { n: 'ti-table-off', size: 30 }),
          React.createElement('div', { style: { marginTop: 12 } }, 'No entries yet')
        )
      : React.createElement('div', {
          onScroll: (e: React.UIEvent<HTMLDivElement>) => setScrollTop((e.target as HTMLDivElement).scrollTop),
          style: { flex: 1, overflowY: 'auto', position: 'relative' }
        },
          React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 12, tableLayout: 'fixed' } },

            React.createElement('thead', { style: { position: 'sticky', top: 0, zIndex: 2 } },
              React.createElement('tr', null,
                table.fields.map(f =>
                  React.createElement('th', { key: f.id, style: S.th },
                    f.name,
                    f.type === 'Formula' && React.createElement('span', { style: { marginLeft: 4, fontSize: 9, color: '#1D9E75' } }, '🔢')
                  )
                ),
                React.createElement('th', { style: { ...S.th, width: 80 } }, 'Actions')
              )
            ),

            React.createElement('tbody', null,

              startIdx > 0 && React.createElement('tr', { style: { height: startIdx * ROW_H } },
                React.createElement('td', { colSpan: table.fields.length + 1 })
              ),

              visible.map((row) => {
                const isDel = delId === row.id;

                return React.createElement('tr', {
                  key: row.id,
                  style: {
                    borderBottom: '0.5px solid var(--color-border-tertiary)',
                    height: ROW_H,
                    background: 'transparent'
                  }
                },

                  table.fields.map((f) => {
                    const cellContent = fmtCell(row, f);
                    if (cellContent === null) return null;
                    
                    const mergedCell = isCellMerged(row.id, f.id);
                    const isSelected = isCellSelected(row.id, f.id);
                    const isInMergeMode = selectionMode !== 'none';
                    
                    const rowSpan = mergedCell ? getRowSpan(mergedCell, rows) : 1;
                    const colSpan = mergedCell ? getColSpan(mergedCell, table.fields) : 1;

                    return React.createElement('td', {
                      key: `${row.id}_${f.id}`,
                      style: {
                        ...S.td,
                        cursor: isInMergeMode ? 'crosshair' : 'default',
                        background: (isInMergeMode && isSelected) ? '#E6F1FB' : 'transparent',
                        border: (isInMergeMode && isSelected) ? '1px solid #185FA5' : (S.td as any).border,
                      },
                      onClick: (e: React.MouseEvent) => handleCellClick(row.id, f.id, e),
                      rowSpan: rowSpan,
                      colSpan: colSpan,
                    }, cellContent);
                  }),

                  React.createElement('td', { style: { ...S.td, width: 80 } },
                    isDel
                      ? React.createElement('span', { style: { fontSize: 11 } },
                          React.createElement('span', { style: { color: '#791F1F' } }, 'Delete? '),
                          React.createElement('span', {
                            onClick: () => { onDeleteRow(row.id); setDelId(null); },
                            style: { color: '#A32D2D', cursor: 'pointer', fontWeight: 500 }
                          }, 'Yes'),
                          React.createElement('span', { style: { color: 'var(--color-text-tertiary)' } }, ' · '),
                          React.createElement('span', {
                            onClick: () => setDelId(null),
                            style: { color: 'var(--color-text-tertiary)', cursor: 'pointer' }
                          }, 'Cancel')
                        )
                      : React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                          React.createElement(Icon, { n: 'ti-edit',  size: 14, color: '#185FA5', style: { cursor: 'pointer' }, onClick: () => startEdit(row) }),
                          React.createElement(Icon, { n: 'ti-trash', size: 14, color: '#D85A30', style: { cursor: 'pointer' }, onClick: () => setDelId(row.id) })
                        )
                  )
                );
              }),

              endIdx < total && React.createElement('tr', { style: { height: (total - endIdx) * ROW_H } },
                React.createElement('td', { colSpan: table.fields.length + 1 })
              )
            )
          )
        ),

    React.createElement('div', { style: S.entryBar },
      React.createElement('div', { style: { fontSize: 10, fontWeight: 500, color: 'var(--color-text-tertiary)', marginBottom: 6, letterSpacing: '.04em' } },
        editId ? 'EDIT ROW' : 'ADD NEW ROW'
      ),
      React.createElement('div', { style: { display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' } },
        table.fields.map(f =>
          React.createElement('div', { key: f.id, style: { flex: 1, minWidth: 80 } }, renderInput(f))
        ),
        React.createElement(Button, { variant: editId ? 'green' : 'blue', onClick: submit },
          React.createElement(Icon, { n: editId ? 'ti-check' : 'ti-plus', size: 13 }),
          editId ? 'Save' : 'Add'
        ),
        editId && React.createElement('span', {
          onClick: cancelEdit,
          style: { fontSize: 11, color: 'var(--color-text-tertiary)', cursor: 'pointer' }
        }, 'Cancel')
      )
    ),

    showFormulaBuilder && React.createElement(FormulaBuilderModal, {
      tableId:        table.id,
      fieldName:      showFormulaBuilder.field.name,
      initialFormula: showFormulaBuilder.currentFormula,
      merges:         merges,
      onSave:         handleFormulaSave,
      onClose:        () => setShowFormulaBuilder(null)
    })
  );
};