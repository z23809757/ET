// src/components/charts/MiniDonut.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface MiniDonutProps {
  data: Array<{ name: string; value: number; color?: string }> | any[];
}

const DEFAULT_COLORS = [
  '#10B981', '#F43F5E', '#06B6D4', '#D4A84B', '#8B5CF6',
  '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#14B8A6'
];

export const MiniDonut: React.FC<MiniDonutProps> = ({ data }) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle empty or undefined data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white/30 text-sm">
        No expense data available
      </div>
    );
  }

  // Transform data - handles different property names
  const transformedData = data.map(item => ({
    name: item.name || item.category || item.label || 'Other',
    value: item.value || item.amount || item.total || 0,
  })).filter(item => item.value > 0);

  if (transformedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white/30 text-sm">
        No expense data available
      </div>
    );
  }

  const total = transformedData.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = -90;
  
  const segments = transformedData.map((item, idx) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    return {
      name: item.name,
      value: item.value,
      percentage,
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length]
    };
  });

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-32 h-32">
        {segments.map((segment, idx) => (
          <motion.path
            key={idx}
            d={segment.path}
            fill={segment.color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: animated ? 1 : 0, scale: animated ? 1 : 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1, type: 'spring' }}
          />
        ))}
        <circle cx="50" cy="50" r="25" fill="rgba(0,0,0,0.6)" />
        <text
          x="50"
          y="55"
          textAnchor="middle"
          fill="white"
          fontSize="16"
          fontWeight="bold"
          className="tabular-nums"
        >
          {Math.round(total)}
        </text>
        <text x="50" y="68" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="6">
          Total
        </text>
      </svg>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3">
        {segments.slice(0, 5).map((segment, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: segment.color }} />
            <span className="text-2xs text-white/50">{segment.name}</span>
          </div>
        ))}
        {segments.length > 5 && (
          <div className="flex items-center gap-1">
            <span className="text-2xs text-white/30">+{segments.length - 5} more</span>
          </div>
        )}
      </div>
    </div>
  );
};