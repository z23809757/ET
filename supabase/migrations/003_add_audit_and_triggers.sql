-- Audit log table for tracking all changes
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  version INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX idx_audit_logs_record ON audit_logs(record_id, created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own audit logs
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Function to get client IP (requires Supabase setup)
CREATE OR REPLACE FUNCTION get_client_ip()
RETURNS INET AS $$
BEGIN
  RETURN NULLIF(current_setting('request.headers', true)::json->>'x-forwarded-for', '')::inet;
EXCEPTION
  WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Main audit trigger function
CREATE OR REPLACE FUNCTION log_row_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_ip INET;
  v_user_agent TEXT;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  -- Get client info (if available)
  BEGIN
    v_ip := get_client_ip();
    v_user_agent := current_setting('request.headers', true)::json->>'user-agent';
  EXCEPTION
    WHEN OTHERS THEN
      v_ip := NULL;
      v_user_agent := NULL;
  END;
  
  -- Insert audit record based on operation
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, table_name, record_id, action, new_data, version, ip_address, user_agent)
    VALUES (v_user_id, TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), NEW.version, v_ip, v_user_agent);
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Increment version on update
    NEW.version := OLD.version + 1;
    NEW.last_modified_by := v_user_id;
    
    INSERT INTO audit_logs (user_id, table_name, record_id, action, old_data, new_data, version, ip_address, user_agent)
    VALUES (v_user_id, TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), NEW.version, v_ip, v_user_agent);
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, table_name, record_id, action, old_data, version, ip_address, user_agent)
    VALUES (v_user_id, TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), OLD.version, v_ip, v_user_agent);
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers
DROP TRIGGER IF EXISTS audit_rows ON rows;
CREATE TRIGGER audit_rows 
  BEFORE INSERT OR UPDATE OR DELETE ON rows
  FOR EACH ROW 
  EXECUTE FUNCTION log_row_changes();

-- Also audit tables and fields for schema changes
DROP TRIGGER IF EXISTS audit_tables ON tables;
CREATE TRIGGER audit_tables
  BEFORE INSERT OR UPDATE OR DELETE ON tables
  FOR EACH ROW
  EXECUTE FUNCTION log_row_changes();

DROP TRIGGER IF EXISTS audit_fields ON fields;
CREATE TRIGGER audit_fields
  BEFORE INSERT OR UPDATE OR DELETE ON fields
  FOR EACH ROW
  EXECUTE FUNCTION log_row_changes();

-- Function to restore a row to a previous version
CREATE OR REPLACE FUNCTION restore_row_version(
  p_record_id UUID,
  p_version INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_audit_record RECORD;
  v_table_name TEXT;
BEGIN
  -- Get the audit record for the specific version
  SELECT table_name, old_data INTO v_audit_record
  FROM audit_logs
  WHERE record_id = p_record_id 
    AND version = p_version
    AND action IN ('UPDATE', 'INSERT')
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Restore based on table type
  IF v_audit_record.table_name = 'rows' THEN
    UPDATE rows 
    SET data_json = (v_audit_record.old_data->>'data_json')::jsonb,
        updated_at = NOW()
    WHERE id = p_record_id;
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;