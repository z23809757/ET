import React, { useEffect, useState } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Icon } from '../shared/Icon';
import { formulaService } from '../../services/formulaService';
import { CellReference } from '../../types/formula';

interface DependencyViewerProps {
  formulaId: string;
  formulaText: string;
  onClose: () => void;
}

export const DependencyViewer: React.FC<DependencyViewerProps> = ({ formulaId, formulaText, onClose }) => {
  const [dependencies, setDependencies] = useState<CellReference[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadDependencies = async () => {
      const deps = await formulaService.getFormulaDependencies(formulaId);
      setDependencies(deps);
      setLoading(false);
    };
    loadDependencies();
  }, [formulaId]);
  
  return (
    <Modal title="Formula Dependencies" icon="ti-link" onClose={onClose} width={500}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
          Formula
        </div>
        <div style={{
          background: 'var(--color-background-secondary)',
          padding: 8,
          borderRadius: 6,
          fontFamily: 'monospace',
          fontSize: 12
        }}>
          {formulaText}
        </div>
      </div>
      
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', marginBottom: 8 }}>
        Depends on:
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>Loading...</div>
      ) : dependencies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-tertiary)' }}>
          No dependencies found
        </div>
      ) : (
        dependencies.map((dep, idx) => (
          <div key={idx} style={{
            padding: 8,
            borderBottom: '0.5px solid var(--color-border-tertiary)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <Icon n="ti-table" size={12} color="#185FA5" />
            <span style={{ fontSize: 12 }}>
              {dep.tableName}.{dep.fieldName}
              {dep.rowLabel && <span style={{ color: 'var(--color-text-tertiary)' }}> ({dep.rowLabel})</span>}
            </span>
          </div>
        ))
      )}
      
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: '0.5px solid var(--color-border-tertiary)', textAlign: 'right' }}>
        <Button onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};