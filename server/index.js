import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbAll, dbGet, dbRun, initDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'integrar_central_secret_key_2026';

app.use(cors());
app.use(express.json());

// Middlewares de autenticação simples
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acesso não autorizado. Token ausente.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado.' });
    req.user = user;
    next();
  });
};

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'ADMIN', specialty = '' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existingUser) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userId = `usr-${Date.now()}`;
    const createdAt = new Date().toISOString();

    await dbRun(
      `INSERT INTO users (id, name, email, password_hash, role, specialty, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, email.toLowerCase(), password_hash, role, specialty, createdAt]
    );

    const user = { id: userId, name, email: email.toLowerCase(), role, specialty };
    const token = jwt.sign({ id: userId, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Erro no registro:', err);
    res.status(500).json({ error: 'Erro interno ao cadastrar usuário.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const dbUser = await dbGet('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!dbUser) {
      return res.status(401).json({ error: 'Usuário não encontrado com este e-mail.' });
    }

    const isMatch = await bcrypt.compare(password, dbUser.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Senha incorreta.' });
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

    res.json({ user, token });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const dbUser = await dbGet('SELECT id, name, email, role, specialty, google_id FROM users WHERE id = ?', [req.user.id]);
    if (!dbUser) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.json({
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
    res.status(500).json({ error: 'Erro ao verificar sessão.' });
  }
});

// ==================== PATIENTS ROUTES ====================

app.get('/api/patients', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM patients ORDER BY rowid DESC');
    const patients = rows.map(r => ({
      id: r.id,
      name: r.name,
      cpf: r.cpf || '',
      birthDate: r.birth_date || '',
      phone: r.phone || '',
      email: r.email || '',
      address: r.address || '',
      origin: r.origin || 'Outros',
      status: r.status || 'Lead',
      notes: r.notes || '',
      attachments: r.attachments ? JSON.parse(r.attachments) : [],
      timeline: r.timeline ? JSON.parse(r.timeline) : [],
      firstVisitDate: r.first_visit_date || '',
      lastVisitDate: r.last_visit_date || '',
      churnRisk: Boolean(r.churn_risk),
      churnRiskReason: r.churn_risk_reason || undefined,
      followUpDays: r.follow_up_days || undefined,
      tags: r.tags ? JSON.parse(r.tags) : []
    }));
    res.json(patients);
  } catch (err) {
    console.error('Erro ao buscar pacientes:', err);
    res.status(500).json({ error: 'Erro ao carregar lista de pacientes.' });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const p = req.body;
    await dbRun(
      `INSERT INTO patients (id, name, cpf, birth_date, phone, email, address, origin, status, notes, attachments, timeline, first_visit_date, last_visit_date, churn_risk, churn_risk_reason, follow_up_days, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        p.name,
        p.cpf || '',
        p.birthDate || '',
        p.phone || '',
        p.email || '',
        p.address || '',
        p.origin || 'Outros',
        p.status || 'Lead',
        p.notes || '',
        JSON.stringify(p.attachments || []),
        JSON.stringify(p.timeline || []),
        p.firstVisitDate || '',
        p.lastVisitDate || '',
        p.churnRisk ? 1 : 0,
        p.churnRiskReason || null,
        p.followUpDays || null,
        JSON.stringify(p.tags || [])
      ]
    );
    res.status(201).json({ success: true, patient: p });
  } catch (err) {
    console.error('Erro ao salvar paciente:', err);
    res.status(500).json({ error: 'Erro ao cadastrar paciente.' });
  }
});

app.put('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const p = req.body;
    await dbRun(
      `UPDATE patients SET
        name = ?, cpf = ?, birth_date = ?, phone = ?, email = ?, address = ?,
        origin = ?, status = ?, notes = ?, attachments = ?, timeline = ?,
        first_visit_date = ?, last_visit_date = ?, churn_risk = ?, churn_risk_reason = ?,
        follow_up_days = ?, tags = ?
       WHERE id = ?`,
      [
        p.name,
        p.cpf || '',
        p.birthDate || '',
        p.phone || '',
        p.email || '',
        p.address || '',
        p.origin || 'Outros',
        p.status || 'Lead',
        p.notes || '',
        JSON.stringify(p.attachments || []),
        JSON.stringify(p.timeline || []),
        p.firstVisitDate || '',
        p.lastVisitDate || '',
        p.churnRisk ? 1 : 0,
        p.churnRiskReason || null,
        p.followUpDays || null,
        JSON.stringify(p.tags || []),
        id
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao atualizar paciente:', err);
    res.status(500).json({ error: 'Erro ao atualizar paciente.' });
  }
});

