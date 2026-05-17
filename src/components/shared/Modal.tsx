import React from 'react';
import { S } from '../../lib/constants';
import { Icon } from './Icon';

interface ModalProps {
  title: string;
  icon: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

export const Modal: React.FC<ModalProps> = ({ title, icon, onClose, children, width = 480 }) => {
  return (
    <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={S.modalBox(width)}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>
            <Icon n={icon} size={16} color="#185FA5" />{title}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-tertiary)", fontSize: 18, lineHeight: 1 }}>
            <Icon n="ti-x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};