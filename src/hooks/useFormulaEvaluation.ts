import { useState, useCallback } from 'react';
import { useFinanceStore } from './useFinanceStore';

export function useFormulaEvaluation() {
  const { state } = useFinanceStore();
  const [evaluating, setEvaluating] = useState(false);
  
  const getCellValue = useCallback((tableName: string, year: number, fieldName: string, rowId: string): number => {
    const targetYear = state.years.find(y => y.year === year);
    if (!targetYear) return 0;
    
    const tabs = state.tabsByYear[targetYear.id] || [];
    for (const tab of tabs) {
      for (const refTable of tab.tables) {
        if (refTable.name === tableName) {
          const refField = refTable.fields.find((f: any) => f.name === fieldName);
          if (refField) {
            const refRows = state.rowsByTable[refTable.id] || [];
            const refRow = refRows.find((r: any) => r.id === rowId);
            if (refRow && refRow[refField.id] !== undefined) {
              let value = refRow[refField.id];
              if (typeof value === 'string') {
                value = parseFloat(value) || 0;
              }
              return typeof value === 'number' && !isNaN(value) ? value : 0;
            }
          }
          break;
        }
      }
    }
    return 0;
  }, [state]);
  
  const evaluateFormulaForRow = useCallback(async (
    formulaText: string,
    currentRow: any,
    tableId: string
  ): Promise<number> => {
    setEvaluating(true);
    
    try {
      let formula = formulaText.startsWith('=') ? formulaText.substring(1) : formulaText;
      
      const referencePattern = /([A-Za-z\s]+)\((\d+)\)!([A-Za-z\s]+)_([a-f0-9-]{36})/g;
      const matches = [];
      let match;
      
      while ((match = referencePattern.exec(formula)) !== null) {
        matches.push({
          fullMatch: match[0],
          tableName: match[1].trim(),
          year: parseInt(match[2]),
          fieldName: match[3].trim(),
          rowId: match[4]
        });
      }
      
      let evaluableFormula = formula;
      
      for (let i = matches.length - 1; i >= 0; i--) {
        const ref = matches[i];
        const value = getCellValue(ref.tableName, ref.year, ref.fieldName, ref.rowId);
        evaluableFormula = evaluableFormula.replace(ref.fullMatch, String(value));
      }
      
      const cleanExpr = evaluableFormula.replace(/[^\d+\-*/()]/g, '');
      
      if (cleanExpr && cleanExpr !== '') {
        const result = new Function('return (' + cleanExpr + ')')();
        setEvaluating(false);
        return typeof result === 'number' && !isNaN(result) ? result : 0;
      }
      
      setEvaluating(false);
      return 0;
    } catch (error) {
      console.error('Formula evaluation error:', error);
      setEvaluating(false);
      return 0;
    }
  }, [getCellValue]);
  
  const clearCache = useCallback(() => {}, []);
  
  return {
    evaluateFormulaForRow,
    evaluating,
    clearCache
  };
}