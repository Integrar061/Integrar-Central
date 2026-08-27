import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import {
<<<<<<< HEAD
  isSupabaseConfigured,
  fetchPatientsFromSupabase,
  insertPatientToSupabase,
  updatePatientInSupabase,
  deletePatientFromSupabase,
  bulkUpsertPatientsToSupabase
} from '../lib/supabase';

export interface ImportLeadPayload {
  name: string;
  phone: string;
  email?: string;
  origin?: Patient['origin'];
  status?: Patient['status'];
  treatment?: string;
  contact?: string;
  notes?: string;
  tags?: string[];
  date?: string;
  whatsappLink?: string;
}
=======
  patientsApi,
  treatmentsApi,
  plansApi,
  appointmentsApi,
  auditLogsApi
} from '../services/api';
>>>>>>> f95d33561762d84fcb792c412714453f9488e613

interface AppContextType {
  patients: Patient[];
  isPatientsLoading: boolean;
  treatments: TreatmentCatalogItem[];
  plans: PatientTreatmentPlan[];
  appointments: Appointment[];
  auditLogs: AuditLog[];
  gcalConfig: GoogleCalendarConfig;
  campaigns: CampaignHistory[];
  gcalBusy: boolean;
  gcalError: string | null;
  isLoadingData: boolean;
  
<<<<<<< HEAD
  addPatient: (patientData: Omit<Patient, 'id' | 'timeline' | 'attachments' | 'firstVisitDate' | 'lastVisitDate' | 'churnRisk'>) => Promise<Patient>;
  updatePatient: (patient: Patient) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  bulkImportLeads: (leads: ImportLeadPayload[], strategy: 'skip' | 'update' | 'create_anyway') => Promise<{ imported: number; updated: number; skipped: number; failed: number }>;
  addTimelineItem: (patientId: string, type: TimelineItem['type'], title: string, description: string) => void;
=======
  addPatient: (patientData: Omit<Patient, 'id' | 'timeline' | 'attachments' | 'firstVisitDate' | 'lastVisitDate' | 'churnRisk'>) => Promise<void>;
  updatePatient: (patient: Patient) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  addTimelineItem: (patientId: string, type: TimelineItem['type'], title: string, description: string) => Promise<void>;
>>>>>>> f95d33561762d84fcb792c412714453f9488e613
  
  addTreatmentCatalogItem: (item: Omit<TreatmentCatalogItem, 'id'>) => Promise<void>;
  updateTreatmentCatalogItem: (item: TreatmentCatalogItem) => Promise<void>;
  
  createPatientTreatmentPlan: (
    patientId: string, 
    treatmentCatalogId: string, 
    customSessionPrice: number, 
    totalSessions: number, 
    discountPercent: number,
    notes?: string
  ) => Promise<void>;
  
  addAppointment: (appointment: Omit<Appointment, 'id' | 'syncedWithGoogle' | 'googleEventId'>) => Promise<{ success: boolean; error?: string }>;
  updateAppointmentStatus: (id: string, newStatus: AppointmentStatus) => Promise<void>;
  
  connectGoogleCalendar: () => Promise<void>;
  disconnectGoogleCalendar: () => Promise<void>;
  syncGcalNow: () => Promise<void>;
  
