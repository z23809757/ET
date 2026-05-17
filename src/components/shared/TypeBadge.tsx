import React from 'react';
import { TYPE_C, TYPE_ICON } from '../../lib/constants';
import { Icon } from './Icon';

interface TypeBadgeProps {
  type: string;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => {
  const c = TYPE_C[type as keyof typeof TYPE_C] || TYPE_C.None;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 500, background: c.bg, color: c.text, border: `0.5px solid ${c.border}` }}>
      <Icon n={TYPE_ICON[type as keyof typeof TYPE_ICON] || "ti-minus"} size={10} />{type || "None"}
    </span>
  );
};