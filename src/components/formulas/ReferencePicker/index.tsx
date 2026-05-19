import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../shared/Button';
import { Icon } from '../../shared/Icon';
import { TableSelector } from './TableSelector';
import { FieldSelector } from './FieldSelector';
import { RowSelector } from './RowSelector';
import { CellReference } from '../../../types/formula';

interface ReferencePickerProps {
  references: CellReference[];
  onSelect: (reference: CellReference) => void;
}

export const ReferencePicker: React.FC<ReferencePickerProps> = ({ references, onSelect }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  
  // Get unique table names
  const tables = useMemo(() => [...new Set(references.map(r => r.tableName))], [references]);
  
  // Get fields for selected table
  const fieldsForSelectedTable = useMemo(() => {
    if (!selectedTable) return [];
    const uniqueFields = new Map();
    references
      .filter(r => r.tableName === selectedTable)
      .forEach(r => {
        if (!uniqueFields.has(r.fieldName)) {
          uniqueFields.set(r.fieldName, r);
        }
      });
    return Array.from(uniqueFields.values());
  }, [references, selectedTable]);
  
  // Get rows for selected field
  const rowsForSelectedField = useMemo(() => {
    if (!selectedTable || !selectedField) return [];
    return references.filter(r => 
      r.tableName === selectedTable && 
      r.fieldName === selectedField &&
      !r.isRange  // Only individual rows, not the range option
    );
  }, [references, selectedTable, selectedField]);
  
  // Get the range option for the selected field
  const rangeOption = useMemo(() => {
    if (!selectedTable || !selectedField) return null;
    return references.find(r => 
      r.tableName === selectedTable && 
      r.fieldName === selectedField && 
      r.isRange
    );
  }, [references, selectedTable, selectedField]);
  
  const handleTableSelect = (tableName: string) => {
    console.log('Table selected:', tableName);
    setSelectedTable(tableName);
    setSelectedField(null);
  };
  
  const handleFieldSelect = (fieldName: string) => {
    console.log('Field selected:', fieldName);
    setSelectedField(fieldName);
  };
  
  const handleRowSelect = (reference: CellReference) => {
    console.log('Row selected:', reference);
    onSelect(reference);
    setShowPicker(false);
    setSelectedTable(null);
    setSelectedField(null);
  };
  
  const handleBackToTables = () => {
    setSelectedTable(null);
    setSelectedField(null);
  };
  
  const handleBackToFields = () => {
    setSelectedField(null);
  };
  
  if (!showPicker) {
    return (
      <Button variant="default" small onClick={() => setShowPicker(true)}>
        <Icon n="ti-plus" size={12} /> Add Reference
      </Button>
    );
  }
  
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Button variant="default" small onClick={() => setShowPicker(false)} style={{ position: 'relative', zIndex: 1001 }}>
        <Icon n="ti-x" size={12} /> Close Picker
      </Button>
      <div style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        marginTop: 4,
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 8,
        padding: 12,
        minWidth: 280,
        maxWidth: 350,
        maxHeight: 400,
        overflowY: 'auto',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 500 }}>Select Reference</span>
          <Icon n="ti-x" size={16} style={{ cursor: 'pointer' }} onClick={() => setShowPicker(false)} />
        </div>
        
        {tables.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-tertiary)' }}>
            <Icon n="ti-table-off" size={24} />
            <div style={{ marginTop: 8, fontSize: 12 }}>No tables available</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Create tables with data first</div>
          </div>
        ) : !selectedTable ? (
          <TableSelector 
            tables={tables} 
            onSelect={handleTableSelect}
            onCancel={() => setShowPicker(false)}
          />
        ) : !selectedField ? (
          <FieldSelector 
            fields={fieldsForSelectedTable} 
            tableName={selectedTable}
            onSelect={handleFieldSelect}
            onBack={handleBackToTables}
          />
        ) : (
          <RowSelector
            rows={rowsForSelectedField}
            rangeOption={rangeOption}
            fieldName={selectedField}
            onSelect={handleRowSelect}
            onBack={handleBackToFields}
          />
        )}
      </div>
    </div>
  );
};