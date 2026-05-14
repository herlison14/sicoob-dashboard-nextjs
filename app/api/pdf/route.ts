import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

export async function POST(request: NextRequest) {
  try {
    const { coop, params } = await request.json();

    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
    });

    // Buffers
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Título
    doc.fontSize(20).font('Helvetica-Bold').text('Integralização de Capital', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('PA OCB/SESCOOP - Maiores Devedores', { align: 'center' });
    doc.moveDown();

    // KPIs
    const saldoTotal = coop.reduce((sum: number, c: any) => sum + (c['Saldo_Devedor'] || 0), 0);
    const capitalTotal = coop.reduce((sum: number, c: any) => sum + (c['Capital_Integralizado'] || 0), 0);
    const meta = params['Meta_Anual_2026'] || 750000;

    doc.fontSize(12).font('Helvetica-Bold').text('Principais KPIs:');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Saldo Devedor Total: R$ ${(saldoTotal / 1_000_000).toFixed(2)}M`);
    doc.text(`Capital Integralizado: R$ ${(capitalTotal / 1_000).toFixed(1)}K`);
    doc.text(`Atingimento Meta 2026: ${((capitalTotal / meta) * 100).toFixed(1)}%`);
    doc.text(`Cooperados Analisados: ${coop.length}`);

    doc.moveDown();
    doc.fontSize(9).text(
      'Relatório gerado automaticamente via dashboard Sicoob.',
      { align: 'center', color: '#666' }
    );

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(
          new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'attachment; filename="sicoob-relatorio.pdf"',
            },
          })
        );
      });
    });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return NextResponse.json({ error: 'Erro ao gerar PDF' }, { status: 500 });
  }
}
