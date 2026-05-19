import { supabase } from '../lib/supabase';
import { Formula, CellReference } from '../types/formula';
import { FormulaParser } from '../lib/formulaEngine';

export const formulaService = {
  async saveFormula(
    tableId: string,
    fieldId: string,
    formulaText: string
  ): Promise<Formula> {
    // Validate formula first
    const validation = FormulaParser.validate(formulaText);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    const { data, error } = await supabase
      .from('formulas')
      .upsert({
        table_id: tableId,
        field_id: fieldId,
        formula_text: formulaText,
        depends_on: validation.dependencies || [],
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      tableId: data.table_id,
      fieldId: data.field_id,
      formulaText: data.formula_text,
      dependsOn: data.depends_on,
      calculatedValue: null,
      lastCalculated: data.updated_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },
  
  async fetchFormulas(tableId: string): Promise<Formula[]> {
    const { data, error } = await supabase
      .from('formulas')
      .select('*')
      .eq('table_id', tableId);
    
    if (error) throw error;
    
    return (data || []).map(f => ({
      id: f.id,
      tableId: f.table_id,
      fieldId: f.field_id,
      formulaText: f.formula_text,
      dependsOn: f.depends_on,
      calculatedValue: null,
      lastCalculated: f.updated_at,
      createdAt: f.created_at,
      updatedAt: f.updated_at
    }));
  },
  
  async deleteFormula(formulaId: string): Promise<void> {
    const { error } = await supabase
      .from('formulas')
      .delete()
      .eq('id', formulaId);
    
    if (error) throw error;
  },
  
  async evaluateFormula(formulaId: string, context: any): Promise<any> {
    const { data, error } = await supabase
      .rpc('evaluate_formula', {
        p_formula_id: formulaId,
        p_context: context
      });
    
    if (error) throw error;
    return data;
  },
  
  async getFormulaDependencies(formulaId: string): Promise<CellReference[]> {
    const { data, error } = await supabase
      .from('formulas')
      .select('depends_on')
      .eq('id', formulaId)
      .single();
    
    if (error) throw error;
    return data?.depends_on || [];
  }
};