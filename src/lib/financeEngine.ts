// src/lib/financeEngine.ts
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
        const pf = (tbl.fields || []).find((f: any) => f.isPrimary && (f.type === "Number" || f.type === "Formula"));
        if (!pf) continue;
        const mf = (tbl.fields || []).find((f: any) => f.type === "Month" || f.type === "Date");
        for (const row of rowsByTable[tbl.id] || []) {
          let amount = row[pf.id];
          
          if (pf.type === "Formula" && row._formulaValues?.[pf.id]) {
            amount = row._formulaValues[pf.id];
          }
          
          const { usd, inr } = toUsdInr(amount, pf.currency, rate);
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
    if (!from && !to) return rows;
    
    return rows.filter(row => {
      if (!row.month) return false;
      if (from && row.month < from) return false;
      if (to && row.month > to) return false;
      return true;
    });
  },

dashboardMetrics(rows: OverallRow[], dispCur: string, rate: number): DashboardMetrics {
  let income = 0, expense = 0, loanINR = 0;
  for (const r of rows) {
    // Safely get amounts
    const amtUSD = (typeof r.amtUSD === 'number' && !isNaN(r.amtUSD)) ? r.amtUSD : 0;
    const amtINR = (typeof r.amtINR === 'number' && !isNaN(r.amtINR)) ? r.amtINR : 0;
    
    if (r.type === "Income") income += amtUSD;
    else if (r.type === "Expense") expense += amtUSD;
    else if (r.type === "Loan") loanINR += amtINR;
  }
  
  // Ensure rate is valid
  const safeRate = (rate && !isNaN(rate)) ? rate : 85.4;
  
  // Format based on display currency
  let incomeFormatted, expenseFormatted, savingsFormatted;
  
  if (dispCur === 'INR') {
    incomeFormatted = formatINR(income * safeRate);
    expenseFormatted = formatINR(expense * safeRate);
    savingsFormatted = formatINR((income - expense) * safeRate);
  } else {
    incomeFormatted = formatUSD(income);
    expenseFormatted = formatUSD(expense);
    savingsFormatted = formatUSD(income - expense);
  }
  
  return {
    income: incomeFormatted,
    expense: expenseFormatted,
    savings: savingsFormatted,
    loan: formatINR(loanINR),
  };
},

chartData(rows: OverallRow[]): ChartData {
  const mmap: Record<string, any> = {};
  const cmap: Record<string, number> = {};
  
  if (!rows || rows.length === 0) {
    return {
      bar: [],
      donut: [],
    };
  }
  
  for (const r of rows) {
    // Extract month name for better display
    let monthDisplay = r.month || "";
    if (monthDisplay && monthDisplay.length >= 7) {
      // Convert "2024-01" to "Jan"
      const monthNum = parseInt(monthDisplay.slice(5, 7));
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthDisplay = monthNames[monthNum - 1] || monthDisplay;
    }
    
    const k = r.month || "";
    if (k && !mmap[k]) {
      mmap[k] = { 
        name: monthDisplay, 
        income: 0, 
        expense: 0,
        month: k 
      };
    }
    if (r.type === "Income") {
      if (mmap[k]) mmap[k].income += r.amtUSD;
    }
    if (r.type === "Expense") {
      if (mmap[k]) mmap[k].expense += r.amtUSD;
      cmap[r.subcategory] = (cmap[r.subcategory] || 0) + r.amtUSD;
    }
  }
  
  let barData = Object.values(mmap);
  if (barData.length > 0) {
    barData = barData
      .sort((a, b) => (a.month || "").localeCompare(b.month || ""))
      .slice(-6);
  }
  
  let donutData = Object.entries(cmap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value: Math.round(value) }));
  
  if (donutData.length === 0) {
    donutData = [{ name: 'No Data', value: 1 }];
  }
  
  // If no bar data but we have transactions, create bar data from available months
  if (barData.length === 0 && rows.length > 0) {
    const monthSet = new Set<string>();
    for (const r of rows) {
      if (r.month) monthSet.add(r.month);
    }
    const sortedMonths = Array.from(monthSet).sort();
    barData = sortedMonths.slice(-6).map(month => {
      let monthDisplay = month;
      if (month.length >= 7) {
        const monthNum = parseInt(month.slice(5, 7));
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        monthDisplay = monthNames[monthNum - 1] || month;
      }
      let income = 0, expense = 0;
      for (const r of rows) {
        if (r.month === month) {
          if (r.type === "Income") income += r.amtUSD;
          if (r.type === "Expense") expense += r.amtUSD;
        }
      }
      return { name: monthDisplay, month, income, expense };
    });
  }
  
  return {
    bar: barData,
    donut: donutData,
  };
},

  monthlySummary(rows: OverallRow[]): MonthlySummary[] {
    if (!rows || rows.length === 0) return [];
    
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
<<<<<<< HEAD
      biggestCat: Object.entries(r.cats).sort((a, b) => b[1] - a[1])[0]?.[0] || "—",
=======
      biggestCat: Object.entries(r.cats as Record<string, number>).sort((a, b) => b[1] - a[1])[0]?.[0] || "—",
>>>>>>> eead2da (Small Changes)
    }));
  },

  categorySummary(rows: OverallRow[]): CategorySummary[] {
    if (!rows || rows.length === 0) return [];
    
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
    const years = Object.keys(allYearsRows || {}).sort();
    const catMap: Record<string, any> = {};
    for (const y of years) {
      for (const r of allYearsRows[y] || []) {
        if (!catMap[r.subcategory]) catMap[r.subcategory] = { name: r.subcategory, type: r.type, years: {} };
        catMap[r.subcategory].years[y] = (catMap[r.subcategory].years[y] || 0) + r.amtUSD;
      }
    }
    return { years, rows: Object.values(catMap) };
  },

  tableSummary(rows: any[], fields: Field[]) {
    if (!rows || !fields) return { count: 0, total: null, currency: null };
    const pf = fields?.find(f => f.isPrimary);
    if (!pf) return { count: rows.length, total: null, currency: null };
    const total = rows.reduce((s, r) => s + (parseFloat(r[pf.id]) || 0), 0);
    return { count: rows.length, total, currency: pf.currency };
  },
<<<<<<< HEAD
};
=======
};
>>>>>>> eead2da (Small Changes)
