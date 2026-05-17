import { OverallRow, DashboardMetrics, ChartData, MonthlySummary, CategorySummary, YearlyComparison, Field } from '../types/finance';
import { MONTHS } from './constants';
import { formatUSD, formatINR, toUsdInr } from './formatters';

export const FE = {
  aggregateOverall(
    tabs: any[],
    rowsByTable: Record<string, any[]>,
    rate: number,
    year: number
  ): OverallRow[] {
    const out: OverallRow[] = [];
    for (const tab of tabs) {
      for (const tbl of tab.tables || []) {
        if (!tbl.type || tbl.type === "None") continue;
        const pf = (tbl.fields || []).find((f: any) => f.isPrimary);
        if (!pf) continue;
        const mf = (tbl.fields || []).find((f: any) => f.type === "Month" || f.type === "Date");
        for (const row of rowsByTable[tbl.id] || []) {
          const { usd, inr } = toUsdInr(row[pf.id], pf.currency, rate);
          const rawMonth = mf ? (row[mf.id] || "") : "";
          out.push({
            id: row.id,
            year: year,
            month: rawMonth ? rawMonth.slice(0, 7) : "",
            date: rawMonth,
            category: tab.name,
            subcategory: tbl.name,
            type: tbl.type,
            amtUSD: usd,
            amtINR: inr,
            tabId: tab.id,
            tableId: tbl.id,
          });
        }
      }
    }
    return out.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  },

filterByDate(rows: OverallRow[], from: string, to: string): OverallRow[] {
  // If no filters, return all rows
  if (!from && !to) return rows;
  
  return rows.filter(row => {
    // Skip rows without month data
    if (!row.month) return false;
    
    // Filter by range
    if (from && row.month < from) return false;
    if (to && row.month > to) return false;
    
    return true;
  });
},

  dashboardMetrics(rows: OverallRow[], dispCur: string, rate: number): DashboardMetrics {
    let income = 0, expense = 0, loanINR = 0;
    for (const r of rows) {
      if (r.type === "Income") income += r.amtUSD;
      else if (r.type === "Expense") expense += r.amtUSD;
      else if (r.type === "Loan") loanINR += r.amtINR;
    }
    const fmt = (n: number) => dispCur === "INR" ? formatINR(n * rate) : formatUSD(n);
    return {
      income: fmt(income),
      expense: fmt(expense),
      savings: fmt(income - expense),
      loan: formatINR(loanINR),
    };
  },

  chartData(rows: OverallRow[]): ChartData {
    const mmap: Record<string, any> = {};
    const cmap: Record<string, number> = {};
    for (const r of rows) {
      const k = r.month || "?";
      if (!mmap[k]) mmap[k] = { month: k, income: 0, expense: 0 };
      if (r.type === "Income") mmap[k].income += r.amtUSD;
      if (r.type === "Expense") mmap[k].expense += r.amtUSD;
      if (r.type === "Expense") cmap[r.subcategory] = (cmap[r.subcategory] || 0) + r.amtUSD;
    }
    return {
      bar: Object.values(mmap).sort((a, b) => a.month.localeCompare(b.month)).slice(-6),
      donut: Object.entries(cmap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value })),
    };
  },

  monthlySummary(rows: OverallRow[]): MonthlySummary[] {
    const map: Record<string, any> = {};
    for (const r of rows) {
      const k = r.month || "Unknown";
      if (!map[k]) map[k] = { month: k, income: 0, expense: 0, cats: {} };
      if (r.type === "Income") map[k].income += r.amtUSD;
      if (r.type === "Expense") {
        map[k].expense += r.amtUSD;
        map[k].cats[r.subcategory] = (map[k].cats[r.subcategory] || 0) + r.amtUSD;
      }
    }
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).map(r => ({
      ...r,
      savings: r.income - r.expense,
      biggestCat: Object.entries(r.cats).sort((a, b) => b[1] - a[1])[0]?.[0] || "—",
    }));
  },

  categorySummary(rows: OverallRow[]): CategorySummary[] {
    const map: Record<string, any> = {};
    for (const r of rows) {
      if (!map[r.subcategory]) {
        map[r.subcategory] = { name: r.subcategory, type: r.type, months: {}, total: 0 };
      }
      const mo = r.month ? parseInt(r.month.slice(5, 7)) - 1 : -1;
      if (mo >= 0) map[r.subcategory].months[MONTHS[mo]] = (map[r.subcategory].months[MONTHS[mo]] || 0) + r.amtUSD;
      map[r.subcategory].total += r.amtUSD;
    }
    return Object.values(map).sort((a, b) => b.total - a.total);
  },

  yearlyComparison(allYearsRows: Record<string, OverallRow[]>): YearlyComparison {
    const years = Object.keys(allYearsRows).sort();
    const catMap: Record<string, any> = {};
    for (const y of years) {
      for (const r of allYearsRows[y]) {
        if (!catMap[r.subcategory]) catMap[r.subcategory] = { name: r.subcategory, type: r.type, years: {} };
        catMap[r.subcategory].years[y] = (catMap[r.subcategory].years[y] || 0) + r.amtUSD;
      }
    }
    return { years, rows: Object.values(catMap) };
  },

  tableSummary(rows: any[], fields: Field[]) {
    const pf = fields?.find(f => f.isPrimary);
    if (!pf) return { count: rows.length, total: null, currency: null };
    const total = rows.reduce((s, r) => s + (parseFloat(r[pf.id]) || 0), 0);
    return { count: rows.length, total, currency: pf.currency };
  },
};