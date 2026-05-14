import { auth } from '@/auth';

export default auth((req) => {
  // O middleware retorna automaticamente se o usuário está autenticado
  // Se não estiver, redireciona para /login
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
