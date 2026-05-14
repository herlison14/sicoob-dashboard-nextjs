'use client';

import { useMemo, useState } from 'react';
import { useData, Cooperado } from '../context/DataContext';
import KPICard from '../components/KPICard';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { formatCurrency, sumBy, toNumber, toStr } from '../utils/formatters';

type TabKey = 'c1' | 'mediana';

export default function EnquadradosPage() {
  const { data } = useData();
  const [tab, setTab] = useState<TabKey>('c1');

  const stats = useMemo(() => {
    if (!data) return null;
    const coop = data.coop || [];
    const blindadas = coop.filter((c) => toStr(c.Status) === 'Blindada');
    const medianas = coop.filter((c) => toStr(c.Status) === 'Mediana');

    return {
      blindadas,
      medianas,
      saldoC1: sumBy(blindadas, 'Saldo_Devedor'),
      capitalC1: sumBy(blindadas, 'Capital_Integralizado'),
      saldoMediana: sumBy(medianas, 'Saldo_Devedor'),
      capitalMediana: sumBy(medianas, 'Capital_Integralizado'),
      aporteMediana: sumBy(medianas, 'Necessidade_Capital'),
    };
  }, [data]);

  if (!data) return <EmptyState />;
  if (!stats) return null;

  const activeList: Cooperado[] = tab === 'c1' ? stats.blindadas : stats.medianas;

  return (
    <div>
      <PageHeader
        title="Empresas Enquadradas"
        subtitle={`C1 Blindadas + Medianas · ${
          stats.blindadas.length + stats.medianas.length
        } empresas analisadas`}
        icon="🛡️"
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setTab('c1')}
          className={`px-4 py-2 font-medium text-sm transition border-b-2 ${
            tab === 'c1'
              ? 'border-[#7DB61C] text-[#003641]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          🛡️ C1 Blindadas ({stats.blindadas.length})
        </button>
        <button
          onClick={() => setTab('mediana')}
          className={`px-4 py-2 font-medium text-sm transition border-b-2 ${
            tab === 'mediana'
              ? 'border-[#7DB61C] text-[#003641]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          ⚠️ Medianas ({stats.medianas.length})
        </button>
      </div>

      {tab === 'c1' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <KPICard
              label="Saldo C1"
              value={formatCurrency(stats.saldoC1, true)}
              delta={`${stats.blindadas.length} blindadas`}
            />
            <KPICard
              label="Capital C1"
              value={formatCurrency(stats.capitalC1, true)}
              delta="Integralizado"
              type="success"
            />
            <KPICard
              label="Garantia Imobiliária"
              value="100%"
              delta="Alienação Fiduciária"
              type="success"
            />
            <KPICard
              label="Status Provisão"
              value="Adequada"
              delta="Sem exposição residual"
              type="success"
            />
          </div>
          <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-lg p-4 mb-6">
            <p className="text-sm text-emerald-900">
              <strong>✓ C1 Blindadas:</strong> Empresas com 100% de cobertura via
              alienação fiduciária imobiliária. Proteção integral contra
              inadimplência.
            </p>
          </div>
        </>
      )}

      {tab === 'mediana' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <KPICard
              label="Aporte Necessário"
              value={formatCurrency(stats.aporteMediana, true)}
              delta={`Para ${stats.medianas.length} medianas`}
              type="warning"
            />
            <KPICard
              label="Status"
              value="ATENÇÃO"
              delta="50-99% do mínimo"
              type="warning"
            />
            <KPICard
              label="Oportunidade"
              value="Alta"
              delta="Aporte direcionado"
              type="warning"
            />
          </div>
          <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4 mb-6">
            <p className="text-sm text-orange-900">
              <strong>⚠️ Medianas:</strong> Empresas próximas ao mínimo. Ação
              direcionada de aporte de capital pode trazer enquadramento total.
            </p>
          </div>
        </>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-[#003641]">
            Ranking — {tab === 'c1' ? 'C1 Blindadas' : 'Medianas'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">CNPJ</th>
                <th className="px-4 py-3 text-right">Saldo Devedor</th>
                <th className="px-4 py-3 text-right">Capital</th>
                <th className="px-4 py-3 text-right">% Cap.</th>
                <th className="px-4 py-3">CRL Atual</th>
                <th className="px-4 py-3">Tendência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    Nenhuma empresa nesta categoria
                  </td>
                </tr>
              ) : (
                activeList
                  .slice()
                  .sort(
                    (a, b) =>
                      toNumber(b.Saldo_Devedor) - toNumber(a.Saldo_Devedor)
                  )
                  .map((c, idx) => {
                    const tend = toStr(c.Tendencia);
                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {toStr(c.Empresa) || '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {toStr(c.CNPJ) || '-'}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {formatCurrency(toNumber(c.Saldo_Devedor))}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {formatCurrency(toNumber(c.Capital_Integralizado))}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {(toNumber(c.Pct_Capital) * 100).toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {toStr(c.CRL_Atual) || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                              tend === 'Piora'
                                ? 'bg-red-100 text-red-700'
                                : tend === 'Melhora'
                                ? 'bg-emerald-100 text-emerald-700'
                                : tend === 'Estavel'
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-gray-50 text-gray-500'
                            }`}
                          >
                            {tend || 'Sem dado'}
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
  );
}
