import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Icon } from '../shared/Icon';
import { TABLER_ICONS } from '../../lib/constants';
import { cn } from '../../lib/utils';

interface AddTabModalProps {
  onSave: (name: string, icon: string) => void;
  onClose: () => void;
}

export const AddTabModal: React.FC<AddTabModalProps> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('ti-folder');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter icons based on search
  const filteredIcons = TABLER_ICONS.filter(ic => 
    ic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal title="Add new tab" icon="ti-folder-plus" onClose={onClose} width={500}>
      <div className="space-y-5">
        {/* Tab Name Input */}
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
            Tab name
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Expenses, Income, Investments"
            className="w-full px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30 transition-all"
            autoFocus
          />
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
            Icon
          </label>
          
          {/* Search Input */}
          <div className="relative mb-3">
            <Icon n="ti-search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search icons..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-white/70 placeholder:text-white/20 focus:outline-none focus:border-accent-cyan/50 transition-all"
            />
          </div>

          {/* Icons Grid */}
          <div className="max-h-64 overflow-y-auto rounded-xl bg-white/5 border border-white/10 p-3">
            {filteredIcons.length === 0 ? (
              <div className="text-center py-8 text-white/40">
                <Icon n="ti-search" size={24} className="mb-2 opacity-50" />
                <p className="text-xs">No icons found</p>
              </div>
            ) : (
              <div className="grid grid-cols-8 gap-2">
                {filteredIcons.map(ic => (
                  <motion.button
                    key={ic}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIcon(ic)}
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
                      icon === ic
                        ? "bg-gradient-gold-amber text-navy-900 shadow-glow-gold"
                        : "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80"
                    )}
                  >
                    <Icon n={ic} size={16} />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Icon Preview */}
          <div className="mt-3 flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-xs text-white/50">Selected icon:</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-gold-amber flex items-center justify-center">
                <Icon n={icon} size={16} className="text-navy-900" />
              </div>
              <span className="text-xs font-mono text-white/60">{icon}</span>
            </div>
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
          disabled={!name.trim()}
          onClick={() => onSave(name.trim(), icon)}
          icon={<Icon n="ti-check" size={13} />}
        >
          Create Tab
        </Button>
      </div>
    </Modal>
  );
};