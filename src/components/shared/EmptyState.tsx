import React from 'react';
import { Icon } from './Icon';

interface EmptyStateProps {
  icon: string;
  heading: string;
  sub: string;
  actions?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, heading, sub, actions }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 12, textAlign: "center" }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon n={icon} size={26} color="var(--color-text-tertiary)" />
      </div>
      <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)" }}>{heading}</div>
      <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", maxWidth: 300 }}>{sub}</div>
      {actions && <div style={{ display: "flex", gap: 8, marginTop: 4 }}>{actions}</div>}
    </div>
  );
};