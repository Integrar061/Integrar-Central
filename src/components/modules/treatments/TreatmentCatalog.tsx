import React, { useState } from 'react';
import { 
  Activity, 
  Plus, 
  Clock, 
  DollarSign, 
  UserCheck, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  Edit3,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { TreatmentCatalogItem } from '../../../types';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Modal } from '../../ui/Modal';

export const TreatmentCatalog: React.FC = () => {
  const { treatments, addTreatmentCatalogItem, updateTreatmentCatalogItem } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TreatmentCatalogItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Integrativo' as TreatmentCatalogItem['category'],
    pricePerSession: 200,
    defaultSessions: 5,
    durationMinutes: 45,
    enabledProfessionals: [] as string[],
    active: true
  });

  const handleOpenNew = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Integrativo',
      pricePerSession: 200,
      defaultSessions: 5,
      durationMinutes: 45,
      enabledProfessionals: [],
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: TreatmentCatalogItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      pricePerSession: item.pricePerSession,
      defaultSessions: item.defaultSessions,
      durationMinutes: item.durationMinutes,
      enabledProfessionals: item.enabledProfessionals,
      active: item.active
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalPackagePrice = formData.pricePerSession * formData.defaultSessions;

    if (editingItem) {
      updateTreatmentCatalogItem({
        ...editingItem,
        ...formData,
        totalPackagePrice
      });
    } else {
      addTreatmentCatalogItem({
        ...formData,
        totalPackagePrice
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-brand-500" /> Catálogo Mestre de Tratamentos
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Gerencie os tratamentos oferecidos, valores padrão por sessão, duração e profissionais habilitados.
          </p>
        </div>

        <Button onClick={handleOpenNew} variant="primary" icon={<Plus className="w-4 h-4" />}>
          Novo Tratamento no Catálogo
        </Button>
      </div>

      {/* Regra de Negócio Banner Notice */}
      <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-brand-900 flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong className="text-brand-700 font-extrabold block uppercase tracking-wider mb-0.5">Regra de Negócio de Personalização de Valores:</strong>
          Ao vincular um tratamento a um paciente específico, o sistema carrega automaticamente os valores padrão deste catálogo mestre. No entanto, a recepção/financeiro pode negociar e personalizar o valor por sessão ou número de sessões livremente para aquele paciente **sem alterar a regra geral do catálogo mestre**. Todas as personalizações geram auditoria.
        </div>
      </div>

      {/* Grid do Catálogo */}
      {treatments.length === 0 && (
        <Card>
          <div className="text-center py-10">
            <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-extrabold text-slate-800">Catálogo vazio</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Cadastre os tratamentos reais oferecidos pela clínica.</p>
            <Button onClick={handleOpenNew} variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
              Adicionar primeiro tratamento
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {treatments.map((treatment) => {
          const calculatedTotal = treatment.pricePerSession * treatment.defaultSessions;
          return (
            <Card key={treatment.id} className="flex flex-col justify-between relative group hover:border-brand-300">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {treatment.category}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base mt-2 group-hover:text-brand-600 transition-colors">
                      {treatment.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(treatment)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                    title="Editar catálogo"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Valor por Sessão:</span>
                    <span className="font-extrabold text-slate-900">R$ {treatment.pricePerSession.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Pacote Padrão:</span>
                    <span className="font-bold text-slate-800">{treatment.defaultSessions} sessões</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Duração Média:</span>
                    <span className="font-mono text-slate-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-brand-500" /> {treatment.durationMinutes} minutos
                    </span>
                  </div>
                </div>

                <div className="pt-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Profissionais Habilitados</span>
                  <div className="flex flex-wrap gap-1">
                    {treatment.enabledProfessionals.length === 0 ? (
                      <span className="text-[10px] text-slate-400 font-medium">Nenhum profissional vinculado</span>
                    ) : (
                      treatment.enabledProfessionals.map((prof, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-700">
                          {prof}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Pacote Padrão</span>
                  <span className="text-base font-extrabold text-brand-600">R$ {calculatedTotal.toFixed(2)}</span>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                  treatment.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {treatment.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {treatment.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal para Adicionar/Editar Tratamento */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Editar Tratamento do Catálogo' : 'Novo Tratamento no Catálogo'}
        subtitle="Defina o modelo de precificação padrão e tempo médio de duração."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nome do Tratamento *</label>
            <input
              type="text"
              required
              placeholder="Ex: Soroterapia Detox Imunidade"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Categoria *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as TreatmentCatalogItem['category'] })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none font-medium"
              >
                <option value="Estético">Estético</option>
                <option value="Terapêutico">Terapêutico</option>
                <option value="Wellness">Wellness</option>
                <option value="Integrativo">Integrativo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Duração Média (Minutos) *</label>
              <select
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none font-medium"
              >
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos (1 hora)</option>
                <option value={90}>90 minutos (1h 30m)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Valor Padrão por Sessão (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.pricePerSession}
                onChange={(e) => setFormData({ ...formData, pricePerSession: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nº Padrão de Sessões no Pacote *</label>
              <input
                type="number"
                required
                min={1}
                value={formData.defaultSessions}
                onChange={(e) => setFormData({ ...formData, defaultSessions: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Profissionais habilitados</label>
            <input
              type="text"
              placeholder="Separe nomes por vírgula"
              value={formData.enabledProfessionals.join(', ')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  enabledProfessionals: e.target.value
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean)
                })
              }
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
            />
          </div>

          <div className="p-3 bg-brand-50 rounded-xl border border-brand-100 flex justify-between items-center text-xs font-bold text-brand-900">
            <span>Valor Total Calculado do Pacote:</span>
            <span className="text-base text-brand-600">R$ {(formData.pricePerSession * formData.defaultSessions).toFixed(2)}</span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary">Salvar no Catálogo</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
