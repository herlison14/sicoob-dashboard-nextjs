'use client';

import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useData } from '../context/DataContext';
import KPICard from '../components/KPICard';
import PageHeader from '../components/PageHeader';
import ChartCard from '../components/ChartCard';
import DiagnosticBanner from '../components/DiagnosticBanner';
import { formatCurrency, formatPercent, sumBy, toNumber, toStr } from '../utils/formatters';

const COLORS = {
  primary: '#003641',
  secondary: '#7DB61C',
  tertiary: '#49479D',
  alert: '#E63946',
  warning: '#F4A261',
  success: '#2A9D8F',
  gray: '#9CA3AF',
};

export default function DashboardPage() {
  const { data, setData, isLoading, setIsLoading, error, setError } = useData();
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar arquivo');
      }

      if (!result.coop || result.coop.length === 0) {
        throw new Error('Arquivo Excel sem dados de cooperados. Verifique se há ao menos uma aba com colunas como CNPJ, Saldo, Capital.');
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // Cálculos (sempre executados — hooks fora de condicionais)
  // ─────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!data) return null;
    const coop = data.coop || [];
    const params = data.params || {};
    const hist = data.hist || [];

    const saldoTotal = sumBy(coop, 'Saldo_Devedor');
    const capitalTotal = sumBy(coop, 'Capital_Integralizado');
    const meta2026 = toNumber(params['Meta_Anual_2026']) || 750000;
    const pctMeta = meta2026 > 0 ? capitalTotal / meta2026 : 0;

    const blindadas = coop.filter((c) => toStr(c.Status) === 'Blindada');
    const medianas = coop.filter((c) => toStr(c.Status) === 'Mediana');
    const desenquadradas = coop.filter((c) => toStr(c.Status) === 'Desenquadrada');

    const gapTotal = sumBy([...medianas, ...desenquadradas], 'Necessidade_Capital');

    // Por família
    const familias: Record<string, { count: number; saldo: number; capital: number }> = {};
    coop.forEach((c) => {
      const fam = toStr(c.Familia) || 'Sem família';
      if (!familias[fam]) familias[fam] = { count: 0, saldo: 0, capital: 0 };
      familias[fam].count++;
      familias[fam].saldo += toNumber(c.Saldo_Devedor);
      familias[fam].capital += toNumber(c.Capital_Integralizado);
    });

    // Histórico — converter para Recharts
    const historicoChart = hist.map((h) => ({
      mes: toStr(h.Mes_Ano),
      capital: toNumber(h.Capital_Integralizado),
    }));

    return {
      coop,
      params,
      saldoTotal,
      capitalTotal,
      meta2026,
      pctMeta,
      gapTotal,
      blindadas,
      medianas,
      desenquadradas,
      familias,
      historicoChart,
    };
  }, [data]);

  // ─────────────────────────────────────────────
  // Render: Upload UI quando sem dados
  // ─────────────────────────────────────────────
  if (!data) {
    return (
      <div>
        <PageHeader
          title="Integralização de Capital"
          subtitle="Carregue o arquivo Excel para começar a análise"
          icon="📊"
        />

        <div className="flex flex-col items-center justify-center py-8">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`w-full max-w-2xl p-12 border-2 border-dashed rounded-xl text-center transition-colors duration-200 cursor-pointer ${
              dragActive
                ? 'border-[#7DB61C] bg-green-50'
                : 'border-gray-300 bg-white hover:border-[#7DB61C]'
            }`}
          >
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-xl font-bold text-[#003641] mb-2">
              Carregue seu arquivo Excel
            </h2>
            <p className="text-gray-600 mb-2">
              Arraste e solte o arquivo
              <code className="mx-1 bg-gray-100 px-2 py-1 rounded text-sm">
                dados_integralizacao.xlsx
              </code>
            </p>
            <p className="text-gray-500 text-sm mb-6">
              ou clique para selecionar
            </p>
            <label className="inline-block">
              <input
                type="file"
                accept=".xlsx,.xlsm"
                onChange={handleFileInput}
                disabled={isLoading}
                className="hidden"
              />
              <span className="bg-[#7DB61C] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#6a9a1a] cursor-pointer inline-block shadow-md transition">
                {isLoading ? '⏳ Carregando...' : '📂 Selecionar arquivo'}
              </span>
            </label>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                ⚠️ {error}
              </div>
            )}
          </div>

          <div className="mt-6 max-w-2xl bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
            <strong>📋 Formato esperado:</strong> Excel com 3 abas — <code className="bg-white px-1.5 py-0.5 rounded">cooperados</code>,{' '}
            <code className="bg-white px-1.5 py-0.5 rounded">historico_capital</code>,{' '}
            <code className="bg-white px-1.5 py-0.5 rounded">parametros</code>.
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statusData = [
    { name: 'Blindadas', value: stats.blindadas.length, color: COLORS.success },
    { name: 'Medianas', value: stats.medianas.length, color: COLORS.warning },
    { name: 'Desenquadradas', value: stats.desenquadradas.length, color: COLORS.alert },
  ];

  const familiaData = Object.entries(stats.familias)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fam, vals]) => ({
      familia: fam,
      empresas: vals.count,
      saldo: vals.saldo,
      capital: vals.capital,
    }));

  return (
    <div>
      <PageHeader
        title="Integralização de Capital — Maiores Devedores"
        subtitle={`${toStr(stats.params['PA']) || 'PA OCB/SESCOOP'} · ${
          toStr(stats.params['Mes_Referencia']) || '-'
        } · ${stats.coop.length} cooperados PJ analisados`}
        icon="📊"
      />

      <DiagnosticBanner meta={data.meta} />

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Saldo Devedor Total"
          value={formatCurrency(stats.saldoTotal, true)}
          delta={`${stats.coop.length} cooperados PJ`}
        />
        <KPICard
          label="Capital Integralizado"
          value={formatCurrency(stats.capitalTotal, true)}
          delta={`${((stats.capitalTotal / stats.saldoTotal) * 100).toFixed(2)}% do saldo`}
          type="success"
        />
        <KPICard
          label="Atingimento Meta 2026"
          value={formatPercent(stats.pctMeta)}
          delta={`Meta: ${formatCurrency(stats.meta2026)}`}
          type={stats.pctMeta >= 1 ? 'success' : stats.pctMeta >= 0.8 ? 'warning' : 'alert'}
        />
        <KPICard
          label="Gap Necessário"
          value={formatCurrency(stats.gapTotal, true)}
          delta="Excluindo C1 Blindadas"
          type="warning"
        />
      </div>

      {/* KPIs Secundários */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard
          label="Capital Médio"
          value={formatCurrency(stats.capitalTotal / Math.max(stats.coop.length, 1), true)}
          delta="Por cooperado"
        />
        <KPICard
          label="Blindadas"
          value={stats.blindadas.length}
          delta="Família C1"
          type="success"
        />
        <KPICard
          label="Medianas"
          value={stats.medianas.length}
          delta="50-99% mínimo"
          type="warning"
        />
        <KPICard
          label="Desenquadradas"
          value={stats.desenquadradas.length}
          delta="< 50% mínimo"
          type="alert"
        />
      </div>

      {/* Gráficos linha 1: Evolução + Donut Status */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3">
          <ChartCard
            title="Evolução do Capital Integralizado"
            subtitle="Capital acumulado ao longo do tempo · Meta 2026"
            height={320}
          >
            {stats.historicoChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.historicoChart}>
                  <defs>
                    <linearGradient id="capColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), 'Capital']}
                  />
                  <ReferenceLine
                    y={stats.meta2026}
                    stroke={COLORS.alert}
                    strokeDasharray="5 5"
                    label={{
                      value: 'Meta 2026',
                      fill: COLORS.alert,
                      fontSize: 11,
                      position: 'top',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="capital"
                    stroke={COLORS.secondary}
                    fill="url(#capColor)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Histórico vazio na aba <code>historico_capital</code>
              </div>
            )}
          </ChartCard>
        </div>

        <div className="lg:col-span-2">
          <ChartCard
            title="Status de Conformidade"
            subtitle="Distribuição por categoria"
            height={320}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {statusData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Gráficos linha 2: Por Família */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Empresas por Família"
          subtitle="Quantidade de cooperados em cada categoria"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={familiaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="familia" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="empresas" fill={COLORS.primary} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Saldo Devedor por Família"
          subtitle="Em R$"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={familiaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="familia" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `R$${(v / 1_000_000).toFixed(1)}M`}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), 'Saldo']}
              />
              <Bar dataKey="saldo" fill={COLORS.tertiary} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
