-- Create table to store row-level formulas
CREATE TABLE IF NOT EXISTS row_formulas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID REFERENCES tables(id) ON DELETE CASCADE NOT NULL,
  row_id UUID NOT NULL,
  field_id UUID REFERENCES fields(id) ON DELETE CASCADE NOT NULL,
  formula TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(table_id, row_id, field_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_row_formulas_table_id ON row_formulas(table_id);
CREATE INDEX IF NOT EXISTS idx_row_formulas_row_id ON row_formulas(row_id);
CREATE INDEX IF NOT EXISTS idx_row_formulas_field_id ON row_formulas(field_id);

-- Enable RLS
ALTER TABLE row_formulas ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own row_formulas" ON row_formulas;
CREATE POLICY "Users can view own row_formulas" ON row_formulas
  FOR SELECT USING (auth.uid() IN (
    SELECT years.user_id FROM tables t
    JOIN tabs ON tabs.id = t.tab_id
    JOIN years ON years.id = tabs.year_id
    WHERE t.id = row_formulas.table_id
  ));

DROP POLICY IF EXISTS "Users can insert own row_formulas" ON row_formulas;
CREATE POLICY "Users can insert own row_formulas" ON row_formulas
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT years.user_id FROM tables t
    JOIN tabs ON tabs.id = t.tab_id
    JOIN years ON years.id = tabs.year_id
    WHERE t.id = row_formulas.table_id
  ));

DROP POLICY IF EXISTS "Users can update own row_formulas" ON row_formulas;
CREATE POLICY "Users can update own row_formulas" ON row_formulas
  FOR UPDATE USING (auth.uid() IN (
    SELECT years.user_id FROM tables t
    JOIN tabs ON tabs.id = t.tab_id
    JOIN years ON years.id = tabs.year_id
    WHERE t.id = row_formulas.table_id
  ));

DROP POLICY IF EXISTS "Users can delete own row_formulas" ON row_formulas;
CREATE POLICY "Users can delete own row_formulas" ON row_formulas
  FOR DELETE USING (auth.uid() IN (
    SELECT years.user_id FROM tables t
    JOIN tabs ON tabs.id = t.tab_id
    JOIN years ON years.id = tabs.year_id
    WHERE t.id = row_formulas.table_id
  ));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_row_formulas_updated_at ON row_formulas;
CREATE TRIGGER update_row_formulas_updated_at
  BEFORE UPDATE ON row_formulas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();