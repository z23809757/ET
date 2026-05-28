import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/shared/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { OverallView } from './components/overall/OverallView';
import { TableView } from './components/table/TableView';
import { EmptyState } from './components/shared/EmptyState';
import { AllYearsOverview } from './components/allyears/AllYearsOverview';
import { AddYearModal, AddTabModal, DeleteConfirmModal } from './components/modals';
import { TableModal } from './components/modals/TableModal';
import { useFinanceStore } from './hooks/useFinanceStore';
import { S, TYPE_C, TYPE_ICON } from './lib/constants';
import { Icon } from './components/shared/Icon';
import { Button } from './components/shared/Button';
import { exportService } from './services/exportService';
import { FE } from './lib/financeEngine';
import { formatUSD, formatINR } from './lib/formatters';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { AnimeBackground } from './components/ui/AnimeBackground';

export const AppShell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showGlobalTableModal, setShowGlobalTableModal] = useState(false);
  const [showRegularTableModal, setShowRegularTableModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const {
    state,
    dispatch,
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
  } = useFinanceStore();

  const {
    years,
    tabsByYear,
    rowsByTable,
    settings,
    activeYearId,
    activeYear,
    activeTabId,
    activeTableId,
    activeView,
    expandedYears,
    dashFilter,
    overallSubView,
    modal,
    deleteTarget,
    loading,
    loaded,
    globalTables,
  } = state;

  const currentTabs = activeYearId ? tabsByYear[activeYearId] || [] : [];
  const currentTab = currentTabs.find(t => t.id === activeTabId);
  
  let currentTable = null;
  if (activeTableId) {
    for (const yearId in tabsByYear) {
      for (const tab of tabsByYear[yearId]) {
        const found = tab.tables.find(t => t.id === activeTableId);
        if (found) {
          currentTable = found;
          break;
        }
      }
      if (currentTable) break;
    }
    if (!currentTable) {
      currentTable = globalTables.find(t => t.id === activeTableId);
    }
  }
  
  const currentRows = activeTableId ? rowsByTable[activeTableId] || [] : [];

  const overallRowsData = overallRows;
  const allYearsRowsData = allYearsRows;

  const handleExport = async () => {
    if (activeView === 'dashboard') {
      exportService.exportDashboard(overallRowsData, activeYear || 0);
    } else if (activeView === 'overall') {
      const monthly = FE.monthlySummary(overallRowsData);
      const category = FE.categorySummary(overallRowsData);
      exportService.exportOverall(monthly, category, activeYear || 0);
    } else if (activeView === 'table' && currentTable) {
      exportService.exportTable(currentRows, currentTable, activeYear || 0);
    } else if (activeView === 'allyears') {
      const allRows: any[] = [];
      for (const year in allYearsRowsData) {
        allRows.push(...allYearsRowsData[year].map(r => ({ ...r, year })));
      }
      const ws = XLSX.utils.json_to_sheet(allRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'All Years');
      XLSX.writeFile(wb, `All_Years_Data.xlsx`);
    }
  };

  const handleBackupExport = () => {
    const backup = {
      years,
      tabsByYear,
      rowsByTable,
      settings,
      exportDate: new Date().toISOString(),
      version: '4.0.0',
    };
    exportService.exportBackup(backup);
    toast.success('Backup exported');
  };

  const getBackgroundVariant = () => {
    switch (activeView) {
      case 'dashboard': return 'dashboard';
      case 'allyears': return 'allyears';
      case 'overall': return 'overall';
      case 'table': 
        return currentTable?.is_global ? 'global' : 'table';
      case 'tab': return 'default';
      default: return 'default';
    }
  };

  const handleNavigate = (view: string, yearId: string | null, tabId?: string | null, tableId?: string | null) => {
    const year = years.find(y => y.id === yearId);
    if (yearId) {
      dispatch({ type: 'SET_ACTIVE_YEAR', yearId, year: year?.year || 0 });
    }
    dispatch({ type: 'SET_ACTIVE_TAB', tabId: tabId || null });
    dispatch({ type: 'SET_ACTIVE_TABLE', tableId: tableId || null });
    dispatch({ type: 'SET_ACTIVE_VIEW', view });
    setSidebarOpen(false);
  };

  const handleToggleYear = (yearId: string) => {
    dispatch({ type: 'TOGGLE_YEAR_EXPANDED', yearId });
    const year = years.find(y => y.id === yearId);
    if (year) {
      dispatch({ type: 'SET_ACTIVE_YEAR', yearId, year: year.year });
    }
  };

  if (!loaded || loading) {
    return (
      <AnimeBackground variant="default">
        <div className="flex items-center justify-center h-screen">
          <div className="glass rounded-xl p-6 text-center">
            <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/60 text-sm">Loading your logbook...</p>
          </div>
        </div>
      </AnimeBackground>
    );
  }

  return (
    <AnimeBackground variant={getBackgroundVariant()}>
      <div className="flex h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <Sidebar
              years={years}
              tabsByYear={tabsByYear}
              rowsByTable={rowsByTable}
              globalTables={globalTables}
              activeYearId={activeYearId}
              activeTabId={activeTabId}
              activeTableId={activeTableId}
              activeView={activeView}
              expandedYears={expandedYears}
              isOpen={sidebarOpen}
              onNavigate={handleNavigate}
              onToggleYear={handleToggleYear}
              onAddYear={() => dispatch({ type: 'SET_MODAL', modal: { kind: 'addYear' } })}
              onAddTab={(yearId) => dispatch({ type: 'SET_MODAL', modal: { kind: 'addTab', yearId } })}
              onAddGlobalTable={() => setShowGlobalTableModal(true)}
              onDeleteTab={(tabId, name, count) => dispatch({ type: 'SET_DELETE_TARGET', target: { type: 'tab', tabId, name, count } })}
              onDeleteTable={(tabId, tableId, name, count) => dispatch({ type: 'SET_DELETE_TARGET', target: { type: 'table', tabId, tableId, name, count } })}
              onClose={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content - Responsive */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Responsive Topbar */}
          <div className="flex items-center justify-between px-2 md:px-4 py-2 bg-white/5 backdrop-blur-sm border-b border-white/10">
            <div className="flex items-center gap-1 md:gap-2 min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 md:p-2 rounded-lg text-white/60 hover:text-white/90 hover:bg-white/5 transition-all flex-shrink-0"
              >
                <Menu size={isMobile ? 18 : 20} />
              </button>
              <span className="text-sm md:text-base font-medium text-white/80 truncate">
                {activeView === 'dashboard' && 'Dashboard'}
                {activeView === 'allyears' && 'All Years'}
                {activeView === 'overall' && `Overall — ${activeYear}`}
                {activeView === 'tab' && currentTab?.name}
                {activeView === 'table' && currentTable?.name}
                {activeView === 'table' && currentTable?.is_global && (
                  <span className="text-xs text-accent-cyan ml-1">(Global)</span>
                )}
              </span>
            </div>
            
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              {activeView !== 'table' && activeView === 'tab' && currentTab && (
                <Button 
                  variant="blue" 
                  small 
                  onClick={() => setShowRegularTableModal(true)}
                  className="text-xs md:text-sm px-2 md:px-3"
                >
                  <Icon n="ti-plus" size={isMobile ? 10 : 12} />
                  <span className="hidden xs:inline">Add</span>
                </Button>
              )}
              
              {(activeView === 'dashboard' || activeView === 'overall' || activeView === 'allyears') && (
                <Button 
                  variant="green" 
                  small 
                  onClick={handleExport}
                  className="text-xs md:text-sm px-2 md:px-3"
                >
                  <Icon n="ti-file-spreadsheet" size={isMobile ? 10 : 12} />
                  <span className="hidden xs:inline">Export</span>
                </Button>
              )}
              
              <Button 
                variant="default" 
                small 
                onClick={handleBackupExport}
                className="text-xs md:text-sm px-2 md:px-3"
              >
                <Icon n="ti-download" size={isMobile ? 10 : 12} />
                <span className="hidden xs:inline">Backup</span>
              </Button>
              
              <RatePill rate={settings.exchangeRate} onRateUpdate={updateRate} />
            </div>
          </div>

          {/* Scrollable Content - Responsive padding */}
          <div className="flex-1 overflow-auto">
            {activeView === 'dashboard' && (
              <DashboardView
                overallRows={overallRowsData}
                allYearsRows={allYearsRowsData}
                settings={settings}
                dashFilter={dashFilter}
                onFilterChange={(patch) => dispatch({ type: 'SET_DASH_FILTER', patch })}
                onCurrencyChange={(cur) => updateDisplayCurrency(cur)}
                activeYear={activeYear}
              />
            )}

            {activeView === 'allyears' && (
              <AllYearsOverview
                allYearsRows={allYearsRowsData}
                settings={settings}
              />
            )}

            {activeView === 'overall' && (
              <OverallView
                overallRows={overallRowsData}
                allYearsRows={allYearsRowsData}
                settings={settings}
                subView={overallSubView}
                onSubViewChange={(sub) => dispatch({ type: 'SET_OVERALL_SUB_VIEW', sub })}
              />
            )}

            {activeView === 'tab' && currentTab && (
              <div className="p-2 md:p-4">
                {(!currentTab.tables || currentTab.tables.length === 0) ? (
                  <EmptyState
                    icon="ti-layout-grid"
                    heading="No tables yet"
                    sub="Create your first table to start tracking data in this tab"
                    actions={[
                      <Button key="a" variant="blue" onClick={() => setShowRegularTableModal(true)}>
                        <Icon n="ti-plus" size={13} />Create first table
                      </Button>
                    ]}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                    {currentTab.tables.map(tbl => {
                      const trows = rowsByTable[tbl.id] || [];
                      const summary = FE.tableSummary(trows, tbl.fields);
                      const tc = TYPE_C[tbl.type] || TYPE_C.None;
                      return (
                        <div key={tbl.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 md:p-4 hover:bg-white/10 transition-all cursor-pointer">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: tc.bg }}>
                              <Icon n={TYPE_ICON[tbl.type] || 'ti-table'} size={16} color={tc.text} />
                            </div>
                            <h3 className="font-medium text-white/90 text-sm md:text-base truncate flex-1">{tbl.name}</h3>
                          </div>
                          <p className="text-2xs md:text-xs text-white/50 mb-2">
                            {summary.count} entr{summary.count === 1 ? 'y' : 'ies'}
                            {summary.total != null && summary.total > 0 && (
                              <> · {summary.currency === 'INR' ? formatINR(summary.total) : formatUSD(summary.total)}</>
                            )}
                          </p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                            <button
                              onClick={() => {
                                dispatch({ type: 'SET_ACTIVE_TABLE', tableId: tbl.id });
                                dispatch({ type: 'SET_ACTIVE_VIEW', view: 'table' });
                                if (isMobile) setSidebarOpen(false);
                              }}
                              className="text-xs text-accent-cyan hover:text-accent-gold transition-colors"
                            >
                              View →
                            </button>
                            <div className="flex gap-2">
                              <button onClick={() => dispatch({ type: 'SET_MODAL', modal: { kind: 'editTable', tabId: currentTab.id, table: tbl } })}>
                                <Icon n="ti-edit" size={14} color="#06B6D4" />
                              </button>
                              <button onClick={() => dispatch({ type: 'SET_DELETE_TARGET', target: { type: 'table', tabId: currentTab.id, tableId: tbl.id, name: tbl.name, count: trows.length } })}>
                                <Icon n="ti-trash" size={14} color="#F43F5E" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div 
                      onClick={() => setShowRegularTableModal(true)}
                      className="border border-dashed border-white/20 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-all"
                    >
                      <Icon n="ti-plus" size={24} color="var(--color-text-tertiary)" />
                      <span className="text-xs text-white/50">Add new table</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeView === 'table' && currentTable && (
              <TableView
                table={currentTable}
                rows={currentRows}
                settings={settings}
                financeState={state}
                onAddRow={(data) => addRow(currentTable.id, data)}
                onEditRow={(id, data) => updateRow(currentTable.id, id, data)}
                onDeleteRow={(id) => deleteRow(currentTable.id, id)}
                onRateChange={(rate) => updateTableRate(currentTable.id, rate)}
              />
            )}
          </div>
        </div>

        {/* Modals */}
        {modal?.kind === 'addYear' && (
          <AddYearModal
            existingYears={years.map(y => ({ id: y.id, year: y.year }))}
            onSave={async (year, mode, copyFromYearId) => {
              await createYear(year, mode === 'copy' ? copyFromYearId : undefined);
              dispatch({ type: 'SET_MODAL', modal: null });
            }}
            onClose={() => dispatch({ type: 'SET_MODAL', modal: null })}
          />
        )}

        {showRegularTableModal && (
          <TableModal
            onClose={() => setShowRegularTableModal(false)}
            onSave={async (data) => {
              if (activeTabId) {
                await createTable(activeTabId, data.name, data.type, data.fields, false);
                setShowRegularTableModal(false);
                toast.success(`Table "${data.name}" created`);
              } else {
                toast.error('Please select a tab first');
              }
            }}
          />
        )}

        {modal?.kind === 'addTab' && (
          <AddTabModal
            onSave={async (name, icon) => {
              await createTab(modal.yearId, name, icon);
              dispatch({ type: 'SET_MODAL', modal: null });
            }}
            onClose={() => dispatch({ type: 'SET_MODAL', modal: null })}
          />
        )}

        {modal?.kind === 'addTable' && currentTab && (
          <TableModal
            onClose={() => dispatch({ type: 'SET_MODAL', modal: null })}
            onSave={async (data) => {
              await createTable(modal.tabId, data.name, data.type, data.fields, false);
              dispatch({ type: 'SET_MODAL', modal: null });
            }}
          />
        )}

        {modal?.kind === 'editTable' && (
          <TableModal
            initial={modal.table}
            hasRows={(rowsByTable[modal.table?.id] || []).length > 0}
            onSave={async (data) => {
              await updateTable(modal.tabId, modal.table.id, data.name, data.type, data.fields);
              dispatch({ type: 'SET_MODAL', modal: null });
            }}
            onClose={() => dispatch({ type: 'SET_MODAL', modal: null })}
          />
        )}

        {deleteTarget?.type === 'table' && (
          <DeleteConfirmModal
            name={deleteTarget.name}
            rowCount={deleteTarget.count}
            entityType="table"
            onConfirm={() => {
              deleteTable(deleteTarget.tabId, deleteTarget.tableId);
              dispatch({ type: 'SET_DELETE_TARGET', target: null });
            }}
            onClose={() => dispatch({ type: 'SET_DELETE_TARGET', target: null })}
          />
        )}

        {deleteTarget?.type === 'tab' && (
          <DeleteConfirmModal
            name={deleteTarget.name}
            rowCount={deleteTarget.count}
            entityType="tab"
            onConfirm={() => {
              deleteTab(deleteTarget.tabId);
              dispatch({ type: 'SET_DELETE_TARGET', target: null });
            }}
            onClose={() => dispatch({ type: 'SET_DELETE_TARGET', target: null })}
          />
        )}

        {showGlobalTableModal && (
          <TableModal
            isGlobal={true}
            onClose={() => setShowGlobalTableModal(false)}
            onSave={async (data) => {
              await createGlobalTable(data.name, data.fields, data.type, data.include_in_overall);
              setShowGlobalTableModal(false);
            }}
          />
        )}
      </div>
    </AnimeBackground>
  );
};

// RatePill component - Responsive version
const RatePill: React.FC<{ rate: number; onRateUpdate: (rate: number) => void }> = ({ rate, onRateUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(rate));
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const save = () => {
    const n = parseFloat(val);
    if (n > 0) onRateUpdate(n);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30">
        <span className="text-2xs md:text-xs text-accent-cyan">$1 =</span>
        <input
          autoFocus
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
          className="w-12 md:w-16 text-2xs md:text-xs bg-transparent text-white outline-none text-center"
        />
        <span className="text-2xs md:text-xs text-accent-cyan">₹</span>
        <button onClick={save} className="text-accent-cyan hover:text-accent-gold">
          <Icon n="ti-check" size={isMobile ? 12 : 14} />
        </button>
        <button onClick={() => setEditing(false)} className="text-white/40 hover:text-white/60">
          <Icon n="ti-x" size={isMobile ? 12 : 14} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setVal(String(rate)); setEditing(true); }}
      className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-2xs md:text-xs text-white/60 hover:text-white/80 transition-all"
    >
      <Icon n="ti-currency-dollar" size={isMobile ? 10 : 12} />
      <span>1 =</span>
      <Icon n="ti-currency-rupee" size={isMobile ? 10 : 12} />
      <span>{rate.toFixed(2)}</span>
      <Icon n="ti-pencil" size={isMobile ? 8 : 10} />
    </button>
  );
};