import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Icon } from '../shared/Icon';
import { TYPE_C, TYPE_ICON, FIELD_TYPES } from '../../lib/constants';
import { Field } from '../../types/finance';
import { cn } from '../../lib/utils';

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
    <Modal title={initial ? 'Edit table' : (isGlobal ? 'Create Global Reference Table' : 'Create new table')} icon={initial ? 'ti-table-options' : 'ti-table-plus'} onClose={onClose} width={700}>
      <div className="space-y-5">
        {/* Table Name Input */}
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
            Table name
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={isGlobal ? "e.g., Exchange Rates, Tax Brackets, Product Catalog" : "e.g., House Rent"}
            className="w-full px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30 transition-all"
          />
        </div>

        {/* Global Reference Table Info */}
        {isGlobal && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon n="ti-database" size={16} className="text-accent-cyan" />
              <strong className="text-sm text-accent-cyan">Global Reference Table</strong>
            </div>
            <div className="space-y-1 ml-6 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <Icon n="ti-check" size={12} className="text-accent-cyan" />
                <span>Exists outside any year or tab</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon n="ti-check" size={12} className="text-accent-cyan" />
                <span>Available in ALL years for formula references</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon n="ti-x" size={12} className="text-coral-400" />
                <span>NOT included in financial calculations (Dashboard, Overall, All Years)</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon n="ti-star" size={12} className="text-accent-gold" />
                <span>Perfect for exchange rates, tax brackets, lookup data</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Fields Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Fields
            </label>
            <button
              onClick={addField}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-accent-cyan transition-all"
            >
              <Icon n="ti-plus" size={12} />
              Add field
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto custom-scroll">
            {fields.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "p-3 rounded-xl border transition-all",
                  f.isPrimary 
                    ? "bg-emerald-500/5 border-emerald-500/30" 
                    : "bg-white/5 border-white/10"
                )}
              >
                <div className="grid grid-cols-12 gap-2 mb-2">
                  {/* Field Name */}
                  <div className="col-span-4">
                    <input
                      value={f.name}
                      onChange={e => updateField(i, 'name', e.target.value)}
                      placeholder="Field name"
                      className="w-full px-2 py-1.5 text-xs rounded-lg bg-white/10 border border-white/10 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-accent-cyan/50"
                    />
                  </div>
                  
                  {/* Field Type */}
                  <div className="col-span-3">
                    <select
                      value={f.type}
                      onChange={e => updateField(i, 'type', e.target.value as any)}
                      disabled={hasRows}
                      className="w-full px-2 py-1.5 text-xs rounded-lg bg-white/10 border border-white/10 text-white/90 focus:outline-none focus:border-accent-cyan/50 disabled:opacity-50"
                    >
                      {FIELD_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  
                  {/* Currency (only for Number/Formula) */}
                  <div className="col-span-2">
                    {(f.type === 'Number' || f.type === 'Formula') ? (
                      <select
                        value={f.currency}
                        onChange={e => updateField(i, 'currency', e.target.value as any)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg bg-white/10 border border-white/10 text-white/90 focus:outline-none focus:border-accent-cyan/50"
                      >
                        <option>USD</option>
                        <option>INR</option>
                        <option>None</option>
                      </select>
                    ) : (
                      <div className="px-2 py-1.5 text-xs text-white/30 text-center">—</div>
                    )}
                  </div>
                  
                  {/* Primary (only for Number/Formula) */}
                  <div className="col-span-2 text-center">
                    {(f.type === 'Number' || f.type === 'Formula') ? (
                      f.isPrimary ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-2xs bg-emerald-500/20 text-emerald-400">
                          <Icon n="ti-check" size={10} />Primary
                        </span>
                      ) : (
                        <button
                          onClick={() => updateField(i, 'isPrimary', true)}
                          className="text-xs text-accent-cyan hover:text-accent-gold transition-colors"
                        >
                          Set as Primary
                        </button>
                      )
                    ) : (
                      <span className="text-xs text-white/30">—</span>
                    )}
                  </div>
                  
                  {/* Delete button */}
                  <div className="col-span-1 text-right">
                    {hasRows ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-2xs bg-coral-500/20 text-coral-400">
                        <Icon n="ti-lock" size={10} />Locked
                      </span>
                    ) : (
                      <button
                        onClick={() => removeField(i)}
                        className="text-white/30 hover:text-coral-400 transition-colors"
                      >
                        <Icon n="ti-trash" size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Dropdown Options */}
                {f.type === 'Dropdown' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 pt-2 border-t border-white/10"
                  >
                    <label className="text-2xs text-white/40 block mb-1">Options</label>
                    <div className="space-y-1">
                      {(f.dropdownOptions || []).map((opt, oi) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <input
                            value={opt.label}
                            onChange={e => updateOption(i, oi, e.target.value)}
                            placeholder="Option label"
                            className="flex-1 px-2 py-1 text-xs rounded-lg bg-white/10 border border-white/10 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-accent-cyan/50"
                          />
                          <button
                            onClick={() => removeOption(i, oi)}
                            className="text-white/30 hover:text-coral-400 transition-colors"
                          >
                            <Icon n="ti-trash" size={12} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addOption(i)}
                        className="flex items-center gap-1 text-xs text-accent-cyan hover:text-accent-gold transition-colors mt-1"
                      >
                        <Icon n="ti-plus" size={10} />Add option
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Table type - only show for non-reference/global tables */}
        {!isGlobal && !isReference && (
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
              Table type
            </label>
            <div className="flex flex-wrap gap-2">
              {['Expense', 'Income', 'Transfer', 'Loan', 'None'].map(t => {
                const c = TYPE_C[t as keyof typeof TYPE_C];
                const active = ttype === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTtype(t)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-200",
                      active
                        ? "bg-gradient-gold-amber text-navy-900 shadow-glow-gold"
                        : "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80"
                    )}
                  >
                    <Icon n={TYPE_ICON[t as keyof typeof TYPE_ICON]} size={12} />
                    {t}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-white/30 mt-2 flex items-center gap-1">
              <Icon n="ti-info-circle" size={12} />
              Expense, Income, Transfer, Loan flow into Overall. None = private.
            </p>
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="blue"
          disabled={!valid}
          onClick={() => onSave({ 
            name: name.trim(), 
            type: ttype, 
            fields, 
            is_reference: isGlobal || isReference,
            is_global: isGlobal
          })}
          icon={<Icon n="ti-check" size={13} />}
        >
          {initial ? 'Save changes' : (isGlobal ? 'Create Global Table' : 'Create Table')}
        </Button>
      </div>
    </Modal>
  );
};