import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      authorize(credentials) {
        // ⚠️ Demo: hardcoded user. Em produção, validar contra banco de dados
        const user = {
          email: 'admin@sicoob.com.br',
          password: 'sicoob123', // ⚠️ NÃO colocar senhas em texto plano em produção!
          name: 'Admin Sicoob',
        };

        if (
          credentials?.email === user.email &&
          credentials?.password === user.password
        ) {
          return {
            id: '1',
            email: user.email,
            name: user.name,
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;

      // Rotas públicas (sem autenticação)
      const publicRoutes = ['/login'];
      if (publicRoutes.includes(pathname)) {
        return true;
      }

      // Rotas protegidas (requer autenticação)
      return !!auth;
    },
  },
});
