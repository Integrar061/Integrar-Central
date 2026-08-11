import { 
  TreatmentCatalogItem, 
  Patient, 
  PatientTreatmentPlan, 
  Appointment, 
  AuditLog, 
  GoogleCalendarConfig,
  CampaignHistory
} from '../types';

/** Catálogo inicial vazio — cadastre os tratamentos reais da clínica. */
export const INITIAL_TREATMENTS: TreatmentCatalogItem[] = [];

/** Sem pacientes fictícios — comece cadastrando os reais. */
export const INITIAL_PATIENTS: Patient[] = [];

export const INITIAL_PLANS: PatientTreatmentPlan[] = [];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_GCAL_CONFIG: GoogleCalendarConfig = {
  isConnected: false,
  accountEmail: '',
  autoSync: true,
  webhookStatus: 'Inativo',
  lastSyncedAt: '',
  syncedEventsCount: 0
};

export const INITIAL_CAMPAIGNS: CampaignHistory[] = [];
