// src/components/shared/Modal.tsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Icon } from './Icon';
import { cn } from '../../lib/utils';

interface ModalProps {
  title: string;
  icon?: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number | string;
  showCloseButton?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  title, 
  icon, 
  onClose, 
  children, 
  width = 480,
  showCloseButton = true,
  className 
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: typeof width === 'number' ? `${width}px` : width }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'relative overflow-hidden rounded-2xl',
            'bg-white/5 backdrop-blur-xl border border-white/10',
            'shadow-2xl',
            className
          )}
        >
          {/* Top-edge shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-gold/50 to-transparent" />
          
          {/* Noise grain overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
              backgroundSize: '128px 128px'
            }}
          />

          {/* Header */}
          <div className="relative flex items-center justify-between px-5 py-3.5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              {icon && (
                <div className="w-7 h-7 rounded-lg bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
                  <Icon n={icon} size={16} color="#D4A84B" />
                </div>
              )}
              <h2 className="text-base font-semibold text-white/90">{title}</h2>
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-all duration-200"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          {/* Body */}
          <div className="relative px-5 py-5 max-h-[70vh] overflow-auto custom-scroll">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Modal;