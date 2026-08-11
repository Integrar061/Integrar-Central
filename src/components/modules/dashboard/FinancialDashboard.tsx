import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Download, 
  FileText, 
  Calendar, 
  AlertCircle,
  PieChart as PieIcon,
  BarChart3,
  TrendingDown,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import Papa from 'papaparse';

import { useApp } from '../../../context/AppContext';
import { StatCard } from '../../ui/StatCard';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const FinancialDashboard: React.FC = () => {
  const { patients, plans, appointments, treatments } = useApp();

  const [datePeriod, setDatePeriod] = useState<'mes' | 'trimestre' | 'ano'>('mes');

  // Cálculos Financeiros em Tempo Real
  const totalRevenue = plans.reduce((acc, p) => acc + p.paidAmount, 0);
  const totalContracted = plans.reduce((acc, p) => acc + p.totalAmount, 0);
  const openBalanceTotal = plans.reduce((acc, p) => acc + p.openBalance, 0);
  const activePatientCount = patients.filter(p => p.status === 'Ativo' || p.status === 'Em tratamento').length;
  const averageTicket = plans.length > 0 ? totalContracted / plans.length : 0;

  // Taxa de Comparecimento
  const totalCompletedApts = appointments.filter(a => a.status === 'Realizada').length;
  const totalMissedApts = appointments.filter(a => a.status === 'Faltou' || a.status === 'Cancelada').length;
  const totalAptsCount = appointments.length;
  const attendanceRate = totalAptsCount > 0 ? Math.round((totalCompletedApts / totalAptsCount) * 100) : 100;
  const estimatedMissedLoss = totalMissedApts * 220.00; // Média estimada por falta

  // Forecast Futuro (Sessões agendadas que vão gerar receita)
  const futureScheduledApts = appointments.filter(a => a.status === 'Agendada' || a.status === 'Confirmada').length;
  const forecastedFutureRevenue = futureScheduledApts * 200.00;

  // EXPORTAÇÃO CSV DE RELATÓRIO
  const handleExportCSV = () => {
    const reportData = plans.map(p => ({
      Paciente: p.patientName,
      Tratamento: p.treatmentName,
      Categoria: p.category,
      Total_Contratado: p.totalAmount,
      Valor_Pago: p.paidAmount,
      Saldo_Em_Aberto: p.openBalance,
      Sessões_Totais: p.totalSessions,
      Sessões_Concluídas: p.completedSessions,
      Data_Criacao: p.createdAt
    }));

    const csv = Papa.unparse(reportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Relatorio_Financeiro_IntegrarCentral_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // EXPORTAÇÃO PDF RELATÓRIO EXECUTIVO
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 255); // Brand Blue
    doc.text('Integrar Central - Relatório de Faturamento', 14, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Resumo de KPIs:', 14, 40);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`- Faturamento Recebido: R$ ${totalRevenue.toFixed(2)}`, 16, 48);
    doc.text(`- Total em Aberto (Inadimplência): R$ ${openBalanceTotal.toFixed(2)}`, 16, 54);
    doc.text(`- Ticket Médio por Plano: R$ ${averageTicket.toFixed(2)}`, 16, 60);
    doc.text(`- Base de Pacientes Ativos: ${activePatientCount}`, 16, 66);
    doc.text(`- Taxa de Comparecimento: ${attendanceRate}%`, 16, 72);

    doc.text('Lista de Pacientes com Saldo em Aberto:', 14, 86);
    let y = 94;

    plans.filter(p => p.openBalance > 0).forEach(p => {
      doc.text(`• ${p.patientName} - ${p.treatmentName}: R$ ${p.openBalance.toFixed(2)} pendentes`, 16, y);
      y += 6;
    });

    doc.save(`Relatorio_Executivo_Integrar_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // CONFIGURAÇÕES DOS GRÁFICOS (dados reais do sistema)
  const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = Array(12).fill(0) as number[];
  plans.forEach(p => {
    const month = new Date(p.createdAt).getMonth();
    if (!Number.isNaN(month) && new Date(p.createdAt).getFullYear() === currentYear) {
      monthlyRevenue[month] += p.paidAmount;
    }
  });

  const revenueChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: `Faturamento ${currentYear} (R$)`,
        data: monthlyRevenue,
        borderColor: '#0066FF',
        backgroundColor: 'rgba(0, 102, 255, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const categoryTotals = plans.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + p.paidAmount;
    return acc;
  }, {});
  const categoryLabels = Object.keys(categoryTotals);
  const categoryChartData = {
    labels: categoryLabels.length ? categoryLabels : ['Sem dados'],
    datasets: [
      {
        data: categoryLabels.length ? categoryLabels.map(k => categoryTotals[k]) : [1],
        backgroundColor: ['#0066FF', '#06B6D4', '#38BDF8', '#94A3B8', '#64748B'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const professionalTotals = appointments.reduce<Record<string, number>>((acc, a) => {
    if (a.status === 'Realizada' || a.status === 'Confirmada') {
      acc[a.professional] = (acc[a.professional] || 0) + 1;
    }
    return acc;
  }, {});
  const professionalLabels = Object.keys(professionalTotals);
  const professionalChartData = {
    labels: professionalLabels.length ? professionalLabels : ['Sem dados'],
    datasets: [
      {
        label: 'Sessões no período',
        data: professionalLabels.length ? professionalLabels.map(k => professionalTotals[k]) : [0],
        backgroundColor: ['#0066FF', '#06B6D4', '#38BDF8', '#94A3B8'],
        borderRadius: 12
      }
    ]
  };

  const originTotals = patients.reduce<Record<string, number>>((acc, p) => {
    acc[p.origin] = (acc[p.origin] || 0) + 1;
    return acc;
  }, {});
  const originLabels = Object.keys(originTotals);
  const originChartData = {
    labels: originLabels.length ? originLabels : ['Sem dados'],
    datasets: [
      {
        label: 'Pacientes por origem',
        data: originLabels.length ? originLabels.map(k => originTotals[k]) : [0],
        backgroundColor: '#0066FF',
        borderRadius: 8
      }
    ]
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header com Botões de Exportação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-brand-500" /> Dashboard & Faturamento
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Visão financeira detalhada, taxa de conversão, inadimplência e projeções futuras.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleExportCSV} variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>
            Exportar CSV
          </Button>
          <Button onClick={handleExportPDF} variant="primary" size="sm" icon={<FileText className="w-4 h-4" />}>
            Gerar Relatório PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Faturamento Recebido"
          value={`R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="Total acumulado em caixa"
          icon={<DollarSign className="w-5 h-5" />}
          highlight
        />

        <StatCard
          title="Ticket Médio / Plano"
          value={`R$ ${averageTicket.toFixed(2)}`}
          subtitle="Valor médio por contrato fechado"
          icon={<TrendingUp className="w-5 h-5" />}
        />

        <StatCard
          title="Pacientes Ativos"
          value={activePatientCount}
          subtitle="Em tratamento ou manutenção"
          icon={<Users className="w-5 h-5" />}
        />

        <StatCard
          title="Taxa de Comparecimento"
          value={`${attendanceRate}%`}
          subtitle={`Faltas estimam R$ ${estimatedMissedLoss.toFixed(2)} não faturados`}
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
      </div>

      {/* Seção Principal de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Evolução Temporal de Faturamento (Linha) */}
        <Card title="Evolução Temporal do Faturamento" className="lg:col-span-2">
          <div className="h-72">
            <Line 
              data={revenueChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' as const }
                }
              }} 
            />
          </div>
        </Card>

        {/* Gráfico 2: Faturamento por Categoria (Doughnut) */}
        <Card title="Distribuição por Categoria">
          <div className="h-72 flex items-center justify-center">
            <Doughnut 
              data={categoryChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' as const }
                }
              }} 
            />
          </div>
        </Card>
      </div>

      {/* Gráficos Secundários: Profissional + Origem dos Pacientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faturamento por Profissional */}
        <Card title="Faturamento por Profissional de Saúde">
          <div className="h-64">
            <Bar 
              data={professionalChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </Card>

        {/* Funil de Origem dos Pacientes */}
        <Card title="Captação por Origem (Canal de Venda)">
          <div className="h-64">
            <Bar 
              data={originChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </Card>
      </div>

      {/* Previsão de Receita Futura Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-500 to-cyan-500 text-white shadow-soft shadow-brand-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-100 block mb-1">
            🔮 Previsão de Receita Futura (Sessões Agendadas)
          </span>
          <h3 className="text-3xl font-extrabold tracking-tight">
            R$ {forecastedFutureRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-brand-100 mt-1 font-medium">
            Estimativa baseada em <strong>{futureScheduledApts} sessões agendadas a realizar</strong> no calendário.
          </p>
        </div>

        <Button variant="secondary" size="md" className="bg-white text-brand-600 hover:bg-slate-50 border-0 font-extrabold">
          Ver Sessões Futuras
        </Button>
      </div>

      {/* Tabela de Inadimplência / Saldo em Aberto */}
      <Card title="Valores em Aberto (Cobrança & Inadimplência)">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4">Paciente</th>
                <th className="py-3 px-4">Plano de Tratamento</th>
                <th className="py-3 px-4">Valor Total</th>
                <th className="py-3 px-4">Valor Pago</th>
                <th className="py-3 px-4">Saldo em Aberto</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {plans.filter(p => p.openBalance > 0).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Nenhum saldo pendente de cobrança encontrado.
                  </td>
                </tr>
              ) : (
                plans.filter(p => p.openBalance > 0).map(p => (
                  <tr key={p.id} className="hover:bg-rose-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{p.patientName}</td>
                    <td className="py-3 px-4 text-slate-700">{p.treatmentName}</td>
                    <td className="py-3 px-4 text-slate-700">R$ {p.totalAmount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">R$ {p.paidAmount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-rose-600 font-extrabold">R$ {p.openBalance.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="danger" size="sm">
                        Enviar Lembrete Cobrança
                      </Button>
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
