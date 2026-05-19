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
  }
};