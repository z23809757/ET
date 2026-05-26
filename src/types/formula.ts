export interface CellReference {
  tableId: string;
  tableName: string;
  fieldId: string;
  fieldName: string;
  rowId: string;
  rowLabel?: string;
  rowNumber?: number;
  fieldType?: string;
  year?: number;
  isRange: boolean;
  rangeStart?: number;
  rangeEnd?: number;
}

export interface FormulaValidationResult {
  isValid?: boolean;
  valid?: boolean;
  error?: string;
  dependencies?: string[];
}

export interface Formula {
  id: string;
  tableId: string;
  fieldId: string;
  rowId?: string;
  displayFormula?: string;  // What user sees: "=test (2024)!Estimated Pay_cf18..."
  internalFormula?: string; // What engine uses: "=CELL_cf18c297"
  formulaText?: string;
  dependsOn: string[];     // Array of internal cell IDs
  calculatedValue?: unknown;
  lastCalculated?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormulaMapping {
  displayFormula: string;
  internalFormula: string;
  cellIds: string[];  // Array of internal cell IDs this formula depends on
}