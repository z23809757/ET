// src/components/shared/TypeBadge.tsx
import React from 'react';
import { TYPE_C, TYPE_ICON } from '../../lib/constants';
import { Icon } from './Icon';
import { cn } from '../../lib/utils';

interface TypeBadgeProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

// Enhanced color config with glow effects
const typeGlowConfig: Record<string, { glow: string; hoverGlow: string }> = {
  Income: { glow: 'shadow-glow-emerald', hoverGlow: 'hover:shadow-glow-emerald' },
  Expense: { glow: 'shadow-glow-coral', hoverGlow: 'hover:shadow-glow-coral' },
  Transfer: { glow: 'shadow-glow-cyan', hoverGlow: 'hover:shadow-glow-cyan' },
  Loan: { glow: 'shadow-glow-gold', hoverGlow: 'hover:shadow-glow-gold' },
  None: { glow: '', hoverGlow: '' },
};

const sizeClasses = {
  sm: 'px-1.5 py-0.5 text-2xs gap-1',
  md: 'px-2 py-0.5 text-xs gap-1.5',
  lg: 'px-2.5 py-1 text-sm gap-2',
};

const iconSizes = {
  sm: 10,
  md: 11,
  lg: 13,
};

export const TypeBadge: React.FC<TypeBadgeProps> = ({ 
  type, 
  size = 'md', 
  showIcon = true,
  className 
}) => {
  const c = TYPE_C[type as keyof typeof TYPE_C] || TYPE_C.None;
  const glow = typeGlowConfig[type as keyof typeof typeGlowConfig] || typeGlowConfig.None;
  const iconSize = iconSizes[size];
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium transition-all duration-200',
        'backdrop-blur-sm',
        sizeClasses[size],
        glow.glow,
        glow.hoverGlow,
        className
      )}
      style={{
        background: c.bg,
        color: c.text,
        borderColor: c.border,
      }}
    >
      {showIcon && (
        <Icon 
          n={TYPE_ICON[type as keyof typeof TYPE_ICON] || "ti-minus"} 
          size={iconSize} 
          color="currentColor"
        />
      )}
      <span>{type || "None"}</span>
    </span>
  );
};

export default TypeBadge;