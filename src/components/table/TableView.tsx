import React, { useState, useEffect, useCallback } from 'react';
import { S } from '../../lib/constants';
import { Icon } from '../shared/Icon';
import { Button } from '../shared/Button';
import { Table, Row, UserSettings } from '../../types/finance';
import { formatField } from '../../lib/formatters';
import { FormulaBuilderModal } from '../formulas/FormulaBuilderModal';
import { useFinanceStore } from '../../hooks/useFinanceStore';
import { formulaStorageService } from '../../services/formulaStorageService';
import { useFormulaEvaluation } from '../../hooks/useFormulaEvaluation';
import { useMergeCells } from '../../hooks/useMergeCells';
import { MergeToolbar } from './MergeToolbar';

interface TableViewProps {
  table: Table;
  rows: Row[];
  settings: UserSettings;
  onAddRow: (data: any) => void;
  onEditRow: (id: string, data: any) => void;
  onDeleteRow: (id: string) => void;
}

const ROW_H = 37;
const VISIBLE = 25;

export const TableView: React.FC<TableViewProps> = ({ table, rows, settings, onAddRow, onEditRow, onDeleteRow }) => {
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState<string | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [showFormulaBuilder, setShowFormulaBuilder] = useState<{ field: any; rowId: string; currentFormula?: string } | null>(null);
  const [formulaValues, setFormulaValues] = useState<Record<string, Record<string, any>>>({});
  const [rowFormulas, setRowFormulas] = useState<Record<string, Record<string, string>>>({});
  const [isLoadingFormulas, setIsLoadingFormulas] = useState(true);
  
  const { state } = useFinanceStore();
  const { evaluateFormulaForRow, evaluating } = useFormulaEvaluation();

  useEffect(() => {
    const loadFormulas = async () => {
      setIsLoadingFormulas(true);
      const formulas = await formulaStorageService.getFormulasForTable(table.id);
      setRowFormulas(formulas);
      setIsLoadingFormulas(false);
    };
    loadFormulas();
  }, [table.id]);

  const evaluateAllFormulas = useCallback(async () => {
    const formulaFields = table.fields.filter(f => f.type === 'Formula');
    if (formulaFields.length === 0) return;
    
    const newFormulaValues: Record<string, Record<string, any>> = {};
    
    for (const row of rows) {
      newFormulaValues[row.id] = {};
      for (const field of formulaFields) {
        const formula = rowFormulas[row.id]?.[field.id];
        if (formula) {
          const value = await evaluateFormulaForRow(formula, row, table.id);
          newFormulaValues[row.id][field.id] = value;
        } else {
          newFormulaValues[row.id][field.id] = null;
        }
      }
    }
    
    setFormulaValues(newFormulaValues);
  }, [rows, table.fields, rowFormulas, evaluateFormulaForRow, table.id]);

  useEffect(() => {
    if (!isLoadingFormulas) {
      evaluateAllFormulas();
    }
  }, [rows, rowFormulas, evaluateAllFormulas, isLoadingFormulas]);

  const startEdit = (row: Row) => {
    setEditId(row.id);
    const f: any = {};
    table.fields.forEach(fld => { 
      if (fld.type !== 'Formula') {
        f[fld.id] = row[fld.id] || ""; 
      }
    });
    setForm(f);
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({});
  };

  const submit = () => {
    if (editId) {
      onEditRow(editId, form);
    } else {
      onAddRow(form);
    }
    setForm({});
    setEditId(null);
  };

  const renderInput = (f: any) => {
    if (f.type === 'Formula') {
      return (
        <div style={{ flex: 1, minWidth: 80 }} key={f.id}>
          <div style={{ 
            padding: "6px 8px", 
            fontSize: 12, 
            background: "var(--color-background-secondary)", 
            borderRadius: 6,
            color: "var(--color-text-tertiary)",
            textAlign: "center"
          }}>
            <Icon n="ti-calculator" size={12} /> Auto-calculated
          </div>
        </div>
      );
    }
    
    const v = form[f.id] || "";
    const set = (val: any) => setForm((p: any) => ({ ...p, [f.id]: val }));
    const base = { flex: 1, padding: "6px 8px", fontSize: 12, border: "0.5px solid var(--color-border-secondary)", borderRadius: 6, background: "var(--color-background-secondary)", color: "var(--color-text-primary)", outline: "none", minWidth: 0 };
    
    if (f.type === "Dropdown") {
      return (
        <select key={f.id} value={v} onChange={e => set(e.target.value)} style={base}>
          <option value="">Select…</option>
          {(f.dropdownOptions || []).map((o: any) => <option key={o.id} value={o.label}>{o.label}</option>)}
        </select>
      );
    }
    if (f.type === "Date") return <input key={f.id} type="date" value={v} onChange={e => set(e.target.value)} style={base} />;
    if (f.type === "Month") return <input key={f.id} type="month" value={v} onChange={e => set(e.target.value)} style={base} />;
    if (f.type === "Number") return <input key={f.id} type="number" value={v} onChange={e => set(e.target.value)} placeholder={f.name} style={{ ...base, textAlign: "right" }} />;
    return <input key={f.id} type="text" value={v} onChange={e => set(e.target.value)} placeholder={f.name} style={base} />;
  };

  const fmtCell = (row: Row, f: any) => {
    if (f.type === 'Formula') {
      const formula = rowFormulas[row.id]?.[f.id];
      const calculatedValue = formulaValues[row.id]?.[f.id];
      
      if (isLoadingFormulas) {
        return <span key={f.id} style={{ color: 'var(--color-text-tertiary)', fontSize: 11 }}>Loading...</span>;
      }
      
      if (!formula) {
        return (
          <button
            key={f.id}
            onClick={() => setShowFormulaBuilder({ field: f, rowId: row.id })}
            style={{
              background: 'transparent',
              border: '0.5px dashed var(--color-border-secondary)',
              borderRadius: 4,
              padding: '4px 8px',
              fontSize: 11,
              cursor: 'pointer',
              color: '#185FA5',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Icon n="ti-calculator" size={12} /> Set Formula
          </button>
        );
      }
      
      if (evaluating) {
        return <span key={f.id} style={{ color: 'var(--color-text-tertiary)', fontSize: 11 }}>Calculating...</span>;
      }
      
      if (calculatedValue !== undefined && calculatedValue !== null) {
        const displayValue = formatField(calculatedValue, f.currency || 'USD', settings.displayCurrency, settings.exchangeRate);
        return (
          <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span>{displayValue}</span>
            <button
              onClick={() => setShowFormulaBuilder({ field: f, rowId: row.id, currentFormula: formula })}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 10,
                color: '#185FA5',
                padding: '2px 4px'
              }}
            >
              <Icon n="ti-edit" size={12} /> Edit
            </button>
          </div>
        );
      }
      
      return <span key={f.id} style={{ color: 'var(--color-text-tertiary)', fontSize: 11 }}>No value</span>;
    }
    
    const v = row[f.id];
    if (f.type === "Number" && v != null && v !== "") {
      return formatField(parseFloat(v) || 0, f.currency, settings.displayCurrency, settings.exchangeRate);
    }
    return v || "";
  };

  const total = rows.length;
  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_H) - 5);
  const endIdx = Math.min(total, startIdx + VISIBLE + 10);
  const visible = rows.slice(startIdx, endIdx);

  const handleFormulaSave = async (formula: string) => {
    if (!showFormulaBuilder) return;
    
    const { field, rowId } = showFormulaBuilder;
    
    await formulaStorageService.saveFormula(table.id, rowId, field.id, formula);
    
    setRowFormulas(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [field.id]: formula
      }
    }));
    
    setShowFormulaBuilder(null);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {rows.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--color-text-tertiary)" }}>
          <Icon n="ti-table-off" size={30} />
          <div style={{ marginTop: 12 }}>No entries yet</div>
        </div>
      ) : (
        <div onScroll={e => setScrollTop((e.target as HTMLDivElement).scrollTop)} style={{ flex: 1, overflowY: "auto", position: "relative" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, tableLayout: "fixed" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
              <tr>
                {table.fields.map(f => <th key={f.id} style={S.th}>{f.name}{f.type === 'Formula' && <span style={{ marginLeft: 4, fontSize: 9, color: '#1D9E75' }}>🔢</span>}</th>)}
                <th style={{ ...S.th, width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {startIdx > 0 && <tr style={{ height: startIdx * ROW_H }}><td colSpan={table.fields.length + 1}></td></tr>}
              {visible.map(row => {
                const isDel = delId === row.id;
                const isEd = editId === row.id;
                return (
                  <tr key={row.id} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", background: isDel ? "#FFF0F0" : isEd ? "#F0F9E8" : "transparent", height: ROW_H }}>
                    {table.fields.map(f => {
                      const value = fmtCell(row, f);
                      return <td key={f.id} style={S.td}>{value}</td>;
                    })}
                    <td style={{ ...S.td, width: 80 }}>
                      {isDel ? (
                        <span style={{ fontSize: 11 }}>
                          <span style={{ color: "#791F1F" }}>Delete? </span>
                          <span onClick={() => { onDeleteRow(row.id); setDelId(null); }} style={{ color: "#A32D2D", cursor: "pointer", fontWeight: 500 }}>Yes</span>
                          <span style={{ color: "var(--color-text-tertiary)" }}> · </span>
                          <span onClick={() => setDelId(null)} style={{ color: "var(--color-text-tertiary)", cursor: "pointer" }}>Cancel</span>
                        </span>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Icon n="ti-edit" size={14} color="#185FA5" style={{ cursor: "pointer" }} onClick={() => startEdit(row)} />
                          <Icon n="ti-trash" size={14} color="#D85A30" style={{ cursor: "pointer" }} onClick={() => setDelId(row.id)} />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {endIdx < total && <tr style={{ height: (total - endIdx) * ROW_H }}><td colSpan={table.fields.length + 1}></td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <div style={S.entryBar}>
        <div style={{ fontSize: 10, fontWeight: 500, color: "var(--color-text-tertiary)", marginBottom: 6, letterSpacing: ".04em" }}>{editId ? "EDIT ROW" : "ADD NEW ROW"}</div>
        <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
          {table.fields.map(f => <div key={f.id} style={{ flex: 1, minWidth: 80 }}>{renderInput(f)}</div>)}
          <Button variant={editId ? "green" : "blue"} onClick={submit}>
            <Icon n={editId ? "ti-check" : "ti-plus"} size={13} />{editId ? "Save" : "Add"}
          </Button>
          {editId && <span onClick={cancelEdit} style={{ fontSize: 11, color: "var(--color-text-tertiary)", cursor: "pointer" }}>Cancel</span>}
        </div>
      </div>

      {showFormulaBuilder && (
        <FormulaBuilderModal
          tableId={table.id}
          fieldName={showFormulaBuilder.field.name}
          initialFormula={showFormulaBuilder.currentFormula}
          onSave={handleFormulaSave}
          onClose={() => setShowFormulaBuilder(null)}
        />
      )}
    </div>
  );
};