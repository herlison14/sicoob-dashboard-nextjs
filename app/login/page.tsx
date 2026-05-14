'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@sicoob.com.br');
  const [password, setPassword] = useState('sicoob123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou senha inválidos');
      } else if (result?.ok) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#003641] to-[#00524F] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🏦</div>
            <h1 className="text-2xl font-bold text-[#003641] mb-2">
              Sicoob Dashboard
            </h1>
            <p className="text-gray-600 text-sm">
              Integralização de Capital
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7DB61C] focus:border-transparent outline-none disabled:bg-gray-100"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7DB61C] focus:border-transparent outline-none disabled:bg-gray-100"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#003641] to-[#00524F] text-white font-semibold py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Entrando...' : '🔓 Entrar'}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center mb-2">
              <strong>Demo:</strong> Use as credenciais abaixo
            </p>
            <div className="bg-blue-50 p-3 rounded-lg text-xs space-y-1">
              <p>
                <strong>Email:</strong> admin@sicoob.com.br
              </p>
              <p>
                <strong>Senha:</strong> sicoob123
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-white text-sm mt-6 opacity-75">
          Dashboard seguro · Sicoob Cecremef
        </p>
      </div>
    </div>
  );
}
