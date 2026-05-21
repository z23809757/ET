import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Icon } from '../shared/Icon';
import { cn } from '../../lib/utils';

interface DeleteConfirmModalProps {
  name: string;
  rowCount: number;
  entityType: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  name, 
  rowCount, 
  entityType, 
  onConfirm, 
  onClose 
}) => {
  const [typed, setTyped] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (typed !== name) return;
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
  };

  return (
    <Modal title={`Delete "${name}"?`} icon="ti-alert-triangle" onClose={onClose} width={450}>
      <div className="space-y-5">
        {/* Warning Box */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-3 rounded-xl bg-coral-500/10 border border-coral-500/30 flex items-start gap-3"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-coral-500/20 flex items-center justify-center">
            <Icon n="ti-alert-triangle" size={16} color="#F43F5E" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-coral-400">Warning: This action cannot be undone</p>
            <p className="text-xs text-white/50 mt-0.5">
              {entityType === 'table' && `This table "${name}"${rowCount > 0 ? ` contains ${rowCount} row${rowCount !== 1 ? 's' : ''}` : ''} and will be permanently deleted.`}
              {entityType === 'tab' && `This tab "${name}"${rowCount > 0 ? ` contains ${rowCount} row${rowCount !== 1 ? 's' : ''}` : ''} and will be permanently deleted.`}
              {!entityType && `This ${entityType} will be permanently deleted.`}
            </p>
          </div>
        </motion.div>

        {/* Confirmation Input */}
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
            Confirm deletion
          </label>
          <p className="text-sm text-white/70 mb-2">
            Type <strong className="text-coral-400 font-mono bg-white/5 px-1.5 py-0.5 rounded">{name}</strong> to confirm
          </p>
          <input
            value={typed}
            onChange={e => setTyped(e.target.value)}
            placeholder={`Type "${name}" here...`}
            className="w-full px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-coral-500/50 focus:ring-1 focus:ring-coral-500/30 transition-all font-mono"
            autoFocus
          />
        </div>

        {/* Progress indicator */}
        {typed.length > 0 && typed !== name && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-coral-400/70 flex items-center gap-1"
          >
            <Icon n="ti-alert-triangle" size={10} />
            The entered text doesn't match "{name}"
          </motion.p>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="red" 
          disabled={typed !== name || isLoading}
          onClick={handleConfirm}
          icon={<Icon n="ti-trash" size={13} />}
          loading={isLoading}
        >
          Delete {entityType}
        </Button>
      </div>
    </Modal>
  );
};