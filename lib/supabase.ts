// lib/supabase.ts
// Helpers for using Supabase from server components, route handlers, and the browser.
// Install: npm i @supabase/supabase-js @supabase/ssr

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Browser client — for client components & form submissions from the client
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Admin client — bypasses RLS. Only use in trusted server-side admin code.
export function createAdminSupabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Validate a JWT access token from the browser and return the user.
// Use this in server actions — Next.js 16 server function requests don't
// forward browser cookies, so we pass the token explicitly from the client.
export async function getUserFromToken(accessToken: string) {
  if (!accessToken?.trim()) return null;
  const admin = createAdminSupabase();
  const { data: { user } } = await admin.auth.getUser(accessToken);
  return user ?? null;
}

// Server client — for server components and route handlers (NOT server actions).
// Reads/writes auth cookies so RLS policies see the right user.
export async function createServerSupabase() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — safe to ignore
            // if you have middleware refreshing the session.
          }
        },
      },
    }
  );
}
