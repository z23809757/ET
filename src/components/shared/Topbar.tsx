import React, { useState } from 'react';
import { S } from '../../lib/constants';
import { Icon } from './Icon';
import { Button } from './Button';

interface TopbarProps {
  left: React.ReactNode;
  right?: React.ReactNode;
  rate: number;
  onRateUpdate: (rate: number) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ left, right, rate, onRateUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(rate));

  const save = () => {
    const n = parseFloat(val);
    if (n > 0) onRateUpdate(n);
    setEditing(false);
  };

  return (
    <div style={S.topbar}>
      <div style={S.topLeft}>{left}</div>
      <div style={S.topRight}>
        {right}
        {editing ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", border: "0.5px solid #B5D4F4", borderRadius: 8, background: "#E6F1FB" }}>
            <span style={{ fontSize: 11, color: "#0C447C" }}>$1 =</span>
            <input
              autoFocus
              value={val}
              onChange={e => setVal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
              style={{ width: 60, fontSize: 11, border: "none", background: "transparent", color: "#0C447C", outline: "none" }}
            />
            <span style={{ fontSize: 11, color: "#0C447C" }}>₹</span>
            <Icon n="ti-check" size={13} color="#185FA5" style={{ cursor: "pointer" }} onClick={save} />
            <Icon n="ti-x" size={13} color="var(--color-text-tertiary)" style={{ cursor: "pointer" }} onClick={() => setEditing(false)} />
          </div>
        ) : (
          <div
            onClick={() => { setVal(String(rate)); setEditing(true); }}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, background: "var(--color-background-secondary)", cursor: "pointer", fontSize: 11, color: "var(--color-text-secondary)" }}
          >
            <Icon n="ti-currency-dollar" size={12} />1 = <Icon n="ti-currency-rupee" size={12} />{rate.toFixed(2)}
            <Icon n="ti-pencil" size={11} color="var(--color-text-tertiary)" />
          </div>
        )}
      </div>
    </div>
  );
};