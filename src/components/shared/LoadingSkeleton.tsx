import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, background: 'var(--color-background-secondary)', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ height: 10, background: 'var(--color-border-secondary)', borderRadius: 4, marginBottom: 8, width: '60%' }} />
            <div style={{ height: 18, background: 'var(--color-border-secondary)', borderRadius: 4, width: '40%' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1.4, background: 'var(--color-background-primary)', borderRadius: 10, padding: 14, height: 200 }}>
          <div style={{ height: 12, background: 'var(--color-border-secondary)', borderRadius: 4, width: '40%', marginBottom: 16 }} />
          <div style={{ display: 'flex', gap: 6, height: 100, alignItems: 'flex-end' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ flex: 1, height: `${40 + Math.random() * 40}px`, background: 'var(--color-border-secondary)', borderRadius: 4 }} />
            ))}
          </div>
        </div>
        <div style={{ flex: 1, background: 'var(--color-background-primary)', borderRadius: 10, padding: 14, height: 200 }}>
          <div style={{ height: 12, background: 'var(--color-border-secondary)', borderRadius: 4, width: '40%', marginBottom: 16 }} />
          <div style={{ width: 76, height: 76, background: 'var(--color-border-secondary)', borderRadius: '50%', margin: '0 auto' }} />
        </div>
      </div>
    </div>
  );
};