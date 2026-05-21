// src/components/shared/LoadingSkeleton.tsx
import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSkeletonProps {
  type?: 'page' | 'card' | 'table' | 'metric' | 'chart';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type = 'page', 
  count = 4,
  className 
}) => {
  // Metric cards skeleton
  if (type === 'metric') {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div 
            key={i} 
            className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-4 animate-pulse"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton h-8 w-8 rounded-lg" />
            </div>
            <div className="skeleton h-8 w-28 rounded mb-2" />
            <div className="skeleton h-2 w-16 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Chart skeleton (bar + donut)
  if (type === 'chart') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Bar Chart Skeleton */}
        <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-5 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="skeleton h-5 w-32 rounded" />
            <div className="flex gap-2">
              <div className="skeleton h-3 w-12 rounded" />
              <div className="skeleton h-3 w-12 rounded" />
            </div>
          </div>
          <div className="flex items-end gap-2 h-48">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1">
                <div 
                  className="skeleton w-full rounded-t-sm" 
                  style={{ height: `${20 + Math.random() * 40}px` }} 
                />
                <div 
                  className="skeleton w-full rounded-b-sm" 
                  style={{ height: `${10 + Math.random() * 30}px` }} 
                />
                <div className="skeleton h-3 w-6 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart Skeleton */}
        <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-5 animate-pulse">
          <div className="skeleton h-5 w-32 rounded mb-4" />
          <div className="flex flex-col items-center">
            <div className="skeleton h-32 w-32 rounded-full" />
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <div className="skeleton h-3 w-16 rounded" />
              <div className="skeleton h-3 w-16 rounded" />
              <div className="skeleton h-3 w-16 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Table skeleton
  if (type === 'table') {
    return (
      <div className={cn("rounded-xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden animate-pulse", className)}>
        <div className="p-4 border-b border-white/10">
          <div className="skeleton h-5 w-40 rounded" />
        </div>
        <div className="divide-y divide-white/5">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <div className="skeleton h-10 w-10 rounded-lg flex-shrink-0" />
              <div className="flex-1">
                <div className="skeleton h-4 w-32 rounded mb-2" />
                <div className="skeleton h-3 w-24 rounded" />
              </div>
              <div className="skeleton h-6 w-20 rounded flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Card skeleton (for table grid view)
  if (type === 'card') {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div 
            key={i} 
            className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-4 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="skeleton h-8 w-8 rounded-lg" />
              <div className="skeleton h-3 w-20 rounded" />
            </div>
            <div className="skeleton h-6 w-full rounded mb-2" />
            <div className="skeleton h-2 w-3/4 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Page skeleton (default - complete page layout)
  return (
    <div className={cn("p-4 space-y-6 animate-pulse", className)}>
      {/* Header skeleton */}
      <div className="relative overflow-hidden mb-4">
        <div className="skeleton h-8 w-48 rounded mb-2" />
        <div className="skeleton h-4 w-64 rounded" />
      </div>

      {/* Metric cards */}
      <LoadingSkeleton type="metric" count={4} />

      {/* Charts */}
      <LoadingSkeleton type="chart" />

      {/* Recent transactions table */}
      <LoadingSkeleton type="table" count={5} />
    </div>
  );
};

// Individual skeleton components for more granular control
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className }) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <div 
        key={i} 
        className="skeleton h-3 rounded animate-pulse" 
        style={{ width: `${90 - i * 15}%` }}
      />
    ))}
  </div>
);

export const SkeletonAvatar: React.FC<{ size?: number; className?: string }> = ({ size = 40, className }) => (
  <div 
    className={cn("skeleton rounded-full animate-pulse flex-shrink-0", className)} 
    style={{ width: size, height: size }} 
  />
);

export const SkeletonButton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("skeleton h-8 w-24 rounded-lg animate-pulse", className)} />
);

export default LoadingSkeleton;