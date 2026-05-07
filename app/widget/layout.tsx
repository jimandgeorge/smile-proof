export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ margin: 0, padding: 8, background: 'transparent' }}>
      {children}
    </div>
  );
}
