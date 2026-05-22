import { supabase } from '../lib/supabase';
import { Formula } from '../types/formula';
import { normalizeFormula, denormalizeFormula, getCellInternalId } from '../lib/formulaNormalizer';

export const formulaStorageService = {
  async saveFormula(
    tableId: string,
    rowId: string,
    fieldId: string,
    displayFormula: string,
    getReferenceInfo: any,
    getReferenceDisplay: any
  ): Promise<void> {
    // Normalize the formula to internal representation
    const { internalFormula, dependsOn } = normalizeFormula(displayFormula, getReferenceInfo);
    
    const { error } = await supabase
      .from('row_formulas')
      .upsert({
        table_id: tableId,
        row_id: rowId,
        field_id: fieldId,
        formula_display: displayFormula,
        formula_internal: internalFormula,
        depends_on: dependsOn,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'table_id,row_id,field_id'
      });
    
    if (error) {
      console.error('Error saving formula:', error);
      throw error;
    }
  },

  async getFormulasForTable(tableId: string): Promise<Record<string, Record<string, { display: string; internal: string }>>> {
    const { data, error } = await supabase
      .from('row_formulas')
      .select('row_id, field_id, formula_display, formula_internal')
      .eq('table_id', tableId);
    
    if (error) {
      console.error('Error fetching formulas:', error);
      return {};
    }
    
    const result: Record<string, Record<string, { display: string; internal: string }>> = {};
    for (const item of data || []) {
      if (!result[item.row_id]) {
        result[item.row_id] = {};
      }
      result[item.row_id][item.field_id] = {
        display: item.formula_display,
        internal: item.formula_internal
      };
    }
    
    return result;
  },

  async updateFormulaDisplay(formulaId: string, newDisplayFormula: string): Promise<void> {
    // When table/field names change, we only need to update the display formula
    // The internal formula remains the same since it uses IDs
    const { error } = await supabase
      .from('row_formulas')
      .update({ formula_display: newDisplayFormula })
      .eq('id', formulaId);
    
    if (error) throw error;
  }
};