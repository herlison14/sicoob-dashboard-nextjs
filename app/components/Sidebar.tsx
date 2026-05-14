'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useData } from '../context/DataContext';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/enquadrados', label: 'Enquadrados', icon: '🛡️' },
  { href: '/desenquadrados', label: 'Desenquadrados', icon: '🔴' },
  { href: '/concentracao', label: 'Concentração', icon: '🎯' },
  { href: '/analise-risco', label: 'Análise de Risco', icon: '📈' },
  { href: '/exportar', label: 'Exportar', icon: '📑' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data, clearData } = useData();

  const handleLogout = () => {
    clearData();
    signOut({ redirect: true, callbackUrl: '/login' });
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-[#003641] via-[#00524F] to-[#003641] min-h-screen text-white p-5 shadow-2xl flex flex-col sticky top-0">
      {/* Logo */}
      <div className="mb-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-1">
          <div className="text-3xl">🏦</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Sicoob</h1>
            <p className="text-[10px] uppercase tracking-wider text-white/60">Cecremef</p>
          </div>
        </div>
        <p className="text-xs text-white/70 mt-2">Integralização de Capital</p>
      </div>

      {/* Nav */}
      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                isActive
                  ? 'bg-[#7DB61C] text-white font-semibold shadow-lg shadow-[#7DB61C]/30'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Data status */}
      <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
        <div className="text-xs">
          <div className="text-white/60 uppercase tracking-wider mb-1">Dados</div>
          {data ? (
            <div className="text-[#7DB61C] font-semibold">
              ✓ {data.coop?.length || 0} cooperados
            </div>
          ) : (
            <div className="text-white/50">Nenhum arquivo</div>
          )}
        </div>

        {session?.user && (
          <div className="text-xs">
            <div className="text-white/60 uppercase tracking-wider mb-1">Usuário</div>
            <div className="text-white/90 truncate">{session.user.email}</div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg text-white text-sm font-medium transition-all"
        >
          🚪 Sair
        </button>
      </div>
    </aside>
  );
}
