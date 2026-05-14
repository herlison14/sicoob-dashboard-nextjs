'use client';

import { useState } from 'react';
import { useData } from '../context/DataContext';

export default function ExportarPage() {
  const { data } = useData();
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">⚠️ Carregue um arquivo Excel na página Dashboard</p>
      </div>
    );
  }

  const handleGeneratePdf = async () => {
    setLoadingPdf(true);
    try {
      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Erro ao gerar PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sicoob_integralizacao_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
    } catch (error) {
      alert('Erro ao gerar PDF');
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleGenerateExcel = async () => {
    setLoadingExcel(true);
    try {
      const response = await fetch('/api/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Erro ao gerar Excel');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sicoob_integralizacao_consolidado_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
    } catch (error) {
      alert('Erro ao gerar Excel');
    } finally {
      setLoadingExcel(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#003641] to-[#00524F] rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Exportar Relatórios</h1>
        <p className="opacity-90">Gere PDF executivo ou Excel consolidado a partir dos dados atuais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[#003641] mb-2">📄 Relatório Executivo (PDF)</h2>
            <p className="text-gray-600 text-sm">
              Gera um PDF de 1 página com KPIs principais, gráficos e destaques.
            </p>
          </div>
          <button
            onClick={handleGeneratePdf}
            disabled={loadingPdf}
            className="w-full bg-[#7DB61C] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#6a9a1a] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loadingPdf ? '⏳ Gerando...' : '🔽 Gerar PDF'}
          </button>
        </div>

        {/* EXCEL */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[#003641] mb-2">📊 Excel Consolidado</h2>
            <p className="text-gray-600 text-sm">
              Exporta planilha com todos os dados + abas analíticas.
            </p>
          </div>
          <button
            onClick={handleGenerateExcel}
            disabled={loadingExcel}
            className="w-full bg-[#7DB61C] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#6a9a1a] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loadingExcel ? '⏳ Gerando...' : '🔽 Gerar Excel'}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>ℹ️ Informação:</strong> Os arquivos são gerados no servidor e baixados no seu navegador. Nenhum dado é armazenado.
        </p>
      </div>
    </div>
  );
}
