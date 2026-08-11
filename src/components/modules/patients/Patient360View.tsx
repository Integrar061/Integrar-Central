import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Calendar, 
  CreditCard, 
  MapPin, 
  AlertTriangle, 
  FileText, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Send, 
  DollarSign, 
  Tag, 
  Activity,
  CalendarPlus,
  Paperclip
} from 'lucide-react';
import { Patient, PatientStatus } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../ui/Button';
import { Badge, BadgeVariant } from '../../ui/Badge';
import { Card } from '../../ui/Card';

interface Patient360ViewProps {
  patient: Patient;
  onBack: () => void;
  onOpenAppointmentModal: (patientId: string) => void;
  onOpenPlanModal: (patientId: string) => void;
}

export const Patient360View: React.FC<Patient360ViewProps> = ({
  patient,
  onBack,
  onOpenAppointmentModal,
  onOpenPlanModal
}) => {
  const { updatePatient, addTimelineItem, plans, appointments } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'timeline' | 'financial'>('overview');
  const [newTimelineText, setNewTimelineText] = useState('');
  const [newTimelineType, setNewTimelineType] = useState<'mensagem' | 'ligacao' | 'consulta'>('mensagem');

  // Planos vinculados a este paciente
  const patientPlans = plans.filter(p => p.patientId === patient.id);
  
  // Agendamentos deste paciente
  const patientAppointments = appointments.filter(a => a.patientId === patient.id);

  // Cálculo financeiro
  const totalContracted = patientPlans.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalPaid = patientPlans.reduce((acc, p) => acc + p.paidAmount, 0);
  const openBalance = patientPlans.reduce((acc, p) => acc + p.openBalance, 0);

  // Status Badge Helper
  const statusBadges: Record<PatientStatus, { variant: BadgeVariant }> = {
    'Lead': { variant: 'info' },
    'Ativo': { variant: 'success' },
    'Em tratamento': { variant: 'brand' },
    'Inativo': { variant: 'warning' },
    'Ex-paciente': { variant: 'slate' }
  };

  const handleAddTimelineNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimelineText.trim()) return;

    addTimelineItem(
      patient.id,
      newTimelineType,
      newTimelineType === 'mensagem' ? 'Mensagem enviada/recebida' : newTimelineType === 'ligacao' ? 'Chamada Telefônica' : 'Nota de Atendimento',
      newTimelineText
    );

    setNewTimelineText('');
  };

  const handleStatusChange = (newStatus: PatientStatus) => {
    updatePatient({
      ...patient,
      status: newStatus
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{patient.name}</h2>
              <Badge variant={statusBadges[patient.status].variant}>
                {patient.status}
              </Badge>
              {patient.churnRisk && (
                <Badge variant="warning" icon={<AlertTriangle className="w-3 h-3 text-amber-600" />}>
                  Risco de Churn
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-3 mt-1 font-medium">
              <span>CPF: {patient.cpf || 'Não informado'}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {patient.phone}</span>
              <span>•</span>
              <span>Origem: <strong>{patient.origin}</strong></span>
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onOpenAppointmentModal(patient.id)}
            variant="primary"
            size="sm"
            icon={<CalendarPlus className="w-4 h-4" />}
          >
            Agendar Consulta
          </Button>
          <Button
            onClick={() => onOpenPlanModal(patient.id)}
            variant="cyan"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
          >
            Novo Plano
          </Button>
        </div>
      </div>

      {/* Risco de Churn Warning Banner if applicable */}
      {patient.churnRisk && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Alerta de Risco de Churn (Inatividade)</p>
            <p className="text-sm font-medium mt-0.5">{patient.churnRiskReason || 'Paciente com inatividade prolongeda ou faltas seguidas sem reagendamento.'}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Info Cards + Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Data & Financial Summary */}
        <div className="space-y-6">
          <Card title="Dados Pessoais & Perfil">
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Alterar Status:</span>
                <select
                  value={patient.status}
                  onChange={(e) => handleStatusChange(e.target.value as PatientStatus)}
                  className="px-2 py-1 bg-slate-100 font-bold rounded-lg text-slate-800 outline-none"
                >
                  <option value="Lead">Lead</option>
                  <option value="Ativo">Ativo</option>
                  <option value="Em tratamento">Em tratamento</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Ex-paciente">Ex-paciente</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="truncate font-medium">{patient.email || 'E-mail não cadastrado'}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Nascimento: <strong>{patient.birthDate || 'N/A'}</strong></span>
              </div>

              <div className="flex items-start gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{patient.address || 'Endereço não cadastrado'}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500">
                <span>Primeiro Atendimento:</span>
                <span className="font-bold text-slate-800">{patient.firstVisitDate}</span>
              </div>

              <div className="flex items-center justify-between text-slate-500">
                <span>Último Atendimento:</span>
                <span className="font-bold text-slate-800">{patient.lastVisitDate}</span>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-semibold block mb-1.5">Tags do Paciente:</span>
                <div className="flex flex-wrap gap-1">
                  {patient.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 font-bold text-[10px] flex items-center gap-1 border border-brand-100">
                      <Tag className="w-2.5 h-2.5" /> #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Resumo Financeiro */}
          <Card title="Resumo Financeiro do Paciente">
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Total Contratado:</span>
                <span className="text-sm font-extrabold text-slate-900">R$ {totalContracted.toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <span className="text-xs text-emerald-700 font-semibold">Valor Pago:</span>
                <span className="text-sm font-extrabold text-emerald-800">R$ {totalPaid.toFixed(2)}</span>
              </div>
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                openBalance > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-100 text-slate-700'
              }`}>
                <span className="text-xs font-semibold">Saldo Pendente:</span>
                <span className="text-sm font-extrabold">R$ {openBalance.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {/* Observações Clínicas & Anexos */}
          <Card title="Observações Clínicas & Anexos">
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3 leading-relaxed">
              {patient.notes || 'Nenhuma observação clínica registrada.'}
            </p>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Documentos & Exames ({patient.attachments.length})</span>
              {patient.attachments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nenhum anexo enviado.</p>
              ) : (
                patient.attachments.map(att => (
                  <div key={att.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip className="w-3.5 h-3.5 text-brand-500" />
                      <span className="truncate font-semibold text-slate-800">{att.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{att.size}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: 360° Tabs (Planos, Timeline, Agendamentos) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs Navigation */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-card flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'overview' ? 'bg-brand-500 text-white shadow-soft shadow-brand-500/20' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4" /> Planos de Tratamento ({patientPlans.length})
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'timeline' ? 'bg-brand-500 text-white shadow-soft shadow-brand-500/20' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4" /> Linha do Tempo ({patient.timeline.length})
            </button>
            <button
              onClick={() => setActiveTab('financial')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'financial' ? 'bg-brand-500 text-white shadow-soft shadow-brand-500/20' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" /> Próximas Sessões ({patientAppointments.length})
            </button>
          </div>

          {/* Tab 1: Planos de Tratamento */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fade-in">
              {patientPlans.length === 0 ? (
                <Card>
                  <div className="text-center py-8">
                    <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-600 font-bold text-sm">Nenhum plano de tratamento vinculado</p>
                    <p className="text-xs text-slate-400 mt-1 mb-4">Vincule um tratamento do catálogo para este paciente.</p>
                    <Button onClick={() => onOpenPlanModal(patient.id)} variant="primary" size="sm">
                      Vincular Tratamento
                    </Button>
                  </div>
                </Card>
              ) : (
                patientPlans.map(plan => {
                  const progressPct = Math.round((plan.completedSessions / plan.totalSessions) * 100);
                  return (
                    <Card key={plan.id} className="relative">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-slate-900 text-base">{plan.treatmentName}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-50 text-brand-700">
                              {plan.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Criado por <strong>{plan.createdBy}</strong> em {plan.createdAt}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-extrabold text-slate-900">R$ {plan.totalAmount.toFixed(2)}</p>
                          <p className="text-[11px] text-slate-500 font-medium">R$ {plan.sessionPrice.toFixed(2)} / sessão</p>
                        </div>
                      </div>

                      {/* Progresso de Sessões */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">Progresso do Pacote</span>
                          <span className="text-brand-600">{plan.completedSessions} de {plan.totalSessions} sessões concluídas ({progressPct}%)</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>Concluídas: {plan.completedSessions}</span>
                          <span>Restantes: <strong>{plan.remainingSessions}</strong></span>
                        </div>
                      </div>

                      {/* Detalhes Financeiros do Plano */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center text-xs font-medium border border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Valor Total</span>
                          <span className="font-bold text-slate-900">R$ {plan.totalAmount.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Pago</span>
                          <span className="font-bold text-emerald-700">R$ {plan.paidAmount.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Em Aberto</span>
                          <span className={`font-bold ${plan.openBalance > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                            R$ {plan.openBalance.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 2: Linha do Tempo de Interações */}
          {activeTab === 'timeline' && (
            <div className="space-y-4 animate-fade-in">
              {/* Form para adicionar nova interação */}
              <Card title="Registrar Nova Interação">
                <form onSubmit={handleAddTimelineNote} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNewTimelineType('mensagem')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        newTimelineType === 'mensagem' ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Mensagem / WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTimelineType('ligacao')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        newTimelineType === 'ligacao' ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Chamada Telefônica
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTimelineType('consulta')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        newTimelineType === 'consulta' ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Nota de Consulta
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    required
                    placeholder="Descreva a interação com o paciente..."
                    value={newTimelineText}
                    onChange={(e) => setNewTimelineText(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
                  />

                  <div className="flex justify-end">
                    <Button type="submit" variant="primary" size="sm" icon={<Send className="w-3.5 h-3.5" />}>
                      Registrar na Timeline
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Lista da Linha do Tempo */}
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {patient.timeline.map((item) => (
                  <div key={item.id} className="relative group">
                    {/* Icon Bullet */}
                    <div className="absolute -left-[23px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-brand-500 flex items-center justify-center text-brand-600 shadow-sm">
                      {item.type === 'consulta' ? <Activity className="w-3 h-3" /> : item.type === 'ligacao' ? <Phone className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-card">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-extrabold text-slate-900">{item.title}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{item.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                      <span className="text-[10px] text-slate-400 font-medium block mt-2">Por: {item.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Próximas Sessões na Agenda */}
          {activeTab === 'financial' && (
            <div className="space-y-4 animate-fade-in">
              <Card title="Agendamentos do Paciente">
                {patientAppointments.length === 0 ? (
                  <div className="text-center py-6">
                    <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Nenhum agendamento futuro encontrado.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {patientAppointments.map(apt => (
                      <div key={apt.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex flex-col items-center justify-center font-bold text-xs">
                            <span>{apt.date.split('-')[2]}</span>
                            <span className="text-[9px] uppercase">{apt.date.split('-')[1]}</span>
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 text-sm">{apt.treatmentName}</h5>
                            <p className="text-xs text-slate-500 font-medium">
                              {apt.startTime} - {apt.endTime} ({apt.durationMinutes} min) • {apt.professional}
                            </p>
                          </div>
                        </div>

                        <Badge variant={apt.status === 'Confirmada' ? 'success' : apt.status === 'Realizada' ? 'cyan' : 'info'}>
                          {apt.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
