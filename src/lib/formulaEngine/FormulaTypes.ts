import { CellReference } from '../../types/formula';

export interface ParsedFormula {
  expression: string;
  dependencies: CellReference[];
  isValid: boolean;
  error?: string;
}

export interface EvaluationContext {
  getCellValue: (reference: CellReference) => any;
  getRangeValues: (reference: CellReference) => any[];
}

export interface FormulaFunction {
  name: string;
  minArgs: number;
  maxArgs: number;
  description?: string;
  evaluate: (args: any[], context: EvaluationContext) => any;
}

export const FORMULA_FUNCTIONS: FormulaFunction[] = [
  {
    name: 'SUM',
    minArgs: 1,
    maxArgs: Infinity,
    evaluate: (args) => {
      const flatArgs = args.flat();
      return flatArgs.reduce((sum, val) => sum + (Number(val) || 0), 0);
    }
  },
  {
    name: 'AVG',
    minArgs: 1,
    maxArgs: Infinity,
    evaluate: (args) => {
      const flatArgs = args.flat().filter(v => !isNaN(Number(v)));
      if (flatArgs.length === 0) return 0;
      const sum = flatArgs.reduce((s, v) => s + Number(v), 0);
      return sum / flatArgs.length;
    }
  },
  {
    name: 'COUNT',
    minArgs: 1,
    maxArgs: Infinity,
    evaluate: (args) => {
      const flatArgs = args.flat();
      return flatArgs.filter(v => v !== null && v !== undefined && v !== '').length;
    }
  },
  {
    name: 'MAX',
    minArgs: 1,
    maxArgs: Infinity,
    evaluate: (args) => {
      const flatArgs = args.flat().filter(v => !isNaN(Number(v)));
      if (flatArgs.length === 0) return 0;
      return Math.max(...flatArgs.map(v => Number(v)));
    }
  },
  {
    name: 'MIN',
    minArgs: 1,
    maxArgs: Infinity,
    evaluate: (args) => {
      const flatArgs = args.flat().filter(v => !isNaN(Number(v)));
      if (flatArgs.length === 0) return 0;
      return Math.min(...flatArgs.map(v => Number(v)));
    }
  }
];