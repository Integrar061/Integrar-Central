import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Patient, 
  TreatmentCatalogItem, 
  PatientTreatmentPlan, 
  Appointment, 
  AuditLog, 
  GoogleCalendarConfig,
  CampaignHistory,
  AppointmentStatus,
  TimelineItem
} from '../types';
import { 
  INITIAL_PATIENTS, 
  INITIAL_TREATMENTS, 
  INITIAL_PLANS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_GCAL_CONFIG, 
  INITIAL_CAMPAIGNS 
} from '../mock/initialData';
import { useAuth } from './AuthContext';
import { loadStoredSession } from '../lib/googleAuth';
import {
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  listUpcomingGoogleEvents,
  parseGoogleEventSchedule
} from '../lib/googleCalendar';

interface AppContextType {
  patients: Patient[];
  treatments: TreatmentCatalogItem[];
  plans: PatientTreatmentPlan[];
  appointments: Appointment[];
  auditLogs: AuditLog[];
  gcalConfig: GoogleCalendarConfig;
  campaigns: CampaignHistory[];
  gcalBusy: boolean;
  gcalError: string | null;
  
  addPatient: (patientData: Omit<Patient, 'id' | 'timeline' | 'attachments' | 'firstVisitDate' | 'lastVisitDate' | 'churnRisk'>) => void;
  updatePatient: (patient: Patient) => void;
  deletePatient: (id: string) => void;
  addTimelineItem: (patientId: string, type: TimelineItem['type'], title: string, description: string) => void;
  
  addTreatmentCatalogItem: (item: Omit<TreatmentCatalogItem, 'id'>) => void;
  updateTreatmentCatalogItem: (item: TreatmentCatalogItem) => void;
  
  createPatientTreatmentPlan: (
    patientId: string, 
    treatmentCatalogId: string, 
    customSessionPrice: number, 
    totalSessions: number, 
    discountPercent: number,
    notes?: string
  ) => void;
  
  addAppointment: (appointment: Omit<Appointment, 'id' | 'syncedWithGoogle' | 'googleEventId'>) => Promise<{ success: boolean; error?: string }>;
  updateAppointmentStatus: (id: string, newStatus: AppointmentStatus) => Promise<void>;
  
  connectGoogleCalendar: () => Promise<void>;
  disconnectGoogleCalendar: () => Promise<void>;
  syncGcalNow: () => Promise<void>;
  
  resetData: () => void;
}

const STORAGE_KEY = 'integrar_central_v2_store';

const AppContext = createContext<AppContextType | undefined>(undefined);

