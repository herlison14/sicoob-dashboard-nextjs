import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────
// Helpers de normalização
// ─────────────────────────────────────────────
function normalizeValue(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') {
    if ('result' in (value as Record<string, unknown>)) {
      return normalizeValue((value as { result: unknown }).result);
    }
    if ('richText' in (value as Record<string, unknown>)) {
      const rt = (value as { richText: Array<{ text: string }> }).richText;
      return rt.map((r) => r.text).join('');
    }
    if (value instanceof Date) return value.toISOString();
    if ('text' in (value as Record<string, unknown>)) {
      return (value as { text: string }).text;
    }
    if ('error' in (value as Record<string, unknown>)) return null;
  }
  return value;
}

function normalizeHeader(value: unknown): string {
  const v = normalizeValue(value);
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

/**
 * Slug-key: remove acentos, espaços, caracteres especiais.
 * "Razão Social" → "razaosocial"; "Saldo Devedor (R$)" → "saldodevedor"
 */
function slugKey(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return isFinite(value) ? value : 0;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'string') {
    // Remove "R$", espaços, pontos de milhar; troca vírgula decimal por ponto
    const cleaned = value
      .replace(/R\$\s*/gi, '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
      .replace(/[^\d.-]/g, '');
    const n = parseFloat(cleaned);
    return isFinite(n) ? n : 0;
  }
  return 0;
}

function toStr(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

// ─────────────────────────────────────────────
// Aliases — mapeia headers reais para o schema interno
// ─────────────────────────────────────────────
const COLUMN_ALIASES: Record<string, string[]> = {
  Empresa: [
    'empresa', 'razaosocial', 'razao', 'nome', 'cooperado', 'cliente',
    'pj', 'pessoajuridica', 'nomeempresa', 'nomefantasia', 'denominacao',
  ],
  CNPJ: [
    'cnpj', 'documento', 'doc', 'cnpjcpf', 'cpfcnpj', 'identificacao',
  ],
  Familia: [
    'familia', 'categoria', 'classe', 'grupo', 'segmento', 'tipo',
    'classificacao', 'familiacliente',
  ],
  Saldo_Devedor: [
    'saldodevedor', 'saldo', 'valordevedor', 'divida', 'exposicao',
    'saldototal', 'saldoatual', 'saldorestante', 'valor', 'valortotal',
    'principal', 'saldoabsoluto',
  ],
  Capital_Integralizado: [
    'capitalintegralizado', 'capital', 'integralizacao', 'integralizado',
    'capitaltotal', 'capitalcoop', 'capitalsocial', 'capitalsocio',
  ],
  Pct_Capital: [
    'pctcapital', 'percentualcapital', 'pctcap', 'capitalpct',
    'pctintegralizacao', 'razaocapital',
  ],
  Status: [
    'status', 'situacao', 'enquadramento', 'classificacaorisco',
  ],
  CRL_Anterior: [
    'crlanterior', 'crlant', 'crlpassado', 'classificacaoanterior',
    'ratingganterior', 'crl1', 'classanterior',
  ],
  CRL_Atual: [
    'crlatual', 'crl', 'classificacaoatual', 'rating', 'ratingatual',
    'classatual', 'crlhoje',
  ],
  Tendencia: [
    'tendencia', 'evolucao', 'movimento', 'tendenciacrl', 'comportamento',
  ],
  Gap_Pct: [
    'gappct', 'gap', 'percentualgap', 'gappercentual',
  ],
  Necessidade_Capital: [
    'necessidadecapital', 'necessidade', 'aporte', 'aportenecessario',
    'gapcapital', 'capitalnecessario', 'capitalpendente', 'integralizar',
  ],
  PA: [
    'pa', 'postoatendimento', 'agencia', 'unidade', 'filial',
  ],
  Setor: ['setor', 'atividade', 'ramo'],
  Mes_Ano: ['mesano', 'mes', 'periodo', 'data', 'competencia', 'referencia'],
};

/**
 * Para uma lista de headers reais, retorna um dicionário
 * { headerReal → campoCanonico } seguindo os aliases.
 */
function buildColumnMap(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const real of headers) {
    if (!real) continue;
    const slug = slugKey(real);
    for (const [canonical, aliases] of Object.entries(COLUMN_ALIASES)) {
      if (aliases.includes(slug) || aliases.some((a) => slug.includes(a))) {
        // Primeiro match ganha; mas mantém prioridade para match exato
        if (!Object.values(map).includes(canonical)) {
          map[real] = canonical;
          break;
        }
      }
    }
  }
  return map;
}

// ─────────────────────────────────────────────
// Parse de aba: detecta header e mapeia campos
// ─────────────────────────────────────────────
function parseSheet(ws: ExcelJS.Worksheet): {
  headers: string[];
  rows: Record<string, unknown>[];
  columnMap: Record<string, string>;
} {
  // 1. Detectar linha de header (procura nas primeiras 10 linhas a que tem mais textos)
  let headerRowIdx = 1;
  let maxNonEmpty = 0;
  for (let i = 1; i <= Math.min(10, ws.rowCount); i++) {
    const row = ws.getRow(i);
    let count = 0;
    row.eachCell({ includeEmpty: false }, (cell) => {
      const v = normalizeHeader(cell.value);
      if (v && isNaN(Number(v))) count++;
    });
    if (count > maxNonEmpty) {
      maxNonEmpty = count;
      headerRowIdx = i;
    }
  }

  // 2. Coletar headers
  const headers: string[] = [];
  const headerRow = ws.getRow(headerRowIdx);
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber] = normalizeHeader(cell.value);
  });

  // 3. Construir column map
  const validHeaders = headers.filter(Boolean);
  const columnMap = buildColumnMap(validHeaders);

  // 4. Parsear linhas
  const rows: Record<string, unknown>[] = [];
  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber <= headerRowIdx) return;
    const obj: Record<string, unknown> = {};
    let hasData = false;
    headers.forEach((header, colNumber) => {
      if (!header) return;
      const value = normalizeValue(row.getCell(colNumber).value);
      if (value !== null && value !== '') hasData = true;

      // Salvar tanto pelo header real quanto pelo canônico (se mapeado)
      obj[header] = value;
      const canonical = columnMap[header];
      if (canonical) obj[canonical] = value;
    });
    if (hasData) rows.push(obj);
  });

  return { headers: validHeaders, rows, columnMap };
}

