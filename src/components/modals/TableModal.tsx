import React, { useState } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Icon } from '../shared/Icon';
import { TYPE_C, TYPE_ICON, FIELD_TYPES } from '../../lib/constants';
import { Field } from '../../types/finance';

interface TableModalProps {
  initial?: any;
  hasRows?: boolean;
  isGlobal?: boolean;
  onSave: (data: { name: string; type: string; fields: Field[]; is_reference?: boolean; is_global?: boolean }) => void;
  onClose: () => void;
}

const uid = () => Math.random().toString(36).substring(2, 9);

export const TableModal: React.FC<TableModalProps> = ({ initial, hasRows = false, isGlobal = false, onSave, onClose }) => {
  const [name, setName] = useState(initial?.name || '');
  const [fields, setFields] = useState<Field[]>(initial?.fields || [{ id: uid(), name: '', type: 'Text', currency: 'None', isPrimary: false, dropdownOptions: [] }]);
  const [ttype, setTtype] = useState(initial?.type || 'Expense');
  const [isReference, setIsReference] = useState(initial?.is_reference || isGlobal);

  const valid = name.trim() && fields.length > 0 && fields.every(f => f.name.trim());

  const updateField = (i: number, key: string, value: any) => {
    const newFields = [...fields];
    newFields[i] = { ...newFields[i], [key]: value };
    if (key === 'isPrimary' && value) {
      newFields.forEach((f, j) => { if (j !== i) f.isPrimary = false; });
    }
    setFields(newFields);
  };

  const removeField = (i: number) => setFields(fields.filter((_, j) => j !== i));
  const addField = () => setFields([...fields, { id: uid(), name: '', type: 'Text', currency: 'None', isPrimary: false, dropdownOptions: [] }]);

  const addOption = (i: number) => {
    const newFields = [...fields];
    newFields[i] = { ...newFields[i], dropdownOptions: [...(newFields[i].dropdownOptions || []), { id: uid(), label: '' }] };
    setFields(newFields);
  };

  const updateOption = (i: number, oi: number, label: string) => {
    const newFields = [...fields];
    if (newFields[i].dropdownOptions) {
      newFields[i].dropdownOptions[oi] = { ...newFields[i].dropdownOptions[oi], label };
    }
    setFields(newFields);
  };

  const removeOption = (i: number, oi: number) => {
    const newFields = [...fields];
    if (newFields[i].dropdownOptions) {
      newFields[i].dropdownOptions = newFields[i].dropdownOptions.filter((_, j) => j !== oi);
    }
    setFields(newFields);
  };

  return (
    <Modal title={initial ? 'Edit table' : (isGlobal ? 'Create Global Reference Table' : 'Create new table')} icon={initial ? 'ti-table-options' : 'ti-table-plus'} onClose={onClose} width={650}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Table name</div>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={isGlobal ? "e.g., Exchange Rates, Tax Brackets, Product Catalog" : "e.g., House Rent"}
          style={{ width: '100%', padding: '6px 9px', fontSize: 12, border: '0.5px solid var(--color-border-secondary)', borderRadius: 8, background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', outline: 'none' }}
        />
      </div>

      {/* Global Reference Table Info */}
      {isGlobal && (
        <div style={{ 
          marginBottom: 16, 
          padding: "10px 12px", 
          background: "#E6F1FB", 
          borderRadius: 8, 
          fontSize: 11, 
          color: "#185FA5",
          border: '0.5px solid #B8D4F0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Icon n="ti-database" size={14} />
            <strong>Global Reference Table</strong>
          </div>
          <div style={{ marginLeft: 20 }}>
            ✓ Exists outside any year or tab<br />
            ✓ Available in ALL years for formula references<br />
            ✓ NOT included in financial calculations (Dashboard, Overall, All Years)<br />
            ✓ Perfect for exchange rates, tax brackets, lookup data
          </div>
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Fields</div>
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', background: 'transparent', width: 'auto' }}>Field name</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', background: 'transparent', width: 'auto' }}>Type</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', background: 'transparent', width: 'auto' }}>Currency</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', background: 'transparent', width: 80 }}>Primary</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', background: 'transparent', width: 28 }}></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((f, i) => (
                <React.Fragment key={f.id}>
                  <tr style={{ borderBottom: '0.5px solid var(--color-border-tertiary)', background: f.isPrimary ? '#F0F9E8' : 'transparent' }}>
                    <td style={{ padding: '5px 6px' }}>
                      <input
                        value={f.name}
                        onChange={e => updateField(i, 'name', e.target.value)}
                        placeholder="Field name"
                        style={{ width: '100%', padding: '4px 7px', fontSize: 11, border: '0.5px solid var(--color-border-secondary)', borderRadius: 6, background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', outline: 'none' }}
                      />
                    </td>
                    <td style={{ padding: '5px 6px' }}>
                      <select
                        value={f.type}
                        onChange={e => updateField(i, 'type', e.target.value as any)}
                        disabled={hasRows}
                        style={{ width: '100%', padding: '5px 7px', fontSize: 11, border: '0.5px solid var(--color-border-secondary)', borderRadius: 6, background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)' }}
                      >
                        {FIELD_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '5px 6px' }}>
                      {(f.type === 'Number' || f.type === 'Formula') ? (
                        <select
                          value={f.currency}
                          onChange={e => updateField(i, 'currency', e.target.value as any)}
                          style={{ width: '100%', padding: '5px 7px', fontSize: 11, border: '0.5px solid var(--color-border-secondary)', borderRadius: 6, background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)' }}
                        >
                          <option>USD</option>
                          <option>INR</option>
                          <option>None</option>
                        </select>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '5px 6px', textAlign: 'center' }}>
                      {(f.type === 'Number' || f.type === 'Formula') ? (
                        f.isPrimary ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: '2px 6px', borderRadius: 20, fontSize: 10, fontWeight: 500, background: '#EAF3DE', color: '#27500A', border: '0.5px solid #C0DD97' }}>
                            <Icon n="ti-check" size={10} />Primary
                          </span>
                        ) : (
                          <span onClick={() => updateField(i, 'isPrimary', true)} style={{ fontSize: 10, color: '#185FA5', cursor: 'pointer' }}>Set</span>
                        )
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '5px 6px', textAlign: 'right' }}>
                      {hasRows ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: '2px 5px', borderRadius: 20, fontSize: 9, background: '#FCEBEB', color: '#791F1F', border: '0.5px solid #F7C1C1' }}>
                          <Icon n="ti-lock" size={9} />Locked
                        </span>
                      ) : (
                        <Icon n="ti-trash" size={13} color="#D85A30" style={{ cursor: 'pointer' }} onClick={() => removeField(i)} />
                      )}
                    </td>
                  </tr>
                  {f.type === 'Dropdown' && (
                    <tr key={`${f.id}_d`}>
                      <td colSpan={5} style={{ padding: '6px 10px 8px 16px', background: 'var(--color-background-secondary)' }}>
                        <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-text-tertiary)', marginBottom: 5 }}>Options for "{f.name || 'this field'}"</div>
                        {(f.dropdownOptions || []).map((opt, oi) => (
                          <div key={opt.id} style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 4 }}>
                            <input
                              value={opt.label}
                              onChange={e => updateOption(i, oi, e.target.value)}
                              placeholder="Option label"
                              style={{ flex: 1, padding: '3px 7px', fontSize: 11, border: '0.5px solid var(--color-border-secondary)', borderRadius: 6, background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', outline: 'none' }}
                            />
                            <Icon n="ti-trash" size={12} color="var(--color-text-tertiary)" style={{ cursor: 'pointer' }} onClick={() => removeOption(i, oi)} />
                          </div>
                        ))}
                        <div onClick={() => addOption(i)} style={{ fontSize: 11, color: '#185FA5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Icon n="ti-plus" size={12} />Add option
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          <div onClick={addField} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#185FA5', cursor: 'pointer', padding: '6px 0 2px' }}>
            <Icon n="ti-plus" size={12} />Add field
          </div>
        </div>
      </div>

      <div style={{ height: '0.5px', background: 'var(--color-border-tertiary)', margin: '12px 0' }} />

      {/* Table type - only show for non-reference/global tables */}
      {!isGlobal && !isReference && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Table type</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            {['Expense', 'Income', 'Transfer', 'Loan', 'None'].map(t => {
              const c = TYPE_C[t as keyof typeof TYPE_C];
              const active = ttype === t;
              return (
                <div
                  key={t}
                  onClick={() => setTtype(t)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '5px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    border: `0.5px solid ${active ? c.border : 'var(--color-border-secondary)'}`,
                    background: active ? c.bg : 'var(--color-background-secondary)',
                    color: active ? c.text : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  <Icon n={TYPE_ICON[t as keyof typeof TYPE_ICON]} size={12} />{t}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon n="ti-info-circle" size={12} />Expense, Income, Transfer, Loan flow into Overall. None = private.
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16, paddingTop: 14, borderTop: '0.5px solid var(--color-border-tertiary)' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="blue" disabled={!valid} onClick={() => onSave({ 
          name: name.trim(), 
          type: ttype, 
          fields, 
          is_reference: isGlobal || isReference,
          is_global: isGlobal
        })}>
          <Icon n="ti-check" size={13} />{initial ? 'Save changes' : (isGlobal ? 'Create Global Table' : 'Create Table')}
        </Button>
      </div>
    </Modal>
  );
};