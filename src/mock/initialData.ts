import { 
  User, 
  Patient, 
  TreatmentCatalogItem, 
  PatientTreatmentPlan, 
  Appointment, 
  AuditLog, 
  GoogleCalendarConfig,
  CampaignHistory
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Dr. Fernando Silva',
    email: 'fernando@clinicaintegrar.com.br',
    role: 'ADMIN',
    specialty: 'Medicina Integrativa & Ozonioterapia',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-2',
    name: 'Dra. Camila Alencar',
    email: 'camila@clinicaintegrar.com.br',
    role: 'PROFISSIONAL',
    specialty: 'Estética & Soroterapia',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813566-88855ce78c47?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-3',
    name: 'Juliana Santos',
    email: 'recepcao@clinicaintegrar.com.br',
    role: 'RECEPCAO',
    specialty: 'Atendimento & Agendamento',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-4',
    name: 'Roberto Lima',
    email: 'financeiro@clinicaintegrar.com.br',
    role: 'FINANCEIRO',
    specialty: 'Gestão Financeira & Cobranças',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_TREATMENTS: TreatmentCatalogItem[] = [
  {
    id: 'trt-1',
    name: 'Ozonioterapia Médica',
    category: 'Terapêutico',
    pricePerSession: 220.00,
    defaultSessions: 8,
    totalPackagePrice: 1760.00,
    durationMinutes: 45,
    enabledProfessionals: ['Dr. Fernando Silva'],
    active: true
  },
  {
    id: 'trt-2',
    name: 'Soroterapia Detox & Imunidade',
    category: 'Integrativo',
    pricePerSession: 350.00,
    defaultSessions: 5,
    totalPackagePrice: 1750.00,
    durationMinutes: 60,
    enabledProfessionals: ['Dr. Fernando Silva', 'Dra. Camila Alencar'],
    active: true
  },
  {
    id: 'trt-3',
    name: 'Drenagem Linfática Pós-Operatório',
    category: 'Estético',
    pricePerSession: 180.00,
    defaultSessions: 10,
    totalPackagePrice: 1800.00,
    durationMinutes: 60,
    enabledProfessionals: ['Dra. Camila Alencar'],
    active: true
  },
  {
    id: 'trt-4',
    name: 'Acupuntura & Auriculoterapia',
    category: 'Wellness',
    pricePerSession: 160.00,
    defaultSessions: 6,
    totalPackagePrice: 960.00,
    durationMinutes: 45,
    enabledProfessionals: ['Dr. Fernando Silva'],
    active: true
  },
  {
    id: 'trt-5',
    name: 'Estética Facial Avançada (Bioestimulador)',
    category: 'Estético',
    pricePerSession: 450.00,
    defaultSessions: 3,
    totalPackagePrice: 1350.00,
    durationMinutes: 60,
    enabledProfessionals: ['Dra. Camila Alencar'],
    active: true
  },
  {
    id: 'trt-6',
    name: 'Consulta de Avaliação Integrativa',
    category: 'Integrativo',
    pricePerSession: 300.00,
    defaultSessions: 1,
    totalPackagePrice: 300.00,
    durationMinutes: 60,
    enabledProfessionals: ['Dr. Fernando Silva', 'Dra. Camila Alencar'],
    active: true
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    name: 'Beatriz Maria Oliveira',
    cpf: '123.456.789-01',
    birthDate: '1988-04-15',
    phone: '(11) 98765-4321',
    email: 'beatriz.oliveira@email.com',
    address: 'Av. Paulista, 1500 - Ap 82, São Paulo - SP',
    origin: 'Instagram',
    status: 'Em tratamento',
    notes: 'Paciente relata fadiga crônica. Iniciou pacote de Ozonioterapia + Soroterapia.',
    attachments: [
      { id: 'att-1', name: 'Exame_Sangue_Abril.pdf', type: 'PDF', uploadedAt: '2026-04-10', size: '1.2 MB' },
      { id: 'att-2', name: 'Avaliacao_Inicial.pdf', type: 'PDF', uploadedAt: '2026-04-02', size: '850 KB' }
    ],
    timeline: [
      { id: 'tl-1', patientId: 'pat-1', type: 'tratamento_contratado', title: 'Contratou Ozonioterapia', description: 'Pacote de 8 sessões fechado com desconto especial.', date: '2026-04-02', author: 'Juliana Santos' },
      { id: 'tl-2', patientId: 'pat-1', type: 'consulta', title: 'Sessão 01 Realizada', description: 'Aplicação com boa tolerância sem intercorrências.', date: '2026-04-05', author: 'Dr. Fernando Silva' },
      { id: 'tl-3', patientId: 'pat-1', type: 'ligacao', title: 'Contato de Acompanhamento', description: 'Paciente informou melhora expressiva na disposição.', date: '2026-04-12', author: 'Juliana Santos' }
    ],
    firstVisitDate: '2026-04-02',
    lastVisitDate: '2026-08-01',
    tags: ['VIP', 'Soroterapia', 'Estética'],
    churnRisk: false
  },
  {
    id: 'pat-2',
    name: 'Carlos Eduardo Rocha',
    cpf: '987.654.321-09',
    birthDate: '1975-09-22',
    phone: '(11) 99887-1122',
    email: 'carlos.rocha@email.com',
    address: 'Rua Oscar Freire, 300, São Paulo - SP',
    origin: 'Indicação',
    status: 'Inativo',
    notes: 'Realizou 5 sessões de acupuntura mas não retornou para agendar as 2 últimas.',
    attachments: [],
    timeline: [
      { id: 'tl-4', patientId: 'pat-2', type: 'consulta', title: 'Sessão 05 Realizada', description: 'Tratamento de dor lombar.', date: '2026-04-20', author: 'Dr. Fernando Silva' },
      { id: 'tl-5', patientId: 'pat-2', type: 'ligacao', title: 'Tentativa de Contato', description: 'Caixa postal. Enviado mensagem WhatsApp.', date: '2026-05-15', author: 'Juliana Santos' }
    ],
    firstVisitDate: '2026-03-10',
    lastVisitDate: '2026-04-20',
    tags: ['Reativação', 'Dor Lombar'],
    churnRisk: true,
    churnRiskReason: 'Mais de 90 dias sem consulta agendada.'
  },
  {
    id: 'pat-3',
    name: 'Fernanda Lima Souza',
    cpf: '456.789.123-55',
    birthDate: '1992-11-05',
    phone: '(11) 97123-8899',
    email: 'fernanda.souza@email.com',
    address: 'Rua Haddock Lobo, 890, São Paulo - SP',
    origin: 'Google',
    status: 'Lead',
    notes: 'Interessada em Drenagem Linfática Pós-Cirúrgica. Aguardando confirmação da data cirúrgica.',
    attachments: [],
    timeline: [
      { id: 'tl-6', patientId: 'pat-3', type: 'mensagem', title: 'Contato via Google Chat', description: 'Solicitou orçamento de pacote pós-operatório.', date: '2026-08-05', author: 'Juliana Santos' }
    ],
    firstVisitDate: '2026-08-05',
    lastVisitDate: '2026-08-05',
    tags: ['Lead Quente', 'Pós-Op'],
    churnRisk: false,
    followUpDays: 3
  },
  {
    id: 'pat-4',
    name: 'Marcelo Augusto Mendes',
    cpf: '321.654.987-33',
    birthDate: '1983-01-30',
    phone: '(11) 98111-2233',
    email: 'marcelo.mendes@email.com',
    address: 'Alameda Santos, 1200, São Paulo - SP',
    origin: 'Campanha Meta',
    status: 'Em tratamento',
    notes: 'Faltou às últimas 2 sessões sem aviso prévio. Saldo em aberto pendente.',
    attachments: [],
    timeline: [
      { id: 'tl-7', patientId: 'pat-4', type: 'consulta', title: 'Falta Não Justificada', description: 'Paciente não compareceu no horário agendado.', date: '2026-07-28', author: 'Juliana Santos' },
      { id: 'tl-8', patientId: 'pat-4', type: 'consulta', title: 'Falta Não Justificada', description: 'Segunda falta consecutiva.', date: '2026-08-04', author: 'Juliana Santos' }
    ],
    firstVisitDate: '2026-06-01',
    lastVisitDate: '2026-07-20',
    tags: ['Inadimplente', 'Risco de Churn'],
    churnRisk: true,
    churnRiskReason: 'Faltou nas últimas 2 consultas agendadas.'
  },
  {
    id: 'pat-5',
    name: 'Juliana Paes de Barros',
    cpf: '654.321.987-88',
    birthDate: '1990-08-18', // Aniversariante do mês de agosto!
    phone: '(11) 99654-3210',
    email: 'jupaes@email.com',
    address: 'Rua Pamplona, 450, São Paulo - SP',
    origin: 'Instagram',
    status: 'Ativo',
    notes: 'Finalizando pacote de Soroterapia Detox (resta 1 sessão). Excelente engajamento.',
    attachments: [],
    timeline: [
      { id: 'tl-9', patientId: 'pat-5', type: 'consulta', title: 'Sessão 04 Realizada', description: 'Soroterapia aplicativa sem intercorrências.', date: '2026-08-08', author: 'Dra. Camila Alencar' }
    ],
    firstVisitDate: '2026-05-10',
    lastVisitDate: '2026-08-08',
    tags: ['Aniversariante', 'Fim de Pacote', 'VIP'],
    churnRisk: false
  }
];

export const INITIAL_PLANS: PatientTreatmentPlan[] = [
  {
    id: 'pln-1',
    patientId: 'pat-1',
    patientName: 'Beatriz Maria Oliveira',
    treatmentCatalogId: 'trt-1',
    treatmentName: 'Ozonioterapia Médica',
    category: 'Terapêutico',
    sessionPrice: 200.00, // Preço negociado (catálogo é 220)
    totalSessions: 8,
    completedSessions: 6,
    remainingSessions: 2,
    discountPercent: 9.09,
    totalAmount: 1600.00,
    paidAmount: 1600.00,
    openBalance: 0.00,
    createdAt: '2026-04-02',
    createdBy: 'Juliana Santos',
    updatedAt: '2026-08-01',
    status: 'Ativo'
  },
  {
    id: 'pln-2',
    patientId: 'pat-4',
    patientName: 'Marcelo Augusto Mendes',
    treatmentCatalogId: 'trt-2',
    treatmentName: 'Soroterapia Detox & Imunidade',
    category: 'Integrativo',
    sessionPrice: 350.00,
    totalSessions: 5,
    completedSessions: 2,
    remainingSessions: 3,
    discountPercent: 0,
    totalAmount: 1750.00,
    paidAmount: 700.00,
    openBalance: 1050.00, // Em aberto!
    createdAt: '2026-06-01',
    createdBy: 'Roberto Lima',
    updatedAt: '2026-07-20',
    status: 'Ativo'
  },
  {
    id: 'pln-3',
    patientId: 'pat-5',
    patientName: 'Juliana Paes de Barros',
    treatmentCatalogId: 'trt-2',
    treatmentName: 'Soroterapia Detox & Imunidade',
    category: 'Integrativo',
    sessionPrice: 350.00,
    totalSessions: 5,
    completedSessions: 4,
    remainingSessions: 1, // Alerta Fim de Pacote!
    discountPercent: 0,
    totalAmount: 1750.00,
    paidAmount: 1750.00,
    openBalance: 0.00,
    createdAt: '2026-05-10',
    createdBy: 'Juliana Santos',
    updatedAt: '2026-08-08',
    status: 'Ativo'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    patientId: 'pat-1',
    patientName: 'Beatriz Maria Oliveira',
    patientPhone: '(11) 98765-4321',
    treatmentPlanId: 'pln-1',
    treatmentName: 'Ozonioterapia Médica',
    professional: 'Dr. Fernando Silva',
    room: 'Sala 01 - Ozônio',
    date: '2026-08-11', // Hoje!
    startTime: '09:00',
    endTime: '09:45',
    durationMinutes: 45,
    status: 'Confirmada',
    syncedWithGoogle: true,
    googleEventId: 'gcal_evt_101',
    notes: 'Sessão 07 do pacote.'
  },
  {
    id: 'apt-2',
    patientId: 'pat-5',
    patientName: 'Juliana Paes de Barros',
    patientPhone: '(11) 99654-3210',
    treatmentPlanId: 'pln-3',
    treatmentName: 'Soroterapia Detox & Imunidade',
    professional: 'Dra. Camila Alencar',
    room: 'Sala 04 - Soroterapia',
    date: '2026-08-11', // Hoje!
    startTime: '10:30',
    endTime: '11:30',
    durationMinutes: 60,
    status: 'Agendada',
    syncedWithGoogle: true,
    googleEventId: 'gcal_evt_102',
    notes: 'Última sessão do pacote!'
  },
  {
    id: 'apt-3',
    patientId: 'pat-4',
    patientName: 'Marcelo Augusto Mendes',
    patientPhone: '(11) 98111-2233',
    treatmentPlanId: 'pln-2',
    treatmentName: 'Soroterapia Detox & Imunidade',
    professional: 'Dra. Camila Alencar',
    room: 'Sala 04 - Soroterapia',
    date: '2026-08-12',
    startTime: '14:00',
    endTime: '15:00',
    durationMinutes: 60,
    status: 'Agendada',
    syncedWithGoogle: true,
    googleEventId: 'gcal_evt_103'
  },
  {
    id: 'apt-4',
    patientId: 'pat-1',
    patientName: 'Beatriz Maria Oliveira',
    patientPhone: '(11) 98765-4321',
    treatmentPlanId: 'pln-1',
    treatmentName: 'Ozonioterapia Médica',
    professional: 'Dr. Fernando Silva',
    room: 'Sala 01 - Ozônio',
    date: '2026-08-18',
    startTime: '09:00',
    endTime: '09:45',
    durationMinutes: 45,
    status: 'Agendada',
    syncedWithGoogle: true,
    googleEventId: 'gcal_evt_104'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-04-02 14:30:11',
    userName: 'Juliana Santos',
    userRole: 'RECEPCAO',
    action: 'Vínculo de Tratamento Personalizado',
    entity: 'PlanoTratamento',
    targetId: 'pln-1',
    previousValue: 'Valor Padrão: R$ 220,00/sessão',
    newValue: 'Valor Negociado: R$ 200,00/sessão (Desc 9.09%)',
    details: 'Desconto aprovado pela administração para pacote de 8 sessões.'
  },
  {
    id: 'log-2',
    timestamp: '2026-06-01 10:15:00',
    userName: 'Roberto Lima',
    userRole: 'FINANCEIRO',
    action: 'Criação de Plano de Tratamento',
    entity: 'PlanoTratamento',
    targetId: 'pln-2',
    previousValue: 'Sem registro',
    newValue: 'Total R$ 1.750,00 (Entrada R$ 700,00)',
    details: 'Paciente parcelou o saldo restante em 2x.'
  }
];

export const INITIAL_GCAL_CONFIG: GoogleCalendarConfig = {
  isConnected: true,
  accountEmail: 'agenda.integrar@gmail.com',
  autoSync: true,
  webhookStatus: 'Ativo (Tempo Real)',
  lastSyncedAt: '2026-08-11 12:00:00',
  syncedEventsCount: 148
};

export const INITIAL_CAMPAIGNS: CampaignHistory[] = [
  {
    id: 'cmp-1',
    title: 'Reativação de Inativos - Inverno Integrativo',
    targetGroup: 'Inativos > 60 dias',
    sentAt: '2026-07-15',
    channel: 'WhatsApp',
    recipientsCount: 42,
    conversionsCount: 8
  },
  {
    id: 'cmp-2',
    title: 'Campanha Aniversariantes de Julho',
    targetGroup: 'Aniversariantes Julho',
    sentAt: '2026-07-01',
    channel: 'WhatsApp',
    recipientsCount: 15,
    conversionsCount: 6
  }
];
