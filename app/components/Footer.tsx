'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrandLogo from './BrandLogo';

const LINKS = {
  product: [
    { label: 'Pricing',        href: '/pricing' },
    { label: 'Contact us',     href: '/contact' },
    { label: 'Sign up',        href: '/auth/signup' },
    { label: 'Log in',         href: '/auth/login' },
  ],
  legal: [
    { label: 'Privacy policy',   href: '/privacy' },
    { label: 'Terms of service', href: '/terms' },
  ],
};

function FooterCol({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(237,238,245,0.3)', marginBottom: 16 }}>
        {heading}
      </p>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, listStyle: 'none', margin: 0, padding: 0 }}>{children}</ul>
    </div>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  const external = href.startsWith('mailto:') || href.startsWith('http');
  return (
    <li>
      <Link
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(237,238,245,0.45)', textDecoration: 'none', transition: 'color 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(237,238,245,0.85)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(237,238,245,0.45)')}
      >
        {label}
      </Link>
    </li>
  );
}

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/auth/')) return null;

  return (
    <footer style={{ background: '#07070e', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="mx-auto px-5 py-12 grid grid-cols-2 md:grid-cols-5 gap-8" style={{ maxWidth: 1200 }}>

        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="inline-block mb-3" style={{ textDecoration: 'none' }}>
            <BrandLogo size="footer" />
          </Link>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(237,238,245,0.35)', lineHeight: 1.65, maxWidth: 200 }}>
            AI-powered intelligence for UK dental practices.
          </p>
        </div>

        <FooterCol heading="Product">
          {LINKS.product.map(l => <FooterLink key={l.label} {...l} />)}
        </FooterCol>

        <FooterCol heading="Legal">
          {LINKS.legal.map(l => <FooterLink key={l.label} {...l} />)}
        </FooterCol>
      </div>

      <div className="mx-auto px-5 py-5 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ maxWidth: 1200, borderColor: 'rgba(255,255,255,0.06)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(237,238,245,0.25)' }}>
          © {new Date().getFullYear()} SmileProof. All rights reserved.
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(237,238,245,0.25)' }}>
          Built for UK dental practices
        </p>
      </div>
    </footer>
  );
}
