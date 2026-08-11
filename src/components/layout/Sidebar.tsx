import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Activity, 
  Send, 
  ShieldAlert, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export type ActiveTab = 'dashboard' | 'patients' | 'agenda' | 'treatments' | 'remarketing' | 'audit';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen
}) => {
  const { hasPermission } = useAuth();
  const { gcalConfig } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Faturamento', icon: LayoutDashboard, permission: 'FINANCIAL' as const },
    { id: 'patients', label: 'Gestão de Pacientes (360°)', icon: Users, permission: 'PATIENTS_VIEW' as const },
    { id: 'agenda', label: 'Agenda & Google Calendar', icon: Calendar, permission: 'AGENDA_OWN' as const },
    { id: 'treatments', label: 'Catálogo & Planos', icon: Activity, permission: 'PATIENTS_VIEW' as const },
    { id: 'remarketing', label: 'Remarketing & Reativação', icon: Send, permission: 'REMARKETING' as const },
    { id: 'audit', label: 'Auditoria & Logs', icon: ShieldAlert, permission: 'AUDIT_LOGS' as const },
  ];

  return (
    <>
      {/* Overlay Mobile/Tablet */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-cyan-400 flex items-center justify-center text-white shadow-soft shadow-brand-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
                Integrar <span className="text-brand-400 font-medium">Central</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">CRM Clínica Integrativa</p>
            </div>
          </div>
        </div>

        {/* Status Conexão Google Calendar Mini Card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${gcalConfig.isConnected ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            <div>
              <p className="font-bold text-slate-200 text-[11px]">Google Agenda</p>
              <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{gcalConfig.isConnected ? 'Sincronizado' : 'Desconectado'}</p>
            </div>
          </div>
          {gcalConfig.isConnected && (
            <RefreshCw className="w-3.5 h-3.5 text-brand-400 animate-spin opacity-80" />
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isAllowed = hasPermission(item.permission);
            const isActive = activeTab === item.id;

            if (!isAllowed) return null;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as ActiveTab);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group relative ${
                  isActive 
                    ? 'bg-brand-500 text-white shadow-soft shadow-brand-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/20 text-center">
          <p className="text-[11px] font-medium text-slate-500">Integrar Central v1.0 • PWA Ready</p>
        </div>
      </aside>
    </>
  );
};
