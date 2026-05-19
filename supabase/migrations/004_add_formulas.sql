-- Formulas table for storing formula definitions
CREATE TABLE IF NOT EXISTS formulas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID REFERENCES tables(id) ON DELETE CASCADE NOT NULL,
  field_id UUID REFERENCES fields(id) ON DELETE CASCADE NOT NULL,
  formula_text TEXT NOT NULL,
  depends_on JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(table_id, field_id)
);

-- Add formula field type to fields table
ALTER TABLE fields DROP CONSTRAINT IF EXISTS fields_field_type_check;
ALTER TABLE fields ADD CONSTRAINT fields_field_type_check 
  CHECK (field_type IN ('Text', 'Number', 'Date', 'Month', 'Dropdown', 'Formula'));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_formulas_table_id ON formulas(table_id);
CREATE INDEX IF NOT EXISTS idx_formulas_field_id ON formulas(field_id);

-- Enable RLS
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own formulas" ON formulas;
CREATE POLICY "Users can view own formulas" ON formulas
  FOR SELECT USING (auth.uid() IN (
    SELECT years.user_id FROM tables t
    JOIN tabs ON tabs.id = t.tab_id
    JOIN years ON years.id = tabs.year_id
    WHERE t.id = formulas.table_id
  ));

DROP POLICY IF EXISTS "Users can insert own formulas" ON formulas;
CREATE POLICY "Users can insert own formulas" ON formulas
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT years.user_id FROM tables t
    JOIN tabs ON tabs.id = t.tab_id
    JOIN years ON years.id = tabs.year_id
    WHERE t.id = formulas.table_id
  ));

DROP POLICY IF EXISTS "Users can update own formulas" ON formulas;
CREATE POLICY "Users can update own formulas" ON formulas
  FOR UPDATE USING (auth.uid() IN (
    SELECT years.user_id FROM tables t
    JOIN tabs ON tabs.id = t.tab_id
    JOIN years ON years.id = tabs.year_id
    WHERE t.id = formulas.table_id
  ));

DROP POLICY IF EXISTS "Users can delete own formulas" ON formulas;
CREATE POLICY "Users can delete own formulas" ON formulas
  FOR DELETE USING (auth.uid() IN (
    SELECT years.user_id FROM tables t
    JOIN tabs ON tabs.id = t.tab_id
    JOIN years ON years.id = tabs.year_id
    WHERE t.id = formulas.table_id
  ));

-- Function to evaluate formula (simplified - actual evaluation done in app)
CREATE OR REPLACE FUNCTION evaluate_formula(
  p_formula_id UUID,
  p_context JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
  v_formula_text TEXT;
  v_result JSONB;
BEGIN
  SELECT formula_text INTO v_formula_text
  FROM formulas
  WHERE id = p_formula_id;
  
  -- This is a placeholder - actual evaluation happens in the application
  -- The app will handle formula evaluation and store results
  v_result := jsonb_build_object('value', null, 'error', 'Evaluation handled by application');
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_formulas_updated_at ON formulas;
CREATE TRIGGER update_formulas_updated_at
  BEFORE UPDATE ON formulas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();