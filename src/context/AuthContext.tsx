import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../services/api';
import {
  clearSession,
  isGoogleConfigured,
  loadStoredSession,
  requestGoogleAccessToken,
  revokeGoogleAccess,
  StoredGoogleSession
} from '../lib/googleAuth';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  specialty?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isGoogleReady: boolean;
  authError: string | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerUser: (data: RegisterData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (module: 'PATIENTS_FULL' | 'PATIENTS_VIEW' | 'FINANCIAL' | 'AGENDA_ALL' | 'AGENDA_OWN' | 'TREATMENTS_EDIT' | 'REMARKETING' | 'AUDIT_LOGS') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'integrar_central_v2_current_user';
const TOKEN_STORAGE_KEY = 'integrar_central_auth_token';

function sessionToUser(session: StoredGoogleSession): User {
  return {
    id: session.profile.sub,
    googleId: session.profile.sub,
    name: session.profile.name,
    email: session.profile.email,
    avatarUrl: session.profile.picture,
    role: 'ADMIN',
    specialty: 'Conta Google'
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const isGoogleReady = isGoogleConfigured();

  // Tenta restaurar sessão no carregamento inicial
  useEffect(() => {
    const initAuth = async () => {
      setIsAuthLoading(true);
      try {
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (storedToken) {
          try {
            const { user } = await authApi.getMe();
            setCurrentUser(user);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
            setIsAuthLoading(false);
            return;
          } catch {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
          }
        }

        // Se não houver token de API, checa se tem sessão local ou do Google armazenada
        const savedUserStr = localStorage.getItem(USER_STORAGE_KEY);
        if (savedUserStr) {
          try {
            const user = JSON.parse(savedUserStr);
            setCurrentUser(user);
            setIsAuthLoading(false);
            return;
          } catch {
            localStorage.removeItem(USER_STORAGE_KEY);
          }
        }

        const session = loadStoredSession();
        if (session) {
          const user = sessionToUser(session);
          setCurrentUser(user);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        }
      } catch {
        // Erro silencioso de restauração
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAuth();
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    setIsAuthLoading(true);
    try {
      const { user, token } = await authApi.login({ email, password });
      setCurrentUser(user);
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao realizar login.';
      setAuthError(message);
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const registerUser = useCallback(async (data: RegisterData) => {
    setAuthError(null);
    setIsAuthLoading(true);
    try {
      const { user, token } = await authApi.register(data);
      setCurrentUser(user);
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao criar conta.';
      setAuthError(message);
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setAuthError(null);
    setIsAuthLoading(true);
    try {
      const session = await requestGoogleAccessToken({ forceConsent: true });
      const user = sessionToUser(session);
      setCurrentUser(user);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao entrar com Google.';
      setAuthError(message);
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await revokeGoogleAccess();
    } catch {
      // Ignora erros no logout do Google
    } finally {
      clearSession();
      setCurrentUser(null);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  const hasPermission = (module: 'PATIENTS_FULL' | 'PATIENTS_VIEW' | 'FINANCIAL' | 'AGENDA_ALL' | 'AGENDA_OWN' | 'TREATMENTS_EDIT' | 'REMARKETING' | 'AUDIT_LOGS'): boolean => {
    if (!currentUser) return false;
    const role = currentUser.role;
    switch (module) {
      case 'PATIENTS_FULL':
        return role === 'ADMIN' || role === 'RECEPCAO';
      case 'PATIENTS_VIEW':
        return true;
      case 'FINANCIAL':
        return role === 'ADMIN' || role === 'FINANCEIRO';
      case 'AGENDA_ALL':
        return role === 'ADMIN' || role === 'RECEPCAO' || role === 'FINANCEIRO';
      case 'AGENDA_OWN':
        return true;
      case 'TREATMENTS_EDIT':
        return role === 'ADMIN';
      case 'REMARKETING':
        return role === 'ADMIN' || role === 'RECEPCAO';
      case 'AUDIT_LOGS':
        return role === 'ADMIN' || role === 'FINANCEIRO';
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        isAuthLoading,
        isGoogleReady,
        authError,
        loginWithEmail,
        registerUser,
        loginWithGoogle,
        logout,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};

export type { UserRole };
