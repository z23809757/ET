import { CellReference } from '../types/formula';

// Generate stable internal ID for a cell
export function getCellInternalId(tableId: string, fieldId: string, rowId: string): string {
  return `CELL_${tableId}_${fieldId}_${rowId}`;
}

// Generate stable internal ID for a merged cell range
export function getMergedCellInternalId(mergeId: string): string {
  return `MERGED_${mergeId}`;
}

// Parse a user-facing formula and convert to internal representation
export function normalizeFormula(
  displayFormula: string,
  getReferenceInfo: (tableName: string, year: number, fieldName: string, rowId: string) => CellReference | null
): { internalFormula: string; dependsOn: string[] } {
  let internalFormula = displayFormula.startsWith('=') ? displayFormula.substring(1) : displayFormula;
  const dependsOn: string[] = [];
  
  // Find all user-facing references
  const referencePattern = /([A-Za-z0-9\s]+\(\d+\)![A-Za-z\s]+_[a-f0-9-]{36})/g;
  const matches = internalFormula.match(referencePattern) || [];
  
  for (const ref of matches) {
    const exclamationIndex = ref.indexOf('!');
    const underscoreIndex = ref.lastIndexOf('_');
    
    const tablePart = ref.substring(0, exclamationIndex);
    const fieldName = ref.substring(exclamationIndex + 1, underscoreIndex);
    const rowId = ref.substring(underscoreIndex + 1);
    
    const yearMatch = tablePart.match(/\((\d+)\)/);
    const year = yearMatch ? parseInt(yearMatch[1]) : null;
    const tableName = tablePart.replace(/\s*\(\d+\)$/, '').trim();
    
    if (year && tableName) {
      const refInfo = getReferenceInfo(tableName, year, fieldName, rowId);
      if (refInfo) {
        const internalId = getCellInternalId(refInfo.tableId, refInfo.fieldId, refInfo.rowId);
        internalFormula = internalFormula.replace(ref, internalId);
        dependsOn.push(internalId);
      }
    }
  }
  
  return {
    internalFormula,
    dependsOn
  };
}

// Convert internal formula back to user-facing display format
export function denormalizeFormula(
  internalFormula: string,
  getReferenceDisplay: (internalId: string) => string | null
): string {
  let displayFormula = internalFormula;
  
  // Find all internal cell references
  const internalPattern = /CELL_[a-f0-9-]+_[a-f0-9-]+_[a-f0-9-]+/g;
  const matches = displayFormula.match(internalPattern) || [];
  
  for (const match of matches) {
    const displayRef = getReferenceDisplay(match);
    if (displayRef) {
      displayFormula = displayFormula.replace(match, displayRef);
    }
  }
  
  return displayFormula.startsWith('=') ? displayFormula : `=${displayFormula}`;
}

// Get display string for a cell reference
export function getDisplayReference(tableName: string, year: number, fieldName: string, rowId: string): string {
  // Truncate UUID for display (first 8 chars)
  const shortId = rowId.substring(0, 8);
  return `${tableName} (${year})!${fieldName}_${shortId}`;
}