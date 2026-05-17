export interface Field {
  id: string;
  name: string;
  type: 'Text' | 'Number' | 'Date' | 'Month' | 'Dropdown';
  currency?: 'USD' | 'INR' | 'None';
  isPrimary?: boolean;
  dropdownOptions?: Array<{ id: string; label: string }>;
}

export interface Table {
  id: string;
  name: string;
  type: 'Expense' | 'Income' | 'Transfer' | 'Loan' | 'None';
  fields: Field[];
}

export interface Tab {
  id: string;
  name: string;
  icon: string;
  tables: Table[];
}

export interface YearData {
  id: string;
  year: number;
  tabs: Tab[];
}

export interface Row {
  id: string;
  [key: string]: any;
}

export interface OverallRow {
  id: string;
  year: number;
  month: string;
  date: string;
  category: string;
  subcategory: string;
  type: string;
  amtUSD: number;
  amtINR: number;
  tabId: string;
  tableId: string;
}

export interface DashboardMetrics {
  income: string;
  expense: string;
  savings: string;
  loan: string;
}

export interface ChartData {
  bar: Array<{ month: string; income: number; expense: number }>;
  donut: Array<{ name: string; value: number }>;
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
  type: string;
  months: Record<string, number>;
  total: number;
}

export interface YearlyComparison {
  years: string[];
  rows: Array<{
    name: string;
    type: string;
    years: Record<string, number>;
  }>;
}

export interface UserSettings {
  exchangeRate: number;
  displayCurrency: 'USD' | 'INR';
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data: any;
  new_data: any;
  version: number;
  ip_address: string;
  user_agent: string;
  created_at: string;
}