import { useState, useEffect, useCallback } from 'react';
import { mergeService, MergedCell } from '../services/mergeService';

export function useMergeCells(tableId: string) {
  const [merges, setMerges] = useState<MergedCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState<'none' | 'merge' | 'unmerge'>('none');
  const [selectedRange, setSelectedRange] = useState<{
    startRowId: string;
    endRowId: string;
    startColId: string;
    endColId: string;
  } | null>(null);

  // Load merges from database
  useEffect(() => {
    const loadMerges = async () => {
      setLoading(true);
      const mergesData = await mergeService.getMergesForTable(tableId);
      setMerges(mergesData);
      setLoading(false);
    };
    loadMerges();
  }, [tableId]);

  // Check if a cell is merged (and returns the master cell if it is)
  const isCellMerged = useCallback((rowId: string, colId: string): MergedCell | null => {
    return merges.find(m => 
      m.start_row_id === rowId && m.start_col_id === colId
    ) || null;
  }, [merges]);

  // Check if a cell is hidden (part of a merged range but not the master)
  const isCellHidden = useCallback((rowId: string, colId: string): boolean => {
    return merges.some(m => {
      // Get row indices (simplified - assuming rows are in order)
      const isInRowRange = rowId >= m.start_row_id && rowId <= m.end_row_id;
      const isInColRange = colId >= m.start_col_id && colId <= m.end_col_id;
      const isNotMaster = !(rowId === m.start_row_id && colId === m.start_col_id);
      return isInRowRange && isInColRange && isNotMaster;
    });
  }, [merges]);

  // Get the master cell for a hidden cell
  const getMasterCell = useCallback((rowId: string, colId: string): MergedCell | null => {
    return merges.find(m => {
      const isInRowRange = rowId >= m.start_row_id && rowId <= m.end_row_id;
      const isInColRange = colId >= m.start_col_id && colId <= m.end_col_id;
      return isInRowRange && isInColRange;
    }) || null;
  }, [merges]);

  // Merge selected cells
  const mergeCells = useCallback(async (
    startRowId: string,
    endRowId: string,
    startColId: string,
    endColId: string,
    mergedValue: string
  ) => {
    await mergeService.saveMerge(tableId, startRowId, endRowId, startColId, endColId, mergedValue);
    // Reload merges
    const mergesData = await mergeService.getMergesForTable(tableId);
    setMerges(mergesData);
  }, [tableId]);

  // Unmerge cells
  const unmergeCells = useCallback(async (mergeId: string) => {
    await mergeService.deleteMerge(mergeId);
    const mergesData = await mergeService.getMergesForTable(tableId);
    setMerges(mergesData);
  }, [tableId]);

  // Clear all merges for table
  const clearAllMerges = useCallback(async () => {
    await mergeService.deleteAllMergesForTable(tableId);
    setMerges([]);
  }, [tableId]);

  return {
    merges,
    loading,
    selectionMode,
    setSelectionMode,
    selectedRange,
    setSelectedRange,
    isCellMerged,
    isCellHidden,
    getMasterCell,
    mergeCells,
    unmergeCells,
    clearAllMerges
  };
}