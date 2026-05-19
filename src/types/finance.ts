export interface UserSettings {
  exchangeRate: number;
  displayCurrency: 'USD' | 'INR';
}

export interface Field {
  id: string;
  name: string;
  type: 'Text' | 'Number' | 'Date' | 'Month' | 'Dropdown' | 'Formula';
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
  category: string;
  subcategory: string;
  type: 'Expense' | 'Income' | 'Transfer' | 'Loan';
  amtUSD: number;
  amtINR: number;
  categoryId?: string;
  tableId?: string;
}