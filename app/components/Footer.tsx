'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrandLogo from './BrandLogo';

const LINKS = {
  dentists: [
    { label: 'Why SmileProof',      href: '/for-dentists' },
    { label: 'Claim your practice', href: '/for-dentists#claim' },
    { label: 'Intelligence dashboard', href: '/for-dentists' },
    { label: 'Contact us',          href: '/contact' },
  ],
  about: [
    { label: 'How it works',         href: '/how-it-works' },
    { label: 'Privacy policy',       href: '/privacy' },
    { label: 'Terms of service',     href: '/terms' },
  ],
};

function FooterCol({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="mb-4 font-semibold"
        style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink)', letterSpacing: '-0.01em' }}
      >
        {heading}
      </p>
      <ul className="flex flex-col gap-2.5">{children}</ul>
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
        style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none', transition: 'color 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--forest)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-soft)')}
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
    <footer className="border-t" style={{ background: 'var(--cream)', borderColor: 'var(--cream-dark)' }}>

      <div
        className="mx-auto px-5 py-12 grid grid-cols-2 md:grid-cols-5 gap-8"
        style={{ maxWidth: 1200 }}
      >
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link
            href="/"
            className="inline-block mb-3"
            style={{ textDecoration: 'none' }}
          >
            <BrandLogo size="footer" />
          </Link>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.65, maxWidth: 200 }}>
            AI-powered intelligence for UK dental practices.
          </p>
        </div>

        <FooterCol heading="For dentists">
          {LINKS.dentists.map(l => <FooterLink key={l.label} {...l} />)}
        </FooterCol>

        <FooterCol heading="About">
          {LINKS.about.map(l => <FooterLink key={l.label} {...l} />)}
        </FooterCol>
      </div>

      {/* Bottom bar */}
      <div
        className="mx-auto px-5 py-5 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
        style={{ maxWidth: 1200, borderColor: 'var(--cream-dark)' }}
      >
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-soft)' }}>
          © {new Date().getFullYear()} SmileProof. All rights reserved.
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-soft)' }}>
          Built for UK dental practices
        </p>
      </div>

    </footer>
  );
}
