import React, { useMemo, useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  RefreshCw, 
  User,
  MapPin,
  CalendarDays,
  ShieldCheck,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { AppointmentStatus } from '../../../types';
import { Button } from '../../ui/Button';
import { Badge, BadgeVariant } from '../../ui/Badge';
import { Card } from '../../ui/Card';

interface AgendaViewProps {
  onOpenNewAppointmentModal: () => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ onOpenNewAppointmentModal }) => {
  const {
    appointments,
    treatments,
    updateAppointmentStatus,
    gcalConfig,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    syncGcalNow,
    gcalBusy,
    gcalError
  } = useApp();
  const { currentUser } = useAuth();

  const [viewMode, setViewMode] = useState<'dia' | 'semana' | 'mes'>('dia');
  const [selectedProfessional, setSelectedProfessional] = useState<string>('TODOS');
  const [selectedRoom, setSelectedRoom] = useState<string>('TODAS');
  const [actionError, setActionError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const professionals = useMemo(() => {
    const set = new Set<string>();
    if (currentUser?.name) set.add(currentUser.name);
    treatments.forEach(t => t.enabledProfessionals.forEach(p => p && set.add(p)));
    appointments.forEach(a => a.professional && set.add(a.professional));
    return Array.from(set);
  }, [appointments, treatments, currentUser?.name]);

  const filteredAppointments = appointments.filter(apt => {
    if (selectedProfessional !== 'TODOS' && apt.professional !== selectedProfessional) return false;
    if (selectedRoom !== 'TODAS' && apt.room !== selectedRoom) return false;
    if (viewMode === 'dia' && apt.date !== selectedDate) return false;
    return true;
  });

  const statusColors: Record<AppointmentStatus, { bg: string; text: string; badge: BadgeVariant }> = {
    'Agendada': { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-800', badge: 'info' },
    'Confirmada': { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-900', badge: 'success' },
    'Realizada': { bg: 'bg-brand-50 border-brand-200', text: 'text-brand-900', badge: 'brand' },
    'Faltou': { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-900', badge: 'warning' },
    'Cancelada': { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-900', badge: 'danger' },
    'Remarcada': { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', badge: 'slate' }
  };

  const handleConnectToggle = async () => {
    setActionError(null);
    try {
      if (gcalConfig.isConnected) {
        await disconnectGoogleCalendar();
      } else {
        await connectGoogleCalendar();
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Falha na conexão com Google.');
    }
  };

  const handleSync = async () => {
    setActionError(null);
    try {
      await syncGcalNow();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Falha ao sincronizar.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-brand-500" /> Agenda Inteligente
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Agendamentos reais com bloqueio anti-conflitos e sincronização com Google Agenda.
          </p>
        </div>

        <Button onClick={onOpenNewAppointmentModal} variant="primary" icon={<Plus className="w-4 h-4" />}>
          Novo Agendamento
        </Button>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
            gcalConfig.isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
          }`}>
            <CalendarDays className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">Google Agenda</span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                gcalConfig.isConnected ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}>
                {gcalConfig.webhookStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {gcalConfig.isConnected ? (
                <>Conta: <strong>{gcalConfig.accountEmail || currentUser?.email}</strong>
                  {gcalConfig.lastSyncedAt ? <> • Última sync: {gcalConfig.lastSyncedAt}</> : null}
                  <> • Eventos: {gcalConfig.syncedEventsCount}</>
                </>
              ) : (
                'Conecte para criar e importar eventos automaticamente.'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button
            onClick={handleSync}
            disabled={!gcalConfig.isConnected || gcalBusy}
            variant="secondary"
            size="sm"
            icon={gcalBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          >
            Sincronizar Agora
          </Button>
          <Button
            onClick={handleConnectToggle}
            disabled={gcalBusy}
            variant={gcalConfig.isConnected ? 'ghost' : 'cyan'}
            size="sm"
            className="text-white"
          >
            {gcalConfig.isConnected ? 'Pausar sync' : 'Ativar Google Agenda'}
          </Button>
        </div>
      </div>

      {(actionError || gcalError) && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{actionError || gcalError}</span>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['dia', 'semana', 'mes'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                  viewMode === mode ? 'bg-brand-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedProfessional}
            onChange={(e) => setSelectedProfessional(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-slate-700"
          >
            <option value="TODOS">Todos os Profissionais</option>
            {professionals.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-slate-700"
          >
            <option value="TODAS">Todas as Salas</option>
            <option value="Sala 01 - Ozônio">Sala 01 - Ozônio</option>
            <option value="Sala 02 - Estética">Sala 02 - Estética</option>
            <option value="Sala 03 - Consultório 1">Sala 03 - Consultório 1</option>
            <option value="Sala 04 - Soroterapia">Sala 04 - Soroterapia</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="font-extrabold text-slate-800 text-base">Nenhuma sessão nesta data</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">Cadastre pacientes e agende sessões, ou sincronize o Google Agenda.</p>
              <Button onClick={onOpenNewAppointmentModal} variant="primary" size="sm">
                Agendar Consulta Agora
              </Button>
            </div>
          </Card>
        ) : (
          filteredAppointments.map((apt) => {
            const style = statusColors[apt.status];
            return (
              <div 
                key={apt.id} 
                className={`p-5 rounded-2xl border ${style.bg} transition-all duration-200 shadow-card hover:shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                <div className="flex items-start gap-4">
                  <div className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-center shrink-0">
                    <span className="text-lg font-extrabold text-slate-900 block leading-tight">{apt.startTime}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{apt.endTime}</span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-base">{apt.patientName}</h4>
                      <Badge variant={style.badge}>{apt.status}</Badge>
                      {apt.syncedWithGoogle && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Google Agenda
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 font-semibold mt-1 flex flex-wrap items-center gap-3">
                      <span>Tratamento: <strong>{apt.treatmentName}</strong> ({apt.durationMinutes} min)</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><User className="w-3 h-3 text-slate-400" /> {apt.professional}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {apt.room}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <span className="text-[11px] font-bold text-slate-500">Alterar Status:</span>
                  <select
                    value={apt.status}
                    onChange={(e) => updateAppointmentStatus(apt.id, e.target.value as AppointmentStatus)}
                    className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-xl outline-none focus:border-brand-500 text-slate-800 shadow-xs"
                  >
                    <option value="Agendada">Agendada</option>
                    <option value="Confirmada">Confirmada</option>
                    <option value="Realizada">Realizada (Concluída)</option>
                    <option value="Faltou">Faltou (Ausente)</option>
                    <option value="Cancelada">Cancelada</option>
                    <option value="Remarcada">Remarcada</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
