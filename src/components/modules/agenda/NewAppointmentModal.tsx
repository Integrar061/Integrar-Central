import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { useApp } from '../../../context/AppContext';
import { AppointmentStatus } from '../../../types';
import { Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPatientId?: string;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  preselectedPatientId
}) => {
  const { patients, treatments, plans, addAppointment, gcalConfig } = useApp();

  const [patientId, setPatientId] = useState(preselectedPatientId || '');
  const [treatmentName, setTreatmentName] = useState(treatments[0]?.name || 'Ozonioterapia Médica');
  const [professional, setProfessional] = useState('Dr. Fernando Silva');
  const [room, setRoom] = useState<'Sala 01 - Ozônio' | 'Sala 02 - Estética' | 'Sala 03 - Consultório 1' | 'Sala 04 - Soroterapia'>('Sala 01 - Ozônio');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [notes, setNotes] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Atualiza a duração automaticamente de acordo com o tratamento do catálogo
  useEffect(() => {
    if (preselectedPatientId) setPatientId(preselectedPatientId);

    const catalogItem = treatments.find(t => t.name === treatmentName);
    if (catalogItem) {
      setDurationMinutes(catalogItem.durationMinutes);
    }
  }, [treatmentName, preselectedPatientId, treatments]);

  // Calcula o horário de término automático
  const calculateEndTime = (start: string, duration: number) => {
    const [h, m] = start.split(':').map(Number);
    const totalMin = h * 60 + m + duration;
    const endH = Math.floor(totalMin / 60) % 24;
    const endM = totalMin % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  };

  const endTime = calculateEndTime(startTime, durationMinutes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    // Busca se existe plano ativo para este tratamento
    const matchingPlan = plans.find(pln => pln.patientId === patientId && pln.treatmentName === treatmentName && pln.status === 'Ativo');

    const result = addAppointment({
      patientId,
      patientName: patient.name,
      patientPhone: patient.phone,
      treatmentPlanId: matchingPlan?.id,
      treatmentName,
      professional,
      room,
      date,
      startTime,
      endTime,
      durationMinutes,
      status: 'Confirmada',
      notes
    });

    if (!result.success) {
      setErrorMessage(result.error || 'Erro ao agendar.');
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Agendamento de Consulta / Sessão"
      subtitle="Fluxo otimizado para a recepção com validação imediata de conflitos."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2 animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Seleção do Paciente */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Paciente *</label>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none font-bold"
          >
            <option value="">-- Selecione o Paciente --</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name} — Tel: {p.phone}</option>
            ))}
          </select>
        </div>

        {/* Seleção do Tratamento */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Tratamento / Procedimento *</label>
          <select
            value={treatmentName}
            onChange={(e) => setTreatmentName(e.target.value)}
            required
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none font-medium"
          >
            {treatments.map(t => (
              <option key={t.id} value={t.name}>{t.name} ({t.durationMinutes} min)</option>
            ))}
          </select>
        </div>

        {/* Profissional e Sala */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Profissional de Saúde *</label>
            <select
              value={professional}
              onChange={(e) => setProfessional(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none font-medium"
            >
              <option value="Dr. Fernando Silva">Dr. Fernando Silva</option>
              <option value="Dra. Camila Alencar">Dra. Camila Alencar</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Sala / Consultório *</label>
            <select
              value={room}
              onChange={(e) => setRoom(e.target.value as any)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none font-medium"
            >
              <option value="Sala 01 - Ozônio">Sala 01 - Ozônio</option>
              <option value="Sala 02 - Estética">Sala 02 - Estética</option>
              <option value="Sala 03 - Consultório 1">Sala 03 - Consultório 1</option>
              <option value="Sala 04 - Soroterapia">Sala 04 - Soroterapia</option>
            </select>
          </div>
        </div>

        {/* Data e Horários */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Data *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Horário de Início *</label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Término Previsto</label>
            <input
              type="text"
              readOnly
              value={endTime}
              className="w-full px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl font-mono font-extrabold text-slate-700 outline-none"
            />
          </div>
        </div>

        {gcalConfig.isConnected && (
          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Sincronização bidirecional ativa: Este evento criará uma entrada no Google Agenda.</span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary">Confirmar Agendamento</Button>
        </div>
      </form>
    </Modal>
  );
};
