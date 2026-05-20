'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrandLogo from './BrandLogo';
import { createClient } from '@/lib/supabase';

export default function NavBar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (pathname.startsWith('/widget') || pathname.startsWith('/auth/')) return null;

  return (
    <>
    <header
      className="sticky top-0 z-30 border-b"
      style={{ background: 'var(--cream)', borderColor: 'var(--cream-dark)', height: 72 }}
    >
      <div
        className="w-full px-4 sm:px-6 h-full flex items-center justify-between"
      >
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 select-none"
          style={{ textDecoration: 'none' }}
        >
          <BrandLogo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/for-dentists"
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream-dark)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            For dentists
          </Link>

          <Link
            href="/search"
            className="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--ink)', borderColor: 'var(--cream-dark)', textDecoration: 'none', background: 'white' }}
          >
            Write a review
          </Link>

          <Link
            href="/find"
            className="px-5 py-2 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'var(--cream)', textDecoration: 'none' }}
          >
            Get matched
          </Link>

          <Link
            href={loggedIn ? '/auth/logout' : '/auth/login'}
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream-dark)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {loggedIn ? 'Log out' : 'Sign in'}
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg transition-colors"
          style={{ color: 'var(--ink-soft)' }}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream-dark)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <line x1="3" y1="7" x2="21" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="3" y1="17" x2="21" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

    </header>

      {/* Mobile menu — sibling to header so no sticky/overflow issues */}
      {menuOpen && (
        <div
          style={{ background: 'var(--cream)', borderTop: '1px solid var(--cream-dark)', borderBottom: '1px solid var(--cream-dark)', position: 'fixed', top: 72, left: 0, right: 0, zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 4, padding: '16px' }}
        >
          {[
            { href: '/for-dentists', label: 'For dentists' },
            { href: '/search',       label: 'Write a review' },
            { href: loggedIn ? '/auth/logout' : '/auth/login', label: loggedIn ? 'Log out' : 'Sign in' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, color: 'var(--ink-soft)', textDecoration: 'none', padding: '12px 16px', borderRadius: 10 }}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/find"
            style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'var(--cream)', background: 'var(--forest)', textDecoration: 'none', padding: '12px 16px', borderRadius: 10, textAlign: 'center', marginTop: 4 }}
            onClick={() => setMenuOpen(false)}
          >
            Get matched
          </Link>
        </div>
      )}
    </>
  );
}
