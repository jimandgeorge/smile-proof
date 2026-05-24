'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { hashAdminPassword } from '@/lib/adminHash';

export async function loginAdmin(
  password: string,
  next: string,
): Promise<{ error: string }> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || password !== adminPassword) {
    return { error: 'Invalid password.' };
  }

  const token = await hashAdminPassword(adminPassword);
  const jar = await cookies();
  jar.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/admin',
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(next || '/admin/queue');
}
