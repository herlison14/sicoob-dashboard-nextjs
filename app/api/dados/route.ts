import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo fornecido' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    // Extrair abas
    const cooperadosSheet = workbook.getWorksheet('cooperados');
    const historicoSheet = workbook.getWorksheet('historico_capital');
    const parametrosSheet = workbook.getWorksheet('parametros');

    if (!cooperadosSheet || !historicoSheet || !parametrosSheet) {
      return NextResponse.json(
        { error: 'Arquivo Excel inválido. Certifique-se de ter as abas: cooperados, historico_capital, parametros' },
        { status: 400 }
      );
    }

    // Parse cooperados
    const coopData: any[] = [];
    cooperadosSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const obj: any = {};
      cooperadosSheet.getRow(1).eachCell((cell, colNumber) => {
        const header = cell.value as string;
        const value = row.getCell(colNumber).value;
        obj[header] = value;
      });
      coopData.push(obj);
    });

    // Parse histórico
    const histData: any[] = [];
    historicoSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const obj: any = {};
      historicoSheet.getRow(1).eachCell((cell, colNumber) => {
        const header = cell.value as string;
        const value = row.getCell(colNumber).value;
        obj[header] = value;
      });
      histData.push(obj);
    });

    // Parse parâmetros
    const paramsObj: Record<string, any> = {};
    parametrosSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const param = row.getCell(1).value;
      const valor = row.getCell(2).value;
      if (param && valor !== null && valor !== undefined) {
        paramsObj[param as string] = valor;
      }
    });

    return NextResponse.json({
      coop: coopData,
      hist: histData,
      params: paramsObj,
    });
  } catch (error) {
    console.error('Erro ao processar Excel:', error);
    return NextResponse.json(
      { error: 'Erro ao processar arquivo Excel' },
      { status: 500 }
    );
  }
}
