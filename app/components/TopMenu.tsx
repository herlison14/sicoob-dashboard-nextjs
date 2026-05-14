'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { icon: '📊', label: 'Dashboard', href: '/dashboard' },
  { icon: '🛡️', label: 'Enquadrados', href: '/enquadrados' },
  { icon: '🔴', label: 'Desenquadrados', href: '/desenquadrados' },
  { icon: '🎯', label: 'Concentração', href: '/concentracao' },
  { icon: '📈', label: 'Análise de Risco', href: '/analise-risco' },
  { icon: '📑', label: 'Exportar', href: '/exportar' },
];

export default function TopMenu() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-[#003641] via-[#00524F] to-[#003641] rounded-xl shadow-lg p-3 mb-6 flex gap-2 overflow-x-auto">
      {menuItems.map((item) => {
        const isActive = pathname === item.href ||
                        (item.href === '/dashboard' && pathname === '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap font-medium text-sm
              transition-all duration-150 cursor-pointer
              ${isActive
                ? 'bg-[#7DB61C] text-white shadow-md'
                : 'bg-white/10 text-white/85 border border-white/20 hover:bg-white/15'
              }
            `}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
