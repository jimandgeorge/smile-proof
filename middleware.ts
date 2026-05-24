import { NextRequest, NextResponse } from 'next/server';
import { hashAdminPassword } from '@/lib/adminHash';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login' || pathname === '/admin/logout') {
    return NextResponse.next();
  }

  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  const cookie = request.cookies.get('admin_session')?.value;
  const expected = await hashAdminPassword(password);

  if (!cookie || cookie !== expected) {
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
