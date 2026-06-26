import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register'];

const ROLE_ROUTES: Record<string, string[]> = {
  '/sales': ['admin', 'sales'],
  '/sanction': ['admin', 'sanction'],
  '/disbursement': ['admin', 'disbursement'],
  '/collection': ['admin', 'collection'],
  '/personal-details': ['borrower'],
  '/upload-salary-slip': ['borrower'],
  '/loan-apply': ['borrower'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('lms_token')?.value;

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // No token → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/sales',
    '/sanction',
    '/disbursement',
    '/collection',
    '/personal-details',
    '/upload-salary-slip',
    '/loan-apply',
    '/login',
    '/register',
  ],
};