app.delete('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM patients WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir paciente.' });
  }
});

app.post('/api/patients/:id/timeline', async (req, res) => {
  try {
    const { id } = req.params;
    const item = req.body;
    const row = await dbGet('SELECT timeline FROM patients WHERE id = ?', [id]);
    if (!row) return res.status(404).json({ error: 'Paciente não encontrado.' });

    const currentTimeline = row.timeline ? JSON.parse(row.timeline) : [];
    const updatedTimeline = [item, ...currentTimeline];

    await dbRun('UPDATE patients SET timeline = ? WHERE id = ?', [JSON.stringify(updatedTimeline), id]);
    res.json({ success: true, timeline: updatedTimeline });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao adicionar item na timeline.' });
  }
});

// ==================== TREATMENTS ROUTES ====================

app.get('/api/treatments', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM treatments');
    const items = rows.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      pricePerSession: r.price_per_session,
      defaultSessions: r.default_sessions,
      totalPackagePrice: r.total_package_price,
      durationMinutes: r.duration_minutes,
      enabledProfessionals: r.enabled_professionals ? JSON.parse(r.enabled_professionals) : [],
      active: Boolean(r.active)
    }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar catálogo de tratamentos.' });
  }
});

app.post('/api/treatments', async (req, res) => {
  try {
    const t = req.body;
    await dbRun(
      `INSERT INTO treatments (id, name, category, price_per_session, default_sessions, total_package_price, duration_minutes, enabled_professionals, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        t.id,
        t.name,
        t.category,
        t.pricePerSession,
        t.defaultSessions,
        t.totalPackagePrice,
        t.durationMinutes,
        JSON.stringify(t.enabledProfessionals || []),
        t.active !== false ? 1 : 0
      ]
    );
    res.status(201).json({ success: true, item: t });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar item de tratamento.' });
  }
});

app.put('/api/treatments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const t = req.body;
    await dbRun(
      `UPDATE treatments SET
        name = ?, category = ?, price_per_session = ?, default_sessions = ?,
        total_package_price = ?, duration_minutes = ?, enabled_professionals = ?, active = ?
       WHERE id = ?`,
      [
        t.name,
        t.category,
        t.pricePerSession,
        t.defaultSessions,
        t.totalPackagePrice,
        t.durationMinutes,
        JSON.stringify(t.enabledProfessionals || []),
        t.active !== false ? 1 : 0,
        id
      ]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar tratamento.' });
  }
});

// ==================== PLANS ROUTES ====================

app.get('/api/plans', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM plans ORDER BY rowid DESC');
    const plans = rows.map(r => ({
      id: r.id,
      patientId: r.patient_id,
      patientName: r.patient_name,
      treatmentCatalogId: r.treatment_catalog_id,
      treatmentName: r.treatment_name,
      category: r.category,
      sessionPrice: r.session_price,
      totalSessions: r.total_sessions,
      completedSessions: r.completed_sessions,
      remainingSessions: r.remaining_sessions,
      discountPercent: r.discount_percent,
      totalAmount: r.total_amount,
      paidAmount: r.paid_amount,
      openBalance: r.open_balance,
      createdAt: r.created_at,
      createdBy: r.created_by,
      updatedAt: r.updated_at,
      status: r.status
    }));
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar planos de tratamento.' });
  }
});

app.post('/api/plans', async (req, res) => {
  try {
    const p = req.body;
    await dbRun(
      `INSERT INTO plans (id, patient_id, patient_name, treatment_catalog_id, treatment_name, category, session_price, total_sessions, completed_sessions, remaining_sessions, discount_percent, total_amount, paid_amount, open_balance, created_at, created_by, updated_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        p.patientId,
        p.patientName,
        p.treatmentCatalogId,
        p.treatmentName,
        p.category,
        p.sessionPrice,
        p.totalSessions,
        p.completedSessions || 0,
        p.remainingSessions,
        p.discountPercent || 0,
        p.totalAmount,
        p.paidAmount || 0,
        p.openBalance,
        p.createdAt,
        p.createdBy,
        p.updatedAt,
        p.status || 'Ativo'
      ]
    );
    res.status(201).json({ success: true, plan: p });
  } catch (err) {
    console.error('Erro ao salvar plano:', err);
    res.status(500).json({ error: 'Erro ao criar plano de tratamento.' });
  }
});

