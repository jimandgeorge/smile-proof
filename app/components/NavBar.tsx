'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname.startsWith('/widget') || pathname.startsWith('/auth/')) return null;

  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{ background: 'var(--cream)', borderColor: 'var(--cream-dark)', height: 72 }}
    >
      <div
        className="mx-auto px-4 sm:px-6 h-full flex items-center justify-between"
        style={{ maxWidth: 1200 }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 select-none"
          style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--forest)', letterSpacing: '-0.02em', textDecoration: 'none' }}
        >
          Smile<em style={{ fontStyle: 'italic' }}>Proof</em>
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
            href="/search"
            className="px-5 py-2 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'var(--cream)', textDecoration: 'none' }}
          >
            Get matched
          </Link>

          <Link
            href="/auth/login"
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream-dark)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Sign in
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

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-4 py-4 flex flex-col gap-1"
          style={{ background: 'var(--cream)', borderColor: 'var(--cream-dark)' }}
        >
          {[
            { href: '/for-dentists', label: 'For dentists' },
            { href: '/search',       label: 'Write a review' },
            { href: '/auth/login',   label: 'Sign in' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-4 py-3 rounded-lg text-sm font-medium"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)', textDecoration: 'none' }}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/search"
            className="mt-1 px-4 py-3 rounded-xl text-sm font-semibold text-center transition-opacity hover:opacity-90"
            style={{ fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'var(--cream)', textDecoration: 'none' }}
            onClick={() => setMenuOpen(false)}
          >
            Get matched
          </Link>
        </div>
      )}
    </header>
  );
}
