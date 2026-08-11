import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Modais Globais
import { NewPatientModal } from './components/modules/patients/NewPatientModal';
import { NewAppointmentModal } from './components/modules/agenda/NewAppointmentModal';
import { NewPatientPlanModal } from './components/modules/treatments/NewPatientPlanModal';

// Módulos
import { FinancialDashboard } from './components/modules/dashboard/FinancialDashboard';
import { PatientList } from './components/modules/patients/PatientList';
import { Patient360View } from './components/modules/patients/Patient360View';
import { AgendaView } from './components/modules/agenda/AgendaView';
import { TreatmentCatalog } from './components/modules/treatments/TreatmentCatalog';
import { RemarketingCenter } from './components/modules/remarketing/RemarketingCenter';
import { AuditLogsView } from './components/modules/audit/AuditLogsView';

const MainContent: React.FC = () => {
  const { patients } = useApp();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Seleção de paciente para visão 360°
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Estados dos Modais
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [modalPatientId, setModalPatientId] = useState<string | undefined>(undefined);

  const selectedPatient = selectedPatientId ? patients.find(p => p.id === selectedPatientId) : null;

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab('patients');
  };

  const handleOpenAppointmentModal = (patientId?: string) => {
    setModalPatientId(patientId);
    setIsNewAppointmentModalOpen(true);
  };

  const handleOpenPlanModal = (patientId?: string) => {
    setModalPatientId(patientId);
    setIsNewPlanModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedPatientId(null); // Limpa seleção ao trocar de aba principal
        }}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Layout Content */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <Header
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)}
          onOpenNewAppointmentModal={() => handleOpenAppointmentModal()}
          onSelectPatient={handleSelectPatient}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Renderização Condicional por Módulo */}
          {activeTab === 'dashboard' && <FinancialDashboard />}

          {activeTab === 'patients' && (
            selectedPatient ? (
              <Patient360View
                patient={selectedPatient}
                onBack={() => setSelectedPatientId(null)}
                onOpenAppointmentModal={handleOpenAppointmentModal}
                onOpenPlanModal={handleOpenPlanModal}
              />
            ) : (
              <PatientList
                onSelectPatient={handleSelectPatient}
                onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)}
              />
            )
          )}

          {activeTab === 'agenda' && (
            <AgendaView
              onOpenNewAppointmentModal={() => handleOpenAppointmentModal()}
            />
          )}

          {activeTab === 'treatments' && <TreatmentCatalog />}

          {activeTab === 'remarketing' && <RemarketingCenter />}

          {activeTab === 'audit' && <AuditLogsView />}
        </main>
      </div>

      {/* Modais Globais Reutilizáveis */}
      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
      />

      <NewAppointmentModal
        isOpen={isNewAppointmentModalOpen}
        onClose={() => setIsNewAppointmentModalOpen(false)}
        preselectedPatientId={modalPatientId}
      />

      <NewPatientPlanModal
        isOpen={isNewPlanModalOpen}
        onClose={() => setIsNewPlanModalOpen(false)}
        preselectedPatientId={modalPatientId}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </AuthProvider>
  );
};