// ─────────────────────────────────────────────
// Derivações inteligentes (preencher campos ausentes)
// ─────────────────────────────────────────────
function enrichCooperado(c: Record<string, unknown>): Record<string, unknown> {
  const saldo = toNumber(c.Saldo_Devedor);
  const capital = toNumber(c.Capital_Integralizado);

  // Pct_Capital: se não vier, calcular
  if (c.Pct_Capital === undefined || c.Pct_Capital === null) {
    c.Pct_Capital = saldo > 0 ? capital / saldo : 0;
  }
  const pct = toNumber(c.Pct_Capital);

  // Status: derivar do Pct_Capital se não vier
  // Heurística: >= 3% → Blindada, 1.5-3% → Mediana, < 1.5% → Desenquadrada
  if (!c.Status) {
    if (pct >= 0.03) c.Status = 'Blindada';
    else if (pct >= 0.015) c.Status = 'Mediana';
    else c.Status = 'Desenquadrada';
  }

  // Familia: derivar do Saldo_Devedor se não vier
  // C1: >= 1M, C2: 100K-1M, C3: < 100K
  if (!c.Familia) {
    if (saldo >= 1_000_000) c.Familia = 'C1';
    else if (saldo >= 100_000) c.Familia = 'C2';
    else c.Familia = 'C3';
  }

  // Necessidade_Capital: se não vier, calcular para fechar 3% do saldo
  if (c.Necessidade_Capital === undefined || c.Necessidade_Capital === null) {
    const minCapital = saldo * 0.03;
    c.Necessidade_Capital = Math.max(0, minCapital - capital);
  }

  // Tendencia: se não vier, comparar CRL_Anterior x CRL_Atual
  if (!c.Tendencia) {
    const ant = toStr(c.CRL_Anterior);
    const atu = toStr(c.CRL_Atual);
    if (!ant || !atu) {
      c.Tendencia = 'Sem dado';
    } else {
      // CRL escala: R1 (melhor) → R10 (pior). Comparação alfanumérica
      const rankAnt = parseInt(ant.replace(/\D/g, '')) || 0;
      const rankAtu = parseInt(atu.replace(/\D/g, '')) || 0;
      if (rankAtu > rankAnt) c.Tendencia = 'Piora';
      else if (rankAtu < rankAnt) c.Tendencia = 'Melhora';
      else c.Tendencia = 'Estavel';
    }
  }

  // Gap_Pct
  if (c.Gap_Pct === undefined || c.Gap_Pct === null) {
    c.Gap_Pct = Math.max(0, 0.03 - pct);
  }

  return c;
}

