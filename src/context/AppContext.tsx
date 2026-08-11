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

interface AppContextType {
  patients: Patient[];
  treatments: TreatmentCatalogItem[];
  plans: PatientTreatmentPlan[];
  appointments: Appointment[];
  auditLogs: AuditLog[];
  gcalConfig: GoogleCalendarConfig;
  campaigns: CampaignHistory[];
  
  // Ações de Pacientes
  addPatient: (patientData: Omit<Patient, 'id' | 'timeline' | 'attachments' | 'firstVisitDate' | 'lastVisitDate' | 'churnRisk'>) => void;
  updatePatient: (patient: Patient) => void;
  deletePatient: (id: string) => void;
  addTimelineItem: (patientId: string, type: TimelineItem['type'], title: string, description: string) => void;
  
  // Ações de Tratamentos
  addTreatmentCatalogItem: (item: Omit<TreatmentCatalogItem, 'id'>) => void;
  updateTreatmentCatalogItem: (item: TreatmentCatalogItem) => void;
  
  // Ações de Planos de Tratamento (Regra Crítica de Negócio)
  createPatientTreatmentPlan: (
    patientId: string, 
    treatmentCatalogId: string, 
    customSessionPrice: number, 
    totalSessions: number, 
    discountPercent: number,
    notes?: string
  ) => void;
  
  // Ações de Agendamento
  addAppointment: (appointment: Omit<Appointment, 'id' | 'syncedWithGoogle'>) => { success: boolean; error?: string };
  updateAppointmentStatus: (id: string, newStatus: AppointmentStatus) => void;
  
  // Ações Google Calendar
  toggleGcalConnection: () => void;
  syncGcalNow: () => void;
  
  // Reset
  resetData: () => void;
}

