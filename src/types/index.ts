export type UserRole = 'ADMIN' | 'RECEPCAO' | 'FINANCEIRO' | 'PROFISSIONAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  specialty?: string;
}

export type PatientStatus = 'Lead' | 'Ativo' | 'Em tratamento' | 'Inativo' | 'Ex-paciente';
export type PatientOrigin = 'Indicação' | 'Instagram' | 'Google' | 'Campanha Meta' | 'Evento' | 'Outros';

export interface ClinicalAttachment {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  size: string;
  url?: string;
}

export interface TimelineItem {
  id: string;
  patientId: string;
  type: 'mensagem' | 'ligacao' | 'consulta' | 'tratamento_contratado' | 'log_sistema' | 'remarketing';
  title: string;
  description: string;
  date: string;
  author: string;
}

export interface Patient {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  origin: PatientOrigin;
  status: PatientStatus;
  notes: string;
  attachments: ClinicalAttachment[];
  timeline: TimelineItem[];
  firstVisitDate: string;
  lastVisitDate: string;
  tags: string[];
  churnRisk: boolean; // Calculado se faltou 2+ consultas ou >90 dias sem visita
  churnRiskReason?: string;
  followUpDays?: number; // Régua de lead: 3, 7, 15 dias
}

export interface TreatmentCatalogItem {
  id: string;
  name: string;
  category: 'Estético' | 'Terapêutico' | 'Wellness' | 'Integrativo';
  pricePerSession: number;
  defaultSessions: number;
  totalPackagePrice: number;
  durationMinutes: number; // 30, 45, 60, 90 min
  enabledProfessionals: string[];
  active: boolean;
}

export interface PatientTreatmentPlan {
  id: string;
  patientId: string;
  patientName: string;
  treatmentCatalogId: string;
  treatmentName: string;
  category: string;
  sessionPrice: number; // Pode ser personalizado
  totalSessions: number;
  completedSessions: number;
  remainingSessions: number;
  discountPercent: number;
  totalAmount: number;
  paidAmount: number;
  openBalance: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  status: 'Ativo' | 'Concluído' | 'Cancelado';
}

export type AppointmentStatus = 'Agendada' | 'Confirmada' | 'Realizada' | 'Faltou' | 'Cancelada' | 'Remarcada';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  treatmentPlanId?: string;
  treatmentName: string;
  professional: string;
  room: 'Sala 01 - Ozônio' | 'Sala 02 - Estética' | 'Sala 03 - Consultório 1' | 'Sala 04 - Soroterapia';
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  status: AppointmentStatus;
  syncedWithGoogle: boolean;
  googleEventId?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: 'Paciente' | 'PlanoTratamento' | 'Catálogo' | 'Agendamento' | 'Financeiro';
  targetId: string;
  previousValue?: string;
  newValue?: string;
  details: string;
}

export interface GoogleCalendarConfig {
  isConnected: boolean;
  accountEmail: string;
  autoSync: boolean;
  webhookStatus: 'Ativo (Tempo Real)' | 'Inativo' | 'Erro';
  lastSyncedAt: string;
  syncedEventsCount: number;
}

export interface CampaignHistory {
  id: string;
  title: string;
  targetGroup: string;
  sentAt: string;
  channel: 'WhatsApp' | 'E-mail';
  recipientsCount: number;
  conversionsCount: number;
}
