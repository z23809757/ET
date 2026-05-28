// src/lib/constants.ts - Complete version

// ─── Months and Field Types ────────────────────────────────────────────────
export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const FIELD_TYPES = ['Text', 'Number', 'Date', 'Day', 'Month', 'Dropdown', 'Formula', 'Start Time', 'End Time', 'Total Hours', 'Estimated Pay'];

// ─── Table Type Styles ─────────────────────────────────────────────────────
export const TYPE_C: Record<string, { bg: string; text: string; border: string }> = {
  Expense: { bg: "#FCEBEB", text: "#712B13", border: "#F7C1C1" },
  Income: { bg: "#F0F9E8", text: "#27500A", border: "#C0DD97" },
  Transfer: { bg: "#E6F1FB", text: "#0C447C", border: "#B5D4F4" },
  Loan: { bg: "#FAEEDA", text: "#633806", border: "#FAC775" },
  None: { bg: "#F1EFE8", text: "#5F5E5A", border: "#DCD9D0" },
};

export const TYPE_ICON: Record<string, string> = {
  Expense: "ti-trending-down",
  Income: "ti-trending-up",
  Transfer: "ti-repeat",
  Loan: "ti-credit-card",
  None: "ti-table",
};

// ─── Icon Lists for Modals ─────────────────────────────────────────────────
export const TABLER_ICONS = [
  "ti-folder",
  "ti-folder-plus",
  "ti-folder-open",
  "ti-database",
  "ti-table",
  "ti-chart-pie-2",
  "ti-chart-bar",
  "ti-chart-line",
  "ti-wallet",
  "ti-credit-card",
  "ti-cash",
  "ti-currency-dollar",
  "ti-currency-rupee",
  "ti-trending-up",
  "ti-trending-down",
  "ti-repeat",
  "ti-plus",
  "ti-minus",
  "ti-check",
  "ti-x",
  "ti-edit",
  "ti-trash",
  "ti-copy",
  "ti-download",
  "ti-upload",
  "ti-search",
  "ti-filter",
  "ti-settings",
  "ti-user",
  "ti-logout",
  "ti-menu",
  "ti-menu-2",
  "ti-chevron-left",
  "ti-chevron-right",
  "ti-chevron-up",
  "ti-chevron-down",
  "ti-calendar",
  "ti-clock",
  "ti-mail",
  "ti-lock",
  "ti-eye",
  "ti-eye-off",
];

// ─── Chart Colors ──────────────────────────────────────────────────────────
export const DONUT_COLORS = [
  "#10B981", "#F43F5E", "#06B6D4", "#D4A84B", "#8B5CF6",
  "#F59E0B", "#EF4444", "#3B82F6", "#EC4899", "#14B8A6",
];

export const CHART_COLORS = {
  income: "#10B981",
  expense: "#F43F5E",
  savings: "#06B6D4",
  loan: "#D4A84B",
};

export const BAR_COLORS = {
  positive: "#10B981",
  negative: "#F43F5E",
  neutral: "#D4A84B",
};

// ─── Complete S object (inline styles for backward compatibility) ─────────
export const S = {
  // Layout
  app: { display: 'flex', height: '100vh', overflow: 'hidden' },
  sidebar: { width: 260, background: 'var(--color-background-secondary)', borderRight: '0.5px solid var(--color-border-tertiary)', display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' },
  main: { flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' },
  
  // Topbar
  topbar: { padding: '8px 16px', background: 'var(--color-background-primary)', borderBottom: '0.5px solid var(--color-border-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  topLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  topRight: { display: 'flex', alignItems: 'center', gap: 8 },
  
  // Content
  content: { flex: 1, overflow: 'auto', padding: 16 },
  
  // Sidebar
  secLabel: { fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', color: 'var(--color-text-tertiary)', padding: '8px 14px 4px' },
  sbItem: (active: boolean) => ({ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', background: active ? 'rgba(24, 95, 165, 0.1)' : 'transparent', color: active ? '#185FA5' : 'var(--color-text-secondary)' }),
  sbSub: (active: boolean) => ({ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 14px 5px 28px', fontSize: 11, cursor: 'pointer', background: active ? 'rgba(24, 95, 165, 0.08)' : 'transparent', color: active ? '#185FA5' : 'var(--color-text-tertiary)' }),
  
  // Dashboard
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 },
  metricCard: { background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: 14 },
  card: { background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: 14, marginBottom: 16 },
  chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 },
  
  // Tables grid
  tablesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 },
  tableCard: { background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: 12, transition: 'all 0.2s' },
  addCard: { background: 'transparent', border: '1px dashed var(--color-border-secondary)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' },
  
  // Entry bar
  entryBar: { borderTop: '0.5px solid var(--color-border-tertiary)', padding: 12, background: 'var(--color-background-secondary)', display: 'flex', flexDirection: 'column' as const, gap: 8 },
  
  // Table styles
  th: { padding: '10px 8px', textAlign: 'left' as const, fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', borderBottom: '0.5px solid var(--color-border-tertiary)' },
  td: { padding: '10px 8px', fontSize: 12, borderBottom: '0.5px solid var(--color-border-tertiary)', color: 'var(--color-text-primary)' },
  tdMuted: { padding: '10px 8px', fontSize: 11, color: 'var(--color-text-tertiary)' },
  
  // Modal styles
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modalBox: (width?: number) => ({
    background: 'var(--color-background-primary)',
    borderRadius: 16,
    width: width || 500,
    maxWidth: '90vw',
    maxHeight: '85vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    border: '0.5px solid var(--color-border-tertiary)',
  }),
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '0.5px solid var(--color-border-tertiary)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  modalBody: {
    padding: '20px',
  },
  modalFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    padding: '12px 20px',
    borderTop: '0.5px solid var(--color-border-tertiary)',
  },
};