import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../shared/Button';
import { Icon } from '../../shared/Icon';
import { TableSelector } from './TableSelector';
import { FieldSelector } from './FieldSelector';
import { RowSelector } from './RowSelector';
import { RangeSelector } from './RangeSelector';
import { CellReference } from '../../../types/formula';
import { cn } from '../../../lib/utils';

interface ReferencePickerProps {
  references: CellReference[];
  onSelect: (reference: CellReference) => void;
}

export const ReferencePicker: React.FC<ReferencePickerProps> = ({ references = [], onSelect }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [selectionType, setSelectionType] = useState<'row' | 'range' | null>(null);
  
  // Safety check: if references is undefined or null, use empty array
  const safeReferences = references || [];
  
  // Get unique table names
  const tables = useMemo(() => {
    if (!safeReferences.length) return [];
    return [...new Set(safeReferences.map(r => r?.tableName).filter(Boolean))];
  }, [safeReferences]);
  
  // Get fields for selected table
  const fieldsForSelectedTable = useMemo(() => {
    if (!selectedTable || !safeReferences.length) return [];
    const uniqueFields = new Map();
    safeReferences
      .filter(r => r?.tableName === selectedTable)
      .forEach(r => {
        if (r?.fieldName && !uniqueFields.has(r.fieldName)) {
          uniqueFields.set(r.fieldName, r);
        }
      });
    return Array.from(uniqueFields.values());
  }, [safeReferences, selectedTable]);
  
  // Get rows for selected field
  const rowsForSelectedField = useMemo(() => {
    if (!selectedTable || !selectedField || !safeReferences.length) return [];
    return safeReferences.filter(r => 
      r?.tableName === selectedTable && 
      r?.fieldName === selectedField &&
      !r?.isRange
    );
  }, [safeReferences, selectedTable, selectedField]);
  
  // Get the range option for the selected field
  const rangeOption = useMemo(() => {
    if (!selectedTable || !selectedField || !safeReferences.length) return null;
    return safeReferences.find(r => 
      r?.tableName === selectedTable && 
      r?.fieldName === selectedField && 
      r?.isRange
    );
  }, [safeReferences, selectedTable, selectedField]);
  
  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    setSelectedField(null);
    setSelectionType(null);
  };
  
  const handleFieldSelect = (fieldName: string) => {
    setSelectedField(fieldName);
    setSelectionType(null);
  };
  
  const handleRowSelect = (reference: CellReference) => {
    onSelect(reference);
    closePicker();
  };
  
  const handleRangeSelect = (reference: CellReference) => {
    onSelect(reference);
    closePicker();
  };
  
  const handleSelectionTypeChoice = (type: 'row' | 'range') => {
    setSelectionType(type);
  };
  
  const handleBackToFields = () => {
    setSelectedField(null);
    setSelectionType(null);
  };
  
  const handleBackToTables = () => {
    setSelectedTable(null);
    setSelectedField(null);
    setSelectionType(null);
  };
  
  const handleBackToSelectionType = () => {
    setSelectionType(null);
  };
  
  const closePicker = () => {
    setShowPicker(false);
    setSelectedTable(null);
    setSelectedField(null);
    setSelectionType(null);
  };
  
  if (!showPicker) {
    return (
      <button
        onClick={() => setShowPicker(true)}
        className="px-3 py-1.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 text-white/70 hover:text-white/90 transition-all flex items-center gap-1.5"
      >
        <Icon n="ti-plus" size={12} />
        Add Reference
      </button>
    );
  }
  
  return (
    <div className="relative inline-block">
      {/* Close Button */}
      <button
        onClick={closePicker}
        className="px-3 py-1.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 text-white/70 hover:text-white/90 transition-all flex items-center gap-1.5 mb-2"
      >
        <Icon n="ti-x" size={12} />
        Close Picker
      </button>
      
      {/* Picker Panel */}
      <div className="absolute top-full left-0 mt-1 z-50 w-80 sm:w-96 bg-navy-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon n="ti-database" size={14} className="text-accent-gold" />
              <span className="text-sm font-semibold text-white/80">Select Reference</span>
            </div>
            <button
              onClick={closePicker}
              className="p-1 rounded-lg text-white/40 hover:text-white/60 transition-all"
            >
              <Icon n="ti-x" size={16} />
            </button>
          </div>
          
          {tables.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              <Icon n="ti-table-off" size={32} className="mx-auto mb-2 opacity-50" />
              <div className="text-sm">No tables available</div>
              <div className="text-xs mt-1">Create tables with data first</div>
            </div>
          ) : !selectedTable ? (
            <TableSelector 
              tables={tables} 
              onSelect={handleTableSelect}
              onCancel={closePicker}
            />
          ) : !selectedField ? (
            <FieldSelector 
              fields={fieldsForSelectedTable} 
              tableName={selectedTable}
              onSelect={handleFieldSelect}
              onBack={handleBackToTables}
            />
          ) : !selectionType ? (
            <div className="space-y-3">
              <button
                onClick={handleBackToFields}
                className="text-xs text-accent-cyan hover:text-accent-gold mb-2 flex items-center gap-1"
              >
                <Icon n="ti-chevron-left" size={12} /> Back to fields
              </button>
              
              <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                Select Reference Type for {selectedField}
              </div>
              
              <button
                onClick={() => handleSelectionTypeChoice('row')}
                className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-cyan/20 flex items-center justify-center">
                    <Icon n="ti-chart-bar" size={16} className="text-accent-cyan" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white/90">Single Row</div>
                    <p className="text-2xs text-white/40 mt-0.5">Reference a specific row's value</p>
                  </div>
                  <Icon n="ti-chevron-right" size={14} className="ml-auto text-white/30 group-hover:text-accent-cyan" />
                </div>
              </button>
              
              <button
                onClick={() => handleSelectionTypeChoice('range')}
                className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-emerald/20 flex items-center justify-center">
                    <Icon n="ti-chart-area" size={16} className="text-accent-emerald" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white/90">Range / All Rows</div>
                    <p className="text-2xs text-white/40 mt-0.5">Reference entire column for SUM, AVERAGE, etc.</p>
                  </div>
                  <Icon n="ti-chevron-right" size={14} className="ml-auto text-white/30 group-hover:text-accent-emerald" />
                </div>
              </button>
            </div>
          ) : selectionType === 'row' ? (
            <RowSelector
              rows={rowsForSelectedField}
              rangeOption={rangeOption}
              fieldName={selectedField}
              onSelect={handleRowSelect}
              onBack={handleBackToSelectionType}
            />
          ) : (
            <RangeSelector
              tables={tables}
              onSelect={handleRangeSelect}
              onCancel={() => setSelectionType(null)}
              onBack={handleBackToSelectionType}
            />
          )}
        </div>
      </div>
    </div>
  );
};