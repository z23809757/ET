-- Database indexes for performance
-- Note: Using standard CREATE INDEX (not CONCURRENTLY) for migration compatibility
CREATE INDEX IF NOT EXISTS idx_years_user_id ON years(user_id);
CREATE INDEX IF NOT EXISTS idx_years_year ON years(year);
CREATE INDEX IF NOT EXISTS idx_tabs_year_id ON tabs(year_id);
CREATE INDEX IF NOT EXISTS idx_tables_tab_id ON tables(tab_id);
CREATE INDEX IF NOT EXISTS idx_fields_table_id ON fields(table_id);
CREATE INDEX IF NOT EXISTS idx_rows_table_id ON rows(table_id);
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_rows_table_updated ON rows(table_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tabs_year_position ON tabs(year_id, position);

-- Transaction function for copying year structure (this is fine in a transaction)
CREATE OR REPLACE FUNCTION copy_year_structure(
  p_source_year_id UUID,
  p_target_year_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_tab_record RECORD;
  v_table_record RECORD;
  v_new_tab_id UUID;
  v_new_table_id UUID;
BEGIN
  -- Copy tabs
  FOR v_tab_record IN 
    SELECT * FROM tabs WHERE year_id = p_source_year_id ORDER BY position
  LOOP
    INSERT INTO tabs (id, year_id, name, icon, position)
    VALUES (gen_random_uuid(), p_target_year_id, v_tab_record.name, v_tab_record.icon, v_tab_record.position)
    RETURNING id INTO v_new_tab_id;
    
    -- Copy tables for this tab
    FOR v_table_record IN 
      SELECT * FROM tables WHERE tab_id = v_tab_record.id
    LOOP
      INSERT INTO tables (id, tab_id, name, type)
      VALUES (gen_random_uuid(), v_new_tab_id, v_table_record.name, v_table_record.type)
      RETURNING id INTO v_new_table_id;
      
      -- Copy fields for this table
      INSERT INTO fields (table_id, name, field_type, currency, is_primary, dropdown_options_json, position)
      SELECT v_new_table_id, name, field_type, currency, is_primary, dropdown_options_json, position
      FROM fields
      WHERE table_id = v_table_record.id;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rows table
DROP TRIGGER IF EXISTS update_rows_updated_at ON rows;
CREATE TRIGGER update_rows_updated_at
  BEFORE UPDATE ON rows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for settings table
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();