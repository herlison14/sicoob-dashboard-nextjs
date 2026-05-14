'use client';

import { useState } from 'react';
import type { DashboardMeta } from '../context/DataContext';

export default function DiagnosticBanner({ meta }: { meta?: DashboardMeta }) {
  const [open, setOpen] = useState(false);

  if (!meta || !meta.principalSheet) return null;

  const detected = meta.columnMap || {};
  const mapped = Object.entries(detected);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden mb-6 text-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-100 transition text-left"
      >
        <div className="flex items-center gap-2 text-blue-900">
          <span>📋</span>
          <strong>Aba detectada:</strong>
          <code className="bg-white px-2 py-0.5 rounded text-xs">
            {meta.principalSheet}
          </code>
          <span className="text-blue-700">
            · {meta.cooperados || 0} registros
            {mapped.length > 0 && ` · ${mapped.length} colunas mapeadas`}
          </span>
        </div>
        <span className="text-blue-700 text-xs">
          {open ? '▲ Ocultar' : '▼ Detalhes'}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-blue-200 bg-white space-y-3">
          {/* Mapeamento de colunas */}
          {mapped.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Colunas mapeadas
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
                {mapped.map(([real, canonical]) => (
                  <div
                    key={real}
                    className="flex items-center gap-2 text-xs bg-gray-50 px-2 py-1 rounded"
                  >
                    <span className="text-gray-700 truncate">{real}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-mono text-emerald-700 truncate">
                      {canonical}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de abas */}
          {meta.allSheets && meta.allSheets.length > 1 && (
            <div>
              <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Todas as abas do arquivo
              </div>
              <div className="space-y-1">
                {meta.allSheets.map((s) => (
                  <div
                    key={s.name}
                    className={`flex items-center justify-between text-xs px-2 py-1 rounded ${
                      s.name === meta.principalSheet
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="truncate flex-1">
                      {s.name === meta.principalSheet && '✓ '}
                      {s.name}
                    </span>
                    <span className="text-gray-500 ml-2 shrink-0">
                      {s.rows} linhas
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
            Campos derivados automaticamente quando ausentes: Status, Família,
            Tendência, Necessidade de Capital
          </div>
        </div>
      )}
    </div>
  );
}
