import { CellReference, Formula } from '../../types/formula';

interface DependencyNode {
  formulaId: string;
  dependsOn: string[];
  dependents: string[];
}

export class DependencyTracker {
  private graph: Map<string, DependencyNode> = new Map();
  
  addFormula(formula: Formula) {
    const node: DependencyNode = {
      formulaId: formula.id,
      dependsOn: formula.dependsOn.map(ref => this.referenceToString(ref)),
      dependents: []
    };
    
    this.graph.set(formula.id, node);
    
    // Update dependents
    for (const depRef of node.dependsOn) {
      for (const [id, existingNode] of this.graph) {
        if (existingNode.dependsOn.includes(depRef)) {
          if (!node.dependents.includes(id)) {
            node.dependents.push(id);
          }
        }
      }
    }
  }
  
  removeFormula(formulaId: string) {
    this.graph.delete(formulaId);
  }
  
  getAffectedFormulas(changedReference: CellReference): string[] {
    const refString = this.referenceToString(changedReference);
    const affected: string[] = [];
    
    for (const [id, node] of this.graph) {
      if (node.dependsOn.includes(refString)) {
        affected.push(id);
        affected.push(...this.getDependents(id));
      }
    }
    
    return [...new Set(affected)];
  }
  
  private getDependents(formulaId: string): string[] {
    const dependents: string[] = [];
    const node = this.graph.get(formulaId);
    
    if (node) {
      for (const depId of node.dependents) {
        dependents.push(depId);
        dependents.push(...this.getDependents(depId));
      }
    }
    
    return dependents;
  }
  
  private referenceToString(ref: CellReference): string {
    if (ref.rowId) {
      return `${ref.tableName}!${ref.fieldName}_${ref.rowId}`;
    }
    return `${ref.tableName}!${ref.fieldName}`;
  }
  
  hasCircularDependency(formulaId: string, visited: Set<string> = new Set()): boolean {
    if (visited.has(formulaId)) {
      return true;
    }
    
    visited.add(formulaId);
    const node = this.graph.get(formulaId);
    
    if (node) {
      for (const depId of node.dependents) {
        if (this.hasCircularDependency(depId, new Set(visited))) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  getFormulaDependencies(formulaId: string): CellReference[] {
    const node = this.graph.get(formulaId);
    if (!node) return [];
    return node.dependsOn.map(refString => {
      const match = refString.match(/^(.+)\s\((\d+)\)!([^_]+)_(.+)$/);
      if (match) {
        return {
          tableId: '',
          tableName: match[1],
          fieldId: '',
          fieldName: match[3],
          rowId: match[4],
          isRange: false
        } as CellReference;
      }
      return {} as CellReference;
    });
  }
}

export const dependencyTracker = new DependencyTracker();