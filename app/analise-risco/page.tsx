'use client';

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { useData } from '../context/DataContext';
import KPICard from '../components/KPICard';
import PageHeader from '../components/PageHeader';
import ChartCard from '../components/ChartCard';
import EmptyState from '../components/EmptyState';
import { formatCurrency, toNumber, toStr } from '../utils/formatters';

const TEND_COLORS: Record<string, string> = {
  Piora: '#E63946',
  Estavel: '#9CA3AF',
  Melhora: '#2A9D8F',
  'Sem dado': '#D1D5DB',
};

export default function AnaliseRiscoPage() {
  const { data } = useData();

  const stats = useMemo(() => {
    if (!data) return null;
    const coop = data.coop || [];
    const total = coop.length;

    const tendencias: Record<string, number> = {
      Piora: 0,
      Estavel: 0,
      Melhora: 0,
      'Sem dado': 0,
    };

    coop.forEach((c) => {
      const tend = toStr(c.Tendencia) || 'Sem dado';
      if (tendencias[tend] !== undefined) tendencias[tend]++;
      else tendencias['Sem dado']++;
    });

    const piorando = coop
      .filter((c) => toStr(c.Tendencia) === 'Piora')
      .sort((a, b) => toNumber(b.Saldo_Devedor) - toNumber(a.Saldo_Devedor))
      .slice(0, 8);

    const melhorando = coop
      .filter((c) => toStr(c.Tendencia) === 'Melhora')
      .sort((a, b) => toNumber(b.Saldo_Devedor) - toNumber(a.Saldo_Devedor))
      .slice(0, 8);

    const chartData = Object.entries(tendencias)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: TEND_COLORS[name] || '#9CA3AF',
      }));

    return {
      total,
      tendencias,
      piorando,
      melhorando,
      chartData,
    };
  }, [data]);

  if (!data) return <EmptyState />;
  if (!stats) return null;

  const pctOf = (n: number) =>
    stats.total > 0 ? ((n / stats.total) * 100).toFixed(1) : '0.0';

  return (
    <div>
      <PageHeader
        title="Evolução do Risco CRL 2024–2026"
        subtitle="Distribuição de comportamento e destaques de deterioração/melhora"
        icon="📈"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Piora de Risco"
          value={stats.tendencias.Piora}
          delta={`${pctOf(stats.tendencias.Piora)}% da carteira`}
          type="alert"
        />
        <KPICard
          label="Estabilidade"
          value={stats.tendencias.Estavel}
          delta={`${pctOf(stats.tendencias.Estavel)}% da carteira`}
        />
        <KPICard
          label="Melhora de Risco"
          value={stats.tendencias.Melhora}
          delta={`${pctOf(stats.tendencias.Melhora)}% da carteira`}
          type="success"
        />
        <KPICard
          label="Sem Dados"
          value={stats.tendencias['Sem dado']}
          delta={`${pctOf(stats.tendencias['Sem dado'])}% da carteira`}
        />
      </div>

      {/* Donut + Resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard
          title="Distribuição de Tendência"
          subtitle="Comportamento do CRL — Anterior vs Atual"
          height={350}
        >
          {stats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={110}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {stats.chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Sem dados de tendência
            </div>
          )}
        </ChartCard>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-bold text-[#003641] mb-4">
            Resumo Analítico
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <div className="text-xs uppercase text-red-700 font-semibold tracking-wider">
                  Piora
                </div>
                <div className="text-sm text-red-900 mt-0.5">
                  Empresas com deterioração de classificação
                </div>
              </div>
              <div className="text-2xl font-bold text-red-700">
                {stats.tendencias.Piora}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-xs uppercase text-gray-700 font-semibold tracking-wider">
                  Estável
                </div>
                <div className="text-sm text-gray-900 mt-0.5">
                  Mantiveram a classificação CRL
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-700">
                {stats.tendencias.Estavel}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div>
                <div className="text-xs uppercase text-emerald-700 font-semibold tracking-wider">
                  Melhora
                </div>
                <div className="text-sm text-emerald-900 mt-0.5">
                  Recuperaram classificação CRL
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-700">
                {stats.tendencias.Melhora}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabelas: Piora / Melhora */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-red-50">
            <h3 className="font-bold text-red-900">🔻 Destaques — Deterioração</h3>
            <p className="text-xs text-red-700 mt-0.5">
              Top {stats.piorando.length} por saldo devedor
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <th className="px-4 py-2 text-left">Empresa</th>
                  <th className="px-4 py-2 text-center">Ant.</th>
                  <th className="px-4 py-2 text-center">Atual</th>
                  <th className="px-4 py-2 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.piorando.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-400">
                      Nenhuma piora identificada
                    </td>
                  </tr>
                ) : (
                  stats.piorando.map((c, idx) => (
                    <tr key={idx} className="hover:bg-red-50/30">
                      <td className="px-4 py-2 text-gray-900 truncate max-w-[180px]">
                        {toStr(c.Empresa) || '-'}
                      </td>
                      <td className="px-4 py-2 text-center text-gray-600 text-xs">
                        {toStr(c.CRL_Anterior) || '-'}
                      </td>
                      <td className="px-4 py-2 text-center text-red-700 font-bold text-xs">
                        {toStr(c.CRL_Atual) || '-'}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-900">
                        {formatCurrency(toNumber(c.Saldo_Devedor), true)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-emerald-50">
            <h3 className="font-bold text-emerald-900">🔼 Destaques — Melhora</h3>
            <p className="text-xs text-emerald-700 mt-0.5">
              Top {stats.melhorando.length} por saldo devedor
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <th className="px-4 py-2 text-left">Empresa</th>
                  <th className="px-4 py-2 text-center">Ant.</th>
                  <th className="px-4 py-2 text-center">Atual</th>
                  <th className="px-4 py-2 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.melhorando.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-400">
                      Nenhuma melhora identificada
                    </td>
                  </tr>
                ) : (
                  stats.melhorando.map((c, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/30">
                      <td className="px-4 py-2 text-gray-900 truncate max-w-[180px]">
                        {toStr(c.Empresa) || '-'}
                      </td>
                      <td className="px-4 py-2 text-center text-gray-600 text-xs">
                        {toStr(c.CRL_Anterior) || '-'}
                      </td>
                      <td className="px-4 py-2 text-center text-emerald-700 font-bold text-xs">
                        {toStr(c.CRL_Atual) || '-'}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-900">
                        {formatCurrency(toNumber(c.Saldo_Devedor), true)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
