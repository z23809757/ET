import { supabase } from '../lib/supabase';
import { Tab, Table, Field, Row, UserSettings } from '../types/finance';

export const financeService = {
  async fetchYears(): Promise<{ id: string; year: number }[]> {
    const { data, error } = await supabase
      .from('years')
      .select('id, year')
      .order('year', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createYear(year: number): Promise<{ id: string; year: number }> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('years')
      .insert({ user_id: userData.user.id, year })
      .select('id, year')
      .single();
    if (error) throw error;
    return data;
  },

  async copyYearStructure(sourceYearId: string, targetYearId: string): Promise<void> {
    const { error } = await supabase.rpc('copy_year_structure', {
      p_source_year_id: sourceYearId,
      p_target_year_id: targetYearId,
    });
    if (error) throw error;
  },

  async fetchSettings(): Promise<UserSettings | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;
    
    const { data, error } = await supabase
      .from('settings')
      .select('exchange_rate, display_currency')
      .eq('user_id', userData.user.id)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      exchangeRate: data.exchange_rate,
      displayCurrency: data.display_currency as 'USD' | 'INR',
    };
  },

  async saveSettings(settings: UserSettings): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('settings')
      .upsert({
        user_id: userData.user.id,
        exchange_rate: settings.exchangeRate,
        display_currency: settings.displayCurrency,
        updated_at: new Date().toISOString(),
      });
    if (error) throw error;
  },

  async fetchFullYearData(yearId: string): Promise<Tab[]> {
    const { data, error } = await supabase
      .from('tabs')
      .select(`
        *,
        tables: tables (
          *,
          fields: fields (*)
        )
      `)
      .eq('year_id', yearId)
      .order('position', { ascending: true });

    if (error) throw error;
    
    return (data || []).map(tab => ({
      id: tab.id,
      name: tab.name,
      icon: tab.icon,
      tables: (tab.tables || [])
        .filter((table: any) => !table.is_global) // Don't include global tables here
        .map((table: any) => ({
          id: table.id,
          name: table.name,
          type: table.type,
          is_reference: table.is_reference || false,
          is_global: table.is_global || false,
          fields: (table.fields || []).map((field: any) => ({
            id: field.id,
            name: field.name,
            type: field.field_type,
            currency: field.currency,
            isPrimary: field.is_primary,
            dropdownOptions: field.dropdown_options_json,
          })),
        })),
    }));
  },

async fetchGlobalTables(): Promise<Table[]> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('tables')
    .select(`
      *,
      fields: fields (*)
    `)
    .eq('is_global', true)
    .is('tab_id', null);
  
  if (error) {
    console.error('Error fetching global tables:', error);
    return [];
  }
  
  return (data || []).map((table: any) => ({
    id: table.id,
    name: table.name,
    type: table.type,
    is_reference: true,
    is_global: true,
    tab_id: null,
    fields: (table.fields || []).map((field: any) => ({
      id: field.id,
      name: field.name,
      type: field.field_type,
      currency: field.currency,
      isPrimary: field.is_primary,
      dropdownOptions: field.dropdown_options_json,
    })),
  }));
},

  async createTab(yearId: string, name: string, icon: string): Promise<Tab> {
    const { data, error } = await supabase
      .from('tabs')
      .insert({ year_id: yearId, name, icon })
      .select()
      .single();
    if (error) throw error;
    return { ...data, tables: [] };
  },

  async deleteTab(tabId: string): Promise<void> {
    const { error } = await supabase.from('tabs').delete().eq('id', tabId);
    if (error) throw error;
  },

  async createTable(tabId: string, name: string, type: string, isReference: boolean = false): Promise<Table> {
    const { data, error } = await supabase
      .from('tables')
      .insert({ tab_id: tabId, name, type, is_reference: isReference, is_global: false })
      .select()
      .single();
    if (error) throw error;
    return { ...data, fields: [] };
  },

async createGlobalTable(name: string, fields: Field[], type: string = 'None', includeInOverall: boolean = false): Promise<Table> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('tables')
    .insert({ 
      name, 
      type: includeInOverall ? type : 'None',
      is_reference: true, 
      is_global: true,
      include_in_overall: includeInOverall,
      user_id: userData.user.id,
      tab_id: null
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating global table:', error);
    throw error;
  }
  
  if (fields.length > 0) {
    await this.saveFields(data.id, fields);
  }
  
  return { ...data, fields };
},

  async updateTable(tableId: string, updates: Partial<Table>): Promise<void> {
    const { error } = await supabase.from('tables').update(updates).eq('id', tableId);
    if (error) throw error;
  },

  async deleteTable(tableId: string): Promise<void> {
    await supabase.from('row_formulas').delete().eq('table_id', tableId);
    const { error } = await supabase.from('tables').delete().eq('id', tableId);
    if (error) throw error;
  },

  async fetchFields(tableId: string): Promise<Field[]> {
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .eq('table_id', tableId)
      .order('position', { ascending: true });
    if (error) throw error;
    
    return (data || []).map(f => ({
      id: f.id,
      name: f.name,
      type: f.field_type as any,
      currency: f.currency as any,
      isPrimary: f.is_primary,
      dropdownOptions: f.dropdown_options_json,
    }));
  },

  async saveFields(tableId: string, newFields: Field[]): Promise<void> {
    const existingFields = await this.fetchFields(tableId);
    
    const existingMap = new Map(existingFields.map(f => [f.id, f]));
    const newMap = new Map(newFields.map(f => [f.id, f]));
    
    const toDelete = existingFields.filter(f => !newMap.has(f.id));
    const toUpdate = newFields.filter(f => {
      const existing = existingMap.get(f.id);
      return existing && JSON.stringify(existing) !== JSON.stringify(f);
    });
    const toInsert = newFields.filter(f => !existingMap.has(f.id));
    
    await Promise.all([
      ...toDelete.map(f => supabase.from('fields').delete().eq('id', f.id)),
      ...toUpdate.map((f, idx) => 
        supabase.from('fields').update({
          name: f.name,
          field_type: f.type,
          currency: f.currency,
          is_primary: f.isPrimary,
          dropdown_options_json: f.dropdownOptions,
          position: idx,
        }).eq('id', f.id)
      ),
      ...(toInsert.length > 0 ? [supabase.from('fields').insert(
        toInsert.map((f, idx) => ({
          table_id: tableId,
          name: f.name,
          field_type: f.type,
          currency: f.currency || 'None',
          is_primary: f.isPrimary || false,
          dropdown_options_json: f.dropdownOptions || [],
          position: existingFields.length + idx,
        }))
      )] : []),
    ]);
  },

  async fetchRows(tableId: string): Promise<Row[]> {
    const { data, error } = await supabase
      .from('rows')
      .select('*')
      .eq('table_id', tableId);
    if (error) throw error;
    
    return (data || []).map(row => ({
      id: row.id,
      ...row.data_json,
    }));
  },

  async addRow(tableId: string, rowData: any): Promise<Row> {
    const { data, error } = await supabase
      .from('rows')
      .insert({
        table_id: tableId,
        data_json: rowData,
      })
      .select()
      .single();
    if (error) throw error;
    return { id: data.id, ...data.data_json };
  },

  async updateRow(rowId: string, rowData: any): Promise<void> {
    const { error } = await supabase
      .from('rows')
      .update({ 
        data_json: rowData, 
        updated_at: new Date().toISOString(),
      })
      .eq('id', rowId);
    if (error) throw error;
  },

  async deleteRow(rowId: string): Promise<void> {
    const { error } = await supabase.from('rows').delete().eq('id', rowId);
    if (error) throw error;
  },
};