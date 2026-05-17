import React from 'react';
import { Icon } from './Icon';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'blue' | 'green' | 'red' | 'ghost';
  small?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'default', small, disabled, style = {} }) => {
  const variants = {
    default: { background: "var(--color-background-primary)", color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-secondary)" },
    blue: { background: "#185FA5", color: "#fff", border: "0.5px solid #185FA5" },
    green: { background: "#2D6A0A", color: "#fff", border: "0.5px solid #2D6A0A" },
    red: { background: "#A32D2D", color: "#fff", border: "0.5px solid #A32D2D" },
    ghost: { background: "transparent", color: "#185FA5", border: "none", padding: 0 },
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: small ? "4px 9px" : "6px 14px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "opacity .15s",
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
};