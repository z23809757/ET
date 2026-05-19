import { supabase } from '../lib/supabase';

export interface RowFormula {
  id: string;
  table_id: string;
  row_id: string;
  field_id: string;
  formula: string;
  created_at: string;
  updated_at: string;
}

export const formulaStorageService = {
  async saveFormula(tableId: string, rowId: string, fieldId: string, formula: string): Promise<void> {
    const { error } = await supabase
      .from('row_formulas')
      .upsert({
        table_id: tableId,
        row_id: rowId,
        field_id: fieldId,
        formula: formula,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'table_id,row_id,field_id'
      });
    
    if (error) {
      console.error('Error saving formula:', error);
      throw error;
    }
  },
  
  async getFormulasForTable(tableId: string): Promise<Record<string, Record<string, string>>> {
    const { data, error } = await supabase
      .from('row_formulas')
      .select('*')
      .eq('table_id', tableId);
    
    if (error) {
      console.error('Error fetching formulas:', error);
      return {};
    }
    
    const result: Record<string, Record<string, string>> = {};
    for (const item of data || []) {
      if (!result[item.row_id]) {
        result[item.row_id] = {};
      }
      result[item.row_id][item.field_id] = item.formula;
    }
    
    return result;
  },
  
  async deleteFormula(tableId: string, rowId: string, fieldId: string): Promise<void> {
    const { error } = await supabase
      .from('row_formulas')
      .delete()
      .eq('table_id', tableId)
      .eq('row_id', rowId)
      .eq('field_id', fieldId);
    
    if (error) {
      console.error('Error deleting formula:', error);
      throw error;
    }
  },
  
  async deleteAllFormulasForTable(tableId: string): Promise<void> {
    const { error } = await supabase
      .from('row_formulas')
      .delete()
      .eq('table_id', tableId);
    
    if (error) {
      console.error('Error deleting table formulas:', error);
      throw error;
    }
  }
};