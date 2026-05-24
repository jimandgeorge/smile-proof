import { cookies } from 'next/headers';
import AdminSidebar from './AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const hasSession = !!jar.get('admin_session')?.value;

  if (!hasSession) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <main style={{ flex: 1, background: '#f5f4f1', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
