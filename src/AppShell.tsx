import React from 'react';
import { Sidebar } from './components/shared/Sidebar';
import { Topbar } from './components/shared/Topbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { OverallView } from './components/overall/OverallView';
import { TableView } from './components/table/TableView';
import { EmptyState } from './components/shared/EmptyState';
import { AddYearModal, AddTabModal, TableModal, DeleteConfirmModal } from './components/modals';
import { useFinanceStore } from './hooks/useFinanceStore';
import { S, TYPE_C, TYPE_ICON } from './lib/constants';
import { Icon } from './components/shared/Icon';
import { Button } from './components/shared/Button';
import { exportService } from './services/exportService';
import { FE } from './lib/financeEngine';
import { formatUSD, formatINR } from './lib/formatters';
import toast from 'react-hot-toast';

export const AppShell: React.FC = () => {
  const {
    state,
    dispatch,
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
  } = state;

  const currentTabs = activeYearId ? tabsByYear[activeYearId] || [] : [];
  const currentTab = currentTabs.find(t => t.id === activeTabId);
  const currentTable = currentTab?.tables?.find(t => t.id === activeTableId);
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
    }
  };

  const handleBackupExport = () => {
    const backup = {
      years,
      tabsByYear,
      rowsByTable,
      settings,
      exportDate: new Date().toISOString(),
      version: '3.1.0',
    };
    exportService.exportBackup(backup);
    toast.success('Backup exported');
  };

  if (!loaded || loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={S.app}>
      <Sidebar
        years={years}
        tabsByYear={tabsByYear}
        rowsByTable={rowsByTable}
        activeYearId={activeYearId}
        activeTabId={activeTabId}
        activeView={activeView}
        expandedYears={expandedYears}
        onNavigate={(view, yearId, tabId, tableId) => {
          const year = years.find(y => y.id === yearId);
          dispatch({ type: 'SET_ACTIVE_YEAR', yearId: yearId || '', year: year?.year || 0 });
          dispatch({ type: 'SET_ACTIVE_TAB', tabId: tabId || null });
          dispatch({ type: 'SET_ACTIVE_TABLE', tableId: tableId || null });
          dispatch({ type: 'SET_ACTIVE_VIEW', view });
        }}
        onToggleYear={(yearId) => dispatch({ type: 'TOGGLE_YEAR_EXPANDED', yearId })}
        onAddYear={() => dispatch({ type: 'SET_MODAL', modal: { kind: 'addYear' } })}
        onAddTab={(yearId) => dispatch({ type: 'SET_MODAL', modal: { kind: 'addTab', yearId } })}
        onDeleteTab={(tabId, name, count) => dispatch({ type: 'SET_DELETE_TARGET', target: { type: 'tab', tabId, name, count } })}
        onDeleteTable={(tabId, tableId, name, count) => dispatch({ type: 'SET_DELETE_TARGET', target: { type: 'table', tabId, tableId, name, count } })}
      />

      <div style={S.main}>
        {activeView === 'dashboard' && (
          <>
            <Topbar
              rate={settings.exchangeRate}
              onRateUpdate={updateRate}
              left={<><Icon n="ti-layout-dashboard" size={15} color="var(--color-text-tertiary)" />Dashboard{activeYear ? ` — ${activeYear}` : ''}</>}
              right={
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="green" small onClick={handleExport}><Icon n="ti-file-spreadsheet" size={12} />Export</Button>
                  <Button variant="default" small onClick={handleBackupExport}><Icon n="ti-download" size={12} />Backup</Button>
                </div>
              }
            />
            <DashboardView
              overallRows={overallRowsData}
              settings={settings}
              dashFilter={dashFilter}
              onFilterChange={(patch) => dispatch({ type: 'SET_DASH_FILTER', patch })}
              onCurrencyChange={(cur) => updateDisplayCurrency(cur)}
            />
          </>
        )}

        {activeView === 'overall' && (
          <>
            <Topbar
              rate={settings.exchangeRate}
              onRateUpdate={updateRate}
              left={<><Icon n="ti-table-alias" size={15} color="var(--color-text-tertiary)" />Overall — {activeYear}</>}
              right={<Button variant="green" small onClick={handleExport}><Icon n="ti-file-spreadsheet" size={12} />Export</Button>}
            />
            <OverallView
              overallRows={overallRowsData}
              allYearsRows={allYearsRowsData}
              settings={settings}
              subView={overallSubView}
              onSubViewChange={(sub) => dispatch({ type: 'SET_OVERALL_SUB_VIEW', sub })}
            />
          </>
        )}

        {activeView === 'tab' && currentTab && (
          <>
            <Topbar
              rate={settings.exchangeRate}
              onRateUpdate={updateRate}
              left={<><Icon n={currentTab.icon || 'ti-folder'} size={15} color="var(--color-text-tertiary)" />{currentTab.name} — {activeYear}</>}
              right={<Button variant="blue" small onClick={() => dispatch({ type: 'SET_MODAL', modal: { kind: 'addTable', tabId: currentTab.id } })}><Icon n="ti-plus" size={12} />Add table</Button>}
            />
            <div style={S.content}>
              {(!currentTab.tables || currentTab.tables.length === 0) ? (
                <EmptyState
                  icon="ti-layout-grid"
                  heading="No tables yet"
                  sub="Create your first table to start tracking data in this tab"
                  actions={[
                    <Button key="a" variant="blue" onClick={() => dispatch({ type: 'SET_MODAL', modal: { kind: 'addTable', tabId: currentTab.id } })}>
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
                  <div style={S.addCard} onClick={() => dispatch({ type: 'SET_MODAL', modal: { kind: 'addTable', tabId: currentTab.id } })}>
                    <Icon n="ti-plus" size={22} color="var(--color-text-tertiary)" />
                    <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Add new table</div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeView === 'table' && currentTable && (
          <>
            <Topbar
              rate={settings.exchangeRate}
              onRateUpdate={updateRate}
              left={<Crumb parts={[currentTab?.name || '', currentTable.name]} />}
              right={<Button variant="default" small onClick={handleExport}><Icon n="ti-download" size={12} />Export</Button>}
            />
            <TableView
              table={currentTable}
              rows={currentRows}
              settings={settings}
              onAddRow={(data) => addRow(currentTable.id, data)}
              onEditRow={(id, data) => updateRow(currentTable.id, id, data)}
              onDeleteRow={(id) => deleteRow(currentTable.id, id)}
            />
          </>
        )}
      </div>

      {/* Modals */}
      {modal?.kind === 'addYear' && (
        <AddYearModal
          existingYears={years.map(y => ({ id: y.id, year: y.year }))}
          onSave={(year, mode, copyFromYearId) => {
            createYear(year, mode === 'copy' ? copyFromYearId : undefined);
            dispatch({ type: 'SET_MODAL', modal: null });
          }}
          onClose={() => dispatch({ type: 'SET_MODAL', modal: null })}
        />
      )}
      {modal?.kind === 'addTab' && (
        <AddTabModal
          onSave={(name, icon) => createTab(modal.yearId, name, icon)}
          onClose={() => dispatch({ type: 'SET_MODAL', modal: null })}
        />
      )}
      {modal?.kind === 'addTable' && currentTab && (
        <TableModal
          onSave={(data) => createTable(modal.tabId, data.name, data.type, data.fields)}
          onClose={() => dispatch({ type: 'SET_MODAL', modal: null })}
        />
      )}
      {modal?.kind === 'editTable' && (
        <TableModal
          initial={modal.table}
          hasRows={(rowsByTable[modal.table?.id] || []).length > 0}
          onSave={(data) => {
            updateTable(modal.tabId, modal.table.id, data.name, data.type, data.fields);
            dispatch({ type: 'SET_MODAL', modal: null });
          }}
          onClose={() => dispatch({ type: 'SET_MODAL', modal: null })}
        />
      )}

      {/* Delete confirms */}
      {deleteTarget?.type === 'table' && (
  <DeleteConfirmModal
    name={deleteTarget.name}
    rowCount={deleteTarget.count}
    entityType="table"
    onConfirm={() => {
      deleteTable(deleteTarget.tabId, deleteTarget.tableId);
      dispatch({ type: 'SET_DELETE_TARGET', target: null });  // ADD THIS LINE
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
      dispatch({ type: 'SET_DELETE_TARGET', target: null });  // ADD THIS LINE
    }}
    onClose={() => dispatch({ type: 'SET_DELETE_TARGET', target: null })}
  />
)}
    </div>
  );
};

const Crumb: React.FC<{ parts: string[] }> = ({ parts }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
    {parts.map((p, i) => (
      <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {i > 0 && <Icon n="ti-chevron-right" size={11} color="var(--color-text-tertiary)" />}
        <span style={{ fontSize: i === parts.length - 1 ? 14 : 12, fontWeight: i === parts.length - 1 ? 500 : 400, color: i === parts.length - 1 ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}>{p}</span>
      </span>
    ))}
  </div>
);