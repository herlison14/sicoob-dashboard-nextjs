import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const user = {
          email: 'admin@sicoob.com.br',
          password: 'sicoob123',
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
});

export { handler as GET, handler as POST };