function readStore<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [patients, setPatients] = useState<Patient[]>(() =>
    readStore(`${STORAGE_KEY}_patients`, INITIAL_PATIENTS)
  );
  const [treatments, setTreatments] = useState<TreatmentCatalogItem[]>(() =>
    readStore(`${STORAGE_KEY}_treatments`, INITIAL_TREATMENTS)
  );
  const [plans, setPlans] = useState<PatientTreatmentPlan[]>(() =>
    readStore(`${STORAGE_KEY}_plans`, INITIAL_PLANS)
  );
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    readStore(`${STORAGE_KEY}_appointments`, INITIAL_APPOINTMENTS)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    readStore(`${STORAGE_KEY}_auditLogs`, INITIAL_AUDIT_LOGS)
  );
  const [gcalConfig, setGcalConfig] = useState<GoogleCalendarConfig>(() =>
    readStore(`${STORAGE_KEY}_gcalConfig`, INITIAL_GCAL_CONFIG)
  );
  const [campaigns] = useState<CampaignHistory[]>(() =>
    readStore(`${STORAGE_KEY}_campaigns`, INITIAL_CAMPAIGNS)
  );
  const [gcalBusy, setGcalBusy] = useState(false);
  const [gcalError, setGcalError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_patients`, JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_treatments`, JSON.stringify(treatments));
  }, [treatments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_plans`, JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_appointments`, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_auditLogs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_gcalConfig`, JSON.stringify(gcalConfig));
  }, [gcalConfig]);

  // Ao logar, alinha o status da Agenda com a sessão Google ativa
  useEffect(() => {
    if (!currentUser) return;
    const session = loadStoredSession();
    if (session) {
      setGcalConfig(prev => ({
        ...prev,
        isConnected: true,
        accountEmail: session.profile.email,
        webhookStatus: 'Ativo (Tempo Real)'
      }));
    }
  }, [currentUser?.id]);

  const logAudit = (action: string, entity: AuditLog['entity'], targetId: string, details: string, previousValue?: string, newValue?: string) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entity,
      targetId,
      details,
      previousValue,
      newValue
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addPatient: AppContextType['addPatient'] = (data) => {
    const today = new Date().toISOString().split('T')[0];
    const newId = `pat-${Date.now()}`;
    const newPatient: Patient = {
      ...data,
      id: newId,
      attachments: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          patientId: newId,
          type: 'log_sistema',
          title: 'Cadastro Criado',
          description: `Cadastro inicial realizado no sistema como ${data.status}.`,
          date: today,
          author: currentUser?.name || 'Sistema'
        }
      ],
      firstVisitDate: today,
      lastVisitDate: today,
      churnRisk: false
    };

    setPatients(prev => [newPatient, ...prev]);
    logAudit('Novo Cadastro de Paciente', 'Paciente', newId, `Paciente ${data.name} cadastrado com sucesso.`);
  };

  const updatePatient = (updated: Patient) => {
    setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
    logAudit('Atualização de Dados do Paciente', 'Paciente', updated.id, `Dados cadastrais do paciente ${updated.name} alterados.`);
  };

  const deletePatient = (id: string) => {
    const target = patients.find(p => p.id === id);
    setPatients(prev => prev.filter(p => p.id !== id));
    if (target) {
      logAudit('Exclusão de Cadastro de Paciente', 'Paciente', id, `Exclusão do registro do paciente ${target.name}.`);
    }
  };

  const addTimelineItem = (patientId: string, type: TimelineItem['type'], title: string, description: string) => {
    const today = new Date().toISOString().split('T')[0];
    const newItem: TimelineItem = {
      id: `tl-${Date.now()}`,
      patientId,
      type,
      title,
      description,
      date: today,
      author: currentUser?.name || 'Sistema'
    };

    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return { ...p, timeline: [newItem, ...p.timeline] };
      }
      return p;
    }));
  };

  const addTreatmentCatalogItem = (data: Omit<TreatmentCatalogItem, 'id'>) => {
    const newId = `trt-${Date.now()}`;
    const newItem: TreatmentCatalogItem = { ...data, id: newId };
    setTreatments(prev => [...prev, newItem]);
    logAudit('Adicionado Novo Tratamento ao Catálogo', 'Catálogo', newId, `Tratamento ${data.name} cadastrado no catálogo mestre.`);
  };

  const updateTreatmentCatalogItem = (updated: TreatmentCatalogItem) => {
    const oldItem = treatments.find(t => t.id === updated.id);
    setTreatments(prev => prev.map(t => t.id === updated.id ? updated : t));
    logAudit(
      'Edição do Catálogo Mestre de Tratamento', 
      'Catálogo', 
      updated.id, 
      `Catálogo mestre de ${updated.name} alterado.`,
      `Valor antigo: R$ ${oldItem?.pricePerSession}/sessão`,
      `Valor novo: R$ ${updated.pricePerSession}/sessão`
    );
  };

  const createPatientTreatmentPlan: AppContextType['createPatientTreatmentPlan'] = (
    patientId, 
    treatmentCatalogId, 
    customSessionPrice, 
    totalSessions, 
    discountPercent,
    notes
  ) => {
    const patient = patients.find(p => p.id === patientId);
    const catalogItem = treatments.find(t => t.id === treatmentCatalogId);
    if (!patient || !catalogItem) return;

    const totalAmount = (customSessionPrice * totalSessions) * (1 - (discountPercent / 100));
    const newPlanId = `pln-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    const newPlan: PatientTreatmentPlan = {
      id: newPlanId,
      patientId,
      patientName: patient.name,
      treatmentCatalogId,
      treatmentName: catalogItem.name,
      category: catalogItem.category,
      sessionPrice: customSessionPrice,
      totalSessions,
      completedSessions: 0,
      remainingSessions: totalSessions,
      discountPercent,
      totalAmount,
      paidAmount: 0.00,
      openBalance: totalAmount,
      createdAt: today,
      createdBy: currentUser?.name || 'Sistema',
      updatedAt: today,
      status: 'Ativo'
    };

    setPlans(prev => [newPlan, ...prev]);

    const isCustomPrice = customSessionPrice !== catalogItem.pricePerSession;
    logAudit(
      'Criação de Plano de Tratamento',
      'PlanoTratamento',
      newPlanId,
      `Vínculo de ${catalogItem.name} para o paciente ${patient.name}.${notes ? ' Obs: ' + notes : ''}`,
      `Catálogo Padrão: R$ ${catalogItem.pricePerSession}/sessão (${catalogItem.defaultSessions} sessões)`,
      `Plano Vinculado: R$ ${customSessionPrice}/sessão (${totalSessions} sessões) - Total R$ ${totalAmount.toFixed(2)}${isCustomPrice ? ' [VALOR PERSONALIZADO]' : ''}`
    );

    addTimelineItem(
      patientId,
      'tratamento_contratado',
      `Contratou ${catalogItem.name}`,
      `Plano de ${totalSessions} sessões por R$ ${totalAmount.toFixed(2)} (R$ ${customSessionPrice.toFixed(2)}/sessão).`
    );

    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, status: 'Em tratamento' } : p));
  };

  const addAppointment: AppContextType['addAppointment'] = async (data) => {
    const conflict = appointments.find(a => {
      if (a.status === 'Cancelada') return false;
      if (a.date !== data.date) return false;

      const overlapTime =
        (data.startTime >= a.startTime && data.startTime < a.endTime) ||
        (data.endTime > a.startTime && data.endTime <= a.endTime);

      return overlapTime && (a.professional === data.professional || a.room === data.room);
    });

    if (conflict) {
      const conflictType = conflict.professional === data.professional
        ? `com o(a) ${data.professional}`
        : `na ${data.room}`;
      return {
        success: false,
        error: `Conflito de horário! Já existe um agendamento (${conflict.patientName}) no horário das ${conflict.startTime} às ${conflict.endTime} ${conflictType}.`
      };
    }

    const newId = `apt-${Date.now()}`;
    let googleEventId: string | undefined;
    let syncedWithGoogle = false;

    if (gcalConfig.isConnected) {
      try {
        googleEventId = await createGoogleCalendarEvent(data);
        syncedWithGoogle = true;
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Falha ao sincronizar com Google Agenda.'
        };
      }
    }

    const newAppointment: Appointment = {
      ...data,
      id: newId,
      syncedWithGoogle,
      googleEventId
    };

    setAppointments(prev => [newAppointment, ...prev]);

    if (syncedWithGoogle) {
      setGcalConfig(prev => ({
        ...prev,
        lastSyncedAt: new Date().toLocaleString('pt-BR'),
        syncedEventsCount: prev.syncedEventsCount + 1
      }));
    }

    logAudit(
      'Novo Agendamento Criado',
      'Agendamento',
      newId,
      `Sessão de ${data.treatmentName} para ${data.patientName} agendada para ${data.date} às ${data.startTime}${syncedWithGoogle ? ' (Google Agenda)' : ''}.`
    );

    return { success: true };
  };

  const updateAppointmentStatus = async (id: string, newStatus: AppointmentStatus) => {
    const targetApt = appointments.find(a => a.id === id);
    if (!targetApt) return;

    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    logAudit('Atualização de Status de Agendamento', 'Agendamento', id, `Status da sessão de ${targetApt.patientName} alterado de ${targetApt.status} para ${newStatus}.`);

    if (newStatus === 'Cancelada' && targetApt.googleEventId && gcalConfig.isConnected) {
      try {
        await deleteGoogleCalendarEvent(targetApt.googleEventId);
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, syncedWithGoogle: false } : a));
      } catch (err) {
        setGcalError(err instanceof Error ? err.message : 'Falha ao remover evento no Google Agenda.');
      }
    }

    if (newStatus === 'Realizada' && targetApt.treatmentPlanId) {
      setPlans(prev => prev.map(pln => {
        if (pln.id === targetApt.treatmentPlanId) {
          const completed = pln.completedSessions + 1;
          const remaining = Math.max(0, pln.totalSessions - completed);
          return {
            ...pln,
            completedSessions: completed,
            remainingSessions: remaining,
            status: remaining === 0 ? 'Concluído' : 'Ativo'
          };
        }
        return pln;
      }));

      setPatients(prev => prev.map(p => p.id === targetApt.patientId ? { ...p, lastVisitDate: targetApt.date } : p));
    }
  };

  const connectGoogleCalendar = async () => {
    setGcalBusy(true);
    setGcalError(null);
    try {
      const session = loadStoredSession();
      if (!session) {
        throw new Error('Sessão Google expirada. Faça login novamente.');
      }
      setGcalConfig(prev => ({
        ...prev,
        isConnected: true,
        accountEmail: session.profile.email,
        webhookStatus: 'Ativo (Tempo Real)',
        lastSyncedAt: new Date().toLocaleString('pt-BR')
      }));
      logAudit('Conexão Google Agenda', 'Agendamento', 'gcal', 'Integração Google Calendar conectada.');
      await syncGcalNowInternal(true);
    } catch (err) {
      setGcalError(err instanceof Error ? err.message : 'Falha ao conectar Google Agenda.');
      throw err;
    } finally {
      setGcalBusy(false);
    }
  };

  const disconnectGoogleCalendar = async () => {
    setGcalConfig(prev => ({
      ...prev,
      isConnected: false,
      webhookStatus: 'Inativo'
    }));
    logAudit('Conexão Google Agenda', 'Agendamento', 'gcal', 'Integração Google Calendar desconectada (sessão do app mantida).');
  };

  const syncGcalNowInternal = async (silent = false) => {
    if (!silent) {
      setGcalBusy(true);
      setGcalError(null);
    }
    try {
      const events = await listUpcomingGoogleEvents(90);
      const knownIds = new Set(appointments.map(a => a.googleEventId).filter(Boolean) as string[]);

      const imported: Appointment[] = [];
      for (const event of events) {
        if (!event.id || knownIds.has(event.id)) continue;
        const schedule = parseGoogleEventSchedule(event);
        if (!schedule) continue;

        imported.push({
          id: `apt-gcal-${event.id}`,
          patientId: '',
          patientName: event.summary || 'Evento Google Agenda',
          patientPhone: '',
          treatmentName: event.summary || 'Google Agenda',
          professional: currentUser?.name || 'Equipe',
          room: 'Sala 03 - Consultório 1',
          date: schedule.date,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          durationMinutes: 60,
          status: 'Agendada',
          syncedWithGoogle: true,
          googleEventId: event.id,
          notes: event.description || 'Importado do Google Agenda'
        });
      }

      if (imported.length > 0) {
        setAppointments(prev => [...imported, ...prev]);
      }

      setGcalConfig(prev => ({
        ...prev,
        isConnected: true,
        lastSyncedAt: new Date().toLocaleString('pt-BR'),
        syncedEventsCount: events.length,
        webhookStatus: 'Ativo (Tempo Real)',
        accountEmail: prev.accountEmail || currentUser?.email || ''
      }));

      logAudit(
        'Sincronização Google Agenda',
        'Agendamento',
        'gcal_sync',
        `Sincronização concluída: ${events.length} eventos no período; ${imported.length} novos importados.`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha na sincronização com Google Agenda.';
      setGcalError(message);
      setGcalConfig(prev => ({ ...prev, webhookStatus: 'Erro' }));
      throw err;
    } finally {
      if (!silent) setGcalBusy(false);
    }
  };

  const syncGcalNow = async () => {
    await syncGcalNowInternal(false);
  };

  const resetData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_patients`);
    localStorage.removeItem(`${STORAGE_KEY}_treatments`);
    localStorage.removeItem(`${STORAGE_KEY}_plans`);
    localStorage.removeItem(`${STORAGE_KEY}_appointments`);
    localStorage.removeItem(`${STORAGE_KEY}_auditLogs`);
    localStorage.removeItem(`${STORAGE_KEY}_gcalConfig`);
    localStorage.removeItem(`${STORAGE_KEY}_campaigns`);

    setPatients(INITIAL_PATIENTS);
    setTreatments(INITIAL_TREATMENTS);
    setPlans(INITIAL_PLANS);
    setAppointments(INITIAL_APPOINTMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setGcalConfig({
      ...INITIAL_GCAL_CONFIG,
      isConnected: Boolean(loadStoredSession()),
      accountEmail: currentUser?.email || '',
      webhookStatus: loadStoredSession() ? 'Ativo (Tempo Real)' : 'Inativo'
    });
  };

  return (
    <AppContext.Provider value={{
      patients,
      treatments,
      plans,
      appointments,
      auditLogs,
      gcalConfig,
      campaigns,
      gcalBusy,
      gcalError,
      addPatient,
      updatePatient,
      deletePatient,
      addTimelineItem,
      addTreatmentCatalogItem,
      updateTreatmentCatalogItem,
      createPatientTreatmentPlan,
      addAppointment,
      updateAppointmentStatus,
      connectGoogleCalendar,
      disconnectGoogleCalendar,
      syncGcalNow,
      resetData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de AppProvider');
  return context;
};
