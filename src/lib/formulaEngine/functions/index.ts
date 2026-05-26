export const formulaFunctions = {
  sum: (values: number[]) => values.reduce((a, b) => a + b, 0),
  average: (values: number[]) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0,
  count: (values: any[]) => values.filter(v => v != null).length,
  max: (values: number[]) => values.length ? Math.max(...values) : 0,
  min: (values: number[]) => values.length ? Math.min(...values) : 0,
  multiply: (values: number[]) => values.reduce((a, b) => a * b, 1),
  divide: (a: number, b: number) => b !== 0 ? a / b : 0
};

export const evaluateFunction = (functionName: string, args: any[]): any => {
  const name = functionName.toLowerCase() as keyof typeof formulaFunctions;
  const func = formulaFunctions[name];
  if (func) {
    return name === 'divide' ? formulaFunctions.divide(args[0], args[1]) : (func as (values: any[]) => any)(args);
  }
  throw new Error(`Unknown function: ${functionName}`);
};