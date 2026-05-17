import { useState, useCallback } from 'react';
import { auditService } from '../services/auditService';
import { AuditLog } from '../types/finance';
import toast from 'react-hot-toast';

export function useAuditLog() {
  const [history, setHistory] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRowHistory = useCallback(async (rowId: string) => {
    setLoading(true);
    try {
      const logs = await auditService.getRowHistory(rowId);
      setHistory(logs);
    } catch (error) {
      console.error('Failed to load history:', error);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreVersion = useCallback(async (rowId: string, version: number) => {
    setLoading(true);
    try {
      const success = await auditService.restoreRowVersion(rowId, version);
      if (success) {
        toast.success(`Restored to version ${version}`);
        return true;
      } else {
        toast.error('Failed to restore');
        return false;
      }
    } catch (error) {
      console.error('Failed to restore:', error);
      toast.error('Failed to restore');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { history, loading, loadRowHistory, restoreVersion };
}