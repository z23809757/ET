import { useMemo } from 'react';
import { useFinanceStore } from './useFinanceStore';
import { CellReference } from '../types/formula';

export function useCellReferences() {
  const { state } = useFinanceStore();
  
  const availableReferences = useMemo(() => {
    const references: CellReference[] = [];
    
    for (const year of state.years) {
      const tabs = state.tabsByYear[year.id] || [];
      
      for (const tab of tabs) {
        for (const table of tab.tables) {
          const rows = state.rowsByTable[table.id] || [];
          
          for (const field of table.fields) {
            // Include all fields including Formula fields
            for (let i = 0; i < rows.length; i++) {
              const row = rows[i];
              const monthField = table.fields.find((f: any) => f.type === 'Month' || f.type === 'Date');
              let rowLabel = '';
              
              if (monthField && row[monthField.id]) {
                const monthValue = row[monthField.id];
                if (monthValue && monthValue.length >= 7) {
                  const [yr, month] = monthValue.split('-');
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  rowLabel = `${monthNames[parseInt(month) - 1]} ${yr}`;
                } else {
                  rowLabel = monthValue;
                }
              } else {
                rowLabel = `Row ${i + 1}`;
              }
              
              references.push({
                tableId: table.id,
                tableName: `${table.name} (${year.year})`,
                fieldId: field.id,
                fieldName: field.name,
                rowId: row.id,
                rowLabel,
                rowNumber: i + 1,
                isRange: false,
                year: year.year
              });
            }
          }
        }
      }
    }
    
    return references;
  }, [state.years, state.tabsByYear, state.rowsByTable]);
  
  const getReferenceString = (ref: CellReference): string => {
    if (ref.rowId) {
      return `${ref.tableName}!${ref.fieldName}_${ref.rowId}`;
    }
    if (ref.isRange && ref.rangeStart && ref.rangeEnd) {
      return `${ref.tableName}!${ref.fieldName}_${ref.rangeStart}_${ref.rangeEnd}`;
    }
    return `${ref.tableName}!${ref.fieldName}`;
  };
  
  return {
    availableReferences,
    getReferenceString
  };
}