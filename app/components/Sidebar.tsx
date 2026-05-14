'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const menuItems = [
  { href: '/dashboard', label: '📊 Dashboard', icon: '📊' },
  { href: '/enquadrados', label: '🛡️ Enquadrados', icon: '🛡️' },
  { href: '/desenquadrados', label: '⚠️ Desenquadrados', icon: '⚠️' },
  { href: '/concentracao', label: '📈 Concentração', icon: '📈' },
  { href: '/analise-risco', label: '🔍 Análise de Risco', icon: '🔍' },
  { href: '/exportar', label: '📥 Exportar', icon: '📥' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    signOut({ redirect: true, callbackUrl: '/login' });
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-[#003641] to-[#00524F] min-h-screen text-white p-6 shadow-lg">
      <div className="mb-12">
        <div className="text-4xl mb-2">🏦</div>
        <h1 className="text-xl font-bold">Sicoob</h1>
        <p className="text-xs text-gray-300">Integralização de Capital</p>
      </div>

      <nav className="space-y-2 mb-8">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-[#7DB61C] text-white font-semibold shadow-md'
                  : 'text-gray-200 hover:bg-[#004d54] hover:text-white'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-400 pt-6">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-all"
        >
          🚪 Sair
        </button>
      </div>
    </aside>
  );
}