  resetData: () => void;
  refreshData: () => Promise<void>;
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
  const [isPatientsLoading, setIsPatientsLoading] = useState<boolean>(false);

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
  const [isLoadingData, setIsLoadingData] = useState(false);

<<<<<<< HEAD
  // Carregamento inicial do Supabase (SELECT na tabela patients)
  useEffect(() => {
    let isMounted = true;
    const loadSupabasePatients = async () => {
      if (!isSupabaseConfigured()) return;
      try {
        setIsPatientsLoading(true);
        const remotePatients = await fetchPatientsFromSupabase();
        if (isMounted && remotePatients && remotePatients.length > 0) {
          setPatients(remotePatients);
          localStorage.setItem(`${STORAGE_KEY}_patients`, JSON.stringify(remotePatients));
        }
      } catch (err) {
        console.warn('Não foi possível sincronizar pacientes com Supabase ao iniciar:', err);
      } finally {
        if (isMounted) setIsPatientsLoading(false);
      }
    };

    loadSupabasePatients();
    return () => { isMounted = false; };
  }, []);

=======
  // Função para carregar todos os dados do banco SQLite backend
  const loadDataFromApi = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingData(true);
    try {
      const [fetchedPatients, fetchedTreatments, fetchedPlans, fetchedAppointments, fetchedLogs] = await Promise.all([
        patientsApi.getAll().catch(() => null),
        treatmentsApi.getAll().catch(() => null),
        plansApi.getAll().catch(() => null),
        appointmentsApi.getAll().catch(() => null),
        auditLogsApi.getAll().catch(() => null)
      ]);

      if (fetchedPatients) {
        setPatients(fetchedPatients);
        localStorage.setItem(`${STORAGE_KEY}_patients`, JSON.stringify(fetchedPatients));
      }
      if (fetchedTreatments) {
        setTreatments(fetchedTreatments);
        localStorage.setItem(`${STORAGE_KEY}_treatments`, JSON.stringify(fetchedTreatments));
      }
      if (fetchedPlans) {
        setPlans(fetchedPlans);
        localStorage.setItem(`${STORAGE_KEY}_plans`, JSON.stringify(fetchedPlans));
      }
      if (fetchedAppointments) {
        setAppointments(fetchedAppointments);
        localStorage.setItem(`${STORAGE_KEY}_appointments`, JSON.stringify(fetchedAppointments));
      }
      if (fetchedLogs) {
        setAuditLogs(fetchedLogs);
        localStorage.setItem(`${STORAGE_KEY}_auditLogs`, JSON.stringify(fetchedLogs));
      }
    } catch (err) {
      console.warn('Usando armazenamento local como fallback:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadDataFromApi();
  }, [loadDataFromApi]);

  // Persistência secundária no localStorage para acesso offline rápido
>>>>>>> f95d33561762d84fcb792c412714453f9488e613
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

  // Ao logar com Google, alinha status da Agenda
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

  const logAudit = async (action: string, entity: AuditLog['entity'], targetId: string, details: string, previousValue?: string, newValue?: string) => {
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
    try {
      await auditLogsApi.create(newLog);
    } catch {
      // Ignora erro de auditoria offline
    }
  };

  const addPatient: AppContextType['addPatient'] = async (data) => {
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

    // Atualiza estado local e localStorage imediatamente
    setPatients(prev => [newPatient, ...prev]);
<<<<<<< HEAD
    logAudit('Novo Cadastro de Paciente', 'Paciente', newId, `Paciente ${data.name} cadastrado com sucesso.`);

    // Persiste no Supabase assincronamente se configurado
    if (isSupabaseConfigured()) {
      try {
        await insertPatientToSupabase(newPatient);
      } catch (err) {
        console.error('Erro ao persistir novo paciente no Supabase:', err);
      }
    }

    return newPatient;
=======
    try {
      await patientsApi.create(newPatient);
    } catch (err) {
      console.error('Erro ao salvar no banco:', err);
    }

    await logAudit('Novo Cadastro de Paciente', 'Paciente', newId, `Paciente ${data.name} cadastrado com sucesso.`);
>>>>>>> f95d33561762d84fcb792c412714453f9488e613
  };

  const updatePatient = async (updated: Patient) => {
    setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
<<<<<<< HEAD
    logAudit('Atualização de Dados do Paciente', 'Paciente', updated.id, `Dados cadastrais do paciente ${updated.name} alterados.`);

    if (isSupabaseConfigured()) {
      try {
        await updatePatientInSupabase(updated);
      } catch (err) {
        console.error('Erro ao atualizar paciente no Supabase:', err);
      }
    }
=======
    try {
      await patientsApi.update(updated);
    } catch (err) {
      console.error('Erro ao atualizar no banco:', err);
    }
    await logAudit('Atualização de Dados do Paciente', 'Paciente', updated.id, `Dados cadastrais do paciente ${updated.name} alterados.`);
>>>>>>> f95d33561762d84fcb792c412714453f9488e613
  };

