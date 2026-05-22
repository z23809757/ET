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
<<<<<<< HEAD
=======
  description?: string;
>>>>>>> eead2da (Small Changes)
  minArgs: number;
  maxArgs: number;
  evaluate: (args: any[], context: EvaluationContext) => any;
}

export const FORMULA_FUNCTIONS: FormulaFunction[] = [
  {
    name: 'SUM',
<<<<<<< HEAD
=======
    description: 'Adds numbers together',
>>>>>>> eead2da (Small Changes)
    minArgs: 1,
    maxArgs: Infinity,
    evaluate: (args) => {
      const flatArgs = args.flat();
      return flatArgs.reduce((sum, val) => sum + (Number(val) || 0), 0);
    }
  },
  {
    name: 'AVG',
<<<<<<< HEAD
=======
    description: 'Returns the average value',
>>>>>>> eead2da (Small Changes)
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
<<<<<<< HEAD
=======
    description: 'Counts non-empty values',
>>>>>>> eead2da (Small Changes)
    minArgs: 1,
    maxArgs: Infinity,
    evaluate: (args) => {
      const flatArgs = args.flat();
      return flatArgs.filter(v => v !== null && v !== undefined && v !== '').length;
    }
  },
  {
    name: 'MAX',
<<<<<<< HEAD
=======
    description: 'Returns the largest value',
>>>>>>> eead2da (Small Changes)
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
<<<<<<< HEAD
=======
    description: 'Returns the smallest value',
>>>>>>> eead2da (Small Changes)
    minArgs: 1,
    maxArgs: Infinity,
    evaluate: (args) => {
      const flatArgs = args.flat().filter(v => !isNaN(Number(v)));
      if (flatArgs.length === 0) return 0;
      return Math.min(...flatArgs.map(v => Number(v)));
    }
  }
<<<<<<< HEAD
];
=======
];
>>>>>>> eead2da (Small Changes)
