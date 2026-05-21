import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Icon } from '../shared/Icon';
import { cn } from '../../lib/utils';

interface AddYearModalProps {
  existingYears: Array<{ id: string; year: number }>;
  onSave: (year: number, mode: string, copyFromYearId?: string) => void;
  onClose: () => void;
}

export const AddYearModal: React.FC<AddYearModalProps> = ({ existingYears, onSave, onClose }) => {
  const [year, setYear] = useState(String(new Date().getFullYear() + 1));
  const [mode, setMode] = useState('fresh');
  const [copyFrom, setCopyFrom] = useState(existingYears[0]?.id || '');

  return (
    <Modal title="Add new year" icon="ti-calendar-plus" onClose={onClose} width={450}>
      <div className="space-y-5">
        {/* Year Input */}
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
            Year
          </label>
          <input
            type="number"
            value={year}
            onChange={e => setYear(e.target.value)}
            placeholder="e.g. 2027"
            className="w-full px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30 transition-all"
          />
        </div>

        {/* Start with Options */}
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
            Start with
          </label>
          <div className="space-y-2">
            {[
              ['fresh', 'Start fresh', 'Empty — create your own tabs and tables', 'ti-file'],
              ['copy', 'Copy structure from', 'Copies tabs, tables and field definitions — no data', 'ti-copy'],
            ].map(([v, label, sub, iconName]) => (
              <motion.div
                key={v}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setMode(v)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200",
                  mode === v
                    ? "border-accent-cyan/50 bg-accent-cyan/5 shadow-glow-cyan"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                )}
              >
                {/* Radio indicator */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                    mode === v ? "border-accent-cyan" : "border-white/30"
                  )}>
                    {mode === v && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-accent-cyan"
                      />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon n={iconName} size={14} className={mode === v ? "text-accent-cyan" : "text-white/40"} />
                    <span className="text-sm font-medium text-white/90">{label}</span>
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">{sub}</p>
                  
                  {/* Copy from dropdown - only shown when copy mode is selected */}
                  {v === 'copy' && mode === 'copy' && existingYears.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3"
                    >
                      <label className="text-2xs text-white/40 block mb-1">Select source year</label>
                      <select
                        value={copyFrom}
                        onChange={e => setCopyFrom(e.target.value)}
                        onClick={e => e.stopPropagation()}
                        className="w-full px-3 py-1.5 text-sm rounded-lg bg-white/10 border border-white/10 text-white/80 focus:outline-none focus:border-accent-cyan/50 cursor-pointer"
                      >
                        {existingYears.map(y => (
                          <option key={y.id} value={y.id} className="bg-navy-800">
                            {y.year}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="blue"
          disabled={!year.trim()}
          onClick={() => onSave(parseInt(year), mode, mode === 'copy' ? copyFrom : undefined)}
          icon={<Icon n="ti-check" size={13} />}
        >
          Create Year
        </Button>
      </div>
    </Modal>
  );
};