import { useReducer, useCallback, useEffect, useMemo } from 'react';
import { financeService } from '../services/financeService';
import { FE } from '../lib/financeEngine';
import { Tab, Row, OverallRow, UserSettings, Table } from '../types/finance';
import toast from 'react-hot-toast';

interface ModalState {
  kind: string;
  yearId?: string;
  tabId?: string;
  table?: any;
}

interface DeleteTarget {
  type: 'table' | 'tab';
  tabId: string;
  tableId?: string;
  name: string;
  count: number;
}

interface State {
  years: Array<{ id: string; year: number }>;
  tabsByYear: Record<string, Tab[]>;
  rowsByTable: Record<string, Row[]>;
  globalTables: Table[];
  settings: UserSettings;
  activeYearId: string | null;
  activeYear: number | null;
  activeTabId: string | null;
  activeTableId: string | null;
  activeView: string;
  expandedYears: Record<string, boolean>;
  dashFilter: { from: string; to: string; quick: string };
  overallSubView: string;
  modal: ModalState | null;
  deleteTarget: DeleteTarget | null;
  loading: boolean;
  loaded: boolean;
}

const initialState: State = {
  years: [],
  tabsByYear: {},
  rowsByTable: {},
  globalTables: [],
  settings: { exchangeRate: 85.40, displayCurrency: 'USD' },
  activeYearId: null,
  activeYear: null,
  activeTabId: null,
  activeTableId: null,
  activeView: 'dashboard',
  expandedYears: {},
  dashFilter: { from: '', to: '', quick: 'all' },
  overallSubView: 'monthly',
  modal: null,
  deleteTarget: null,
  loading: false,
  loaded: false,
};

type Action =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'LOAD_DATA'; payload: Partial<State> }
  | { type: 'SET_GLOBAL_TABLES'; payload: Table[] }
  | { type: 'SET_SETTINGS'; settings: UserSettings }
  | { type: 'SET_YEARS'; years: State['years'] }
  | { type: 'SET_TABS'; yearId: string; tabs: Tab[] }
  | { type: 'SET_ROWS'; tableId: string; rows: Row[] }
  | { type: 'ADD_ROW'; tableId: string; row: Row }
  | { type: 'UPDATE_ROW'; tableId: string; rowId: string; rowData: any; oldRow?: Row }
  | { type: 'UPDATE_ROW_ROLLBACK'; tableId: string; rowId: string; oldRow: Row }
  | { type: 'DELETE_ROW'; tableId: string; rowId: string }
  | { type: 'DELETE_TABLE_ROWS'; tableId: string }
  | { type: 'SET_ACTIVE_YEAR'; yearId: string; year: number }
  | { type: 'SET_ACTIVE_TAB'; tabId: string | null }
  | { type: 'SET_ACTIVE_TABLE'; tableId: string | null }
  | { type: 'SET_ACTIVE_VIEW'; view: string }
  | { type: 'TOGGLE_YEAR_EXPANDED'; yearId: string }
  | { type: 'SET_DASH_FILTER'; patch: Partial<State['dashFilter']> }
  | { type: 'SET_OVERALL_SUB_VIEW'; sub: string }
  | { type: 'SET_MODAL'; modal: ModalState | null }
  | { type: 'SET_DELETE_TARGET'; target: DeleteTarget | null }
  | { type: 'SET_RATE'; rate: number }
  | { type: 'SET_DISPLAY_CURRENCY'; cur: 'USD' | 'INR' }
  | { type: 'UPDATE_TABLE_RATE'; tableId: string; rate: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'LOAD_DATA':
      return { ...state, ...action.payload, loaded: true, loading: false };
    case 'SET_GLOBAL_TABLES':
      return { ...state, globalTables: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: action.settings };
    case 'SET_YEARS':
      return { ...state, years: action.years };
    case 'SET_TABS':
      return { ...state, tabsByYear: { ...state.tabsByYear, [action.yearId]: action.tabs } };
    case 'SET_ROWS':
      return { ...state, rowsByTable: { ...state.rowsByTable, [action.tableId]: action.rows } };
    case 'ADD_ROW':
      return {
        ...state,
        rowsByTable: {
          ...state.rowsByTable,
          [action.tableId]: [...(state.rowsByTable[action.tableId] || []), action.row],
        },
      };
    case 'UPDATE_ROW':
      return {
        ...state,
        rowsByTable: {
          ...state.rowsByTable,
          [action.tableId]: (state.rowsByTable[action.tableId] || []).map(r =>
            r.id === action.rowId ? { ...r, ...action.rowData } : r
          ),
        },
      };
    case 'UPDATE_ROW_ROLLBACK':
      return {
        ...state,
        rowsByTable: {
          ...state.rowsByTable,
          [action.tableId]: (state.rowsByTable[action.tableId] || []).map(r =>
            r.id === action.rowId ? action.oldRow : r
          ),
        },
      };
    case 'DELETE_ROW':
      return {
        ...state,
        rowsByTable: {
          ...state.rowsByTable,
          [action.tableId]: (state.rowsByTable[action.tableId] || []).filter(r => r.id !== action.rowId),
        },
      };
    case 'DELETE_TABLE_ROWS':
      const newRows = { ...state.rowsByTable };
      delete newRows[action.tableId];
      return { ...state, rowsByTable: newRows };
    case 'SET_ACTIVE_YEAR':
      return { ...state, activeYearId: action.yearId, activeYear: action.year };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTabId: action.tabId };
    case 'SET_ACTIVE_TABLE':
      return { ...state, activeTableId: action.tableId };
    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.view };
    case 'TOGGLE_YEAR_EXPANDED':
      return { ...state, expandedYears: { ...state.expandedYears, [action.yearId]: !state.expandedYears[action.yearId] } };
    case 'SET_DASH_FILTER':
      return { ...state, dashFilter: { ...state.dashFilter, ...action.patch } };
    case 'SET_OVERALL_SUB_VIEW':
      return { ...state, overallSubView: action.sub };
    case 'SET_MODAL':
      return { ...state, modal: action.modal };
    case 'SET_DELETE_TARGET':
      return { ...state, deleteTarget: action.target };
    case 'SET_RATE':
      return { ...state, settings: { ...state.settings, exchangeRate: action.rate } };
    case 'SET_DISPLAY_CURRENCY':
      return { ...state, settings: { ...state.settings, displayCurrency: action.cur } };
    case 'UPDATE_TABLE_RATE':
      return {
        ...state,
        tabsByYear: Object.fromEntries(
          Object.entries(state.tabsByYear).map(([yearId, tabs]) => [
            yearId,
            tabs.map(tab => ({
              ...tab,
              tables: tab.tables.map(table =>
                table.id === action.tableId ? { ...table, hourly_rate: action.rate } : table
              ),
            })),
          ])
        ),
        globalTables: state.globalTables.map(table =>
          table.id === action.tableId ? { ...table, hourly_rate: action.rate } : table
        ),
      };
    default:
      return state;
  }
}

