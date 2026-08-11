import React, { useState } from 'react';
import { 
  Send, 
  Users, 
  AlertCircle, 
  Gift, 
  Download, 
  CheckCircle2, 
  MessageSquare, 
  Sparkles,
  Phone,
  Clock,
  Tag,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import Papa from 'papaparse';

export const RemarketingCenter: React.FC = () => {
  const { patients, plans, campaigns } = useApp();

  const [activeTab, setActiveTab] = useState<'inativos' | 'pacotes' | 'aniversariantes' | 'leads' | 'historico'>('inativos');
  const [inactiveDaysThreshold, setInactiveDaysThreshold] = useState<number>(60);

  // 1. Pacientes Inativos
  const inactivePatients = patients.filter(p => {
    if (p.status === 'Ex-paciente') return false;
    const lastVisit = new Date(p.lastVisitDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 3600 * 24));
    return diffDays >= inactiveDaysThreshold;
  });

  // 2. Alertas de Fim de Pacote (restam 1 ou 2 sessões)
  const endingPlans = plans.filter(pln => pln.remainingSessions > 0 && pln.remainingSessions <= 2 && pln.status === 'Ativo');

  // 3. Aniversariantes do mês atual
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  const birthdayPatients = patients.filter(p => p.birthDate && p.birthDate.split('-')[1] === currentMonth);

  // 4. Funil de Leads não convertidos
  const leadPatients = patients.filter(p => p.status === 'Lead');

  // Exportar Lista Segmentada para WhatsApp/E-mail (CSV)
  const handleExportSegmentCSV = (dataList: any[], listTitle: string) => {
    const formatted = dataList.map(item => ({
      Nome: item.name || item.patientName,
      Telefone_WhatsApp: item.phone || '',
      Email: item.email || 'N/A',
      Status: item.status || 'Ativo',
      Tags: item.tags ? item.tags.join(', ') : ''
    }));

    const csv = Papa.unparse(formatted);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Lista_Remarketing_${listTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Send className="w-7 h-7 text-brand-500" /> Recursos de Remarketing & Reativação
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Segmente pacientes para reativação, renovação de pacotes, aniversariantes e régua de leads.
          </p>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-card flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('inativos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'inativos' ? 'bg-brand-500 text-white shadow-soft shadow-brand-500/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" /> Reativação de Inativos ({inactivePatients.length})
        </button>

        <button
          onClick={() => setActiveTab('pacotes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'pacotes' ? 'bg-brand-500 text-white shadow-soft shadow-brand-500/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" /> Fim de Pacote ({endingPlans.length})
        </button>

        <button
          onClick={() => setActiveTab('aniversariantes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'aniversariantes' ? 'bg-brand-500 text-white shadow-soft shadow-brand-500/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Gift className="w-4 h-4" /> Aniversariantes do Mês ({birthdayPatients.length})
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'leads' ? 'bg-brand-500 text-white shadow-soft shadow-brand-500/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" /> Funil de Leads ({leadPatients.length})
        </button>

        <button
          onClick={() => setActiveTab('historico')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'historico' ? 'bg-brand-500 text-white shadow-soft shadow-brand-500/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Histórico de Campanhas ({campaigns.length})
        </button>
      </div>

      {/* Tab 1: Reativação de Inativos */}
      {activeTab === 'inativos' && (
        <div className="space-y-4 animate-fade-in">
          <Card title="Segmentação de Pacientes Inativos">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Inatividade maior que:</span>
                <select
                  value={inactiveDaysThreshold}
                  onChange={(e) => setInactiveDaysThreshold(Number(e.target.value))}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl outline-none"
                >
                  <option value={30}>30 dias sem consulta</option>
                  <option value={60}>60 dias sem consulta</option>
                  <option value={90}>90 dias sem consulta</option>
                </select>
              </div>

              <Button
                onClick={() => handleExportSegmentCSV(inactivePatients, `Inativos_${inactiveDaysThreshold}_dias`)}
                variant="secondary"
                size="sm"
                icon={<Download className="w-4 h-4" />}
              >
                Exportar Lista WhatsApp (CSV)
              </Button>
            </div>

            <div className="space-y-3">
              {inactivePatients.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">Nenhum paciente inativo no período configurado.</p>
              ) : (
                inactivePatients.map(p => (
                  <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">{p.name}</h4>
                        {p.churnRisk && <Badge variant="warning" size="sm">Risco Churn</Badge>}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Último atendimento: <strong>{p.lastVisitDate}</strong> • Tel: {p.phone}
                      </p>
                    </div>

                    <Button variant="primary" size="sm" icon={<MessageSquare className="w-3.5 h-3.5" />}>
                      Disparar Reativação
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Alertas de Fim de Pacote */}
      {activeTab === 'pacotes' && (
        <div className="space-y-4 animate-fade-in">
          <Card title="Alertas para Upsell & Renovação (Resta 1 ou 2 Sessões)">
            <div className="space-y-3">
              {endingPlans.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">Nenhum pacote próximo da conclusão.</p>
              ) : (
                endingPlans.map(pln => (
                  <div key={pln.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">{pln.patientName}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-200 text-amber-900 uppercase">
                          Resta {pln.remainingSessions} sessão
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Tratamento: <strong>{pln.treatmentName}</strong> ({pln.completedSessions}/{pln.totalSessions} sessões concluídas)
                      </p>
                    </div>

                    <Button variant="cyan" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
                      Oferecer Renovação / Upsell
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Aniversariantes do Mês */}
      {activeTab === 'aniversariantes' && (
        <div className="space-y-4 animate-fade-in">
          <Card title="Aniversariantes do Mês de Agosto">
            <div className="space-y-3">
              {birthdayPatients.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">Nenhum aniversariante encontrado neste mês.</p>
              ) : (
                birthdayPatients.map(p => (
                  <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                        <Gift className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{p.name}</h4>
                        <p className="text-xs text-slate-500">Data de Nascimento: <strong>{p.birthDate}</strong></p>
                      </div>
                    </div>

                    <Button variant="primary" size="sm" icon={<MessageSquare className="w-3.5 h-3.5" />}>
                      Enviar Cupom de Aniversário
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: Funil de Leads & Régua de Follow-up */}
      {activeTab === 'leads' && (
        <div className="space-y-4 animate-fade-in">
          <Card title="Funil de Leads (Acompanhamento em 3, 7 e 15 dias)">
            <div className="space-y-3">
              {leadPatients.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">Nenhum lead pendente de fechamento.</p>
              ) : (
                leadPatients.map(p => (
                  <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{p.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Origem: <strong>{p.origin}</strong> • Tel: {p.phone}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">Follow-up: 3 dias</span>
                      <Button variant="secondary" size="sm">
                        Agendar Chamada
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 5: Histórico de Campanhas Enviadas */}
      {activeTab === 'historico' && (
        <div className="space-y-4 animate-fade-in">
          <Card title="Histórico de Disparos de Campanhas">
            <div className="space-y-3">
              {campaigns.map(c => (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{c.title}</h4>
                    <p className="text-slate-500 mt-0.5">Grupo Alvo: {c.targetGroup} • Canal: {c.channel} • Data: {c.sentAt}</p>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">{c.recipientsCount} Destinatários</span>
                    <span className="text-emerald-700 font-bold">{c.conversionsCount} Vendas Convertidas</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
