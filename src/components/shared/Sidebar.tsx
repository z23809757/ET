import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BarChart3, 
  Calendar, 
  Folder, 
  FolderPlus, 
  Database, 
  Trash2, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Compass,
  Anchor,
  Sparkles,
  Plus,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Table } from '../../types/finance';
import { cn } from '../../lib/utils';

interface SidebarProps {
  years: Array<{ id: string; year: number }>;
  tabsByYear: Record<string, any[]>;
  rowsByTable: Record<string, any[]>;
  globalTables?: Table[];
  activeYearId: string | null;
  activeTabId: string | null;
  activeTableId: string | null;
  activeView: string;
  expandedYears: Record<string, boolean>;
  isOpen: boolean;
  onNavigate: (view: string, yearId: string | null, tabId?: string | null, tableId?: string | null) => void;
  onToggleYear: (yearId: string) => void;
  onAddYear: () => void;
  onAddTab: (yearId: string) => void;
  onAddGlobalTable: () => void;
  onDeleteTab: (tabId: string, name: string, count: number) => void;
  onDeleteTable: (tabId: string, tableId: string, name: string, count: number) => void;
  onClose: () => void;
}

// Sidebar Navigation Item Component - Responsive
const SidebarNavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  sub?: boolean;
  badge?: string;
  onClick?: () => void;
  className?: string;
}> = ({ icon, label, active, sub, badge, onClick, className }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-2.5 transition-all duration-200 rounded-lg touch-manipulation",
      sub ? "pl-6 md:pl-8 pr-2 md:pr-3 py-2 md:py-1.5 text-xs" : "px-3 md:px-4 py-2.5 md:py-2 text-sm",
      active 
        ? "bg-gradient-gold-amber/10 text-accent-gold" 
        : "text-white/50 hover:text-white/80 hover:bg-white/5",
      className
    )}
  >
    <span className={cn("flex-shrink-0", active ? "text-accent-gold" : "text-white/40")}>
      {icon}
    </span>
    <span className="flex-1 text-left text-sm md:text-base">{label}</span>
    {badge && (
      <span className="text-2xs px-1.5 py-0.5 rounded-full bg-accent-cyan/20 text-accent-cyan">
        {badge}
      </span>
    )}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({
  years,
  tabsByYear,
  rowsByTable,
  globalTables = [],
  activeYearId,
  activeTabId,
  activeTableId,
  activeView,
  expandedYears,
  isOpen,
  onNavigate,
  onToggleYear,
  onAddYear,
  onAddTab,
  onAddGlobalTable,
  onDeleteTab,
  onDeleteTable,
  onClose,
}) => {
  const { signOut, user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    await signOut();
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Sailor';
  const appName = `${displayName}'s Logbook`;

  if (!isOpen) return null;

  return (
    <motion.aside
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed left-0 top-0 h-full w-full sm:w-80 md:w-72 z-50 flex flex-col overflow-hidden shadow-2xl"
      style={{
        background: 'rgba(17, 24, 39, 0.96)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Top Shimmer Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-gold/50 to-transparent" />

      {/* Header with Close Button - Responsive */}
      <div className="relative px-4 py-4 md:py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Compass size={isMobile ? 20 : 22} className="text-accent-gold" />
              <Anchor size={isMobile ? 10 : 12} className="absolute -bottom-1 -right-1 text-accent-cyan" />
            </div>
            <div>
              <span className="text-sm md:text-base font-semibold text-white/90">{appName}</span>
              <div className="flex items-center gap-1 mt-0.5">
                <Sparkles size={7} className="text-accent-gold" />
                <span className="text-2xs text-white/30 uppercase tracking-wider">Grand Line</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={handleLogout}
              className="p-2 md:p-1.5 rounded-lg text-white/40 hover:text-accent-coral hover:bg-white/5 transition-all touch-manipulation"
              title="Logout"
            >
              <LogOut size={isMobile ? 18 : 16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 md:p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-all touch-manipulation"
              title="Close sidebar"
            >
              {isMobile ? <X size={18} /> : <ChevronLeft size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-2 md:px-3 pb-4">
        {/* Overview Section */}
        <div className="mb-6">
          <div className="px-2 mb-2">
            <span className="text-2xs font-semibold uppercase tracking-wider text-white/30">Navigation</span>
          </div>
          
          <nav className="space-y-0.5">
            <SidebarNavItem
              icon={<LayoutDashboard size={isMobile ? 18 : 16} />}
              label="Dashboard"
              active={activeView === 'dashboard'}
              onClick={() => onNavigate('dashboard', activeYearId)}
            />
            <SidebarNavItem
              icon={<BarChart3 size={isMobile ? 18 : 16} />}
              label="All Years"
              active={activeView === 'allyears'}
              onClick={() => onNavigate('allyears', null)}
            />
          </nav>
        </div>

        {/* Years Section - Voyages */}
        <div className="mb-6">
          <div className="px-2 mb-2">
            <span className="text-2xs font-semibold uppercase tracking-wider text-white/30 flex items-center gap-1.5">
              <Anchor size={10} className="text-accent-cyan" />
              Voyages
            </span>
          </div>
          
          {years.map(year => (
            <div key={year.id} className="mb-1">
              <button
                onClick={() => {
                  onToggleYear(year.id);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 md:py-2 rounded-lg transition-all touch-manipulation",
                  activeYearId === year.id 
                    ? "bg-gradient-gold-amber/10 text-accent-gold" 
                    : "text-white/60 hover:text-white/80 hover:bg-white/5"
                )}
              >
                <span className="text-sm md:text-base font-medium">{year.year}</span>
                <ChevronRight 
                  size={isMobile ? 16 : 14} 
                  className={cn(
                    "transition-transform duration-200",
                    expandedYears[year.id] && "rotate-90"
                  )}
                />
              </button>

              <AnimatePresence>
                {expandedYears[year.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden ml-1 md:ml-2"
                  >
                    {/* Overall Button */}
                    <SidebarNavItem
                      icon={<Calendar size={isMobile ? 16 : 14} />}
                      label="Overall"
                      sub
                      active={activeView === 'overall' && activeYearId === year.id}
                      onClick={() => onNavigate('overall', year.id)}
                    />

                    {/* Tabs */}
                    {(tabsByYear[year.id] || []).map(tab => (
                      <div key={tab.id} className="flex items-center group">
                        <SidebarNavItem
                          icon={<Folder size={isMobile ? 16 : 14} />}
                          label={tab.name}
                          sub
                          active={activeTabId === tab.id && activeView !== 'overall' && activeYearId === year.id && activeView !== 'table'}
                          onClick={() => onNavigate('tab', year.id, tab.id)}
                          className="flex-1"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const count = (tab.tables || []).reduce((s: number, t: any) => s + (rowsByTable[t.id] || []).length, 0);
                            onDeleteTab(tab.id, tab.name, count);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 md:p-1 rounded text-white/30 hover:text-accent-coral transition-all mr-1 touch-manipulation"
                        >
                          <Trash2 size={isMobile ? 14 : 12} />
                        </button>
                      </div>
                    ))}

                    {/* Add Tab Button */}
                    <button
                      onClick={() => onAddTab(year.id)}
                      className="w-full flex items-center gap-2 pl-6 md:pl-8 pr-3 py-2 md:py-1.5 mt-1 rounded-lg text-xs text-white/40 hover:text-white/60 hover:bg-white/5 transition-all touch-manipulation"
                    >
                      <FolderPlus size={isMobile ? 14 : 12} />
                      Add tab
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Global Reference Tables Section */}
        {/* Global Reference Tables Section */}
{globalTables.length > 0 && (
  <div className="mb-6">
    <div className="px-2 mb-2 flex items-center gap-2">
      <Database size={12} className="text-accent-cyan" />
      <span className="text-2xs font-semibold uppercase tracking-wider text-white/30">Global Reference</span>
    </div>
    
    {globalTables.map(table => (
      <div key={table.id} className="flex items-center group">
        <SidebarNavItem
          icon={<Database size={isMobile ? 16 : 14} />}
          label={table.name}
          active={activeTableId === table.id && activeView === 'table'}
          onClick={() => onNavigate('table', null, null, table.id)}
          badge="Global"
          className="flex-1"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            const count = rowsByTable[table.id]?.length || 0;
            onDeleteTable('', table.id, table.name, count);
          }}
          className="opacity-0 group-hover:opacity-100 p-2 md:p-1 rounded text-white/30 hover:text-accent-coral transition-all mr-1 touch-manipulation"
          title="Delete global table"
        >
          <Trash2 size={isMobile ? 16 : 14} />
        </button>
      </div>
    ))}
  </div>
)}
      </div>

      {/* Bottom Buttons - Responsive */}
      <div className="border-t border-white/10 p-3 space-y-2">
        {/* Add Year Button */}
        <button
          onClick={onAddYear}
          className="w-full flex items-center justify-center gap-2 py-2.5 md:py-2 rounded-lg text-sm text-white/60 hover:text-white/80 hover:bg-white/5 transition-all border border-white/10 hover:border-accent-gold/30 touch-manipulation"
        >
          <Plus size={isMobile ? 16 : 14} />
          Add new year
        </button>

        {/* Add Global Reference Table Button */}
        <button
          onClick={onAddGlobalTable}
          className="w-full flex items-center justify-center gap-2 py-2.5 md:py-2 rounded-lg text-sm text-accent-gold/80 hover:text-accent-gold hover:bg-accent-gold/10 transition-all border border-accent-gold/20 hover:border-accent-gold/40 touch-manipulation"
        >
          <Database size={isMobile ? 16 : 14} />
          Add Reference Table
        </button>
      </div>
    </motion.aside>
  );
};