// Helper function to filter out reference/global tables from calculations
const filterNonReferenceTables = (tabs: Tab[]): Tab[] => {
  return tabs.map(tab => ({
    ...tab,
    tables: tab.tables.filter(table => !table.is_reference && !table.is_global)
  })).filter(tab => tab.tables.length > 0);
};

export function useFinanceStore() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const [years, settings, globalTables] = await Promise.all([
        financeService.fetchYears(),
        financeService.fetchSettings(),
        financeService.fetchGlobalTables(),
      ]);

      const tabsPromises = years.map(year => financeService.fetchFullYearData(year.id));
      const tabsResults = await Promise.all(tabsPromises);
      
      const tabsByYear: Record<string, Tab[]> = {};
      const allTableIds: string[] = [];
      
      years.forEach((year, index) => {
        const tabs = tabsResults[index];
        tabsByYear[year.id] = tabs;
        
        tabs.forEach(tab => {
          tab.tables.forEach(table => {
            allTableIds.push(table.id);
          });
        });
      });
      
      // IMPORTANT: Also add global table IDs to fetch their rows
      globalTables.forEach(table => {
        allTableIds.push(table.id);
      });
      
      // Fetch rows for ALL tables (regular AND global)
      const rowsPromises = allTableIds.map(id => financeService.fetchRows(id));
      const allRowsResults = await Promise.all(rowsPromises);
      
      const rowsByTable: Record<string, Row[]> = {};
      allTableIds.forEach((tableId, index) => {
        rowsByTable[tableId] = allRowsResults[index];
      });

      const activeYear = years[0] || null;
      const settingsData = settings || { exchangeRate: 85.40, displayCurrency: 'USD' };

      dispatch({
        type: 'LOAD_DATA',
        payload: {
          years,
          tabsByYear,
          rowsByTable,
          settings: settingsData,
          activeYearId: activeYear?.id || null,
          activeYear: activeYear?.year || null,
          expandedYears: activeYear ? { [activeYear.id]: true } : {},
        },
      });
      
      dispatch({ type: 'SET_GLOBAL_TABLES', payload: globalTables });
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateRate = useCallback(async (rate: number) => {
    dispatch({ type: 'SET_RATE', rate });
    const { settings: currentSettings } = state;
    await financeService.saveSettings({ 
      exchangeRate: rate, 
      displayCurrency: currentSettings.displayCurrency 
    });
    toast.success('Exchange rate updated');
  }, [state.settings.displayCurrency]);

  const updateDisplayCurrency = useCallback(async (cur: 'USD' | 'INR') => {
    dispatch({ type: 'SET_DISPLAY_CURRENCY', cur });
    const { settings: currentSettings } = state;
    await financeService.saveSettings({ 
      exchangeRate: currentSettings.exchangeRate, 
      displayCurrency: cur 
    });
  }, [state.settings.exchangeRate]);

  const createYear = useCallback(async (year: number, copyFromYearId?: string) => {
    const newYear = await financeService.createYear(year);
    const newYears = [...state.years, newYear].sort((a, b) => b.year - a.year);
    dispatch({ type: 'SET_YEARS', years: newYears });
    
    if (copyFromYearId) {
      await financeService.copyYearStructure(copyFromYearId, newYear.id);
      const tabs = await financeService.fetchFullYearData(newYear.id);
      dispatch({ type: 'SET_TABS', yearId: newYear.id, tabs });
    } else {
      dispatch({ type: 'SET_TABS', yearId: newYear.id, tabs: [] });
    }
    
    dispatch({ type: 'SET_ACTIVE_YEAR', yearId: newYear.id, year: newYear.year });
    dispatch({ type: 'TOGGLE_YEAR_EXPANDED', yearId: newYear.id });
    toast.success(`Year ${year} created`);
    return newYear;
  }, [state.years]);

  const createTab = useCallback(async (yearId: string, name: string, icon: string) => {
    try {
      const newTab = await financeService.createTab(yearId, name, icon);
      const currentTabs = state.tabsByYear[yearId] || [];
      dispatch({ type: 'SET_TABS', yearId, tabs: [...currentTabs, { ...newTab, tables: [] }] });
      toast.success(`Tab "${name}" created`);
      return newTab;
    } catch (error) {
      console.error('Failed to create tab:', error);
      toast.error('Failed to create tab');
      throw error;
    }
  }, [state.tabsByYear]);

  const createTable = useCallback(async (tabId: string, name: string, type: string, fields: any[], isReference: boolean = false) => {
    try {
      const newTable = await financeService.createTable(tabId, name, type, isReference);
      await financeService.saveFields(newTable.id, fields);
      
      const yearId = state.years.find(y => 
        state.tabsByYear[y.id]?.some(t => t.id === tabId)
      )?.id;
      
      if (yearId) {
        const tabs = await financeService.fetchFullYearData(yearId);
        dispatch({ type: 'SET_TABS', yearId, tabs });
      }
      
      toast.success(`Table "${name}" created`);
      return newTable;
    } catch (error) {
      console.error('Failed to create table:', error);
      toast.error('Failed to create table');
      throw error;
    }
  }, [state.years, state.tabsByYear]);

  const createGlobalTable = useCallback(async (name: string, fields: any[], type: string = 'None', includeInOverall: boolean = false) => {
    try {
      const newTable = await financeService.createGlobalTable(name, fields, type, includeInOverall);
      // Also fetch rows for this new global table (empty initially)
      const rows = await financeService.fetchRows(newTable.id);
      dispatch({ type: 'SET_ROWS', tableId: newTable.id, rows });
      const updatedGlobalTables = await financeService.fetchGlobalTables();
      dispatch({ type: 'SET_GLOBAL_TABLES', payload: updatedGlobalTables });
      toast.success(`Global table "${name}" created`);
      return newTable;
    } catch (error) {
      console.error('Failed to create global table:', error);
      toast.error('Failed to create global table');
      throw error;
    }
  }, []);

  const updateTable = useCallback(async (tabId: string | null, tableId: string, name: string, type: string, fields: any[], options: any = {}) => {
    const updates: any = { name, type };
    if (options.is_global) {
      updates.is_reference = true;
      updates.is_global = true;
      updates.include_in_overall = !!options.include_in_overall;
      updates.type = options.include_in_overall ? type : 'None';
    }

    await financeService.updateTable(tableId, updates);
    await financeService.saveFields(tableId, fields);
    
    const yearId = state.years.find(y => 
      state.tabsByYear[y.id]?.some(t => t.id === tabId)
    )?.id;
    
    if (yearId) {
      const tabs = await financeService.fetchFullYearData(yearId);
      dispatch({ type: 'SET_TABS', yearId, tabs });
    }

    if (options.is_global) {
      const updatedGlobalTables = await financeService.fetchGlobalTables();
      dispatch({ type: 'SET_GLOBAL_TABLES', payload: updatedGlobalTables });
    }
    
    toast.success(`Table "${name}" updated`);
  }, [state.years, state.tabsByYear]);

  const updateTableRate = useCallback(async (tableId: string, rate: number) => {
    await financeService.updateTable(tableId, { hourly_rate: rate });
    dispatch({ type: 'UPDATE_TABLE_RATE', tableId, rate });
    toast.success('Hourly rate updated');
  }, []);

  const addRow = useCallback(async (tableId: string, rowData: any) => {
    const newRow = await financeService.addRow(tableId, rowData);
    dispatch({ type: 'ADD_ROW', tableId, row: newRow });
    toast.success('Row added');
  }, []);

  const updateRow = useCallback(async (tableId: string, rowId: string, rowData: any) => {
    const currentRows = state.rowsByTable[tableId] || [];
    const oldRow = currentRows.find(r => r.id === rowId);
    
    dispatch({ type: 'UPDATE_ROW', tableId, rowId, rowData });
    
    try {
      await financeService.updateRow(rowId, rowData);
      toast.success('Row updated');
    } catch (error) {
      if (oldRow) {
        dispatch({ type: 'UPDATE_ROW_ROLLBACK', tableId, rowId, oldRow });
      }
      toast.error('Failed to update - changes reverted');
      console.error(error);
    }
  }, [state.rowsByTable]);

  const deleteRow = useCallback(async (tableId: string, rowId: string) => {
    const currentRows = state.rowsByTable[tableId] || [];
    const deletedRow = currentRows.find(r => r.id === rowId);
    
    dispatch({ type: 'DELETE_ROW', tableId, rowId });
    
    try {
      await financeService.deleteRow(rowId);
      toast.success('Row deleted');
    } catch (error) {
      if (deletedRow) {
        dispatch({ type: 'ADD_ROW', tableId, row: deletedRow });
      }
      toast.error('Failed to delete - please try again');
      console.error(error);
    }
  }, [state.rowsByTable]);

  const deleteTable = useCallback(async (tabId: string, tableId: string) => {
    await financeService.deleteTable(tableId);
    const yearId = state.years.find(y => 
      state.tabsByYear[y.id]?.some(t => t.id === tabId)
    )?.id;
    if (yearId) {
      const tabs = await financeService.fetchFullYearData(yearId);
      dispatch({ type: 'SET_TABS', yearId, tabs });
    }
    dispatch({ type: 'DELETE_TABLE_ROWS', tableId });
    if (state.activeTableId === tableId) {
      dispatch({ type: 'SET_ACTIVE_TABLE', tableId: null });
      dispatch({ type: 'SET_ACTIVE_VIEW', view: 'tab' });
    }
    toast.success('Table deleted');
  }, [state.years, state.tabsByYear, state.activeTableId]);

  const deleteTab = useCallback(async (tabId: string) => {
    const yearId = state.years.find(y => 
      state.tabsByYear[y.id]?.some(t => t.id === tabId)
    )?.id;
    await financeService.deleteTab(tabId);
    if (yearId) {
      const tabs = await financeService.fetchFullYearData(yearId);
      dispatch({ type: 'SET_TABS', yearId, tabs });
    }
    if (state.activeTabId === tabId) {
      dispatch({ type: 'SET_ACTIVE_TAB', tabId: null });
      dispatch({ type: 'SET_ACTIVE_VIEW', view: 'dashboard' });
    }
    toast.success('Tab deleted');
  }, [state.years, state.tabsByYear, state.activeTabId]);

  // Filter out reference/global tables from calculations
  const overallRows = useMemo(() => {
    if (!state.activeYearId) return [];
    const tabs = state.tabsByYear[state.activeYearId] || [];
    const filteredTabs = filterNonReferenceTables(tabs);
    const base = FE.aggregateOverall(filteredTabs, state.rowsByTable, state.settings.exchangeRate, state.activeYear || 0);
    const globalRows = FE.aggregateGlobalTablesForYear(state.globalTables, state.rowsByTable, state.settings.exchangeRate, state.activeYear || 0);
    return [...base, ...globalRows].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [state.activeYearId, state.tabsByYear, state.rowsByTable, state.settings.exchangeRate, state.activeYear, state.globalTables]);

  const allYearsRows = useMemo(() => {
    const out: Record<string, OverallRow[]> = {};
    for (const year of state.years) {
      const tabs = state.tabsByYear[year.id] || [];
      const filteredTabs = filterNonReferenceTables(tabs);
      const base = FE.aggregateOverall(filteredTabs, state.rowsByTable, state.settings.exchangeRate, year.year);
      const globalRows = FE.aggregateGlobalTablesForYear(state.globalTables, state.rowsByTable, state.settings.exchangeRate, year.year);
      out[year.year] = [...base, ...globalRows].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    }
    return out;
  }, [state.years, state.tabsByYear, state.rowsByTable, state.settings.exchangeRate, state.globalTables]);

  return {
    state,
    dispatch,
    loadData,
    updateRate,
    updateDisplayCurrency,
    createYear,
    createTab,
    createTable,
    createGlobalTable,
    updateTable,
    updateTableRate,
    addRow,
    updateRow,
    deleteRow,
    deleteTable,
    deleteTab,
    overallRows,
    allYearsRows,
  };
}