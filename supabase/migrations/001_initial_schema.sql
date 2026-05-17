-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Years table
CREATE TABLE IF NOT EXISTS years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, year)
);

-- Tabs table
CREATE TABLE IF NOT EXISTS tabs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year_id UUID REFERENCES years(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'ti-folder',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tables (categories within tabs)
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tab_id UUID REFERENCES tabs(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('Expense', 'Income', 'Transfer', 'Loan', 'None')) DEFAULT 'Expense',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fields (dynamic schema for each table)
CREATE TABLE IF NOT EXISTS fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID REFERENCES tables(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  field_type TEXT CHECK (field_type IN ('Text', 'Number', 'Date', 'Month', 'Dropdown')) DEFAULT 'Text',
  currency TEXT CHECK (currency IN ('USD', 'INR', 'None')) DEFAULT 'None',
  is_primary BOOLEAN DEFAULT FALSE,
  dropdown_options_json JSONB DEFAULT '[]',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rows (data stored as JSON for flexibility)
CREATE TABLE IF NOT EXISTS rows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID REFERENCES tables(id) ON DELETE CASCADE NOT NULL,
  data_json JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  last_modified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exchange_rate DECIMAL(10, 4) DEFAULT 85.40,
  display_currency TEXT CHECK (display_currency IN ('USD', 'INR')) DEFAULT 'USD',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on all tables
ALTER TABLE years ENABLE ROW LEVEL SECURITY;
ALTER TABLE tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "Users can view own years" ON years;
DROP POLICY IF EXISTS "Users can insert own years" ON years;
DROP POLICY IF EXISTS "Users can update own years" ON years;
DROP POLICY IF EXISTS "Users can delete own years" ON years;

DROP POLICY IF EXISTS "Users can view own tabs" ON tabs;
DROP POLICY IF EXISTS "Users can insert own tabs" ON tabs;
DROP POLICY IF EXISTS "Users can update own tabs" ON tabs;
DROP POLICY IF EXISTS "Users can delete own tabs" ON tabs;

DROP POLICY IF EXISTS "Users can view own tables" ON tables;
DROP POLICY IF EXISTS "Users can insert own tables" ON tables;
DROP POLICY IF EXISTS "Users can update own tables" ON tables;
DROP POLICY IF EXISTS "Users can delete own tables" ON tables;

DROP POLICY IF EXISTS "Users can view own fields" ON fields;
DROP POLICY IF EXISTS "Users can insert own fields" ON fields;
DROP POLICY IF EXISTS "Users can update own fields" ON fields;
DROP POLICY IF EXISTS "Users can delete own fields" ON fields;

DROP POLICY IF EXISTS "Users can view own rows" ON rows;
DROP POLICY IF EXISTS "Users can insert own rows" ON rows;
DROP POLICY IF EXISTS "Users can update own rows" ON rows;
DROP POLICY IF EXISTS "Users can delete own rows" ON rows;

DROP POLICY IF EXISTS "Users can view own settings" ON settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON settings;
DROP POLICY IF EXISTS "Users can update own settings" ON settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON settings;

-- Create RLS Policies for years
CREATE POLICY "Users can view own years" ON years FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own years" ON years FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own years" ON years FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own years" ON years FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tabs
CREATE POLICY "Users can view own tabs" ON tabs FOR SELECT USING (
  EXISTS (SELECT 1 FROM years WHERE years.id = tabs.year_id AND years.user_id = auth.uid())
);
CREATE POLICY "Users can insert own tabs" ON tabs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM years WHERE years.id = tabs.year_id AND years.user_id = auth.uid())
);
CREATE POLICY "Users can update own tabs" ON tabs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM years WHERE years.id = tabs.year_id AND years.user_id = auth.uid())
);
CREATE POLICY "Users can delete own tabs" ON tabs FOR DELETE USING (
  EXISTS (SELECT 1 FROM years WHERE years.id = tabs.year_id AND years.user_id = auth.uid())
);

-- RLS Policies for tables
CREATE POLICY "Users can view own tables" ON tables FOR SELECT USING (
  EXISTS (SELECT 1 FROM tabs JOIN years ON years.id = tabs.year_id WHERE tabs.id = tables.tab_id AND years.user_id = auth.uid())
);
CREATE POLICY "Users can insert own tables" ON tables FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM tabs JOIN years ON years.id = tabs.year_id WHERE tabs.id = tables.tab_id AND years.user_id = auth.uid())
);
CREATE POLICY "Users can update own tables" ON tables FOR UPDATE USING (
  EXISTS (SELECT 1 FROM tabs JOIN years ON years.id = tabs.year_id WHERE tabs.id = tables.tab_id AND years.user_id = auth.uid())
);
CREATE POLICY "Users can delete own tables" ON tables FOR DELETE USING (
  EXISTS (SELECT 1 FROM tabs JOIN years ON years.id = tabs.year_id WHERE tabs.id = tables.tab_id AND years.user_id = auth.uid())
);

-- RLS Policies for fields
CREATE POLICY "Users can view own fields" ON fields FOR SELECT USING (
  EXISTS (SELECT 1 FROM tables JOIN tabs ON tabs.id = tables.tab_id JOIN years ON years.id = tabs.year_id WHERE tables.id = fields.table_id AND years.user_id = auth.uid())
);
CREATE POLICY "Users can insert own fields" ON fields FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM tables JOIN tabs ON tabs.id = tables.tab_id JOIN years ON years.id = tabs.year_id WHERE tables.id = fields.table_id AND years.user_id = auth.uid())
);
CREATE POLICY "Users can update own fields" ON fields FOR UPDATE USING (
  EXISTS (SELECT 1 FROM tables JOIN tabs ON tabs.id = tables.tab_id JOIN years ON years.id = tabs.year_id WHERE tables.id = fields.table_id AND years.user_id = auth.uid())
);
CREATE POLICY "Users can delete own fields" ON fields FOR DELETE USING (
  EXISTS (SELECT 1 FROM tables JOIN tabs ON tabs.id = tables.tab_id JOIN years ON years.id = tabs.year_id WHERE tables.id = fields.table_id AND years.user_id = auth.uid())
);

-- RLS Policies for rows
CREATE POLICY "Users can view own rows" ON rows FOR SELECT USING (
  EXISTS (SELECT 1 FROM tables JOIN tabs ON tabs.id = tables.tab_id JOIN years ON years.id = tabs.year_id WHERE tables.id = rows.table_id AND years.user_id = auth.uid())
);
CREATE POLICY "Users can insert own rows" ON rows FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM tables JOIN tabs ON tabs.id = tables.tab_id JOIN years ON years.id = tabs.year_id WHERE tables.id = rows.table_id AND years.user_id = auth.uid())
);
CREATE POLICY "Users can update own rows" ON rows FOR UPDATE USING (
  EXISTS (SELECT 1 FROM tables JOIN tabs ON tabs.id = tables.tab_id JOIN years ON years.id = tabs.year_id WHERE tables.id = rows.table_id AND years.user_id = auth.uid())
);
CREATE POLICY "Users can delete own rows" ON rows FOR DELETE USING (
  EXISTS (SELECT 1 FROM tables JOIN tabs ON tabs.id = tables.tab_id JOIN years ON years.id = tabs.year_id WHERE tables.id = rows.table_id AND years.user_id = auth.uid())
);

-- RLS Policies for settings
CREATE POLICY "Users can view own settings" ON settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON settings FOR DELETE USING (auth.uid() = user_id);