  const deletePatient = async (id: string) => {
    const target = patients.find(p => p.id === id);
    setPatients(prev => prev.filter(p => p.id !== id));
    try {
      await patientsApi.delete(id);
    } catch (err) {
      console.error('Erro ao remover no banco:', err);
    }
    if (target) {
      await logAudit('Exclusão de Cadastro de Paciente', 'Paciente', id, `Exclusão do registro do paciente ${target.name}.`);
    }

    if (isSupabaseConfigured()) {
      try {
        await deletePatientFromSupabase(id);
      } catch (err) {
        console.error('Erro ao excluir paciente no Supabase:', err);
      }
    }
  };

  const bulkImportLeads: AppContextType['bulkImportLeads'] = async (leads, strategy) => {
    const today = new Date().toISOString().split('T')[0];
    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    const sanitizePhone = (ph: string) => ph.replace(/\D/g, '');
    const existingPhoneMap = new Map<string, Patient>();
    patients.forEach(p => {
      const clean = sanitizePhone(p.phone);
      if (clean) existingPhoneMap.set(clean, p);
    });

    const updatedPatientsList = [...patients];
    const newPatientsToInsert: Patient[] = [];

    for (const lead of leads) {
      try {
        const cleanLeadPhone = sanitizePhone(lead.phone);
        const existing = cleanLeadPhone ? existingPhoneMap.get(cleanLeadPhone) : undefined;

        if (existing) {
          if (strategy === 'skip') {
            skippedCount++;
            continue;
          } else if (strategy === 'update') {
            const updatedPatient: Patient = {
              ...existing,
              name: lead.name || existing.name,
              origin: lead.origin || existing.origin,
              status: lead.status || existing.status,
              notes: lead.notes ? (existing.notes ? `${existing.notes} | ${lead.notes}` : lead.notes) : existing.notes,
              tags: Array.from(new Set([...existing.tags, ...(lead.tags || [])]))
            };
            const idx = updatedPatientsList.findIndex(p => p.id === existing.id);
            if (idx >= 0) {
              updatedPatientsList[idx] = updatedPatient;
            }
            updatedCount++;
            continue;
          }
          // strategy === 'create_anyway' continues below
        }

        const newId = `pat-lead-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const initialStatus = lead.status || 'Lead';
        const newPatient: Patient = {
          id: newId,
          name: lead.name,
          cpf: '',
          phone: lead.phone,
          email: lead.email || '',
          birthDate: '',
          address: '',
          origin: lead.origin || 'Campanha Meta',
          status: initialStatus,
          notes: [
            lead.treatment ? `Tratamento de interesse: ${lead.treatment}` : '',
            lead.contact ? `Contato: ${lead.contact}` : '',
            lead.whatsappLink ? `WhatsApp: ${lead.whatsappLink}` : '',
            lead.notes ? lead.notes : ''
          ].filter(Boolean).join(' | '),
          attachments: [],
          timeline: [
            {
              id: `tl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              patientId: newId,
              type: 'remarketing',
              title: 'Lead Importado via Planilha',
              description: `Lead importado com status "${initialStatus}". Tratamento: ${lead.treatment || 'N/A'}.`,
              date: lead.date || today,
              author: currentUser?.name || 'Importador'
            }
          ],
          firstVisitDate: lead.date || today,
          lastVisitDate: lead.date || today,
          tags: lead.tags || ['Lead Remarketing'],
          churnRisk: false
        };

