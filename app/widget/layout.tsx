import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });

export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={inter.className} style={{ margin: 0, padding: 8, background: 'transparent' }}>
      {children}
    </div>
  );
}
