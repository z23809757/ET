import React from 'react';
import { Button } from '../shared/Button';
import { Icon } from '../shared/Icon';

interface MergeToolbarProps {
  selectionMode: 'none' | 'merge' | 'unmerge';
  onMergeModeToggle: () => void;
  onUnmergeModeToggle: () => void;
  onClearAllMerges: () => void;
  hasSelection: boolean;
  onApplyMerge: () => void;
  onCancelSelection: () => void;
}

export const MergeToolbar: React.FC<MergeToolbarProps> = ({
  selectionMode,
  onMergeModeToggle,
  onUnmergeModeToggle,
  onClearAllMerges,
  hasSelection,
  onApplyMerge,
  onCancelSelection
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 12px',
      background: 'var(--color-background-secondary)',
      borderBottom: '0.5px solid var(--color-border-tertiary)',
      flexWrap: 'wrap'
    }}>
      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)' }}>
        <Icon n="ti-table" size={12} style={{ marginRight: 4 }} /> Cell Merge:
      </span>
      
      <Button
        variant={selectionMode === 'merge' ? 'blue' : 'default'}
        small
        onClick={onMergeModeToggle}
      >
        <Icon n="ti-merge-cells" size={12} /> Merge
      </Button>
      
      <Button
        variant={selectionMode === 'unmerge' ? 'blue' : 'default'}
        small
        onClick={onUnmergeModeToggle}
      >
        <Icon n="ti-split-cells" size={12} /> Unmerge
      </Button>
      
      <Button
        variant="ghost"
        small
        onClick={onClearAllMerges}
      >
        <Icon n="ti-trash" size={12} /> Clear All Merges
      </Button>

      {selectionMode !== 'none' && hasSelection && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginLeft: 'auto',
          paddingLeft: 12,
          borderLeft: '0.5px solid var(--color-border-tertiary)'
        }}>
          <span style={{ fontSize: 11, color: '#1D9E75' }}>
            <Icon n="ti-check" size={12} /> Cells selected
          </span>
          <Button variant="green" small onClick={onApplyMerge}>
            <Icon n="ti-check" size={12} /> Apply {selectionMode === 'merge' ? 'Merge' : 'Unmerge'}
          </Button>
          <Button variant="ghost" small onClick={onCancelSelection}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};