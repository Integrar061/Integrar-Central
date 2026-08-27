import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Patient } from '../types';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_SERVICE_ROLE_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseKey && supabaseUrl.startsWith('http'));
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

// Converte do modelo do TypeScript para a linha da tabela Supabase
export function patientToRow(patient: Patient): Record<string, any> {
  return {
    id: patient.id,
    name: patient.name,
    cpf: patient.cpf || '',
    phone: patient.phone || '',
    email: patient.email || '',
    birth_date: patient.birthDate || null,
    address: patient.address || '',
    origin: patient.origin || 'Outros',
    status: patient.status || 'Ativo',
    notes: patient.notes || '',
    tags: patient.tags || [],
    attachments: patient.attachments || [],
    timeline: patient.timeline || [],
    first_visit_date: patient.firstVisitDate || new Date().toISOString().split('T')[0],
    last_visit_date: patient.lastVisitDate || new Date().toISOString().split('T')[0],
    churn_risk: Boolean(patient.churnRisk),
    churn_risk_reason: patient.churnRiskReason || null,
    follow_up_days: patient.followUpDays || null,
    updated_at: new Date().toISOString()
  };
}

// Converte da linha do Supabase (suporta snake_case e camelCase) para o modelo TypeScript
export function rowToPatient(row: Record<string, any>): Patient {
  return {
    id: String(row.id || `pat-${Date.now()}`),
    name: String(row.name || ''),
    cpf: String(row.cpf || ''),
    phone: String(row.phone || ''),
    email: String(row.email || ''),
    birthDate: String(row.birth_date || row.birthDate || ''),
    address: String(row.address || ''),
    origin: (row.origin || 'Outros') as Patient['origin'],
    status: (row.status || 'Ativo') as Patient['status'],
    notes: String(row.notes || ''),
    tags: Array.isArray(row.tags) ? row.tags : (typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : []),
    attachments: Array.isArray(row.attachments) ? row.attachments : (typeof row.attachments === 'string' ? JSON.parse(row.attachments || '[]') : []),
    timeline: Array.isArray(row.timeline) ? row.timeline : (typeof row.timeline === 'string' ? JSON.parse(row.timeline || '[]') : []),
    firstVisitDate: String(row.first_visit_date || row.firstVisitDate || new Date().toISOString().split('T')[0]),
    lastVisitDate: String(row.last_visit_date || row.lastVisitDate || new Date().toISOString().split('T')[0]),
    churnRisk: Boolean(row.churn_risk ?? row.churnRisk ?? false),
    churnRiskReason: row.churn_risk_reason || row.churnRiskReason,
    followUpDays: row.follow_up_days || row.followUpDays
  };
}

/**
 * SELECT * FROM patients
 */
export async function fetchPatientsFromSupabase(): Promise<Patient[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.warn('Erro ao buscar pacientes no Supabase:', error.message);
      // Tentativa de fallback sem order por created_at se a coluna não existir
      const retry = await supabase.from('patients').select('*');
      if (retry.error) throw retry.error;
      return (retry.data || []).map(rowToPatient);
    }

    return (data || []).map(rowToPatient);
  } catch (err) {
    console.error('Falha na query SELECT de pacientes no Supabase:', err);
    return null;
  }
}

/**
 * INSERT INTO patients
 */
export async function insertPatientToSupabase(patient: Patient): Promise<Patient | null> {
  if (!supabase) return null;
  try {
    const row = patientToRow(patient);
    const { data, error } = await supabase
      .from('patients')
      .insert([row])
      .select()
      .single();

    if (error) {
      console.error('Erro ao inserir paciente no Supabase:', error.message);
      throw error;
    }

    return data ? rowToPatient(data) : patient;
  } catch (err) {
    console.error('Falha no INSERT de paciente no Supabase:', err);
    return null;
  }
}

/**
 * UPDATE patients
 */
export async function updatePatientInSupabase(patient: Patient): Promise<Patient | null> {
  if (!supabase) return null;
  try {
    const row = patientToRow(patient);
    const { data, error } = await supabase
      .from('patients')
      .update(row)
      .eq('id', patient.id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar paciente no Supabase:', error.message);
      throw error;
    }

    return data ? rowToPatient(data) : patient;
  } catch (err) {
    console.error('Falha no UPDATE de paciente no Supabase:', err);
    return null;
  }
}

/**
 * DELETE FROM patients
 */
export async function deletePatientFromSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar paciente no Supabase:', error.message);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Falha no DELETE de paciente no Supabase:', err);
    return false;
  }
}

/**
 * BULK INSERT / UPSERT de pacientes (usado na importação de CSV)
 */
export async function bulkUpsertPatientsToSupabase(patients: Patient[]): Promise<{ success: boolean; count: number; error?: string }> {
  if (!supabase) return { success: true, count: patients.length };
  try {
    const rows = patients.map(patientToRow);
    const { error } = await supabase
      .from('patients')
      .upsert(rows, { onConflict: 'id' });

    if (error) throw error;
    return { success: true, count: rows.length };
  } catch (err) {
    console.error('Erro ao inserir múltiplos pacientes no Supabase:', err);
    return { success: false, count: 0, error: err instanceof Error ? err.message : 'Erro desconhecido' };
  }
}
