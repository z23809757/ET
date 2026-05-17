import { supabase } from '../lib/supabase';
import { AuditLog } from '../types/finance';

export const auditService = {
  async getRowHistory(rowId: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('record_id', rowId)
      .eq('table_name', 'rows')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async restoreRowVersion(rowId: string, version: number): Promise<boolean> {
    const { data, error } = await supabase.rpc('restore_row_version', {
      p_record_id: rowId,
      p_version: version,
    });
    
    if (error) throw error;
    return data;
  },

  async getTableAuditLogs(tableId: string, limit: number = 100): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('table_name', 'rows')
      .filter('record_id', 'in', `(select id from rows where table_id = '${tableId}')`)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  async getUserActivity(userId: string, limit: number = 50): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },
};