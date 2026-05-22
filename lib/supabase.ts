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
// Falls back to cookie-based auth if the token is missing or stale.
export async function getUserFromToken(accessToken: string) {
  if (accessToken?.trim()) {
    const admin = createAdminSupabase();
    const { data: { user } } = await admin.auth.getUser(accessToken);
    if (user) return user;
  }
  // Fallback: read session from cookies (works in server actions in Next.js 15+)
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    return user ?? null;
  } catch {
    return null;
  }
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
