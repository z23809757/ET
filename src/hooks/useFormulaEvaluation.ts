import { useState, useCallback } from 'react';
import { MergedCell } from '../services/mergeService';

export function useFormulaEvaluation(merges: MergedCell[] = [], state?: any) {
  const [evaluating, setEvaluating] = useState(false);

  const resolveValue = useCallback((rawValue: string): number => {
    if (!rawValue) return 0;
    if (rawValue.startsWith('=')) {
      try {
        const result = Function('"use strict"; return (' + rawValue.substring(1) + ')')();
        return typeof result === 'number' && !isNaN(result) ? result : 0;
      } catch { 
        return 0; 
      }
    }
    const num = Number(rawValue);
    return isNaN(num) ? 0 : num;
  }, []);

  // Resolve a merge cell's value — handles the case where the merge's own
  // stored value is itself a formula containing ROW_ or MERGE_ references.
  const resolveMergeValue = useCallback((merge: MergedCell): number => {
    const raw = merge.merged_value || '';
    if (!raw) return 0;

    // Plain number — fast path
    if (!raw.startsWith('=')) {
      const num = parseFloat(raw);
      return isNaN(num) ? 0 : num;
    }

    let expr = raw.substring(1);

    // Resolve any nested MERGE_ references inside this merge's formula
    for (const m of merges) {
      const placeholder = `MERGE_${m.id}`;
      if (expr.includes(placeholder) && m.id !== merge.id) {
        const nestedVal = resolveMergeValue(m);
        expr = expr.split(placeholder).join(String(nestedVal));
      }
    }

    // Resolve ROW_ references
    if (state) {
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
    }

    // Clean and evaluate
    const clean = expr.replace(/[^0-9+\-*/().]/g, '').replace(/[+\-*/]+$/, '');
    if (!clean) return 0;
    try {
      const result = Function('"use strict"; return (' + clean + ')')();
      return typeof result === 'number' && !isNaN(result) ? result : 0;
    } catch {
      return 0;
    }
  }, [merges, state]);

  // Handle legacy format: "TableName (Year)!FieldName_UUID"
  const resolveLegacyReference = useCallback((match: string, tablePart: string, fieldName: string, rowId: string): string => {
    
    if (!state) return '0';
    
    const yearMatch = tablePart.match(/\((\d+)\)/);
    const year = yearMatch ? parseInt(yearMatch[1]) : null;
    const cleanTableName = tablePart.replace(/\s*\(\d+\)/, '').trim();
    
    for (const yearData of state.years) {
      if (year && yearData.year !== year) continue;
      const tabs = state.tabsByYear[yearData.id] || [];
      for (const tab of tabs) {
        for (const table of tab.tables) {
          if (table.name !== cleanTableName) continue;
          const rows = state.rowsByTable[table.id] || [];
          const row = rows.find((r: any) => r.id === rowId);
          if (!row) continue;
          const field = table.fields.find((f: any) => f.name === fieldName);
          if (!field) continue;
          const merge = merges.find(m =>
            m.table_id === table.id &&
            m.start_row_id === rowId &&
            m.start_col_id === field.id
          );
          if (merge) {
            return String(resolveMergeValue(merge));
          }
          const val = parseFloat(row[field.id]);
          return isNaN(val) ? '0' : String(val);
        }
      }
    }
    return '0';
  }, [state, merges, resolveMergeValue]);

  const evaluateFormulaForRow = useCallback((
    formulaText: string,
    currentRow: any,
    tableId: string
  ): number => {
    setEvaluating(true);
    try {
      let formula = formulaText.startsWith('=') ? formulaText.substring(1) : formulaText;

      // Handle legacy "TableName (2024)!FieldName_rowId" references FIRST
      // Regex: non-greedy match for table and field names so spaces are supported
      // (e.g. "test (2024)!Estimated Pay_<uuid>")
      // Negative lookahead (?!-[a-f0-9]) stops UUID from greedily consuming
      // arithmetic suffixes like "-10" after the UUID.
      formula = formula.replace(
        /([^!]*?)!(.+?)_([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})(?!-[a-f0-9])/g,
        (match, tablePart, fieldName, rowId) => {
          return resolveLegacyReference(match, tablePart.trim(), fieldName.trim(), rowId);
        }
      );

      // Resolve MERGE_<uuid> references — use exact UUID pattern so arithmetic
      // suffixes like "-10" in "MERGE_<uuid>-10" are NOT consumed as part of the ID.
      for (const merge of merges) {
        const placeholder = `MERGE_${merge.id}`;
        if (formula.includes(placeholder)) {
          const resolvedVal = resolveMergeValue(merge);
          formula = formula.split(placeholder).join(String(resolvedVal));
        }
      }

      // Then resolve ROW_<rowId>_<fieldId> references
      if (state) {
        formula = formula.replace(
          /ROW_([a-f0-9-]+)_([a-f0-9-]+)/g,
          (match, rowId, fieldId) => {
            for (const year of state.years) {
              const tabs = state.tabsByYear[year.id] || [];
              for (const tab of tabs) {
                for (const table of tab.tables) {
                  const rows = state.rowsByTable[table.id] || [];
                  const row = rows.find((r: any) => r.id === rowId);
                  if (!row) continue;

                  const field = table.fields.find((f: any) => f.id === fieldId);
                  if (!field) continue;

                  const merge = merges.find(m =>
                    m.table_id === table.id &&
                    m.start_row_id === rowId &&
                    m.start_col_id === fieldId
                  );
                  if (merge) {
                    return String(resolveMergeValue(merge));
                  }

                  const val = parseFloat(row[fieldId]);
                  return isNaN(val) ? '0' : String(val);
                }
              }
            }
            return '0';
          }
        );
      }

      // Clean up any remaining special characters
      formula = formula.replace(/[^0-9+\-*/().]/g, '');
      
      // Remove trailing operators
      formula = formula.replace(/[+\-*/]+$/, '');
      
      if (!formula || formula === '') {
        return 0;
      }

      const result = Function('"use strict"; return (' + formula + ')')();
      return typeof result === 'number' && !isNaN(result) ? result : 0;
    } catch (error) {
      return 0;
    } finally {
      setEvaluating(false);
    }
  }, [merges, resolveValue, resolveMergeValue, resolveLegacyReference, state]);

  return { evaluateFormulaForRow, evaluating };
}