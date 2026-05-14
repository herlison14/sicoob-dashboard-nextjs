import Link from 'next/link';

export default function EmptyState() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
      <div className="text-5xl mb-4">📁</div>
      <h2 className="text-xl font-bold text-[#003641] mb-2">
        Nenhum dado carregado
      </h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Para visualizar essa página, primeiro carregue o arquivo Excel
        <code className="mx-1 bg-gray-100 px-2 py-0.5 rounded text-sm">
          dados_integralizacao.xlsx
        </code>
        na página Dashboard.
      </p>
      <Link
        href="/dashboard"
        className="inline-block bg-[#7DB61C] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#6a9a1a] transition shadow-md"
      >
        📊 Ir para Dashboard
      </Link>
    </div>
  );
}
