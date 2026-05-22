// src/components/shared/Button.tsx
import React from 'react';
<<<<<<< HEAD
import { Icon } from './Icon';
=======
>>>>>>> eead2da (Small Changes)
import { cn } from '../../lib/utils';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'blue' | 'green' | 'red' | 'ghost';
<<<<<<< HEAD
=======
  size?: 'sm' | 'md' | 'lg';
>>>>>>> eead2da (Small Changes)
  small?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  loading?: boolean;
<<<<<<< HEAD
=======
  icon?: React.ReactNode;
>>>>>>> eead2da (Small Changes)
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'default', 
<<<<<<< HEAD
=======
  size = 'md',
>>>>>>> eead2da (Small Changes)
  small, 
  disabled, 
  style = {},
  className,
<<<<<<< HEAD
  loading = false
}) => {
  // Size classes
  const sizeClasses = small 
    ? 'px-3 py-1.5 text-xs gap-1.5' 
    : 'px-4 py-2 text-sm gap-2';
=======
  loading = false,
  icon
}) => {
  const effectiveSize = small ? 'sm' : size;
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-2.5',
  }[effectiveSize];
>>>>>>> eead2da (Small Changes)
  
  // Variant classes with glass styling
  const variantClasses = {
    default: 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 hover:border-white/20',
    blue: 'bg-gradient-violet-blue hover:shadow-glow-violet text-white border-transparent',
    green: 'bg-gradient-emerald-cyan hover:shadow-glow-emerald text-white border-transparent',
    red: 'bg-gradient-coral-rose hover:shadow-glow-coral text-white border-transparent',
    ghost: 'hover:bg-white/5 text-white/50 hover:text-white/80 border-transparent',
  };

<<<<<<< HEAD
  // Icon color mapping
  const iconColor = {
    default: 'currentColor',
    blue: '#fff',
    green: '#fff',
    red: '#fff',
    ghost: 'currentColor',
  };

  // Handle loading state - wrap children with spinner
=======
>>>>>>> eead2da (Small Changes)
  const content = loading ? (
    <>
      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span>{children}</span>
    </>
  ) : (
<<<<<<< HEAD
    children
=======
    <>
      {icon}
      <span>{children}</span>
    </>
>>>>>>> eead2da (Small Changes)
  );

  return (
    <button
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:ring-offset-2 focus:ring-offset-navy-900',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses,
        variantClasses[variant],
        className
      )}
      style={style}
    >
      {/* Shimmer effect on hover for gradient buttons */}
      {(variant === 'blue' || variant === 'green' || variant === 'red') && (
        <span 
          className="absolute inset-0 rounded-lg overflow-hidden opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
            backgroundSize: '200% 100%',
          }}
        />
      )}
      
      {/* Content */}
      <span className="relative z-10 inline-flex items-center gap-1.5">
        {content}
      </span>
    </button>
  );
};

<<<<<<< HEAD
export default Button;
=======
export default Button;
>>>>>>> eead2da (Small Changes)
