import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { hashAdminPassword } from '@/lib/adminHash';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin auth guard
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && pathname !== '/admin/logout') {
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
  }

  // Supabase session refresh
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
