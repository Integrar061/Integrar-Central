import { createClient } from '@supabase/supabase-js';

// Prioriza explicitamente a SUPABASE_SERVICE_ROLE_KEY para operações de backend com bypass de RLS
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseKey);
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

export const supabaseDb = {
  // Users
  getUserByEmail: async (email) => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).maybeSingle();
    if (error) {
      console.warn('Erro Supabase getUserByEmail:', error.message);
      return null;
    }
    return data;
  },

  getUserById: async (id) => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    if (error) return null;
    return data;
  },

  createUser: async (user) => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('users').insert([user]).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  // Patients
  getPatients: async () => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('patients').select('*');
    if (error) throw new Error(error.message);
    return data || [];
  },

  createPatient: async (patient) => {
    if (!supabase) return null;
    const { error } = await supabase.from('patients').insert([patient]);
    if (error) throw new Error(error.message);
    return true;
  },

  updatePatient: async (patient) => {
    if (!supabase) return null;
    const { error } = await supabase.from('patients').update(patient).eq('id', patient.id);
    if (error) throw new Error(error.message);
    return true;
  },

  deletePatient: async (id) => {
    if (!supabase) return null;
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  },

  // Treatments
  getTreatments: async () => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('treatments').select('*');
    if (error) throw new Error(error.message);
    return data || [];
  },

  createTreatment: async (treatment) => {
    if (!supabase) return null;
    const { error } = await supabase.from('treatments').insert([treatment]);
    if (error) throw new Error(error.message);
    return true;
  },

  updateTreatment: async (treatment) => {
    if (!supabase) return null;
    const { error } = await supabase.from('treatments').update(treatment).eq('id', treatment.id);
    if (error) throw new Error(error.message);
    return true;
  },

  // Plans
  getPlans: async () => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('plans').select('*');
    if (error) throw new Error(error.message);
    return data || [];
  },

  createPlan: async (plan) => {
    if (!supabase) return null;
    const { error } = await supabase.from('plans').insert([plan]);
    if (error) throw new Error(error.message);
    return true;
  },

  updatePlan: async (plan) => {
    if (!supabase) return null;
    const { error } = await supabase.from('plans').update(plan).eq('id', plan.id);
    if (error) throw new Error(error.message);
    return true;
  },

  // Appointments
  getAppointments: async () => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('appointments').select('*');
    if (error) throw new Error(error.message);
    return data || [];
  },

  createAppointment: async (appointment) => {
    if (!supabase) return null;
    const { error } = await supabase.from('appointments').insert([appointment]);
    if (error) throw new Error(error.message);
    return true;
  },

  updateAppointmentStatus: async (id, status, syncedWithGoogle) => {
    if (!supabase) return null;
    const { error } = await supabase.from('appointments').update({ status, synced_with_google: syncedWithGoogle ? 1 : 0 }).eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  },

  // Audit Logs
  getAuditLogs: async () => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('audit_logs').select('*').limit(200);
    if (error) throw new Error(error.message);
    return data || [];
  },

  createAuditLog: async (log) => {
    if (!supabase) return null;
    const { error } = await supabase.from('audit_logs').insert([log]);
    if (error) throw new Error(error.message);
    return true;
  }
};
