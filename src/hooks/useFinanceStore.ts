import { useReducer, useCallback, useEffect, useMemo } from 'react';
import { financeService } from '../services/financeService';
import { FE } from '../lib/financeEngine';
import { Tab, Table, Row, OverallRow, UserSettings } from '../types/finance';
import toast from 'react-hot-toast';

const SCHEMA_VERSION = 4;

interface State {
  years: Array<{ id: string; year: number }>;
  tabsByYear: Record<string, Tab[]>;
  rowsByTable: Record<string, Row[]>;
  settings: UserSettings;
  activeYearId: string | null;
  activeYear: number | null;
  activeTabId: string | null;
  activeTableId: string | null;
  activeView: string;
  expandedYears: Record<string, boolean>;
  dashFilter: { from: string; to: string; quick: string };
  overallSubView: string;
  modal: any;
  deleteTarget: any;
  loading: boolean;
  loaded: boolean;
  schemaVersion: number;
}

const initialState: State = {
  years: [],
  tabsByYear: {},
  rowsByTable: {},
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
  schemaVersion: 0,
};

type Action =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'LOAD_DATA'; payload: Partial<State> }
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
  | { type: 'SET_MODAL'; modal: any }
  | { type: 'SET_DELETE_TARGET'; target: any }
  | { type: 'SET_RATE'; rate: number }
  | { type: 'SET_DISPLAY_CURRENCY'; cur: 'USD' | 'INR' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'LOAD_DATA':
      return { ...state, ...action.payload, loaded: true, loading: false };
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
    default:
      return state;
  }
}

export function useFinanceStore() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const storedVersion = localStorage.getItem('finance_schema_version');
      const currentVersion = storedVersion ? parseInt(storedVersion) : 0;
      
      const [years, settings] = await Promise.all([
        financeService.fetchYears(),
        financeService.fetchSettings(),
      ]);

      const tabsByYear: Record<string, Tab[]> = {};
      const rowsByTable: Record<string, Row[]> = {};

      await Promise.all(
        years.map(async (year) => {
          const tabs = await financeService.fetchFullYearData(year.id);
          tabsByYear[year.id] = tabs;
          
          await Promise.all(
            tabs.flatMap(tab =>
              tab.tables.map(async (table) => {
                const rows = await financeService.fetchRows(table.id);
                rowsByTable[table.id] = rows;
              })
            )
          );
        })
      );

      if (currentVersion < SCHEMA_VERSION) {
        localStorage.setItem('finance_schema_version', String(SCHEMA_VERSION));
      }

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
          schemaVersion: SCHEMA_VERSION,
        },
      });
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
    await financeService.saveSettings({ ...state.settings, exchangeRate: rate });
    toast.success('Exchange rate updated');
  }, [state.settings]);

  const updateDisplayCurrency = useCallback(async (cur: 'USD' | 'INR') => {
    dispatch({ type: 'SET_DISPLAY_CURRENCY', cur });
    await financeService.saveSettings({ ...state.settings, displayCurrency: cur });
  }, [state.settings]);

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
    const newTab = await financeService.createTab(yearId, name, icon);
    const currentTabs = state.tabsByYear[yearId] || [];
    dispatch({ type: 'SET_TABS', yearId, tabs: [...currentTabs, { ...newTab, tables: [] }] });
    toast.success(`Tab "${name}" created`);
    return newTab;
  }, [state.tabsByYear]);

  const createTable = useCallback(async (tabId: string, name: string, type: string, fields: any[]) => {
    const newTable = await financeService.createTable(tabId, name, type);
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
  }, [state.years, state.tabsByYear]);

  const updateTable = useCallback(async (tabId: string, tableId: string, name: string, type: string, fields: any[]) => {
    await financeService.updateTable(tableId, { name, type });
    await financeService.saveFields(tableId, fields);
    
    const yearId = state.years.find(y => 
      state.tabsByYear[y.id]?.some(t => t.id === tabId)
    )?.id;
    
    if (yearId) {
      const tabs = await financeService.fetchFullYearData(yearId);
      dispatch({ type: 'SET_TABS', yearId, tabs });
    }
    
    toast.success(`Table "${name}" updated`);
  }, [state.years, state.tabsByYear]);

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

  const overallRows = useMemo(() => {
    if (!state.activeYearId) return [];
    const tabs = state.tabsByYear[state.activeYearId] || [];
    return FE.aggregateOverall(tabs, state.rowsByTable, state.settings.exchangeRate, state.activeYear || 0);
  }, [state.activeYearId, state.tabsByYear, state.rowsByTable, state.settings.exchangeRate, state.activeYear]);

  const allYearsRows = useMemo(() => {
    const out: Record<string, OverallRow[]> = {};
    for (const year of state.years) {
      const tabs = state.tabsByYear[year.id] || [];
      out[year.year] = FE.aggregateOverall(tabs, state.rowsByTable, state.settings.exchangeRate, year.year);
    }
    return out;
  }, [state.years, state.tabsByYear, state.rowsByTable, state.settings.exchangeRate]);

  return {
    state,
    dispatch,
    loadData,
    updateRate,
    updateDisplayCurrency,
    createYear,
    createTab,
    createTable,
    updateTable,
    addRow,
    updateRow,
    deleteRow,
    deleteTable,
    deleteTab,
    overallRows,
    allYearsRows,
  };
}