import Link from 'next/link';

export default function ReviewNudge() {
  return (
    <div className="py-6">
      <div className="mx-auto flex items-center px-5" style={{ maxWidth: 1200, gap: 16 }}>
        <div className="flex-1" style={{ height: 1, background: 'var(--cream-dark)' }} />

        <Link
          href="/search"
          className="shrink-0 transition-colors hover:border-[var(--forest)]"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: 'var(--ink-soft)',
            textDecoration: 'none',
            border: '1px solid var(--cream-dark)',
            borderRadius: 999,
            padding: '7px 18px',
            background: 'white',
            whiteSpace: 'nowrap',
          }}
        >
          Visited a dentist recently?{' '}
          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Write a review →</span>
        </Link>

        <div className="flex-1" style={{ height: 1, background: 'var(--cream-dark)' }} />
      </div>
    </div>
  );
}
