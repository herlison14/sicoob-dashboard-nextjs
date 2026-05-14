'use client';

import { useData } from '../context/DataContext';
import KPICard from '../components/KPICard';
import { formatCurrency, formatPercent } from '../utils/formatters';

export default function DesenquadradosPage() {
  const { data } = useData();

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">⚠️ Carregue um arquivo Excel na página Dashboard</p>
      </div>
    );
  }

  const coop = data.coop || [];
  const desenquadradas = coop.filter((c: any) => c['Status'] === 'Desenquadrada');
  const necessidadeTotal = desenquadradas.reduce((sum: number, c: any) => sum + (c['Necessidade_Capital'] || 0), 0);
  const saldoTotal = desenquadradas.reduce((sum: number, c: any) => sum + (c['Saldo_Devedor'] || 0), 0);
  const piora = desenquadradas.filter((c: any) => c['Tendencia'] === 'Piora').length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#003641] to-[#00524F] rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Empresas Desenquadradas — GAPs Críticos</h1>
        <p className="opacity-90">
          {desenquadradas.length} cooperados em alerta · {formatCurrency(necessidadeTotal, true)} de aporte necessário
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          label="Empresas Desenquadradas"
          value={desenquadradas.length}
          delta={`${((desenquadradas.length / coop.length) * 100).toFixed(1)}% da base`}
          type="alert"
        />
        <KPICard
          label="Necessidade Total"
          value={formatCurrency(necessidadeTotal, true)}
          delta="Aporte para enquadramento"
          type="alert"
        />
        <KPICard
          label="Saldo Devedor"
          value={formatCurrency(saldoTotal, true)}
          delta="Carteira em alerta"
          type="alert"
        />
        <KPICard
          label="Com Piora de Risco"
          value={piora}
          delta={`${((piora / desenquadradas.length) * 100).toFixed(1)}% com piora`}
          type="alert"
        />
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-900">
          <strong>⚠️ Atenção:</strong> Categoria crítica com necessidade urgente de aporte.
        </p>
      </div>
    </div>
  );
}
