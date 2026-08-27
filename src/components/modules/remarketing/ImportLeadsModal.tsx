import React, { useState, useMemo } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Phone, 
  Trash2, 
  Users, 
  ArrowRight,
  Info,
  RotateCcw,
  Sparkles,
  FileCheck
} from 'lucide-react';
import Papa from 'papaparse';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { useApp } from '../../../context/AppContext';
import { ImportLeadPayload } from '../../../context/AppContext';
import { Patient, PatientStatus } from '../../../types';

interface ImportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedLeadRow {
  id: string;
  originalIndex: number;
  date: string;
  name: string;
  phone: string;
  cleanPhone: string;
  whatsappLink: string;
  contact: string;
  treatment: string;
  status: string;
  isDuplicateWithExisting: boolean;
  existingPatientName?: string;
  isDuplicateInCsv: boolean;
  selected: boolean;
}

export const ImportLeadsModal: React.FC<ImportLeadsModalProps> = ({ isOpen, onClose }) => {
  const { patients, bulkImportLeads } = useApp();

  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedLeadRow[]>([]);
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'update' | 'create_anyway'>('skip');
  const [previewFilter, setPreviewFilter] = useState<'all' | 'new' | 'duplicates'>('all');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importSummary, setImportSummary] = useState<{
    imported: number;
    updated: number;
    skipped: number;
    failed: number;
    total: number;
  } | null>(null);

  // Normaliza string para busca de cabeçalhos
  const normalizeKey = (key: string): string => {
    return key
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  // Sanitiza número de telefone
  const sanitizePhone = (phoneStr: string): string => {
    return phoneStr.replace(/\D/g, '');
  };

  // Formata telefone visualmente para o padrão brasileiro
  const formatPhoneDisplay = (phoneStr: string): string => {
    const digits = sanitizePhone(phoneStr);
    if (!digits) return phoneStr || '-';
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    if (digits.length > 11 && digits.startsWith('55')) {
      const national = digits.slice(2);
      if (national.length === 11) {
        return `+55 (${national.slice(0, 2)}) ${national.slice(2, 7)}-${national.slice(7)}`;
      }
    }
    return phoneStr;
  };

  // Gera link do WhatsApp automaticamente a partir do telefone
  const generateWhatsAppLink = (phoneStr: string, customLink?: string): string => {
    if (customLink && customLink.trim().startsWith('http')) {
      return customLink.trim();
    }
    const digits = sanitizePhone(phoneStr);
    if (!digits) return '';
    const fullNumber = digits.length <= 11 && !digits.startsWith('55') ? `55${digits}` : digits;
    return `https://wa.me/${fullNumber}`;
  };

  // Mapeia o status da planilha para o status do paciente ou define tag
  const mapStatusToPatientStatus = (rawStatus: string): PatientStatus => {
    const s = rawStatus.toLowerCase().trim();
    if (s.includes('fechou') || s.includes('ativo') || s.includes('compareceu') || s.includes('fechado')) {
      return 'Ativo';
    }
    if (s.includes('tratamento') || s.includes('em andamento')) {
      return 'Em tratamento';
    }
    if (s.includes('inativo') || s.includes('perdeu') || s.includes('desistiu')) {
      return 'Inativo';
    }
    if (s.includes('ex') || s.includes('cancelado')) {
      return 'Ex-paciente';
    }
    return 'Lead';
  };

  // Processa o arquivo CSV
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      complete: (results) => {
        processParsedData(results.data as Record<string, any>[]);
      },
      error: (err) => {
        console.error('Erro ao ler CSV:', err);
        alert('Erro ao processar o arquivo CSV. Verifique a formatação.');
      }
    });
  };

  const processParsedData = (rows: Record<string, any>[]) => {
    const existingPhoneMap = new Map<string, Patient>();
    patients.forEach(p => {
      const clean = sanitizePhone(p.phone);
      if (clean) existingPhoneMap.set(clean, p);
    });

    const seenPhonesInCsv = new Set<string>();
    const processed: ParsedLeadRow[] = [];

    rows.forEach((row, index) => {
      // Procura as colunas esperadas com tolerância a variações de nome
      let rawDate = '';
      let rawName = '';
      let rawPhone = '';
      let rawLink = '';
      let rawContact = '';
      let rawTreatment = '';
      let rawStatus = '';

      Object.entries(row).forEach(([key, val]) => {
        const normKey = normalizeKey(key);
        const strVal = String(val || '').trim();

        if (normKey === 'data' || normKey.includes('data')) {
          if (!rawDate) rawDate = strVal;
        } else if (normKey === 'nome' || normKey.includes('nomecompleto') || normKey.includes('nome')) {
          if (!rawName) rawName = strVal;
        } else if (normKey === 'whatsapp' || normKey === 'zap' || normKey === 'telefone' || normKey === 'celular') {
          if (!rawPhone) rawPhone = strVal;
        } else if (normKey.includes('link') || normKey.includes('linkdowhatsapp')) {
          if (!rawLink) rawLink = strVal;
        } else if (normKey === 'contato' || normKey.includes('contato')) {
          if (!rawContact) rawContact = strVal;
        } else if (normKey === 'tratamento' || normKey.includes('procedimento') || normKey.includes('servico')) {
          if (!rawTreatment) rawTreatment = strVal;
        } else if (normKey === 'status' || normKey.includes('situacao') || normKey.includes('motivo')) {
          if (!rawStatus) rawStatus = strVal;
        }
      });

      // Se a linha não tiver pelo menos nome ou telefone, descarta (pode ser linha da tabela lateral de contagem)
      if (!rawName && !rawPhone) return;

      const cleanPhone = sanitizePhone(rawPhone);
      const existingPatient = cleanPhone ? existingPhoneMap.get(cleanPhone) : undefined;
      const isDuplicateInCsv = cleanPhone ? seenPhonesInCsv.has(cleanPhone) : false;

      if (cleanPhone) {
        seenPhonesInCsv.add(cleanPhone);
      }

      processed.push({
        id: `row-${index}-${Date.now()}`,
        originalIndex: index + 1,
        date: rawDate,
        name: rawName || 'Sem nome',
        phone: rawPhone,
        cleanPhone,
        whatsappLink: generateWhatsAppLink(rawPhone, rawLink),
        contact: rawContact,
        treatment: rawTreatment || 'Geral / Não especificado',
        status: rawStatus || 'Lead Novo',
        isDuplicateWithExisting: Boolean(existingPatient),
        existingPatientName: existingPatient?.name,
        isDuplicateInCsv,
        selected: true
      });
    });

    setParsedRows(processed);
    setStep('preview');
  };

  // Filtragem dos registros na tela de preview
  const filteredPreviewRows = useMemo(() => {
    return parsedRows.filter(row => {
      if (previewFilter === 'new') {
        return !row.isDuplicateWithExisting && !row.isDuplicateInCsv;
      }
      if (previewFilter === 'duplicates') {
        return row.isDuplicateWithExisting || row.isDuplicateInCsv;
      }
      return true;
    });
  }, [parsedRows, previewFilter]);

  const totalDuplicates = useMemo(() => {
    return parsedRows.filter(r => r.isDuplicateWithExisting || r.isDuplicateInCsv).length;
  }, [parsedRows]);

  const toggleRowSelect = (id: string) => {
    setParsedRows(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const toggleSelectAll = (select: boolean) => {
    setParsedRows(prev => prev.map(r => ({ ...r, selected: select })));
  };

  // Executa a importação final
  const handleConfirmImport = async () => {
    const selectedRows = parsedRows.filter(r => r.selected);
    if (selectedRows.length === 0) {
      alert('Nenhum registro selecionado para importação.');
      return;
    }

    try {
      setIsImporting(true);

      const leadsPayload: ImportLeadPayload[] = selectedRows.map(row => {
        const tags = ['Importação CSV'];
        if (row.status) tags.push(row.status);
        if (row.treatment) tags.push(row.treatment);

        return {
          name: row.name,
          phone: row.phone || row.cleanPhone,
          origin: 'Campanha Meta',
          status: mapStatusToPatientStatus(row.status),
          treatment: row.treatment,
          contact: row.contact,
          whatsappLink: row.whatsappLink,
          notes: `Status planilha: ${row.status}${row.treatment ? ` | Tratamento: ${row.treatment}` : ''}${row.contact ? ` | Contato: ${row.contact}` : ''}`,
          tags,
          date: row.date || new Date().toISOString().split('T')[0]
        };
      });

      const result = await bulkImportLeads(leadsPayload, duplicateStrategy);

      setImportSummary({
        imported: result.imported,
        updated: result.updated,
        skipped: result.skipped,
        failed: result.failed,
        total: selectedRows.length
      });

      setStep('result');
    } catch (err) {
      console.error('Erro na importação em lote:', err);
      alert('Ocorreu um erro durante a importação. Tente novamente.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setFileName('');
    setParsedRows([]);
    setImportSummary(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importação de Leads para Remarketing"
      subtitle="Importe listas de contatos com preview inteligente, descarte de colunas extras e deduplicação por telefone."
      maxWidth="2xl"
    >
      {/* ETAPA 1: UPLOAD DO CSV */}
      {step === 'upload' && (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-brand-200 bg-brand-50/40 rounded-3xl p-8 text-center hover:bg-brand-50/70 transition-all flex flex-col items-center justify-center cursor-pointer relative group">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-soft">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900 mb-1">
              Clique ou arraste sua planilha CSV aqui
            </h4>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Aceita arquivos exportados do Google Planilhas, Excel ou CRM contendo as colunas: Data, Nome completo, Whatsapp, Link do Whatsapp, Contato, Tratamento e Status.
            </p>
            <div className="mt-4 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-600 flex items-center gap-1.5 shadow-sm">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Colunas extras e contagens laterais serão descartadas automaticamente</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <h5 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-500" />
              Recursos Automáticos da Importação:
            </h5>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside font-medium">
              <li><strong>Preenchimento de Status imediato:</strong> Mantém o status original (ex: Convênio, Achou Caro, Sem resposta, Fechou).</li>
              <li><strong>Geração do Link do WhatsApp:</strong> Se faltar o link na planilha, é gerado via número de telefone.</li>
              <li><strong>Detecção de Duplicados:</strong> Identifica números já existentes na clínica para evitar duplicidades indesejadas.</li>
            </ul>
          </div>
        </div>
      )}

      {/* ETAPA 2: PREVIEW E CONFIGURAÇÕES */}
      {step === 'preview' && (
        <div className="space-y-5">
          {/* Header Stats */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <span className="font-extrabold text-slate-900 text-sm">{fileName}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {parsedRows.length} linhas válidas identificadas • {totalDuplicates} potenciais duplicados
              </p>
            </div>

            <Button variant="secondary" size="sm" onClick={handleReset} icon={<RotateCcw className="w-3.5 h-3.5" />}>
              Trocar Arquivo
            </Button>
          </div>

          {/* Configuração de Deduplicação */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <label className="block text-xs font-bold uppercase text-slate-700">
              Regra para Telefones Duplicados:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDuplicateStrategy('skip')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  duplicateStrategy === 'skip'
                    ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-extrabold text-slate-900">Pular Duplicados</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Ignora leads cujo telefone já existe na base (Recomendado).</p>
              </button>

              <button
                type="button"
                onClick={() => setDuplicateStrategy('update')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  duplicateStrategy === 'update'
                    ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-extrabold text-slate-900">Atualizar Existentes</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Sobrescreve status e adiciona tags no cadastro existente.</p>
              </button>

              <button
                type="button"
                onClick={() => setDuplicateStrategy('create_anyway')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  duplicateStrategy === 'create_anyway'
                    ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-extrabold text-slate-900">Criar Mesmo Assim</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Cria uma nova ficha de lead independente da duplicação.</p>
              </button>
            </div>
          </div>

          {/* Filtros da Tabela de Preview */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPreviewFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold ${
                  previewFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({parsedRows.length})
              </button>
              <button
                type="button"
                onClick={() => setPreviewFilter('new')}
                className={`px-3 py-1 rounded-xl text-xs font-bold ${
                  previewFilter === 'new' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Novos ({parsedRows.length - totalDuplicates})
              </button>
              <button
                type="button"
                onClick={() => setPreviewFilter('duplicates')}
                className={`px-3 py-1 rounded-xl text-xs font-bold ${
                  previewFilter === 'duplicates' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Duplicados ({totalDuplicates})
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => toggleSelectAll(true)}
                className="text-brand-600 font-bold hover:underline"
              >
                Marcar Todos
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => toggleSelectAll(false)}
                className="text-slate-500 font-bold hover:underline"
              >
                Desmarcar
              </button>
            </div>
          </div>

          {/* Tabela de Preview */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">Sel.</th>
                  <th className="py-2.5 px-3">Lead / Nome</th>
                  <th className="py-2.5 px-3">WhatsApp</th>
                  <th className="py-2.5 px-3">Status Planilha</th>
                  <th className="py-2.5 px-3">Tratamento</th>
                  <th className="py-2.5 px-3">Alerta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPreviewRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Nenhum lead encontrado neste filtro.
                    </td>
                  </tr>
                ) : (
                  filteredPreviewRows.map((row) => (
                    <tr key={row.id} className={`hover:bg-slate-50/80 ${!row.selected ? 'opacity-40' : ''}`}>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() => toggleRowSelect(row.id)}
                          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {row.name}
                        {row.date && <span className="block text-[10px] font-normal text-slate-400">{row.date}</span>}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span>{formatPhoneDisplay(row.phone)}</span>
                          {row.whatsappLink && (
                            <a
                              href={row.whatsappLink}
                              target="_blank"
                              rel="noreferrer"
                              title="Testar Link do WhatsApp"
                              className="text-emerald-600 hover:text-emerald-700"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-lg text-[11px] font-extrabold bg-brand-50 text-brand-700 border border-brand-200">
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-[140px] truncate" title={row.treatment}>
                        {row.treatment}
                      </td>
                      <td className="py-2.5 px-3">
                        {row.isDuplicateWithExisting ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200" title={`Já existe na base: ${row.existingPatientName}`}>
                            ⚠️ Já na base
                          </span>
                        ) : row.isDuplicateInCsv ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            ⚠️ Repetido no CSV
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✨ Novo
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Ações */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={handleReset} disabled={isImporting}>
              Voltar
            </Button>

            <Button
              variant="primary"
              onClick={handleConfirmImport}
              disabled={isImporting || parsedRows.filter(r => r.selected).length === 0}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              {isImporting
                ? 'Importando...'
                : `Confirmar Importação (${parsedRows.filter(r => r.selected).length} leads)`}
            </Button>
          </div>
        </div>
      )}

      {/* ETAPA 3: RESUMO FINAL */}
      {step === 'result' && importSummary && (
        <div className="space-y-6 py-2">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-soft">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Importação Concluída com Sucesso!</h3>
            <p className="text-xs text-slate-500">
              Os leads foram processados e integrados ao sistema e à aba de Remarketing.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <span className="text-2xl font-extrabold text-emerald-700 block">{importSummary.imported}</span>
              <span className="text-xs font-bold text-emerald-800">Novos Criados</span>
            </div>

            <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 text-center">
              <span className="text-2xl font-extrabold text-cyan-700 block">{importSummary.updated}</span>
              <span className="text-xs font-bold text-cyan-800">Atualizados</span>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
              <span className="text-2xl font-extrabold text-amber-700 block">{importSummary.skipped}</span>
              <span className="text-xs font-bold text-amber-800">Pulados (Duplicados)</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
              <span className="text-2xl font-extrabold text-slate-700 block">{importSummary.failed}</span>
              <span className="text-xs font-bold text-slate-800">Falhas / Erros</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={handleReset}>
              Importar Nova Lista
            </Button>
            <Button variant="primary" onClick={onClose}>
              Fechar e Ver Pacientes
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
