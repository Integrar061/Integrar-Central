import React, { useState } from 'react';
import { 
  Search, 
  Menu, 
  Plus, 
  UserCheck, 
  ChevronDown, 
  CalendarPlus, 
  UserPlus,
  Phone,
  CreditCard
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
  const { currentUser, switchUserRole } = useAuth();
  const { patients } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Filtro dinâmico de pacientes para busca rápida
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
      {/* Esquerda: Menu Hamburguer (Mobile/Tablet) + Busca Rápida */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 lg:hidden transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Campo de Busca Inteligente (Nome, CPF, Tel) */}
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

          {/* Autocomplete Dropdown */}
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

      {/* Direita: Perfil de Acesso + Ações Rápidas */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Botão de Agendamento Rápido */}
        <Button
          onClick={onOpenNewAppointmentModal}
          variant="primary"
          size="sm"
          icon={<CalendarPlus className="w-4 h-4" />}
          className="hidden sm:inline-flex"
        >
          Agendar
        </Button>

        {/* Botão de Novo Paciente */}
        <Button
          onClick={onOpenNewPatientModal}
          variant="secondary"
          size="sm"
          icon={<UserPlus className="w-4 h-4" />}
        >
          <span className="hidden md:inline">Novo</span> Paciente
        </Button>

        {/* Dropdown de Alternar Perfil de Usuário (Simulação de Autenticação) */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-7 h-7 rounded-lg object-cover ring-2 ring-brand-500/30"
            />
            <div className="hidden xl:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</p>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${roleLabels[currentUser.role].color}`}>
                {roleLabels[currentUser.role].title}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-scale-up">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase text-slate-400">Alternar Perfil Ativo</p>
                <p className="text-xs text-slate-500 mt-0.5">Simule o acesso por nível de permissão:</p>
              </div>

              {(['ADMIN', 'RECEPCAO', 'FINANCEIRO', 'PROFISSIONAL'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    switchUserRole(role);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-xs font-semibold flex items-center justify-between hover:bg-brand-50 transition-colors ${
                    currentUser.role === role ? 'text-brand-600 bg-brand-50/60 font-bold' : 'text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5" />
                    {roleLabels[role].title}
                  </span>
                  {currentUser.role === role && <span className="w-2 h-2 rounded-full bg-brand-500" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
