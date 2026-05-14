'use client';

import { useData } from '../context/DataContext';
import KPICard from '../components/KPICard';

export default function AnaliseRiscoPage() {
  const { data } = useData();

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">⚠️ Carregue um arquivo Excel na página Dashboard</p>
      </div>
    );
  }

  const coop = data.coop || [];
  const tendencias = {
    Piora: coop.filter((c: any) => c['Tendencia'] === 'Piora').length,
    Estavel: coop.filter((c: any) => c['Tendencia'] === 'Estavel').length,
    Melhora: coop.filter((c: any) => c['Tendencia'] === 'Melhora').length,
    'Sem dado': coop.filter((c: any) => c['Tendencia'] === 'Sem dado').length,
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#003641] to-[#00524F] rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Evolução do Risco CRL 2024–2026</h1>
        <p className="opacity-90">Distribuição de comportamento e destaques de deterioração/melhora</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Piora de Risco"
          value={tendencias.Piora}
          delta={`${((tendencias.Piora / coop.length) * 100).toFixed(1)}% da carteira`}
          type="alert"
        />
        <KPICard
          label="Estabilidade"
          value={tendencias.Estavel}
          delta={`${((tendencias.Estavel / coop.length) * 100).toFixed(1)}% da carteira`}
        />
        <KPICard
          label="Melhora de Risco"
          value={tendencias.Melhora}
          delta={`${((tendencias.Melhora / coop.length) * 100).toFixed(1)}% da carteira`}
          type="success"
        />
        <KPICard
          label="Sem Dados"
          value={tendencias['Sem dado']}
          delta={`${((tendencias['Sem dado'] / coop.length) * 100).toFixed(1)}% da carteira`}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>ℹ️ Análise:</strong> {tendencias.Piora} empresas em piora de risco, {tendencias.Melhora} em melhora.
        </p>
      </div>
    </div>
  );
}
