import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isSupabaseConfigured, supabaseDb } from '../server/supabaseDb.js';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'integrar_central_secret_key_2026';

app.use(cors());
app.use(express.json());

// Garante que todas as respostas, sem exceção, sejam em formato JSON
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Armazenamento em memória para fallback se as variáveis do Supabase não estiverem preenchidas
const memoryStore = {
  users: [],
  patients: [],
  treatments: [],
  plans: [],
  appointments: [],
  auditLogs: []
};

// Middleware de autenticação por token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acesso não autorizado. Token de sessão ausente.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
    req.user = user;
    next();
  });
};

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'ADMIN', specialty = '' } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let existingUser = null;

    if (isSupabaseConfigured()) {
      existingUser = await supabaseDb.getUserByEmail(cleanEmail);
    } else {
      existingUser = memoryStore.users.find(u => u.email === cleanEmail);
    }

    if (existingUser) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userId = `usr-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const newUserObj = {
      id: userId,
      name,
      email: cleanEmail,
      password_hash,
      role,
      specialty: specialty || null,
      created_at: createdAt
    };

    if (isSupabaseConfigured()) {
      await supabaseDb.createUser(newUserObj);
    } else {
      memoryStore.users.push(newUserObj);
    }

    const user = { id: userId, name, email: cleanEmail, role, specialty };
    const token = jwt.sign({ id: userId, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

    return res.status(201).json({ user, token });
  } catch (err) {
    console.error('Erro ao cadastrar usuário:', err);
    return res.status(500).json({ error: err.message || 'Erro interno ao realizar cadastro.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let dbUser = null;

    if (isSupabaseConfigured()) {
      dbUser = await supabaseDb.getUserByEmail(cleanEmail);
    } else {
      dbUser = memoryStore.users.find(u => u.email === cleanEmail);
    }

    if (!dbUser) {
      return res.status(401).json({ error: 'Nenhum usuário encontrado com este e-mail.' });
    }

    const isMatch = await bcrypt.compare(password, dbUser.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Senha incorreta. Verifique os dados digitados.' });
    }

    const user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      specialty: dbUser.specialty,
      googleId: dbUser.google_id
    };

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

    return res.json({ user, token });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ error: err.message || 'Erro interno ao realizar login.' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    let dbUser = null;
    if (isSupabaseConfigured()) {
      dbUser = await supabaseDb.getUserById(req.user.id);
    } else {
      dbUser = memoryStore.users.find(u => u.id === req.user.id);
    }

    if (!dbUser) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.json({
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        specialty: dbUser.specialty,
        googleId: dbUser.google_id
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao verificar sessão.' });
  }
});

// ==================== PATIENTS ROUTES ====================

app.get('/api/patients', async (req, res) => {
  try {
    if (isSupabaseConfigured()) {
      const data = await supabaseDb.getPatients();
      return res.json(data || []);
    }
    return res.json(memoryStore.patients);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao carregar lista de pacientes.' });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const p = req.body;
    if (isSupabaseConfigured()) {
      await supabaseDb.createPatient(p);
    } else {
      memoryStore.patients.unshift(p);
    }
    return res.status(201).json({ success: true, patient: p });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao cadastrar paciente.' });
  }
});

app.put('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const p = req.body;
    if (isSupabaseConfigured()) {
      await supabaseDb.updatePatient(p);
    } else {
      memoryStore.patients = memoryStore.patients.map(item => item.id === id ? p : item);
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar paciente.' });
  }
});

app.delete('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isSupabaseConfigured()) {
      await supabaseDb.deletePatient(id);
    } else {
      memoryStore.patients = memoryStore.patients.filter(item => item.id !== id);
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao excluir paciente.' });
  }
});

app.post('/api/patients/:id/timeline', async (req, res) => {
  try {
    const { id } = req.params;
    const item = req.body;

    if (isSupabaseConfigured()) {
      const patient = await supabaseDb.getPatients().then(list => list.find(p => p.id === id));
      if (patient) {
        const updatedTimeline = [item, ...(patient.timeline || [])];
        await supabaseDb.updatePatient({ ...patient, timeline: updatedTimeline });
        return res.json({ success: true, timeline: updatedTimeline });
      }
    } else {
      const target = memoryStore.patients.find(p => p.id === id);
      if (target) {
        target.timeline = [item, ...(target.timeline || [])];
        return res.json({ success: true, timeline: target.timeline });
      }
    }

    return res.status(404).json({ error: 'Paciente não encontrado.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao adicionar item na timeline.' });
  }
});

// ==================== TREATMENTS ROUTES ====================

app.get('/api/treatments', async (req, res) => {
  try {
    if (isSupabaseConfigured()) {
      const data = await supabaseDb.getTreatments();
      return res.json(data || []);
    }
    return res.json(memoryStore.treatments);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar tratamentos.' });
  }
});

app.post('/api/treatments', async (req, res) => {
  try {
    const t = req.body;
    if (isSupabaseConfigured()) {
      await supabaseDb.createTreatment(t);
    } else {
      memoryStore.treatments.push(t);
    }
    return res.status(201).json({ success: true, item: t });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar tratamento.' });
  }
});

app.put('/api/treatments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const t = req.body;
    if (isSupabaseConfigured()) {
      await supabaseDb.updateTreatment(t);
    } else {
      memoryStore.treatments = memoryStore.treatments.map(item => item.id === id ? t : item);
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar tratamento.' });
  }
});

// ==================== PLANS ROUTES ====================

app.get('/api/plans', async (req, res) => {
  try {
    if (isSupabaseConfigured()) {
      const data = await supabaseDb.getPlans();
      return res.json(data || []);
    }
    return res.json(memoryStore.plans);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao carregar planos.' });
  }
});

app.post('/api/plans', async (req, res) => {
  try {
    const p = req.body;
    if (isSupabaseConfigured()) {
      await supabaseDb.createPlan(p);
    } else {
      memoryStore.plans.unshift(p);
    }
    return res.status(201).json({ success: true, plan: p });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar plano.' });
  }
});

app.put('/api/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const p = req.body;
    if (isSupabaseConfigured()) {
      await supabaseDb.updatePlan(p);
    } else {
      memoryStore.plans = memoryStore.plans.map(item => item.id === id ? p : item);
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar plano.' });
  }
});

// ==================== APPOINTMENTS ROUTES ====================

app.get('/api/appointments', async (req, res) => {
  try {
    if (isSupabaseConfigured()) {
      const data = await supabaseDb.getAppointments();
      return res.json(data || []);
    }
    return res.json(memoryStore.appointments);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar agendamentos.' });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const a = req.body;
    if (isSupabaseConfigured()) {
      await supabaseDb.createAppointment(a);
    } else {
      memoryStore.appointments.unshift(a);
    }
    return res.status(201).json({ success: true, appointment: a });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar agendamento.' });
  }
});

app.put('/api/appointments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, syncedWithGoogle } = req.body;
    if (isSupabaseConfigured()) {
      await supabaseDb.updateAppointmentStatus(id, status, syncedWithGoogle);
    } else {
      memoryStore.appointments = memoryStore.appointments.map(item => item.id === id ? { ...item, status, syncedWithGoogle } : item);
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar agendamento.' });
  }
});

// ==================== AUDIT LOGS ROUTES ====================

app.get('/api/audit-logs', async (req, res) => {
  try {
    if (isSupabaseConfigured()) {
      const data = await supabaseDb.getAuditLogs();
      return res.json(data || []);
    }
    return res.json(memoryStore.auditLogs);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao carregar logs.' });
  }
});

app.post('/api/audit-logs', async (req, res) => {
  try {
    const l = req.body;
    if (isSupabaseConfigured()) {
      await supabaseDb.createAuditLog(l);
    } else {
      memoryStore.auditLogs.unshift(l);
    }
    return res.status(201).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao registrar log.' });
  }
});

// Captura de rotas inexistentes (404) retornando sempre JSON
app.use((req, res) => {
  res.status(404).json({ error: `Rota de API não encontrada: ${req.method} ${req.originalUrl}` });
});

// Captura global de exceções da API para NUNCA vazar HTML de erro
app.use((err, req, res, _next) => {
  console.error('Exceção não tratada na API Serverless:', err);
  res.status(500).json({ error: err.message || 'Ocorreu um erro interno no servidor.' });
});

export default app;
