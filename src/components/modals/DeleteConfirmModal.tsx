import React, { useState } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Icon } from '../shared/Icon';

interface DeleteConfirmModalProps {
  name: string;
  rowCount: number;
  entityType: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ name, rowCount, entityType, onConfirm, onClose }) => {
  const [typed, setTyped] = useState('');

  return (
    <Modal title={`Delete "${name}"?`} icon="ti-alert-triangle" onClose={onClose} width={400}>
      <div style={{ padding: '10px 12px', background: '#FCEBEB', borderRadius: 8, marginBottom: 14, fontSize: 12, color: '#791F1F', display: 'flex', gap: 8 }}>
        <Icon n="ti-alert-triangle" size={14} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>This {entityType}{rowCount > 0 ? ` has ${rowCount} row${rowCount !== 1 ? 's' : ''}` : ''} and cannot be undone.</span>
      </div>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
        Type <strong style={{ fontWeight: 500 }}>{name}</strong> to confirm
      </div>
      <input
        value={typed}
        onChange={e => setTyped(e.target.value)}
        placeholder={`Type "${name}"`}
        style={{ width: '100%', padding: '6px 9px', fontSize: 12, border: '0.5px solid var(--color-border-secondary)', borderRadius: 8, background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', outline: 'none' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16, paddingTop: 14, borderTop: '0.5px solid var(--color-border-tertiary)' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="red" disabled={typed !== name} onClick={onConfirm}>
          <Icon n="ti-trash" size={13} />Delete
        </Button>
      </div>
    </Modal>
  );
};