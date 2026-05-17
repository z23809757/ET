export const S = {
  app: { display: "flex", height: "100vh", overflow: "hidden", fontFamily: "var(--font-sans)", background: "var(--color-background-tertiary)" },
  sidebar: { width: 204, minWidth: 204, background: "var(--color-background-primary)", borderRight: "0.5px solid var(--color-border-tertiary)", display: "flex", flexDirection: "column", overflow: "hidden" },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 },
  scroll: { flex: 1, overflowY: "auto" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 16px", background: "var(--color-background-primary)", borderBottom: "0.5px solid var(--color-border-tertiary)", gap: 10, flexWrap: "wrap" },
  topLeft: { display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)", minWidth: 0 },
  topRight: { display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" },
  content: { flex: 1, overflowY: "auto", padding: 16 },
  card: { background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: 14 },
  metricCard: { background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px 12px" },
  tableCard: { background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: 14 },
  addCard: { background: "var(--color-background-secondary)", border: "0.5px dashed var(--color-border-secondary)", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 140, cursor: "pointer" },
  label: { fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 4 },
  hint: { fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 5, display: "flex", alignItems: "center", gap: 4 },
  muted: { fontSize: 11, color: "var(--color-text-tertiary)" },
  secLabel: { padding: "6px 14px 3px", fontSize: 10, fontWeight: 500, color: "var(--color-text-tertiary)", letterSpacing: ".05em" },
  input: { width: "100%", padding: "6px 9px", fontSize: 12, border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, background: "var(--color-background-secondary)", color: "var(--color-text-primary)", outline: "none" },
  select: { width: "100%", padding: "5px 7px", fontSize: 11, border: "0.5px solid var(--color-border-secondary)", borderRadius: 6, background: "var(--color-background-secondary)", color: "var(--color-text-primary)" },
  th: { padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", whiteSpace: "nowrap" },
  td: { padding: "7px 12px", color: "var(--color-text-primary)", fontSize: 12, borderBottom: "0.5px solid var(--color-border-tertiary)" },
  tdMuted: { padding: "7px 12px", color: "var(--color-text-tertiary)", fontSize: 12, borderBottom: "0.5px solid var(--color-border-tertiary)" },
  tdTotal: { padding: "7px 12px", fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", background: "var(--color-background-secondary)" },
  sbItem: (active: boolean) => ({ display: "flex", alignItems: "center", gap: 7, padding: "6px 14px", fontSize: 12, cursor: "pointer", background: active ? "#E6F1FB" : "transparent", color: active ? "#0C447C" : "var(--color-text-secondary)", fontWeight: active ? 500 : 400 }),
  sbSub: (active: boolean) => ({ display: "flex", alignItems: "center", gap: 6, padding: "5px 14px 5px 24px", fontSize: 12, cursor: "pointer", background: active ? "#E6F1FB" : "transparent", color: active ? "#0C447C" : "var(--color-text-secondary)", fontWeight: active ? 500 : 400 }),
  divider: { height: "0.5px", background: "var(--color-border-tertiary)", margin: "12px 0" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalBox: (w = 480) => ({ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: 22, width: "100%", maxWidth: w, maxHeight: "90vh", overflowY: "auto" }),
  entryBar: { borderTop: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", padding: "10px 14px" },
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10, marginBottom: 14 },
  chartsGrid: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12, marginBottom: 14 },
  tablesGrid: { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 },
};

export const TYPE_C = {
  Expense: { bg: "#FAECE7", text: "#712B13", border: "#F5C4B3" },
  Income: { bg: "#EAF3DE", text: "#27500A", border: "#C0DD97" },
  Transfer: { bg: "#EEEDFE", text: "#3C3489", border: "#CECBF6" },
  Loan: { bg: "#FAEEDA", text: "#633806", border: "#FAC775" },
  None: { bg: "#F1EFE8", text: "#5F5E5A", border: "#D3D1C7" },
};

export const TYPE_ICON = {
  Expense: "ti-trending-down",
  Income: "ti-trending-up",
  Transfer: "ti-arrows-exchange",
  Loan: "ti-pig-money",
  None: "ti-minus",
};

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const TABLER_ICONS = ["ti-home", "ti-receipt", "ti-briefcase", "ti-building-store", "ti-calendar-stats", "ti-car", "ti-plane", "ti-arrows-exchange", "ti-pig-money", "ti-wallet", "ti-coin", "ti-chart-bar", "ti-users", "ti-school", "ti-bolt", "ti-bus", "ti-checklist", "ti-shopping-cart", "ti-heart", "ti-star"];
export const FIELD_TYPES = ["Text", "Number", "Date", "Month", "Dropdown"];
export const DONUT_COLORS = ["#378ADD", "#D85A30", "#1D9E75", "#EF9F27", "#7F77DD"];