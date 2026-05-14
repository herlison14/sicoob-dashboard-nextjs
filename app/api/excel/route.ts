import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function POST(request: NextRequest) {
  try {
    const { coop, hist, params } = await request.json();

    const workbook = new ExcelJS.Workbook();

    // Aba: Cooperados
    const coopSheet = workbook.addWorksheet('Cooperados');
    if (coop && coop.length > 0) {
      const headers = Object.keys(coop[0]);
      coopSheet.addRow(headers);
      coop.forEach((row: any) => {
        coopSheet.addRow(headers.map((h) => row[h]));
      });
    }

    // Aba: Histórico
    const histSheet = workbook.addWorksheet('Histórico');
    if (hist && hist.length > 0) {
      const headers = Object.keys(hist[0]);
      histSheet.addRow(headers);
      hist.forEach((row: any) => {
        histSheet.addRow(headers.map((h) => row[h]));
      });
    }

    // Aba: Parâmetros
    const paramsSheet = workbook.addWorksheet('Parâmetros');
    paramsSheet.addRow(['Parâmetro', 'Valor']);
    Object.entries(params).forEach(([key, value]) => {
      paramsSheet.addRow([key, value]);
    });

    // Aba: Resumo
    const summarySheet = workbook.addWorksheet('Resumo');
    const saldoTotal = coop.reduce((sum: number, c: any) => sum + (c['Saldo_Devedor'] || 0), 0);
    const capitalTotal = coop.reduce((sum: number, c: any) => sum + (c['Capital_Integralizado'] || 0), 0);

    summarySheet.addRow(['Métrica', 'Valor']);
    summarySheet.addRow(['Saldo Devedor Total', saldoTotal]);
    summarySheet.addRow(['Capital Integralizado', capitalTotal]);
    summarySheet.addRow(['Total de Cooperados', coop.length]);
    summarySheet.addRow(['Gerado em', new Date().toISOString()]);

    // Gerar buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="sicoob-consolidado.xlsx"',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar Excel:', error);
    return NextResponse.json({ error: 'Erro ao gerar Excel' }, { status: 500 });
  }
}
