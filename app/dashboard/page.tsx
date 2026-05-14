'use client';

import { useState } from 'react';
import { useData } from '../context/DataContext';
import KPICard from '../components/KPICard';
import { formatCurrency, formatPercent } from '../utils/formatters';

export default function DashboardPage() {
  const { data, setData, isLoading, setIsLoading, setError } = useData();
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/dados', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar arquivo');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            w-full max-w-md p-12 border-2 border-dashed rounded-xl text-center
            transition-colors duration-200 cursor-pointer
            ${dragActive
              ? 'border-[#7DB61C] bg-green-50'
              : 'border-gray-300 bg-gray-50 hover:border-[#7DB61C]'
            }
          `}
        >
          <div className="text-4xl mb-3">📊</div>
          <h2 className="text-xl font-bold text-[#003641] mb-2">
            Carregue seu arquivo Excel
          </h2>
          <p className="text-gray-600 mb-4">
            Arraste e solte o arquivo <code className="bg-gray-200 px-2 py-1 rounded">dados_integralizacao.xlsx</code>
          </p>
          <label className="inline-block">
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileInput}
              disabled={isLoading}
              className="hidden"
            />
            <span className="bg-[#7DB61C] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#6a9a1a] cursor-pointer inline-block">
              {isLoading ? 'Carregando...' : 'Selecionar arquivo'}
            </span>
          </label>
        </div>
      </div>
    );
  }

  // Cálculos
  const coop = data.coop || [];
  const hist = data.hist || [];
  const params = data.params || {};

  const saldoTotal = coop.reduce((sum: number, c: any) => sum + (c['Saldo_Devedor'] || 0), 0);
  const capitalTotal = coop.reduce((sum: number, c: any) => sum + (c['Capital_Integralizado'] || 0), 0);
  const meta2026 = params['Meta_Anual_2026'] || 750000;
  const pctMeta = capitalTotal / meta2026;
  const gapTotal = coop
    .filter((c: any) => c['Status'] !== 'Blindada')
    .reduce((sum: number, c: any) => sum + (c['Necessidade_Capital'] || 0), 0);

  const statusCounts = {
    Blindada: coop.filter((c: any) => c['Status'] === 'Blindada').length,
    Mediana: coop.filter((c: any) => c['Status'] === 'Mediana').length,
    Desenquadrada: coop.filter((c: any) => c['Status'] === 'Desenquadrada').length,
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#003641] to-[#00524F] rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Integralização de Capital — Maiores Devedores
        </h1>
        <p className="opacity-90">
          {params['PA'] || 'PA OCB/SESCOOP'} · {params['Mes_Referencia'] || '-'} · {coop.length} cooperados PJ analisados
        </p>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Saldo Devedor Total"
          value={formatCurrency(saldoTotal, true)}
          delta={`${coop.length} cooperados PJ`}
        />
        <KPICard
          label="Capital Integralizado"
          value={formatCurrency(capitalTotal, true)}
          delta={`${((capitalTotal / saldoTotal) * 100).toFixed(2)}% do saldo total`}
          type="success"
        />
        <KPICard
          label="Atingimento Meta 2026"
          value={formatPercent(pctMeta)}
          delta={`Meta: ${formatCurrency(meta2026)}`}
          type={pctMeta >= 1 ? 'success' : pctMeta >= 0.8 ? 'warning' : 'alert'}
        />
        <KPICard
          label="Gap Necessário"
          value={formatCurrency(gapTotal, true)}
          delta="Excluindo C1 Blindadas"
          type="warning"
        />
      </div>

      {/* KPIs Secundários */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPICard
          label="Capital Médio"
          value={formatCurrency(saldoTotal / coop.length, true)}
          delta="Por cooperado"
        />
        <KPICard
          label="Blindadas"
          value={statusCounts.Blindada}
          delta="Família C1"
          type="success"
        />
        <KPICard
          label="Medianas"
          value={statusCounts.Mediana}
          delta="50-99% mínimo"
          type="warning"
        />
        <KPICard
          label="Desenquadradas"
          value={statusCounts.Desenquadrada}
          delta="< 50% mínimo"
          type="alert"
        />
        <KPICard
          label="Garantidas"
          value="100%"
          delta="Cobertura total"
          type="success"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
        <strong>💡 Dica:</strong> Use o menu no topo para explorar outras análises (Enquadrados, Desenquadrados, etc)
      </div>
    </div>
  );
}
