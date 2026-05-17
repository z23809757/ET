import React, { useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Icon } from '../shared/Icon';
import { useAuditLog } from '../../hooks/useAuditLog';
import { format } from 'date-fns';

interface RowHistoryModalProps {
  rowId: string;
  onClose: () => void;
  onRestore: () => void;
}

export const RowHistoryModal: React.FC<RowHistoryModalProps> = ({ rowId, onClose, onRestore }) => {
  const { history, loading, loadRowHistory, restoreVersion } = useAuditLog();

  useEffect(() => {
    loadRowHistory(rowId);
  }, [rowId]);

  const handleRestore = async (version: number) => {
    const success = await restoreVersion(rowId, version);
    if (success) {
      onRestore();
      onClose();
    }
  };

  return (
    <Modal title="Row History" icon="ti-history" onClose={onClose} width={600}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading history...</div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-tertiary)' }}>
          No history available
        </div>
      ) : (
        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
          {history.map((log, index) => (
            <div
              key={log.id}
              style={{
                padding: 12,
                borderBottom: '0.5px solid var(--color-border-tertiary)',
                background: index === 0 ? '#F0F9E8' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon 
                    n={log.action === 'INSERT' ? 'ti-plus' : log.action === 'UPDATE' ? 'ti-edit' : 'ti-trash'} 
                    size={14} 
                    color={log.action === 'INSERT' ? '#1D9E75' : log.action === 'UPDATE' ? '#185FA5' : '#D85A30'}
                  />
                  <span style={{ fontSize: 12, fontWeight: 500 }}>
                    Version {log.version} - {log.action}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                  {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
              {log.action !== 'DELETE' && index !== 0 && (
                <Button variant="ghost" small onClick={() => handleRestore(log.version)}>
                  <Icon n="ti-rotate-clockwise" size={12} /> Restore this version
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, paddingTop: 14, borderTop: '0.5px solid var(--color-border-tertiary)' }}>
        <Button onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};