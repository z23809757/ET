export interface CellReference {
  tableId: string;
  tableName: string;
  fieldId: string;
  fieldName: string;
  rowId: string;
  rowLabel?: string;
<<<<<<< HEAD
  year: number;
=======
  rowNumber?: number;
  year?: number;
>>>>>>> eead2da (Small Changes)
  isRange: boolean;
  rangeStart?: number;
  rangeEnd?: number;
}

<<<<<<< HEAD
=======
export interface FormulaValidationResult {
  isValid?: boolean;
  valid?: boolean;
  error?: string;
  dependencies?: string[];
}

>>>>>>> eead2da (Small Changes)
export interface Formula {
  id: string;
  tableId: string;
  fieldId: string;
<<<<<<< HEAD
  rowId: string;
  displayFormula: string;  // What user sees: "=test (2024)!Estimated Pay_cf18..."
  internalFormula: string; // What engine uses: "=CELL_cf18c297"
  dependsOn: string[];     // Array of internal cell IDs
=======
  rowId?: string;
  displayFormula?: string;  // What user sees: "=test (2024)!Estimated Pay_cf18..."
  internalFormula?: string; // What engine uses: "=CELL_cf18c297"
  formulaText?: string;
  dependsOn: string[];     // Array of internal cell IDs
  calculatedValue?: unknown;
  lastCalculated?: string | null;
>>>>>>> eead2da (Small Changes)
  createdAt: string;
  updatedAt: string;
}

export interface FormulaMapping {
  displayFormula: string;
  internalFormula: string;
  cellIds: string[];  // Array of internal cell IDs this formula depends on
<<<<<<< HEAD
}
=======
}
>>>>>>> eead2da (Small Changes)
