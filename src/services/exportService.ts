import * as XLSX from 'xlsx';
import { OverallRow, MonthlySummary, CategorySummary, YearlyComparison, Row, Table } from '../types/finance';
import { MONTHS } from '../lib/constants';

export const exportService = {
  exportDashboard(rows: OverallRow[], year: number) {
    const ws = XLSX.utils.json_to_sheet(
      rows.map(r => ({
        Year: r.year,
        Month: r.month,
        Category: r.category,
        Subcategory: r.subcategory,
        Type: r.type,
        USD: r.amtUSD.toFixed(2),
        INR: r.amtINR.toFixed(2),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dashboard');
    XLSX.writeFile(wb, `Dashboard_${year}.xlsx`);
  },

  exportOverall(monthly: MonthlySummary[], category: CategorySummary[], year: number) {
    const wb = XLSX.utils.book_new();
    
    const monthlyWs = XLSX.utils.json_to_sheet(
      monthly.map(r => ({
        Month: r.month,
        Income: r.income.toFixed(2),
        Expenses: r.expense.toFixed(2),
        Savings: r.savings.toFixed(2),
        BiggestCategory: r.biggestCat,
      }))
    );
    XLSX.utils.book_append_sheet(wb, monthlyWs, 'Monthly');
    
    const categoryWs = XLSX.utils.json_to_sheet(
      category.map(r => ({
        Category: r.name,
        Type: r.type,
        ...Object.fromEntries(MONTHS.map(m => [m, (r.months[m] || 0).toFixed(2)])),
        Total: r.total.toFixed(2),
      }))
    );
    XLSX.utils.book_append_sheet(wb, categoryWs, 'Category');
    
    XLSX.writeFile(wb, `Overall_${year}.xlsx`);
  },

  exportTable(rows: Row[], table: Table, year: number) {
    const ws = XLSX.utils.json_to_sheet(
      rows.map(r => {
        const o: any = {};
        table.fields.forEach(f => {
          o[f.name] = r[f.id] || '';
        });
        return o;
      })
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, table.name);
    XLSX.writeFile(wb, `${table.name}_${year}.xlsx`);
  },

  exportBackup(data: any) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  async restoreBackup(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },
};