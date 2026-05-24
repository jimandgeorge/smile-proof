import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const jar = await cookies();
  jar.delete('admin_session');
  return NextResponse.redirect(new URL('/admin/login', request.url));
}
