import { supabase } from '../lib/supabase';

export interface MergedCell {
  id: string;
  table_id: string;
  start_row_id: string;
  end_row_id: string;
  start_col_id: string;
  end_col_id: string;
  merged_value: string;
  created_at: string;
}

export const mergeService = {
  // Save a merged cell range
  async saveMerge(
    tableId: string,
    startRowId: string,
    endRowId: string,
    startColId: string,
    endColId: string,
    mergedValue: string
  ): Promise<void> {
    const { error } = await supabase
      .from('merged_cells')
      .upsert({
        table_id: tableId,
        start_row_id: startRowId,
        end_row_id: endRowId,
        start_col_id: startColId,
        end_col_id: endColId,
        merged_value: mergedValue,
      }, {
        onConflict: 'table_id,start_row_id,start_col_id'
      });
    
    if (error) {
      console.error('Error saving merge:', error);
      throw error;
    }
  },

  // Get all merged cells for a table
  async getMergesForTable(tableId: string): Promise<MergedCell[]> {
    const { data, error } = await supabase
      .from('merged_cells')
      .select('*')
      .eq('table_id', tableId);
    
    if (error) {
      console.error('Error fetching merges:', error);
      return [];
    }
    
    return data || [];
  },

  // Delete a merged cell
  async deleteMerge(mergeId: string): Promise<void> {
    const { error } = await supabase
      .from('merged_cells')
      .delete()
      .eq('id', mergeId);
    
    if (error) {
      console.error('Error deleting merge:', error);
      throw error;
    }
  },

  // Delete all merges for a table
  async deleteAllMergesForTable(tableId: string): Promise<void> {
    const { error } = await supabase
      .from('merged_cells')
      .delete()
      .eq('table_id', tableId);
    
    if (error) {
      console.error('Error deleting merges:', error);
      throw error;
    }
  },

  // Update merged value for a specific merge by ID
  async updateMergedValue(mergeId: string, newValue: string): Promise<void> {
    const { error } = await supabase
      .from('merged_cells')
      .update({ merged_value: newValue })
      .eq('id', mergeId);
    
    if (error) {
      console.error('Error updating merged value:', error);
      throw error;
    }
  },

  // Update merged value by cell coordinates (master cell)
  async updateMergedValueByCell(tableId: string, rowId: string, colId: string, newValue: string): Promise<void> {
    const { data, error: fetchError } = await supabase
      .from('merged_cells')
      .select('id')
      .eq('table_id', tableId)
      .eq('start_row_id', rowId)
      .eq('start_col_id', colId)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // No merge found - this isn't a merged cell
        return;
      }
      console.error('Error finding merge:', fetchError);
      throw fetchError;
    }
    
    if (data) {
      await this.updateMergedValue(data.id, newValue);
    }
  }
};