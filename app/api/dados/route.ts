import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Normaliza valores que vêm do ExcelJS:
 *  - { result, formula } → result
 *  - { richText: [...] } → texto concatenado
 *  - Date → ISO string
 *  - números, strings, booleanos → mantém
 */
function normalizeValue(value: unknown): unknown {
  if (value === null || value === undefined) return null;

  if (typeof value === 'object') {
    // Fórmulas
    if ('result' in (value as Record<string, unknown>)) {
      return normalizeValue((value as { result: unknown }).result);
    }
    // RichText
    if ('richText' in (value as Record<string, unknown>)) {
      const rt = (value as { richText: Array<{ text: string }> }).richText;
      return rt.map((r) => r.text).join('');
    }
    // Data
    if (value instanceof Date) {
      return value.toISOString();
    }
    // Hyperlink
    if ('text' in (value as Record<string, unknown>)) {
      return (value as { text: string }).text;
    }
    // Errors
    if ('error' in (value as Record<string, unknown>)) {
      return null;
    }
  }

  return value;
}

function normalizeHeader(value: unknown): string {
  const normalized = normalizeValue(value);
  if (normalized === null || normalized === undefined) return '';
  return String(normalized).trim();
}

function parseSheet(worksheet: ExcelJS.Worksheet): Record<string, unknown>[] {
  const headers: string[] = [];
  const headerRow = worksheet.getRow(1);

  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber] = normalizeHeader(cell.value);
  });

  const rows: Record<string, unknown>[] = [];
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;

    const obj: Record<string, unknown> = {};
    let hasData = false;

    headers.forEach((header, colNumber) => {
      if (!header) return;
      const value = normalizeValue(row.getCell(colNumber).value);
      if (value !== null && value !== '') hasData = true;
      obj[header] = value;
    });

    if (hasData) rows.push(obj);
  });

  return rows;
}

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
        { error: 'Formato inválido. Use arquivos .xlsx' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    // Procurar abas (case-insensitive)
    const findSheet = (name: string) =>
      workbook.worksheets.find(
        (ws) => ws.name.toLowerCase().trim() === name.toLowerCase().trim()
      );

    const cooperadosSheet = findSheet('cooperados');
    const historicoSheet = findSheet('historico_capital');
    const parametrosSheet = findSheet('parametros');

    if (!cooperadosSheet) {
      return NextResponse.json(
        {
          error: `Aba 'cooperados' não encontrada. Abas disponíveis: ${workbook.worksheets
            .map((ws) => ws.name)
            .join(', ')}`,
        },
        { status: 400 }
      );
    }

    const coop = parseSheet(cooperadosSheet);
    const hist = historicoSheet ? parseSheet(historicoSheet) : [];

    // Parâmetros: chave/valor (col1/col2)
    const params: Record<string, unknown> = {};
    if (parametrosSheet) {
      parametrosSheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) return;
        const key = normalizeHeader(row.getCell(1).value);
        const val = normalizeValue(row.getCell(2).value);
        if (key) params[key] = val;
      });
    }

    return NextResponse.json({
      coop,
      hist,
      params,
      meta: {
        cooperados: coop.length,
        historico: hist.length,
        parametros: Object.keys(params).length,
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
