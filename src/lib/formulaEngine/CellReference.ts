import { CellReference } from '../../types/formula';

export class CellReferenceParser {
  static parse(referenceString: string): CellReference | null {
    const match = referenceString.match(/^([^!]+)!([^_]+)_(.+)$/);
    if (!match) return null;
    
    const [, tableName, fieldName, rowId] = match;
    
    return {
      tableId: '',
      tableName,
      fieldId: '',
      fieldName,
      rowId,
      isRange: false
    };
  }
  
  static stringify(reference: CellReference): string {
    if (reference.rowId) {
      return `${reference.tableName}!${reference.fieldName}_${reference.rowId}`;
    }
    return `${reference.tableName}!${reference.fieldName}`;
  }
}