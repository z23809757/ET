// src/components/shared/EmptyState.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from './Icon';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon: string;
  heading: string;
  sub: string;
  actions?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  heading, 
  sub, 
  actions 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center text-center py-16 px-6"
    >
      <div className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center mb-5">
        <Icon n={icon} size={26} color="#D4A84B" />
      </div>

      <h3 className="text-lg font-semibold text-white/90 mb-1.5">
        {heading}
      </h3>

      <p className="text-xs text-white/40 max-w-xs leading-relaxed mb-5">
        {sub}
      </p>

      {actions && (
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {actions}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;