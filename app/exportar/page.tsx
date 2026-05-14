'use client';

import { useState } from 'react';
import { useData } from '../context/DataContext';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

export default function ExportarPage() {
  const { data } = useData();
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  if (!data) return <EmptyState />;

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  };

  const handleGeneratePdf = async () => {
    setLoadingPdf(true);
    setFeedback(null);
    try {
      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao gerar PDF');
      const blob = await response.blob();
      const today = new Date().toISOString().split('T')[0];
      downloadBlob(blob, `sicoob_integralizacao_${today}.pdf`);
      setFeedback({ type: 'success', message: 'PDF baixado com sucesso!' });
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao gerar o PDF.' });
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleGenerateExcel = async () => {
    setLoadingExcel(true);
    setFeedback(null);
    try {
      const response = await fetch('/api/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao gerar Excel');
      const blob = await response.blob();
      const today = new Date().toISOString().split('T')[0];
      downloadBlob(blob, `sicoob_integralizacao_consolidado_${today}.xlsx`);
      setFeedback({ type: 'success', message: 'Excel baixado com sucesso!' });
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao gerar o Excel.' });
    } finally {
      setLoadingExcel(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Exportar Relatórios"
        subtitle="Gere PDF executivo ou Excel consolidado a partir dos dados atuais"
        icon="📑"
      />

      {/* Status dos dados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <h3 className="font-bold text-[#003641]">Dados carregados</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">
              Cooperados
            </div>
            <div className="text-xl font-bold text-[#003641]">
              {data.coop?.length || 0}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">
              Histórico
            </div>
            <div className="text-xl font-bold text-[#003641]">
              {data.hist?.length || 0}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">
              Parâmetros
            </div>
            <div className="text-xl font-bold text-[#003641]">
              {Object.keys(data.params || {}).length}
            </div>
          </div>
        </div>
      </div>

      {/* Botões */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-4xl mb-3">📄</div>
          <h2 className="text-lg font-bold text-[#003641] mb-1">
            Relatório Executivo (PDF)
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            PDF de uma página com KPIs principais, gráficos e destaques.
          </p>
          <button
            onClick={handleGeneratePdf}
            disabled={loadingPdf}
            className="w-full bg-[#7DB61C] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#6a9a1a] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
          >
            {loadingPdf ? '⏳ Gerando...' : '🔽 Gerar PDF'}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-4xl mb-3">📊</div>
          <h2 className="text-lg font-bold text-[#003641] mb-1">
            Excel Consolidado
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            Planilha com todos os dados + abas analíticas
            (blindadas, medianas, desenquadradas).
          </p>
          <button
            onClick={handleGenerateExcel}
            disabled={loadingExcel}
            className="w-full bg-[#7DB61C] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#6a9a1a] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
          >
            {loadingExcel ? '⏳ Gerando...' : '🔽 Gerar Excel'}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-lg p-4 mb-4 text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-red-50 border border-red-200 text-red-900'
          }`}
        >
          {feedback.type === 'success' ? '✓' : '⚠️'} {feedback.message}
        </div>
      )}

      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>ℹ️ Informação:</strong> Os arquivos são gerados no servidor e
          baixados diretamente no seu navegador. Nenhum dado é armazenado.
        </p>
      </div>
    </div>
  );
}
