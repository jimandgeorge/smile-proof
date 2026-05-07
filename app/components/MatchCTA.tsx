import Link from 'next/link';

type Props = {
  href?: string;
};

export default function MatchCTA({ href = '/for-dentists' }: Props) {
  return (
    <section className="mx-auto px-5 py-6" style={{ maxWidth: 1200 }}>
      <div
        className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
        style={{
          background: 'var(--cream-dark)',
          borderRadius: 16,
          padding: '24px 32px',
        }}
      >
        {/* Decorative triangles */}
        <svg
          aria-hidden
          className="absolute right-32 top-0 h-full pointer-events-none select-none"
          viewBox="0 0 160 80"
          preserveAspectRatio="xMidYMid slice"
          style={{ opacity: 0.35 }}
        >
          <polygon points="40,80 90,10 140,80"  fill="var(--cream)" />
          <polygon points="80,80 120,30 160,80" fill="var(--cream)" />
          <polygon points="0,80 50,20 100,80"   fill="var(--cream)" />
        </svg>

        {/* Left */}
        <div className="relative" style={{ maxWidth: 480 }}>
          <h2
            className="font-bold mb-1"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(17px,2.5vw,22px)',
              color: 'var(--ink)',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
            }}
          >
            Run a dental practice?
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: 'var(--ink-soft)',
              lineHeight: 1.55,
            }}
          >
            Claim your profile, respond to reviews, and turn happy patients into bookings.
          </p>
        </div>

        {/* Button */}
        <Link
          href={href}
          className="relative shrink-0 inline-flex items-center font-semibold transition-opacity hover:opacity-80"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            background: 'var(--ink)',
            color: '#fff',
            textDecoration: 'none',
            padding: '12px 24px',
            borderRadius: 999,
            whiteSpace: 'nowrap',
          }}
        >
          Get started
        </Link>
      </div>
    </section>
  );
}
