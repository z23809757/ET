import React, { useState } from 'react';
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
import { Menu } from 'lucide-react';
import { AnimeBackground } from './components/ui/AnimeBackground';

export const AppShell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showGlobalTableModal, setShowGlobalTableModal] = useState(false);
  const [showRegularTableModal, setShowRegularTableModal] = useState(false);
  
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
  
  // Find current table - check both regular tables and global tables
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

  // Get background variant based on active view
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

  // Navigation handler - closes sidebar after navigation
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

  // Separate handler for year toggle (does NOT close sidebar)
  const handleToggleYear = (yearId: string) => {
    dispatch({ type: 'TOGGLE_YEAR_EXPANDED', yearId });
    // Also switch the active year so the dashboard context updates,
    // but do NOT close the sidebar
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

        <div style={{ ...S.main, marginLeft: 0 }} className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar with Menu Button */}
          <div style={S.topbar}>
            <div style={S.topLeft}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white/90 hover:bg-white/5 transition-all"
              >
                <Menu size={18} />
              </button>
              {activeView === 'dashboard' && (
                <><Icon n="ti-layout-dashboard" size={15} color="var(--color-text-tertiary)" />Dashboard</>
              )}
              {activeView === 'allyears' && (
                <><Icon n="ti-chart-bar" size={15} color="#1D9E75" />All Years Overview</>
              )}
              {activeView === 'overall' && (
                <><Icon n="ti-table-alias" size={15} color="var(--color-text-tertiary)" />Overall — {activeYear}</>
              )}
              {activeView === 'tab' && currentTab && (
                <><Icon n={currentTab.icon || 'ti-folder'} size={15} color="var(--color-text-tertiary)" />{currentTab.name} — {activeYear}</>
              )}
              {activeView === 'table' && currentTable && (
                <><Icon n={currentTable.is_global ? "ti-database" : "ti-table"} size={15} color="var(--color-text-tertiary)" />{currentTable.name} {currentTable.is_global && <span style={{ fontSize: 11, marginLeft: 6, color: '#185FA5' }}>(Global)</span>}</>
              )}
            </div>
            <div style={S.topRight}>
              {activeView !== 'table' && (
                <>
                  {activeView === 'dashboard' && (
                    <Button variant="green" small onClick={handleExport}><Icon n="ti-file-spreadsheet" size={12} />Export</Button>
                  )}
                  {activeView === 'allyears' && (
                    <Button variant="green" small onClick={handleExport}><Icon n="ti-file-spreadsheet" size={12} />Export All</Button>
                  )}
                  {activeView === 'overall' && (
                    <Button variant="green" small onClick={handleExport}><Icon n="ti-file-spreadsheet" size={12} />Export</Button>
                  )}
                  {activeView === 'tab' && currentTab && (
                    <Button variant="blue" small onClick={() => setShowRegularTableModal(true)}>
                      <Icon n="ti-plus" size={12} />Add table
                    </Button>
                  )}
                </>
              )}
              {activeView === 'table' && currentTable && (
                <Button variant="default" small onClick={handleExport}><Icon n="ti-download" size={12} />Export</Button>
              )}
              <Button variant="default" small onClick={handleBackupExport}><Icon n="ti-download" size={12} />Backup</Button>
              <RatePill rate={settings.exchangeRate} onRateUpdate={updateRate} />
            </div>
          </div>

          {/* Rest of the content */}
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
              <div style={S.content}>
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
                  <div style={S.tablesGrid}>
                    {currentTab.tables.map(tbl => {
                      const trows = rowsByTable[tbl.id] || [];
                      const summary = FE.tableSummary(trows, tbl.fields);
                      const tc = TYPE_C[tbl.type] || TYPE_C.None;
                      return (
                        <div key={tbl.id} style={S.tableCard}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                            <Icon n={TYPE_ICON[tbl.type] || 'ti-table'} size={16} color={tc.text} />
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 3 }}>{tbl.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 7 }}>
                            {summary.count} entr{summary.count === 1 ? 'y' : 'ies'}
                            {summary.total != null && summary.total > 0 && <> · {summary.currency === 'INR' ? formatINR(summary.total) : formatUSD(summary.total)}</>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                            <span
                              onClick={() => {
                                dispatch({ type: 'SET_ACTIVE_TABLE', tableId: tbl.id });
                                dispatch({ type: 'SET_ACTIVE_VIEW', view: 'table' });
                                setSidebarOpen(false);
                              }}
                              style={{ fontSize: 11, color: '#185FA5', cursor: 'pointer' }}
                            >
                              View table →
                            </span>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <Icon n="ti-edit" size={13} color="#185FA5" style={{ cursor: 'pointer' }} onClick={() => dispatch({ type: 'SET_MODAL', modal: { kind: 'editTable', tabId: currentTab.id, table: tbl } })} />
                              <Icon n="ti-trash" size={13} color="#D85A30" style={{ cursor: 'pointer' }} onClick={() => dispatch({ type: 'SET_DELETE_TARGET', target: { type: 'table', tabId: currentTab.id, tableId: tbl.id, name: tbl.name, count: trows.length } })} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div style={S.addCard} onClick={() => setShowRegularTableModal(true)}>
                      <Icon n="ti-plus" size={22} color="var(--color-text-tertiary)" />
                      <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Add new table</div>
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
                onAddRow={(data) => addRow(currentTable.id, data)}
                onEditRow={(id, data) => updateRow(currentTable.id, id, data)}
                onDeleteRow={(id) => deleteRow(currentTable.id, id)}
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
              await createGlobalTable(data.name, data.fields);
              setShowGlobalTableModal(false);
            }}
          />
        )}
      </div>
    </AnimeBackground>
  );
};

// RatePill component
const RatePill: React.FC<{ rate: number; onRateUpdate: (rate: number) => void }> = ({ rate, onRateUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(rate));

  const save = () => {
    const n = parseFloat(val);
    if (n > 0) onRateUpdate(n);
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", border: "0.5px solid #B5D4F4", borderRadius: 8, background: "#E6F1FB" }}>
        <span style={{ fontSize: 11, color: "#0C447C" }}>$1 =</span>
        <input
          autoFocus
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
          style={{ width: 60, fontSize: 11, border: "none", background: "transparent", color: "#0C447C", outline: "none" }}
        />
        <span style={{ fontSize: 11, color: "#0C447C" }}>₹</span>
        <Icon n="ti-check" size={13} color="#185FA5" style={{ cursor: "pointer" }} onClick={save} />
        <Icon n="ti-x" size={13} color="var(--color-text-tertiary)" style={{ cursor: "pointer" }} onClick={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div
      onClick={() => { setVal(String(rate)); setEditing(true); }}
      style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, background: "var(--color-background-secondary)", cursor: "pointer", fontSize: 11, color: "var(--color-text-secondary)" }}
    >
      <Icon n="ti-currency-dollar" size={12} />1 = <Icon n="ti-currency-rupee" size={12} />{rate.toFixed(2)}
      <Icon n="ti-pencil" size={11} color="var(--color-text-tertiary)" />
    </div>
  );
};