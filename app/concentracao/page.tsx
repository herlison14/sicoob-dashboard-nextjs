'use client';

import { useData } from '../context/DataContext';
import KPICard from '../components/KPICard';
import { formatCurrency } from '../utils/formatters';

export default function ConcentracaoPage() {
  const { data } = useData();

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">⚠️ Carregue um arquivo Excel na página Dashboard</p>
      </div>
    );
  }

  const coop = data.coop || [];
  const capitalTotal = coop.reduce((sum: number, c: any) => sum + (c['Capital_Integralizado'] || 0), 0);
  const top10 = coop.sort((a: any, b: any) => (b['Capital_Integralizado'] || 0) - (a['Capital_Integralizado'] || 0)).slice(0, 10);

  const top10Capital = top10.reduce((sum: number, c: any) => sum + (c['Capital_Integralizado'] || 0), 0);
  const concentracao = (top10Capital / capitalTotal) * 100;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#003641] to-[#00524F] rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Análise de Concentração</h1>
        <p className="opacity-90">Top 10 cooperados e distribuição por faixa de capital</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KPICard
          label="Capital Top 10"
          value={formatCurrency(top10Capital, true)}
          delta={`${concentracao.toFixed(1)}% do total`}
        />
        <KPICard
          label="Concentração"
          value={`${concentracao.toFixed(1)}%`}
          delta="Índice de concentração"
          type={concentracao > 70 ? 'warning' : 'success'}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-[#003641] mb-4">Top 10 Empresas por Capital</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Pos.</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Empresa</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Capital</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">% Part.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {top10.map((empresa: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">{idx + 1}</td>
                  <td className="px-4 py-3 text-gray-900">{empresa['Empresa'] || '-'}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(empresa['Capital_Integralizado'] || 0)}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{(((empresa['Capital_Integralizado'] || 0) / capitalTotal) * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
