// Módulo mantido para compatibilidade com ambiente local dev
// A persistência principal é gerenciada pelo Supabase em server/supabaseDb.js

export const dbRun = async () => ({ lastID: 0, changes: 0 });
export const dbAll = async () => [];
export const dbGet = async () => null;
export const initDb = async () => {};

export default {};
