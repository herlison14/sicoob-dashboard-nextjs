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
} from 'recharts';
import { useData } from '../context/DataContext';
import KPICard from '../components/KPICard';
import PageHeader from '../components/PageHeader';
import ChartCard from '../components/ChartCard';
import EmptyState from '../components/EmptyState';
import { formatCurrency, sumBy, toNumber, toStr } from '../utils/formatters';

export default function DesenquadradosPage() {
  const { data } = useData();
  const [familiaFilter, setFamiliaFilter] = useState<string[]>([]);
  const [tendFilter, setTendFilter] = useState<string[]>([]);

  const stats = useMemo(() => {
    if (!data) return null;
    const coop = data.coop || [];
    const desenquadradas = coop.filter((c) => toStr(c.Status) === 'Desenquadrada');

    const familiasUnique = Array.from(
      new Set(desenquadradas.map((c) => toStr(c.Familia)).filter(Boolean))
    ).sort();
    const tendenciasUnique = Array.from(
      new Set(desenquadradas.map((c) => toStr(c.Tendencia)).filter(Boolean))
    ).sort();

    const filtered = desenquadradas.filter((c) => {
      const fam = toStr(c.Familia);
      const tend = toStr(c.Tendencia);
      if (familiaFilter.length > 0 && !familiaFilter.includes(fam)) return false;
      if (tendFilter.length > 0 && !tendFilter.includes(tend)) return false;
      return true;
    });

    const necessidadeTotal = sumBy(filtered, 'Necessidade_Capital');
    const saldoTotal = sumBy(filtered, 'Saldo_Devedor');
    const piora = filtered.filter((c) => toStr(c.Tendencia) === 'Piora').length;

    const top10 = filtered
      .slice()
      .sort(
        (a, b) =>
          toNumber(b.Necessidade_Capital) - toNumber(a.Necessidade_Capital)
      )
      .slice(0, 10)
      .map((c) => ({
        empresa: (toStr(c.Empresa) || '-').substring(0, 30),
        necessidade: toNumber(c.Necessidade_Capital),
      }));

    return {
      total: coop.length,
      desenquadradas,
      filtered,
      necessidadeTotal,
      saldoTotal,
      piora,
      top10,
      familiasUnique,
      tendenciasUnique,
    };
  }, [data, familiaFilter, tendFilter]);

  if (!data) return <EmptyState />;
  if (!stats) return null;

  const toggleFilter = (
    current: string[],
    value: string,
    setter: (v: string[]) => void
  ) => {
    if (current.includes(value)) setter(current.filter((v) => v !== value));
    else setter([...current, value]);
  };

  return (
    <div>
      <PageHeader
        title="Empresas Desenquadradas — GAPs Críticos"
        subtitle={`${stats.filtered.length} de ${stats.desenquadradas.length} cooperados · ${formatCurrency(stats.necessidadeTotal, true)} de aporte necessário`}
        icon="🔴"
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Empresas"
          value={stats.filtered.length}
          delta={`${((stats.filtered.length / Math.max(stats.total, 1)) * 100).toFixed(1)}% da base`}
          type="alert"
        />
        <KPICard
          label="Necessidade Total"
          value={formatCurrency(stats.necessidadeTotal, true)}
          delta="Aporte para enquadramento"
          type="alert"
        />
        <KPICard
          label="Saldo Devedor"
          value={formatCurrency(stats.saldoTotal, true)}
          delta="Carteira em alerta"
          type="alert"
        />
        <KPICard
          label="Com Piora de Risco"
          value={stats.piora}
          delta={`${((stats.piora / Math.max(stats.filtered.length, 1)) * 100).toFixed(1)}% das filtradas`}
          type="alert"
        />
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-bold text-[#003641] mb-3">🔎 Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-2">Família</div>
            <div className="flex flex-wrap gap-2">
              {stats.familiasUnique.length === 0 && (
                <span className="text-xs text-gray-400">Sem opções</span>
              )}
              {stats.familiasUnique.map((f) => (
                <button
                  key={f}
                  onClick={() => toggleFilter(familiaFilter, f, setFamiliaFilter)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    familiaFilter.includes(f)
                      ? 'bg-[#7DB61C] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-2">Tendência</div>
            <div className="flex flex-wrap gap-2">
              {stats.tendenciasUnique.length === 0 && (
                <span className="text-xs text-gray-400">Sem opções</span>
              )}
              {stats.tendenciasUnique.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleFilter(tendFilter, t, setTendFilter)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    tendFilter.includes(t)
                      ? 'bg-[#7DB61C] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        {/* Top 10 horizontal bar */}
        <div className="lg:col-span-3">
          <ChartCard
            title="Top 10 Maiores Necessidades de Aporte"
            subtitle="Capital necessário para enquadramento"
            height={420}
          >
            {stats.top10.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.top10}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}K`}
                  />
                  <YAxis
                    type="category"
                    dataKey="empresa"
                    tick={{ fontSize: 11 }}
                    width={140}
                  />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      'Necessidade',
                    ]}
                  />
                  <Bar
                    dataKey="necessidade"
                    fill="#E63946"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Nenhum dado para exibir
              </div>
            )}
          </ChartCard>
        </div>

        {/* Tabela compacta */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-[#003641]">Detalhamento</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {stats.filtered.length} cooperados
              </p>
            </div>
            <div className="overflow-y-auto max-h-[360px]">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">Empresa</th>
                    <th className="px-4 py-3 text-right">Aporte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.filtered
                    .slice()
                    .sort(
                      (a, b) =>
                        toNumber(b.Necessidade_Capital) -
                        toNumber(a.Necessidade_Capital)
                    )
                    .map((c, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-900 truncate max-w-[200px]">
                          {toStr(c.Empresa) || '-'}
                        </td>
                        <td className="px-4 py-2 text-right text-red-600 font-semibold">
                          {formatCurrency(toNumber(c.Necessidade_Capital), true)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
        <p className="text-sm text-red-900">
          <strong>⚠️ Atenção:</strong> Categoria crítica com necessidade urgente de
          aporte. Recomenda-se contato proativo com os maiores devedores.
        </p>
      </div>
    </div>
  );
}