        newPatientsToInsert.push(newPatient);
        if (cleanLeadPhone) {
          existingPhoneMap.set(cleanLeadPhone, newPatient);
        }
        importedCount++;
      } catch (err) {
        failedCount++;
      }
    }

    const finalList = [...newPatientsToInsert, ...updatedPatientsList];
    setPatients(finalList);
    localStorage.setItem(`${STORAGE_KEY}_patients`, JSON.stringify(finalList));

    // Persistência em lote no Supabase
    if (isSupabaseConfigured() && (newPatientsToInsert.length > 0 || updatedCount > 0)) {
      try {
        await bulkUpsertPatientsToSupabase(finalList);
      } catch (err) {
        console.error('Erro na persistência em lote com Supabase:', err);
      }
    }

    logAudit(
      'Importação em Lote de Leads',
      'Paciente',
      'bulk-import',
      `Importação concluída: ${importedCount} criados, ${updatedCount} atualizados, ${skippedCount} ignorados, ${failedCount} erros.`
    );

    return {
      imported: importedCount,
      updated: updatedCount,
      skipped: skippedCount,
      failed: failedCount
    };
  };

  const addTimelineItem = async (patientId: string, type: TimelineItem['type'], title: string, description: string) => {
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

    try {
      await patientsApi.addTimelineItem(patientId, newItem);
    } catch (err) {
      console.error('Erro ao adicionar timeline no banco:', err);
    }
  };

  const addTreatmentCatalogItem = async (data: Omit<TreatmentCatalogItem, 'id'>) => {
    const newId = `trt-${Date.now()}`;
    const newItem: TreatmentCatalogItem = { ...data, id: newId };
    setTreatments(prev => [...prev, newItem]);
    try {
      await treatmentsApi.create(newItem);
    } catch (err) {
      console.error('Erro ao salvar tratamento no banco:', err);
    }
    await logAudit('Adicionado Novo Tratamento ao Catálogo', 'Catálogo', newId, `Tratamento ${data.name} cadastrado no catálogo mestre.`);
  };

  const updateTreatmentCatalogItem = async (updated: TreatmentCatalogItem) => {
    const oldItem = treatments.find(t => t.id === updated.id);
    setTreatments(prev => prev.map(t => t.id === updated.id ? updated : t));
    try {
      await treatmentsApi.update(updated);
    } catch (err) {
      console.error('Erro ao atualizar tratamento no banco:', err);
    }
    await logAudit(
      'Edição do Catálogo Mestre de Tratamento', 
      'Catálogo', 
      updated.id, 
      `Catálogo mestre de ${updated.name} alterado.`,
      `Valor antigo: R$ ${oldItem?.pricePerSession}/sessão`,
      `Valor novo: R$ ${updated.pricePerSession}/sessão`
    );
  };

  const createPatientTreatmentPlan: AppContextType['createPatientTreatmentPlan'] = async (
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
    try {
      await plansApi.create(newPlan);
    } catch (err) {
      console.error('Erro ao salvar plano no banco:', err);
    }

    const isCustomPrice = customSessionPrice !== catalogItem.pricePerSession;
    await logAudit(
      'Criação de Plano de Tratamento',
      'PlanoTratamento',
      newPlanId,
      `Vínculo de ${catalogItem.name} para o paciente ${patient.name}.${notes ? ' Obs: ' + notes : ''}`,
      `Catálogo Padrão: R$ ${catalogItem.pricePerSession}/sessão (${catalogItem.defaultSessions} sessões)`,
      `Plano Vinculado: R$ ${customSessionPrice}/sessão (${totalSessions} sessões) - Total R$ ${totalAmount.toFixed(2)}${isCustomPrice ? ' [VALOR PERSONALIZADO]' : ''}`
    );

    await addTimelineItem(
      patientId,
      'tratamento_contratado',
      `Contratou ${catalogItem.name}`,
      `Plano de ${totalSessions} sessões por R$ ${totalAmount.toFixed(2)} (R$ ${customSessionPrice.toFixed(2)}/sessão).`
    );

    const updatedPatient = { ...patient, status: 'Em tratamento' as const };
    setPatients(prev => prev.map(p => p.id === patientId ? updatedPatient : p));
    try {
      await patientsApi.update(updatedPatient);
    } catch {
      // Ignora falha secundaria
    }
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
    try {
      await appointmentsApi.create(newAppointment);
    } catch (err) {
      console.error('Erro ao salvar agendamento no banco:', err);
    }

    if (syncedWithGoogle) {
      setGcalConfig(prev => ({
        ...prev,
        lastSyncedAt: new Date().toLocaleString('pt-BR'),
        syncedEventsCount: prev.syncedEventsCount + 1
      }));
    }

    await logAudit(
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

    let synced = targetApt.syncedWithGoogle;

    if (newStatus === 'Cancelada' && targetApt.googleEventId && gcalConfig.isConnected) {
      try {
        await deleteGoogleCalendarEvent(targetApt.googleEventId);
        synced = false;
      } catch (err) {
        setGcalError(err instanceof Error ? err.message : 'Falha ao remover evento no Google Agenda.');
      }
    }

    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus, syncedWithGoogle: synced } : a));
    try {
      await appointmentsApi.updateStatus(id, newStatus, synced);
    } catch (err) {
      console.error('Erro ao atualizar status do agendamento no banco:', err);
    }

    await logAudit('Atualização de Status de Agendamento', 'Agendamento', id, `Status da sessão de ${targetApt.patientName} alterado de ${targetApt.status} para ${newStatus}.`);

    if (newStatus === 'Realizada' && targetApt.treatmentPlanId) {
      const targetPlan = plans.find(p => p.id === targetApt.treatmentPlanId);
      if (targetPlan) {
        const completed = targetPlan.completedSessions + 1;
        const remaining = Math.max(0, targetPlan.totalSessions - completed);
        const updatedPlan: PatientTreatmentPlan = {
          ...targetPlan,
          completedSessions: completed,
          remainingSessions: remaining,
          status: remaining === 0 ? 'Concluído' : 'Ativo'
        };
        setPlans(prev => prev.map(pln => pln.id === targetPlan.id ? updatedPlan : pln));
        try {
          await plansApi.update(updatedPlan);
        } catch (err) {
          console.error('Erro ao atualizar plano concluído no banco:', err);
        }
      }

      if (targetApt.patientId) {
        const targetPatient = patients.find(p => p.id === targetApt.patientId);
        if (targetPatient) {
          const updatedPatient = { ...targetPatient, lastVisitDate: targetApt.date };
          setPatients(prev => prev.map(p => p.id === targetApt.patientId ? updatedPatient : p));
          try {
            await patientsApi.update(updatedPatient);
          } catch {
            // Ignora falha secundaria
          }
        }
      }
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
      await logAudit('Conexão Google Agenda', 'Agendamento', 'gcal', 'Integração Google Calendar conectada.');
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
    await logAudit('Conexão Google Agenda', 'Agendamento', 'gcal', 'Integração Google Calendar desconectada (sessão do app mantida).');
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
        for (const apt of imported) {
          await appointmentsApi.create(apt).catch(() => null);
        }
      }

      setGcalConfig(prev => ({
        ...prev,
        isConnected: true,
        lastSyncedAt: new Date().toLocaleString('pt-BR'),
        syncedEventsCount: events.length,
        webhookStatus: 'Ativo (Tempo Real)',
        accountEmail: prev.accountEmail || currentUser?.email || ''
      }));

      await logAudit(
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
      isPatientsLoading,
      treatments,
      plans,
      appointments,
      auditLogs,
      gcalConfig,
      campaigns,
      gcalBusy,
      gcalError,
      isLoadingData,
      addPatient,
      updatePatient,
      deletePatient,
      bulkImportLeads,
      addTimelineItem,
      addTreatmentCatalogItem,
      updateTreatmentCatalogItem,
      createPatientTreatmentPlan,
      addAppointment,
      updateAppointmentStatus,
      connectGoogleCalendar,
      disconnectGoogleCalendar,
      syncGcalNow,
      resetData,
      refreshData: loadDataFromApi
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
