import React, { useState } from 'react';
import { CalendarDays, ShieldCheck, Sparkles, AlertTriangle, Loader2, Mail, Lock, UserPlus, LogIn, User as UserIcon, Briefcase } from 'lucide-react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const LoginPage: React.FC = () => {
  const { loginWithEmail, registerUser, loginWithGoogle, isAuthLoading, isGoogleReady, authError } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [localError, setLocalError] = useState<string | null>(null);

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Form states - Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('ADMIN');
  const [regSpecialty, setRegSpecialty] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!loginEmail.trim() || !loginPassword) {
      setLocalError('Por favor, informe seu e-mail e senha.');
      return;
    }

    try {
      await loginWithEmail(loginEmail, loginPassword);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Não foi possível fazer login.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setLocalError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (regPassword.length < 6) {
      setLocalError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setLocalError('As senhas digitadas não coincidem.');
      return;
    }

    try {
      await registerUser({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        specialty: regSpecialty.trim() || undefined
      });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Não foi possível cadastrar a conta.');
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Não foi possível concluir o login com Google.');
    }
  };

  const error = localError || authError;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-500/20 via-slate-950 to-slate-950" />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md my-auto">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-brand-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-500/30 mb-3">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Integrar <span className="text-brand-400">Central</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            Sistema CRM & Gestão Interna da Clínica
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-5">
          {/* Aba de Navegação entre Login e Cadastro */}
          <div className="flex bg-slate-950/70 p-1 rounded-2xl border border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setLocalError(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'login'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setLocalError(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Criar Conta
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs font-semibold flex gap-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">E-mail de Acesso</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="seu.email@clinica.com"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isAuthLoading}
                variant="primary"
                className="w-full justify-center py-3 text-sm font-semibold shadow-soft shadow-brand-500/20"
                icon={isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              >
                {isAuthLoading ? 'Autenticando…' : 'Entrar na Conta'}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-slate-900 px-3 text-slate-400 font-medium">Ou acesse com Google</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGoogleLogin}
                disabled={!isGoogleReady || isAuthLoading}
                variant="secondary"
                className="w-full justify-center py-2.5 text-xs sm:text-sm bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700"
                icon={isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
              >
                Entrar com Google (Sincronizar Agenda)
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">Nome Completo *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="Dra. Maria Silva"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">E-mail *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="seu.email@clinica.com"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">Senha *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="mínimo 6 caracteres"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">Confirmar Senha *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      placeholder="repetir senha"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">Cargo na Clínica *</label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={regRole}
                      onChange={e => setRegRole(e.target.value as UserRole)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition"
                    >
                      <option value="ADMIN">Administrador(a)</option>
                      <option value="RECEPCAO">Recepção</option>
                      <option value="FINANCEIRO">Financeiro</option>
                      <option value="PROFISSIONAL">Profissional da Saúde</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">Especialidade (opcional)</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={regSpecialty}
                      onChange={e => setRegSpecialty(e.target.value)}
                      placeholder="Ex: Biomedicina"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isAuthLoading}
                variant="primary"
                className="w-full justify-center py-3 text-sm font-semibold shadow-soft shadow-brand-500/20 mt-2"
                icon={isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              >
                {isAuthLoading ? 'Criando Conta…' : 'Criar Usuário e Acessar CRM'}
              </Button>
            </form>
          )}

          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Base de Dados local persistente vinculada à sua conta.</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CalendarDays className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Acesse de qualquer navegador ou sessão com suas credenciais.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