// ─────────────────────────────────────────────
// Heurística para escolher a aba principal de cooperados
// ─────────────────────────────────────────────
function scoreSheet(sheetName: string, headers: string[], rowCount: number): number {
  let score = 0;
  const name = slugKey(sheetName);

  // Nome da aba sugere cooperados
  if (name.includes('cooperado')) score += 50;
  if (name.includes('ranking')) score += 30;
  if (name.includes('pessoajur') || name.includes('pj')) score += 25;
  if (name.includes('pa')) score += 15;
  if (name.includes('inadim') || name.includes('devedor')) score += 20;
  if (name.includes('cliente') || name.includes('socio')) score += 15;

  // Headers sugerem cooperados (CNPJ + valor numérico)
  const slugs = headers.map(slugKey);
  if (slugs.some((s) => s.includes('cnpj'))) score += 30;
  if (slugs.some((s) => s.includes('saldo') || s.includes('valor'))) score += 20;
  if (slugs.some((s) => s.includes('capital'))) score += 20;
  if (slugs.some((s) => s.includes('empresa') || s.includes('razao') || s.includes('nome'))) score += 15;

  // Mais linhas → maior chance
  score += Math.min(rowCount, 50) * 0.5;

  return score;
}

// ─────────────────────────────────────────────
// POST handler
// ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo fornecido' },
        { status: 400 }
      );
    }

    if (!file.name.match(/\.(xlsx|xlsm)$/i)) {
      return NextResponse.json(
        { error: 'Formato inválido. Use arquivos .xlsx ou .xlsm' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const allSheets = workbook.worksheets;
    if (allSheets.length === 0) {
      return NextResponse.json(
        { error: 'Arquivo Excel sem abas' },
        { status: 400 }
      );
    }

    // 1. Parsear TODAS as abas e pontuar
    const parsedSheets = allSheets.map((ws) => {
      const parsed = parseSheet(ws);
      const score = scoreSheet(ws.name, parsed.headers, parsed.rows.length);
      return {
        name: ws.name,
        ...parsed,
        score,
      };
    });

    // 2. Aba principal: maior score com pelo menos 3 linhas
    const principal = parsedSheets
      .filter((s) => s.rows.length >= 3)
      .sort((a, b) => b.score - a.score)[0];

    if (!principal) {
      return NextResponse.json(
        {
          error: 'Nenhuma aba com dados suficientes foi encontrada',
          sheets: parsedSheets.map((s) => ({
            name: s.name,
            rows: s.rows.length,
            headers: s.headers,
          })),
        },
        { status: 400 }
      );
    }

    // 3. Enriquecer cooperados com campos derivados
    const coop = principal.rows.map(enrichCooperado);

    // 4. Buscar aba de histórico (Mes_Ano + Capital)
    const histSheet = parsedSheets.find((s) => {
      const name = slugKey(s.name);
      if (name.includes('historico') || name.includes('historia') || name.includes('evolucao')) {
        return true;
      }
      return s.headers.some((h) => {
        const sl = slugKey(h);
        return sl.includes('mes') || sl.includes('competencia');
      });
    });
    const hist = histSheet
      ? histSheet.rows.map((r) => ({
          Mes_Ano: toStr(r.Mes_Ano || r[histSheet.headers[0]]),
          Capital_Integralizado: toNumber(
            r.Capital_Integralizado || r[histSheet.headers[1]]
          ),
        }))
      : [];

    // 5. Buscar aba de parâmetros
    const paramSheet = parsedSheets.find((s) => {
      const name = slugKey(s.name);
      return name.includes('parametro') || name.includes('config') || name.includes('meta');
    });
    const params: Record<string, unknown> = {};
    if (paramSheet) {
      paramSheet.rows.forEach((r) => {
        const keys = Object.keys(r).filter(
          (k) => !Object.values(COLUMN_ALIASES).flat().includes(slugKey(k))
        );
        const param = toStr(r[keys[0]] || r.Parametro);
        const valor = r[keys[1]] || r.Valor;
        if (param && valor !== undefined && valor !== null) {
          params[param] = valor;
        }
      });
    }

    // 6. Detectar mes_referencia do nome da aba (ex: "03.2026")
    const mesMatch = principal.name.match(/(\d{2})[\.\-/](\d{4})/);
    if (mesMatch && !params.Mes_Referencia) {
      params.Mes_Referencia = `${mesMatch[1]}/${mesMatch[2]}`;
    }

    // 7. Default Meta_Anual_2026
    if (!params.Meta_Anual_2026) params.Meta_Anual_2026 = 750000;

    return NextResponse.json({
      coop,
      hist,
      params,
      meta: {
        cooperados: coop.length,
        historico: hist.length,
        parametros: Object.keys(params).length,
        principalSheet: principal.name,
        columnMap: principal.columnMap,
        allSheets: parsedSheets.map((s) => ({
          name: s.name,
          rows: s.rows.length,
          headers: s.headers,
          score: s.score,
        })),
      },
    });
  } catch (error) {
    console.error('Erro ao processar Excel:', error);
    return NextResponse.json(
      {
        error: 'Erro ao processar arquivo Excel',
        details: error instanceof Error ? error.message : 'desconhecido',
      },
      { status: 500 }
    );
  }
}
