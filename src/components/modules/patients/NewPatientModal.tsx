import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { PatientStatus, PatientOrigin } from '../../../types';
import { useApp } from '../../../context/AppContext';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({ isOpen, onClose }) => {
  const { addPatient } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    birthDate: '',
    phone: '',
    email: '',
    address: '',
    origin: 'Instagram' as PatientOrigin,
    status: 'Ativo' as PatientStatus,
    notes: '',
    tags: [] as string[]
  });

  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    addPatient({
      ...formData,
      tags: formData.tags.length > 0 ? formData.tags : ['Novo Paciente']
    });

    setFormData({
      name: '',
      cpf: '',
      birthDate: '',
      phone: '',
      email: '',
      address: '',
      origin: 'Instagram',
      status: 'Ativo',
      notes: '',
      tags: []
    });

    onClose();
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cadastrar Novo Paciente"
      subtitle="Preencha as informações pessoais, origem de captação e observações clínicas iniciais."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nome Completo *</label>
            <input
              type="text"
              required
              placeholder="Ex: Ana Clara Ribeiro"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:bg-white outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">CPF</label>
            <input
              type="text"
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:bg-white outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Telefone / WhatsApp *</label>
            <input
              type="text"
              required
              placeholder="(11) 99999-8888"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:bg-white outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">E-mail</label>
            <input
              type="email"
              placeholder="paciente@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:bg-white outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Data de Nascimento</label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:bg-white outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Origem do Paciente (Lead Source)</label>
            <select
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value as PatientOrigin })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:bg-white outline-none transition-all font-medium"
            >
              <option value="Instagram">Instagram</option>
              <option value="Google">Google (Busca / Orgânico)</option>
              <option value="Indicação">Indicação de Amigo/Médico</option>
              <option value="Campanha Meta">Campanha Meta (Ads)</option>
              <option value="Evento">Evento / Feira</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Status Inicial</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as PatientStatus })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:bg-white outline-none transition-all font-medium"
            >
              <option value="Lead">Lead (Aguardando fechamento)</option>
              <option value="Ativo">Ativo</option>
              <option value="Em tratamento">Em tratamento</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Endereço Residencial</label>
            <input
              type="text"
              placeholder="Rua, Número, Bairro, Cidade - UF"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:bg-white outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Tags / Categorias (para Remarketing)</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Ex: VIP, Estética Facial, Ansiedade..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="flex-1 px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-brand-500"
            />
            <Button type="button" variant="secondary" size="sm" onClick={handleAddTag}>
              + Tag
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {formData.tags.map((t, idx) => (
              <span key={idx} className="px-2 py-0.5 text-xs bg-brand-50 text-brand-700 rounded-lg border border-brand-200 flex items-center gap-1">
                #{t}
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== idx) }))} className="hover:text-red-500">×</button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Observações Clínicas Gerais</label>
          <textarea
            rows={3}
            placeholder="Histórico clínico relevante, restrições, alergias ou observações comportamentais..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:bg-white outline-none transition-all"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary">Salvar Cadastro</Button>
        </div>
      </form>
    </Modal>
  );
};
