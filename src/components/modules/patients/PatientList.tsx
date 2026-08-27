import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  AlertTriangle, 
  ChevronRight, 
  Phone, 
  Calendar, 
  Tag, 
  CreditCard,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Patient, PatientStatus } from '../../../types';
import { Button } from '../../ui/Button';
import { Badge, BadgeVariant } from '../../ui/Badge';
import { Card } from '../../ui/Card';

interface PatientListProps {
  onSelectPatient: (patientId: string) => void;
  onOpenNewPatientModal: () => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  onSelectPatient,
  onOpenNewPatientModal
}) => {
  const { patients, isPatientsLoading } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | PatientStatus | 'RISCO_CHURN'>('TODOS');

  // Filtragem dinâmica
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(search.toLowerCase()) ||
      patient.cpf.includes(search) ||
      patient.phone.includes(search);

    if (!matchesSearch) return false;

    if (statusFilter === 'TODOS') return true;
    if (statusFilter === 'RISCO_CHURN') return patient.churnRisk;
    return patient.status === statusFilter;
  });

  const statusBadges: Record<PatientStatus, { variant: BadgeVariant }> = {
    'Lead': { variant: 'info' },
    'Ativo': { variant: 'success' },
    'Em tratamento': { variant: 'brand' },
    'Inativo': { variant: 'warning' },
    'Ex-paciente': { variant: 'slate' }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-brand-500" /> Gestão de Pacientes
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Base total: <strong>{patients.length} pacientes cadastrados</strong> • Controle completo de fichas e históricos.
          </p>
        </div>

        <Button onClick={onOpenNewPatientModal} variant="primary" icon={<Plus className="w-4 h-4" />}>
          Cadastrar Paciente
        </Button>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(['TODOS', 'Em tratamento', 'Ativo', 'Lead', 'Inativo', 'RISCO_CHURN'] as const).map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => setStatusFilter(filterKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === filterKey 
                  ? filterKey === 'RISCO_CHURN' ? 'bg-amber-500 text-white shadow-soft shadow-amber-500/20' : 'bg-brand-500 text-white shadow-soft shadow-brand-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filterKey === 'TODOS' ? 'Todos os Pacientes' : filterKey === 'RISCO_CHURN' ? '⚠️ Risco Churn' : filterKey}
            </button>
          ))}
        </div>
      </div>

      {/* Patients Table Container */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-6">Paciente</th>
                <th className="py-3.5 px-4">Origem</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Última Visita</th>
                <th className="py-3.5 px-4">Alertas / Tags</th>
                <th className="py-3.5 px-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium">
              {isPatientsLoading && filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      <span>Sincronizando pacientes com banco de dados...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Nenhum paciente encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr 
                    key={patient.id} 
                    onClick={() => onSelectPatient(patient.id)}
                    className="hover:bg-brand-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors">{patient.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{patient.cpf}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {patient.phone}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs font-semibold text-slate-700">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                        {patient.origin}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <Badge variant={statusBadges[patient.status].variant}>
                        {patient.status}
                      </Badge>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-600 font-mono">
                      {patient.lastVisitDate}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {patient.churnRisk && (
                          <Badge variant="warning" size="sm" icon={<AlertTriangle className="w-3 h-3 text-amber-600" />}>
                            Risco Churn
                          </Badge>
                        )}
                        {patient.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Button variant="ghost" size="sm" icon={<ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600" />}>
                        Visão 360°
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
