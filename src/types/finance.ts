export interface UserSettings {
  exchangeRate: number;
  displayCurrency: 'USD' | 'INR';
}

export interface Field {
  id: string;
  name: string;
  type: 'Text' | 'Number' | 'Date' | 'Month' | 'Dropdown' | 'Formula' | 'Start Time' | 'End Time' | 'Total Hours' | 'Estimated Pay';
  currency?: 'USD' | 'INR' | 'None';
  isPrimary?: boolean;
  dropdownOptions?: Array<{ id: string; label: string }>;
}

export interface Table {
  id: string;
  name: string;
  type: string | null;
  is_reference?: boolean;
  is_global?: boolean;
  include_in_overall?: boolean;
  hourly_rate?: number | null;
  tab_id?: string | null;
  fields: Field[];
}

export interface Tab {
  id: string;
  name: string;
  icon: string | null;
  tables: Table[];
}

export interface Row {
  id: string;
  [key: string]: any;
}

export interface OverallRow {
  id: string;
  year: number;
  month: string;
  date?: string;
  category: string;
  subcategory: string;
  type: 'Expense' | 'Income' | 'Transfer' | 'Loan';
  amtUSD: number;
  amtINR: number;
  categoryId?: string;
  tabId?: string;
  tableId?: string;
}

export interface DashboardMetrics {
  income: string;
  expense: string;
  savings: string;
  loan: string;
}

export interface ChartData {
  bar: Array<{
    name: string;
    income: number;
    expense: number;
    month?: string;
  }>;
  donut: Array<{
    name: string;
    value: number;
  }>;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  savings: number;
  biggestCat: string;
}

export interface CategorySummary {
  name: string;
  type: OverallRow['type'];
  months: Record<string, number>;
  total: number;
}

export interface YearlyComparison {
  years: string[];
  rows: Array<{
    name: string;
    type: OverallRow['type'];
    years: Record<string, number>;
  }>;
}