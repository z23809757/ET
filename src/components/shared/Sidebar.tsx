import React from 'react';
import { S, TYPE_C, TYPE_ICON } from '../../lib/constants';
import { Icon } from './Icon';
import { formatUSD, formatINR } from '../../lib/formatters';

interface SidebarProps {
  years: Array<{ id: string; year: number }>;
  tabsByYear: Record<string, any[]>;
  rowsByTable: Record<string, any[]>;
  activeYearId: string | null;
  activeTabId: string | null;
  activeView: string;
  expandedYears: Record<string, boolean>;
  onNavigate: (view: string, yearId: string | null, tabId?: string | null, tableId?: string | null) => void;
  onToggleYear: (yearId: string) => void;
  onAddYear: () => void;
  onAddTab: (yearId: string) => void;
  onDeleteTab: (tabId: string, name: string, count: number) => void;
  onDeleteTable: (tabId: string, tableId: string, name: string, count: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  years,
  tabsByYear,
  rowsByTable,
  activeYearId,
  activeTabId,
  activeView,
  expandedYears,
  onNavigate,
  onToggleYear,
  onAddYear,
  onAddTab,
  onDeleteTab,
  onDeleteTable,
}) => {
  return (
    <div style={S.sidebar}>
      <div style={{ padding: "12px 14px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>
          <Icon n="ti-chart-pie-2" size={16} color="#185FA5" />Pavan's Finance
        </div>
        <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 1 }}>v3.1 · Full Audit Trail</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
        <div style={S.secLabel}>OVERVIEW</div>
        <div style={S.sbItem(activeView === "dashboard")} onClick={() => onNavigate("dashboard", activeYearId)}>
          <Icon n="ti-layout-dashboard" size={14} color={activeView === "dashboard" ? "#185FA5" : "var(--color-text-tertiary)"} />Dashboard
        </div>

        <div style={{ ...S.secLabel, marginTop: 6 }}>YEARS</div>

        {years.map(year => (
          <div key={year.id}>
            <div
              onClick={() => {
                onToggleYear(year.id);
                if (activeYearId !== year.id) onNavigate("dashboard", year.id);
              }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 14px", cursor: "pointer" }}
            >
              <span style={{ fontSize: 11, fontWeight: 500, color: activeYearId === year.id ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}>{year.year}</span>
              <Icon n={expandedYears[year.id] ? "ti-chevron-down" : "ti-chevron-right"} size={12} color="var(--color-text-tertiary)" />
            </div>

            {expandedYears[year.id] && (
              <>
                <div
                  style={{ ...S.sbSub(activeView === "overall" && activeYearId === year.id), color: activeView === "overall" && activeYearId === year.id ? "#633806" : "#854F0B" }}
                  onClick={() => onNavigate("overall", year.id)}
                >
                  <Icon n="ti-table-alias" size={13} color="#EF9F27" />Overall
                  <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 10, background: "#FAEEDA", color: "#633806", border: "0.5px solid #FAC775", marginLeft: 2 }}>auto</span>
                </div>

                {(tabsByYear[year.id] || []).map(tab => (
                  <div key={tab.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: 8 }}>
                    <div
                      style={{ ...S.sbSub(activeTabId === tab.id && activeView !== "overall" && activeYearId === year.id), flex: 1 }}
                      onClick={() => onNavigate("tab", year.id, tab.id)}
                    >
                      <Icon n={tab.icon || "ti-folder"} size={13} color={activeTabId === tab.id ? "#185FA5" : "var(--color-text-tertiary)"} />
                      {tab.name}
                    </div>
                    <Icon
                      n="ti-trash"
                      size={12}
                      color="var(--color-text-tertiary)"
                      style={{ cursor: "pointer", opacity: 0.5 }}
                      onClick={e => {
                        e.stopPropagation();
                        const count = (tab.tables || []).reduce((s: number, t: any) => s + (rowsByTable[t.id] || []).length, 0);
                        onDeleteTab(tab.id, tab.name, count);
                      }}
                    />
                  </div>
                ))}

                <div
                  onClick={() => onAddTab(year.id)}
                  style={{ display: "flex", alignItems: "center", gap: 5, margin: "4px 10px", padding: "4px 8px", border: "0.5px dashed var(--color-border-secondary)", borderRadius: 6, fontSize: 11, color: "var(--color-text-tertiary)", cursor: "pointer" }}
                >
                  <Icon n="ti-plus" size={12} />Add tab
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div
        onClick={onAddYear}
        style={{ display: "flex", alignItems: "center", gap: 6, margin: "8px 12px 10px", padding: "6px 10px", border: "0.5px dashed var(--color-border-secondary)", borderRadius: 8, fontSize: 11, color: "var(--color-text-tertiary)", cursor: "pointer" }}
      >
        <Icon n="ti-plus" size={12} />Add new year
      </div>
    </div>
  );
};