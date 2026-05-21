import React from 'react';
import { motion } from 'framer-motion';

interface AnimeBackgroundProps {
  variant?: 'default' | 'dashboard' | 'allyears' | 'overall' | 'table' | 'global';
  children: React.ReactNode;
}

// Anime-inspired gradient backgrounds
const getBackgroundStyle = (variant: string) => {
  const gradients = {
    default: {
      background: `
        radial-gradient(ellipse at 20% 30%, rgba(212,168,75,0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 70%, rgba(6,182,212,0.08) 0%, transparent 50%),
        linear-gradient(135deg, #0B1120 0%, #111827 50%, #1E293B 100%)
      `,
    },
    dashboard: {
      // Luffy / Sun & Adventure theme
      background: `
        radial-gradient(circle at 10% 20%, rgba(212,168,75,0.15) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(16,185,129,0.1) 0%, transparent 45%),
        repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 8px),
        linear-gradient(135deg, #0B1120 0%, #0F172A 100%)
      `,
    },
    allyears: {
      // Nami / Maps & Navigation theme
      background: `
        radial-gradient(ellipse at 30% 40%, rgba(6,182,212,0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 60%, rgba(212,168,75,0.1) 0%, transparent 45%),
        repeating-linear-gradient(90deg, rgba(6,182,212,0.03) 0px, rgba(6,182,212,0.03) 1px, transparent 1px, transparent 20px),
        linear-gradient(135deg, #0B1120 0%, #111827 100%)
      `,
    },
    overall: {
      // Zoro / Swords & Strength theme
      background: `
        radial-gradient(ellipse at 25% 50%, rgba(16,185,129,0.12) 0%, transparent 55%),
        radial-gradient(ellipse at 75% 50%, rgba(244,63,94,0.08) 0%, transparent 50%),
        repeating-linear-gradient(135deg, rgba(16,185,129,0.02) 0px, rgba(16,185,129,0.02) 2px, transparent 2px, transparent 10px),
        linear-gradient(135deg, #0B1120 0%, #1A1F2E 100%)
      `,
    },
    table: {
      // Robin / Knowledge & History theme
      background: `
        radial-gradient(ellipse at 20% 80%, rgba(139,92,246,0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.08) 0%, transparent 45%),
        repeating-linear-gradient(0deg, rgba(139,92,246,0.02) 0px, rgba(139,92,246,0.02) 1px, transparent 1px, transparent 15px),
        linear-gradient(135deg, #0B1120 0%, #111827 100%)
      `,
    },
    global: {
      // Franky / Technology & Engineering theme
      background: `
        radial-gradient(ellipse at 15% 85%, rgba(244,63,94,0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 85% 15%, rgba(6,182,212,0.1) 0%, transparent 45%),
        repeating-linear-gradient(45deg, rgba(244,63,94,0.02) 0px, rgba(244,63,94,0.02) 1px, transparent 1px, transparent 12px),
        linear-gradient(135deg, #0B1120 0%, #1E1B2E 100%)
      `,
    },
  };

  return gradients[variant as keyof typeof gradients] || gradients.default;
};

// Floating particles animation (like Devil Fruit particles)
const FloatingParticles: React.FC = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: Math.random() * 8 + 5,
    color: ['#D4A84B', '#06B6D4', '#10B981', '#F43F5E', '#8B5CF6'][Math.floor(Math.random() * 5)],
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.left}%`,
            background: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
          animate={{
            y: ['0vh', '100vh'],
            opacity: [0, 0.6, 0],
            x: [0, (Math.random() - 0.5) * 100],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

// Anime-style wave decoration at bottom
const WaveDecoration: React.FC<{ color: string }> = ({ color }) => (
  <div className="absolute bottom-0 left-0 right-0 pointer-events-none opacity-20">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
      <path
        fill={color}
        fillOpacity="0.3"
        d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,69.3C960,64,1056,64,1152,69.3C1248,75,1344,85,1392,90.7L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
      />
    </svg>
  </div>
);

export const AnimeBackground: React.FC<AnimeBackgroundProps> = ({ 
  variant = 'default', 
  children 
}) => {
  const style = getBackgroundStyle(variant);
  
  // Get accent color for wave based on variant
  const getWaveColor = () => {
    switch (variant) {
      case 'dashboard': return '#D4A84B';
      case 'allyears': return '#06B6D4';
      case 'overall': return '#10B981';
      case 'table': return '#8B5CF6';
      case 'global': return '#F43F5E';
      default: return '#D4A84B';
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Main Background */}
      <div 
        className="absolute inset-0"
        style={style}
      />
      
      {/* Noise Texture for grain effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />
      
      {/* Anime-style grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Floating Particles */}
      <FloatingParticles />
      
      {/* Wave Decoration */}
      <WaveDecoration color={getWaveColor()} />
      
      {/* Subtle glow orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-accent-gold/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-accent-cyan/5 blur-3xl pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};