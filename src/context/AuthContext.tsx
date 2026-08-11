import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../mock/initialData';

interface AuthContextType {
  currentUser: User;
  users: User[];
  switchUserRole: (role: UserRole) => void;
  hasPermission: (module: 'PATIENTS_FULL' | 'PATIENTS_VIEW' | 'FINANCIAL' | 'AGENDA_ALL' | 'AGENDA_OWN' | 'TREATMENTS_EDIT' | 'REMARKETING' | 'AUDIT_LOGS') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Padrão: Admin (Dr. Fernando)

  const switchUserRole = (role: UserRole) => {
    const targetUser = users.find(u => u.role === role) || users[0];
    setCurrentUser(targetUser);
  };

  const hasPermission = (module: 'PATIENTS_FULL' | 'PATIENTS_VIEW' | 'FINANCIAL' | 'AGENDA_ALL' | 'AGENDA_OWN' | 'TREATMENTS_EDIT' | 'REMARKETING' | 'AUDIT_LOGS'): boolean => {
    const role = currentUser.role;
    switch (module) {
      case 'PATIENTS_FULL':
        return role === 'ADMIN' || role === 'RECEPCAO';
      case 'PATIENTS_VIEW':
        return true; // Todos podem ver pacientes
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
    <AuthContext.Provider value={{ currentUser, users, switchUserRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};
