import { useState, useEffect, useCallback } from 'react';
import { mergeService, MergedCell } from '../services/mergeService';

interface RowLike { id: string; }
interface FieldLike { id: string; }

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

  useEffect(() => {
    const loadMerges = async () => {
      setLoading(true);
      const mergesData = await mergeService.getMergesForTable(tableId);
      setMerges(mergesData);
      setLoading(false);
    };
    loadMerges();
  }, [tableId]);

  const isCellMerged = useCallback((rowId: string, colId: string): MergedCell | null => {
    return merges.find(m =>
      m.start_row_id === rowId && m.start_col_id === colId
    ) || null;
  }, [merges]);

  // FIXED: Properly detects cells that should be hidden (non-master cells in a merged range)
  const isCellHidden = useCallback((
    rowId: string,
    colId: string,
    rows: RowLike[],
    fields: FieldLike[]
  ): boolean => {
    const rowIds = rows.map(r => r.id);
    const fieldIds = fields.map(f => f.id);
    const currentRowIdx = rowIds.indexOf(rowId);
    const currentColIdx = fieldIds.indexOf(colId);

    if (currentRowIdx === -1 || currentColIdx === -1) return false;

    return merges.some(m => {
      const startRowIdx = rowIds.indexOf(m.start_row_id);
      const endRowIdx = rowIds.indexOf(m.end_row_id);
      const startColIdx = fieldIds.indexOf(m.start_col_id);
      const endColIdx = fieldIds.indexOf(m.end_col_id);

      if (startRowIdx === -1 || endRowIdx === -1 || startColIdx === -1 || endColIdx === -1) return false;

      const isInRowRange = currentRowIdx >= startRowIdx && currentRowIdx <= endRowIdx;
      const isInColRange = currentColIdx >= startColIdx && currentColIdx <= endColIdx;
      const isMasterCell = currentRowIdx === startRowIdx && currentColIdx === startColIdx;

      // Hide if within range but NOT the master cell
      return isInRowRange && isInColRange && !isMasterCell;
    });
  }, [merges]);

  const isRowHiddenByMerge = useCallback((
    rowId: string,
    rows: RowLike[],
    fields: FieldLike[]
  ): boolean => {
    return fields.some(f => isCellHidden(rowId, f.id, rows, fields));
  }, [isCellHidden]);

  const mergeCells = useCallback(async (
    startRowId: string,
    endRowId: string,
    startColId: string,
    endColId: string,
    mergedValue: string
  ) => {
    await mergeService.saveMerge(tableId, startRowId, endRowId, startColId, endColId, mergedValue);
    const mergesData = await mergeService.getMergesForTable(tableId);
    setMerges(mergesData);
  }, [tableId]);

  const unmergeCells = useCallback(async (mergeId: string) => {
    await mergeService.deleteMerge(mergeId);
    const mergesData = await mergeService.getMergesForTable(tableId);
    setMerges(mergesData);
  }, [tableId]);

  const clearAllMerges = useCallback(async () => {
    await mergeService.deleteAllMergesForTable(tableId);
    setMerges([]);
  }, [tableId]);

  const updateMergedValue = useCallback(async (mergeId: string, newValue: string) => {
    await mergeService.updateMergedValue(mergeId, newValue);
    const mergesData = await mergeService.getMergesForTable(tableId);
    setMerges(mergesData);
  }, [tableId]);

  const updateMergedValueByCell = useCallback(async (rowId: string, colId: string, newValue: string) => {
    await mergeService.updateMergedValueByCell(tableId, rowId, colId, newValue);
    const mergesData = await mergeService.getMergesForTable(tableId);
    setMerges(mergesData);
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
    isRowHiddenByMerge,
    mergeCells,
    unmergeCells,
    clearAllMerges,
    updateMergedValue,
    updateMergedValueByCell,
  };
}