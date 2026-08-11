import React, { useState } from 'react';
import { 
  Search, 
  Menu, 
  CalendarPlus, 
  UserPlus,
  Phone,
  CreditCard,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { UserRole } from '../../types';

interface HeaderProps {
  onOpenSidebar: () => void;
  onOpenNewPatientModal: () => void;
  onOpenNewAppointmentModal: () => void;
  onSelectPatient: (patientId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  onOpenNewPatientModal,
  onOpenNewAppointmentModal,
  onSelectPatient
}) => {
  const { currentUser, logout } = useAuth();
  const { patients } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!currentUser) return null;

  const filteredPatients = searchQuery.trim() === '' ? [] : patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.cpf.includes(searchQuery) ||
    p.phone.includes(searchQuery)
  ).slice(0, 5);

  const roleLabels: Record<UserRole, { title: string; color: string }> = {
    ADMIN: { title: 'Administrador', color: 'bg-brand-500 text-white' },
    RECEPCAO: { title: 'Recepção', color: 'bg-emerald-500 text-white' },
    FINANCEIRO: { title: 'Financeiro', color: 'bg-amber-500 text-white' },
    PROFISSIONAL: { title: 'Profissional de Saúde', color: 'bg-cyan-500 text-white' }
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 lg:hidden transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative w-full">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Busca rápida de paciente (Nome, CPF, Telefone)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-100/80 focus:bg-white border border-transparent focus:border-brand-500 rounded-xl outline-none transition-all duration-200 placeholder:text-slate-400"
            />
          </div>

          {isSearchOpen && filteredPatients.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden animate-fade-in">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                Pacientes Encontrados ({filteredPatients.length})
              </div>
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => {
                    onSelectPatient(patient.id);
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-brand-50 text-left transition-colors group border-b border-slate-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-brand-600">{patient.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> {patient.cpf}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {patient.phone}</span>
                    </p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                    patient.status === 'Em tratamento' || patient.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {patient.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          onClick={onOpenNewAppointmentModal}
          variant="primary"
          size="sm"
          icon={<CalendarPlus className="w-4 h-4" />}
          className="hidden sm:inline-flex"
        >
          Agendar
        </Button>

        <Button
          onClick={onOpenNewPatientModal}
          variant="secondary"
          size="sm"
          icon={<UserPlus className="w-4 h-4" />}
        >
          <span className="hidden md:inline">Novo</span> Paciente
        </Button>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
          >
            <img
              src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=0066FF&color=fff`}
              alt={currentUser.name}
              className="w-7 h-7 rounded-lg object-cover ring-2 ring-brand-500/30"
              referrerPolicy="no-referrer"
            />
            <div className="hidden xl:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</p>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${roleLabels[currentUser.role].color}`}>
                {roleLabels[currentUser.role].title}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-scale-up">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
              </div>
              <button
                onClick={async () => {
                  setIsMenuOpen(false);
                  await logout();
                }}
                className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair da conta Google
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
