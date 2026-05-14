import { auth } from '@/auth';
import { NextResponse, type NextRequest } from 'next/server';

export default auth((req: NextRequest) => {
  const { pathname } = req.nextUrl;
  const publicRoutes = ['/login'];

  // Se for rota pública, deixa passar
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Caso contrário, auth() cuida de redirecionar para login se não autenticado
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
