import type { CellReference, FormulaValidationResult } from '../../types/formula';
import type { ParsedFormula, EvaluationContext } from './FormulaTypes';

const parseCellReference = (referenceString: string): CellReference | null => {
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
};

export class FormulaParser {
  static parse(formula: string, getReferenceValue?: (ref: CellReference) => any): ParsedFormula {
    const dependencies: CellReference[] = [];
    const expression = formula.startsWith('=') ? formula.substring(1) : formula;
    
    // Find all cell references
    const referencePattern = /([A-Za-z][A-Za-z0-9]*![A-Za-z][A-Za-z0-9]*_[a-zA-Z0-9]+)/g;
    let match;
    
    while ((match = referencePattern.exec(expression)) !== null) {
      const ref = parseCellReference(match[1]);
      if (ref) {
        dependencies.push(ref);
      }
    }
    
    return {
      expression,
      dependencies,
      isValid: true
    };
  }
  
  static async evaluate(
    formula: string,
    context: EvaluationContext
  ): Promise<{ value: any; error?: string }> {
    try {
      let expression = formula.startsWith('=') ? formula.substring(1) : formula;
      
      // Replace references with their values
      const referencePattern = /([A-Za-z][A-Za-z0-9]*![A-Za-z][A-Za-z0-9]*_[a-zA-Z0-9]+)/g;
      let match;
      
      while ((match = referencePattern.exec(expression)) !== null) {
          const ref = parseCellReference(match[1]);
        if (ref) {
          const value = await context.getCellValue(ref);
          expression = expression.replace(match[1], String(value || 0));
        }
      }
      
      // Evaluate the expression
      const result = Function('return ' + expression)();
      return { value: result };
    } catch (error: any) {
      return { value: null, error: error.message };
    }
  }
  
  static validate(formula: string): FormulaValidationResult {
    if (!formula.startsWith('=')) {
      return { valid: false, error: 'Formula must start with =' };
    }
    return { valid: true };
  }
}