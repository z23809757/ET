export interface CellReference {
  tableId: string;
  tableName: string;
  fieldId: string;
  fieldName: string;
  rowId?: string;
  rowLabel?: string;
  rowNumber?: number;
  isRange: boolean;
  rangeStart?: number;
  rangeEnd?: number;
}

export interface Formula {
  id: string;
  tableId: string;
  fieldId: string;
  formulaText: string;
  dependsOn: CellReference[];
  calculatedValue: any;
  lastCalculated: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormulaExpression {
  type: 'reference' | 'function' | 'operator' | 'number' | 'parenthesis';
  value: any;
  children?: FormulaExpression[];
}

export interface FunctionDefinition {
  name: string;
  syntax: string;
  description: string;
  evaluate: (args: any[], context: any) => any;
}

export interface FormulaValidationResult {
  valid: boolean;
  error?: string;
  dependencies?: CellReference[];
}