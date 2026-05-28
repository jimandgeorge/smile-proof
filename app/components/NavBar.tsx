'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function NavBar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/onboarding') ||
    pathname.includes('/dashboard') ||
    pathname.includes('/upgrade')
  ) return null;

  const linkStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(237,238,245,0.6)',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: 6,
    transition: 'color 0.15s',
  };

  return (
    <>
      <header
        className="sticky top-0 z-30"
        style={{
          background: 'rgba(7,7,14,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          height: 60,
        }}
      >
        <div className="w-full px-5 h-full flex items-center justify-between" style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <BrandLogo />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/pricing"
              style={linkStyle}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(237,238,245,0.9)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(237,238,245,0.6)')}
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              style={linkStyle}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(237,238,245,0.9)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(237,238,245,0.6)')}
            >
              Contact
            </Link>

            {/* Separator */}
            <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.12)', margin: '0 8px' }} />

            <Link
              href="/auth/login"
              style={linkStyle}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(237,238,245,0.9)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(237,238,245,0.6)')}
            >
              Log in
            </Link>
            <Link
              href="/contact"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                fontWeight: 500,
                color: '#edeef5',
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.22)',
                background: 'rgba(255,255,255,0.04)',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }}
            >
              Book a Demo
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg"
            style={{ color: 'rgba(237,238,245,0.6)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: '#0b0b14',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          position: 'fixed', top: 60, left: 0, right: 0, zIndex: 50,
          padding: '12px 16px 16px',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {[
            { href: '/pricing', label: 'Pricing' },
            { href: '/contact', label: 'Contact' },
            { href: '/auth/login', label: 'Log in' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 400, color: 'rgba(237,238,245,0.65)', textDecoration: 'none', padding: '11px 12px', borderRadius: 8 }}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '8px 0' }} />
          <Link
            href="/contact"
            style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: '#edeef5', textDecoration: 'none', padding: '11px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 4 }}
            onClick={() => setMenuOpen(false)}
          >
            Book a Demo
          </Link>
        </div>
      )}
    </>
  );
}
