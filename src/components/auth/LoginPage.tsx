import React, { useState } from 'react';
import { CalendarDays, ShieldCheck, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, isAuthLoading, isGoogleReady, authError } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLocalError(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Não foi possível concluir o login.');
    }
  };

  const error = localError || authError;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-500/20 via-slate-950 to-slate-950" />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-brand-500 to-cyan-400 flex items-center justify-center shadow-soft shadow-brand-500/30 mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Integrar <span className="text-brand-400">Central</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-medium">
            Entre com Google para gerenciar a clínica e sincronizar a Agenda.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-5">
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm text-slate-300">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p>Autenticação segura via conta Google (OAuth 2.0).</p>
            </div>
            <div className="flex items-start gap-3 text-sm text-slate-300">
              <CalendarDays className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <p>Permissão para criar e sincronizar eventos no Google Agenda.</p>
            </div>
          </div>

          {!isGoogleReady && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-semibold flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Configure <code className="text-amber-100">VITE_GOOGLE_CLIENT_ID</code> no arquivo
                {' '}<code className="text-amber-100">.env</code> (veja <code className="text-amber-100">.env.example</code>).
                No Google Cloud, ative a Calendar API e adicione
                {' '}<code className="text-amber-100">http://localhost:3000</code> como origem autorizada.
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs font-semibold flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={!isGoogleReady || isAuthLoading}
            variant="primary"
            className="w-full justify-center py-3 text-sm"
            icon={isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
          >
            {isAuthLoading ? 'Conectando…' : 'Entrar com Google'}
          </Button>

          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
            Ao entrar, você autoriza o Integrar Central a acessar seu perfil e o Google Agenda da conta escolhida.
          </p>
        </div>
      </div>
    </div>
  );
};