const STORAGE_KEY = 'integrar_central_v1_store';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_patients`);
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [treatments, setTreatments] = useState<TreatmentCatalogItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_treatments`);
    return saved ? JSON.parse(saved) : INITIAL_TREATMENTS;
  });

  const [plans, setPlans] = useState<PatientTreatmentPlan[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_plans`);
    return saved ? JSON.parse(saved) : INITIAL_PLANS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_appointments`);
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_auditLogs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [gcalConfig, setGcalConfig] = useState<GoogleCalendarConfig>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_gcalConfig`);
    return saved ? JSON.parse(saved) : INITIAL_GCAL_CONFIG;
  });

  const [campaigns] = useState<CampaignHistory[]>(INITIAL_CAMPAIGNS);

  // Persistência em LocalStorage
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

  // Função auxiliar para registrar logs de auditoria
  const logAudit = (action: string, entity: AuditLog['entity'], targetId: string, details: string, previousValue?: string, newValue?: string) => {
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

  // PACIENTES
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
          author: currentUser.name
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
      author: currentUser.name
    };

    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          timeline: [newItem, ...p.timeline]
        };
      }
      return p;
    }));
  };

  // TRATAMENTOS (CATÁLOGO)
  const addTreatmentCatalogItem = (data: Omit<TreatmentCatalogItem, 'id'>) => {
    const newId = `trt-${Date.now()}`;
    const newItem: TreatmentCatalogItem = {
      ...data,
      id: newId
    };
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

  // PLANO DE TRATAMENTO (REGRA CRÍTICA DE NEGÓCIO)
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
      createdBy: currentUser.name,
      updatedAt: today,
      status: 'Ativo'
    };

    setPlans(prev => [newPlan, ...prev]);

    // Registro de Auditoria da Personalização de Valores
    const isCustomPrice = customSessionPrice !== catalogItem.pricePerSession;
    logAudit(
      'Criação de Plano de Tratamento',
      'PlanoTratamento',
      newPlanId,
      `Vínculo de ${catalogItem.name} para o paciente ${patient.name}.${notes ? ' Obs: ' + notes : ''}`,
      `Catálogo Padrão: R$ ${catalogItem.pricePerSession}/sessão (${catalogItem.defaultSessions} sessões)`,
      `Plano Vinculado: R$ ${customSessionPrice}/sessão (${totalSessions} sessões) - Total R$ ${totalAmount.toFixed(2)}${isCustomPrice ? ' [VALOR PERSONALIZADO]' : ''}`
    );

    // Adiciona na timeline do paciente
    addTimelineItem(
      patientId,
      'tratamento_contratado',
      `Contratou ${catalogItem.name}`,
      `Plano de ${totalSessions} sessões por R$ ${totalAmount.toFixed(2)} (R$ ${customSessionPrice.toFixed(2)}/sessão).`
    );

    // Atualiza status do paciente para 'Em tratamento'
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, status: 'Em tratamento' } : p));
  };

  // AGENDAMENTO & BLOQUEIO DE CONFLITO
  const addAppointment: AppContextType['addAppointment'] = (data) => {
    // Validação de conflito: mesmo profissional ou mesma sala no mesmo horário e data
    const conflict = appointments.find(a => {
      if (a.status === 'Cancelada') return false;
      if (a.date !== data.date) return false;

      const newStart = data.startTime;
      const newEnd = data.endTime;

      const overlapTime = (newStart >= a.startTime && newStart < a.endTime) || (newEnd > a.startTime && newEnd <= a.endTime);

      const sameProfessional = a.professional === data.professional;
      const sameRoom = a.room === data.room;

      return overlapTime && (sameProfessional || sameRoom);
    });

    if (conflict) {
      const conflictType = conflict.professional === data.professional ? `com o(a) ${data.professional}` : `na ${data.room}`;
      return {
        success: false,
        error: `Conflito de horário! Já existe um agendamento (${conflict.patientName}) no horário das ${conflict.startTime} às ${conflict.endTime} ${conflictType}.`
      };
    }

    const newId = `apt-${Date.now()}`;
    const newAppointment: Appointment = {
      ...data,
      id: newId,
      syncedWithGoogle: gcalConfig.isConnected,
      googleEventId: gcalConfig.isConnected ? `gcal_evt_${Date.now()}` : undefined
    };

    setAppointments(prev => [newAppointment, ...prev]);

    logAudit('Novo Agendamento Criado', 'Agendamento', newId, `Sessão de ${data.treatmentName} para ${data.patientName} agendada para ${data.date} às ${data.startTime}.`);

    return { success: true };
  };

  const updateAppointmentStatus = (id: string, newStatus: AppointmentStatus) => {
    const targetApt = appointments.find(a => a.id === id);
    if (!targetApt) return;

    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));

    logAudit('Atualização de Status de Agendamento', 'Agendamento', id, `Status da sessão de ${targetApt.patientName} alterado de ${targetApt.status} para ${newStatus}.`);

    // Se o agendamento foi marcado como 'Realizada', incrementa sessões concluídas no plano de tratamento
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

      // Atualiza a última visita do paciente
      setPatients(prev => prev.map(p => p.id === targetApt.patientId ? { ...p, lastVisitDate: targetApt.date } : p));
    }
  };

  // GOOGLE CALENDAR
  const toggleGcalConnection = () => {
    setGcalConfig(prev => ({
      ...prev,
      isConnected: !prev.isConnected,
      webhookStatus: !prev.isConnected ? 'Ativo (Tempo Real)' : 'Inativo'
    }));
    logAudit('Conexão Google Agenda', 'Agendamento', 'gcal', `Integração Google Calendar ${!gcalConfig.isConnected ? 'conectada com sucesso' : 'desconectada'}.`);
  };

  const syncGcalNow = () => {
    setGcalConfig(prev => ({
      ...prev,
      lastSyncedAt: new Date().toLocaleString('pt-BR'),
      syncedEventsCount: appointments.length
    }));
    // Garante que todas as sessões não sincronizadas recebam flag
    setAppointments(prev => prev.map(a => ({ ...a, syncedWithGoogle: true, googleEventId: a.googleEventId || `gcal_evt_${Date.now()}` })));
    logAudit('Sincronização Manual Google Agenda', 'Agendamento', 'gcal_sync', 'Sincronização bidirecional executada via API Google Calendar OAuth.');
  };

  const resetData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_patients`);
    localStorage.removeItem(`${STORAGE_KEY}_treatments`);
    localStorage.removeItem(`${STORAGE_KEY}_plans`);
    localStorage.removeItem(`${STORAGE_KEY}_appointments`);
    localStorage.removeItem(`${STORAGE_KEY}_auditLogs`);
    localStorage.removeItem(`${STORAGE_KEY}_gcalConfig`);

    setPatients(INITIAL_PATIENTS);
    setTreatments(INITIAL_TREATMENTS);
    setPlans(INITIAL_PLANS);
    setAppointments(INITIAL_APPOINTMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setGcalConfig(INITIAL_GCAL_CONFIG);
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
      addPatient,
      updatePatient,
      deletePatient,
      addTimelineItem,
      addTreatmentCatalogItem,
      updateTreatmentCatalogItem,
      createPatientTreatmentPlan,
      addAppointment,
      updateAppointmentStatus,
      toggleGcalConnection,
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
