'use client';

import { useData } from '../context/DataContext';
import KPICard from '../components/KPICard';
import { formatCurrency } from '../utils/formatters';

export default function EnquadradosPage() {
  const { data } = useData();

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">⚠️ Carregue um arquivo Excel na página Dashboard</p>
      </div>
    );
  }

  const coop = data.coop || [];
  const blindadas = coop.filter((c: any) => c['Status'] === 'Blindada');
  const medianas = coop.filter((c: any) => c['Status'] === 'Mediana');

  const saldoC1 = blindadas.reduce((sum: number, c: any) => sum + (c['Saldo_Devedor'] || 0), 0);
  const capitalC1 = blindadas.reduce((sum: number, c: any) => sum + (c['Capital_Integralizado'] || 0), 0);
  const aporteMediana = medianas.reduce((sum: number, c: any) => sum + (c['Necessidade_Capital'] || 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#003641] to-[#00524F] rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Empresas Enquadradas</h1>
        <p className="opacity-90">C1 Blindadas + Medianas · {blindadas.length + medianas.length} empresas analisadas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          label="Saldo Total C1"
          value={formatCurrency(saldoC1, true)}
          delta={`${blindadas.length} blindadas`}
        />
        <KPICard
          label="Capital C1"
          value={formatCurrency(capitalC1, true)}
          delta="Integralizado"
          type="success"
        />
        <KPICard
          label="Aporte Medianas"
          value={formatCurrency(aporteMediana, true)}
          delta={`${medianas.length} medianas`}
          type="warning"
        />
        <KPICard
          label="Garantia Imobiliária"
          value="100%"
          delta="Alienação Fiduciária"
          type="success"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>ℹ️</strong> As empresas C1 Blindadas possuem proteção integral via alienação fiduciária.
        </p>
      </div>
    </div>
  );
}
