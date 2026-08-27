import {
  User,
  Patient,
  TreatmentCatalogItem,
  PatientTreatmentPlan,
  Appointment,
  AuditLog,
  TimelineItem,
  AppointmentStatus
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('integrar_central_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
  } catch (err) {
    throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
  }

  const rawText = await response.text();
  let data: any;

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    console.error('Resposta não-JSON recebida da API:', rawText);
    throw new Error(
      `O servidor respondeu em formato inválido (${response.status}). Verifique as variáveis de ambiente e o servidor no Vercel.`
    );
  }

  if (!response.ok) {
    throw new Error(data.error || `Erro (${response.status}) na comunicação com o servidor.`);
  }

  return data as T;
}

export const authApi = {
  register: (userData: { name: string; email: string; password: string; role: string; specialty?: string }) =>
    request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  login: (credentials: { email: string; password: string }) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  getMe: () => request<{ user: User }>('/auth/me')
};

export const patientsApi = {
  getAll: () => request<Patient[]>('/patients'),
  create: (patient: Patient) =>
    request<{ success: boolean }>('/patients', {
      method: 'POST',
      body: JSON.stringify(patient)
    }),
  update: (patient: Patient) =>
    request<{ success: boolean }>(`/patients/${patient.id}`, {
      method: 'PUT',
      body: JSON.stringify(patient)
    }),
  delete: (id: string) =>
    request<{ success: boolean }>(`/patients/${id}`, {
      method: 'DELETE'
    }),
  addTimelineItem: (patientId: string, item: TimelineItem) =>
    request<{ success: boolean; timeline: TimelineItem[] }>(`/patients/${patientId}/timeline`, {
      method: 'POST',
      body: JSON.stringify(item)
    })
};

export const treatmentsApi = {
  getAll: () => request<TreatmentCatalogItem[]>('/treatments'),
  create: (item: TreatmentCatalogItem) =>
    request<{ success: boolean }>('/treatments', {
      method: 'POST',
      body: JSON.stringify(item)
    }),
  update: (item: TreatmentCatalogItem) =>
    request<{ success: boolean }>(`/treatments/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify(item)
    })
};

export const plansApi = {
  getAll: () => request<PatientTreatmentPlan[]>('/plans'),
  create: (plan: PatientTreatmentPlan) =>
    request<{ success: boolean }>('/plans', {
      method: 'POST',
      body: JSON.stringify(plan)
    }),
  update: (plan: PatientTreatmentPlan) =>
    request<{ success: boolean }>(`/plans/${plan.id}`, {
      method: 'PUT',
      body: JSON.stringify(plan)
    })
};

export const appointmentsApi = {
  getAll: () => request<Appointment[]>('/appointments'),
  create: (appointment: Appointment) =>
    request<{ success: boolean }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment)
    }),
  updateStatus: (id: string, status: AppointmentStatus, syncedWithGoogle: boolean) =>
    request<{ success: boolean }>(`/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, syncedWithGoogle })
    })
};

export const auditLogsApi = {
  getAll: () => request<AuditLog[]>('/audit-logs'),
  create: (log: AuditLog) =>
    request<{ success: boolean }>('/audit-logs', {
      method: 'POST',
      body: JSON.stringify(log)
    })
};
