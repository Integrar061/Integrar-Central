import React, { useState } from 'react';
import { ShieldAlert, Search, Filter, Lock, UserCheck, Clock, FileText } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('TODOS');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (roleFilter !== 'TODOS' && log.userRole !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-brand-500" /> Log de Auditoria & Segurança
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Histórico imutável de alterações sensíveis, edições de valores negociados e exclusões.
          </p>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar nos logs por usuário, ação ou detalhe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filtrar Perfil:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none"
          >
            <option value="TODOS">Todos os Perfis</option>
            <option value="ADMIN">Administrador</option>
            <option value="RECEPCAO">Recepção</option>
            <option value="FINANCEIRO">Financeiro</option>
            <option value="PROFISSIONAL">Profissional</option>
          </select>
        </div>
      </div>

      {/* Tabela de Logs */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4">Data/Hora</th>
                <th className="py-3 px-4">Usuário</th>
                <th className="py-3 px-4">Perfil</th>
                <th className="py-3 px-4">Ação Realizada</th>
                <th className="py-3 px-6">Detalhes / Transição de Valores</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Nenhum registro de auditoria encontrado.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{log.userName}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="brand" size="sm">{log.userRole}</Badge>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-brand-700">{log.action}</td>
                    <td className="py-3.5 px-6">
                      <p className="text-slate-800">{log.details}</p>
                      {(log.previousValue || log.newValue) && (
                        <div className="mt-1 p-2 rounded bg-amber-50 border border-amber-200 text-[11px] font-mono text-amber-900 space-y-0.5">
                          {log.previousValue && <div><strong>Anterior:</strong> {log.previousValue}</div>}
                          {log.newValue && <div><strong>Novo:</strong> {log.newValue}</div>}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
