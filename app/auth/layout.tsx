export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        .auth-left-panel { display: flex; }
        @media (max-width: 640px) { .auth-left-panel { display: none; } }
      `}</style>
      {children}
    </>
  );
}
