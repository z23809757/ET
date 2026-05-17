import React, { useState } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Icon } from '../shared/Icon';

interface AddYearModalProps {
  existingYears: Array<{ id: string; year: number }>;
  onSave: (year: number, mode: string, copyFromYearId?: string) => void;
  onClose: () => void;
}

export const AddYearModal: React.FC<AddYearModalProps> = ({ existingYears, onSave, onClose }) => {
  const [year, setYear] = useState(String(new Date().getFullYear() + 1));
  const [mode, setMode] = useState('fresh');
  const [copyFrom, setCopyFrom] = useState(existingYears[0]?.id || '');

  return (
    <Modal title="Add new year" icon="ti-calendar-plus" onClose={onClose} width={400}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Year</div>
        <input
          type="number"
          value={year}
          onChange={e => setYear(e.target.value)}
          placeholder="e.g. 2027"
          style={{ width: '100%', padding: '6px 9px', fontSize: 12, border: '0.5px solid var(--color-border-secondary)', borderRadius: 8, background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', outline: 'none' }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Start with</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            ['fresh', 'Start fresh', 'Empty — create your own tabs and tables'],
            ['copy', 'Copy structure from', 'Copies tabs, tables and field definitions — no data'],
          ].map(([v, label, sub]) => (
            <div
              key={v}
              onClick={() => setMode(v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                border: `0.5px solid ${mode === v ? '#B5D4F4' : 'var(--color-border-tertiary)'}`,
                borderRadius: 8,
                background: mode === v ? '#E6F1FB' : 'var(--color-background-primary)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  border: `1.5px solid ${mode === v ? '#185FA5' : 'var(--color-border-secondary)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {mode === v && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#185FA5' }} />}
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>
                  {label}
                  {v === 'copy' && existingYears.length > 0 && (
                    <select
                      value={copyFrom}
                      onChange={e => setCopyFrom(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      style={{
                        marginLeft: 6,
                        fontSize: 11,
                        border: '0.5px solid var(--color-border-secondary)',
                        borderRadius: 4,
                        background: 'var(--color-background-secondary)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {existingYears.map(y => (
                        <option key={y.id} value={y.id}>
                          {y.year}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16, paddingTop: 14, borderTop: '0.5px solid var(--color-border-tertiary)' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="blue"
          disabled={!year.trim()}
          onClick={() => onSave(parseInt(year), mode, mode === 'copy' ? copyFrom : undefined)}
        >
          <Icon n="ti-check" size={13} />Create year
        </Button>
      </div>
    </Modal>
  );
};