app.put('/api/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const p = req.body;
    await dbRun(
      `UPDATE plans SET
        completed_sessions = ?, remaining_sessions = ?, status = ?, updated_at = ?
       WHERE id = ?`,
      [p.completedSessions, p.remainingSessions, p.status, p.updatedAt || new Date().toISOString().split('T')[0], id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar plano.' });
  }
});

// ==================== APPOINTMENTS ROUTES ====================

app.get('/api/appointments', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM appointments ORDER BY date DESC, start_time ASC');
    const appointments = rows.map(r => ({
      id: r.id,
      patientId: r.patient_id || '',
      patientName: r.patient_name,
      patientPhone: r.patient_phone || '',
      treatmentPlanId: r.treatment_plan_id || undefined,
      treatmentName: r.treatment_name,
      professional: r.professional,
      room: r.room,
      date: r.date,
      startTime: r.start_time,
      endTime: r.end_time,
      durationMinutes: r.duration_minutes,
      status: r.status,
      syncedWithGoogle: Boolean(r.synced_with_google),
      googleEventId: r.google_event_id || undefined,
      notes: r.notes || undefined
    }));
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos.' });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const a = req.body;
    await dbRun(
      `INSERT INTO appointments (id, patient_id, patient_name, patient_phone, treatment_plan_id, treatment_name, professional, room, date, start_time, end_time, duration_minutes, status, synced_with_google, google_event_id, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        a.id,
        a.patientId || '',
        a.patientName,
        a.patientPhone || '',
        a.treatmentPlanId || null,
        a.treatmentName,
        a.professional,
        a.room,
        a.date,
        a.startTime,
        a.endTime,
        a.durationMinutes,
        a.status || 'Agendada',
        a.syncedWithGoogle ? 1 : 0,
        a.googleEventId || null,
        a.notes || null
      ]
    );
    res.status(201).json({ success: true, appointment: a });
  } catch (err) {
    console.error('Erro ao salvar agendamento:', err);
    res.status(500).json({ error: 'Erro ao criar agendamento.' });
  }
});

app.put('/api/appointments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, syncedWithGoogle } = req.body;
    await dbRun(
      `UPDATE appointments SET status = ?, synced_with_google = ? WHERE id = ?`,
      [status, syncedWithGoogle !== undefined ? (syncedWithGoogle ? 1 : 0) : 1, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar agendamento.' });
  }
});

// ==================== AUDIT LOGS ROUTES ====================

app.get('/api/audit-logs', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM audit_logs ORDER BY rowid DESC LIMIT 200');
    const logs = rows.map(r => ({
      id: r.id,
      timestamp: r.timestamp,
      userName: r.user_name,
      userRole: r.user_role,
      action: r.action,
      entity: r.entity,
      targetId: r.target_id,
      previousValue: r.previous_value || undefined,
      newValue: r.new_value || undefined,
      details: r.details
    }));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar logs de auditoria.' });
  }
});

app.post('/api/audit-logs', async (req, res) => {
  try {
    const l = req.body;
    await dbRun(
      `INSERT INTO audit_logs (id, timestamp, user_name, user_role, action, entity, target_id, previous_value, new_value, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        l.id,
        l.timestamp,
        l.userName,
        l.userRole,
        l.action,
        l.entity,
        l.targetId,
        l.previousValue || null,
        l.newValue || null,
        l.details
      ]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar log de auditoria.' });
  }
});

// Inicializa banco de dados e abre o servidor
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor de Banco de Dados da Clínica rodando em http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Falha ao inicializar o banco de dados:', err);
});
