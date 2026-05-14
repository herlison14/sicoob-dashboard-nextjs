'use client';

import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useData, Cooperado } from '../context/DataContext';
import KPICard from '../components/KPICard';
import PageHeader from '../components/PageHeader';
import ChartCard from '../components/ChartCard';
import EmptyState from '../components/EmptyState';
import { formatCurrency, sumBy, toNumber, toStr } from '../utils/formatters';

const COLORS = {
  primary: '#003641',
  secondary: '#7DB61C',
  tertiary: '#49479D',
  alert: '#E63946',
  warning: '#F4A261',
  success: '#2A9D8F',
};

type TabKey = 'c2' | 'c3';

function categorizeFaixa(capital: number): string {
  if (capital <= 5000) return 'Até R$ 5K';
  if (capital <= 10000) return 'R$ 5–10K';
  if (capital <= 50000) return 'R$ 10–50K';
  return 'Acima de R$ 50K';
}

export default function ConcentracaoPage() {
  const { data } = useData();
  const [tab, setTab] = useState<TabKey>('c2');

  const stats = useMemo(() => {
    if (!data) return null;
    const coop = data.coop || [];
    const capitalTotal = sumBy(coop, 'Capital_Integralizado');

    const top10 = coop
      .slice()
      .sort(
        (a, b) =>
          toNumber(b.Capital_Integralizado) - toNumber(a.Capital_Integralizado)
      )
      .slice(0, 10);

    const top10Capital = sumBy(top10, 'Capital_Integralizado');
    const concentracao = capitalTotal > 0 ? (top10Capital / capitalTotal) * 100 : 0;

    // Distribuição por faixa
    const faixas: Record<string, number> = {
      'Até R$ 5K': 0,
      'R$ 5–10K': 0,
      'R$ 10–50K': 0,
      'Acima de R$ 50K': 0,
    };
    coop.forEach((c) => {
      const cap = toNumber(c.Capital_Integralizado);
      faixas[categorizeFaixa(cap)]++;
    });
    const faixaData = Object.entries(faixas).map(([faixa, qtd]) => ({
      faixa,
      empresas: qtd,
    }));

    // Por família C2 / C3
    const c2 = coop.filter((c) => toStr(c.Familia) === 'C2');
    const c3 = coop.filter((c) => toStr(c.Familia) === 'C3');

    return {
      capitalTotal,
      top10,
      top10Capital,
      concentracao,
      faixaData,
      c2,
      c3,
    };
  }, [data]);

  if (!data) return <EmptyState />;
  if (!stats) return null;

  const familiaList: Cooperado[] = tab === 'c2' ? stats.c2 : stats.c3;
  const familiaSaldo = sumBy(familiaList, 'Saldo_Devedor');
  const familiaCapital = sumBy(familiaList, 'Capital_Integralizado');
  const familiaNecessidade = sumBy(familiaList, 'Necessidade_Capital');

  return (
    <div>
      <PageHeader
        title="Análise de Concentração"
        subtitle={`Top 10 cooperados representam ${stats.concentracao.toFixed(1)}% do capital total`}
        icon="🎯"
      />

      {/* KPIs principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KPICard
          label="Capital Top 10"
          value={formatCurrency(stats.top10Capital, true)}
          delta={`${stats.concentracao.toFixed(1)}% do total`}
        />
        <KPICard
          label="Índice Concentração"
          value={`${stats.concentracao.toFixed(1)}%`}
          delta="Top 10 / Total"
          type={stats.concentracao > 70 ? 'warning' : 'success'}
        />
        <KPICard
          label="Capital Total"
          value={formatCurrency(stats.capitalTotal, true)}
          delta="Base completa"
        />
      </div>

      {/* Top 10 + Distribuição */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-[#003641]">Top 10 por Capital</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Maiores integralizadores
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Pos</th>
                  <th className="px-4 py-3 text-left">Empresa</th>
                  <th className="px-4 py-3 text-left">Família</th>
                  <th className="px-4 py-3 text-right">Capital</th>
                  <th className="px-4 py-3 text-right">% Part.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.top10.map((c, idx) => {
                  const cap = toNumber(c.Capital_Integralizado);
                  const pct = stats.capitalTotal > 0 ? (cap / stats.capitalTotal) * 100 : 0;
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-bold text-[#003641]">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2.5 text-gray-900 truncate max-w-[220px]">
                        {toStr(c.Empresa) || '-'}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">
                        {toStr(c.Familia) || '-'}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-900 font-medium">
                        {formatCurrency(cap)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-[#7DB61C] font-semibold">
                        {pct.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-2">
          <ChartCard
            title="Distribuição por Faixa de Capital"
            subtitle="Quantidade de empresas por faixa"
            height={400}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.faixaData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="faixa"
                  tick={{ fontSize: 11 }}
                  width={110}
                />
                <Tooltip formatter={(v) => [Number(v), 'Empresas']} />
                <Bar dataKey="empresas" radius={[0, 6, 6, 0]}>
                  {stats.faixaData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        [COLORS.alert, COLORS.warning, COLORS.tertiary, COLORS.success][idx % 4]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Tabs C2 / C3 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 pt-4 border-b border-gray-100 flex gap-3">
          <button
            onClick={() => setTab('c2')}
            className={`px-4 py-2 font-medium text-sm transition border-b-2 -mb-px ${
              tab === 'c2'
                ? 'border-[#7DB61C] text-[#003641]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Família C2 ({stats.c2.length})
          </button>
          <button
            onClick={() => setTab('c3')}
            className={`px-4 py-2 font-medium text-sm transition border-b-2 -mb-px ${
              tab === 'c3'
                ? 'border-[#7DB61C] text-[#003641]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Família C3 ({stats.c3.length})
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <KPICard
              label="Empresas"
              value={familiaList.length}
              delta={`Família ${tab.toUpperCase()}`}
            />
            <KPICard
              label="Saldo Devedor"
              value={formatCurrency(familiaSaldo, true)}
              delta="Total"
            />
            <KPICard
              label="Capital"
              value={formatCurrency(familiaCapital, true)}
              delta="Integralizado"
              type="success"
            />
            <KPICard
              label="Necessidade"
              value={formatCurrency(familiaNecessidade, true)}
              delta="Para enquadrar"
              type={tab === 'c3' ? 'alert' : 'warning'}
            />
          </div>

          {tab === 'c3' && stats.c3.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3 mb-4 text-sm text-red-900">
              <strong>🚨 C3 Crítica:</strong> Empresas mais expostas — priorizar
              ação imediata.
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <th className="px-3 py-2 text-left">Empresa</th>
                  <th className="px-3 py-2 text-right">Saldo</th>
                  <th className="px-3 py-2 text-right">Capital</th>
                  <th className="px-3 py-2 text-right">% Cap.</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {familiaList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-6 text-gray-400 text-sm"
                    >
                      Nenhuma empresa nesta família
                    </td>
                  </tr>
                ) : (
                  familiaList
                    .slice()
                    .sort(
                      (a, b) =>
                        toNumber(b.Saldo_Devedor) - toNumber(a.Saldo_Devedor)
                    )
                    .map((c, idx) => {
                      const status = toStr(c.Status);
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-900 truncate max-w-[260px]">
                            {toStr(c.Empresa) || '-'}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-900">
                            {formatCurrency(toNumber(c.Saldo_Devedor), true)}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-900">
                            {formatCurrency(toNumber(c.Capital_Integralizado), true)}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-900">
                            {(toNumber(c.Pct_Capital) * 100).toFixed(2)}%
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                status === 'Blindada'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : status === 'Mediana'
                                  ? 'bg-orange-100 text-orange-700'
                                  : status === 'Desenquadrada'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {status || '-'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
