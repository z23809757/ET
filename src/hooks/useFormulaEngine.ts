import { useState, useCallback } from 'react';
import { useFinanceStore } from './useFinanceStore';
import { FormulaParser } from '../lib/formulaEngine';
import { CellReference } from '../types/formula';

export function useFormulaEvaluation() {
  const { state } = useFinanceStore();
  const [evaluating, setEvaluating] = useState(false);
  
  const getCellValue = useCallback((reference: CellReference): any => {
    // Parse the reference to find the actual value
    // Format: "TableName (Year)!FieldName_RowId"
    const match = reference.tableName.match(/^(.+)\s\((\d+)\)$/);
    if (!match) return null;
    
    const [, tableName, year] = match;
    const targetYear = state.years.find(y => y.year === parseInt(year));
    if (!targetYear) return null;
    
    const tabs = state.tabsByYear[targetYear.id] || [];
    let targetTable: any = null;
    
    for (const tab of tabs) {
      for (const table of tab.tables) {
        if (table.name === tableName) {
          targetTable = table;
          break;
        }
      }
      if (targetTable) break;
    }
    
    if (!targetTable) return null;
    
    const targetField = targetTable.fields.find((f: any) => f.name === reference.fieldName);
    if (!targetField) return null;
    
    const rows = state.rowsByTable[targetTable.id] || [];
    const targetRow = rows.find((r: any) => r.id === reference.rowId);
    
    if (!targetRow) return null;
    
    return targetRow[targetField.id];
  }, [state]);
  
  const getRangeValues = useCallback((reference: CellReference): any[] => {
    const match = reference.tableName.match(/^(.+)\s\((\d+)\)$/);
    if (!match) return [];
    
    const [, tableName, year] = match;
    const targetYear = state.years.find(y => y.year === parseInt(year));
    if (!targetYear) return [];
    
    const tabs = state.tabsByYear[targetYear.id] || [];
    let targetTable: any = null;
    
    for (const tab of tabs) {
      for (const table of tab.tables) {
        if (table.name === tableName) {
          targetTable = table;
          break;
        }
      }
      if (targetTable) break;
    }
    
    if (!targetTable) return [];
    
    const targetField = targetTable.fields.find((f: any) => f.name === reference.fieldName);
    if (!targetField) return [];
    
    const rows = state.rowsByTable[targetTable.id] || [];
    
    if (reference.isRange && reference.rangeStart && reference.rangeEnd) {
      const start = Math.max(0, reference.rangeStart - 1);
      const end = Math.min(rows.length, reference.rangeEnd);
      return rows.slice(start, end).map((row: any) => row[targetField.id]);
    }
    
    return rows.map((row: any) => row[targetField.id]);
  }, [state]);
  
  const evaluateFormulaForRow = useCallback(async (
    formulaText: string,
    currentRow: any,
    tableId: string
  ): Promise<any> => {
    setEvaluating(true);
    try {
      const context = {
        getCellValue,
        getRangeValues,
        getCurrentRowValue: (fieldName: string) => {
          // Find the table
          const yearId = state.activeYearId;
          if (!yearId) return null;
          
          const tabs = state.tabsByYear[yearId] || [];
          let targetTable: any = null;
          
          for (const tab of tabs) {
            for (const table of tab.tables) {
              if (table.id === tableId) {
                targetTable = table;
                break;
              }
            }
            if (targetTable) break;
          }
          
          if (!targetTable) return null;
          
          const field = targetTable.fields.find((f: any) => f.name === fieldName);
          if (!field) return null;
          
          return currentRow[field.id];
        }
      };
      
      const result = await FormulaParser.evaluate(formulaText, context);
      setEvaluating(false);
      return result.value;
    } catch (error) {
      console.error('Formula evaluation error:', error);
      setEvaluating(false);
      return null;
    }
  }, [getCellValue, getRangeValues, state]);
  
  return {
    evaluateFormulaForRow,
    evaluating
  };
}