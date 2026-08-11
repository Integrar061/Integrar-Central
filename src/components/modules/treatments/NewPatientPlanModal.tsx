import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { useApp } from '../../../context/AppContext';
import { AlertCircle, Tag, DollarSign, Calculator } from 'lucide-react';

interface NewPatientPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPatientId?: string;
}

export const NewPatientPlanModal: React.FC<NewPatientPlanModalProps> = ({
  isOpen,
  onClose,
  preselectedPatientId
}) => {
  const { patients, treatments, createPatientTreatmentPlan } = useApp();

  const [selectedPatientId, setSelectedPatientId] = useState(preselectedPatientId || '');
  const [selectedTreatmentId, setSelectedTreatmentId] = useState(treatments[0]?.id || '');

  const [customSessionPrice, setCustomSessionPrice] = useState(0);
  const [totalSessions, setTotalSessions] = useState(5);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [notes, setNotes] = useState('');

  // Ao selecionar um tratamento do catálogo, carrega os valores padrão
  useEffect(() => {
    if (preselectedPatientId) setSelectedPatientId(preselectedPatientId);

    const catalogItem = treatments.find(t => t.id === selectedTreatmentId);
    if (catalogItem) {
      setCustomSessionPrice(catalogItem.pricePerSession);
      setTotalSessions(catalogItem.defaultSessions);
    }
  }, [selectedTreatmentId, preselectedPatientId, treatments]);

  const selectedCatalogItem = treatments.find(t => t.id === selectedTreatmentId);
  const isCustomPrice = selectedCatalogItem && (customSessionPrice !== selectedCatalogItem.pricePerSession || totalSessions !== selectedCatalogItem.defaultSessions);

  // Cálculos automáticos
  const subtotal = customSessionPrice * totalSessions;
  const discountAmount = subtotal * (discountPercent / 100);
  const finalTotal = subtotal - discountAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedTreatmentId) return;

    createPatientTreatmentPlan(
      selectedPatientId,
      selectedTreatmentId,
      customSessionPrice,
      totalSessions,
      discountPercent,
      notes
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vincular Plano de Tratamento ao Paciente"
      subtitle="Puxe as regras padrão do catálogo e personalize valores ou sessões se necessário."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Seleção do Paciente */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Selecione o Paciente *</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            required
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none font-bold"
          >
            <option value="">-- Selecione o Paciente --</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.cpf})</option>
            ))}
          </select>
        </div>

        {/* Seleção do Tratamento do Catálogo */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Selecione o Tratamento do Catálogo *</label>
          <select
            value={selectedTreatmentId}
            onChange={(e) => setSelectedTreatmentId(e.target.value)}
            required
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none font-bold text-brand-700"
          >
            {treatments.filter(t => t.active).map(t => (
              <option key={t.id} value={t.id}>
                {t.name} — Padrão: R$ {t.pricePerSession}/sessão ({t.defaultSessions} sessões)
              </option>
            ))}
          </select>
        </div>

        {/* Seção de Personalização Livre */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-brand-500" /> Personalização para este Paciente
            </span>
            {isCustomPrice && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                ⚠️ Valor Personalizado
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Valor/Sessão (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={customSessionPrice}
                onChange={(e) => setCustomSessionPrice(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-extrabold text-slate-900 outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Nº de Sessões</label>
              <input
                type="number"
                required
                min={1}
                value={totalSessions}
                onChange={(e) => setTotalSessions(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-extrabold text-slate-900 outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Desconto (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-extrabold text-slate-900 outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Resumo Final Calculado */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-xs font-bold">
            <span className="text-slate-500">Valor Final Calculado do Pacote:</span>
            <span className="text-lg font-extrabold text-emerald-600">R$ {finalTotal.toFixed(2)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Motivo da Negociação / Observações de Auditoria</label>
          <textarea
            rows={2}
            placeholder="Ex: Desconto concedido pela administração por pagamento à vista..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary">Criar Plano & Gerar Log</Button>
        </div>
      </form>
    </Modal>
  );
};
