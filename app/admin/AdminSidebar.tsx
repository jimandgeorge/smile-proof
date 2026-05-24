'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardList,
  Building2,
  Users,
  CreditCard,
  Flag,
  BarChart3,
  Star,
  ArrowRightLeft,
  LogOut,
  Shield,
} from 'lucide-react';

const navItems = [
  { href: '/admin/queue',         icon: ClipboardList,  label: 'Moderation' },
  { href: '/admin/practices',     icon: Building2,      label: 'Practices' },
  { href: '/admin/users',         icon: Users,          label: 'Users' },
  { href: '/admin/subscriptions', icon: CreditCard,     label: 'Subscriptions' },
  { href: '/admin/reports',       icon: Flag,           label: 'Reports' },
  { href: '/admin/analytics',     icon: BarChart3,      label: 'Analytics' },
  { href: '/admin/featured',      icon: Star,           label: 'Featured' },
  { href: '/admin/leads',         icon: ArrowRightLeft, label: 'Lead routing' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 220,
      flexShrink: 0,
      background: '#1a3327',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'sticky',
      top: 0,
      alignSelf: 'flex-start',
    }}>
      {/* Brand */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <Shield size={16} strokeWidth={2} style={{ color: 'rgba(255,255,255,0.6)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
            SmileProof
          </span>
        </div>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-body)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 0' }}>
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 20px',
                textDecoration: 'none',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                fontFamily: 'var(--font-body)',
                borderLeft: `2px solid ${isActive ? 'rgba(255,255,255,0.5)' : 'transparent'}`,
              }}
            >
              <Icon size={15} strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '8px 0 12px' }}>
        <a
          href="/admin/logout"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 20px',
            textDecoration: 'none',
            color: 'rgba(255,255,255,0.35)',
            fontSize: 13,
            fontFamily: 'var(--font-body)',
          }}
        >
          <LogOut size={15} strokeWidth={1.75} />
          Log out
        </a>
      </div>
    </aside>
  );
}
