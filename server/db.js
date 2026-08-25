import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados SQLite:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite em:', dbPath);
  }
});

// Executa comandos SQL em modo Promise
export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Inicializa o esquema das tabelas
export const initDb = async () => {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      specialty TEXT,
      google_id TEXT,
      created_at TEXT NOT NULL
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      cpf TEXT,
      birth_date TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      origin TEXT,
      status TEXT,
      notes TEXT,
      attachments TEXT,
      timeline TEXT,
      first_visit_date TEXT,
      last_visit_date TEXT,
      churn_risk INTEGER DEFAULT 0,
      churn_risk_reason TEXT,
      follow_up_days INTEGER,
      tags TEXT
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS treatments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price_per_session REAL NOT NULL,
      default_sessions INTEGER NOT NULL,
      total_package_price REAL NOT NULL,
      duration_minutes INTEGER NOT NULL,
      enabled_professionals TEXT,
      active INTEGER NOT NULL DEFAULT 1
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      treatment_catalog_id TEXT NOT NULL,
      treatment_name TEXT NOT NULL,
      category TEXT NOT NULL,
      session_price REAL NOT NULL,
      total_sessions INTEGER NOT NULL,
      completed_sessions INTEGER NOT NULL DEFAULT 0,
      remaining_sessions INTEGER NOT NULL,
      discount_percent REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL,
      paid_amount REAL NOT NULL DEFAULT 0,
      open_balance REAL NOT NULL,
      created_at TEXT NOT NULL,
      created_by TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Ativo'
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patient_id TEXT,
      patient_name TEXT NOT NULL,
      patient_phone TEXT,
      treatment_plan_id TEXT,
      treatment_name TEXT NOT NULL,
      professional TEXT NOT NULL,
      room TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'Agendada',
      synced_with_google INTEGER NOT NULL DEFAULT 0,
      google_event_id TEXT,
      notes TEXT
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_role TEXT NOT NULL,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      target_id TEXT NOT NULL,
      previous_value TEXT,
      new_value TEXT,
      details TEXT NOT NULL
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS gcal_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  console.log('Tabelas do banco de dados SQLite inicializadas com sucesso.');
};

export default db;
