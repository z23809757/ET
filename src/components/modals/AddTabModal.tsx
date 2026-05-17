import React, { useState } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Icon } from '../shared/Icon';
import { TABLER_ICONS } from '../../lib/constants';

interface AddTabModalProps {
  onSave: (name: string, icon: string) => void;
  onClose: () => void;
}

export const AddTabModal: React.FC<AddTabModalProps> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('ti-receipt');

  return (
    <Modal title="Add new tab" icon="ti-folder-plus" onClose={onClose} width={380}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Tab name</div>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Expenses"
          style={{ width: '100%', padding: '6px 9px', fontSize: 12, border: '0.5px solid var(--color-border-secondary)', borderRadius: 8, background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', outline: 'none' }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Icon</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10,1fr)', gap: 4 }}>
          {TABLER_ICONS.map(ic => (
            <div
              key={ic}
              onClick={() => setIcon(ic)}
              style={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6,
                border: `0.5px solid ${icon === ic ? '#B5D4F4' : 'var(--color-border-tertiary)'}`,
                background: icon === ic ? '#E6F1FB' : 'var(--color-background-secondary)',
                cursor: 'pointer',
              }}
            >
              <Icon n={ic} size={16} color={icon === ic ? '#185FA5' : 'var(--color-text-secondary)'} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16, paddingTop: 14, borderTop: '0.5px solid var(--color-border-tertiary)' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="blue" disabled={!name.trim()} onClick={() => onSave(name.trim(), icon)}>
          <Icon n="ti-check" size={13} />Create tab
        </Button>
      </div>
    </Modal>
  );
};