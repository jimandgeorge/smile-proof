'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname.includes('/dashboard') || pathname.startsWith('/admin')) return null;
  return <Footer />;
}
